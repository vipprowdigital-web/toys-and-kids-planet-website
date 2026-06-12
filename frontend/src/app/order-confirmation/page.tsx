"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  Loader2,
  Home,
} from "lucide-react";
import { useCustomer } from "@/context/CustomerContext";
import { getMyOrderById, type OrderDoc } from "@/lib/customerApi";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    placed: "bg-blue-100 text-blue-700",
    confirmed: "bg-teal/20 text-teal-dark",
    processing: "bg-gold/20 text-brand-navy",
    shipped: "bg-coral/15 text-coral",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    returned: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function OrderConfirmationInner() {
  const params = useSearchParams();
  const { token } = useCustomer();
  const orderId = params.get("id");
  const orderNumber = params.get("num");

  const [order, setOrder] = useState<OrderDoc | null>(null);
  const [loading, setLoading] = useState(() => Boolean(orderId && token));

  useEffect(() => {
    if (!orderId || !token) return;
    getMyOrderById(token, orderId)
      .then((res) => { if (res.success) setOrder(res.data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={40} className="text-coral animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Success banner */}
        {(order?._orderNumber || orderNumber) && (

          <div className="bg-white rounded-3xl shadow-card-hover p-8 text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={44} className="text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-bold text-brand-navy mb-2">
              Order Placed! 🎉
            </h1>
            <p className="text-brand-gray">
              {order?.paymentMethod === "cod"
                ? "Your order has been placed successfully. Pay on delivery."
                : "Payment successful! Your order is confirmed."}
            </p>
            {(order?._orderNumber || orderNumber) && (
              <div className="mt-4 inline-block bg-cream border border-gray-200 rounded-xl px-5 py-2">
                <span className="text-brand-light-gray text-sm">Order Number: </span>
                <span className="font-bold text-brand-navy text-sm">
                  {order?._orderNumber || orderNumber}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Order details */}
        {order && (
          <div className="bg-white rounded-3xl shadow-card p-6 mb-6 space-y-6">

            {/* Status + payment */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <StatusBadge status={order.status} />
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                {order.paymentStatus === "paid" ? "✓ Paid" : order.paymentMethod === "cod" ? "Pay on Delivery" : "Payment Pending"}
              </span>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-brand-navy mb-3 flex items-center gap-2">
                <Package size={16} className="text-coral" /> Items Ordered
              </h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🧸</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-navy line-clamp-1">{item.name}</p>
                      {(item.variant?.color || item.variant?.size) && (
                        <p className="text-xs text-brand-light-gray mt-0.5">
                          {[item.variant.color, item.variant.size].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <p className="text-xs text-brand-light-gray">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-brand-navy text-sm flex-shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-brand-gray">
                <span>Subtotal</span><span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-gray">
                <span>GST</span><span>₹{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-brand-gray">
                <span>Shipping</span>
                {order.shippingCharge === 0
                  ? <span className="text-teal-dark font-semibold">FREE</span>
                  : <span>₹{order.shippingCharge}</span>}
              </div>
              <div className="flex justify-between font-display font-bold text-brand-navy text-lg border-t border-gray-100 pt-2 mt-1">
                <span>Total</span><span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-cream rounded-2xl p-4">
              <h3 className="font-semibold text-brand-navy mb-2 flex items-center gap-2 text-sm">
                <Truck size={15} className="text-coral" /> Deliver To
              </h3>
              <p className="text-sm text-brand-navy font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-brand-gray mt-0.5">{order.shippingAddress.phone}</p>
              <p className="text-sm text-brand-light-gray mt-1">
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""},{" "}
                {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
              </p>
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/account?tab=orders" className="flex-1 btn-primary justify-center">
            <Package size={18} /> View My Orders
          </Link>
          <Link href="/shop" className="flex-1 btn-outline-coral justify-center">
            <ArrowRight size={18} /> Continue Shopping
          </Link>
          <Link href="/" className="flex-1 btn-teal justify-center">
            <Home size={18} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <Loader2 size={40} className="text-coral animate-spin" />
        </div>
      }
    >
      <OrderConfirmationInner />
    </Suspense>
  );
}
