import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getVendorToken } from "~/utils/vendorAuth";
import type { Product } from "~/features/products/data/productApi";

export interface PaginatedVendorProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const vendorProductApi = createApi({
  reducerPath: "vendorProductApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getVendorToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["VendorProduct"],

  endpoints: (builder) => ({
    getVendorProducts: builder.query<
      PaginatedVendorProductsResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(search && { search }),
        });
        return `vendor/products?${params.toString()}`;
      },
      providesTags: ["VendorProduct"],
    }),

    getVendorProductById: builder.query<{ success: boolean; data: Product }, string>({
      query: (id) => `vendor/products/${id}`,
      providesTags: ["VendorProduct"],
    }),

    createVendorProduct: builder.mutation<{ success: boolean; data: Product }, FormData>({
      query: (formData) => ({
        url: "vendor/products",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["VendorProduct"],
    }),

    updateVendorProduct: builder.mutation<
      { success: boolean; data: Product },
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `vendor/products/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["VendorProduct"],
    }),

    patchVendorProduct: builder.mutation<
      { success: boolean; data: Product },
      { id: string; data: Partial<Pick<Product, "isActive" | "inStock" | "badge">> }
    >({
      query: ({ id, data }) => ({
        url: `vendor/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["VendorProduct"],
    }),

    deleteVendorProduct: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `vendor/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["VendorProduct"],
    }),
  }),
});

export const {
  useGetVendorProductsQuery,
  useGetVendorProductByIdQuery,
  useCreateVendorProductMutation,
  useUpdateVendorProductMutation,
  usePatchVendorProductMutation,
  useDeleteVendorProductMutation,
} = vendorProductApi;
