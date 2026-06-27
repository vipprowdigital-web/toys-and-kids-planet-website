const VENDOR_TOKEN_KEY = "vendorToken";
const VENDOR_DATA_KEY = "vendorData";

export const saveVendorToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(VENDOR_TOKEN_KEY, token);
};

export const getVendorToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(VENDOR_TOKEN_KEY);
};

export const removeVendorToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VENDOR_TOKEN_KEY);
  localStorage.removeItem(VENDOR_DATA_KEY);
};

export const saveVendorData = (data: object) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(VENDOR_DATA_KEY, JSON.stringify(data));
};

export const getVendorData = (): any | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(VENDOR_DATA_KEY);
  return raw ? JSON.parse(raw) : null;
};

const decodeToken = (token: string): any | null => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const isVendorAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = getVendorToken();
  if (!token) return false;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp > Date.now() / 1000;
};
