// src/pages/Checkout.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../store/cart";
import { useLocationStore } from "../store/location"; // ← MUHIM: to‘g‘ri import

const SERVICE_FEE = 6900;
const CARD_DISCOUNT = 2000;

export default function Checkout() {
  const { items } = useCart();

  // Location storeni faqat komponent ichida chaqiramiz
  const { place, details, setDetails } = useLocationStore();

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0),
    [items]
  );

  const [payMethod, setPayMethod] = useState("card");
  const discount = payMethod === "card" ? CARD_DISCOUNT : 0;
  const total = Math.max(0, subtotal - discount + SERVICE_FEE);

  return (
    <div className="checkout page has-paybar">
      <div className="checkout-grid">
        {/* LEFT COLUMN */}
        <div className="left">
          {/* Savat */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">Savat</h3>
            <div className="summary-list">
              {items.map((it) => (
                <div key={it.id} className="summary-row">
                  <div>
                    <div style={{ fontWeight: 800 }}>{it.title || it.name}</div>
                    <small className="checkout-card__muted">
                      {(it.price || 0).toLocaleString()} so‘m • {it.qty || 0}{" "}
                      dona
                    </small>
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {((it.price || 0) * (it.qty || 0)).toLocaleString()} so‘m
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Restoran uchun izoh */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">Restoran uchun izoh</h3>
            <textarea
              className="field field--long"
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
                placeholder="Kuryer uchun izoh"
                value={details?.courierNote || ""}
                onChange={(e) => setDetails({ courierNote: e.target.value })}
              />
            </div>
            <div style={{ marginTop: 10 }}>
              <Link to="/" className="btn">
                Kartadan tanlash
              </Link>
            </div>
          </div>

          {/* Promo-kod */}
          <div className="checkout-card">
            <h3 className="checkout-card__title">Promo-kod</h3>
            <div className="promo-row">
              <input
                className="field"
                placeholder="Promo-kod kiriting (masalan, TEZ3)"
              />
              <button className="btn btn--primary">Qo‘llash</button>
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
              >
                <div>
                  <div className="radio-card__title">Karta orqali</div>
                  <div className="radio-card__sub">
                    Uzcard, Humo, Visa, MasterCard
                  </div>
                </div>
                <span className="discount-pill">
                  -{CARD_DISCOUNT.toLocaleString()} so‘m
                </span>
              </button>
              <button
                type="button"
                className={`radio-card ${
                  payMethod === "cash" ? "is-active" : ""
                }`}
                onClick={() => setPayMethod("cash")}
              >
                <div>
                  <div className="radio-card__title">Naqd to‘lov</div>
                  <div className="radio-card__sub">Hozircha mavjud emas</div>
                </div>
                <span style={{ opacity: 0.65 }}>—</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right">
          <div className="summary">
            <div className="summary-card">
              <div className="summary-list">
                <div className="summary-row summary-row--muted">
                  <div>Buyurtma</div>
                  <div>{subtotal.toLocaleString()} so‘m</div>
                </div>
                <div className="summary-row">
                  <div>Chegirma</div>
                  <div className="summary-val--neg">
                    -{discount.toLocaleString()} so‘m
                  </div>
                </div>
                <div className="summary-row summary-row--muted">
                  <div>Xizmat haqi</div>
                  <div>{SERVICE_FEE.toLocaleString()} so‘m</div>
                </div>
                <div className="summary-row summary-row--total">
                  <div>Jami</div>
                  <div>{total.toLocaleString()} so‘m</div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <strong>Buyurtma haqida</strong>
              <div className="checkout-card__muted">
                Mahsulotlar soni: {items.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PASTKI PAYBAR */}
      <div className="paybar">
        <div className="paybar__inner">
          <div style={{ fontWeight: 800 }}>
            Jami:&nbsp; {total.toLocaleString()} so‘m
          </div>
          <button className="paybar__btn">To‘lovga o‘tish</button>
        </div>
      </div>
    </div>
  );
}
