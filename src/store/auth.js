import { create } from "zustand";
import { AuthAPI } from "../lib/authApi";

const persistKey = "uzd_access_token";

export const useAuth = create((set, get) => ({
  token: localStorage.getItem(persistKey) || null,

  setToken: (t) => {
    set({ token: t });
    if (t) localStorage.setItem(persistKey, t);
    else localStorage.removeItem(persistKey);
  },

  loginWithEnv: async () => {
    const u = import.meta.env.VITE_AUTH_USERNAME;
    const p = import.meta.env.VITE_AUTH_PASSWORD;
    const cid = import.meta.env.VITE_AUTH_CLIENT_ID || "string";
    const cs = import.meta.env.VITE_AUTH_CLIENT_SECRET || "";
    if (!u || !p) throw new Error("Auth creds are not set in .env");
    const data = await AuthAPI.login({
      username: u,
      password: p,
      client_id: cid,
      client_secret: cs,
    });
    get().setToken(data.access_token);
    return data.access_token;
  },

  ensureToken: async () => {
    if (get().token) return get().token;
    return await get().loginWithEnv();
  },

  logout: () => get().setToken(null),
}));
