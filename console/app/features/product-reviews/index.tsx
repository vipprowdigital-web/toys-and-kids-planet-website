import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Star } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/crud";
import {
  useGetAllReviewsQuery,
  useAdminUpdateReviewMutation,
  useAdminDeleteReviewMutation,
  type ProductReview,
} from "./data/reviewApi";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
    </div>
  );
}

export default function ProductReviewsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useGetAllReviewsQuery({ page, limit });
  const [adminUpdate] = useAdminUpdateReviewMutation();
  const [adminDelete] = useAdminDeleteReviewMutation();

  const reviews = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<ProductReview | null>(null);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<ProductReview | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, title: "", body: "", isApproved: true });

  const openEdit = (review: ProductReview) => {
    setEditTarget(review);
    setEditForm({
      rating: review.rating,
      title: review.title ?? "",
      body: review.body,
      isApproved: review.isApproved,
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await toast.promise(adminDelete(deleteTarget._id).unwrap(), {
      loading: "Deleting review…",
      success: "Review deleted.",
      error: "Failed to delete review.",
    });
    setDeleteTarget(null);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    await toast.promise(
      adminUpdate({ id: editTarget._id, data: editForm }).unwrap(),
      {
        loading: "Updating review…",
        success: "Review updated.",
        error: "Failed to update review.",
      },
    );
    setEditTarget(null);
  };

  const columns: ColumnDef<ProductReview>[] = [
    {
      accessorKey: "customerName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.customerName}</span>
      ),
    },

    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => {
        const p = row.original.product;
        const name = typeof p === "object" ? p.name : p;
        return <span className="text-muted-foreground text-sm">{name || "—"}</span>;
      },
    },

    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => <StarDisplay rating={row.original.rating} />,
    },

    {
      accessorKey: "body",
      header: "Review",
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
          {row.original.body}
        </p>
      ),
    },

    {
      accessorKey: "verified",
      header: "Verified",
      cell: ({ row }) =>
        row.original.verified ? (
          <Badge className="bg-green-100 text-green-700 border-0 text-xs">Verified</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">Unverified</Badge>
        ),
    },

    {
      accessorKey: "isApproved",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Approved <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Switch
          checked={row.original.isApproved}
          onCheckedChange={(checked) =>
            toast.promise(
              adminUpdate({ id: row.original._id, data: { isApproved: checked } }).unwrap(),
              {
                loading: "Updating…",
                success: checked ? "Review approved." : "Review hidden.",
                error: "Failed to update.",
              },
            )
          }
        />
      ),
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-IN"),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteTarget(row.original)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-0 space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Product Reviews</h1>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          {data?.pagination?.total ?? 0} total
        </Badge>
      </div>

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        searchKey="customerName"
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          pageSize: limit,
          onPageSizeChange: setLimit,
        }}
        onDelete={(item) => setDeleteTarget(item)}
        deleteItemNameKey="customerName"
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the review by{" "}
              <strong>{deleteTarget?.customerName}</strong>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Star picker */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEditForm((f) => ({ ...f, rating: n }))}
                  >
                    <Star
                      size={24}
                      className={
                        n <= editForm.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200 fill-gray-200"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Review title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Body</label>
              <Textarea
                value={editForm.body}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, body: e.target.value }))
                }
                rows={4}
                placeholder="Review body"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={editForm.isApproved}
                onCheckedChange={(v) =>
                  setEditForm((f) => ({ ...f, isApproved: v }))
                }
              />
              <label className="text-sm font-medium">Approved</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
