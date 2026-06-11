"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BookOpen, Clock, ArrowLeft, Calendar, Loader2 } from "lucide-react";
import { getBlogBySlug, getBlogs } from "@/lib/api";
import type { Blog, BlogCategory } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
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

interface Props {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: Props) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;

  const [blog, setBlog] = React.useState<Blog | null>(null);
  const [related, setRelated] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const handleLoading = () => setLoading(true);
    handleLoading();

    getBlogBySlug(slug)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.success || !res.data) {
          setBlog(null);
          setLoading(false);
          return;
        }
        setBlog(res.data);

        // Fetch related posts
        getBlogs({ limit: 3, sortBy: "createdAt", sortOrder: "desc" })
          .then((r) => {
            if (!cancelled)
              setRelated(
                r.data.filter((b) => b._id !== res.data._id).slice(0, 3),
              );
          })
          .catch(() => {});
      })
      .catch(() => {
        if (!cancelled) setBlog(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={40} className="text-coral animate-spin" />
      </div>
    );
  }

  if (!blog) return notFound();

  const thumb = getThumbnailUrl(blog.thumbnail);
  const categoryName = getCategoryName(blog.category);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-white py-10">
        <div className="container-custom max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-navy/60 hover:text-coral text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {categoryName && (
              <span className="text-xs bg-coral/20 text-coral px-3 py-1 rounded-full font-semibold">
                {categoryName}
              </span>
            )}
            {blog.isFeature && (
              <span className="text-xs bg-teal/20 text-teal px-3 py-1 rounded-full font-semibold">
                Featured
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-navy leading-tight mb-4">
            {blog.title}
          </h1>

          {blog.short_description && (
            <p className="text-gray/70 text-md leading-relaxed max-w-2xl">
              {blog.short_description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-6 text-navy/50 text-sm flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-navy" />
              {formatDate(blog.createdAt)}
            </span>
            {blog.read_time && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {blog.read_time} read
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom max-w-4xl py-10">
        {/* Thumbnail */}
        {thumb && (
          <div className="relative aspect-16/7 rounded-3xl overflow-hidden shadow-card mb-10">
            <Image
              src={thumb}
              alt={blog.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 900px"
            />
          </div>
        )}

        {/* Body */}
        {blog.description ? (
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-brand-navy prose-p:text-brand-gray prose-a:text-coral prose-strong:text-brand-navy"
            dangerouslySetInnerHTML={{ __html: blog.description }}
          />
        ) : (
          <p className="text-brand-light-gray text-center py-8">
            No content available for this article.
          </p>
        )}

        {/* Gallery */}
        {Array.isArray(blog.gallery_images) &&
          blog.gallery_images.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display font-bold text-brand-navy text-xl mb-4">
                Gallery
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {blog.gallery_images.map((img, i) => {
                  const imgUrl = getThumbnailUrl(img);
                  if (!imgUrl) return null;
                  return (
                    <div
                      key={i}
                      className="relative aspect-square rounded-2xl overflow-hidden"
                    >
                      <Image
                        src={imgUrl}
                        alt={`${blog.title} gallery ${i + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        {/* Video */}
        {blog.video_link && (
          <div className="mt-10">
            <h3 className="font-display font-bold text-brand-navy text-xl mb-4">
              Video
            </h3>
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <iframe
                src={blog.video_link.replace("watch?v=", "embed/")}
                title={blog.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-gray-200">
            <h2 className="font-display font-bold text-brand-navy text-2xl mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((b) => {
                const rThumb = getThumbnailUrl(b.thumbnail);
                return (
                  <article
                    key={b._id}
                    className="bg-white rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group"
                  >
                    <Link href={`/blog/${b.slug}`}>
                      <div className="relative aspect-video bg-gray-100">
                        {rThumb ? (
                          <Image
                            src={rThumb}
                            alt={b.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-teal/10">
                            <BookOpen size={24} className="text-teal" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-brand-navy text-sm line-clamp-2 group-hover:text-coral transition-colors">
                          {b.title}
                        </h3>
                        <p className="text-xs text-brand-light-gray mt-1">
                          {formatDate(b.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
