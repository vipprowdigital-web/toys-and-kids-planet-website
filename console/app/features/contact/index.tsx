// app/features/contact/index.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import {
  useGetContactsQuery,
  usePartiallyUpdateContactMutation,
  useDeleteContactMutation,
  useRespondToContactMutation,
} from "~/features/contact/data/contactApi";

import { DataTable, BulkActions } from "@/components/crud";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  Reply,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ContactPage() {
  const navigate = useNavigate();

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] = React.useState<any>(null);

  // 🔥 Fetch contacts (paginated)
  const { data, isLoading } = useGetContactsQuery({ page, limit });
  // console.log("CONTACT DATA: ", data);

  const [updateContact] = usePartiallyUpdateContactMutation();
  const [deleteContact] = useDeleteContactMutation();
  const [respondToContact] = useRespondToContactMutation();

  const contactData = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  /* -----------------------------------------------
     🗑 DELETE HANDLER
  ------------------------------------------------ */
  const handleDelete = async (item: any) => {
    await toast.promise(deleteContact(item._id).unwrap(), {
      loading: `Deleting message from ${item.name}...`,
      success: `Message from "${item.name}" deleted successfully!`,
      error: "Failed to delete contact message.",
    });
  };

  /* -----------------------------------------------
     🔄 UPDATE STATUS (PATCH)
  ------------------------------------------------ */
  const handleToggleStatus = async (item: any) => {
    try {
      await updateContact({
        id: item._id,
        data: { status: item.status === "answered" ? "pending" : "answered" },
      }).unwrap();

      toast.success(
        `Status updated to ${
          item.status === "answered" ? "Pending" : "Answered"
        }`,
      );
    } catch {
      toast.error("Failed to update contact status.");
    }
  };

  /* -----------------------------------------------
     📨 SEND ADMIN RESPONSE
  ------------------------------------------------ */
  const handleSendResponse = async (item: any) => {
    const message = prompt(`Enter your response to ${item.email}:`);

    if (!message) return;

    try {
      await toast.promise(
        respondToContact({ id: item._id, data: { message } }).unwrap(),
        {
          loading: "Sending response...",
          success: "Message responded successfully!",
          error: "Failed to send reply.",
        },
      );
    } catch (_) {}
  };

  /* -----------------------------------------------
     📊 TABLE COLUMNS
  ------------------------------------------------ */
  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },

    {
      accessorKey: "type",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.type}</span>
      ),
    },

    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },

    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          className="text-blue-600 underline"
        >
          {row.original.email}
        </a>
      ),
    },

    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "-",
    },

    {
      accessorKey: "services",
      header: "Services",
      cell: ({ row }) => {
        const services = row.original.services || [];
        return services.length > 0
          ? services.map((s: any) => s.title).join(", ")
          : "-";
      },
    },

    // {
    //   accessorKey: "subject",
    //   header: "Subject",
    //   cell: ({ row }) => row.original.subject || "-",
    // },

    {
      accessorKey: "status",
      header: "Answered",
      cell: ({ row }) => (
        <Switch
          checked={row.original.status === "answered"}
          onCheckedChange={() => handleToggleStatus(row.original)}
        />
      ),
    },

    // {
    //   accessorKey: "createdAt",
    //   header: "Created At",
    //   cell: ({ row }) =>
    //     new Date(row.original.createdAt).toLocaleString("en-IN"),
    // },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const item = row.original;
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
                onClick={() => navigate(`/admin/contact/edit/${item._id}`)}
              >
                <FileText className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleSendResponse(item)}>
                <Reply className="mr-2 h-4 w-4" /> Respond
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(item)
                }
                className="text-red-600"
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
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Contact Messages</h1>
      </div>

      {/* BULK ACTIONS */}
      {tableInstance && (
        <BulkActions table={tableInstance} entityName="contact" />
      )}

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={contactData}
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
