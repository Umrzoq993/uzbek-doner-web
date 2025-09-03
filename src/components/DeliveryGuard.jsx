import { useEffect, useState } from "react";
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
    <div className="modal-backdrop" style={{ zIndex: 1000 }}>
      <div className="sheet" style={{ maxWidth: 420 }}>
        <div className="sheet__head">
          <div className="sheet__title">{titleText}</div>
        </div>
        <div className="sheet__body" style={{ fontSize: 14, lineHeight: 1.5 }}>
          {bodyText}
          {place?.label && (
            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
              {place?.label}
            </div>
          )}
        </div>
        <div
          className="sheet__foot"
          style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
        >
          {!isError && (
            <button className="btn btn--primary" onClick={onForceGeo}>
              {t("checkout:delivery_unavailable_change")}
            </button>
          )}
          {isError && (
            <button
              className="btn btn--primary"
              onClick={() => window.location.reload()}
            >
              {t("common:retry") || "Qayta urinish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
