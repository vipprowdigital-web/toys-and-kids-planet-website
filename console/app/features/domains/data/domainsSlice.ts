// app/routes/domain/data/domainSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface DomainState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedDomain: any | null;
}

const initialState: DomainState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedDomain: null,
};

const domainSlice = createSlice({
  name: "domain",
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
    setSelectedDomain(state, action: PayloadAction<any | null>) {
      state.selectedDomain = action.payload;
    },
  },
});

export const { setSort, setSearch, setSelectedDomain } = domainSlice.actions;
export default domainSlice.reducer;
