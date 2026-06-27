"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  useGetVendorProductsQuery,
  usePatchVendorProductMutation,
  useDeleteVendorProductMutation,
} from "./data/vendorProductApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
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
import { CirclePlus, Pencil, Trash2 } from "lucide-react";
import { getVendorData } from "~/utils/vendorAuth";

export default function VendorProductsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const vendor = getVendorData();

  const { data, isLoading, isFetching } = useGetVendorProductsQuery({ page, limit: 10, search });
  const [patchProduct] = usePatchVendorProductMutation();
  const [deleteProduct] = useDeleteVendorProductMutation();

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const handleToggleActive = async (product: any) => {
    try {
      await patchProduct({ id: product._id, data: { isActive: !product.isActive } }).unwrap();
      toast.success(`"${product.name}" ${product.isActive ? "deactivated" : "activated"}.`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (product: any) => {
    try {
      await deleteProduct(product._id).unwrap();
      toast.success(`"${product.name}" deleted.`);
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          {vendor && (
            <p className="text-muted-foreground text-sm">Shop: {vendor.shopName}</p>
          )}
        </div>
        <Button onClick={() => navigate("/vendor/products/create")}>
          <CirclePlus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <Input
        placeholder="Search products..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="max-w-sm"
      />

      {isLoading || isFetching ? (
        <div className="text-center p-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No products yet. Add your first product!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.images?.[0]?.url && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.badge && (
                            <Badge variant="secondary" className="text-xs mt-0.5">{product.badge}</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{product.price}</div>
                      {product.discount > 0 && (
                        <div className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{product.stockQuantity} units</div>
                      <div className={`text-xs ${product.inStock ? "text-green-600" : "text-red-500"}`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch checked={product.isActive} onCheckedChange={() => handleToggleActive(product)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <span>⭐</span>
                        <span>{product.rating?.toFixed(1) ?? "0.0"}</span>
                        <span className="text-muted-foreground">({product.reviewCount})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/vendor/products/edit/${product._id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove this product from your shop.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(product)} className="bg-red-600 hover:bg-red-700">
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} products)
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
