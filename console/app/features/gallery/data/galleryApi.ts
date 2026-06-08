// app/routes/gallery/data/galleryApi.ts - (using RTK Query)

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const galleryApi = createApi({
  reducerPath: "galleryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Gallery"],

  endpoints: (builder) => ({
    /* ================================
       🟢 Public Routes
       ================================ */

    // ✅ Get all active galleries (Public)
    getPublicGalleries: builder.query({
      query: () => `gallery/active`,
      providesTags: ["Gallery"],
    }),

    // ✅ Get single public gallery by ID
    getPublicGalleryById: builder.query({
      query: (id: string) => `gallery/${id}`,
      providesTags: ["Gallery"],
    }),

    /* ================================
       🔒 Admin-Protected Routes
       ================================ */

    // ✅ Get all galleries (paginated + searchable)
    getGalleries: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `gallery?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Gallery"],
    }),

    // ✅ Get single gallery (admin)
    getGalleryById: builder.query({
      query: (id: string) => `gallery/${id}`,
      providesTags: ["Gallery"],
    }),

    // ✅ Create new gallery (multipart/form-data)
    createGallery: builder.mutation({
      query: (formData: FormData) => ({
        url: `gallery`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Gallery"],
    }),

    // ✅ Update gallery (PUT)
    updateGallery: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `gallery/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Gallery"],
    }),

    // ✅ Partial update (PATCH)
    partiallyUpdateGallery: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `gallery/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Gallery"],
    }),

    // ✅ Delete gallery
    deleteGallery: builder.mutation({
      query: (id: string) => ({
        url: `gallery/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Gallery"],
    }),
  }),
});

export const {
  useGetPublicGalleriesQuery,
  useGetPublicGalleryByIdQuery,
  useGetGalleriesQuery,
  useGetGalleryByIdQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  usePartiallyUpdateGalleryMutation,
  useDeleteGalleryMutation,
} = galleryApi;
