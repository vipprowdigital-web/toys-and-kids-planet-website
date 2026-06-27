import React, { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  useGetVendorsQuery,
  useUpdateVendorStatusMutation,
  useUpdateVendorCommissionMutation,
  useDeleteVendorMutation,
  type Vendor,
} from "./data/vendorApi";
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
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-gray-100 text-gray-700",
};

export default function VendorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, isFetching } = useGetVendorsQuery({ page, limit: 20, search, status: statusFilter });
  const [updateStatus] = useUpdateVendorStatusMutation();
  const [updateCommission] = useUpdateVendorCommissionMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  const vendors = data?.data ?? [];
  const pagination = data?.pagination;

  const handleStatusChange = async (vendor: Vendor, status: Vendor["status"]) => {
    try {
      await updateStatus({ id: vendor._id, status }).unwrap();
      toast.success(`Shop "${vendor.shopName}" ${status}.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    try {
      await deleteVendor(vendor._id).unwrap();
      toast.success(`Shop "${vendor.shopName}" deleted.`);
    } catch (err: any) {
      toast.error(err.message || "Delete failed.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vendors / Shops</h1>
        <span className="text-muted-foreground text-sm">{pagination?.total ?? 0} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Search shops..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading || isFetching ? (
        <div className="text-muted-foreground p-8 text-center">Loading...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No vendors found.
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {vendor.logo?.url && (
                          <img src={vendor.logo.url} alt={vendor.shopName} className="h-8 w-8 rounded object-cover" />
                        )}
                        <span className="font-medium">{vendor.shopName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{vendor.ownerName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{vendor.email}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[vendor.status]}`}>
                        {vendor.status}
                      </span>
                    </TableCell>
                    <TableCell>{vendor.commissionRate}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        {vendor.status === "pending" && (
                          <>
                            <Button size="sm" variant="default" onClick={() => handleStatusChange(vendor, "approved")}>
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleStatusChange(vendor, "rejected")}>
                              Reject
                            </Button>
                          </>
                        )}
                        {vendor.status === "approved" && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(vendor, "suspended")}>
                            Suspend
                          </Button>
                        )}
                        {(vendor.status === "rejected" || vendor.status === "suspended") && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(vendor, "approved")}>
                            Re-approve
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{vendor.shopName}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the shop and all their products.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(vendor)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
