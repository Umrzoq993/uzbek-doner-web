import { useEffect, useMemo, useState } from "react";
import { MenuAPI } from "../lib/api";
import { useCart } from "../store/cart";

const NOIMG = "/src/assets/no-image.png";

export default function SuggestRow({ categoryId, limit = 6 }) {
  const { add } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // null bo‘lsa ham komponent “jim” ishlasin
  const cid = useMemo(() => categoryId ?? null, [categoryId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!cid) {
        setItems([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const list = await MenuAPI.productsByCategory(cid);
        if (!alive) return;
        setItems((list || []).slice(0, limit));
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [cid, limit]);

  if (!cid) return null;

  return (
    <section className="suggest">
      <div className="suggest__head">
        <h3 className="suggest__title">Nimadir esdan chiqmadimi?</h3>
      </div>

      <div className="suggest__row">
        {loading
          ? Array.from({ length: Math.min(4, limit) }).map((_, i) => (
              <div className="mini-card is-skeleton" key={i}>
                <div className="mini-card__media skeleton" />
                <div className="mini-card__body">
                  <div className="skeleton-line" style={{ width: "80%" }} />
                  <div className="skeleton-line" style={{ width: "50%" }} />
                </div>
              </div>
            ))
          : items.map((p) => (
              <div className="mini-card" key={p.id}>
                <div className="mini-card__media">
                  <img
                    src={p.imageUrl || NOIMG}
                    onError={(e) => (e.currentTarget.src = NOIMG)}
                    alt={p.name}
                    loading="lazy"
                  />
                </div>
                <div className="mini-card__body">
                  <div className="mini-card__title clamp-2">{p.name}</div>
                  <div className="mini-card__foot">
                    <div className="mini-card__price">
                      {Number(p.price || 0).toLocaleString()} so‘m
                    </div>
                    <button
                      className="btn btn--primary"
                      onClick={() => add(p, 1, null)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
