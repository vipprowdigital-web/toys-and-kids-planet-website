// app/routes/contact/data/contactSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ContactState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedContact: any | null;
}

const initialState: ContactState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedContact: null,
};

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {
    // ✅ Set sorting preferences
    setSort(
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: string }>
    ) {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },

    // ✅ Update search query
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    // ✅ Select or clear a contact message
    setSelectedContact(state, action: PayloadAction<any | null>) {
      state.selectedContact = action.payload;
    },

    // ✅ Reset filters (useful for admin list page)
    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.selectedContact = null;
    },
  },
});

export const { setSort, setSearch, setSelectedContact, resetFilters } =
  contactSlice.actions;

export default contactSlice.reducer;
