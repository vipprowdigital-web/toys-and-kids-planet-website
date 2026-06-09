// app/features/orders/data/orderApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

// ── Types ──────────────────────────────────────────────────────────────────

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: { color?: string; size?: string };
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerSnippet {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface Order {
  _id: string;
  _orderNumber?: string;
  customer: CustomerSnippet | string;
  customerEmail?: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCharge: number;
  tax: number;
  discount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status:
    | "placed"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  trackingNumber?: string;
  courierName?: string;
  adminNote?: string;
  customerNote?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SingleOrderResponse {
  success: boolean;
  data: Order;
}

export interface OrderStatsResponse {
  success: boolean;
  data: {
    totalOrders: number;
    totalRevenue: number;
    byStatus: Record<string, number>;
    byPayment: Record<string, number>;
  };
}

export interface UpdateOrderStatusPayload {
  id: string;
  status?: string;
  paymentStatus?: string;
  trackingNumber?: string;
  courierName?: string;
  adminNote?: string;
  cancelReason?: string;
}

// ── API Slice ──────────────────────────────────────────────────────────────

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/admin/orders`,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Order"],

  endpoints: (builder) => ({
    getOrderStats: builder.query<OrderStatsResponse, void>({
      query: () => "/stats",
      providesTags: ["Order"],
    }),

    getOrders: builder.query<
      PaginatedOrdersResponse,
      { page?: number; limit?: number; status?: string; paymentStatus?: string; search?: string }
    >({
      query: ({ page = 1, limit = 20, status = "", paymentStatus = "", search = "" }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(status && { status }),
          ...(paymentStatus && { paymentStatus }),
          ...(search && { search }),
        });
        return `/?${params.toString()}`;
      },
      providesTags: ["Order"],
    }),

    getOrderById: builder.query<SingleOrderResponse, string>({
      query: (id) => `/${id}`,
      providesTags: ["Order"],
    }),

    updateOrderStatus: builder.mutation<SingleOrderResponse, UpdateOrderStatusPayload>({
      query: ({ id, ...body }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    deleteOrder: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetOrderStatsQuery,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = orderApi;
