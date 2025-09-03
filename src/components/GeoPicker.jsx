import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
import { reverseGeocode } from "../lib/geo";
import { FlialAPI } from "../lib/api";
import { toastError, toastSuccess } from "../lib/toast";
import { useLocationStore } from "../store/location";
import Button from "./ui/Button";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
});

function ClickToMove({ setPos }) {
  useMapEvents({
    click(ev) {
      setPos({ lat: ev.latlng.lat, lon: ev.latlng.lng });
    },
  });
  return null;
}

export default function GeoPicker({ open, onClose }) {
  const setPlace = useLocationStore((s) => s.setPlace);
  const saved = useLocationStore((s) => s.place);

  // Qidiruv o'chirildi – faqat xarita + geolokatsiya
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pos, setPos] = useState(
    saved || { lat: 41.3111, lon: 69.2797, label: "Toshkent" }
  );
  const [addr, setAddr] = useState(null);
  const [available, setAvailable] = useState(null); // null | true | false
  const [error, setError] = useState("");
  const mapRef = useRef(null);

  useEffect(() => {
    if (open && saved) setPos(saved);
  }, [open, saved]);

  // (Search disabled)

  // Reverse geocode current position (debounced when lat/lon changes)
  useEffect(() => {
    let ignore = false;
    const t = setTimeout(async () => {
      try {
        const a = await reverseGeocode(pos.lat, pos.lon);
        if (!ignore) setAddr(a);
      } catch {
        if (!ignore) setAddr(null);
      }
    }, 400);
    return () => {
      ignore = true;
      clearTimeout(t);
    };
  }, [pos.lat, pos.lon]);

  const checkAvailability = useCallback(async (lat, lon) => {
    setChecking(true);
    setError("");
    try {
      const data = await FlialAPI.checkPoint({ latitude: lat, longitude: lon });
      if (data?.status && data?.flial?.id) {
        setAvailable(true);
      } else {
        setAvailable(false);
      }
    } catch {
      setAvailable(false);
      setError("Tekshirishda xatolik");
    } finally {
      setChecking(false);
    }
  }, []);

  // Auto check availability once we have reverse geocoded address
  useEffect(() => {
    if (addr) checkAvailability(pos.lat, pos.lon);
  }, [addr, pos.lat, pos.lon, checkAvailability]);

  if (!open) return null;

  const confirm = async () => {
    if (!addr) {
      toastError("Manzil aniqlanmadi");
      return;
    }
    if (available === false) {
      toastError(
        "Ushbu manzilga yetkazib berish mavjud emas. Noqulayliklar uchun uzr so'raymiz."
      );
      return;
    }
    try {
      setLoading(true);
      const place = { ...addr, lat: pos.lat, lon: pos.lon };
      setPlace(place);
      toastSuccess("Manzil saqlandi");
      onClose();
    } catch {
      toastError("Saqlashda xato");
    } finally {
      setLoading(false);
    }
  };

  const geoNow = () => {
    if (!("geolocation" in navigator)) {
      toastError("Geolokatsiya qo‘llanmaydi");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const lat = p.coords.latitude,
          lon = p.coords.longitude;
        setPos({ lat, lon });
        try {
          await reverseGeocode(lat, lon); // trigger cache/update silently
        } catch {
          /* ignore */
        }
      },
      (err) => {
        toastError(err.message || "Geolokatsiya xatosi");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  return (
    <div className="modal-backdrop geo-picker" onClick={onClose}>
      <div className="sheet sheet--geo" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="geo-header">
          <div className="geo-header__left">
            <h2 className="geo-title">Manzilni tanlash</h2>
            {addr && (
              <div className="geo-current" title={addr.label}>
                <span className="geo-current__dot" />
                <span className="geo-current__text">{addr.label}</span>
              </div>
            )}
          </div>
          <div className="geo-header__actions">
            <button className="chip" onClick={geoNow} aria-label="Geolokatsiya">
              📍 Joylashuv
            </button>
            <button className="chip" onClick={onClose} aria-label="Yopish">
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: "4px 20px 0", fontSize: 12, opacity: 0.7 }}>
          Xarita ustidan kerakli joyni belgilang yoki 📍 tugmasi orqali joriy
          joylashuvni oling.
        </div>

        {/* Map Section */}
        <div className="geo-map-wrap">
          <MapContainer
            center={[pos.lat, pos.lon]}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(m) => (mapRef.current = m)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            <Marker
              position={[pos.lat, pos.lon]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  setPos({ lat, lon: lng });
                },
              }}
            />
            <ClickToMove setPos={setPos} />
          </MapContainer>
          <div className="geo-map-crosshair" aria-hidden>
            <div className="geo-map-crosshair__dot" />
          </div>
          <div className="geo-availability">
            {checking && (
              <span className="geo-pill geo-pill--loading">
                Tekshirilmoqda...
              </span>
            )}
            {!checking && available === true && (
              <span className="geo-pill geo-pill--ok">Yetkazib beramiz ✅</span>
            )}
            {!checking && available === false && (
              <span className="geo-pill geo-pill--bad">Bu hududga yo‘q ❌</span>
            )}
            {error && <span className="geo-pill geo-pill--warn">{error}</span>}
          </div>
        </div>

        {/* Footer / Confirm Bar */}
        <div className="geo-footer">
          <div className="geo-footer__addr">
            <div className="geo-footer__label">Tanlangan manzil</div>
            <div className="geo-footer__value">
              {addr ? addr.label : "Aniqlanmoqda..."}
            </div>
          </div>
          <Button
            className="btn--primary geo-save"
            onClick={confirm}
            disabled={loading || !addr || available === false}
          >
            {loading
              ? "Saqlanmoqda..."
              : available === false
              ? "Mavjud emas (uzr)"
              : "Saqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
}
