// src/store/cart.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ---------- Normalizatorlar (APIga mos) ---------- */
const text = (v) => (v == null ? "" : String(v));

const idOf = (it) =>
  it?.id ??
  it?._id ??
  it?.product_id ??
  it?.iiko_product_id ??
  it?.sku ??
  it?.slug ??
  it?.code ??
  it?.uuid ??
  null;

const numeric = (v) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const titleOf = (it) =>
  it?.title ??
  it?.name ??
  it?.name_uz ??
  it?.name_ru ??
  it?.product?.title ??
  it?.product?.name ??
  it?.product?.name_uz ??
  it?.product?.name_ru ??
  "Mahsulot";

const priceOf = (it) =>
  numeric(
    it?.price ??
      it?.priceUZS ??
      it?.amount ??
      it?.cost ??
      it?.sum ??
      it?.product?.price ??
      it?.product?.amount ??
      0
  );

const imageOf = (it) =>
  it?.img ??
  it?.image ??
  it?.photo?._url ??
  it?.images?.[0] ??
  it?.product?.image ??
  it?.product?.photo?._url ??
  null;

const normalize = (p, extra = {}) => {
  const id = idOf(p);
  return {
    id,
    title: titleOf(p),
    price: priceOf(p),
    img: imageOf(p),
    qty: 1,
    raw: p,
    ...extra,
  };
};

/* ---------- Store ---------- */
export const useCart = create(
  persist(
    (set, get) => ({
      items: [],

      /* Core actions */
      add: (product, qty = 1) => {
        const id = idOf(product);
        if (id == null) return;
        const items = [...get().items];
        const idx = items.findIndex((x) => x.id === id);
        if (idx > -1) {
          items[idx] = { ...items[idx], qty: (items[idx].qty || 0) + qty };
        } else {
          items.push(normalize(product, { qty: Math.max(1, qty) }));
        }
        set({ items });
      },

      inc: (idOrItem) => {
        const id = idOf(idOrItem) ?? idOrItem;
        const items = get().items.map((x) =>
          x.id === id ? { ...x, qty: (x.qty || 0) + 1 } : x
        );
        set({ items });
      },

      dec: (idOrItem) => {
        const id = idOf(idOrItem) ?? idOrItem;
        const items = get()
          .items.map((x) => (x.id === id ? { ...x, qty: (x.qty || 0) - 1 } : x))
          .filter((x) => (x.qty || 0) > 0);
        set({ items });
      },

      remove: (idOrItem) => {
        const id = idOf(idOrItem) ?? idOrItem;
        set({ items: get().items.filter((x) => x.id !== id) });
      },

      clear: () => set({ items: [] }),

      setQty: (idOrItem, qty) => {
        const id = idOf(idOrItem) ?? idOrItem;
        const n = Math.max(0, Number(qty || 0));
        let items = get().items.map((x) =>
          x.id === id ? { ...x, qty: n } : x
        );
        if (n === 0) items = items.filter((x) => x.id !== id);
        set({ items });
      },

      /* Aliases (moslik uchun) */
      addToCart: (p, q) => get().add(p, q),
      increment: (x) => get().inc(x),
      decrease: (x) => get().dec(x),
      decrement: (x) => get().dec(x),
      deleteItem: (x) => get().remove(x),
      removeFromCart: (x) => get().remove(x),
      clearCart: () => get().clear(),
    }),
    {
      name: "ud_cart_v2",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (state) => {
        // eski saqlangan formatni normalize qilib olamiz
        if (!state || !Array.isArray(state.items)) return { items: [] };
        return {
          ...state,
          items: state.items
            .map((x) =>
              normalize(x.raw ? x.raw : x, { qty: x.qty == null ? 1 : x.qty })
            )
            .filter((x) => x.id != null),
        };
      },
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export default useCart;
