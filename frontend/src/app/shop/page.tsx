"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  Search,
  ChevronDown,
  X,
  Loader2,
  SearchX,
} from "lucide-react";
import { ageGroups } from "@/data/index";
import { getProducts, type GetProductsParams } from "@/lib/api";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";
import { useCategoryStore } from "@/store/useCategoryStore";
import clsx from "clsx";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

function ShopPageContent() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const urlCategory = searchParams.get("category") ?? "";
  const urlAge = searchParams.get("age") ?? "";

  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [selectedAge, setSelectedAge] = useState<string>(urlAge);
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  // Sync URL params to local state during render (avoids useEffect setState)
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const [prevUrlCategory, setPrevUrlCategory] = useState(urlCategory);
  const [prevUrlAge, setPrevUrlAge] = useState(urlAge);
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
    setPage(1);
  }
  if (urlCategory !== prevUrlCategory) {
    setPrevUrlCategory(urlCategory);
    setSelectedCategory(urlCategory);
    setPage(1);
  }
  if (urlAge !== prevUrlAge) {
    setPrevUrlAge(urlAge);
    setSelectedAge(urlAge);
    setPage(1);
  }

  const [products, setProducts] = useState<Product[]>([]);
  const categories = useCategoryStore((s) => s.categories);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const LIMIT = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const hasActiveFilters = !!searchQuery || !!selectedCategory || !!selectedAge;
      const params: GetProductsParams = {
        page,
        limit: LIMIT,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        ageGroup: selectedAge || undefined,
        featured: sortBy === "featured" && !hasActiveFilters ? true : undefined,
        inStock: true,
      };

      const res = await getProducts(params);
      if (res.success) {
        const sorted = [...res.data];

        if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
        else if (sortBy === "price-desc")
          sorted.sort((a, b) => b.price - a.price);

        setProducts(sorted);
        setTotalProducts(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategory, selectedAge, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Filter change handlers — each resets to page 1
  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setPage(1);
  };
  const handleAgeChange = (val: string) => {
    setSelectedAge(val);
    setPage(1);
  };
  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPage(1);
  };
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedAge("");
    setSearchQuery("");
    setSortBy("featured");
    setPage(1);
  };

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedAge ? 1 : 0);

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-brand-navy py-12">
        <div className="container-custom">
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-white sm:mb-2">
            Shop All Toys
          </h1>
          <p className="text-white/60 text-sm sm:text-lg">
            Discover {totalProducts > 0 ? `${totalProducts}+` : "premium"} toys
            for every age and interest
          </p>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          {/* Search */}
          {/* <div className="relative flex-1 min-w-50">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-light-gray"
            />
            <input
              type="text"
              placeholder="Search toys..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="input-field pl-10 h-11"
            />
          </div> */}
          <div className="relative flex-1 min-w-50">
            <div className="relative flex items-center w-full">
              {/* Left Search Icon */}
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-light-gray pointer-events-none"
              />

              {/* Text Input Field */}
              <input
                type="text"
                placeholder="Search toys..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="input-field pl-11 pr-10 h-11"
              />

              {/* Right Clear Icon (Only displays if text exists) */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-light-gray hover:text-brand-navy cursor-pointer transition-colors p-0.5"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all",
              filtersOpen || activeFiltersCount > 0
                ? "bg-brand-navy text-white border-brand-navy"
                : "bg-white text-brand-gray border-gray-200 hover:border-brand-navy",
            )}
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-coral rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-brand-gray rounded-xl px-4 py-2.5 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal cursor-pointer"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-light-gray pointer-events-none"
            />
          </div>

          {/* Layout toggle */}
          {/* <div className="hidden md:flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button
              onClick={() => setLayout("grid")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                layout === "grid"
                  ? "bg-brand-navy text-white"
                  : "text-brand-light-gray hover:text-brand-navy",
              )}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setLayout("list")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                layout === "list"
                  ? "bg-brand-navy text-white"
                  : "text-brand-light-gray hover:text-brand-navy",
              )}
            >
              <LayoutList size={16} />
            </button>
          </div> */}

          {/* Results count */}
          <span className="text-brand-light-gray text-sm ml-auto">
            {loading ? "Loading..." : `${totalProducts} products`}
          </span>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-brand-navy text-lg">
                Filters
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-coral text-sm flex items-center gap-1 hover:underline"
                >
                  <X size={14} /> Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Categories */}
              <div>
                <h4 className="font-semibold text-brand-navy mb-3 text-sm uppercase tracking-wider">
                  Category
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ""}
                      onChange={() => handleCategoryChange("")}
                      className="w-4 h-4 text-coral focus:ring-coral"
                    />
                    <span className="text-sm text-brand-gray group-hover:text-brand-navy transition-colors">
                      All Categories
                    </span>
                  </label>
                  {categories.map((cat) => (
                    <label
                      key={cat._id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat._id}
                        onChange={() => handleCategoryChange(cat._id)}
                        className="w-4 h-4 text-coral focus:ring-coral"
                      />
                      <span className="text-sm text-brand-gray group-hover:text-brand-navy transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Age Group */}
              <div>
                <h4 className="font-semibold text-brand-navy mb-3 text-sm uppercase tracking-wider">
                  Age Group
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="ageGroup"
                      checked={selectedAge === ""}
                      onChange={() => handleAgeChange("")}
                      className="w-4 h-4 text-coral focus:ring-coral"
                    />
                    <span className="text-sm text-brand-gray group-hover:text-brand-navy transition-colors">
                      All Ages
                    </span>
                  </label>
                  {ageGroups.map((age) => (
                    <label
                      key={age.id}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="ageGroup"
                        checked={selectedAge === age.id}
                        onChange={() => handleAgeChange(age.id)}
                        className="w-4 h-4 text-coral focus:ring-coral"
                      />
                      <span className="text-sm text-brand-gray group-hover:text-brand-navy transition-colors">
                        {age.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={40} className="text-coral animate-spin" />
          </div>
        )}

        {/* Products */}
        {!loading && products.length === 0 && (
          <div className="text-center py-20 flex flex-col justify-center items-center">
            <div className="text-6xl mb-4">
              <SearchX size={40} color="#f4a261" />
            </div>
            <h3 className="font-display font-bold text-2xl text-brand-navy mb-2">
              No products found
            </h3>
            <p className="text-brand-gray mb-6">
              Try adjusting your filters or search query
            </p>
            <button onClick={clearFilters} className="btn-primary">
              Clear Filters
            </button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div
            className={clsx(
              "grid gap-2 sm:gap-5",
              layout === "grid"
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-brand-gray hover:border-coral hover:text-coral transition-all disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={clsx(
                    "w-10 h-10 rounded-xl text-sm font-medium transition-all",
                    p === page
                      ? "bg-brand-navy text-white"
                      : "border border-gray-200 text-brand-gray hover:border-coral hover:text-coral",
                  )}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-brand-gray hover:border-coral hover:text-coral transition-all disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <Loader2 size={40} className="text-coral animate-spin" />
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}
