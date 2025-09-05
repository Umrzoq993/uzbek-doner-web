import { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle, MapPin, RefreshCcw, RotateCcw } from "lucide-react";
import { FlialAPI } from "../lib/api";
import { useLocationStore } from "../store/location";
import { useT } from "../i18n/i18n";

export default function DeliveryGuard({ onForceGeo }) {
  const t = useT();
  const place = useLocationStore((s) => s.place);
  const availability = useLocationStore((s) => s.availability);
  const setAvailability = useLocationStore((s) => s.setAvailability);
  const [_, setChecking] = useState(false); // internal flag (not rendered)
  const runningRef = useRef(false);

  // Manual retry: reset availability to trigger effect
  const retryCheck = useCallback(() => {
    if (!place) return;
    setAvailability({
      checked: false,
      available: false,
      reason: null,
      flial: null,
    });
  }, [place, setAvailability]);

  useEffect(() => {
    let cancelled = false;
    const lat = place?.lat;
    const lon = place?.lon;
    (async () => {
      if (!place || availability.checked || runningRef.current) return;
      runningRef.current = true;

      const classify = (data) => {
        if (data?.status && data?.flial?.id) {
          return { available: true, reason: null, flial: data.flial };
        }
        // Aniq rad javobi: status === false va filial yo'q
        if (data && data.status === false && !data?.flial?.id) {
          return { available: false, reason: "unavailable", flial: null };
        }
        // Shakli tushunarsiz yoki status property yo'q -> error sifatida qaytamiz
        return { available: false, reason: "error", flial: null };
      };

      const runOnce = async () => {
        try {
          const data = await FlialAPI.checkPoint({
            latitude: lat,
            longitude: lon,
          });
          if (import.meta.env.DEV) {
            console.debug("[DeliveryGuard] checkPoint response", data);
          }
          return { ok: true, data };
        } catch (e) {
          if (import.meta.env.DEV) {
            console.debug("[DeliveryGuard] checkPoint error", e);
          }
          return { ok: false, error: e };
        }
      };

      setChecking(true);
      let attempt = 0;
      let finalResult = null;
      let consecutiveUnavailable = 0;
      while (attempt < 3 && !cancelled) {
        const res = await runOnce();
        if (cancelled) break;
        if (lat !== place.lat || lon !== place.lon) break; // stale

        if (!res.ok) {
          // Network/timeout: treat as error after second failure
          if (attempt === 0) {
            attempt++;
            continue;
          } else {
            finalResult = { available: false, reason: "error", flial: null };
            break;
          }
        } else {
          const cls = classify(res.data);
          if (cls.available) {
            finalResult = cls;
            break;
          }
          if (cls.reason === "unavailable") {
            consecutiveUnavailable++;
          } else {
            // error classification resets unavailable counter
            consecutiveUnavailable = 0;
          }
          // We require 2 consecutive 'unavailable' + a delayed confirm attempt (3rd) to accept
          if (consecutiveUnavailable >= 2) {
            if (attempt < 2) {
              // schedule a delay before the final confirming attempt
              await new Promise((r) => setTimeout(r, 550));
              attempt++;
              continue; // third (confirmation) attempt
            } else {
              finalResult = cls; // confirmed unavailable after delay
              break;
            }
          }
          // If this is first unavailable, just retry quickly
          attempt++;
          continue;
        }
      }

      if (!cancelled && finalResult) {
        setAvailability({
          checked: true,
          available: finalResult.available,
          flial: finalResult.flial,
          reason: finalResult.reason,
        });
      }
      if (!cancelled) {
        setChecking(false);
        runningRef.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [place, availability.checked, setAvailability]);

  if (!place) return null;
  if (!availability.checked || availability.available) return null;

  const isError = availability.reason === "error";
  const bodyText = isError
    ? t("checkout:delivery_error_body") ||
      "Server bilan aloqa vaqtida xatolik. Iltimos birozdan so'ng qayta urinib ko'ring."
    : t("checkout:delivery_unavailable_body");
  const titleText = isError
    ? t("checkout:delivery_error_title") || "Xatolik"
    : t("checkout:delivery_unavailable_title");

  return (
    <div
      className="modal-backdrop delivery-guard-backdrop"
      style={{ zIndex: 3000, placeItems: "center" }}
    >
      <div className="delivery-guard" role="alertdialog" aria-modal="true">
        <div className="delivery-guard__icon" aria-hidden>
          {isError ? <AlertTriangle size={42} /> : <MapPin size={42} />}
        </div>
        <h3 className="delivery-guard__title">{titleText}</h3>
        <p className="delivery-guard__body">{bodyText}</p>
        {place?.label && (
          <div className="delivery-guard__place" aria-label="Manzil">
            <MapPin size={16} />
            <span>{place.label}</span>
          </div>
        )}
        <div className="delivery-guard__actions">
          {/* Manzilni o'zgartirish */}
          {!isError && (
            <button
              className="btn btn--primary delivery-guard__btn"
              onClick={onForceGeo}
            >
              {t("checkout:delivery_unavailable_change")}
            </button>
          )}
          {/* Qayta tekshirish (har ikki holatda) */}
          <button
            className="btn btn--outline delivery-guard__btn"
            onClick={retryCheck}
            type="button"
          >
            <RotateCcw size={16} style={{ marginRight: 6 }} />
            {t("common:retry") || "Qayta tekshirish"}
          </button>
          {isError && (
            <button
              className="btn btn--primary delivery-guard__btn"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw size={16} style={{ marginRight: 6 }} />
              {t("common:reload") || "Sahifani yangilash"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
