export default function BillCard({
  itemsTotal = 0,
  discount = 0,
  delivery = 0,
  service = 0,
}) {
  const payable = Math.max(0, itemsTotal - discount + delivery + service);
  return (
    <div
      style={{
        background: "linear-gradient(180deg, #f7f4ff, #fff)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 8 }}>To‘lov uchun</div>
      <Row k="Buyurtma" v={itemsTotal} />
      {discount > 0 && <Row k="Chegirma" v={-discount} accent />}
      {delivery > 0 && <Row k="Yetkazib berish" v={delivery} />}
      {service > 0 && <Row k="Xizmat haqi" v={service} />}
      <div style={{ height: 8 }} />
      <Row k={<b>Jami</b>} v={payable} bold />
    </div>
  );
}
function Row({ k, v, accent, bold }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        margin: "6px 0",
      }}
    >
      <div
        style={{
          color: accent ? "#8b5cff" : "inherit",
          fontWeight: bold ? 900 : 700,
        }}
      >
        {k}
      </div>
      <div
        style={{
          fontWeight: bold ? 900 : 700,
          color: accent ? "#8b5cff" : "inherit",
        }}
      >
        {v >= 0 ? v.toLocaleString() : `-${Math.abs(v).toLocaleString()}`} so‘m
      </div>
    </div>
  );
}
