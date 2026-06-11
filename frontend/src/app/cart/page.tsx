"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import clsx from "clsx";

const FREE_SHIPPING_AT = 999;

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, removeItem, updateQuantity, clearCart } =
    useCart();
  const [removing, setRemoving] = useState<string | null>(null);

  const shippingCharge = subtotal >= FREE_SHIPPING_AT ? 0 : 49;
  // 18% GST estimate shown in cart
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax + shippingCharge;

  const handleRemove = (productId: string) => {
    setRemoving(productId);
    setTimeout(() => {
      removeItem(productId);
      setRemoving(null);
    }, 200);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-8xl">
          <ShoppingCart size={32} className="text-coral" />
        </div>
        <h1 className="font-display text-3xl font-bold text-brand-navy">
          Your cart is empty
        </h1>
        <p className="text-brand-gray text-center max-w-sm">
          Looks like you haven&apos;t added any toys yet. Browse our collection
          and find something your little one will love!
        </p>
        <Link href="/shop" className="btn-primary">
          <ShoppingBag size={18} />
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-brand-navy">
              Shopping Cart
            </h1>
            <p className="text-brand-light-gray mt-1">
              {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-sm text-brand-light-gray hover:text-red-500 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Clear cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Item list ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const imgUrl = item.product.images?.[0]?.url;
              const key = `${item.product._id}__${item.variant?.color || ""}__${item.variant?.size || ""}`;
              return (
                <div
                  key={key}
                  className={clsx(
                    "bg-white rounded-2xl p-5 flex gap-4 shadow-card transition-all duration-200",
                    removing === item.product._id && "opacity-40 scale-98",
                  )}
                >
                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={item.product.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🧸
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="font-semibold text-brand-navy hover:text-coral transition-colors line-clamp-2 text-sm"
                    >
                      {item.product.name}
                    </Link>

                    {/* Variant badges */}
                    {(item.variant?.color || item.variant?.size) && (
                      <div className="flex gap-2 mt-1">
                        {item.variant.color && (
                          <span className="text-xs bg-gray-100 text-brand-gray px-2 py-0.5 rounded-full">
                            {item.variant.color}
                          </span>
                        )}
                        {item.variant.size && (
                          <span className="text-xs bg-gray-100 text-brand-gray px-2 py-0.5 rounded-full">
                            {item.variant.size}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between flex-wrap gap-3">
                      {/* Price */}
                      <div>
                        <span className="font-display font-bold text-brand-navy text-lg">
                          ₹
                          {(
                            item.product.price * item.quantity
                          ).toLocaleString()}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-brand-light-gray text-xs ml-1.5">
                            ₹{item.product.price.toLocaleString()} each
                          </span>
                        )}
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity - 1,
                              item.variant,
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-coral/10 hover:text-coral flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold text-brand-navy text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity + 1,
                              item.variant,
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-teal/20 hover:text-teal-dark flex items-center justify-center transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => handleRemove(item.product._id)}
                          className="ml-2 w-8 h-8 rounded-lg text-brand-light-gray hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Free shipping progress bar */}
            {subtotal < FREE_SHIPPING_AT && (
              <div className="bg-white rounded-2xl p-4 shadow-card">
                <div className="flex items-center gap-2 text-sm text-brand-gray mb-2">
                  <Truck size={16} className="text-teal-dark" />
                  Add{" "}
                  <strong className="text-brand-navy">
                    ₹{(FREE_SHIPPING_AT - subtotal).toLocaleString()}
                  </strong>{" "}
                  more for free shipping!
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((subtotal / FREE_SHIPPING_AT) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}
            {subtotal >= FREE_SHIPPING_AT && (
              <div className="bg-teal/10 rounded-2xl p-4 flex items-center gap-3 text-sm text-teal-dark font-medium">
                <Truck size={18} />
                🎉 You&apos;ve unlocked free shipping!
              </div>
            )}
          </div>

          {/* ── Order Summary ───────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h2 className="font-display font-bold text-xl text-brand-navy mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-brand-gray">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="text-brand-navy font-medium">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-brand-gray">
                  <span>GST (18%)</span>
                  <span className="text-brand-navy font-medium">
                    ₹{tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-brand-gray">
                  <span className="flex items-center gap-1.5">
                    <Truck size={14} /> Shipping
                  </span>
                  {shippingCharge === 0 ? (
                    <span className="text-teal-dark font-semibold">FREE</span>
                  ) : (
                    <span className="text-brand-navy font-medium">
                      ₹{shippingCharge}
                    </span>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between font-display font-bold text-brand-navy text-lg">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-xs text-brand-light-gray">
                  <ShieldCheck size={14} className="text-teal-dark" />
                  100% secure payments via Razorpay
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-light-gray">
                  <Tag size={14} className="text-coral" />
                  Inclusive of all taxes
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-light-gray">
                  <Truck size={14} className="text-teal-dark" />
                  2–5 day delivery across India
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="btn-primary w-full justify-center mt-6 !py-3.5"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>

              <Link
                href="/shop"
                className="block text-center text-sm text-brand-light-gray hover:text-coral transition-colors mt-4"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
