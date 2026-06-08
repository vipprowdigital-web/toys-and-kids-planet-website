// app/routes/blog/data/blogSlice.ts

// app/routes/blog/data/blogSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface BlogState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedBlog: any | null;
}

const initialState: BlogState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedBlog: null,
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    setSort(state, action: PayloadAction<{ sortBy: string; sortOrder: string }>) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    setSelectedBlog(state, action: PayloadAction<any | null>) {
      state.selectedBlog = action.payload;
    },

    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.selectedBlog = null;
    },
  },
});

export const { setSort, setSearch, setSelectedBlog, resetFilters } =
  blogSlice.actions;

export default blogSlice.reducer;
