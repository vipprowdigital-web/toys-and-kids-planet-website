// app/features/products/data/productApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  publicId: string;
}

/** Toy variant — colour + size text instead of hardware finish + mm */
export interface ProductVariant {
  _id?: string;
  sku?: string;
  color?: string;    // e.g. "Red", "Blue"
  size?: string;     // e.g. "Small", "Pack of 2"
  price?: number;
  discountPrice?: number;
  isAvailable: boolean;
}

/** Toy-oriented specifications */
export interface ProductSpecifications {
  material?: string;           // e.g. "BPA-free plastic", "Wood"
  batteryRequired?: boolean;
  batteryType?: string;        // e.g. "AA x 3"
  dimensions?: string;         // e.g. "30cm x 20cm x 10cm"
  weight?: string;             // e.g. "500g"
  safetyStandards?: string[];  // e.g. ["BIS", "CE"]
  includedItems?: string[];    // e.g. ["Toy car", "Remote control"]
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: { _id: string; name: string; slug: string } | string;
  ageGroup: "0-2" | "3-5" | "6-8" | "9-12" | "13+" | "all";
  images: ProductImage[];
  price: number;
  originalPrice: number | null;
  discount: number;
  specifications?: ProductSpecifications;
  variants?: ProductVariant[];
  rating: number;
  reviewCount: number;
  badge: string | null;
  inStock: boolean;
  stockQuantity: number;
  soldCount: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    totalPages: number;
    currentPage: number;
    totalItems: number;
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
}

// ── API Slice ──────────────────────────────────────────────────────────────

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Product"],

  endpoints: (builder) => ({
    // ─── Get all products (paginated + searchable) ───────────────────────
    getProducts: builder.query<
      PaginatedProductsResponse,
      { page?: number; limit?: number; search?: string; category?: string; ageGroup?: string }
    >({
      query: ({ page = 1, limit = 10, search = "", category = "", ageGroup = "" }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(search && { search }),
          ...(category && { category }),
          ...(ageGroup && { ageGroup }),
        });
        return `products?${params.toString()}`;
      },
      providesTags: ["Product"],
    }),

    // ─── Get single product by ID or slug ────────────────────────────────
    getProductById: builder.query<SingleProductResponse, string>({
      query: (id) => `products/${id}`,
      providesTags: ["Product"],
    }),

    // ─── Create product (multipart/form-data) ────────────────────────────
    createProduct: builder.mutation<SingleProductResponse, FormData>({
      query: (formData) => ({
        url: `products`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    // ─── Update product (PUT) ────────────────────────────────────────────
    updateProduct: builder.mutation<
      SingleProductResponse,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `products/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    // ─── Partial update — toggle isActive / isFeatured / inStock ─────────
    partiallyUpdateProduct: builder.mutation<
      SingleProductResponse,
      { id: string; data: Partial<Pick<Product, "isActive" | "isFeatured" | "inStock" | "badge">> }
    >({
      query: ({ id, data }) => ({
        url: `products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    // ─── Delete product ───────────────────────────────────────────────────
    deleteProduct: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  usePartiallyUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
