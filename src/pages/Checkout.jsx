import { useMemo, useState } from "react";
import { useCart } from "../store/cart";
import { OrderAPI } from "../lib/api";
import { toastSuccess, toastError } from "../lib/toast";
import GeoPicker from "../components/GeoPicker";
import PromoRow from "../components/PromoRow";
import PaymentSelector from "../components/PaymentSelector"; // (legacy selector – may be replaced by new styled buttons)
import Button from "../components/ui/Button"; // reused minimal button
// NOTE: BillCard / PayBar replaced with custom summary + paybar per new sample
// Constants adapted from sample provided by user

const SERVICE_FEE = 6900; // xizmat haqi (samplega mos)
const CARD_DISCOUNT = 2000; // karta orqali to'lov chegirmasi (samplega mos)

export default function Checkout() {
  // cart
  const cart = useCart();
  const items = cart.items;

  // geo
  const place = useLocationStore((s) => s.place);
  const details = useLocationStore((s) => s.details);
  const setDetails = useLocationStore((s) => s.setDetails);

  // ui state
  const [geoOpen, setGeoOpen] = useState(false);
  const [payMethod, setPayMethod] = useState("card"); // "card" | "cash"
  const [promo, setPromo] = useState("");

  // calculations (adapted to sample naming)
  const subtotal = useMemo(() => cart.total(), [items]);
  const discountByCard = payMethod === "card" ? CARD_DISCOUNT : 0;
  const promoDiscount =
    promo.toUpperCase() === "TEZ3" ? Math.round(subtotal * 0.05) : 0;
  const service = SERVICE_FEE;
  const delivery = 0; // hozircha 0
  const discount = discountByCard + promoDiscount;
  const total = Math.max(0, subtotal - discount + service + delivery);

  const submit = async () => {
    if (items.length === 0) return;
    if (!place) {
      toastError("Manzil tanlanmagan");
      setGeoOpen(true);
      return;
    }
    try {
      const payload = {
        channel: "web",
        branchId: cart.branchId,
        note: cart.note,
        customer: {
          name: "Mijoz",
          phone: "",
          address: `${place.label} ${
            details.entrance ? ", podyezd " + details.entrance : ""
          }${details.floor ? ", qavat " + details.floor : ""}${
            details.apt ? ", kv/ofis " + details.apt : ""
          }`,
          coords: { lat: place.lat, lon: place.lon },
          courierNote: details.courierNote || "",
        },
        items: items.map((i) => ({
          productId: i.product.id,
          qty: i.qty,
          options: i.options,
        })),
        meta: {
          payment: payMethod,
          promo,
          discount,
          service,
          delivery,
        },
      };
      await OrderAPI.create(payload);
      toastSuccess("Buyurtma yuborildi!");
      cart.clear();
    } catch (e) {}
  };

  return (
    <section className="page has-paybar checkout">
      <div
        className="container checkout-grid"
        style={{ display: "grid", gridTemplateColumns: "1.4fr .9fr", gap: 18 }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Savat preview */}
          <div className="checkout-card card" style={{ padding: 14 }}>
            <h3 className="checkout-card__title" style={{ fontWeight: 900 }}>
              Savat
            </h3>
            <div className="summary-list" style={{ display: "grid", gap: 10 }}>
              {items.map((it, idx) => {
                const lineTotal = cart.lineTotal(idx);
                return (
                  <div
                    key={idx}
                    className="summary-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>{it.product?.name}</div>
                      <small
                        className="checkout-card__muted"
                        style={{ color: "var(--muted)" }}
                      >
                        {(
                          Number(it.product?.price) + (it.priceDelta || 0)
                        ).toLocaleString()}{" "}
                        so‘m • {it.qty} dona
                      </small>
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      {lineTotal.toLocaleString()} so‘m
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div style={{ color: "var(--muted)", fontSize: 14 }}>
                  Savat bo‘sh
                </div>
              )}
            </div>
          </div>

          {/* Restoran uchun izoh */}
          <div className="checkout-card card" style={{ padding: 14 }}>
            <h3 className="checkout-card__title" style={{ fontWeight: 900 }}>
              Restoran uchun izoh
            </h3>
            <textarea
              className="field field--long"
              placeholder="Izoh yozing..."
              value={cart.note}
              onChange={(e) => cart.setNote(e.target.value)}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 12,
                background: "var(--surface)",
                minHeight: 90,
              }}
            />
          </div>

          {/* Manzil */}
          <div className="checkout-card card" style={{ padding: 14 }}>
            <h3 className="checkout-card__title" style={{ fontWeight: 900 }}>
              Manzil
            </h3>
            <div
              className="checkout-card__muted"
              style={{ marginBottom: 10, color: "var(--muted)" }}
            >
              {place ? place.label : "Manzil tanlanmagan"}
            </div>
            <div
              className="field-row"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
              }}
            >
              <input
                className="field"
                placeholder="Pod’ezd"
                value={details.entrance}
                onChange={(e) => setDetails({ entrance: e.target.value })}
                style={fieldStyle}
              />
              <input
                className="field"
                placeholder="Qavat"
                value={details.floor}
                onChange={(e) => setDetails({ floor: e.target.value })}
                style={fieldStyle}
              />
              <input
                className="field"
                placeholder="Kv/Ofis"
                value={details.apt}
                onChange={(e) => setDetails({ apt: e.target.value })}
                style={fieldStyle}
              />
            </div>
            <textarea
              className="field field--long"
              placeholder="Kuryer uchun izoh"
              value={details.courierNote}
              onChange={(e) => setDetails({ courierNote: e.target.value })}
              style={{ ...fieldStyle, marginTop: 10, minHeight: 80 }}
            />
            <div style={{ marginTop: 10 }}>
              <Button className="btn--primary" onClick={() => setGeoOpen(true)}>
                Kartadan tanlash
              </Button>
            </div>
          </div>

          {/* Promo-kod */}
          <div className="checkout-card card" style={{ padding: 14 }}>
            <h3 className="checkout-card__title" style={{ fontWeight: 900 }}>
              Promo-kod
            </h3>
            <PromoRow value={promo} onApply={setPromo} />
            {promoDiscount > 0 && (
              <div style={{ color: "#8b5cff", fontWeight: 700, marginTop: 6 }}>
                TEZ3 qo‘llandi: −{promoDiscount.toLocaleString()} so‘m
              </div>
            )}
          </div>

          {/* To'lov usuli (custom sample style) */}
          <div className="checkout-card card" style={{ padding: 14 }}>
            <h3 className="checkout-card__title" style={{ fontWeight: 900 }}>
              To‘lov usuli
            </h3>
            <div className="paytype" style={{ display: "grid", gap: 12 }}>
              <button
                type="button"
                className={`radio-card ${
                  payMethod === "card" ? "is-active" : ""
                }`}
                onClick={() => setPayMethod("card")}
                style={radioStyle(payMethod === "card")}
              >
                <div>
                  <div
                    className="radio-card__title"
                    style={{ fontWeight: 800 }}
                  >
                    Karta orqali
                  </div>
                  <div
                    className="radio-card__sub"
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 4,
                    }}
                  >
                    Uzcard, Humo, Visa, MasterCard
                  </div>
                </div>
                <span className="discount-pill" style={discountPillStyle}>
                  -{CARD_DISCOUNT.toLocaleString()} so‘m
                </span>
              </button>

              <button
                type="button"
                className={`radio-card ${
                  payMethod === "cash" ? "is-active" : ""
                }`}
                onClick={() => setPayMethod("cash")}
                style={radioStyle(payMethod === "cash")}
                disabled
              >
                <div>
                  <div
                    className="radio-card__title"
                    style={{ fontWeight: 800 }}
                  >
                    Naqd to‘lov
                  </div>
                  <div
                    className="radio-card__sub"
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 4,
                    }}
                  >
                    Tez orada
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right" style={{ display: "grid", gap: 16 }}>
          <div className="summary summary-card card" style={{ padding: 16 }}>
            <div className="summary-list" style={{ display: "grid", gap: 6 }}>
              <SummaryRow label="Buyurtma" value={subtotal} muted />
              {discount > 0 && (
                <SummaryRow label="Chegirma" value={-discount} accent />
              )}
              <SummaryRow label="Xizmat haqi" value={service} muted />
              <SummaryRow label="Jami" value={total} total />
            </div>
          </div>
          <div className="info-card card" style={{ padding: 14 }}>
            <strong style={{ fontWeight: 900 }}>Buyurtma haqida</strong>
            <div
              className="checkout-card__muted"
              style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}
            >
              Mahsulotlar soni: {items.reduce((s, i) => s + i.qty, 0)}
            </div>
          </div>
        </div>
      </div>

      {/* PAYBAR */}
      <div
        className="paybar"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          background: "#fff",
          borderTop: "1px solid var(--line)",
          padding: "10px 16px",
        }}
      >
        <div
          className="paybar__inner"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 960,
            margin: "0 auto",
          }}
        >
          <div style={{ fontWeight: 800 }}>
            Jami:&nbsp; {total.toLocaleString()} so‘m
          </div>
          <Button className="paybar__btn btn--primary" onClick={submit}>
            To‘lash
          </Button>
        </div>
      </div>
      <GeoPicker open={geoOpen} onClose={() => setGeoOpen(false)} />
    </section>
  );
}

// Styles helpers & small components
const fieldStyle = {
  border: "1px solid var(--line)",
  borderRadius: 14,
  padding: "12px 14px",
  background: "var(--surface)",
};

function radioStyle(active) {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
    padding: 14,
    border: `2px solid ${active ? "var(--brand)" : "var(--line)"}`,
    background: "var(--surface)",
    borderRadius: 16,
    cursor: "pointer",
  };
}
const discountPillStyle = {
  fontSize: 12,
  color: "#ff3db0",
  border: "1px solid #ffd3f0",
  padding: "2px 8px",
  borderRadius: 9999,
};

function SummaryRow({ label, value, muted, accent, total }) {
  const negative = value < 0;
  return (
    <div
      className={`summary-row ${muted ? "summary-row--muted" : ""} ${
        total ? "summary-row--total" : ""
      }`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontWeight: total ? 900 : 700,
      }}
    >
      <div
        style={{
          color: accent ? "#8b5cff" : muted ? "var(--muted)" : "inherit",
        }}
      >
        {label}
      </div>
      <div
        style={{ color: accent ? "#8b5cff" : negative ? "#8b5cff" : "inherit" }}
      >
        {negative ? "-" : ""}
        {Math.abs(value).toLocaleString()} so‘m
      </div>
    </div>
  );
}
