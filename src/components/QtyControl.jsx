import { useEffect, useRef } from "react";

/*
  QtyControl
  Props:
    value (number) - current quantity (0 => not added yet)
    min (number) - minimum quantity shown (default 1)
    max (number|undefined) - optional max limit
    onAdd() - called when Add button clicked (should set qty = min)
    onInc() - increment callback
    onDec() - decrement callback (should not drop below min, if reaches 0 parent should treat as removed)
    variant ('lg'|'sm') - style size (maps to .qty-chip--lg)
    addLabel (string) - text for Add button
    price (number|undefined) - optional price to show (not used yet, reserved)
    className (string) - extra wrapper classes
*/
export default function QtyControl({
  value = 0,
  // min removed (was unused after UX change; assumed 1)
  max,
  onAdd,
  onInc,
  onDec,
  variant = "lg",
  addLabel = "Qo‘shish",
  className = "",
}) {
  const numRef = useRef(null);
  const firstShownRef = useRef(false);

  // Pop/pulse animation on qty change
  useEffect(() => {
    if (value <= 0) return;
    const el = numRef.current;
    if (!el) return;
    el.classList.remove("is-pulse");
    void el.offsetWidth; // reflow
    el.classList.add("is-pulse");
  }, [value]);

  // Enter animation when first appears
  useEffect(() => {
    if (value > 0 && !firstShownRef.current) {
      firstShownRef.current = true;
      const wrap = numRef.current?.closest(".qty-chip");
      if (wrap) {
        wrap.classList.add("is-enter");
        setTimeout(() => wrap.classList.remove("is-enter"), 400);
      }
    }
  }, [value]);

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const span = document.createElement("span");
    span.className = "qty-ripple";
    span.style.width = span.style.height = size + "px";
    span.style.left = x + "px";
    span.style.top = y + "px";
    btn.appendChild(span);
    setTimeout(() => span.remove(), 500);
  };

  if (value <= 0) {
    return (
      <button
        className={`btn btn--primary add-btn-transition ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          if (onAdd) onAdd();
        }}
      >
        {addLabel}
      </button>
    );
  }

  // atMin (removed as unused)
  const atMax = max != null && value >= max;

  // Dynamic accessible enlargement: if user has already increased (>=2) we can switch to xlg visual size
  const dynamicVariant = value >= 2 && variant === "lg" ? "xlg" : variant;

  return (
    <div
      className={`qty-chip ${dynamicVariant === "lg" ? "qty-chip--lg" : ""} ${
        dynamicVariant === "xlg" ? "qty-chip--xlg" : ""
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
      aria-label="Miqdor boshqaruvi"
      data-variant={dynamicVariant}
    >
      <button
        className="qty-chip__btn"
        aria-label="Kamaytirish"
        onClick={(e) => {
          e.stopPropagation();
          handleRipple(e);
          // atMin bo'lsa ham 0 ga tushishga ruxsat beramiz (parent 0 bo'lsa chiqib ketadi)
          onDec && onDec();
        }}
      >
        −
      </button>
      <div ref={numRef} className="qty-chip__num" aria-live="polite">
        {value}
      </div>
      <button
        className="qty-chip__btn"
        disabled={atMax}
        aria-label="Ko‘paytirish"
        onClick={(e) => {
          e.stopPropagation();
          handleRipple(e);
          if (atMax) return;
          onInc && onInc();
        }}
      >
        +
      </button>
    </div>
  );
}
