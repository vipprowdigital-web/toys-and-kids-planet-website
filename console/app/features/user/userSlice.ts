// app/feature/user/userSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    provider?: string;
    createdAt?: string;
    updatedAt?: string;
}

const initialState: UserState = {};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState>) => {
            return { ...state, ...action.payload };
        },
        clearUser: () => initialState,
    }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;