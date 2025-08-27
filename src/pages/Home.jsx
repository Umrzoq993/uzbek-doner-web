// src/pages/Home.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import HeroCarousel from "../components/HeroCarousel";
import ProductSheet from "../components/ProductSheet";
import { MenuAPI } from "../lib/api";
import { useCart } from "../store/cart";
import Button from "../components/ui/Button";
import Img from "../components/Img";
import heroSlides from "../data/heroSlides";

const fmt = (n) => Number(n || 0).toLocaleString("uz-UZ") + " so‘m";
const BATCH_SIZE = 2;
const STICKY_OFFSET = 90;

export default function Home() {
  const [cats, setCats] = useState([]);
  const [visibleIds, setVisibleIds] = useState([]);
  const nextIndexRef = useRef(0);

  const [prodMap, setProdMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const [activeCatId, setActiveCatId] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [showTop, setShowTop] = useState(false);

  const cart = useCart();

  const sectionRefs = useRef({});
  const catBtnRefs = useRef({});
  const loadMoreRef = useRef(null);
  const scrollingByClickRef = useRef(false);

  // kategoriyalar
  useEffect(() => {
    (async () => {
      try {
        const list = await MenuAPI.categories();
        setCats(list);
        const first = list.slice(0, BATCH_SIZE).map((c) => c.id);
        setVisibleIds(first);
        nextIndexRef.current = BATCH_SIZE;
        setActiveCatId(first[0] || null);
      } catch {}
    })();
  }, []);

  // ko‘rinayotgan kategoriyalar mahsulotlari
  useEffect(() => {
    visibleIds.forEach((catId) => {
      if (prodMap[catId] || loadingMap[catId]) return;
      setLoadingMap((m) => ({ ...m, [catId]: true }));
      MenuAPI.productsByCategory(catId)
        .then((list) => setProdMap((m) => ({ ...m, [catId]: list })))
        .finally(() => setLoadingMap((m) => ({ ...m, [catId]: false })));
    });
  }, [visibleIds, prodMap, loadingMap]);

  // infinite load
  useEffect(() => {
    if (!cats.length) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        const start = nextIndexRef.current;
        if (start >= cats.length) return;
        const next = cats.slice(start, start + BATCH_SIZE).map((c) => c.id);
        if (next.length) {
          setVisibleIds((v) => [...v, ...next]);
          nextIndexRef.current = start + BATCH_SIZE;
        }
      },
      { rootMargin: "1200px 0px 1200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cats]);

  // chipga bosilganda scroll
  const scrollToSection = (catId) => {
    const el = sectionRefs.current[catId];
    if (!el) return;
    scrollingByClickRef.current = true;
    const y = el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveCatId(catId);
    setTimeout(() => (scrollingByClickRef.current = false), 600);
  };

  // aktiv seksiyani kuzatish
  useEffect(() => {
    const ids = visibleIds;
    if (!ids.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (scrollingByClickRef.current) return;
        const topEntry = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top)
          )[0];
        if (!topEntry) return;
        const catId = Number(topEntry.target.getAttribute("data-cat-id"));
        if (catId && catId !== activeCatId) setActiveCatId(catId);
      },
      {
        rootMargin: `-${STICKY_OFFSET + 20}px 0px -70% 0px`,
        threshold: [0, 0.2, 0.6, 1],
      }
    );
    ids.forEach((id) => {
      const el = sectionRefs.current[id];
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [visibleIds, activeCatId]);

  // aktiv chipni markazga keltirish
  useEffect(() => {
    const btn = catBtnRefs.current[activeCatId];
    if (btn?.scrollIntoView) {
      btn.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeCatId]);

  // tepaga qaytish tugmasi
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const slides = useMemo(() => heroSlides, []);
  const addToCart = (p, qty = 1) => cart.add(p, qty, null);

  return (
    <section className="page">
      <HeroCarousel slides={slides} height={360} auto delay={5000} />

      <nav className="catbar">
        <div className="catbar__inner">
          {cats.map((c) => (
            <button
              key={c.id}
              ref={(el) => (catBtnRefs.current[c.id] = el)}
              className={`chip ${c.id === activeCatId ? "is-active" : ""}`}
              onClick={() => scrollToSection(c.id)}
              title={c.name}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="container" style={{ display: "grid", gap: 22 }}>
        {visibleIds.map((catId) => {
          const cat = cats.find((x) => x.id === catId);
          const loading = !!loadingMap[catId] && !prodMap[catId]?.length;
          const list = prodMap[catId] || [];

          return (
            <section
              key={catId}
              data-cat-id={catId}
              ref={(n) => (sectionRefs.current[catId] = n)}
              className="cat-section"
            >
              <div className="cat-section__head">
                <h2 className="cat-section__title">
                  {cat?.name || "Kategoriya"}
                </h2>
              </div>

              <div className="grid" style={{ gap: 14 }}>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  : list.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onAdd={() => addToCart(p)}
                        onOpen={() => setChosen(p)}
                      />
                    ))}
              </div>
            </section>
          );
        })}
        <div ref={loadMoreRef} style={{ height: 10 }} />
      </div>

      <ProductSheet
        open={!!chosen}
        product={chosen}
        onClose={() => setChosen(null)}
        onAdd={(qty) => {
          if (chosen) addToCart(chosen, qty);
          setChosen(null);
        }}
      />

      {showTop && (
        <button
          className="scrolltop"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Tepaga qaytish"
        >
          ↑
        </button>
      )}
    </section>
  );
}

/* --- ichki --- */
function ProductCard({ product, onAdd, onOpen }) {
  return (
    <div className="card product-card" onClick={onOpen} role="button">
      <div className="product-card__media">
        <Img src={product.imageUrl} alt={product.name} />
      </div>

      <div className="product-card__body">
        <div className="product-card__title clamp-2">{product.name}</div>
        <div className="product-card__footer">
          <div className="product-card__price">{fmt(product.price)}</div>
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

function SkeletonCard() {
  return (
    <div className="card product-card">
      <div className="product-card__media skeleton" />
      <div className="product-card__body">
        <div className="skeleton-line" style={{ width: "80%" }} />
        <div className="product-card__footer">
          <div className="skeleton-line" style={{ width: 80 }} />
          <div className="skeleton-line" style={{ width: 90 }} />
        </div>
      </div>
    </div>
  );
}
