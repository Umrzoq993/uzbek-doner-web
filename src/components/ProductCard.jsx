function ProductCard({ product, onAdd, onOpen }) {
  const [imgSrc, setImgSrc] = useState(product.imageUrl || noImage);

  const discounted = Number(product.discount || 0) > 0;
  const oldPrice = product.oldPrice;
  const unitPrice = discounted
    ? Math.round(Number(product.price) * (1 - Number(product.discount) / 100))
    : Number(product.price);

  return (
    <div
      className="card"
      onClick={onOpen}
      role="button"
      style={{
        padding: 0,
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "160px 1fr",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={imgSrc}
          alt={product.name}
          onError={() => setImgSrc(noImage)}
          style={{
            width: "100%",
            height: 160,
            objectFit: "cover",
            display: "block",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,.35) 100%)",
          }}
        />
        {discounted && (
          <div className="ribbon ribbon--sale" style={{ left: 10, top: 10 }}>
            -{Number(product.discount)}%
          </div>
        )}
      </div>

      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 900 }}>{product.name}</div>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          {product.description || " "}
        </div>

        <div
          style={{
            marginTop: 2,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontWeight: 900 }}>{fmt(unitPrice)}</div>
            {oldPrice && (
              <div
                style={{
                  color: "var(--muted)",
                  textDecoration: "line-through",
                  fontSize: 13,
                }}
              >
                {fmt(oldPrice)}
              </div>
            )}
          </div>
          <Button
            className="btn--primary"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
          >
            Qo‘shish
          </Button>
        </div>
      </div>
    </div>
  );
}
