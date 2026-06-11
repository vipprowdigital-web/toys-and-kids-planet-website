"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowRight, Search, Loader2 } from "lucide-react";
import { getBlogs } from "@/lib/api";
import type { Blog, BlogCategory } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getThumbnailUrl(thumbnail: unknown): string | null {
  if (!thumbnail) return null;
  if (typeof thumbnail === "string") return thumbnail;
  if (
    typeof thumbnail === "object" &&
    thumbnail !== null &&
    "url" in thumbnail
  ) {
    return (thumbnail as { url: string }).url;
  }
  return null;
}

function getCategoryName(category: Blog["category"]): string | null {
  if (!category) return null;
  if (typeof category === "string") return null;
  return (category as BlogCategory).name ?? null;
}

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const handleSetPage = () => setPage(1);
    handleSetPage();
  }, [debouncedSearch]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBlogs({
        page,
        limit: 9,
        search: debouncedSearch,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      if (res.success) {
        setBlogs(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch {
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    const handleBlogFetch = () => fetchBlogs();
    handleBlogFetch();
  }, [fetchBlogs]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-brand-navy py-14 md:py-20">
        <div className="container-custom text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-coral/20 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-coral" />
            </div>
            <span className="text-coral font-semibold text-sm uppercase tracking-wider">
              Our Blog
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Tips, Ideas & Toy Guides
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-lg">
            Expert parenting tips, gift guides, and creative play ideas for your
            little ones.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Search */}
        <div className="max-w-md mx-auto mb-10 relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-light-gray"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
            className="input-field pl-11"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={36} className="text-coral animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 text-brand-light-gray">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {blogs.map((blog) => {
              const thumb = getThumbnailUrl(blog.thumbnail);
              return (
                <article
                  key={blog._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 group flex flex-col"
                >
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="block overflow-hidden aspect-[16/9] relative bg-gray-100"
                  >
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal/10">
                        <BookOpen size={40} className="text-teal" />
                      </div>
                    )}
                    {blog.isFeature && (
                      <span className="absolute top-3 left-3 badge bg-coral text-white text-xs px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </Link>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {getCategoryName(blog.category) && (
                        <span className="text-xs bg-teal/15 text-teal-dark px-2.5 py-1 rounded-full font-semibold">
                          {getCategoryName(blog.category)}
                        </span>
                      )}
                      {blog.read_time && (
                        <span className="flex items-center gap-1 text-xs text-brand-light-gray">
                          <Clock size={12} />
                          {blog.read_time}
                        </span>
                      )}
                    </div>

                    <Link href={`/blog/${blog.slug}`}>
                      <h3 className="font-display font-bold text-brand-navy text-lg leading-snug mb-2 line-clamp-2 group-hover:text-coral transition-colors">
                        {blog.title}
                      </h3>
                    </Link>

                    {blog.short_description && (
                      <p className="text-brand-light-gray text-sm line-clamp-3 mb-4 flex-1">
                        {blog.short_description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <span className="text-xs text-brand-light-gray">
                        {formatDate(blog.createdAt)}
                      </span>
                      <Link
                        href={`/blog/${blog.slug}`}
                        className="flex items-center gap-1 text-coral text-sm font-semibold hover:underline"
                      >
                        Read more <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-brand-gray hover:border-coral hover:text-coral disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  page === i + 1
                    ? "bg-coral text-white border border-coral"
                    : "border border-gray-200 text-brand-gray hover:border-coral hover:text-coral"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-brand-gray hover:border-coral hover:text-coral disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
