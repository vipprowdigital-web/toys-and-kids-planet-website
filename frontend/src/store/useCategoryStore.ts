import { create } from "zustand";
import type { ProductCategory } from "@/types";
import { getProductCategories } from "@/lib/api";

interface CategoryState {
  categories: ProductCategory[];
  isLoaded: boolean;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoaded: false,
  fetchCategories: async () => {
    if (get().isLoaded) return;
    try {
      const res = await getProductCategories({ limit: 50 });
      if (res.success) {
        set({ categories: res.data, isLoaded: true });
      }
    } catch {
      // silently fail
    }
  },
}));
