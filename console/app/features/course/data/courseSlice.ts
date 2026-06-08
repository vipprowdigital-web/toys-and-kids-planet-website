// app/routes/course/data/courseSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CourseState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedCourse: any | null;
}

const initialState: CourseState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedCourse: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setSort(
      state,
      action: PayloadAction<{ sortBy: string; sortOrder: string }>
    ) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    setSelectedCourse(state, action: PayloadAction<any | null>) {
      state.selectedCourse = action.payload;
    },

    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.selectedCourse = null;
    },
  },
});

export const {
  setSort,
  setSearch,
  setSelectedCourse,
  resetFilters,
} = courseSlice.actions;

export default courseSlice.reducer;
