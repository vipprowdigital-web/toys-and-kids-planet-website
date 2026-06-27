/**
 * Central API service for Toys & Kids Planet.
 * All calls go through this module so the base URL is managed in one place.
 *
 * Base URL is read from NEXT_PUBLIC_API_URL env variable.
 * Falls back to http://localhost:5000/api/v1 for local development.
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ─────────────────────────────────────────────
// Generic fetch wrapper
// ─────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      (errorBody as { message?: string }).message ||
        `API error: ${res.status} ${res.statusText}`,
    );
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// Types (inline to keep this file self-contained)
// ─────────────────────────────────────────────

import type {
  Product,
  ProductCategory,
  Vendor,
  Blog,
  AppConfig,
  PaginatedApiResponse,
  ApiResponse,
} from "@/types";

// ─────────────────────────────────────────────
// Product Categories API
// ─────────────────────────────────────────────

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Fetch paginated product categories.
 * Public route — no auth required.
 */
export async function getProductCategories(
  params: GetCategoriesParams = {},
): Promise<PaginatedApiResponse<ProductCategory>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);

  const qs = query.toString();
  return apiFetch<PaginatedApiResponse<ProductCategory>>(
    `/product-categories${qs ? `?${qs}` : ""}`,
  );
}

/**
 * Fetch a single category by slug or MongoDB ObjectId.
 * Public route — no auth required.
 */
export async function getProductCategoryBySlug(
  slugOrId: string,
): Promise<ApiResponse<ProductCategory>> {
  return apiFetch<ApiResponse<ProductCategory>>(
    `/product-categories/${slugOrId}`,
  );
}

// ─────────────────────────────────────────────
// Products API
// ─────────────────────────────────────────────

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  /** MongoDB ObjectId of the category */
  category?: string;
  /** Age group filter: "0-2" | "3-5" | "6-8" | "9-12" | "13+" | "all" */
  ageGroup?: string;
  /** Set to "true" to return only featured products */
  featured?: boolean;
  /** Set to "true" to return only in-stock products */
  inStock?: boolean;
}

/**
 * Fetch paginated products with optional filters.
 * Public route — no auth required.
 */
export async function getProducts(
  params: GetProductsParams = {},
): Promise<PaginatedApiResponse<Product>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.ageGroup) query.set("ageGroup", params.ageGroup);
  if (params.featured) query.set("featured", "true");
  if (params.inStock) query.set("inStock", "true");

  const qs = query.toString();
  return apiFetch<PaginatedApiResponse<Product>>(
    `/products${qs ? `?${qs}` : ""}`,
  );
}

/**
 * Fetch a single product by slug or MongoDB ObjectId.
 * Public route — no auth required.
 */
export async function getProductBySlug(
  slugOrId: string,
): Promise<ApiResponse<Product>> {
  return apiFetch<ApiResponse<Product>>(`/products/${slugOrId}`);
}

/**
 * Fetch featured products (convenience wrapper).
 */
export async function getFeaturedProducts(
  limit = 8,
): Promise<PaginatedApiResponse<Product>> {
  return getProducts({ featured: true, limit, inStock: true });
}

/**
 * Fetch best-selling products sorted by soldCount.
 * Because the API doesn't expose a sort param yet, we fetch more and
 * sort client-side — easy to update once the backend adds sort support.
 */
export async function getBestSellerProducts(
  limit = 8,
): Promise<Product[]> {
  const res = await getProducts({ limit: 50, inStock: true });
  return res.data
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit);
}

/**
 * Fetch products belonging to a specific category.
 */
export async function getProductsByCategory(
  categoryId: string,
  params: Omit<GetProductsParams, "category"> = {},
): Promise<PaginatedApiResponse<Product>> {
  return getProducts({ ...params, category: categoryId });
}

/**
 * Fetch products for a specific age group.
 */
export async function getProductsByAgeGroup(
  ageGroup: string,
  params: Omit<GetProductsParams, "ageGroup"> = {},
): Promise<PaginatedApiResponse<Product>> {
  return getProducts({ ...params, ageGroup });
}

// ─────────────────────────────────────────────
// Auth API
// ─────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponseData {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export async function loginUser(
  payload: LoginPayload,
): Promise<ApiResponse<AuthResponseData>> {
  return apiFetch<ApiResponse<AuthResponseData>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerUser(
  payload: RegisterPayload,
): Promise<ApiResponse<AuthResponseData>> {
  return apiFetch<ApiResponse<AuthResponseData>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Helper to attach the JWT token to authorized requests.
 */
export function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// ─────────────────────────────────────────────
// Blogs API
// ─────────────────────────────────────────────

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  search?: string;
  /** Comma-separated category ObjectIds */
  categories?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Fetch paginated active blogs.
 * Public route — no auth required.
 */
export async function getBlogs(
  params: GetBlogsParams = {},
): Promise<PaginatedApiResponse<Blog>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.categories) query.set("categories", params.categories);
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const qs = query.toString();
  return apiFetch<PaginatedApiResponse<Blog>>(
    `/blog${qs ? `?${qs}` : ""}`,
  );
}

/**
 * Fetch a single blog by slug or MongoDB ObjectId.
 * Public route — no auth required.
 */
export async function getBlogBySlug(
  slugOrId: string,
): Promise<ApiResponse<Blog>> {
  return apiFetch<ApiResponse<Blog>>(`/blog/${slugOrId}`);
}

// ─────────────────────────────────────────────
// App Config API
// ─────────────────────────────────────────────

/**
 * Fetch the public app configuration.
 * Public route — no auth required.
 */
export async function getPublicAppConfig(): Promise<ApiResponse<AppConfig>> {
  return apiFetch<ApiResponse<AppConfig>>("/app-config/public");
}

// ─────────────────────────────────────────────
// Vendors / Shops API
// ─────────────────────────────────────────────

export interface GetVendorsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface VendorProductsResponse {
  success: boolean;
  data: Product[];
  vendor: Vendor;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getVendors(
  params: GetVendorsParams = {},
): Promise<PaginatedApiResponse<Vendor>> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return apiFetch<PaginatedApiResponse<Vendor>>(`/vendors${qs ? `?${qs}` : ""}`);
}

export async function getVendorBySlug(slugOrId: string): Promise<ApiResponse<Vendor>> {
  return apiFetch<ApiResponse<Vendor>>(`/vendors/${slugOrId}`);
}

export async function getVendorProducts(
  slugOrId: string,
  params: GetProductsParams = {},
): Promise<VendorProductsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", params.category);
  if (params.ageGroup) query.set("ageGroup", params.ageGroup);
  const qs = query.toString();
  return apiFetch<VendorProductsResponse>(`/vendors/${slugOrId}/products${qs ? `?${qs}` : ""}`);
}

// ─────────────────────────────────────────────
// Testimonials API
// ─────────────────────────────────────────────

export interface Testimonial {
  _id: string;
  name: string;
  designation?: string;
  description: string;
  avatar?: string;
  rating: number;
  createdAt: string;
}

/**
 * Fetch all active testimonials for the public homepage.
 * Public route — no auth required.
 */
export async function getTestimonials(): Promise<ApiResponse<Testimonial[]>> {
  return apiFetch<ApiResponse<Testimonial[]>>("/testimonial/public");
}
