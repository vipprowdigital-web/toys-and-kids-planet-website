// app/components/crud/Pagination.tsx

"use client";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const getPagesToShow = () => {
    const pages = [];
    const delta = 1;
    if (totalPages > 0) pages.push(1);
    if (page > delta + 2) pages.push("...");
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (page < totalPages - delta - 1) pages.push("...");
    if (totalPages > 1 && !pages.includes(totalPages)) pages.push(totalPages);
    return pages;
  };

  const pagesToShow = getPagesToShow();

  return (
    <Pagination className="mx-0 w-auto">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        {pagesToShow.map((p, index) =>
          p === "..." ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={page === p}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(p as number);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
