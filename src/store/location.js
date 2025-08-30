import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const initialState = {
  address: "",
  coords: null, // { lat, lng } | null
  city: "",
  zoom: 15,
};

const impl = (set) => ({
  ...initialState,
  setAddress: (address) => set({ address }),
  setCoords: (coords) => set({ coords }),
  setCity: (city) => set({ city }),
  setZoom: (zoom) => set({ zoom }),
  clearLocation: () => set({ ...initialState }),
});

export const useLocation = create(
  persist(impl, {
    name: "uzd_loc_v1",
    storage: createJSONStorage(() => localStorage),
    partialize: (s) => ({
      address: s.address,
      coords: s.coords,
      city: s.city,
      zoom: s.zoom,
    }),
  })
);

// ALIAS: eski kodlarda bo'lgan nomni ham qo'llab-quvvatlaymiz
export const useLocationStore = useLocation;
