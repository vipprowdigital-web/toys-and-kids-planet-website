/**
 * Customer API service — storefront-only.
 * Completely separate from the admin API layer.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ─── Generic fetch ────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (options?.token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${options.token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CustomerAddress {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  provider: "google" | "email_otp" | "phone_otp";
  isVerified: boolean;
  wishlist: string[];
  addresses: CustomerAddress[];
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token: string;
  customer: CustomerProfile;
}

/** Step 1 — request OTP */
export function sendEmailOTP(email: string): Promise<SendOTPResponse> {
  return apiFetch<SendOTPResponse>("/customer/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Step 2 — verify OTP and receive JWT */
export function verifyEmailOTP(
  email: string,
  otp: string,
): Promise<VerifyOTPResponse> {
  return apiFetch<VerifyOTPResponse>("/customer/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

/** Google OAuth — just redirect the browser to this URL */
export function getGoogleAuthUrl(): string {
  return `${BASE}/customer/auth/google`;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function getMyProfile(
  token: string,
): Promise<{ success: boolean; data: CustomerProfile }> {
  return apiFetch("/customer/me", { token });
}

export function updateMyProfile(
  token: string,
  data: { name?: string; phone?: string },
): Promise<{ success: boolean; data: CustomerProfile }> {
  return apiFetch("/customer/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export function getWishlist(
  token: string,
): Promise<{ success: boolean; data: unknown[] }> {
  return apiFetch("/customer/me/wishlist", { token });
}

export function addToWishlist(
  token: string,
  productId: string,
): Promise<{ success: boolean; wishlist: string[] }> {
  return apiFetch(`/customer/me/wishlist/${productId}`, {
    method: "POST",
    token,
  });
}

export function removeFromWishlist(
  token: string,
  productId: string,
): Promise<{ success: boolean; wishlist: string[] }> {
  return apiFetch(`/customer/me/wishlist/${productId}`, {
    method: "DELETE",
    token,
  });
}

// ─── Addresses ────────────────────────────────────────────────────────────────

export function getAddresses(
  token: string,
): Promise<{ success: boolean; data: CustomerAddress[] }> {
  return apiFetch("/customer/me/addresses", { token });
}

export function addAddress(
  token: string,
  data: Omit<CustomerAddress, "_id">,
): Promise<{ success: boolean; data: CustomerAddress[] }> {
  return apiFetch("/customer/me/addresses", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateAddress(
  token: string,
  addressId: string,
  data: Partial<Omit<CustomerAddress, "_id">>,
): Promise<{ success: boolean; data: CustomerAddress[] }> {
  return apiFetch(`/customer/me/addresses/${addressId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteAddress(
  token: string,
  addressId: string,
): Promise<{ success: boolean; data: CustomerAddress[] }> {
  return apiFetch(`/customer/me/addresses/${addressId}`, {
    method: "DELETE",
    token,
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  quantity: number;
  variant?: { color?: string; size?: string; sku?: string };
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateRazorpayOrderPayload {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  customerNote?: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
  orderId: string;
  orderNumber: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface OrderDoc {
  _id: string;
  _orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  subtotal: number;
  shippingCharge: number;
  tax: number;
  items: {
    product: { _id: string; name: string; slug: string; images: { url: string }[] };
    name: string;
    price: number;
    quantity: number;
    image: string;
    variant?: { color?: string; size?: string };
  }[];
  shippingAddress: ShippingAddress;
  createdAt: string;
}

export function createRazorpayOrder(
  token: string,
  payload: CreateRazorpayOrderPayload,
): Promise<RazorpayOrderResponse> {
  return apiFetch<RazorpayOrderResponse>("/orders/create-razorpay-order", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function verifyPayment(
  token: string,
  payload: VerifyPaymentPayload,
): Promise<{ success: boolean; orderId: string; orderNumber: string }> {
  return apiFetch("/orders/verify-payment", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function placeCODOrder(
  token: string,
  payload: Omit<CreateRazorpayOrderPayload, never>,
): Promise<{ success: boolean; orderId: string; orderNumber: string }> {
  return apiFetch("/orders/place-cod", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function getMyOrders(
  token: string,
  page = 1,
): Promise<{ success: boolean; data: OrderDoc[]; pagination: { total: number; totalPages: number } }> {
  return apiFetch(`/orders/my?page=${page}&limit=10`, { token });
}

export function getMyOrderById(
  token: string,
  orderId: string,
): Promise<{ success: boolean; data: OrderDoc }> {
  return apiFetch(`/orders/my/${orderId}`, { token });
}

export function cancelOrder(
  token: string,
  orderId: string,
  reason?: string,
): Promise<{ success: boolean; data: OrderDoc }> {
  return apiFetch(`/orders/my/${orderId}/cancel`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ reason }),
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface ProductReview {
  _id: string;
  product: string | { _id: string; name: string; slug: string };
  customer: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  title?: string;
  body: string;
  verified: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: ProductReview[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export function getProductReviews(
  productId: string,
  page = 1,
  limit = 10,
): Promise<ReviewsResponse> {
  return apiFetch(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
}

export function createReview(
  token: string,
  payload: { productId: string; rating: number; title?: string; body: string },
): Promise<{ success: boolean; data: ProductReview; message: string }> {
  return apiFetch("/reviews", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function updateReview(
  token: string,
  reviewId: string,
  payload: { rating?: number; title?: string; body?: string },
): Promise<{ success: boolean; data: ProductReview }> {
  return apiFetch(`/reviews/${reviewId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteReview(
  token: string,
  reviewId: string,
): Promise<{ success: boolean; message: string }> {
  return apiFetch(`/reviews/${reviewId}`, { method: "DELETE", token });
}
