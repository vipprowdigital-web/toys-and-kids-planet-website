"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  Minus,
  Plus,
  Check,
  Loader2,
  BadgeCheck,
  Zap,
  Package,
  Box,
  Tag,
  MessageSquare,
  ThumbsUp,
  Pencil,
  Trash2,
  Store,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import {
  addToWishlist,
  removeFromWishlist,
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  type ProductReview,
} from "@/lib/customerApi";
import { getProductBySlug, getProducts } from "@/lib/api";
import type { Product, ProductCategory } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import { useRouter } from "next/navigation";
import clsx from "clsx";

// ─── Age group label map ──────────────────────────────────────────────────────
const AGE_LABELS: Record<string, string> = {
  "0-2": "0–2 Years (Baby)",
  "3-5": "3–5 Years (Toddler)",
  "6-8": "6–8 Years (Kid)",
  "9-12": "9–12 Years (Pre-teen)",
  "13+": "13+ Years (Teen)",
  all: "All Ages",
};

// ─── Star renderer ────────────────────────────────────────────────────────────
function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={clsx(
            i < Math.floor(rating)
              ? "text-gold fill-gold"
              : "text-gray-200 fill-gray-200",
          )}
        />
      ))}
    </div>
  );
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  // ── Data fetching ────────────────────────────────────────────────────────
  const [product, setProduct] = React.useState<Product | null>(null);
  const [related, setRelated] = React.useState<Product[]>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const handleDataLoading = () => setDataLoading(true);
    handleDataLoading();

    getProductBySlug(slug)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.success || !res.data) {
          setProduct(null);
          setDataLoading(false);
          return;
        }
        const p = res.data;
        setProduct(p);

        // Fetch related products from same category
        const catId =
          typeof p.category === "object"
            ? (p.category as ProductCategory)._id
            : p.category;
        if (catId) {
          getProducts({ category: catId, limit: 4 })
            .then((r) => {
              if (!cancelled)
                setRelated(r.data.filter((x) => x._id !== p._id).slice(0, 4));
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (!cancelled) setProduct(null);
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // ── Cart & wishlist ──────────────────────────────────────────────────────
  const { addItem, isInCart } = useCart();
  const { customer, token, isAuthenticated } = useCustomer();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "shipping" | "reviews"
  >("description");

  // ── Reviews state ────────────────────────────────────────────────────────
  const [reviews, setReviews] = React.useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = React.useState(false);
  const [reviewPage, setReviewPage] = React.useState(1);
  const [reviewTotalPages, setReviewTotalPages] = React.useState(1);
  const [reviewForm, setReviewForm] = React.useState({
    rating: 5,
    title: "",
    body: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = React.useState(false);
  const [reviewError, setReviewError] = React.useState("");
  const [reviewSuccess, setReviewSuccess] = React.useState("");
  const [editingReview, setEditingReview] =
    React.useState<ProductReview | null>(null);

  const loadReviews = React.useCallback((productId: string, page: number) => {
    const doLoad = () => setReviewsLoading(true);
    doLoad();
    getProductReviews(productId, page)
      .then((res) => {
        if (res.success) {
          setReviews(res.data);
          setReviewTotalPages(res.pagination.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, []);

  React.useEffect(() => {
    if (product && activeTab === "reviews") {
      loadReviews(product._id, reviewPage);
    }
  }, [product, activeTab, reviewPage, loadReviews]);

  const handleSubmitReview = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!product || !token) return;
    setReviewError("");
    setReviewSuccess("");
    if (!reviewForm.body.trim()) {
      setReviewError("Please write your review.");
      return;
    }
    setReviewSubmitting(true);
    const action = editingReview
      ? updateReview(token, editingReview._id, reviewForm)
      : createReview(token, { productId: product._id, ...reviewForm });
    action
      .then(() => {
        setReviewSuccess(
          editingReview ? "Review updated!" : "Review submitted! Thank you.",
        );
        setEditingReview(null);
        setReviewForm({ rating: 5, title: "", body: "" });
        setReviewPage(1);
        loadReviews(product._id, 1);
      })
      .catch((err: unknown) => {
        setReviewError(
          err instanceof Error ? err.message : "Failed to submit review.",
        );
      })
      .finally(() => setReviewSubmitting(false));
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!token || !product) return;
    deleteReview(token, reviewId)
      .then(() => loadReviews(product._id, reviewPage))
      .catch(() => {});
  };

  // Sync wishlist state once product + customer loaded
  React.useEffect(() => {
    if (product && customer) {
      const handleSetWishlisted = () =>
        setWishlisted(customer.wishlist?.includes(product._id) ?? false);
      handleSetWishlisted();
    }
  }, [product, customer]);

  const handleAddToCart = () => {
    if (!product) return;
    const variant =
      product.variants && product.variants.length > 0
        ? {
            color: product.variants[selectedVariantIdx]?.color,
            size: product.variants[selectedVariantIdx]?.size,
            sku: product.variants[selectedVariantIdx]?.sku,
          }
        : undefined;
    addItem(product, quantity, variant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleWishlist = async () => {
    if (!product) return;
    if (!isAuthenticated || !token) {
      router.push("/auth");
      return;
    }
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await removeFromWishlist(token, product._id);
        setWishlisted(false);
      } else {
        await addToWishlist(token, product._id);
        setWishlisted(true);
      }
    } catch {
      /* silent */
    } finally {
      setWishlistLoading(false);
    }
  };

  // ── Loading / not found ──────────────────────────────────────────────────
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={40} className="text-coral animate-spin" />
      </div>
    );
  }

  if (!product) return notFound();

  const images = product.images ?? [];
  const hasImages = images.length > 0;
  const displayImage = hasImages
    ? images[selectedImage]?.url
    : "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=600&fit=crop";

  const variants = product.variants ?? [];
  const selectedVariant = variants[selectedVariantIdx];
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginalPrice = selectedVariant?.discountPrice
    ? selectedVariant.price
    : product.originalPrice;

  const specs = product.specifications;
  const inCart = isInCart(product._id);

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-custom py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-brand-light-gray mb-8 flex-wrap">
          <Link href="/" className="hover:text-coral transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-coral transition-colors">
            Shop
          </Link>
          {typeof product.category === "object" &&
            (product.category as ProductCategory).name && (
              <>
                <span>/</span>
                <Link
                  href={`/categories/${(product.category as ProductCategory).slug}`}
                  className="hover:text-coral transition-colors"
                >
                  {(product.category as ProductCategory).name}
                </Link>
              </>
            )}
          <span>/</span>
          <span className="text-brand-navy font-medium truncate max-w-50">
            {product.name}
          </span>
        </nav>

        {/* ── Main Product Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* ── Images ──────────────────────────────────────────────────── */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-card mb-4">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="badge bg-coral text-white">
                    -{product.discount}% OFF
                  </span>
                </div>
              )}
              {product.badge && (
                <div className="absolute top-4 right-4">
                  <span className="badge bg-brand-navy text-white">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={clsx(
                      "w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                      selectedImage === i
                        ? "border-coral shadow-sm"
                        : "border-gray-200 hover:border-teal",
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} ${i + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ─────────────────────────────────────────────── */}
          <div>
            {/* Name */}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-navy mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Vendor / Shop badge */}
            {product.vendor && typeof product.vendor === "object" && (
              <Link
                href={`/shops/${product.vendor.slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-teal-dark font-medium hover:underline mb-3"
              >
                <Store size={14} />
                Sold by {product.vendor.shopName}
                {product.vendor.rating > 0 && (
                  <span className="ml-1 text-xs text-brand-light-gray">
                    ★ {product.vendor.rating.toFixed(1)}
                  </span>
                )}
              </Link>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {product.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Stars rating={product.rating} />
                  <span className="font-semibold text-brand-navy">
                    {product.rating}
                  </span>
                  <span className="text-brand-light-gray text-sm">
                    ({product.reviewCount?.toLocaleString()} reviews)
                  </span>
                </div>
              )}
              {product.soldCount > 0 && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-teal-dark text-sm font-medium">
                    {product.soldCount.toLocaleString()} sold
                  </span>
                </>
              )}
              {product.ageGroup && product.ageGroup !== "all" && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs bg-teal/15 text-teal-dark px-2.5 py-1 rounded-full font-semibold">
                    {AGE_LABELS[product.ageGroup] ?? product.ageGroup}
                  </span>
                </>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-display font-bold text-4xl text-brand-navy">
                ₹{displayPrice.toLocaleString()}
              </span>
              {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                <>
                  <span className="text-brand-light-gray text-xl line-through">
                    ₹{displayOriginalPrice.toLocaleString()}
                  </span>
                  <span className="badge-coral badge">
                    Save ₹
                    {(displayOriginalPrice - displayPrice).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-brand-gray leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Variants — colour */}
            {variants.filter((v) => v.color).length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-brand-navy mb-2">
                  Colour:{" "}
                  <span className="font-normal text-brand-gray">
                    {selectedVariant?.color}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) =>
                    v.color ? (
                      <button
                        key={i}
                        onClick={() => setSelectedVariantIdx(i)}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all",
                          selectedVariantIdx === i
                            ? "border-coral bg-coral/10 text-coral"
                            : "border-gray-200 text-brand-gray hover:border-teal",
                          !v.isAvailable && "opacity-40 cursor-not-allowed",
                        )}
                        disabled={!v.isAvailable}
                      >
                        {v.color}
                        {!v.isAvailable && " (OOS)"}
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* Variants — size */}
            {variants.filter((v) => v.size).length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-brand-navy mb-2">
                  Size:{" "}
                  <span className="font-normal text-brand-gray">
                    {selectedVariant?.size}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) =>
                    v.size ? (
                      <button
                        key={i}
                        onClick={() => setSelectedVariantIdx(i)}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all",
                          selectedVariantIdx === i
                            ? "border-coral bg-coral/10 text-coral"
                            : "border-gray-200 text-brand-gray hover:border-teal",
                          !v.isAvailable && "opacity-40 cursor-not-allowed",
                        )}
                        disabled={!v.isAvailable}
                      >
                        {v.size}
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="flex items-center gap-2 mb-5">
              {product.inStock ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-600 font-medium text-sm">
                    In Stock
                    {product.stockQuantity > 0 && product.stockQuantity <= 10
                      ? ` — Only ${product.stockQuantity} left!`
                      : " — Ready to Ship"}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-red-500 font-medium text-sm">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            {/* Quantity picker */}
            {product.inStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-brand-navy font-medium text-sm">
                  Quantity:
                </span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors text-brand-gray"
                    aria-label="Decrease"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 font-bold text-brand-navy text-lg border-x border-gray-200">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50 transition-colors text-brand-gray"
                    aria-label="Increase"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 mb-8">
              {product.inStock ? (
                <button
                  onClick={handleAddToCart}
                  className={clsx(
                    "flex-1 py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition-all duration-300",
                    addedToCart
                      ? "bg-teal text-brand-navy"
                      : inCart
                        ? "bg-brand-navy/10 text-brand-navy hover:bg-coral hover:text-white"
                        : "btn-primary rounded-2xl!",
                  )}
                >
                  {addedToCart ? (
                    <>
                      <Check size={20} /> Added to Cart!
                    </>
                  ) : inCart ? (
                    <>
                      <ShoppingCart size={20} /> Add More
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} /> Add to Cart
                    </>
                  )}
                </button>
              ) : (
                <div className="flex-1 py-4 rounded-2xl font-semibold text-base flex items-center justify-center bg-gray-100 text-brand-light-gray cursor-not-allowed">
                  Out of Stock
                </div>
              )}

              <button
                onClick={handleWishlist}
                disabled={wishlistLoading}
                className={clsx(
                  "w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all duration-200",
                  wishlisted
                    ? "bg-coral border-coral text-white"
                    : "border-gray-200 text-brand-gray hover:border-coral hover:text-coral",
                  wishlistLoading && "opacity-50 cursor-wait",
                )}
                aria-label="Wishlist"
              >
                <Heart size={20} className={wishlisted ? "fill-white" : ""} />
              </button>

              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="w-14 h-14 rounded-2xl border-2 border-gray-200 flex items-center justify-center text-brand-gray hover:border-teal hover:text-teal-dark transition-all"
                aria-label="Share"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-gray-100">
              {[
                { icon: Truck, label: "Free Delivery", sub: "Orders ₹999+" },
                {
                  icon: ShieldCheck,
                  label: "BIS Certified",
                  sub: "Safety assured",
                },
                { icon: RotateCcw, label: "7-Day Return", sub: "Hassle-free" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon size={20} className="text-coral mx-auto mb-1" />
                  <div className="font-semibold text-brand-navy text-xs">
                    {label}
                  </div>
                  <div className="text-brand-light-gray text-[10px]">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card mb-16">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {(["description", "specs", "shipping", "reviews"] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    "px-8 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-2",
                    activeTab === tab
                      ? "border-coral text-coral"
                      : "border-transparent text-brand-light-gray hover:text-brand-navy",
                  )}
                >
                  {tab === "description"
                    ? "Description"
                    : tab === "specs"
                      ? "Specifications"
                      : tab === "shipping"
                        ? "Shipping & Returns"
                        : `Reviews${product.reviewCount > 0 ? ` (${product.reviewCount})` : ""}`}
                </button>
              ),
            )}
          </div>

          <div className="p-8">
            {/* Description tab */}
            {activeTab === "description" && (
              <div className="space-y-5">
                <p className="text-brand-gray text-lg leading-relaxed">
                  {product.description}
                </p>

                {/* Bullet highlights */}
                <ul className="space-y-2 mt-2">
                  {product.ageGroup && (
                    <li className="flex items-start gap-3">
                      <BadgeCheck
                        size={18}
                        className="text-teal-dark mt-0.5 shrink-0"
                      />
                      <span className="text-brand-gray">
                        Suitable for{" "}
                        <strong className="text-brand-navy">
                          {AGE_LABELS[product.ageGroup] ?? product.ageGroup}
                        </strong>
                      </span>
                    </li>
                  )}
                  {specs?.material && (
                    <li className="flex items-start gap-3">
                      <BadgeCheck
                        size={18}
                        className="text-teal-dark mt-0.5 shrink-0"
                      />
                      <span className="text-brand-gray">
                        Made from{" "}
                        <strong className="text-brand-navy">
                          {specs.material}
                        </strong>
                      </span>
                    </li>
                  )}
                  {specs?.safetyStandards &&
                    specs.safetyStandards.length > 0 && (
                      <li className="flex items-start gap-3">
                        <ShieldCheck
                          size={18}
                          className="text-teal-dark mt-0.5 shrink-0"
                        />
                        <span className="text-brand-gray">
                          Safety certified:{" "}
                          <strong className="text-brand-navy">
                            {specs.safetyStandards.join(", ")}
                          </strong>
                        </span>
                      </li>
                    )}
                  {specs?.includedItems && specs.includedItems.length > 0 && (
                    <li className="flex items-start gap-3">
                      <Box
                        size={18}
                        className="text-teal-dark mt-0.5 shrink-0"
                      />
                      <span className="text-brand-gray">
                        Box includes:{" "}
                        <strong className="text-brand-navy">
                          {specs.includedItems.join(", ")}
                        </strong>
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Specifications tab */}
            {activeTab === "specs" && (
              <div>
                {!specs ||
                Object.values(specs).every(
                  (v) => !v || (Array.isArray(v) && v.length === 0),
                ) ? (
                  <p className="text-brand-light-gray text-center py-8">
                    No specifications available for this product.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {specs.material && (
                      <SpecRow label="Material" value={specs.material} />
                    )}
                    {specs.dimensions && (
                      <SpecRow label="Dimensions" value={specs.dimensions} />
                    )}
                    {specs.weight && (
                      <SpecRow label="Weight" value={specs.weight} />
                    )}
                    {specs.batteryRequired !== undefined && (
                      <SpecRow
                        label="Battery Required"
                        value={specs.batteryRequired ? "Yes" : "No"}
                      />
                    )}
                    {specs.batteryType && specs.batteryRequired && (
                      <SpecRow label="Battery Type" value={specs.batteryType} />
                    )}
                    {specs.safetyStandards &&
                      specs.safetyStandards.length > 0 && (
                        <SpecRow
                          label="Safety Standards"
                          value={specs.safetyStandards.join(", ")}
                        />
                      )}
                    {product.ageGroup && (
                      <SpecRow
                        label="Recommended Age"
                        value={AGE_LABELS[product.ageGroup] ?? product.ageGroup}
                      />
                    )}
                    {specs.includedItems && specs.includedItems.length > 0 && (
                      <div className="sm:col-span-2 flex gap-3 p-4 rounded-2xl bg-gray-50">
                        <Tag
                          size={16}
                          className="text-teal-dark mt-0.5 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-brand-light-gray uppercase tracking-wider mb-1">
                            What&apos;s in the Box
                          </p>
                          <ul className="space-y-0.5">
                            {specs.includedItems.map((item) => (
                              <li
                                key={item}
                                className="text-sm text-brand-gray flex items-center gap-2"
                              >
                                <Check
                                  size={12}
                                  className="text-teal-dark shrink-0"
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Variants table */}
                {variants.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-brand-navy mb-3 text-sm uppercase tracking-wider">
                      Available Variants
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-gray-100">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-brand-light-gray uppercase text-xs tracking-wider">
                          <tr>
                            {variants.some((v) => v.color) && (
                              <th className="px-4 py-3 text-left">Colour</th>
                            )}
                            {variants.some((v) => v.size) && (
                              <th className="px-4 py-3 text-left">Size</th>
                            )}
                            {variants.some((v) => v.sku) && (
                              <th className="px-4 py-3 text-left">SKU</th>
                            )}
                            {variants.some((v) => v.price) && (
                              <th className="px-4 py-3 text-right">Price</th>
                            )}
                            <th className="px-4 py-3 text-center">Available</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {variants.map((v, i) => (
                            <tr
                              key={i}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              {variants.some((x) => x.color) && (
                                <td className="px-4 py-3 text-brand-navy">
                                  {v.color || "—"}
                                </td>
                              )}
                              {variants.some((x) => x.size) && (
                                <td className="px-4 py-3 text-brand-navy">
                                  {v.size || "—"}
                                </td>
                              )}
                              {variants.some((x) => x.sku) && (
                                <td className="px-4 py-3 font-mono text-xs text-brand-light-gray">
                                  {v.sku || "—"}
                                </td>
                              )}
                              {variants.some((x) => x.price) && (
                                <td className="px-4 py-3 text-right font-semibold text-brand-navy">
                                  {v.price
                                    ? `₹${v.price.toLocaleString()}`
                                    : "—"}
                                  {v.discountPrice && (
                                    <span className="text-xs text-brand-light-gray line-through ml-1">
                                      ₹{v.discountPrice.toLocaleString()}
                                    </span>
                                  )}
                                </td>
                              )}
                              <td className="px-4 py-3 text-center">
                                {v.isAvailable ? (
                                  <span className="text-green-600">✓</span>
                                ) : (
                                  <span className="text-red-400">✗</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shipping tab */}
            {activeTab === "shipping" && (
              <div className="space-y-5 text-brand-gray">
                {[
                  {
                    icon: Truck,
                    title: "Standard Delivery",
                    body: "2–5 business days. Free on orders above ₹999. ₹49 for orders below.",
                  },
                  {
                    icon: Zap,
                    title: "Same-Day Dispatch",
                    body: "Orders placed before 2 PM (Mon–Sat) are dispatched the same day.",
                  },
                  {
                    icon: Package,
                    title: "Secure Packaging",
                    body: "Every toy is bubble-wrapped and packed in a sturdy box. Gift wrapping available for ₹49.",
                  },
                  {
                    icon: RotateCcw,
                    title: "7-Day Returns",
                    body: "Return unused, undamaged items in original packaging within 7 days for a full refund.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Warranty",
                    body: "All products carry a minimum 6-month manufacturing defect warranty.",
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 bg-coral/10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-coral" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-navy">{title}</p>
                      <p className="text-sm mt-0.5 leading-relaxed">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* ── Write / Edit form ─────────────────────────────────── */}
                {isAuthenticated ? (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-brand-navy text-lg mb-4">
                      {editingReview ? "Edit your review" : "Write a review"}
                    </h3>

                    {reviewSuccess && (
                      <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
                        {reviewSuccess}
                      </div>
                    )}
                    {reviewError && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                        {reviewError}
                      </div>
                    )}

                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Star picker */}
                      <div>
                        <label className="block text-sm font-medium text-brand-navy mb-1.5">
                          Rating
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() =>
                                setReviewForm((f) => ({ ...f, rating: n }))
                              }
                              className="p-0.5 focus:outline-none"
                            >
                              <Star
                                size={28}
                                className={clsx(
                                  "transition-colors",
                                  n <= reviewForm.rating
                                    ? "text-gold fill-gold"
                                    : "text-gray-200 fill-gray-200",
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-brand-navy mb-1.5">
                          Title (optional)
                        </label>
                        <input
                          type="text"
                          value={reviewForm.title}
                          onChange={(e) =>
                            setReviewForm((f) => ({
                              ...f,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Summarise your experience"
                          maxLength={120}
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-brand-navy mb-1.5">
                          Your review
                        </label>
                        <textarea
                          value={reviewForm.body}
                          onChange={(e) =>
                            setReviewForm((f) => ({
                              ...f,
                              body: e.target.value,
                            }))
                          }
                          placeholder="Tell others about this product…"
                          rows={4}
                          maxLength={2000}
                          className="input-field resize-none"
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {reviewSubmitting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : null}
                          {reviewSubmitting
                            ? "Submitting…"
                            : editingReview
                              ? "Update Review"
                              : "Submit Review"}
                        </button>
                        {editingReview && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReview(null);
                              setReviewForm({ rating: 5, title: "", body: "" });
                              setReviewError("");
                            }}
                            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-brand-gray hover:border-coral hover:text-coral text-sm font-medium transition-all"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <p className="text-brand-gray mb-3">
                      Sign in to write a review for this product.
                    </p>
                    <button
                      onClick={() => router.push("/auth")}
                      className="btn-primary"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {/* ── Reviews list ──────────────────────────────────────── */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 size={32} className="text-coral animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-brand-light-gray text-center py-8">
                    No reviews yet. Be the first to review this product!
                  </p>
                ) : (
                  <div className="space-y-5">
                    {reviews.map((rev) => (
                      <div
                        key={rev._id}
                        className="bg-white rounded-2xl border border-gray-100 p-5"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-coral/15 flex items-center justify-center font-bold text-coral text-sm shrink-0">
                              {rev.customerName?.charAt(0).toUpperCase() || "C"}
                            </div>
                            <div>
                              <p className="font-semibold text-brand-navy text-sm">
                                {rev.customerName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Stars rating={rev.rating} size={13} />
                                {rev.verified && (
                                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold border border-green-100">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-brand-light-gray">
                              {new Date(rev.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                            {/* Owner actions */}
                            {customer && rev.customer === customer._id && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingReview(rev);
                                    setReviewForm({
                                      rating: rev.rating,
                                      title: rev.title ?? "",
                                      body: rev.body,
                                    });
                                    setReviewError("");
                                    setReviewSuccess("");
                                    window.scrollTo({
                                      top: 800,
                                      behavior: "smooth",
                                    });
                                  }}
                                  className="p-1.5 rounded-lg text-brand-light-gray hover:text-coral hover:bg-coral/10 transition-all"
                                  title="Edit review"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteReview(rev._id)}
                                  className="p-1.5 rounded-lg text-brand-light-gray hover:text-red-500 hover:bg-red-50 transition-all"
                                  title="Delete review"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {rev.title && (
                          <p className="font-semibold text-brand-navy text-sm mb-1">
                            {rev.title}
                          </p>
                        )}
                        <p className="text-brand-gray text-sm leading-relaxed">
                          {rev.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {reviewTotalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                      disabled={reviewPage === 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-brand-gray hover:border-coral hover:text-coral disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setReviewPage((p) => Math.min(reviewTotalPages, p + 1))
                      }
                      disabled={reviewPage === reviewTotalPages}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-brand-gray hover:border-coral hover:text-coral disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Related Products ───────────────────────────────────────────── */}
        {related.length > 0 && (
          <div>
            <h2 className="section-title mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Spec row helper ──────────────────────────────────────────────────────────
function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-gray-50">
      <div className="flex-1">
        <p className="text-xs font-semibold text-brand-light-gray uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium text-brand-navy">{value}</p>
      </div>
    </div>
  );
}
