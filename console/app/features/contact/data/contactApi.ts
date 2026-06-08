// app/routes/contact/data/contactApi.ts - (using RTK Query)

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const contactApi = createApi({
    reducerPath: "contactApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL}/`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Contact"],

    endpoints: (builder) => ({
        /* ===========================
           Public
           =========================== */

        // Public: submit contact form
        submitContact: builder.mutation({
            query: (data: any) => ({
                url: `contact/submit`,
                method: "POST",
                body: data,
            }),
            // not invalidating admin list by default (unless you want admin to auto-refresh when public submits)
            invalidatesTags: ["Contact"],
        }),

        /* ===========================
           Admin / Protected
           =========================== */

        // Get all contact messages (paginated + search)
        getContacts: builder.query<
            any,
            { page?: number; limit?: number; search?: string }
        >({
            query: ({ page = 1, limit = 20, search = "" } = {}) =>
                `contact?page=${page}&limit=${limit}&search=${encodeURIComponent(
                    search
                )}`,
            providesTags: (result) =>
                result
                    ? [
                        // provides a tag for the list and each entity for fine-grained invalidation
                        ...result.data?.map((c: any) => ({ type: "Contact" as const, id: c._id })) ?? [],
                        { type: "Contact", id: "LIST" },
                    ]
                    : [{ type: "Contact", id: "LIST" }],
        }),

        // Get single contact by ID (admin)
        getContactById: builder.query<any, string>({
            query: (id: string) => `contact/${id}`,
            providesTags: (result, error, id) => [{ type: "Contact", id }],
        }),

        // Full update (PUT)
        updateContact: builder.mutation({
            query: ({ id, data }: { id: string; data: any }) => ({
                url: `contact/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Contact", id },
                { type: "Contact", id: "LIST" },
            ],
        }),

        // Partial update (PATCH) - e.g. mark read, change status
        partiallyUpdateContact: builder.mutation({
            query: ({ id, data }: { id: string; data: any }) => ({
                url: `contact/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Contact", id },
                { type: "Contact", id: "LIST" },
            ],
        }),

        // Admin: respond to a contact message
        respondToContact: builder.mutation({
            query: ({ id, data }: { id: string; data: { message: string } }) => ({
                url: `contact/respond/${id}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Contact", id },
                { type: "Contact", id: "LIST" },
            ],
        }),

        // Delete contact
        deleteContact: builder.mutation({
            query: (id: string) => ({
                url: `contact/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Contact", id },
                { type: "Contact", id: "LIST" },
            ],
        }),
    }),
});

export const {
    // Public
    useSubmitContactMutation,

    // Admin queries
    useGetContactsQuery,
    useGetContactByIdQuery,

    // Admin mutations
    useUpdateContactMutation,
    usePartiallyUpdateContactMutation,
    useRespondToContactMutation,
    useDeleteContactMutation,
} = contactApi;