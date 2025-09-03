// src/store/lang.js
// Simple zustand store to keep current language (Uzbek default)
import { create } from "zustand";

const DETECTED =
  (typeof localStorage !== "undefined" && localStorage.getItem("lang")) ||
  (typeof navigator !== "undefined"
    ? navigator.language.startsWith("ru")
      ? "ru"
      : "uz"
    : "uz");

export const useLangStore = create((set) => ({
  lang: DETECTED,
  setLang: (lang) => {
    try {
      localStorage.setItem("lang", lang);
    } catch {
      // ignore write errors (private mode etc.)
    }
    set({ lang });
  },
}));
