// app/components/crud/DataTable.tsx

"use client";
import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { GitCompare, Loader2, TriangleAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
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
import { toast } from "sonner";
import { RowsPerPageDropdownMenu } from "~/components/crud/RowsPerPageMenu";
import { PaginationControls } from "~/components/crud/Pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchKey: string;
  pagination: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
  };
  onDelete?: (item: TData) => Promise<void>;
  deleteItemNameKey?: keyof TData;
  onTableReady?: (table: any) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchKey,
  pagination,
  onDelete,
  deleteItemNameKey = "record" as keyof TData,
  onTableReady,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<TData | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const openDeleteDialog = (item: TData) => {
    if (!onDelete) return;
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !onDelete) return;
    const name = (itemToDelete as any)[deleteItemNameKey] || "this item";
    setIsDeleting(true);

    await toast.promise(onDelete(itemToDelete), {
      loading: `Deleting ${name}...`,
      success: `${name} deleted successfully!`,
      error: `Failed to delete ${name}.`,
    });

    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount: pagination.totalPages,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    meta: { openDeleteDialog },
  });

  React.useEffect(() => {
    if (onTableReady) onTableReady(table);
  }, [table, onTableReady]);

  return (
    <div className="w-full">
      {/* 🔍 Search + Column Toggle */}
      <div className="flex items-center py-4">
        <Input
          placeholder={`Filter by ${searchKey}...`}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn(searchKey)?.setFilterValue(e.target.value)
          }
          className="max-w-xs"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              View <GitCompare />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 📋 Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* 📄 Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} selected.
        </div>
        <div className="flex justify-center">
          <RowsPerPageDropdownMenu
            pageSize={pagination.pageSize}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        </div>
        <div className="flex justify-end">
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            pageSize={pagination.pageSize}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        </div>
      </div>

      {/* 🗑️ Delete Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setIsDeleteDialogOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <div className="bg-destructive/10 mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
              <TriangleAlertIcon className="text-destructive size-6" />
            </div>
            <AlertDialogTitle>
              Delete{" "}
              <span className="font-semibold text-destructive">
                {(itemToDelete as any)?.[deleteItemNameKey] ?? "Unknown"}
              </span>
              ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">
              You are about to delete this item permanently. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white min-w-[120px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
