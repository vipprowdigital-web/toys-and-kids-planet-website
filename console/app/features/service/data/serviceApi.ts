// app/routes/service/data/serviceApi.ts - (using RTK Query)

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Service"],

  endpoints: (builder) => ({
    /**
     * 🟢 Public Routes
     */

    // ✅ Get all active services (Public)
    getPublicServices: builder.query({
      query: (domain?: string) =>
        domain ? `service/public?domain=${domain}` : `service/public`,
      providesTags: ["Service"],
    }),

    // ✅ Get all active service names (Public)
    getPublicServiceNames: builder.query<
      { message: string; data: { _id: string; title: string }[] },
      void
    >({
      query: () => `service/public/names`,
      providesTags: ["Service"],
    }),

    // ✅ Get single public service by ID
    getPublicServiceById: builder.query({
      query: (id: string) => `service/public/${id}`,
      providesTags: ["Service"],
    }),

    /**
     * 🔒 Admin-Protected Routes
     */

    // ✅ Get all services (paginated + searchable)
    getServices: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        domain = "",
        sortBy = "createdAt",
        sortOrder = "desc",
      }) =>
        `service?page=${page}&limit=${limit}&search=${search}&domain=${domain}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
      providesTags: ["Service"],
    }),

    // ✅ Get single service (admin)
    getServiceById: builder.query({
      query: (id: string) => `service/${id}`,
      providesTags: ["Service"],
    }),

    // ✅ Create new service (multipart/form-data)
    createService: builder.mutation({
      query: (formData: FormData) => ({
        url: `service`,
        method: "POST",
        body: formData, // ⚠️ Don’t serialize FormData
      }),
      invalidatesTags: ["Service"],
    }),

    // ✅ Update service (PUT)
    updateService: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `service/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Service"],
    }),

    // ✅ Partial update (PATCH)
    partiallyUpdateService: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `service/${id}`,
        method: "PATCH",
        body: data, // small JSON patch (e.g. { isActive: false })
      }),
      invalidatesTags: ["Service"],
    }),

    // ✅ Delete service
    deleteService: builder.mutation({
      query: (id: string) => ({
        url: `service/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Service"],
    }),
  }),
});

export const {
  useGetPublicServicesQuery,
  useGetPublicServiceByIdQuery,
  useGetPublicServiceNamesQuery,
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  usePartiallyUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;
