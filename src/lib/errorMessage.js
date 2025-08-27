export function extractErrorMessage(err) {
  const res = err?.response;
  const data = res?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return asText(data.detail);
  if (data?.message) return asText(data.message);

  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map(asText).join(", ");
  }
  if (data?.error) {
    if (typeof data.error === "string") return data.error;
    if (data.error?.message) return asText(data.error.message);
    if (data.error?.detail) return asText(data.error.detail);
  }

  if (res?.status === 401)
    return "Sessiya tugagan yoki token noto‘g‘ri. Qayta kiring.";
  if (res?.status === 403) return "Ruxsat etilmagan amal.";
  if (res?.status === 404) return "Resurs topilmadi.";
  if (res?.status === 429)
    return "Juda ko‘p so‘rov. Birozdan keyin urinib ko‘ring.";
  if (res?.status >= 500)
    return "Serverda xatolik. Birozdan so‘ng yana urinib ko‘ring.";

  if (err?.code === "ECONNABORTED")
    return "So‘rov vaqti tugadi. Internetni tekshiring.";
  if (err?.message === "Network Error")
    return "Tarmoq xatosi. Internet aloqasini tekshiring.";

  return "Xatolik yuz berdi. Qayta urinib ko‘ring.";
}

function asText(v) {
  return typeof v === "string" ? v : JSON.stringify(v ?? "");
}
