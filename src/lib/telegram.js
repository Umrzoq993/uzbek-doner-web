import { useEffect } from "react";

export function getTWA() {
  // Telegram WebApp obyekti mavjudligini tekshiramiz
  return typeof window !== "undefined" &&
    window.Telegram &&
    window.Telegram.WebApp
    ? window.Telegram.WebApp
    : null;
}

export function getTelegramInitData() {
  const twa = getTWA();
  return twa?.initData || ""; // serverga header sifatida yuborish mumkin
}

export function useTelegramBoot() {
  useEffect(() => {
    const twa = getTWA();
    if (!twa) return;
    // TWA tayyor bo'lgani haqida
    twa.ready();
    // Telegram temasi asosida sayt ranglarini moslaymiz
    const tp = twa.themeParams || {};
    const root = document.documentElement;
    if (tp.bg_color) root.style.setProperty("--bg", `#${tp.bg_color}`);
    if (tp.text_color) root.style.setProperty("--fg", `#${tp.text_color}`);
    if (tp.hint_color) root.style.setProperty("--muted", `#${tp.hint_color}`);
    if (tp.button_color)
      root.style.setProperty("--primary", `#${tp.button_color}`);
    if (tp.button_text_color)
      root.style.setProperty("--on-primary", `#${tp.button_text_color}`);
    document.body.classList.add("is-twa"); // CSS’da kichik farqlar uchun
  }, []);
}
