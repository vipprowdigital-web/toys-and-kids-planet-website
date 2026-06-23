import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "../product/ProductCard";
import { getFeaturedProducts } from "@/lib/api";
// import { products as mockProducts } from "@/data";
import type { Product } from "@/types";

/** Map mock data product to the backend-aligned Product shape */
// function mockToProduct(m: any): Product {
//   return {
//     _id: m.id,
//     name: m.name,
//     slug: m.slug,
//     description: m.description,
//     category: m.category,
//     ageGroup: m.ageGroup as Product["ageGroup"],
//     images: m.image ? [{ url: m.image, publicId: "" }] : [],
//     price: m.price,
//     originalPrice: m.originalPrice ?? null,
//     discount: m.discount ?? 0,
//     rating: m.rating ?? 0,
//     reviewCount: m.reviewCount ?? 0,
//     badge: m.badge ?? null,
//     inStock: m.inStock ?? true,
//     stockQuantity: 0,
//     soldCount: m.soldCount ?? 0,
//     isFeatured: true,
//     isActive: true,
//     createdAt: "",
//     updatedAt: "",
//   };
// }

export default async function FeaturedProducts() {
  let featuredProducts: Product[] = [];

  try {
    const res = await getFeaturedProducts(8);
    if (res.success && res.data.length > 0) {
      featuredProducts = res.data;
    }
  } catch {
    // API unavailable — use mock data
  }

  if (featuredProducts.length === 0) return null;

  return (
    <section className="py-10 sm:py-20 bg-cream">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-coral/15 text-coral border border-coral/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              Featured Collection
            </div>
            <h2 className="section-title">
              Hand-Picked <span className="text-coral">Favourites</span>
            </h2>
            <p className="section-subtitle">
              Trending toys loved by kids and trusted by parents
            </p>
          </div>
          <Link
            href="/shop"
            className="btn-outline-coral shrink-0 self-start md:self-auto"
          >
            Browse All Products
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Filter Tabs — client interaction can be added later */}
        {/* <div className="flex flex-wrap gap-2 mb-8">
          {[
            "All",
            "Educational",
            "Building Blocks",
            "Soft Toys",
            "STEM",
            "RC Toys",
          ].map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                i === 0
                  ? "bg-brand-navy text-white shadow-sm"
                  : "bg-white text-brand-gray border border-gray-200 hover:border-coral hover:text-coral"
              }`}
            >
              {tab}
            </button>
          ))}
        </div> */}

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2  sm:gap-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* Load More */}
        {/* <div className="text-center mt-12">
          <Link href="/shop" className="btn-primary px-10!">
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div> */}
      </div>
    </section>
  );
}
