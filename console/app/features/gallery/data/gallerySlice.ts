// app/routes/gallery/data/gallerySlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface GalleryState {
  sortBy: string;
  sortOrder: "asc" | "desc";
  search: string;
  selectedGallery: any | null;
  page: number;
  limit: number;
}

const initialState: GalleryState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedGallery: null,
  page: 1,
  limit: 10,
};

const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    // ✅ Set sorting field and order
    setSort(
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: "asc" | "desc" }>
    ) {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },

    // ✅ Set search term
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    // ✅ Select / Deselect a gallery
    setSelectedGallery(state, action: PayloadAction<any | null>) {
      state.selectedGallery = action.payload;
    },

    // ✅ Pagination control
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },

    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },

    // ✅ Reset all filters
    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.page = 1;
      state.limit = 10;
      state.selectedGallery = null;
    },
  },
});

export const {
  setSort,
  setSearch,
  setSelectedGallery,
  setPage,
  setLimit,
  resetFilters,
} = gallerySlice.actions;

export default gallerySlice.reducer;
