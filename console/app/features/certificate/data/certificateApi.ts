// app/routes/certificate/data/certificateApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const certificateApi = createApi({
  reducerPath: "certificateApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["Certificate"],

  endpoints: (builder) => ({
    /* ================================
       🟢 Public Routes
       ================================ */

    // Get all active certificates (Public)
    getPublicCertificates: builder.query({
      query: () => `certificate/active`,
      providesTags: ["Certificate"],
    }),

    // Get single certificate by ID (Public)
    getPublicCertificateById: builder.query({
      query: (id: string) => `certificate/${id}`,
      providesTags: ["Certificate"],
    }),

    /* ================================
       🔒 Admin Routes
       ================================ */

    // Get all certificates with pagination + search
    getCertificates: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `certificate?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Certificate"],
    }),

    // Get certificate by ID
    getCertificateById: builder.query({
      query: (id: string) => `certificate/${id}`,
      providesTags: ["Certificate"],
    }),

    // Create new certificate
    createCertificate: builder.mutation({
      query: (formData: FormData) => ({
        url: `certificate`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Certificate"],
    }),

    // Update certificate (PUT)
    updateCertificate: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `certificate/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Certificate"],
    }),

    // Patch update certificate
    partiallyUpdateCertificate: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `certificate/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Certificate"],
    }),

    // Delete certificate
    deleteCertificate: builder.mutation({
      query: (id: string) => ({
        url: `certificate/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Certificate"],
    }),
  }),
});

export const {
  useGetPublicCertificatesQuery,
  useGetPublicCertificateByIdQuery,
  useGetCertificatesQuery,
  useGetCertificateByIdQuery,
  useCreateCertificateMutation,
  useUpdateCertificateMutation,
  usePartiallyUpdateCertificateMutation,
  useDeleteCertificateMutation,
} = certificateApi;
