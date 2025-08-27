import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
import { reverseGeocode, searchGeocode } from "../lib/geo";
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
    click(e) {
      setPos({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

export default function GeoPicker({ open, onClose }) {
  const setPlace = useLocationStore((s) => s.setPlace);
  const saved = useLocationStore((s) => s.place);

  const [query, setQuery] = useState("");
  const [suggests, setSuggests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState(
    saved || { lat: 41.3111, lon: 69.2797, label: "Toshkent" }
  );

  useEffect(() => {
    if (open && saved) setPos(saved);
  }, [open]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.length < 3) {
        setSuggests([]);
        return;
      }
      try {
        setSuggests(await searchGeocode(query));
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  if (!open) return null;

  const confirm = async () => {
    try {
      setLoading(true);
      const addr = await reverseGeocode(pos.lat, pos.lon);
      const place = { ...addr, lat: pos.lat, lon: pos.lon };
      setPlace(place);
      toastSuccess("Manzil saqlandi");
      onClose();
    } catch {
      toastError("Manzilni aniqlab bo‘lmadi");
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
          setSuggests([await reverseGeocode(lat, lon)]);
        } catch {}
      },
      (err) => {
        toastError(err.message || "Geolokatsiya xatosi");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet__head">
          <div className="sheet__title">Manzilni tanlang</div>
          <button className="btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sheet__body" style={{ gap: 10 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ko‘cha, uy raqami yoki obyekt nomi"
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "12px 14px",
                background: "var(--surface)",
              }}
            />
            <Button onClick={geoNow} className="btn--primary">
              Mening joylashuvim
            </Button>
          </div>

          {!!suggests.length && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              {suggests.map((s, i) => (
                <button
                  key={i}
                  className="btn"
                  style={{ width: "100%", textAlign: "left", borderRadius: 0 }}
                  onClick={() => {
                    setPos({ lat: s.lat, lon: s.lon });
                    setQuery(s.label);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div
            style={{
              height: 360,
              border: "1px solid var(--line)",
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <MapContainer
              center={[pos.lat, pos.lon]}
              zoom={16}
              style={{ height: "100%", width: "100%" }}
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
          </div>

          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Tanlangan nuqtani tekshiring va tasdiqlang.
          </div>
        </div>

        <div className="sheet__foot">
          <div />
          <Button className="btn--primary" onClick={confirm} disabled={loading}>
            {loading ? "Saqlanmoqda..." : "Manzilni tasdiqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
}
