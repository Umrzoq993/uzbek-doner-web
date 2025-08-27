import axios from "axios";
import { toastError } from "./toast";

const BASE = import.meta.env.VITE_API_BASE || "https://uzbekdoner.adminsite.uz";
const http = axios.create({ baseURL: BASE, timeout: 20000 });

// ===== Token storage =====
const tokKey = "uzd_token_v1";
export const tokenStore = {
  get: () => localStorage.getItem(tokKey) || "",
  set: (t) => localStorage.setItem(tokKey, t || ""),
  clear: () => localStorage.removeItem(tokKey),
};

// ===== Avto-login sozlamalari (opt-in) =====
const U = import.meta.env.VITE_AUTH_USERNAME;
const P = import.meta.env.VITE_AUTH_PASSWORD;
const AUTO = Boolean(U && P);

function decodeExp(token) {
  try {
    const p = JSON.parse(atob(token.split(".")[1]));
    return p?.exp ? p.exp * 1000 : 0;
  } catch {
    return 0;
  }
}
function isExpired(token) {
  if (!token) return true;
  const exp = decodeExp(token);
  return !exp || Date.now() > exp - 15_000; // 15s buffer
}

let authPromise = null;
async function backgroundLogin() {
  const form = new URLSearchParams();
  form.set("grant_type", "password");
  form.set("username", U);
  form.set("password", P);
  form.set("scope", "");
  form.set("client_id", "string");
  form.set("client_secret", "string");
  const { data } = await axios.post(`${BASE}/token`, form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  tokenStore.set(data?.access_token || "");
  return data;
}
async function ensureAuthIfNeeded() {
  if (!AUTO) return;
  const t = tokenStore.get();
  if (!t || isExpired(t)) {
    if (!authPromise)
      authPromise = backgroundLogin().finally(() => {
        authPromise = null;
      });
    await authPromise;
  }
}

// ===== Interceptors =====
// Request interceptor
http.interceptors.request.use(async (cfg) => {
  await ensureAuthIfNeeded();
  const t = tokenStore.get();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Response interceptor (401 bo‘lsa retry)
http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err?.config || {};
    const detail = err?.response?.data?.detail || "";
    const unauth =
      err?.response?.status === 401 ||
      /Could not validate credentials/i.test(detail);

    if (AUTO && unauth && !cfg._retry) {
      try {
        cfg._retry = true;
        await backgroundLogin();
        cfg.headers = cfg.headers || {};
        const t = tokenStore.get();
        if (t) cfg.headers.Authorization = `Bearer ${t}`;
        return http(cfg);
      } catch (e) {
        /* agar bu ham xato qilsa, pastdagi xabar ishlaydi */
      }
    }

    const msg =
      detail || err?.response?.data?.message || err?.message || "Xatolik";
    toastError(msg);
    return Promise.reject(err);
  }
);

// ===== Auth qo‘lda chaqirish uchun =====
export const AuthAPI = {
  async loginUsernamePassword({ username, password }) {
    const form = new URLSearchParams();
    form.set("grant_type", "password");
    form.set("username", username);
    form.set("password", password);
    form.set("scope", "");
    form.set("client_id", "string");
    form.set("client_secret", "string");
    const { data } = await axios.post(`${BASE}/token`, form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    tokenStore.set(data?.access_token || "");
    return data;
  },
};

// ===== Menu =====
const mapCat = (c) => ({
  id: c.category_id,
  name: c.name_uz || c.name_ru || "Kategoriya",
  imageUrl: c.photo?._url || "",
});
const mapProd = (p) => ({
  id: p.product_id,
  name: p.name_uz || p.name_ru || "Mahsulot",
  price: Number(p.price || 0),
  imageUrl: p.photo?._url || "",
  description: p.description_uz || p.description_ru || "",
  categoryId: p?.category?.category_id || null,
});

export const MenuAPI = {
  async categories() {
    const { data } = await http.get("/category/all");
    return (Array.isArray(data) ? data : []).map(mapCat);
  },
  async productsByCategory(categoryId) {
    if (!categoryId) return [];
    const { data } = await http.get("/product/by_category", {
      params: { category_id: categoryId },
    });
    const list = data?.products || [];
    return list.map(mapProd);
  },
};

// ===== Order =====
export const OrderAPI = {
  async create(payload) {
    const url = import.meta.env.VITE_ORDER_ENDPOINT || "/order/create";
    const { data } = await http.post(url, payload);
    return data;
  },
};

export default http;
