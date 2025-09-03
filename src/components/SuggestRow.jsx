import { useEffect, useMemo, useState } from "react";
import { MenuAPI } from "../lib/api";
import { useCart } from "../store/cart";
import { useLangStore } from "../store/lang";
import { useMoneyFormatter, useT } from "../i18n/i18n";

const NOIMG = "/src/assets/no-image.png";

export default function SuggestRow({ categoryId, limit = 6 }) {
  const { add } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const lang = useLangStore((s) => s.lang);
  const fmtMoney = useMoneyFormatter();
  useT(); // ensure i18n namespace loaded (no variable needed)

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
        <h3 className="suggest__title">
          {lang === "ru" ? "Рекомендуем" : "Tavsiya etamiz"}
        </h3>
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
                    alt={
                      lang === "ru" ? p.name_ru || p.name : p.name_uz || p.name
                    }
                    loading="lazy"
                  />
                </div>
                <div className="mini-card__body">
                  <div className="mini-card__title clamp-2">
                    {lang === "ru" ? p.name_ru || p.name : p.name_uz || p.name}
                  </div>
                  <div className="mini-card__foot">
                    <div className="mini-card__price">{fmtMoney(p.price)}</div>
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
