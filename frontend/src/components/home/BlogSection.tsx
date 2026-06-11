import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { getBlogs } from "@/lib/api";
import type { Blog, BlogCategory } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCategoryName(category: Blog["category"]): string | null {
  if (!category) return null;
  if (typeof category === "string") return null;
  return (category as BlogCategory).name ?? null;
}

export default async function BlogSection() {
  let blogs: Blog[] = [];

  try {
    const res = await getBlogs({ limit: 3, sortBy: "createdAt", sortOrder: "desc" });
    if (res.success) blogs = res.data;
  } catch {
    // API unavailable — render nothing
  }

  if (blogs.length === 0) return null;

  return (
    <section className="py-10 sm:py-20 bg-cream">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-coral/10 rounded-lg flex items-center justify-center">
                <BookOpen size={16} className="text-coral" />
              </div>
              <span className="text-coral font-semibold text-sm uppercase tracking-wider">
                Our Blog
              </span>
            </div>
            <h2 className="section-title">Tips, Ideas & Toy Guides</h2>
            <p className="section-subtitle max-w-lg">
              Expert parenting tips, gift guides, and creative play ideas for your little ones.
            </p>
          </div>
          <Link
            href="/blog"
            className="btn-outline-coral shrink-0 self-start sm:self-auto"
          >
            View All Posts
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Blog cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogs.map((blog, index) => (
            <article
              key={blog._id}
              className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-300 group flex flex-col"
            >
              {/* Thumbnail */}
              <Link href={`/blog/${blog.slug}`} className="block overflow-hidden aspect-[16/9] relative bg-gray-100">
                {blog.thumbnail?.url ? (
                  <Image
                    src={blog.thumbnail.url}
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
                {index === 0 && blog.isFeature && (
                  <span className="absolute top-3 left-3 badge-coral">
                    Featured
                  </span>
                )}
              </Link>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                {/* Meta */}
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {getCategoryName(blog.category) && (
                    <span className="badge-teal text-xs">
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
          ))}
        </div>
      </div>
    </section>
  );
}
