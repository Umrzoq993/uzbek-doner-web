// src/store/location.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Qulay default holat
const initialState = {
  address: "", // ko'rsatiladigan matn (manzil)
  coords: null, // { lat: number, lng: number } yoki null
  city: "", // ixtiyoriy
  zoom: 15, // xarita uchun default zoom
};

const _impl = (set, get) => ({
  ...initialState,

  setAddress: (address) => set({ address }),
  setCoords: (coords) => set({ coords }),
  setCity: (city) => set({ city }),
  setZoom: (zoom) => set({ zoom }),

  clearLocation: () => set({ ...initialState }),
});

// Asosiy hook
export const useLocation = create(
  persist(_impl, {
    name: "uzd_loc_v1",
    storage: createJSONStorage(() => localStorage),
    // faqat keraklilarni persist qilamiz
    partialize: (s) => ({
      address: s.address,
      coords: s.coords,
      city: s.city,
      zoom: s.zoom,
    }),
  })
);

// Alias — eski kodlarda `useLocationStore` nomi ishlagan bo'lsa ham ishlasin
export const useLocationStore = useLocation;
