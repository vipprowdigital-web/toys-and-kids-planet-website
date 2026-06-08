// app/features/products/data/index.tsx
//
// The products list page. Mirrors gallery/data/index.tsx in structure.
// Shows the data table with all products, inline active/featured toggles,
// and two upload entry points in the header: single and bulk.

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  useGetProductsQuery,
  usePartiallyUpdateProductMutation,
  useDeleteProductMutation,
} from "./data/productApi";
import { DataTable, BulkActions } from "@/components/crud";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  ArrowUpDown,
  CirclePlus,
  FileSpreadsheet,
  MoreHorizontal,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] = React.useState<any>(null);

  const { data, isLoading } = useGetProductsQuery({ page, limit });
  const [toggleProductStatus] = usePartiallyUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const productData = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  // Delete a single product — same toast.promise pattern as gallery
  const handleDelete = async (item: any) => {
    await toast.promise(deleteProduct(item._id).unwrap(), {
      loading: `Deleting "${item.name}"...`,
      success: `Product "${item.name}" deleted successfully!`,
      error: "Failed to delete product.",
    });
  };

  // Toggle isActive inline from the table — same pattern as gallery
  const handleToggleActive = async (product: any) => {
    try {
      await toggleProductStatus({
        id: product._id,
        data: { isActive: !product.isActive },
      }).unwrap();
      toast.success(
        `"${product.name}" has been ${product.isActive ? "deactivated" : "activated"}.`,
      );
    } catch {
      toast.error("Failed to update product status.");
    }
  };

  // Toggle isFeatured inline — products have this field, gallery doesn't
  const handleToggleFeatured = async (product: any) => {
    try {
      await toggleProductStatus({
        id: product._id,
        data: { isFeatured: !product.isFeatured },
      }).unwrap();
      toast.success(
        `"${product.name}" has been ${product.isFeatured ? "unfeatured" : "featured"}.`,
      );
    } catch {
      toast.error("Failed to update featured status.");
    }
  };

  const columns: ColumnDef<any>[] = [
    // Select checkbox — identical to gallery
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },

    // Product thumbnail — shows first image from the images array
    {
      accessorKey: "images",
      header: "Image",
      cell: ({ row }) => {
        const firstImage = row.original.images?.[0]?.url;
        return firstImage ? (
          <img
            src={firstImage}
            alt={row.original.name}
            className="h-10 w-10 rounded object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
            <ImageIcon className="h-4 w-4 opacity-60 text-muted-foreground" />
          </div>
        );
      },
    },

    // Product name with sortable header
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          {/* <p className="text-xs text-muted-foreground">/{row.original.slug}</p> */}
        </div>
      ),
    },

    // Category — the populated category object or raw string
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const cat = row.original.category;
        const label = typeof cat === "object" ? cat?.name : cat;
        return (
          <span className="text-muted-foreground text-sm">{label || "-"}</span>
        );
      },
    },

    // Variant count badge — useful at-a-glance info for a product with many variants
    {
      id: "variants",
      header: "Variants",
      cell: ({ row }) => {
        const count = row.original.variants?.length ?? 0;
        return (
          <Badge variant="secondary" className="tabular-nums">
            {count}
          </Badge>
        );
      },
    },

    // isFeatured toggle — products have this, gallery doesn't
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) => (
        <button
          onClick={() => handleToggleFeatured(row.original)}
          className="text-muted-foreground hover:text-amber-500 transition-colors"
          title={row.original.isFeatured ? "Unfeature" : "Feature"}
        >
          <Star
            className="h-4 w-4"
            fill={row.original.isFeatured ? "currentColor" : "none"}
            color={row.original.isFeatured ? "#f59e0b" : "currentColor"}
          />
        </button>
      ),
    },

    // isActive toggle — identical pattern to gallery
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Active
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() => handleToggleActive(row.original)}
        />
      ),
    },

    // Created date — same locale as gallery
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-IN"),
    },

    // Actions dropdown — edit and delete
    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate(`/admin/products/edit/${product._id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(product)
                }
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="p-0 space-y-3">
      {/* HEADER — two action buttons instead of gallery's one */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Products</h1>
        <div className="flex gap-2">
          {/* Bulk upload — secondary action */}
          <Button
            variant="outline"
            onClick={() => navigate("/admin/products/bulk-upload")}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          {/* Single product create — primary action */}
          <Button onClick={() => navigate("/admin/products/create")}>
            <CirclePlus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {tableInstance && (
        <BulkActions table={tableInstance} entityName="product" />
      )}

      <DataTable
        columns={columns}
        data={productData}
        isLoading={isLoading}
        searchKey="name"
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          pageSize: limit,
          onPageSizeChange: setLimit,
        }}
        onDelete={handleDelete}
        deleteItemNameKey="name"
        onTableReady={setTableInstance}
      />
    </div>
  );
}
