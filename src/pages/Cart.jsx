// src/pages/Cart.jsx
import { useMemo, useEffect, useState } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import { useMoneyFormatter, useT } from "../i18n/i18n";
import { useLangStore } from "../store/lang";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { useLocationStore } from "../store/location";
import { FlialAPI } from "../lib/api";

/* --- helpers (legacy formatter removed; use hook instead) --- */

export default function Cart() {
  const nav = useNavigate();
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const fmtMoney = useMoneyFormatter();
  const { items, inc, dec, remove, clear } = useCart();
  const { place } = useLocationStore();
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [feeLoading, setFeeLoading] = useState(false);

  useEffect(() => {
    const lat = place?.lat;
    const lon = place?.lon;
    if (!lat || !lon) return;
    let cancelled = false;
    (async () => {
      setFeeLoading(true);
      try {
        const data = await FlialAPI.checkPoint({
          latitude: lat,
          longitude: lon,
        });
        if (cancelled) return;
        if (data?.status) {
          setDeliveryPrice(Number(data?.price || 0));
        } else {
          setDeliveryPrice(0);
        }
      } catch {
        if (!cancelled) setDeliveryPrice(0);
      } finally {
        if (!cancelled) setFeeLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [place?.lat, place?.lon]);

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (it.price || 0) * (it.qty || 0), 0),
    [items]
  );
  const totalQty = useMemo(
    () => items.reduce((s, it) => s + (it.qty || 0), 0),
    [items]
  );
  const disablePay = !items.length || totalQty <= 0 || subtotal <= 0;
  const total = useMemo(
    () => Math.max(0, subtotal + (deliveryPrice || 0)),
    [subtotal, deliveryPrice]
  );

  // Savatdagi birinchi mavjud kategoriya (fallback: 49)

  const goCheckout = () => {
    if (disablePay) return;
    nav("/checkout");
  };

  return (
    <div className="page page--cart">
      <div className="container cart-sections">
        {/* 1. Mahsulotlar ro'yxati + jami */}
        <div className="cart-card cart-card--items">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h3 className="checkout-card__title" style={{ margin: 0 }}>
              {t("common:cart")}
            </h3>
            {!!items.length && (
              <button
                className="btn btn--ghost"
                onClick={clear}
                aria-label={
                  lang === "ru" ? "Очистить корзину" : "Savatchani tozalash"
                }
                title={
                  lang === "ru" ? "Очистить корзину" : "Savatchani tozalash"
                }
              >
                {lang === "ru" ? "Очистить" : "Tozalash"}
              </button>
            )}
          </div>
          <div
            className="cart-section-sep"
            style={{
              margin: "14px -4px 18px",
              height: 1,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)",
              border: 0,
            }}
            aria-hidden
          />

          {!items.length && (
            <div className="checkout-card__muted">{t("common:cart_empty")}</div>
          )}

          {items.map((it) => {
            const raw = it.raw || it.product || {};
            const name =
              lang === "ru"
                ? raw.name_ru || raw.name || it.title || t("product:item")
                : raw.name_uz || raw.name || it.title || t("product:item");
            return (
              <div
                key={it.id}
                className="summary-row"
                style={{ alignItems: "center" }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 16,
                      letterSpacing: 0.3,
                    }}
                  >
                    {name}
                  </div>
                  <div
                    className="checkout-card__muted"
                    style={{ fontSize: 13.5, opacity: 0.75, fontWeight: 600 }}
                  >
                    {it.qty || 0} × {fmtMoney(it.price || 0)}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="qty-chip" aria-label={`${it.title} miqdori`}>
                    <button
                      className="qty-chip__btn"
                      onClick={() => dec(it.id)}
                      aria-label={t("common:decrease")}
                    >
                      −
                    </button>
                    <div className="qty-chip__num">{it.qty || 0}</div>
                    <button
                      className="qty-chip__btn"
                      onClick={() => inc(it.id)}
                      aria-label={t("common:increase")}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="btn btn--subtle-danger btn--icon"
                    onClick={() => remove(it.id)}
                    aria-label={lang === "ru" ? "Удалить" : "O‘chirish"}
                    title={lang === "ru" ? "Удалить" : "O‘chirish"}
                  >
                    <span className="icon" aria-hidden>
                      🗑
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
          {!!items.length && (
            <div className="cart-total-inline has-fee">
              <div className="cart-fee-row">
                <span className="cart-total-inline__label">
                  {lang === "ru" ? "Доставка" : "Yetkazib berish"}
                </span>
                <span className="cart-fee-row__val">
                  {feeLoading
                    ? "…"
                    : deliveryPrice > 0
                    ? fmtMoney(deliveryPrice)
                    : lang === "ru"
                    ? "—"
                    : "—"}
                </span>
              </div>
              <div className="cart-total-sep" aria-hidden />
              <div className="cart-sum-row">
                <span className="cart-total-inline__label">
                  {lang === "ru" ? "Итого" : "Jami"}
                </span>
                <span className="cart-total-inline__val">
                  {fmtMoney(total)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3+4. Actions (Return + Pay) in one card with internal subcards */}
        <div className="cart-card cart-card--actions">
          <div className="cart-action-grid">
            <div
              className={`cart-subcard cart-subcard--return${
                !items.length ? " is-alone" : ""
              }`}
            >
              <Link
                to="/"
                className="cart-return-link"
                aria-label={lang === "ru" ? "Назад в меню" : "Menyuga qaytish"}
              >
                <span className="cart-return-link__icon" aria-hidden>
                  <ChevronLeft size={18} />
                </span>
                <span className="cart-return-link__text">
                  {lang === "ru" ? "Назад в меню" : "Menyuga qaytish"}
                </span>
              </Link>
            </div>
            {!!items.length && (
              <div className="cart-subcard cart-subcard--pay">
                <button
                  className={
                    "cart-pay-action" + (!disablePay ? " is-pulse" : "")
                  }
                  disabled={disablePay}
                  onClick={goCheckout}
                  type="button"
                  aria-label={
                    lang === "ru" ? "Перейти к оплате" : "To‘lovga o‘tish"
                  }
                >
                  {lang === "ru" ? "Перейти к оплате" : "To‘lovga o‘tish"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Sticky paybar removed */}
    </div>
  );
}
