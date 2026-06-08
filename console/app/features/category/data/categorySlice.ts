// app/routes/category/data/categorySlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CategoryState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedCategory: any | null;
}

const initialState: CategoryState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedCategory: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setSort(state, action: PayloadAction<{ sortBy: string; sortOrder: string }>) {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<any | null>) {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setSort, setSearch, setSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;
