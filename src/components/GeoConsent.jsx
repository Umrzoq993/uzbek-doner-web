import { useEffect, useState } from "react";
import { reverseGeocode } from "../lib/geo";
import { useLocationStore } from "../store/location";
import { toastError } from "../lib/toast";

// LocalStorage key to remember consent decision
const CONSENT_KEY = "ud_geo_consent_v1";

export default function GeoConsent() {
  const place = useLocationStore((s) => s.place);
  const setPlace = useLocationStore((s) => s.setPlace);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (place) return; // already have place
    try {
      const saved = localStorage.getItem(CONSENT_KEY);
      if (saved === "granted") {
        // Auto fetch silently
        acquire();
      } else {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const acquire = () => {
    if (!("geolocation" in navigator)) {
      toastError("Geolokatsiya qo'llab-quvvatlanmaydi");
      setVisible(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const lat = p.coords.latitude;
        const lon = p.coords.longitude;
        try {
          let addr = null;
          try {
            addr = await reverseGeocode(lat, lon);
          } catch {
            // ignore reverse geocode
          }
          setPlace(
            addr ? { ...addr, lat, lon } : { label: "My location", lat, lon }
          );
          try {
            localStorage.setItem(CONSENT_KEY, "granted");
          } catch {
            // ignore
          }
        } finally {
          setLoading(false);
          setVisible(false); // success closes modal
        }
      },
      (err) => {
        toastError(err?.message || "Geolokatsiya xatosi");
        setLoading(false);
        // keep modal open so user can retry / allow later
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  // User postpones but modal stays until granted
  const later = () => {
    setErrMsg("Joylashuv aniqlanmadi — ruxsat berishingiz kerak");
  };

  if (!visible || place) return null;

  return (
    <div className="geo-consent-backdrop">
      <div className="geo-consent">
        <div className="geo-consent__icon" aria-hidden>
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="geo-consent__pin"
          >
            <defs>
              <linearGradient
                id="geoPinGrad"
                x1="0"
                y1="0"
                x2="56"
                y2="56"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="var(--brand)" />
                <stop offset="100%" stopColor="var(--brand-2)" />
              </linearGradient>
            </defs>
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="rgba(255,255,255,0.06)"
              stroke="url(#geoPinGrad)"
              strokeWidth="2"
            />
            <path
              d="M28 16c-6.075 0-11 4.76-11 10.636 0 6.76 6.825 14.4 10.02 17.58a1.4 1.4 0 0 0 1.96 0C32.175 41.036 39 33.396 39 26.636 39 20.76 34.075 16 28 16Zm0 15.455a4.818 4.818 0 1 1 0-9.637 4.818 4.818 0 0 1 0 9.637Z"
              fill="url(#geoPinGrad)"
            />
          </svg>
        </div>
        <h3 className="geo-consent__title">Joylashuvdan foydalanish</h3>
        <p className="geo-consent__text">
          Yaqin filialni aniqlash va yetkazib berish narxini hisoblash uchun
          joylashuvingizdan foydalanishga ruxsat bering. Ma'lumotlar faqat
          xizmatni yaxshilash uchun ishlatiladi.
        </p>
        <div className="geo-consent__actions">
          <button
            className="btn btn--outline geo-consent__later"
            onClick={later}
            disabled={loading}
            type="button"
          >
            Keyinroq
          </button>
          <button
            className="btn btn--primary"
            onClick={acquire}
            disabled={loading}
            type="button"
          >
            {loading ? "Aniqlanmoqda..." : "Ruxsat berish"}
          </button>
        </div>
        {errMsg && (
          <p className="geo-consent__error" role="alert">
            {errMsg}
          </p>
        )}
        {/* foot-note removed per latest UX request */}
      </div>
    </div>
  );
}
