"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import clsx from "clsx";
import type { Testimonial } from "@/lib/api";

const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export default function ReviewsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [active, setActive] = useState(0);
  const total = testimonials.length;

  if (total === 0) return null;

  const prev = () => setActive((a) => (a - 1 + total) % total);
  const next = () => setActive((a) => (a + 1) % total);

  const visibleIndices =
    total === 1
      ? [0]
      : total === 2
        ? [active % total, (active + 1) % total]
        : [(active - 1 + total) % total, active, (active + 1) % total];

  const visible = visibleIndices.map((idx) => testimonials[idx]);

  return (
    <div className="relative">
      {/* Desktop: 3 cards */}
      <div
        className={clsx(
          "hidden md:grid gap-6",
          visible.length === 1
            ? "grid-cols-1 max-w-md mx-auto"
            : visible.length === 2
              ? "grid-cols-2 max-w-3xl mx-auto"
              : "grid-cols-3",
        )}
      >
        {visible.map((t, i) => (
          <div
            key={`${t._id}-${i}`}
            className={clsx(
              "rounded-3xl p-5 sm:p-7 border transition-all duration-500",
              visible.length === 3 && i === 1
                ? "bg-brand-navy text-white border-transparent shadow-card-hover scale-[1.03]"
                : visible.length === 3
                  ? "bg-white border-gray-100 shadow-card opacity-70"
                  : "bg-brand-navy text-white border-transparent shadow-card-hover",
            )}
          >
            <Quote
              size={28}
              className={clsx(
                "mb-4 opacity-40",
                visible.length === 3 && i !== 1 ? "text-coral" : "text-teal",
              )}
            />

            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={14} className="text-gold fill-gold" />
              ))}
            </div>

            <div
              className={clsx(
                "leading-relaxed mb-6 text-sm line-clamp-4",
                visible.length === 3 && i !== 1
                  ? "text-brand-gray"
                  : "text-white/80",
              )}
              dangerouslySetInnerHTML={{
                __html: `&ldquo;${t.description}&rdquo;`,
              }}
            />

            {t.designation && (
              <div
                className={clsx(
                  "text-xs font-medium mb-5 px-3 py-1.5 rounded-full inline-block",
                  visible.length === 3 && i !== 1
                    ? "bg-teal/10 text-teal-dark"
                    : "bg-white/10 text-teal",
                )}
              >
                {t.designation}
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/20">
                <Image
                  src={t.avatar || FALLBACK_AVATAR}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div>
                <div
                  className={clsx(
                    "font-semibold text-sm",
                    visible.length === 3 && i !== 1
                      ? "text-brand-navy"
                      : "text-white",
                  )}
                >
                  {t.name}
                </div>
                <div
                  className={clsx(
                    "text-xs",
                    visible.length === 3 && i !== 1
                      ? "text-brand-light-gray"
                      : "text-white/50",
                  )}
                >
                  {formatDate(t.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: single card */}
      <div className="md:hidden">
        <div className="bg-brand-navy text-white rounded-3xl p-7">
          <Quote size={28} className="text-teal mb-4 opacity-40" />
          <div className="flex gap-1 mb-4">
            {Array.from({ length: testimonials[active].rating }).map((_, j) => (
              <Star key={j} size={14} className="text-gold fill-gold" />
            ))}
          </div>
          <div
            className="text-white/80 leading-relaxed mb-4 text-sm line-clamp-5"
            dangerouslySetInnerHTML={{
              __html: `&ldquo;${testimonials[active].description}&rdquo;`,
            }}
          />
          {testimonials[active].designation && (
            <div className="text-xs text-teal bg-white/10 px-3 py-1.5 rounded-full inline-block mb-4">
              {testimonials[active].designation}
            </div>
          )}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <Image
              src={testimonials[active].avatar || FALLBACK_AVATAR}
              alt={testimonials[active].name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <div>
              <div className="font-semibold text-sm text-white">
                {testimonials[active].name}
              </div>
              <div className="text-xs text-white/50">
                {formatDate(testimonials[active].createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          onClick={prev}
          className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-brand-gray hover:border-coral hover:text-coral hover:bg-coral/5 transition-all"
          aria-label="Previous review"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={clsx(
                "rounded-full transition-all duration-300",
                i === active
                  ? "w-6 h-2.5 bg-coral"
                  : "w-2.5 h-2.5 bg-gray-300 hover:bg-teal",
              )}
              aria-label={`Review ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-12 h-12 rounded-full border-2 border-gray-200 flex items-center justify-center text-brand-gray hover:border-coral hover:text-coral hover:bg-coral/5 transition-all"
          aria-label="Next review"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
