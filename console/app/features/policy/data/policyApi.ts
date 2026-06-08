// app/routes/policy/data/policyApi.ts - (using RTK Query)

// app/routes/policy/data/policyApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const policyApi = createApi({
    reducerPath: "policyApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL}/`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Policy"],

    endpoints: (builder) => ({
        /**
         * 🟢 Public Routes
         */

        // ✅ Get all active policies (Public)
        getPublicPolicies: builder.query({
            query: () => `policy/public`,
            providesTags: ["Policy"],
        }),

        // ✅ Get single public policy by slug
        getPublicPolicyBySlug: builder.query({
            query: (slug: string) => `policy/public/${slug}`,
            providesTags: ["Policy"],
        }),

        /**
         * 🔒 Admin-Protected Routes
         */

        // ✅ Get all policies (paginated + searchable)
        getPolicies: builder.query({
            query: ({
                page = 1,
                limit = 10,
                search = "",
            }: {
                page?: number;
                limit?: number;
                search?: string;
            }) => `policy?page=${page}&limit=${limit}&search=${search}`,
            providesTags: ["Policy"],
        }),

        // ✅ Get single policy (admin)
        getPolicyById: builder.query({
            query: (id: string) => `policy/${id}`,
            providesTags: ["Policy"],
        }),

        // ✅ Create new policy
        createPolicy: builder.mutation({
            query: (data: any) => ({
                url: `policy`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Policy"],
        }),

        // ✅ Update policy (PUT)
        updatePolicy: builder.mutation({
            query: ({ id, data }: { id: string; data: any }) => ({
                url: `policy/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Policy"],
        }),

        // ✅ Partial update (PATCH)
        partiallyUpdatePolicy: builder.mutation({
            query: ({ id, data }: { id: string; data: any }) => ({
                url: `policy/${id}`,
                method: "PATCH",
                body: data, // e.g. { isActive: false }
            }),
            invalidatesTags: ["Policy"],
        }),

        // ✅ Delete policy
        deletePolicy: builder.mutation({
            query: (id: string) => ({
                url: `policy/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Policy"],
        }),
    }),
});

export const {
    useGetPublicPoliciesQuery,
    useGetPublicPolicyBySlugQuery,
    useGetPoliciesQuery,
    useGetPolicyByIdQuery,
    useCreatePolicyMutation,
    useUpdatePolicyMutation,
    usePartiallyUpdatePolicyMutation,
    useDeletePolicyMutation,
} = policyApi;
