import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package } from "lucide-react";
import {
  getProductCategoryBySlug,
  getProductCategories,
  getProducts,
} from "@/lib/api";
import type { Product, ProductCategory } from "@/types";
import ProductCard from "@/components/product/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;

  let category: ProductCategory | null = null;
  let products: Product[] = [];

  try {
    const catRes = await getProductCategoryBySlug(slug);
    if (catRes.success && catRes.data) {
      category = catRes.data;

      const prodRes = await getProducts({
        category: catRes.data._id,
        limit: 50,
        inStock: true,
      });
      if (prodRes.success) products = prodRes.data;
    }
  } catch {
    // API unavailable
  }

  if (!category) notFound();

  const imageUrl = category.image?.url;

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="relative bg-linear-to-br from-teal/20 to-teal/5 py-14 overflow-hidden">
        {/* Background image (blurred) */}
        {category.image?.url && (
          <div className="absolute inset-0 opacity-10">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        <div className="container-custom relative z-10">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-brand-gray hover:text-coral text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Categories
          </Link>

          <div className="flex items-center gap-5">
            <div>
              <h1 className="font-display text-4xl font-bold text-brand-navy">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-brand-gray mt-1 max-w-xl">
                  {category.description}
                </p>
              )}
              <p className="text-white font-semibold bg-coral inline-flex px-4 py-1 rounded-full text-sm mt-2">
                {products.length > 0
                  ? `${products.length} product${products.length !== 1 ? "s" : ""} found`
                  : "Explore products in this category"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Products grid ───────────────────────────────────────────────── */}
      <div className="container-custom py-12">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 inline-flex">
              <Package className="text-coral" size={40} />
            </div>
            <h3 className="font-display font-bold text-2xl text-brand-navy mb-2">
              Coming Soon
            </h3>
            <p className="text-brand-gray">
              Products in this category are being added. Check back soon!
            </p>
            <Link href="/shop" className="btn-primary mt-6 inline-flex">
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const res = await getProductCategories();
    if (res.success && res.data) {
      return res.data.map((cat: ProductCategory) => ({ slug: cat.slug }));
    }
  } catch {
    // API unavailable at build time
  }
  return [];
}
