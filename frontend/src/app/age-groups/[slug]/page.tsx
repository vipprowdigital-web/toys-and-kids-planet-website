import { notFound } from "next/navigation";
import { ageGroups } from "@/data/index";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { getProductsByAgeGroup } from "@/lib/api";
import { Product } from "@/types";

// 1. Update Props interface to make params a Promise
interface Props {
  params: Promise<{ slug: string }>;
}

// 2. Turn the component function into an async function
export default async function AgeGroupDetailPage({ params }: Props) {
  let displayProducts: Product[] = [];
  // 3. Await the dynamic URL params
  const resolvedParams = await params;
  const currentSlug = resolvedParams.slug;

  // 4. Look up the age group using the safely resolved slug string
  const ageGroup = ageGroups.find((a) => a.slug === currentSlug);
  if (!ageGroup) notFound();

  try {
    const res = await getProductsByAgeGroup(ageGroup.id);
    if (res.success && res.data.length > 0) {
      displayProducts = res.data;
    }
  } catch {
    // API unavailable — use mock data
  }

  // const ageProducts = products.filter((p) => p.ageGroup === ageGroup.id);
  // const displayProducts = ageProducts.length > 0 ? ageProducts : products;

  return (
    <div className="min-h-screen bg-cream">
      <div className={clsx("bg-linear-to-br py-14", ageGroup.color)}>
        <div className="container-custom">
          <Link
            href="/age-groups"
            className="inline-flex items-center gap-2 text-brand-gray hover:text-coral text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> All Age Groups
          </Link>
          <div className="flex items-center gap-5">
            {/* <span className="text-6xl">{ageGroup.emoji}</span> */}
            <div>
              <h1 className="font-display text-4xl font-bold text-brand-navy">
                {ageGroup.label}
              </h1>
              <p className="text-brand-gray mt-1">{ageGroup.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {displayProducts.length === 0 ? (
            <div className="">
              <p>No products Found.</p>
              <Link
                href="/shop"
                className="btn-primary inline-flex justify-center items-center mt-3"
              >
                Go to Shop <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            displayProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Keep your static parameter generation loop intact
export async function generateStaticParams() {
  return ageGroups.map((a) => ({ slug: a.slug }));
}
