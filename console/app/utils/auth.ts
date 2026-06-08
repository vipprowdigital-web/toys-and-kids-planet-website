// frontend/app/utils/auth.ts

// Save token securely
export const saveToken = (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("authToken", token);
};

// Get Token
export const getToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("authToken");
};

// Remove token
export const removeToken = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("authToken");
};

// Decode JWT (without verifying)
export const decodeToken = (token: string): any | null => {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload;
    } catch (error) {
        return null;
    }
};

// Check if user is authenticated and token is valid
export const isAuthenticated = (): boolean => {
    if (typeof window === "undefined") return false;

    const token = getToken();
    if (!token) return false;

    const decode = decodeToken(token);
    if (!decode || !decode.exp) return false;

    // Check expiration time (in seconds)
    const currentTime = Date.now() / 1000;
    return decode.exp > currentTime;
};
