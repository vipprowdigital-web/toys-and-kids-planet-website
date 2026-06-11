import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getProductCategories } from "@/lib/api";
// import { categories as mockCategories } from "@/data";
import type { ProductCategory } from "@/types";

/** Normalise API category to the shape the component needs */
function normaliseCat(cat: ProductCategory) {
  return {
    id: cat._id,
    name: cat.name,
    slug: cat.slug,
    image:
      cat.image?.url ||
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    color: cat.color || "bg-teal",
  };
}

export default async function CategorySection() {
  // Fetch up to 10 active categories from the API.
  // Falls back to mock data if the API is unavailable (e.g. during static builds).
  let displayCats: ReturnType<typeof normaliseCat>[] = [];

  try {
    const res = await getProductCategories({ limit: 10 });
    if (res.success && res.data.length > 0) {
      displayCats = res.data.map(normaliseCat);
    }
  } catch {
    // API unavailable — silently use mock data below
  }

  // Fallback to mock data when API returns nothing
  // if (displayCats.length === 0) {
  //   displayCats = mockCategories.map((cat) => ({
  //     id: cat.id,
  //     name: cat.name,
  //     slug: cat.slug,
  //     icon: cat.icon,
  //     image: cat.image,
  //     color: cat.color,
  //   }));
  // }
  if (displayCats.length === 0) return null;

  return (
    <section className="py-10 sm:py-20 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-teal/15 text-teal-dark border border-teal/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              Browse Categories
            </div>
            <h2 className="section-title">
              Shop by <span className="text-coral">Category</span>
            </h2>
            <p className="section-subtitle">
              Explore our wide range of toys across every type of play
            </p>
          </div>
          <Link
            href="/categories"
            className="btn-outline-coral shrink-0 self-start md:self-auto"
          >
            View All Categories
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayCats.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="category-card bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover group hover:border-coral-dark"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 sm:h-50 w-full">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />
                {/* Overlay with icon */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-3 text-center">
                <h3 className="font-semibold text-brand-navy text-sm leading-snug group-hover:text-coral transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Marquee strip */}
        {/* <div className="mt-16 overflow-scroll">
          <div className="marquee-track gap-6">
            {[...displayCats, ...displayCats].map((cat, i) => (
              <span
                key={i}
                className="flex items-center gap-2 text-brand-light-gray whitespace-nowrap px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-sm shrink-0"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
