// app/routes/testimonial/data/testimonialApi.ts - (using RTK Query)

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const testimonialApi = createApi({
  reducerPath: "testimonialApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Testimonial"],

  endpoints: (builder) => ({
    /**
     * 🟢 Public Routes
     */

    // ✅ Get all active testimonials (public)
    getPublicTestimonials: builder.query({
      query: () => `testimonial/public`,
      providesTags: ["Testimonial"],
    }),

    // ✅ Get single public testimonial by ID
    getPublicTestimonialById: builder.query({
      query: (id: string) => `testimonial/view/${id}`,
      providesTags: ["Testimonial"],
    }),

    /**
     * 🔒 Admin-Protected Routes
     */

    // ✅ Get all testimonials (paginated + searchable)
    getTestimonials: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `testimonial?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Testimonial"],
    }),

    // ✅ Get single testimonial (admin)
    getTestimonialById: builder.query({
      query: (id: string) => `testimonial/${id}`,
      providesTags: ["Testimonial"],
    }),

    // ✅ Create new testimonial (multipart/form-data)
    createTestimonial: builder.mutation({
      query: (formData: FormData) => ({
        url: `testimonial`,
        method: "POST",
        body: formData, // ⚠️ FormData must not be serialized
      }),
      invalidatesTags: ["Testimonial"],
    }),

    // ✅ Update testimonial (PUT)
    updateTestimonial: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `testimonial/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Testimonial"],
    }),

    // ✅ Partial update (PATCH)
    partiallyUpdateTestimonial: builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => ({
        url: `testimonial/${id}`,
        method: "PATCH",
        body: data, // e.g. { isActive: false }
      }),
      invalidatesTags: ["Testimonial"],
    }),

    // ✅ Delete testimonial
    deleteTestimonial: builder.mutation({
      query: (id: string) => ({
        url: `testimonial/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Testimonial"],
    }),
  }),
});

export const {
  useGetPublicTestimonialsQuery,
  useGetPublicTestimonialByIdQuery,
  useGetTestimonialsQuery,
  useGetTestimonialByIdQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  usePartiallyUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} = testimonialApi;
