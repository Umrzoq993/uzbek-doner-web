import { create } from "zustand";
export const useSession = create(() => ({
  // Brauzer login bo'lsa token shu yerda saqlanadi (TWA’da kerak emas)
  token: null,
}));
