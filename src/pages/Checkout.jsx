// src/pages/Checkout.jsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { useLocationStore } from "../store/location";
import { toast } from "react-toastify";
import { useT, useMoneyFormatter } from "../i18n/i18n";
import { useLangStore } from "../store/lang";

/* Helpers */
// localized money formatting via hook (legacy fmt kept for fallback if needed)
// legacyFmt removed (use useMoneyFormatter instead)
const KURYER_FEE = 6900;
const API_BASE = import.meta?.env?.VITE_API_BASE || "";

/* Telefon: faqat 9 ta raqam saqlaymiz (prefiks +998 alohida ko‘rsatiladi) */
const onlyDigits = (s = "") => s.replace(/\D+/g, "");
const clamp9 = (s) => onlyDigits(s).slice(0, 9);
const toE164 = (nine) => (nine?.length === 9 ? `+998${nine}` : "");
const prettyNine = (nine = "") => {
  const a = nine.padEnd(9, "_");
  return `+998 (${a.slice(0, 2)})-${a.slice(2, 5)}-${a.slice(5, 7)}-${a.slice(
    7,
    9
  )}`;
};

export default function Checkout() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const fmtMoney = useMoneyFormatter();
  const nav = useNavigate();
  const { items /*, clear*/ } = useCart();
  const { place, details, setDetails } = useLocationStore();

  const [payMethod, setPayMethod] = useState("card"); // 'card' | 'cash'
  const [phone9, setPhone9] = useState(""); // faqat 9 ta raqam
  const [loading, setLoading] = useState(false);

  // Agar details.phone bo‘lsa, 998 prefiksini olib, 9 ta raqam sifatida qo‘yib olaylik
  useEffect(() => {
    const preset = onlyDigits(details?.phone || "").replace(/^998/, "");
    if (preset) setPhone9(clamp9(preset));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0),
    [items]
  );
  const totalQty = useMemo(
    () => items.reduce((s, i) => s + (i.qty || 0), 0),
    [items]
  );
  const total = Math.max(0, subtotal + KURYER_FEE);

  const handlePay = async () => {
    if (!items.length) return toast?.error?.(t("checkout:toast_cart_empty"));
    if (!place?.label) return toast?.error?.(t("checkout:toast_need_address"));

    const phoneE164 = toE164(phone9);
    if (payMethod === "card") {
      if (!phoneE164) return toast?.error?.(t("checkout:toast_phone_required"));

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/payment/card`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: phoneE164,
            amount: total,
            items: items.map((x) => ({
              id: x.id,
              name: x.title,
              price: x.price,
              qty: x.qty,
            })),
            address: {
              label: place?.label,
              entrance: details?.entrance || "",
              floor: details?.floor || "",
              apt: details?.apt || "",
              courierNote: details?.courierNote || "",
            },
          }),
        });
        if (!res.ok) throw new Error("Payment request failed");
        toast?.success?.(t("checkout:toast_card_sent"));
        nav("/");
      } catch {
        toast?.error?.(t("checkout:toast_card_fail"));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Naqd to‘lov
    setLoading(true);
    try {
      // TODO: naqd buyurtma API
      await new Promise((r) => setTimeout(r, 500));
      toast?.success?.(t("checkout:toast_cash_success"));
      nav("/");
    } catch {
      toast?.error?.(t("checkout:toast_cash_fail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout page has-paybar">
      <div className="checkout-grid">
        {/* LEFT */}
        <div className="left">
          {/* Savat */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">{t("checkout:cart")}</h3>
            {items.length === 0 && (
              <div className="checkout-card__muted">
                {t("checkout:cart_empty")}
              </div>
            )}
            <div className="summary-list">
              {items.map((it) => {
                const line = (it.price || 0) * (it.qty || 0);
                // Mahsulot nomini tilga qarab tanlaymiz (raw obyekt mavjud bo'lsa undan olamiz)
                const raw = it.raw || it.product || {};
                const name =
                  lang === "ru"
                    ? raw.name_ru ||
                      raw.name ||
                      it.title ||
                      it.name ||
                      "Mahсulot"
                    : raw.name_uz ||
                      raw.name ||
                      it.title ||
                      it.name ||
                      "Mahsulot";
                return (
                  <div key={it.id} className="summary-row">
                    <div>
                      <div style={{ fontWeight: 800 }}>{name}</div>
                      <small className="checkout-card__muted">
                        {fmtMoney(it.price || 0)} • {it.qty || 0}{" "}
                        {t("common:piece_suffix")}
                      </small>
                    </div>
                    <div style={{ fontWeight: 700 }}>{fmtMoney(line)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Restoran uchun izoh */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">
              {t("checkout:note_for_restaurant")}
            </h3>
            <textarea
              className="field field--long"
              style={{ width: "100%" }}
              placeholder={t("checkout:note_placeholder")}
              value={details?.courierNote || ""}
              onChange={(e) => setDetails({ courierNote: e.target.value })}
            />
          </div>

          {/* Manzil */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">{t("checkout:address")}</h3>
            <div className="checkout-card__muted" style={{ marginBottom: 10 }}>
              {place?.label || t("checkout:address_not_selected")}
            </div>
            <div className="field-row">
              <input
                className="field"
                placeholder={t("checkout:entrance")}
                value={details?.entrance || ""}
                onChange={(e) => setDetails({ entrance: e.target.value })}
              />
              <input
                className="field"
                placeholder={t("checkout:floor")}
                value={details?.floor || ""}
                onChange={(e) => setDetails({ floor: e.target.value })}
              />
              <input
                className="field"
                placeholder={t("checkout:apt")}
                value={details?.apt || ""}
                onChange={(e) => setDetails({ apt: e.target.value })}
              />
              <textarea
                className="field field--long"
                style={{ width: "100%" }}
                placeholder={t("checkout:courier_note")}
                value={details?.courierNote || ""}
                onChange={(e) => setDetails({ courierNote: e.target.value })}
              />
            </div>
          </div>

          {/* To'lov usuli */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">{t("checkout:pay_method")}</h3>

            <div className="paytype">
              <button
                type="button"
                className={`radio-card ${
                  payMethod === "card" ? "is-active" : ""
                }`}
                onClick={() => setPayMethod("card")}
                style={{ color: "var(--fg)" }}
              >
                <div>
                  <div
                    className="radio-card__title"
                    style={{ color: "inherit" }}
                  >
                    {t("checkout:pay_card")}
                  </div>
                  <div
                    className="radio-card__sub"
                    style={{ color: "inherit", opacity: 0.75 }}
                  >
                    {t("checkout:pay_card_sub")}
                  </div>
                </div>
              </button>

              <button
                type="button"
                className={`radio-card ${
                  payMethod === "cash" ? "is-active" : ""
                }`}
                onClick={() => setPayMethod("cash")}
                style={{ color: "var(--fg)" }}
              >
                <div>
                  <div
                    className="radio-card__title"
                    style={{ color: "inherit" }}
                  >
                    {t("checkout:pay_cash")}
                  </div>
                  <div
                    className="radio-card__sub"
                    style={{ color: "inherit", opacity: 0.75 }}
                  >
                    {t("checkout:pay_cash_sub")}
                  </div>
                </div>
              </button>
            </div>

            {/* Telefon — mask yo‘q, prefiks alohida; input faqat 9 ta raqam qabul qiladi */}
            <div className="field-row" style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 8,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    padding: "10px 12px",
                    borderRadius: 999,
                    border: "1px solid var(--line)",
                    background: "var(--surface-2)",
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                  }}
                >
                  +998
                </span>

                <input
                  className="field"
                  style={{ width: "100%" }}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={9}
                  placeholder="(__)___-__-__"
                  value={phone9}
                  onChange={(e) => {
                    const v = clamp9(e.target.value);
                    setPhone9(v);
                    setDetails({ phone: toE164(v) || "" });
                  }}
                />
              </div>

              <small className="checkout-card__muted">
                {payMethod === "card"
                  ? t("checkout:phone_required")
                  : t("checkout:phone_optional")}
                &nbsp; Format: {prettyNine(phone9)}
              </small>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="summary">
            <div className="summary-card">
              <div className="summary-list">
                <div className="summary-row summary-row--muted">
                  <div>{t("checkout:order")}</div>
                  <div>{fmtMoney(subtotal)}</div>
                </div>
                <div className="summary-row summary-row--muted">
                  <div>{t("checkout:delivery")}</div>
                  <div>{fmtMoney(KURYER_FEE)}</div>
                </div>
                <div className="summary-row summary-row--total">
                  <div>{t("checkout:total")}</div>
                  <div>{fmtMoney(total)}</div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <strong>{t("checkout:about_order")}</strong>
              <div className="checkout-card__muted">
                {t("checkout:products_count", { count: totalQty })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYBAR */}
      <div className="paybar">
        <div className="paybar__inner">
          <div style={{ fontWeight: 800 }}>
            {t("checkout:total")}:&nbsp; {fmtMoney(total)}
          </div>
          <button
            className="paybar__btn"
            disabled={
              !items.length ||
              loading ||
              (payMethod === "card" && phone9.length !== 9)
            }
            onClick={handlePay}
          >
            {loading ? t("checkout:submitting") : t("checkout:submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
