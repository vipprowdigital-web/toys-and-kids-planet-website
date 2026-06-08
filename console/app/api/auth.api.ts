// app/api/auth.api.ts

import { getToken } from "~/utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface RegisterPayload {
    name: string,
    email: string,
    password: string,
}

export interface LoginPayload {
    email: string,
    password: string,
}

export async function registerUser(payload: RegisterPayload) {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Registration failed.");
    }
    return data;
}


export async function loginUser(payload: LoginPayload) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data;
}

export async function logoutUser() {
    const token = getToken();
    if (!token) throw new Error("User not authenticated");

    const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Logout failed");
    return data;
}