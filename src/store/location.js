import { create } from "zustand";

const key = "uzd_location_v1";
function restore() {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
}

export const useLocationStore = create((set, get) => ({
  // {label, lat, lon, city, street, house}
  place: restore(),
  details: { entrance: "", floor: "", apt: "", courierNote: "" },

  setPlace: (place) => {
    set({ place });
    localStorage.setItem(key, JSON.stringify(place));
  },
  clearPlace: () => {
    set({ place: null });
    localStorage.removeItem(key);
  },

  setDetails: (patch) => set({ details: { ...get().details, ...patch } }),
  resetDetails: () =>
    set({ details: { entrance: "", floor: "", apt: "", courierNote: "" } }),
}));

// ✅ Alias va default eksport: import nomi adashsa ham ishlaydi.
export const useLocation = useLocationStore;
export default useLocationStore;
