"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Eye, Star, Check } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { addToWishlist, removeFromWishlist } from "@/lib/customerApi";

interface ProductCardProps {
  product: Product;
}

function getImageUrl(product: Product): string {
  if (product.images?.length > 0) return product.images[0].url;
  return "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop";
}

const BADGE_COLORS: Record<string, string> = {
  "Best Seller": "bg-coral text-white",
  "Top Rated": "bg-teal text-brand-navy",
  "Hot Deal": "bg-coral text-white",
  "New Arrival": "bg-teal text-brand-navy",
  "STEM Pick": "bg-gold text-brand-navy",
  Popular: "bg-teal text-brand-navy",
  Premium: "bg-gold text-brand-navy",
};

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem, isInCart, getItemQuantity } = useCart();
  const { customer, token, isAuthenticated } = useCustomer();

  const inCart = isInCart(product._id);
  const cartQty = getItemQuantity(product._id);

  // Wishlist state — sync from customer context
  const [wishlisted, setWishlisted] = useState<boolean>(
    () => customer?.wishlist?.includes(product._id) ?? false,
  );
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      // silently ignore
    } finally {
      setWishlistLoading(false);
    }
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={clsx(
          i < Math.floor(rating)
            ? "text-gold fill-gold"
            : "text-gray-200 fill-gray-200",
        )}
      />
    ));

  const badgeClass =
    product.badge && BADGE_COLORS[product.badge]
      ? BADGE_COLORS[product.badge]
      : "bg-brand-navy text-white";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="product-card block group sm:rounded-3xl rounded-xl!"
    >
      {/* Image */}
      <div className="product-img-wrapper relative aspect-square bg-gray-50 sm:h-60 w-full">
        <Image
          src={getImageUrl(product)}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className={clsx("badge text-[9px] sm:text-xs", badgeClass)}>
              {product.badge}
            </span>
          )}
          {product.discount > 0 && (
            <span className="badge text-[10px] sm:text-xs bg-brand-navy text-white">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-2 opacity-100 translate-x-0 sm:opacity-0 sm:translate-x-4 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={clsx(
              "w-6 h-6 p-0.6 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm",
              wishlisted
                ? "bg-coral text-white"
                : "bg-white text-brand-gray hover:bg-coral hover:text-white",
              wishlistLoading && "opacity-50 cursor-wait",
            )}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} className={wishlisted ? "fill-white" : ""} />
          </button>

          {/* Quick View */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/product/${product.slug}`);
            }}
            className="w-6 h-6 p-0.6 sm:w-9 sm:h-9 rounded-lg bg-white text-brand-gray hover:bg-teal hover:text-brand-navy flex items-center justify-center transition-all duration-200 shadow-sm"
            aria-label="Quick view"
          >
            <Eye size={16} />
          </button>
        </div>

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-brand-navy text-white text-sm font-semibold px-4 py-2 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* In cart indicator */}
        {inCart && (
          <div className="absolute bottom-3 left-3 bg-teal text-brand-navy text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Check size={10} /> {cartQty} in cart
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-4">
        <h3 className="font-semibold text-brand-navy text-xs sm:text-sm leading-snug sm:mb-1 group-hover:text-coral transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="font-semibold text-gray-400 text-[11px] sm:text-xs leading-snug mb-1.5 group-hover:text-coral transition-colors line-clamp-1 ">
          {product.description}
        </p>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {renderStars(product.rating)}
            </div>
            <span className="text-xs text-brand-light-gray">
              {product.rating} ({product.reviewCount.toLocaleString()})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-display font-bold text-brand-navy text-lg">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-brand-light-gray text-sm line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to cart */}
        {product.inStock ? (
          <button
            onClick={handleAddToCart}
            className={clsx(
              "w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2",
              addedToCart
                ? "bg-teal text-brand-navy"
                : inCart
                  ? "bg-brand-navy/10 text-brand-navy hover:bg-coral hover:text-white"
                  : "bg-brand-navy text-white hover:bg-coral hover:-translate-y-0.5 hover:shadow-btn",
            )}
          >
            {addedToCart ? (
              <>
                <Check size={15} /> Added!
              </>
            ) : inCart ? (
              <>
                <ShoppingCart size={15} /> Add More
              </>
            ) : (
              <>
                <ShoppingCart size={15} /> Add to Cart
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gray-100 text-brand-light-gray cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </Link>
  );
}


