// app/features/product-category/data/productCategoryApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const productCategoryApi = createApi({
  reducerPath: "productCategoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["ProductCategory"],

  endpoints: (builder) => ({
    // ✅ Get paginated product categories
    getProductCategories: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `product-categories?page=${page}&limit=${limit}`,
      providesTags: ["ProductCategory"],
    }),

    // ✅ Get all product categories
    getProductCategoriesAll: builder.query<any, void>({
      query: () => "product-categories/all",
      providesTags: ["ProductCategory"],
    }),

    // ✅ Get single product category by ID
    getProductCategoryById: builder.query({
      query: (slugOrId) => `product-categories/${slugOrId}`,
      providesTags: ["ProductCategory"],
    }),

    // ✅ Create product category (multipart/form-data)
    createProductCategory: builder.mutation({
      query: (formData) => ({
        url: "product-categories",
        method: "POST",
        body: formData, // Sending direct FormData for image uploads
      }),
      invalidatesTags: ["ProductCategory"],
    }),

    // ✅ Update product category (multipart/form-data)
    updateProductCategory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `product-categories/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["ProductCategory"],
    }),

    // ✅ Partial update (toggling switches directly from data tables)
    partiallyUpdateProductCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `product-categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["ProductCategory"],
    }),

    // ✅ Delete product category record
    deleteProductCategory: builder.mutation({
      query: (id) => ({
        url: `product-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ProductCategory"],
    }),
  }),
});

export const {
  useGetProductCategoriesQuery,
  useGetProductCategoriesAllQuery,
  useGetProductCategoryByIdQuery,
  useCreateProductCategoryMutation,
  useUpdateProductCategoryMutation,
  usePartiallyUpdateProductCategoryMutation,
  useDeleteProductCategoryMutation,
} = productCategoryApi;
