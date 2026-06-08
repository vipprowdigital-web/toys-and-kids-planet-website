// app/routes/user-certificate/data/user-certificateApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

/* ================================
   📘 Types
================================ */
export interface DownloadHistory {
  ip: string;
  device: string;
  os?: string;
  browser?: string;
  downloadedAt: string;
}

export interface UserCertificate {
  _id: string;
  name: string;
  phone: string;
  email: string;
  pdfUrl: string;
  isVerified: boolean;
  downloads: DownloadHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export const userCertificateApi = createApi({
  reducerPath: "userCertificateApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ["UserCertificate"],

  endpoints: (builder) => ({
    /* =====================================================
       🟢 PUBLIC — Verify & Download Certificate
    ===================================================== */
    verifyUserCertificate: builder.mutation<
      { success: boolean; data: { pdfUrl: string } },
      { phone: string; email: string }
    >({
      query: (payload) => ({
        url: "certificate/download/verify",
        method: "POST",
        body: payload,
      }),
    }),

    /* =====================================================
       🔵 ADMIN — Get All User Certificates
    ===================================================== */
    getUserCertificates: builder.query<
      PaginatedResponse<UserCertificate>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `certificate/download/admin?page=${page}&limit=${limit}`,
      providesTags: ["UserCertificate"],
    }),

    /* =====================================================
       🔵 ADMIN — Get Single User Certificate
    ===================================================== */
    getUserCertificateById: builder.query<
      SingleResponse<UserCertificate>,
      string
    >({
      query: (id) => `certificate/download/admin/${id}`,
      providesTags: ["UserCertificate"],
    }),

    /* =====================================================
       🔵 ADMIN — Create Certificate (Upload PDF)
    ===================================================== */
    createUserCertificate: builder.mutation<
      SingleResponse<UserCertificate>,
      FormData
    >({
      query: (formData) => ({
        url: "certificate/download/admin",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["UserCertificate"],
    }),

    /* =====================================================
       🔵 ADMIN — Update Certificate
    ===================================================== */
    updateUserCertificate: builder.mutation<
      SingleResponse<UserCertificate>,
      { id: string; data: Partial<UserCertificate> }
    >({
      query: ({ id, data }) => ({
        url: `certificate/download/admin/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["UserCertificate"],
    }),

    /* =====================================================
       🔵 ADMIN — Delete Certificate
    ===================================================== */
    deleteUserCertificate: builder.mutation<
      { success: boolean },
      string
    >({
      query: (id) => ({
        url: `certificate/download/admin/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserCertificate"],
    }),
  }),
});

export const {
  useVerifyUserCertificateMutation,
  useGetUserCertificatesQuery,
  useGetUserCertificateByIdQuery,
  useCreateUserCertificateMutation,
  useUpdateUserCertificateMutation,
  useDeleteUserCertificateMutation,
} = userCertificateApi;
