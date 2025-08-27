import { useState } from "react";
import { useCart } from "../store/cart";
import PaymentSelector from "../components/PaymentSelector";
import PromoRow from "../components/PromoRow";
import BillCard from "../components/BillCard";
import PayBar from "../components/PayBar";
import Button from "../components/ui/Button";
import { OrderAPI } from "../lib/api";
import { toastSuccess, toastError } from "../lib/toast";
import GeoPicker from "../components/GeoPicker";
import { useLocationStore } from "../store/location";

export default function Checkout() {
  const cart = useCart();
  const itemsTotal = cart.total();

  // geo
  const place = useLocationStore((s) => s.place);
  const details = useLocationStore((s) => s.details);
  const setDetails = useLocationStore((s) => s.setDetails);

  const [geoOpen, setGeoOpen] = useState(false);
  const [payment, setPayment] = useState("card");
  const [promo, setPromo] = useState("");

  const discountByCard = payment === "card" ? 2000 : 0;
  const promoDiscount =
    promo.toUpperCase() === "TEZ3" ? Math.round(itemsTotal * 0.05) : 0;
  const delivery = 0;
  const service = 6900;
  const discount = discountByCard + promoDiscount;
  const payable = Math.max(0, itemsTotal - discount + delivery + service);

  const submit = async () => {
    if (cart.items.length === 0) return;
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
        items: cart.items.map((i) => ({
          productId: i.product.id,
          qty: i.qty,
          options: i.options,
        })),
        meta: { payment, promo, discount, service, delivery },
      };
      await OrderAPI.create(payload);
      toastSuccess("Buyurtma yuborildi!");
      cart.clear();
    } catch (e) {}
  };

  return (
    <section className="page has-paybar">
      <div
        className="container"
        style={{ display: "grid", gridTemplateColumns: "1.4fr .9fr", gap: 18 }}
      >
        {/* Chap panel */}
        <div className="card" style={{ padding: 14, display: "grid", gap: 16 }}>
          <Block title="Manzil">
            <div style={{ display: "grid", gap: 10 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>
                    {place ? place.label : "Manzil tanlanmagan"}
                  </div>
                  {place && (
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>
                      {place.city} {place.street} {place.house}
                    </div>
                  )}
                </div>
                <Button
                  className="btn--primary"
                  onClick={() => setGeoOpen(true)}
                >
                  Kartadan tanlash
                </Button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 10,
                }}
              >
                <Input
                  label="Podʼezd"
                  value={details.entrance}
                  onChange={(v) => setDetails({ entrance: v })}
                />
                <Input
                  label="Qavat"
                  value={details.floor}
                  onChange={(v) => setDetails({ floor: v })}
                />
                <Input
                  label="Kv/Ofis"
                  value={details.apt}
                  onChange={(v) => setDetails({ apt: v })}
                />
              </div>
              <Input
                label="Kuryer uchun izoh"
                value={details.courierNote}
                onChange={(v) => setDetails({ courierNote: v })}
              />
            </div>
          </Block>

          <Block title="Promo-kod">
            <PromoRow value={promo} onApply={setPromo} />
            {promoDiscount > 0 && (
              <div style={{ color: "#8b5cff", fontWeight: 700, marginTop: 6 }}>
                TEZ3 qo‘llandi: −{promoDiscount.toLocaleString()} so‘m
              </div>
            )}
          </Block>

          <Block title="To‘lov usuli">
            <PaymentSelector value={payment} onChange={setPayment} />
          </Block>
        </div>

        {/* O‘ng panel */}
        <div style={{ display: "grid", gap: 16 }}>
          <BillCard
            itemsTotal={itemsTotal}
            discount={discount}
            delivery={delivery}
            service={service}
          />
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              Buyurtma haqida
            </div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>
              Mahsulotlar soni:{" "}
              <b>{cart.items.reduce((s, i) => s + i.qty, 0)}</b>
            </div>
          </div>
        </div>
      </div>

      <PayBar label="To‘lash" amount={payable} onClick={submit} />
      <GeoPicker open={geoOpen} onClose={() => setGeoOpen(false)} />
    </section>
  );
}

function Block({ title, children }) {
  return (
    <div>
      <div style={{ fontWeight: 900, margin: "0 0 10px 2px" }}>{title}</div>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: 14,
        }}
      >
        {children}
      </div>
    </div>
  );
}
function Input({ label, value, onChange }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "12px 14px",
          background: "var(--surface)",
        }}
      />
    </label>
  );
}
