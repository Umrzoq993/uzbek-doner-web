import Img from "./Img";
export default function ProductSmallCard({ product, onAdd }) {
  return (
    <div
      style={{
        width: 180,
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: 18,
        boxShadow: "var(--shadow-1)",
        overflow: "hidden",
      }}
    >
      <div style={{ aspectRatio: "1/1", background: "var(--surface-2)" }}>
        <Img src={product.imageUrl} alt={product.name} />
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 800 }}>
          {product.price.toLocaleString()} so‘m
        </div>
        <div style={{ color: "var(--muted)", fontSize: 13, minHeight: 38 }}>
          {product.name}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="fab"
            style={{ position: "static", width: 38, height: 38, fontSize: 20 }}
            onClick={onAdd}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
