// app/components/crud/RowsPerPageMenu.tsx

"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArchiveIcon, ChevronDown, MailCheckIcon } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
// 1. Define props to make the component interactive
interface RowsPerPageDropdownMenuProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}
const pageSizeOptions = [10, 20, 30, 50, 100];
export function RowsPerPageDropdownMenu({
  pageSize,
  onPageSizeChange,
}: RowsPerPageDropdownMenuProps) {
  return (
    <ButtonGroup>
      <Button variant="outline">Per page</Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="More Options"
            className="px-8"
          >
            {pageSize}
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            {pageSizeOptions.map((size) => (
              <DropdownMenuItem
                key={size}
                onSelect={() => onPageSizeChange(size)}
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
