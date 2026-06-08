// app/features/products/data/productSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProductState {
  sortBy: string;
  sortOrder: "asc" | "desc";
  search: string;
  selectedProduct: any | null;
  page: number;
  limit: number;
}

const initialState: ProductState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedProduct: null,
  page: 1,
  limit: 10,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setSort(
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: "asc" | "desc" }>,
    ) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      // Reset to page 1 whenever search changes so the user isn't stuck on
      // page 5 looking at 0 results.
      state.page = 1;
    },

    setSelectedProduct(state, action: PayloadAction<any | null>) {
      state.selectedProduct = action.payload;
    },

    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },

    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },

    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.page = 1;
      state.limit = 10;
      state.selectedProduct = null;
    },
  },
});

export const {
  setSort,
  setSearch,
  setSelectedProduct,
  setPage,
  setLimit,
  resetFilters,
} = productSlice.actions;

export default productSlice.reducer;
