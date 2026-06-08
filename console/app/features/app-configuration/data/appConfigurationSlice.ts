// app/routes/app-configuration/data/appConfigurationSlice.ts

// app/routes/app-configuration/data/appConfigurationSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AppConfigState {
  search: string;
  selectedConfig: any | null;
  isEditing: boolean;
}

const initialState: AppConfigState = {
  search: "",
  selectedConfig: null,
  isEditing: false,
};

const appConfigurationSlice = createSlice({
  name: "appConfiguration",
  initialState,
  reducers: {
    // ✅ Set search filter (optional UI)
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    // ✅ Select or deselect a configuration
    setSelectedConfig(state, action: PayloadAction<any | null>) {
      state.selectedConfig = action.payload;
    },

    // ✅ Toggle editing mode
    setEditing(state, action: PayloadAction<boolean>) {
      state.isEditing = action.payload;
    },

    // ✅ Reset all
    resetConfigState(state) {
      state.search = "";
      state.selectedConfig = null;
      state.isEditing = false;
    },
  },
});

export const { setSearch, setSelectedConfig, setEditing, resetConfigState } =
  appConfigurationSlice.actions;

export default appConfigurationSlice.reducer;
