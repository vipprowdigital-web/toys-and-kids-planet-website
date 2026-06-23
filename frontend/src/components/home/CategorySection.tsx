import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProductCategories } from "@/lib/api";
import type { ProductCategory } from "@/types";
import CategoryCarousel from "./CategoryCarousel";

/** Normalise API category to the shape the component needs */
function normaliseCat(cat: ProductCategory) {
  return {
    id: cat._id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
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
    <section className="py-10 sm:pt-20 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            {/* <div className="inline-flex items-center gap-2 bg-teal/15 text-teal-dark border border-teal/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              Browse Categories
            </div> */}
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

        {/* Category Carousel / Grid */}
        <CategoryCarousel cats={displayCats} />


      </div>
    </section>
  );
}
