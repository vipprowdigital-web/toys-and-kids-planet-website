// app/routes/app-configuration/data/appConfigurationApi.ts - (using RTK Query)


import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const appConfigurationApi = createApi({
    reducerPath: "appConfigurationApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL}/`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["AppConfig"],

    endpoints: (builder) => ({
        // 🟢 Public: Get latest App Config
        getPublicAppConfig: builder.query({
            query: () => `app-config/public`,
            providesTags: ["AppConfig"],
        }),

        // 🔒 Admin: Get App Config
        getAppConfiguration: builder.query<any, void>({
            query: () => `app-config`,
            providesTags: ["AppConfig"],
        }),

        // 🔒 Admin: Update App Config
        updateAppConfiguration: builder.mutation({
            query: (data: any) => ({
                url: `app-config`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["AppConfig"],
        }),
    }),
});

export const {
    useGetPublicAppConfigQuery,
    useGetAppConfigurationQuery,
    useUpdateAppConfigurationMutation,
} = appConfigurationApi;
