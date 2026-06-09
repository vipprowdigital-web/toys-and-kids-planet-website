// app/features/orders/index.tsx
// Orders list page in the admin console — under Product Management.

import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  Eye,
  Search,
  TrendingUp,
  Package,
  IndianRupee,
  ShoppingBag,
  RefreshCw,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/crud";
import {
  useGetOrdersQuery,
  useGetOrderStatsQuery,
  useDeleteOrderMutation,
} from "./data/orderApi";

// ── Status helpers ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-sky-100 text-sky-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  returned: "bg-purple-100 text-purple-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-purple-100 text-purple-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
        STATUS_COLORS[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
        PAYMENT_COLORS[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="bg-card border rounded-xl p-4 flex items-start gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function OrdersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteOrderNum, setDeleteOrderNum] = useState<string>("");

  const { data: statsData } = useGetOrderStatsQuery();
  const { data, isLoading, refetch } = useGetOrdersQuery({
    page,
    limit,
    status: statusFilter === "all" ? "" : statusFilter,
    paymentStatus: paymentFilter === "all" ? "" : paymentFilter,
    search,
  });
  const [deleteOrder, { isLoading: deleting }] = useDeleteOrderMutation();

  const orders = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const stats = statsData?.data;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteOrder(deleteTargetId).unwrap();
      toast.success(`Order ${deleteOrderNum} deleted.`);
    } catch {
      toast.error("Failed to delete order.");
    } finally {
      setDeleteTargetId(null);
      setDeleteOrderNum("");
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "_orderNumber",
      header: "Order #",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-foreground">
          {row.original._orderNumber || row.original._id?.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => {
        const c = row.original.customer;
        const name = typeof c === "object" ? c?.name : null;
        const email = typeof c === "object" ? c?.email : row.original.customerEmail;
        return (
          <div className="min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {name || "—"}
            </p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        );
      },
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original.items?.length ?? 0}</Badge>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold">
          ₹{row.original.totalAmount?.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground uppercase font-medium">
          {row.original.paymentMethod}
        </span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "Payment",
      cell: ({ row }) => (
        <PaymentBadge status={row.original.paymentStatus} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
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
            <DropdownMenuItem
              onClick={() => navigate(`/admin/orders/${row.original._id}`)}
            >
              <Eye className="mr-2 h-4 w-4" /> View / Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={() => {
                setDeleteTargetId(row.original._id);
                setDeleteOrderNum(
                  row.original._orderNumber ||
                    row.original._id?.slice(-8).toUpperCase(),
                );
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and update all customer orders
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingBag}
          />
          <StatCard
            label="Revenue (Paid)"
            value={`₹${stats.totalRevenue?.toLocaleString("en-IN")}`}
            icon={IndianRupee}
          />
          <StatCard
            label="Pending Payment"
            value={stats.byPayment?.pending ?? 0}
            icon={Package}
            sub="COD + unpaid"
          />
          <StatCard
            label="Delivered"
            value={stats.byStatus?.delivered ?? 0}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 w-56"
              placeholder="Order # or email…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm">Search</Button>
          {search && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
            >
              Clear
            </Button>
          )}
        </form>

        {/* Status filter */}
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {["placed","confirmed","processing","shipped","delivered","cancelled","returned"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Payment filter */}
        <Select
          value={paymentFilter || "all"}
          onValueChange={(v) => { setPaymentFilter(v === "all" ? "" : v); setPage(1); }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All payments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            {["pending","paid","failed","refunded"].map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={orders}
        isLoading={isLoading}
        searchKey="customerEmail"
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          pageSize: limit,
          onPageSizeChange: () => {},
        }}
        onDelete={async () => {}}
        deleteItemNameKey="_orderNumber"
      />

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null);
            setDeleteOrderNum("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete order{" "}
              <strong>{deleteOrderNum}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting…" : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
