"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Store, Star, Package } from "lucide-react";
import { getVendorProducts } from "@/lib/api";
import type { Product, Vendor } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ShopPage({ params }: Props) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getVendorProducts(slug, { page, limit: 12 })
      .then((res) => {
        if (cancelled) return;
        setVendor(res.vendor);
        setProducts(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      })
      .catch(() => {
        if (!cancelled) setNotFoundError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, page]);

  if (notFoundError) notFound();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      {vendor && (
        <div className="bg-white border-b">
          {/* Banner */}
          {vendor.banner?.url ? (
            <div className="relative h-48 md:h-64 w-full bg-gray-100">
              <Image src={vendor.banner.url} alt={vendor.shopName} fill className="object-cover" />
              <div className="absolute inset-0 bg-brand-navy/40" />
            </div>
          ) : (
            <div className="h-36 md:h-48 bg-gradient-to-r from-brand-navy to-teal" />
          )}

          <div className="container mx-auto px-4 pb-6">
            <div className="flex items-end gap-4 -mt-10 md:-mt-12 relative z-10">
              {/* Logo */}
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                {vendor.logo?.url ? (
                  <Image src={vendor.logo.url} alt={vendor.shopName} width={96} height={96} className="object-cover" />
                ) : (
                  <Store className="h-10 w-10 text-brand-navy/40" />
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">{vendor.shopName}</h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-brand-light-gray">
                  {vendor.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-gold fill-gold" />
                      {vendor.rating.toFixed(1)} rating
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Package size={14} />
                    {total} product{total !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {vendor.description && (
              <p className="mt-4 text-brand-gray text-sm max-w-2xl">{vendor.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-white border animate-pulse h-80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Store className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-xl font-semibold text-brand-navy mb-2">No products yet</h2>
            <p className="text-brand-light-gray">This shop hasn't listed any products yet.</p>
            <Link href="/shop" className="mt-6 inline-block bg-brand-navy text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-coral transition-colors">
              Browse all products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-5 py-2.5 rounded-xl border font-semibold text-sm disabled:opacity-40 hover:bg-brand-navy hover:text-white transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-brand-light-gray">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-5 py-2.5 rounded-xl border font-semibold text-sm disabled:opacity-40 hover:bg-brand-navy hover:text-white transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
