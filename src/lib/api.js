import axios from "axios";
import { toastError } from "./toast";

const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE ||
  "https://uzbekdoner.adminsite.uz";

const http = axios.create({ baseURL: BASE, timeout: 20000 });

// ===== Token storage =====
const tokKey = "uzd_token_v1";
export const tokenStore = {
  get: () => localStorage.getItem(tokKey) || "",
  set: (t) => localStorage.setItem(tokKey, t || ""),
  clear: () => localStorage.removeItem(tokKey),
};

// ===== Ixtiyoriy: Avtologin (env orqali) =====
const AUTO_USER = import.meta.env.VITE_AUTH_USERNAME || "";
const AUTO_PASS = import.meta.env.VITE_AUTH_PASSWORD || "";
let authPromise = null;

async function backgroundLogin() {
  if (!AUTO_USER || !AUTO_PASS) return;
  const form = new URLSearchParams();
  form.set("grant_type", "password");
  form.set("username", AUTO_USER);
  form.set("password", AUTO_PASS);
  form.set("scope", "");
  form.set("client_id", "string");
  form.set("client_secret", "string");
  const { data } = await axios.post(`${BASE}/token`, form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  tokenStore.set(data?.access_token || "");
}

async function ensureAuthIfNeeded() {
  if (tokenStore.get() || !AUTO_USER || !AUTO_PASS) return;
  // bir martalik login
  authPromise = authPromise || backgroundLogin();
  await authPromise;
}

// ===== Interceptors =====
http.interceptors.request.use(async (cfg) => {
  await ensureAuthIfNeeded();
  const t = tokenStore.get();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

http.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err?.config || {};
    const detail = err?.response?.data?.detail || "";
    const unauth =
      err?.response?.status === 401 ||
      /Could not validate credentials/i.test(detail);

    if (AUTO_USER && AUTO_PASS && unauth && !cfg._retry) {
      try {
        cfg._retry = true;
        await backgroundLogin();
        cfg.headers = cfg.headers || {};
        const t = tokenStore.get();
        if (t) cfg.headers.Authorization = `Bearer ${t}`;
        return http(cfg);
      } catch {
        // retry failed; proceed to error handler
      }
    }

    const msg =
      detail || err?.response?.data?.message || err?.message || "Xatolik";
    toastError(msg);
    return Promise.reject(err);
  }
);

// ===== Qo‘lda login (UI dan chaqirish uchun) =====
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

// ===== Filial / Delivery pricing =====
export const FlialAPI = {
  /**
   * Koordinatalar bo'yicha eng yaqin filial va yetkazib berish narxini aniqlaydi.
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<{status:boolean, flial?:{id:number,name:string,latitude:number,longitude:number}, address?:object, distance?:number, price?:number}>}
   */
  async checkPoint({ latitude, longitude }) {
    // Prod domain; allows override via VITE_TEMP_API_BASE but falls back to main BASE
    const TEMP_BASE = import.meta.env.VITE_TEMP_API_BASE || BASE;
    // Avto login (agar sozlangan bo'lsa)
    try {
      await ensureAuthIfNeeded();
    } catch {
      /* ignore */
    }

    // Interceptorlardan foydalanish uchun umumiy http instance dan foydalanamiz
    // (shunda 401 bo'lsa avtomatik refresh/login retry ishlaydi)
    const url = `${TEMP_BASE}/flials/check_point`;
    try {
      const { data } = await http.post(
        url,
        "", // body bo'sh (backend query param qabul qilsa)
        {
          params: { latitude, longitude },
          timeout: 15000,
          headers: { Accept: "application/json" },
          validateStatus: (s) => s < 500,
        }
      );
      // Agar backend 401 qaytargan bo'lsa va interceptor refresh qilmagan bo'lsa,
      // tokenni tozalab bir martalik qayta urinib ko'ramiz.
      if (
        data?.detail === "Not authenticated" ||
        data?.detail === "Unauthorized"
      ) {
        tokenStore.clear();
        try {
          await ensureAuthIfNeeded();
        } catch {
          /* ignore */
        }
        const retry = await http.post(url, "", {
          params: { latitude, longitude },
          timeout: 15000,
          headers: { Accept: "application/json" },
          validateStatus: (s) => s < 500,
        });
        return retry.data;
      }
      return data;
    } catch (e) {
      // Pastga tashlaymiz (chaqiruvchi try/catch qilishi mumkin)
      throw e;
    }
  },
};

// ===== Menu =====
const mapCat = (c) => ({
  id: c.category_id,
  // preserve legacy "name" (Uzbek priority) for backward compatibility
  name: c.name_uz || c.name_ru || "Kategoriya",
  name_uz: c.name_uz || "",
  name_ru: c.name_ru || "",
  imageUrl: c.photo?._url || "",
});

const mapProd = (p) => ({
  id: p.product_id,
  // legacy single name/description fields (Uzbek priority)
  name: p.name_uz || p.name_ru || "Mahsulot",
  description: p.description_uz || p.description_ru || "",
  // language specific fields
  name_uz: p.name_uz || "",
  name_ru: p.name_ru || "",
  description_uz: p.description_uz || "",
  description_ru: p.description_ru || "",
  price: Number(p.price || 0),
  imageUrl: p.photo?._url || "",
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
    const TEMP_BASE = import.meta.env.VITE_TEMP_API_BASE || BASE; // fallback prod baza
    // Agar avtomatik login sozlangan bo'lsa va token yo'q bo'lsa avval olishga urinib ko'ramiz
    try {
      await ensureAuthIfNeeded();
    } catch {
      /* ignore auto auth failure */
    }
    const token = tokenStore.get();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      // Backendga yuborish
      const { data } = await axios.post(`${TEMP_BASE}/orders/new`, payload, {
        timeout: 20000,
        headers,
        validateStatus: (s) => s < 500, // 4xx ni ham qaytarib olamiz
      });
      if (
        data?.detail === "Not authenticated" ||
        data?.detail === "Unauthorized"
      ) {
        throw new Error("Avtorizatsiya talab qilinadi (401)");
      }
      // Kutilayotgan normalizatsiya:
      // Kirish formati (backenddan real keladigan turli variantlarga moslash uchun):
      //  { status: true, message: "Order created successfully", order_id: 123 }
      //  yoki { success: true, id: 123 }
      //  yoki { order: { id: 123 }, message: "ok" }
      const normalized = (() => {
        if (!data || typeof data !== "object") {
          return {
            status: false,
            message: "Unknown response",
            order_id: null,
            raw: data,
          };
        }
        const orderId =
          data.order_id ||
          data.id ||
          data.orderId ||
          data.order?.id ||
          data.order?.order_id ||
          null;
        const status = Boolean(
          data.status === true ||
            data.success === true ||
            (typeof orderId === "number" && orderId > 0)
        );
        const message =
          data.message ||
          data.detail ||
          (status ? "Order created successfully" : "Order create failed");
        return { status, message, order_id: orderId, raw: data };
      })();
      return normalized;
    } catch (err) {
      console.error("Order create failed", err);
      throw err;
    }
  },
};

export default http;
