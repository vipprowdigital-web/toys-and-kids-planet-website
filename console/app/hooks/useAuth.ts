import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser, logoutUser, registerUser } from "~/api/auth.api";
import { saveToken, removeToken } from "~/utils/auth";

export function useAuth() {
    const queryClient = useQueryClient();

    // Register
    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            console.info("Registered successfully.", data);
        },
        onError: (error: any) => {
            console.error("Registered failed.", error.message);
        },
    });

    // Login
    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            saveToken(data.token);
            queryClient.invalidateQueries({ queryKey: ["user"] }); // Invalidate user query
        },
        onError: (error: any) => {
            console.error("Login failed.", error.message);
        },
    });

    // Logout
    const logoutMutation = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            removeToken();
            queryClient.clear();
        },
        onError: (error: any) => {
            console.error("Logout failed.", error.message);
        },
    });

    return {
        register: registerMutation.mutate,
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        isLoading:
            registerMutation.isPending ||
            loginMutation.isPending ||
            logoutMutation.isPending,
    }
}
