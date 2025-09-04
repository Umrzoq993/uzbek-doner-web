import { useEffect, useState } from "react";
import { AlertTriangle, MapPin, RefreshCcw } from "lucide-react";
import { FlialAPI } from "../lib/api";
import { useLocationStore } from "../store/location";
import { useT } from "../i18n/i18n";

export default function DeliveryGuard({ onForceGeo }) {
  const t = useT();
  const place = useLocationStore((s) => s.place);
  const availability = useLocationStore((s) => s.availability);
  const setAvailability = useLocationStore((s) => s.setAvailability);
  const [_, setChecking] = useState(false); // internal flag (not rendered)

  useEffect(() => {
    let cancelled = false;
    const lat = place?.lat;
    const lon = place?.lon;
    (async () => {
      if (!place || availability.checked) return;
      setChecking(true);
      try {
        const data = await FlialAPI.checkPoint({
          latitude: lat,
          longitude: lon,
        });
        if (cancelled) return;
        // Ignore stale response if place changed mid-flight
        if (lat !== place.lat || lon !== place.lon) return;
        if (data?.status && data?.flial?.id) {
          setAvailability({
            checked: true,
            available: true,
            flial: data.flial,
            reason: null,
          });
        } else {
          setAvailability({
            checked: true,
            available: false,
            flial: null,
            reason: "unavailable",
          });
        }
      } catch {
        if (!cancelled)
          setAvailability({
            checked: true,
            available: false,
            flial: null,
            reason: "error",
          });
      } finally {
        if (!cancelled) setChecking(false);
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
          {!isError && (
            <button
              className="btn btn--primary delivery-guard__btn"
              onClick={onForceGeo}
            >
              {t("checkout:delivery_unavailable_change")}
            </button>
          )}
          {isError && (
            <button
              className="btn btn--primary delivery-guard__btn"
              onClick={() => window.location.reload()}
            >
              <RefreshCcw size={16} style={{ marginRight: 6 }} />
              {t("common:retry") || "Qayta urinish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
