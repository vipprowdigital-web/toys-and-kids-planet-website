// app/features/product-category/data/productCategorySlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ProductCategoryState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedCategory: any | null;
}

const initialState: ProductCategoryState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedCategory: null,
};

const productCategorySlice = createSlice({
  name: "productCategory",
  initialState,
  reducers: {
    setSort(
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: string }>,
    ) {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setSelectedProductCategory(state, action: PayloadAction<any | null>) {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setSort, setSearch, setSelectedProductCategory } =
  productCategorySlice.actions;
export default productCategorySlice.reducer;
