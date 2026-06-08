// app/routes/testimonial/data/testimonialSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface TestimonialState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedTestimonial: any | null;
}

const initialState: TestimonialState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedTestimonial: null,
};

const testimonialSlice = createSlice({
  name: "testimonial",
  initialState,
  reducers: {
    // ✅ Set sorting field and order
    setSort(state, action: PayloadAction<{ sortBy: string; sortOrder: string }>) {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },

    // ✅ Set search term
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    // ✅ Select / Deselect a testimonial
    setSelectedTestimonial(state, action: PayloadAction<any | null>) {
      state.selectedTestimonial = action.payload;
    },

    // ✅ Clear all filters (useful for resets)
    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.selectedTestimonial = null;
    },
  },
});

export const { setSort, setSearch, setSelectedTestimonial, resetFilters } =
  testimonialSlice.actions;

export default testimonialSlice.reducer;
