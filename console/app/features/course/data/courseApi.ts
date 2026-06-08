// app/routes/course/data/courseApi.ts - (using RTK Query)// app/routes/course/data/courseApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    filter?: string;
}

export interface Course {
    _id?: string;
    title: string;
    slug?: string;
    category?: string | null;

    short_description?: string;
    description?: string;

    level?: "beginner" | "intermediate" | "advanced";
    duration?: string;

    price?: number;
    sale_price?: number;
    lessons_count?: number;
    intro_video?: string | null;

    thumbnail?: string | null;
    gallery_images?: string[];

    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string[];
    };

    isActive?: boolean;
    isFeature?: boolean;

    createdAt?: string;
    updatedAt?: string;
}

export const courseApi = createApi({
    reducerPath: "courseApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL}/`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Course"],

    endpoints: (builder) => ({
        /* ------------------ 🟢 PUBLIC ------------------ */
        getPublicCourses: builder.query<
            { data: Course[]; pagination: any },
            PaginationParams
        >({
            query: ({ page = 1, limit = 10, search = "" }) =>
                `course?page=${page}&limit=${limit}&search=${encodeURIComponent(
                    search
                )}`,
            providesTags: ["Course"],
        }),

        getCourseById: builder.query<{ data: Course }, string>({
            query: (id) => `course/${id}`,
            providesTags: (result, error, id) => [{ type: "Course", id }],
        }),

        /* ------------------ 🔒 ADMIN ------------------ */
        getCourses: builder.query<
            { data: Course[]; pagination: any },
            PaginationParams
        >({
            query: ({
                page = 1,
                limit = 10,
                search = "",
                sortBy = "createdAt",
                sortOrder = "desc",
                filter = "all",
            }) =>
                `course/admin/all?page=${page}&limit=${limit}&search=${encodeURIComponent(
                    search
                )}&sortBy=${sortBy}&sortOrder=${sortOrder}&filter=${filter}`,
            providesTags: ["Course"],
        }),

        createCourse: builder.mutation<
            { message: string; data: Course },
            FormData
        >({
            query: (formData) => ({
                url: `course/admin`,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Course"],
        }),

        updateCourse: builder.mutation<
            { message: string; data: Course },
            { id: string; formData: FormData }
        >({
            query: ({ id, formData }) => ({
                url: `course/admin/${id}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Course", id },
                "Course",
            ],
        }),

        partiallyUpdateCourse: builder.mutation<
            { message: string; data: Course },
            { id: string; data: Partial<Course> }
        >({
            query: ({ id, data }) => ({
                url: `course/admin/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Course"],
        }),

        deleteCourse: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `course/admin/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Course"],
        }),
    }),
});

export const {
    useGetPublicCoursesQuery,
    useGetCourseByIdQuery,

    useGetCoursesQuery,
    useCreateCourseMutation,
    useUpdateCourseMutation,
    usePartiallyUpdateCourseMutation,
    useDeleteCourseMutation,
} = courseApi;
