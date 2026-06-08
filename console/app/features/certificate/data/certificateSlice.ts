// app/routes/certificate/data/certificateSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CertificateState {
  sortBy: string;
  sortOrder: "asc" | "desc";
  search: string;
  selectedCertificate: any | null;
  page: number;
  limit: number;
}

const initialState: CertificateState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedCertificate: null,
  page: 1,
  limit: 10,
};

const certificateSlice = createSlice({
  name: "certificate",
  initialState,
  reducers: {
    // Set sorting
    setSort(
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: "asc" | "desc" }>
    ) {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },

    // Set search term
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    // Select certificate
    setSelectedCertificate(state, action: PayloadAction<any | null>) {
      state.selectedCertificate = action.payload;
    },

    // Pagination
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },

    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },

    // Reset filters
    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.page = 1;
      state.limit = 10;
      state.selectedCertificate = null;
    },
  },
});

export const {
  setSort,
  setSearch,
  setSelectedCertificate,
  setPage,
  setLimit,
  resetFilters,
} = certificateSlice.actions;

export default certificateSlice.reducer;
