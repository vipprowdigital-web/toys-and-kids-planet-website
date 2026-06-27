const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface VendorRegisterPayload {
  shopName: string;
  ownerName: string;
  email: string;
  phone?: string;
  password: string;
  description?: string;
  gstNumber?: string;
  panNumber?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface VendorLoginPayload {
  email: string;
  password: string;
}

export async function registerVendor(payload: VendorRegisterPayload) {
  const res = await fetch(`${API_URL}/vendor/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed.");
  return data;
}

export async function loginVendor(payload: VendorLoginPayload) {
  const res = await fetch(`${API_URL}/vendor/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed.");
  return data;
}
