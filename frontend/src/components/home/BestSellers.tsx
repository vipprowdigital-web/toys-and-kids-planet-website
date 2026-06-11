import Link from "next/link";
import { TrendingUp, Flame } from "lucide-react";
import ProductCard from "../product/ProductCard";
import { getBestSellerProducts } from "@/lib/api";
// import { products as mockProducts } from "@/data";
import type { Product } from "@/types";

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
//     isFeatured: false,
//     isActive: true,
//     createdAt: "",
//     updatedAt: "",
//   };
// }

export default async function BestSellers() {
  let bestSellers: Product[] = [];

  try {
    bestSellers = await getBestSellerProducts(8);
  } catch {
    // API unavailable — use mock data
  }

  if (bestSellers.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-20 bg-linear-to-b from-brand-navy to-brand-navy/95 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-coral/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 dot-pattern opacity-[0.04]" />
      </div>

      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-coral/20 text-coral border border-coral/30 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
              <Flame size={14} className="fill-coral" />
              Hot &amp; Trending
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
              Best Selling <span className="text-coral">Toys</span>
            </h2>
            <p className="text-white/60 text-lg mt-3">
              The toys parents and kids love the most right now
            </p>
          </div>
          <Link
            href="/shop?sort=bestseller"
            className="btn-teal shrink-0 self-start md:self-auto"
          >
            <TrendingUp size={16} />
            View All Best Sellers
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { value: "10K+", label: "Orders this month" },
            { value: "4.9★", label: "Average rating" },
            { value: "98%", label: "Satisfaction rate" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-2 sm:p-4 text-center"
            >
              <div className="font-display font-bold text-xl sm:text-2xl text-white">
                {stat.value}
              </div>
              <div className="text-white/50 text-[10px] sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
          {bestSellers.map((product) => (
            <div key={product._id} className="relative">
              {/* {i === 0 && (
                <div className="absolute -top-3 left-4 z-10 bg-coral text-white text-xs font-bold px-3 py-1 rounded-full shadow-btn flex items-center gap-1">
                  🏆 #1 Bestseller
                </div>
              )} */}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
