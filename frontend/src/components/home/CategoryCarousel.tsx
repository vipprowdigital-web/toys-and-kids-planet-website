"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

type Cat = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
};

const SCROLL_BY = 280; // px per arrow click

export default function CategoryCarousel({ cats }: { cats: Cat[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(cats.length > 4);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -SCROLL_BY : SCROLL_BY,
      behavior: "smooth",
    });
    setTimeout(updateArrows, 350);
  };

  const useGrid = cats.length <= 4;

  if (useGrid) {
    return (
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {cats.map((cat) => (
          <div key={cat.id} className="w-45 sm:w-52.5">
            <CategoryCard cat={cat} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className={clsx(
          "absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-card border border-gray-100 flex items-center justify-center text-brand-gray hover:border-coral hover:text-coral transition-all",
          !canScrollLeft && "opacity-30 pointer-events-none",
        )}
      >
        <ChevronLeft size={18} />
      </button>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth pb-2 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cats.map((cat) => (
          <div key={cat.id} className="shrink-0">
            <CategoryCard cat={cat} />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className={clsx(
          "absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-card border border-gray-100 flex items-center justify-center text-brand-gray hover:border-coral hover:text-coral transition-all",
          !canScrollRight && "opacity-30 pointer-events-none",
        )}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function CategoryCard({ cat }: { cat: Cat }) {
  return (
    <Link
      href={`/categories/${cat.slug}`}
      className="group block relative w-75 aspect-2/3 rounded-sm overflow-hidden shadow-card hover:shadow-card-hover border-2 border-transparent hover:border-coral transition-all duration-300"
    >
      <Image
        src={cat.image}
        alt={cat.name}
        fill
        className="object-cover group-hover:scale-110 transition-transform duration-500"
        sizes="(max-width: 640px) 180px, 210px"
      />

      {/* Bottom overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/70 to-transparent pt-20 pb-4 px-3">
        <p className="text-white sm:text-2xl text-md font-bold leading-snug drop-shadow">
          {cat.name}
        </p>
        {cat.description && (
          <p className="text-white/75 text-xs mt-1 leading-snug line-clamp-1">
            {cat.description}
          </p>
        )}
      </div>
    </Link>
  );
}
