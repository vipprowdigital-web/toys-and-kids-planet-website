import { create } from "zustand";
import type { AppConfig } from "@/types";

interface AppConfigState {
  config: AppConfig | null;
  isLoaded: boolean;
  setConfig: (config: AppConfig) => void;
}

export const useAppConfigStore = create<AppConfigState>((set) => ({
  config: null,
  isLoaded: false,
  setConfig: (config) => set({ config, isLoaded: true }),
}));
