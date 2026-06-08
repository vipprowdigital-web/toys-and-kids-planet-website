// app/routes/policy/data/policySlice.ts

// app/routes/policy/data/policySlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PolicyState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedPolicy: any | null;
}

const initialState: PolicyState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedPolicy: null,
};

const policySlice = createSlice({
  name: "policy",
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

    // ✅ Select or clear a policy
    setSelectedPolicy(state, action: PayloadAction<any | null>) {
      state.selectedPolicy = action.payload;
    },

    // ✅ Reset filters (useful for admin dashboards)
    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.selectedPolicy = null;
    },
  },
});

export const { setSort, setSearch, setSelectedPolicy, resetFilters } =
  policySlice.actions;

export default policySlice.reducer;