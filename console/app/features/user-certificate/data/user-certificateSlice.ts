// app/routes/user-certificate/data/user-certificateSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserCertificate } from "./user-certificateApi";

/* ================================
   📘 State Type
================================ */
export interface UserCertificateState {
  search: string;
  page: number;
  limit: number;
  selectedUserCertificate: UserCertificate | null;
}

const initialState: UserCertificateState = {
  search: "",
  page: 1,
  limit: 10,
  selectedUserCertificate: null,
};

const userCertificateSlice = createSlice({
  name: "userCertificate",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },

    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },

    setSelectedUserCertificate(
      state,
      action: PayloadAction<UserCertificate | null>
    ) {
      state.selectedUserCertificate = action.payload;
    },

    resetFilters(state) {
      state.search = "";
      state.page = 1;
      state.limit = 10;
      state.selectedUserCertificate = null;
    },
  },
});

export const {
  setSearch,
  setPage,
  setLimit,
  setSelectedUserCertificate,
  resetFilters,
} = userCertificateSlice.actions;

export default userCertificateSlice.reducer;