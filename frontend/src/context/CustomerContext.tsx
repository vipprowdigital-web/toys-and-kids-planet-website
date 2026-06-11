"use client";
/**
 * CustomerContext.tsx
 *
 * Global state for the logged-in storefront customer.
 * Persists the JWT in localStorage under "customer_token".
 * Wraps the entire app via layout.tsx.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getMyProfile, type CustomerProfile } from "@/lib/customerApi";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerContextValue {
  customer: CustomerProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Call after verifying OTP or handling Google callback */
  login: (token: string, customer: CustomerProfile) => void;
  /** Clear token and customer from state + localStorage */
  logout: () => void;
  /** Re-fetch profile from API */
  refreshProfile: () => Promise<void>;
  /** Update wishlist ids locally without a full re-fetch */
  setWishlist: (ids: string[]) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CustomerContext = createContext<CustomerContextValue | null>(null);

const TOKEN_KEY = "customer_token";

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount — rehydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    setToken(stored);
    getMyProfile(stored)
      .then((res) => {
        if (res.success) setCustomer(res.data);
      })
      .catch(() => {
        // Token expired / invalid — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((newToken: string, profile: CustomerProfile) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setCustomer(profile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setCustomer(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await getMyProfile(token);
      if (res.success) setCustomer(res.data);
    } catch {
      logout();
    }
  }, [token, logout]);

  const setWishlist = useCallback((ids: string[]) => {
    setCustomer((prev) => (prev ? { ...prev, wishlist: ids } : prev));
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        token,
        isLoading,
        isAuthenticated: !!customer,
        login,
        logout,
        refreshProfile,
        setWishlist,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

/** Hook — throws if used outside CustomerProvider */
export function useCustomer(): CustomerContextValue {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomer must be used inside CustomerProvider");
  return ctx;
}
