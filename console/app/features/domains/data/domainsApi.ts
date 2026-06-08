// app/routes/domains/data/domainsApi.ts - (using RTK Query)

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const domainApi = createApi({
  reducerPath: "DomainApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Domain"],

  endpoints: (builder) => ({
    // ✅ Get paginated domains
    getDomains: builder.query({
      query: (params?: { page?: number; limit?: number }) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        return `domains?page=${page}&limit=${limit}`;
      },
      providesTags: ["Domain"],
    }),

    // ✅ Get Domain by ID
    getDomainById: builder.query({
      query: (id) => `domains/${id}`,
      providesTags: ["Domain"],
    }),

    // ✅ Create Domain (multipart/form-data)
    createDomain: builder.mutation({
      query: (formData) => ({
        url: "domains",
        method: "POST",
        // 🚀 Don’t serialize FormData — send it directly
        body: formData,
      }),
      invalidatesTags: ["Domain"],
    }),

    // ✅ Update Domain (multipart/form-data)
    updateDomain: builder.mutation({
      query: ({ id, formData }) => ({
        url: `domains/${id}`,
        method: "PUT", // 🧠 Use PUT, your backend uses PUT for full update
        body: formData,
      }),
      invalidatesTags: ["Domain"],
    }),

    // ✅ Partial update (toggle only)
    partiallyUpdateDomain: builder.mutation({
      query: ({ id, data }) => ({
        url: `domains/${id}`,
        method: "PATCH",
        body: data, // small JSON patch like { isActive: false }
      }),
      invalidatesTags: ["Domain"],
    }),

    // ✅ Delete
    deleteDomain: builder.mutation({
      query: (id) => ({
        url: `domains/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Domain"],
    }),
  }),
});

export const {
  useGetDomainsQuery,
  useGetDomainByIdQuery,
  useCreateDomainMutation,
  useUpdateDomainMutation,
  usePartiallyUpdateDomainMutation,
  useDeleteDomainMutation,
} = domainApi;
