// app/features/app-configuration/index.tsx


"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  useGetAppConfigurationQuery,
  useUpdateAppConfigurationMutation,
} from "./data/appConfigurationApi";
import { DataTable } from "@/components/crud";
import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Pencil,
  RefreshCcw,
} from "lucide-react";

/**
 * 🧩 App Configuration Index Page
 */
export default function AppConfigurationPage() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetAppConfigurationQuery();
  const [updateAppConfiguration] = useUpdateAppConfigurationMutation();

  const appConfig = data?.app_config_data ? [data.app_config_data] : [];

  // ✅ Handle Edit
  const handleEdit = (item: any) => {
    navigate(`/admin/app-configuration/edit/${item._id}`);
  };

  // ✅ Columns for All App Config Fields
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "appName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          App Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.appName || "-"}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => row.original.phoneNumber || "-",
    },
    {
      accessorKey: "companyAddress",
      header: "Company Address",
      cell: ({ row }) =>
        row.original.companyAddress?.length ? (
          <div className="flex flex-col gap-1">
            {row.original.companyAddress.map((addr: any, i: number) => (
              <div key={i} className="text-sm">
                <p className="text-muted-foreground">{addr.address || "—"}</p>
                {addr.googleMapLocation && (
                  <a
                    href={addr.googleMapLocation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline"
                  >
                    View Map
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          "-"
        ),
    },
   
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) =>
        new Date(row.original.updatedAt).toLocaleString("en-IN"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEdit(row.original)}
        >
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="p-0 space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">App Configuration</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => navigate("/admin/app-configuration/edit")}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Configuration
          </Button>
        </div>
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={appConfig}
        isLoading={isLoading}
        searchKey="appName"
        pagination={{
          page: 1,
          totalPages: 1,
          onPageChange: () => {},
          pageSize: 1,
          onPageSizeChange: () => {},
        }}
      />
    </div>
  );
}
