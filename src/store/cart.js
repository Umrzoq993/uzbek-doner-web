import { create } from "zustand";

const persistKey = "uzd_cart_v2";
const initial = { items: [], branchId: null, note: "" };

function priceDeltaOf(options) {
  if (!options) return 0;
  let d = 0;
  if (Array.isArray(options.extras))
    for (const ex of options.extras) d += Number(ex?.price || 0);
  if (options.size?.price) d += Number(options.size.price);
  if (options._priceDelta) d += Number(options._priceDelta);
  return d;
}
function hydrate() {
  try {
    return JSON.parse(localStorage.getItem(persistKey)) || initial;
  } catch {
    return initial;
  }
}
function persist(state) {
  const s = { items: state.items, branchId: state.branchId, note: state.note };
  localStorage.setItem(persistKey, JSON.stringify(s));
}

export const useCart = create((set, get) => ({
  ...hydrate(),

  add: (product, qty = 1, options = null) => {
    const key = JSON.stringify(options || {});
    const items = get().items.slice();
    const idx = items.findIndex(
      (i) =>
        i.product.id === product.id && JSON.stringify(i.options || {}) === key
    );
    const priceDelta = priceDeltaOf(options);
    if (idx >= 0) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    else items.push({ product, qty, options, priceDelta });
    set({ items });
    persist(get());
  },
  remove: (idx) => {
    const items = get().items.filter((_, i) => i !== idx);
    set({ items });
    persist(get());
  },
  setQty: (idx, qty) => {
    const items = get().items.slice();
    items[idx] = { ...items[idx], qty: Math.max(1, qty) };
    set({ items });
    persist(get());
  },

  clear: () => {
    set({ ...initial });
    localStorage.removeItem(persistKey);
  },
  setNote: (note) => {
    set({ note });
    persist(get());
  },
  setBranch: (branchId) => {
    set({ branchId });
    persist(get());
  },

  lineTotal: (idx) => {
    const i = get().items[idx];
    if (!i) return 0;
    return (Number(i.product.price) + (i.priceDelta || 0)) * Number(i.qty);
  },
  total: () => get().items.reduce((s, _, i) => s + get().lineTotal(i), 0),
}));
