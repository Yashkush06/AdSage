import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";

interface AppStore {
  user: User | null;
  onboarded: boolean;
  setUser: (user: User) => void;
  setOnboarded: (v: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      onboarded: false,
      setUser: (user) => set({ user }),
      setOnboarded: (v) => set({ onboarded: v }),
    }),
    { name: "adsage-store" }
  )
);

// Keep useAuthStore alias so existing components don't break
export const useAuthStore = useAppStore;
