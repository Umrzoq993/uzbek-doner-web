import { useEffect, useMemo, useRef, useState } from "react";
import HeroCarousel from "../components/HeroCarousel";
import ProductSheet from "../components/ProductSheet";
import { MenuAPI } from "../lib/api";
import { useCart } from "../store/cart";
import Button from "../components/ui/Button";
import Img from "../components/Img";
import heroSlides from "../data/heroSlides";
import { useT, useMoneyFormatter } from "../i18n/i18n";
import { useLangStore } from "../store/lang";
import { useLocationStore } from "../store/location";

// money formatting now localized
// const fmt = (n) => Number(n || 0).toLocaleString("uz-UZ") + " so‘m";
const BATCH_SIZE = 2;
const STICKY_OFFSET = 90;

export default function Home() {
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  useMoneyFormatter(); // ensure money formatter initialized
  const [cats, setCats] = useState([]);
  const [visibleIds, setVisibleIds] = useState([]);
  const nextIndexRef = useRef(0);

  const [prodMap, setProdMap] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const [activeCatId, setActiveCatId] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [showTop, setShowTop] = useState(false);

  const cart = useCart();
  const place = useLocationStore((s) => s.place);
  const availability = useLocationStore((s) => s.availability);
  const setOpenPicker = useLocationStore((s) => s.setOpenPicker);

  const sectionRefs = useRef({});
  const catBtnRefs = useRef({});
  const loadMoreRef = useRef(null);
  const scrollingByClickRef = useRef(false);

  // Catbar sliding indikator
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

  // 1) Kategoriyalar
  useEffect(() => {
    (async () => {
      try {
        const list = await MenuAPI.categories();
        setCats(list);
        const first = list.slice(0, BATCH_SIZE).map((c) => c.id);
        setVisibleIds(first);
        nextIndexRef.current = BATCH_SIZE;
        setActiveCatId(first[0] || null);
        requestAnimationFrame(() => moveIndicatorTo(first[0]));
      } catch {
        /* ignore */
      }
    })();
  }, []);

  // 2) Ko‘rinayotgan kategoriyalar mahsulotlari
  useEffect(() => {
    visibleIds.forEach((catId) => {
      if (prodMap[catId] || loadingMap[catId]) return;
      setLoadingMap((m) => ({ ...m, [catId]: true }));
      MenuAPI.productsByCategory(catId)
        .then((list) => setProdMap((m) => ({ ...m, [catId]: list })))
        .finally(() => setLoadingMap((m) => ({ ...m, [catId]: false })));
    });
  }, [visibleIds, prodMap, loadingMap]);

  // 3) Infinite load
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

  // 4) Chipga bosilganda scroll
  const scrollToSection = (catId) => {
    let el = sectionRefs.current[catId];

    if (!el) {
      setVisibleIds((prev) => (prev.includes(catId) ? prev : [...prev, catId]));
      scrollingByClickRef.current = true;
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

    scrollingByClickRef.current = true;
    const y = el.getBoundingClientRect().top + window.scrollY - STICKY_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
    setActiveCatId(catId);
    moveIndicatorTo(catId);
    setTimeout(() => (scrollingByClickRef.current = false), 600);
  };

  // 5) Aktiv seksiyani kuzatish
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

  // 6) Aktiv chipni ko‘rinishga olib kelish
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

  // 7) Tepaga qaytish tugmasi
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const slides = useMemo(
    () =>
      heroSlides.map((s) => ({
        image: s.image,
        title:
          lang === "ru" ? s.title_ru || s.title_uz : s.title_uz || s.title_ru,
        subtitle:
          lang === "ru"
            ? s.subtitle_ru || s.subtitle_uz
            : s.subtitle_uz || s.subtitle_ru,
      })),
    [lang]
  );

  // 🧺 Cart bilan qty sinxron (store v2: item.id = product.id)
  const qtyMap = useMemo(() => {
    const m = new Map();
    for (const it of cart.items) {
      const id = it.id;
      if (id == null) continue;
      m.set(id, (m.get(id) || 0) + (it.qty || 0));
    }
    return m;
  }, [cart.items]);

  const addToCart = (p, qty = 1) => cart.add(p, qty);
  const inc = (p) => cart.inc(p.id);
  const dec = (p) => cart.dec(p.id);

  const blocked = !place || (availability?.checked && !availability?.available);

  return (
    <section className="page">
      {/* Hero */}
      <HeroCarousel slides={slides} height={360} auto delay={5000} />

      {/* Sticky kategoriya chips + indikator */}
      <nav
        className="catbar"
        style={
          blocked
            ? {
                filter: "blur(4px)",
                pointerEvents: "none",
                userSelect: "none",
                opacity: 0.5,
              }
            : undefined
        }
      >
        <div
          className="catbar__inner no-scrollbar"
          ref={catbarInnerRef}
          style={{ position: "relative" }}
        >
          <div className="catbar__indicator" />
          {cats.map((c) => {
            const label =
              lang === "ru" ? c.name_ru || c.name : c.name_uz || c.name;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  catBtnRefs.current[c.id] = el;
                  chipRefs.current[c.id] = el;
                }}
                className={`chip ${c.id === activeCatId ? "is-active" : ""}`}
                onClick={() => scrollToSection(c.id)}
                onPointerUp={(e) => {
                  if (e.pointerType && e.pointerType !== "mouse") {
                    scrollToSection(c.id);
                  }
                }}
                title={label}
              >
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Seksiyalar */}
      <div
        className="container"
        style={{ display: "grid", gap: 22, position: "relative" }}
      >
        {blocked && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 32,
              textAlign: "center",
              gap: 16,
              background:
                "linear-gradient(to bottom, rgba(10,14,25,0.92), rgba(10,14,25,0.92))",
              zIndex: 10,
              borderRadius: 24,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3 }}>
              {place
                ? lang === "ru"
                  ? "По этому адресу доставка недоступна. Приносим извинения за неудобства."
                  : "Ushbu manzilga yetkazib berish mavjud emas. Noqulayliklar uchun uzr so'raymiz."
                : lang === "ru"
                ? "Сначала выберите адрес"
                : "Avval manzilni tanlang"}
            </div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>
              {place
                ? lang === "ru"
                  ? "Пожалуйста, попробуйте указать другой адрес поблизости"
                  : "Iltimos, yaqin atrofdagi boshqa manzilni sinab ko'ring"
                : t("common:select_address_help")}
            </div>
            <button
              onClick={() => setOpenPicker(true)}
              style={{
                background: "var(--primary, #2563eb)",
                color: "#fff",
                padding: "12px 22px",
                borderRadius: 999,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px -2px rgba(0,0,0,0.4)",
              }}
            >
              {place
                ? lang === "ru"
                  ? "Изменить адрес"
                  : "Manzilni o'zgartirish"
                : t("common:select_address_button")}
            </button>
          </div>
        )}
        {!blocked &&
          visibleIds.map((catId) => {
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
                    {lang === "ru"
                      ? cat?.name_ru || cat?.name || t("common:category")
                      : cat?.name_uz || cat?.name || t("common:category")}
                  </h2>
                </div>

                <div
                  className="grid"
                  style={{
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(240px, 1fr))",
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
                            lang={lang}
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
      {!blocked && (
        <ProductSheet
          open={!!chosen}
          product={chosen}
          onClose={() => setChosen(null)}
          onAdd={(qty) => {
            if (chosen) addToCart(chosen, qty);
            setChosen(null);
          }}
        />
      )}

      {/* Tepaga qaytish */}
      {!blocked && showTop && (
        <button
          className="scrolltop"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t("common:back_to_top")}
        >
          ↑
        </button>
      )}
    </section>
  );
}

/* --- Ichki komponentlar --- */

function ProductCard({ product, qty, onAdd, onInc, onDec, onOpen, lang }) {
  const t = useT();
  const fmtMoney = useMoneyFormatter();
  const hasQty = qty > 0;
  const numRef = useRef(null);

  // qty o‘zgarganda “pop” anim
  useEffect(() => {
    const n = numRef.current;
    if (!n) return;
    n.classList.remove("is-pop");
    void n.offsetWidth;
    n.classList.add("is-pop");
  }, [qty]);

  return (
    <div className="card product-card" onClick={onOpen} role="button">
      <div className="product-card__media">
        <Img
          src={product.imageUrl}
          alt={
            lang === "ru"
              ? product.name_ru || product.name
              : product.name_uz || product.name
          }
        />
      </div>

      <div className="product-card__body">
        <div className="product-card__title clamp-2">
          {lang === "ru"
            ? product.name_ru || product.name
            : product.name_uz || product.name}
        </div>

        <div className="product-card__footer">
          <div className="product-card__price">
            {fmtMoney(product.price || 0)}
          </div>

          {hasQty ? (
            <div className="qty-chip" onClick={(e) => e.stopPropagation()}>
              <button
                className="qty-chip__btn"
                aria-label={t("common:decrease")}
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
                aria-label={t("common:increase")}
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
              {t("common:add")}
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
