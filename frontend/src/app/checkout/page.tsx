"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  CreditCard,
  Truck,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Home,
  Briefcase,
  ChevronRight,
  AlertCircle,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import {
  addAddress,
  createRazorpayOrder,
  verifyPayment,
  placeCODOrder,
  type ShippingAddress,
  type CustomerAddress,
} from "@/lib/customerApi";

const FREE_SHIPPING_AT = 999;

// ─── Razorpay types ───────────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance { open(): void }

// ─── Load Razorpay script ─────────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== "undefined") return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── New Address Mini-Form ────────────────────────────────────────────────────
function NewAddressForm({
  onSave,
  onCancel,
  saving,
}: {
  onSave: (data: Omit<CustomerAddress, "_id">) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });
  const h = (k: keyof typeof form, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="bg-gray-50 rounded-2xl p-5 border-2 border-dashed border-teal space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-brand-navy text-sm">New Address</p>
        <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-200 transition-colors">
          <X size={16} className="text-brand-gray" />
        </button>
      </div>

      {/* Label selector */}
      <div className="flex gap-2">
        {(["Home", "Office", "Other"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => h("label", l)}
            className={clsx(
              "flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all flex items-center justify-center gap-1",
              form.label === l ? "border-coral bg-coral/10 text-coral" : "border-gray-200 text-brand-gray",
            )}
          >
            {l === "Home" ? <Home size={12} /> : l === "Office" ? <Briefcase size={12} /> : <MapPin size={12} />}
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <input className="input-field text-sm" placeholder="Full Name *" value={form.fullName} onChange={(e) => h("fullName", e.target.value)} />
        </div>
        <div className="col-span-2">
          <input className="input-field text-sm" placeholder="Phone *" value={form.phone} onChange={(e) => h("phone", e.target.value)} />
        </div>
        <div className="col-span-2">
          <input className="input-field text-sm" placeholder="Address Line 1 *" value={form.line1} onChange={(e) => h("line1", e.target.value)} />
        </div>
        <div className="col-span-2">
          <input className="input-field text-sm" placeholder="Address Line 2 (optional)" value={form.line2} onChange={(e) => h("line2", e.target.value)} />
        </div>
        <input className="input-field text-sm" placeholder="City *" value={form.city} onChange={(e) => h("city", e.target.value)} />
        <input className="input-field text-sm" placeholder="State *" value={form.state} onChange={(e) => h("state", e.target.value)} />
        <input className="input-field text-sm col-span-2" placeholder="Pincode *" value={form.pincode} onChange={(e) => h("pincode", e.target.value)} />
      </div>

      <button
        onClick={() => {
          if (!form.fullName || !form.phone || !form.line1 || !form.city || !form.state || !form.pincode) return;
          onSave(form);
        }}
        disabled={saving}
        className="btn-primary w-full justify-center !py-2.5 !text-sm"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
        {saving ? "Saving…" : "Save & Use This Address"}
      </button>
    </div>
  );
}

// ─── Checkout Page ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { customer, token, isAuthenticated, isLoading } = useCustomer();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);

  const shippingCharge = subtotal >= FREE_SHIPPING_AT ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax + shippingCharge;

  // Auth + empty cart guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/auth?redirect=/checkout");
    if (!isLoading && isAuthenticated && items.length === 0) router.replace("/cart");
  }, [isLoading, isAuthenticated, items.length, router]);

  // Load addresses from customer
  useEffect(() => {
    if (customer?.addresses) {
      setAddresses(customer.addresses);
      const def = customer.addresses.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def._id);
      else if (customer.addresses.length > 0) setSelectedAddressId(customer.addresses[0]._id);
    }
  }, [customer]);

  const handleSaveNewAddress = async (data: Omit<CustomerAddress, "_id">) => {
    if (!token) return;
    setSavingAddress(true);
    try {
      const res = await addAddress(token, data);
      if (res.success) {
        setAddresses(res.data);
        const newest = res.data[res.data.length - 1];
        setSelectedAddressId(newest._id);
        setShowNewAddressForm(false);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  const buildPayload = () => ({
    items: items.map((i) => ({
      productId: i.product._id,
      quantity: i.quantity,
      variant: i.variant,
    })),
    shippingAddress: selectedAddress as ShippingAddress,
  });

  // ── Razorpay checkout ───────────────────────────────────────────────────────
  const handleRazorpayCheckout = async () => {
    setError("");
    setPlacing(true);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setError("Could not load payment gateway. Please check your connection.");
      setPlacing(false);
      return;
    }

    try {
      const res = await createRazorpayOrder(token!, buildPayload());
      if (!res.success) throw new Error("Failed to create payment order.");

      const options: RazorpayOptions = {
        key: res.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        // amount: res.amount,
        amount: 1,
        currency: res.currency,
        name: "Toys & Kids Planet",
        description: `Order #${res.orderNumber}`,
        order_id: res.razorpayOrderId,
        prefill: {
          name: customer?.name || "",
          email: customer?.email || "",
          contact: selectedAddress?.phone || customer?.phone || "",
        },
        theme: { color: "#f4a261" },
        handler: async (response) => {
          try {
            const verRes = await verifyPayment(token!, {
              orderId: res.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (verRes.success) {
              clearCart();
              router.push(`/order-confirmation?id=${verRes.orderId}&num=${verRes.orderNumber}`);
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Verification failed.");
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
            setError("Payment was cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPlacing(false);
    }
  };

  // ── COD checkout ────────────────────────────────────────────────────────────
  const handleCODCheckout = async () => {
    setError("");
    setPlacing(true);
    try {
      const res = await placeCODOrder(token!, buildPayload());
      if (res.success) {
        clearCart();
        router.push(`/order-confirmation?id=${res.orderId}&num=${res.orderNumber}`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address.");
      return;
    }
    if (paymentMethod === "razorpay") handleRazorpayCheckout();
    else handleCODCheckout();
  };

  if (isLoading || items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 size={40} className="text-coral animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-brand-light-gray mb-8">
          <span className="hover:text-coral cursor-pointer" onClick={() => router.push("/cart")}>Cart</span>
          <ChevronRight size={14} />
          <span className="text-brand-navy font-medium">Checkout</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-brand-navy mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-5 py-4 flex items-start gap-3">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Address + Payment ────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-brand-navy flex items-center gap-2">
                  <MapPin size={20} className="text-coral" /> Delivery Address
                </h2>
                {!showNewAddressForm && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="flex items-center gap-1.5 text-sm text-teal-dark hover:text-coral font-medium transition-colors"
                  >
                    <Plus size={16} /> Add New
                  </button>
                )}
              </div>

              {addresses.length === 0 && !showNewAddressForm ? (
                <div className="text-center py-8">
                  <MapPin size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-brand-gray text-sm">No saved addresses. Add one to continue.</p>
                  <button onClick={() => setShowNewAddressForm(true)} className="btn-teal mt-4 !text-sm">
                    <Plus size={16} /> Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={clsx(
                        "flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                        selectedAddressId === addr._id
                          ? "border-coral bg-coral/5"
                          : "border-gray-100 hover:border-teal",
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr._id}
                        checked={selectedAddressId === addr._id}
                        onChange={() => setSelectedAddressId(addr._id)}
                        className="mt-1 accent-coral"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {addr.label === "Home" ? <Home size={13} className="text-teal-dark" /> :
                            addr.label === "Office" ? <Briefcase size={13} className="text-teal-dark" /> :
                            <MapPin size={13} className="text-teal-dark" />}
                          <span className="text-xs font-bold text-teal-dark uppercase tracking-wide">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-coral/15 text-coral font-bold px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </div>
                        <p className="font-semibold text-brand-navy text-sm">{addr.fullName}</p>
                        <p className="text-brand-light-gray text-xs mt-0.5">{addr.phone}</p>
                        <p className="text-brand-gray text-sm mt-1">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""},{" "}
                          {addr.city}, {addr.state} – {addr.pincode}
                        </p>
                      </div>
                    </label>
                  ))}

                  {showNewAddressForm && (
                    <NewAddressForm
                      onSave={handleSaveNewAddress}
                      onCancel={() => setShowNewAddressForm(false)}
                      saving={savingAddress}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-display font-bold text-xl text-brand-navy flex items-center gap-2 mb-5">
                <CreditCard size={20} className="text-coral" /> Payment Method
              </h2>

              <div className="space-y-3">
                {/* Razorpay */}
                <label
                  className={clsx(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                    paymentMethod === "razorpay"
                      ? "border-coral bg-coral/5"
                      : "border-gray-100 hover:border-teal",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="accent-coral"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">R</span>
                      </div>
                      <div>
                        <p className="font-semibold text-brand-navy text-sm">Pay Online</p>
                        <p className="text-brand-light-gray text-xs">UPI, Cards, Net Banking, Wallets via Razorpay</p>
                      </div>
                    </div>
                  </div>
                  <ShieldCheck size={18} className="text-teal-dark flex-shrink-0" />
                </label>

                {/* COD */}
                <label
                  className={clsx(
                    "flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all",
                    paymentMethod === "cod"
                      ? "border-coral bg-coral/5"
                      : "border-gray-100 hover:border-teal",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="accent-coral"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <Truck size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-brand-navy text-sm">Cash on Delivery</p>
                        <p className="text-brand-light-gray text-xs">Pay when your order arrives</p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ── Right: Summary ──────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              <h2 className="font-display font-bold text-xl text-brand-navy mb-5">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={`${item.product._id}__${item.variant?.color || ""}__${item.variant?.size || ""}`}
                    className="flex gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                      {item.product.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🧸</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-navy line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-brand-light-gray mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-brand-navy flex-shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-brand-gray">
                  <span>Subtotal ({totalItems})</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-brand-gray">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-brand-gray">
                  <span>Shipping</span>
                  {shippingCharge === 0 ? (
                    <span className="text-teal-dark font-semibold">FREE</span>
                  ) : (
                    <span>₹{shippingCharge}</span>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-display font-bold text-brand-navy text-xl">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddressId}
                className="btn-primary w-full justify-center mt-6 !py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <><Loader2 size={18} className="animate-spin" /> Processing…</>
                ) : paymentMethod === "razorpay" ? (
                  <><CreditCard size={18} /> Pay ₹{total.toLocaleString()}</>
                ) : (
                  <><Truck size={18} /> Place Order (COD)</>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-brand-light-gray">
                <ShieldCheck size={13} className="text-teal-dark" />
                Secured by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
