// app/feature/user/userApi.ts
import {
  useQuery,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { getToken } from "~/utils/auth";
import { setUser, type UserState } from "./userSlice";
import { store } from "~/redux/store";
import { useEffect } from "react";
// Fetch function
export const fetchUserProfile = async (): Promise<UserState> => {
  //   console.log("Inside User Profile: ", import.meta.env.VITE_API_URL);

  const token = getToken();
  //   console.log("Token: ", token);

  if (!token) throw new Error("No Token found.");
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/users/profile/view`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return data.user;
};
// ✅ Hook using explicit generics (this fixes the overload issue)
export function useUserProfile() {
  const dispatch = useDispatch();
  const query = useQuery<UserState, Error>({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
  // ✅ Dispatch to Redux when query data changes
  useEffect(() => {
    if (query.data) {
      dispatch(setUser(query.data));
    }
  }, [query.data, dispatch]);
  return query; // so components can also read status or data if needed
}
