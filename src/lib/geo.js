const NOMINATIM =
  import.meta.env.VITE_GEO_BASE || "https://nominatim.openstreetmap.org";
// Nominatim talablariga ko'ra foydalanuvchi agenti bo'lishi kerak
const hdrs = {
  "Accept-Language": "uz",
  "Content-Type": "application/json",
  "User-Agent": "UzbekDonerWeb/1.0 (https://uzbekdoner.example)",
};

export async function reverseGeocode(lat, lon) {
  const url = `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
  const res = await fetch(url, { headers: hdrs });
  if (!res.ok) throw new Error("Geokodlash xatosi");
  const j = await res.json();
  return normalizeFromNominatim(j);
}

export async function searchGeocode(q) {
  if (!q || q.length < 3) return [];
  const url = `${NOMINATIM}/search?format=json&q=${encodeURIComponent(
    q
  )}&addressdetails=1&limit=8&countrycodes=uz`;
  try {
    const res = await fetch(url, { headers: hdrs });
    if (!res.ok) return [];
    const list = await res.json();
    return list.map(normalizeFromNominatim);
  } catch {
    return [];
  }
}

function normalizeFromNominatim(obj) {
  const a = obj.address || {};
  const lat = Number(obj.lat || obj?.boundingbox?.[0]);
  const lon = Number(obj.lon || obj?.boundingbox?.[2]);
  const label =
    obj.display_name ||
    [a.road, a.house_number, a.suburb, a.city || a.town || a.village]
      .filter(Boolean)
      .join(", ");
  return {
    label,
    lat,
    lon,
    city: a.city || a.town || a.village || a.county || "",
    street: a.road || "",
    house: a.house_number || "",
  };
}

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const s1 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s1));
}
