import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export interface Vendor {
  _id: string;
  shopName: string;
  slug: string;
  description?: string;
  logo?: { url: string; publicId: string };
  banner?: { url: string; publicId: string };
  ownerName: string;
  email: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  gstNumber?: string;
  panNumber?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  commissionRate: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedVendorsResponse {
  success: boolean;
  data: Vendor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Vendor"],

  endpoints: (builder) => ({
    // Admin: list all vendors
    getVendors: builder.query<
      PaginatedVendorsResponse,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: ({ page = 1, limit = 20, search = "", status = "" }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(search && { search }),
          ...(status && { status }),
        });
        return `vendors/admin/all?${params.toString()}`;
      },
      providesTags: ["Vendor"],
    }),

    // Admin: get single vendor
    getVendorById: builder.query<{ success: boolean; data: Vendor }, string>({
      query: (id) => `vendors/admin/${id}`,
      providesTags: ["Vendor"],
    }),

    // Admin: update vendor status (approve/reject/suspend)
    updateVendorStatus: builder.mutation<
      { success: boolean; data: Vendor },
      { id: string; status: "pending" | "approved" | "rejected" | "suspended" }
    >({
      query: ({ id, status }) => ({
        url: `vendors/admin/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Vendor"],
    }),

    // Admin: update commission rate
    updateVendorCommission: builder.mutation<
      { success: boolean; data: Vendor },
      { id: string; commissionRate: number }
    >({
      query: ({ id, commissionRate }) => ({
        url: `vendors/admin/${id}/commission`,
        method: "PATCH",
        body: { commissionRate },
      }),
      invalidatesTags: ["Vendor"],
    }),

    // Admin: delete vendor
    deleteVendor: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `vendors/admin/${id}`, method: "DELETE" }),
      invalidatesTags: ["Vendor"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useUpdateVendorStatusMutation,
  useUpdateVendorCommissionMutation,
  useDeleteVendorMutation,
} = vendorApi;
