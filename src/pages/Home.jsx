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

  // Catbar sliding indikator (ixtiyoriy, bo‘lsa ishlaydi)
  const catbarInnerRef = useRef(null);
  const chipRefs = useRef({});

  const moveIndicatorTo = (catId) => {
    const inner = catbarInnerRef.current;
    const el = chipRefs.current[catId];
    if (!inner || !el) return;
    inner.style.setProperty("--ind-x", `${el.offsetLeft}px`);
    inner.style.setProperty("--ind-w", `${el.offsetWidth}px`);
    const targetLeft = Math.max(
      0,
      el.offsetLeft - (inner.clientWidth - el.offsetWidth) / 2
    );
    inner.scrollTo({ left: targetLeft, behavior: "smooth" });
  };

  // 1) kategoriyalar
  useEffect(() => {
    (async () => {
      try {
        const list = await MenuAPI.categories();
        setCats(list);
        const first = list.slice(0, BATCH_SIZE).map((c) => c.id);
        setVisibleIds(first);
        nextIndexRef.current = BATCH_SIZE;
        setActiveCatId(first[0] || null);
        // indikatorni dastlab joylashtirish
        requestAnimationFrame(() => moveIndicatorTo(first[0]));
      } catch {}
    })();
  }, []);

  // 2) ko‘rinayotgan kategoriyalar mahsulotlari
  useEffect(() => {
    visibleIds.forEach((catId) => {
      if (prodMap[catId] || loadingMap[catId]) return;
      setLoadingMap((m) => ({ ...m, [catId]: true }));
      MenuAPI.productsByCategory(catId)
        .then((list) => setProdMap((m) => ({ ...m, [catId]: list })))
        .finally(() => setLoadingMap((m) => ({ ...m, [catId]: false })));
    });
  }, [visibleIds, prodMap, loadingMap]);

  // 3) infinite load
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

  // 4) chipga bosilganda scroll
  // 4) chipga bosilganda scroll
  const scrollToSection = (catId) => {
    let el = sectionRefs.current[catId];

    // Seksiyasi hali DOMga chizilmagan bo‘lsa (lazy render) — avval ko‘rinadigan ro‘yxatga qo‘shamiz
    if (!el) {
      setVisibleIds((prev) => {
        if (prev.includes(catId)) return prev;
        return [...prev, catId]; // tartibni saqlash uchun oxiriga qo‘shish kifoya
      });

      scrollingByClickRef.current = true;

      // DOM yangilangach, shu seksiyaga smooth scroll qilamiz
      requestAnimationFrame(() => {
        const n = sectionRefs.current[catId];
        if (!n) return;
        const y =
          n.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
        window.scrollTo({ top: y, behavior: "smooth" });
        setActiveCatId(catId);
        moveIndicatorTo(catId);
        setTimeout(() => (scrollingByClickRef.current = false), 600);
      });

      return;
    }

    // Seksiyasi DOMda bo‘lsa — darhol skroll
    scrollingByClickRef.current = true;
    const y = el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveCatId(catId);
    moveIndicatorTo(catId);
    setTimeout(() => (scrollingByClickRef.current = false), 600);
  };

  // 5) aktiv seksiyani kuzatish
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
        if (catId && catId !== activeCatId) {
          setActiveCatId(catId);
          moveIndicatorTo(catId);
        }
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

  // 6) aktiv chipni ko‘rinishga olib kelish
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

  // 7) tepaga qaytish tugmasi
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const slides = useMemo(() => heroSlides, []);

  // 🧺 Cart bilan sinxron qty xaritasi
  const qtyMap = useMemo(() => {
    const m = new Map();
    for (const it of cart.items) {
      const id = it.product?.id;
      if (id == null) continue;
      m.set(id, (m.get(id) || 0) + (it.qty || 0));
    }
    return m;
  }, [cart.items]);

  const addToCart = (p, qty = 1) => cart.add(p, qty, null);

  const inc = (p) => {
    cart.add(p, 1, null);
  };
  const dec = (p) => {
    const idx = cart.items.findIndex((it) => it.product.id === p.id);
    if (idx < 0) return;
    const cur = cart.items[idx].qty;
    if (cur <= 1) cart.remove(idx);
    else cart.setQty(idx, cur - 1);
  };

  return (
    <section className="page">
      {/* Hero — umumiy bannerlar, autoplay */}
      <HeroCarousel slides={slides} height={360} auto delay={5000} />

      {/* Sticky kategoriya chips + sliding indikator */}
      <nav className="catbar">
        <div
          className="catbar__inner no-scrollbar"
          ref={catbarInnerRef}
          style={{ position: "relative" }}
        >
          <div className="catbar__indicator" />
          {cats.map((c) => (
            <button
              key={c.id}
              ref={(el) => {
                catBtnRefs.current[c.id] = el;
                chipRefs.current[c.id] = el;
              }}
              className={`chip ${c.id === activeCatId ? "is-active" : ""}`}
              onClick={() => scrollToSection(c.id)}
              onPointerUp={(e) => {
                // mobil/pen pointerlarda onClick bilan kechikish bo‘lishi mumkin — zudlik bilan ishlatamiz
                if (e.pointerType && e.pointerType !== "mouse") {
                  scrollToSection(c.id);
                }
              }}
              title={c.name}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      {/* Seksiyalar */}
      <div className="container" style={{ display: "grid", gap: 22 }}>
        {visibleIds.map((catId) => {
          const cat = cats.find((x) => x.id === catId);
          const loading = !!loadingMap[catId] && !prodMap[catId]?.length;
          const list = prodMap[catId] || [];

          return (
            <section
              key={catId}
              id={`cat-${catId}`}
              data-cat-id={catId}
              ref={(n) => (sectionRefs.current[catId] = n)}
              className="cat-section"
            >
              <div className="cat-section__head">
                <h2 className="cat-section__title">
                  {cat?.name || "Kategoriya"}
                </h2>
              </div>

              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 14,
                }}
              >
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))
                  : list.map((p) => {
                      const qty = qtyMap.get(p.id) || 0;
                      return (
                        <ProductCard
                          key={p.id}
                          product={p}
                          qty={qty}
                          onAdd={() => addToCart(p)}
                          onInc={() => inc(p)}
                          onDec={() => dec(p)}
                          onOpen={() => setChosen(p)}
                        />
                      );
                    })}
              </div>
            </section>
          );
        })}

        {/* infinite sentinel */}
        <div ref={loadMoreRef} style={{ height: 10 }} />
      </div>

      {/* Modal */}
      <ProductSheet
        open={!!chosen}
        product={chosen}
        onClose={() => setChosen(null)}
        onAdd={(qty) => {
          if (chosen) addToCart(chosen, qty);
          setChosen(null);
        }}
      />

      {/* Tepaga qaytish */}
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

/* --- Ichki komponentlar --- */

function ProductCard({ product, qty, onAdd, onInc, onDec, onOpen }) {
  const hasQty = qty > 0;
  const numRef = useRef(null);

  // 🔢 qty o‘zgarganda “pop” anim
  useEffect(() => {
    const n = numRef.current;
    if (!n) return;
    n.classList.remove("is-pop");
    void n.offsetWidth; // reflow
    n.classList.add("is-pop");
  }, [qty]);

  return (
    <div className="card product-card" onClick={onOpen} role="button">
      <div className="product-card__media">
        <Img src={product.imageUrl} alt={product.name} />
      </div>

      <div className="product-card__body">
        <div className="product-card__title clamp-2">{product.name}</div>

        <div className="product-card__footer">
          <div className="product-card__price">
            {Number(product.price || 0).toLocaleString("uz-UZ")} so‘m
          </div>

          {hasQty ? (
            <div className="qty-chip" onClick={(e) => e.stopPropagation()}>
              <button
                className="qty-chip__btn"
                aria-label="Kamaytirish"
                onClick={(e) => {
                  e.stopPropagation();
                  onDec();
                }}
              >
                −
              </button>
              <div ref={numRef} className="qty-chip__num" aria-live="polite">
                {qty}
              </div>
              <button
                className="qty-chip__btn"
                aria-label="Ko‘paytirish"
                onClick={(e) => {
                  e.stopPropagation();
                  onInc();
                }}
              >
                +
              </button>
            </div>
          ) : (
            <Button
              className="btn--primary"
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
            >
              Qo‘shish
            </Button>
          )}
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
