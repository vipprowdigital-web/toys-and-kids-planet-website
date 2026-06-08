// app/routes/category/data/categoryApi.ts - (using RTK Query)

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const categoryApi = createApi({
    reducerPath: "categoryApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL}/`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Category"],

    endpoints: (builder) => ({
        // ✅ Get paginated categories
        getCategories: builder.query({
            query: ({ page = 1, limit = 20 }) =>
                `categories?page=${page}&limit=${limit}`,
            providesTags: ["Category"],
        }),

        // ✅ Get category by ID
        getCategoryById: builder.query({
            query: (id) => `categories/${id}`,
            providesTags: ["Category"],
        }),

        // ✅ Create category (multipart/form-data)
        createCategory: builder.mutation({
            query: (formData) => ({
                url: "categories",
                method: "POST",
                // 🚀 Don’t serialize FormData — send it directly
                body: formData,
            }),
            invalidatesTags: ["Category"],
        }),

        // ✅ Update category (multipart/form-data)
        updateCategory: builder.mutation({
            query: ({ id, formData }) => ({
                url: `categories/${id}`,
                method: "PUT", // 🧠 Use PUT, your backend uses PUT for full update
                body: formData,
            }),
            invalidatesTags: ["Category"],
        }),

        // ✅ Partial update (toggle only)
        partiallyUpdateCategory: builder.mutation({
            query: ({ id, data }) => ({
                url: `categories/${id}`,
                method: "PATCH",
                body: data, // small JSON patch like { isActive: false }
            }),
            invalidatesTags: ["Category"],
        }),

        // ✅ Delete
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Category"],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    usePartiallyUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;

