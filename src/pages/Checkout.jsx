// src/pages/Checkout.jsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../store/cart";
import { useLocationStore } from "../store/location";
import { toast } from "react-toastify";

/* Helpers */
const fmt = (n) => `${Number(n || 0).toLocaleString("uz-UZ")} so‘m`;
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
    if (!items.length) return toast?.error?.("Savat bo‘sh");
    if (!place?.label) return toast?.error?.("Iltimos, manzil tanlang");

    const phoneE164 = toE164(phone9);
    if (payMethod === "card") {
      if (!phoneE164) return toast?.error?.("Telefon raqamini to‘liq kiriting");

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
        toast?.success?.("So‘rov yuborildi. To‘lovni tasdiqlang.");
        nav("/");
      } catch {
        toast?.error?.(
          "To‘lovni amalga oshirib bo‘lmadi. Keyinroq urinib ko‘ring."
        );
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
      toast?.success?.("Buyurtma qabul qilindi! Rahmat 😊");
      nav("/");
    } catch {
      toast?.error?.("Buyurtmani jo‘natib bo‘lmadi.");
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
            <h3 className="checkout-card__title">Savat</h3>
            {items.length === 0 && (
              <div className="checkout-card__muted">Savat bo‘sh</div>
            )}
            <div className="summary-list">
              {items.map((it) => {
                const line = (it.price || 0) * (it.qty || 0);
                return (
                  <div key={it.id} className="summary-row">
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {it.title || it.name || "Mahsulot"}
                      </div>
                      <small className="checkout-card__muted">
                        {fmt(it.price || 0)} • {it.qty || 0} dona
                      </small>
                    </div>
                    <div style={{ fontWeight: 700 }}>{fmt(line)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Restoran uchun izoh */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">Restoran uchun izoh</h3>
            <textarea
              className="field field--long"
              style={{ width: "100%" }}
              placeholder="Izohda xullas"
              value={details?.courierNote || ""}
              onChange={(e) => setDetails({ courierNote: e.target.value })}
            />
          </div>

          {/* Manzil */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">Manzil</h3>
            <div className="checkout-card__muted" style={{ marginBottom: 10 }}>
              {place?.label || "Manzil tanlanmagan"}
            </div>
            <div className="field-row">
              <input
                className="field"
                placeholder="Pod’ezd"
                value={details?.entrance || ""}
                onChange={(e) => setDetails({ entrance: e.target.value })}
              />
              <input
                className="field"
                placeholder="Qavat"
                value={details?.floor || ""}
                onChange={(e) => setDetails({ floor: e.target.value })}
              />
              <input
                className="field"
                placeholder="Kv/Ofis"
                value={details?.apt || ""}
                onChange={(e) => setDetails({ apt: e.target.value })}
              />
              <textarea
                className="field field--long"
                style={{ width: "100%" }}
                placeholder="Kuryer uchun izoh"
                value={details?.courierNote || ""}
                onChange={(e) => setDetails({ courierNote: e.target.value })}
              />
            </div>
          </div>

          {/* To'lov usuli */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">To‘lov usuli</h3>

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
                    Karta orqali
                  </div>
                  <div
                    className="radio-card__sub"
                    style={{ color: "inherit", opacity: 0.75 }}
                  >
                    Uzcard, Humo, Visa, MasterCard
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
                    Naqd to‘lov
                  </div>
                  <div
                    className="radio-card__sub"
                    style={{ color: "inherit", opacity: 0.75 }}
                  >
                    Kuryerga naqd pul orqali
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
                  ? "Karta orqali to‘lovda telefon raqami talab qilinadi."
                  : "Naqd to‘lovda telefon ixtiyoriy."}
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
                  <div>Buyurtma</div>
                  <div>{fmt(subtotal)}</div>
                </div>
                <div className="summary-row summary-row--muted">
                  <div>Kuryer xizmati</div>
                  <div>{fmt(KURYER_FEE)}</div>
                </div>
                <div className="summary-row summary-row--total">
                  <div>Jami</div>
                  <div>{fmt(total)}</div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <strong>Buyurtma haqida</strong>
              <div className="checkout-card__muted">
                Mahsulotlar soni: {totalQty}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYBAR */}
      <div className="paybar">
        <div className="paybar__inner">
          <div style={{ fontWeight: 800 }}>Jami:&nbsp; {fmt(total)}</div>
          <button
            className="paybar__btn"
            disabled={
              !items.length ||
              loading ||
              (payMethod === "card" && phone9.length !== 9)
            }
            onClick={handlePay}
          >
            {loading ? "Yuborilmoqda..." : "To‘lash"}
          </button>
        </div>
      </div>
    </div>
  );
}
