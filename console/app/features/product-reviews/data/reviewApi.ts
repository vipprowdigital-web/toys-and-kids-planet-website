import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export interface ProductReview {
  _id: string;
  product: { _id: string; name: string; slug: string; images?: { url: string }[] } | string;
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

export interface PaginatedReviewsResponse {
  success: boolean;
  data: ProductReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Review"],

  endpoints: (builder) => ({
    getAllReviews: builder.query<
      PaginatedReviewsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) =>
        `reviews?page=${page}&limit=${limit}`,
      providesTags: ["Review"],
    }),

    adminUpdateReview: builder.mutation<
      { success: boolean; data: ProductReview },
      { id: string; data: { rating?: number; title?: string; body?: string; isApproved?: boolean } }
    >({
      query: ({ id, data }) => ({
        url: `reviews/${id}/admin`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Review"],
    }),

    adminDeleteReview: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `reviews/${id}/admin`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useGetAllReviewsQuery,
  useAdminUpdateReviewMutation,
  useAdminDeleteReviewMutation,
} = reviewApi;
