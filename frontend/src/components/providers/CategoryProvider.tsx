"use client";
import { useEffect } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";

export default function CategoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchCategories = useCategoryStore((s) => s.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return <>{children}</>;
}
