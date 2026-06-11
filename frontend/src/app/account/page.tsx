"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Heart,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  CheckCircle2,
  X,
  Home,
  Briefcase,
  Package,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useCustomer } from "@/context/CustomerContext";
import {
  updateMyProfile,
  addAddress,
  deleteAddress,
  updateAddress,
  getWishlist,
  removeFromWishlist,
  getMyOrders,
  cancelOrder,
  type CustomerAddress,
  type OrderDoc,
} from "@/lib/customerApi";
import type { Product } from "@/types";

type Tab = "profile" | "wishlist" | "addresses" | "orders";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ORDER_STATUS_COLOR: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-teal/20 text-teal-dark",
  processing: "bg-gold/20 text-brand-navy",
  shipped: "bg-coral/15 text-coral",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  returned: "bg-purple-100 text-purple-700",
};

function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
        ORDER_STATUS_COLOR[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

// ─── Address Modal (Add & Edit) ───────────────────────────────────────────────

function AddressModal({
  onClose,
  onSave,
  existing,
}: {
  onClose: () => void;
  onSave: (data: Omit<CustomerAddress, "_id">) => Promise<void>;
  existing?: CustomerAddress;
}) {
  const isEdit = !!existing;
  const [form, setForm] = useState({
    label: existing?.label ?? "Home",
    fullName: existing?.fullName ?? "",
    phone: existing?.phone ?? "",
    line1: existing?.line1 ?? "",
    line2: existing?.line2 ?? "",
    city: existing?.city ?? "",
    state: existing?.state ?? "",
    pincode: existing?.pincode ?? "",
    isDefault: existing?.isDefault ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const h = (k: keyof typeof form, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.fullName ||
      !form.phone ||
      !form.line1 ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      setError("Please fill all required fields.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-card-hover p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl text-brand-navy">
            {isEdit ? "Edit Address" : "Add New Address"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-brand-gray" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label picker */}
          <div className="flex gap-3">
            {(["Home", "Office", "Other"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => h("label", l)}
                className={clsx(
                  "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-1.5",
                  form.label === l
                    ? "border-coral bg-coral/10 text-coral"
                    : "border-gray-200 text-brand-gray hover:border-teal",
                )}
              >
                {l === "Home" ? (
                  <Home size={14} />
                ) : l === "Office" ? (
                  <Briefcase size={14} />
                ) : (
                  <MapPin size={14} />
                )}
                {l}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-brand-gray mb-1">
                Full Name *
              </label>
              <input
                className="input-field"
                value={form.fullName}
                onChange={(e) => h("fullName", e.target.value)}
                placeholder="Priya Sharma"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-brand-gray mb-1">
                Phone *
              </label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => h("phone", e.target.value)}
                placeholder="10-digit mobile number"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-brand-gray mb-1">
                Address Line 1 *
              </label>
              <input
                className="input-field"
                value={form.line1}
                onChange={(e) => h("line1", e.target.value)}
                placeholder="Flat / House no., Building name"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-brand-gray mb-1">
                Address Line 2
              </label>
              <input
                className="input-field"
                value={form.line2}
                onChange={(e) => h("line2", e.target.value)}
                placeholder="Street, Area, Landmark (optional)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-gray mb-1">
                City *
              </label>
              <input
                className="input-field"
                value={form.city}
                onChange={(e) => h("city", e.target.value)}
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-gray mb-1">
                State *
              </label>
              <input
                className="input-field"
                value={form.state}
                onChange={(e) => h("state", e.target.value)}
                placeholder="Maharashtra"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-gray mb-1">
                Pincode *
              </label>
              <input
                className="input-field"
                value={form.pincode}
                onChange={(e) => h("pincode", e.target.value)}
                placeholder="400001"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                id="isDefault"
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => h("isDefault", e.target.checked)}
                className="w-4 h-4 accent-coral"
              />
              <label
                htmlFor="isDefault"
                className="text-sm text-brand-gray cursor-pointer"
              >
                Set as default
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline-coral py-2.5! justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-2.5! justify-center"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {saving ? "Saving…" : isEdit ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Account Page ─────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    customer,
    token,
    isAuthenticated,
    isLoading,
    logout,
    refreshProfile,
  } = useCustomer();

  // Read ?tab= from URL, default "profile"
  const urlTab = (searchParams.get("tab") as Tab) || "profile";
  const [activeTab, setActiveTab] = useState<Tab>(urlTab);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null,
  );

  // Keep tab in sync when URL changes (e.g. navbar links)
  useEffect(() => {
    const handleSetActiveTab = () => setActiveTab(urlTab);
    handleSetActiveTab();
  }, [urlTab]);

  // Profile
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Wishlist
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);

  // Orders
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/auth");
  }, [isLoading, isAuthenticated, router]);

  // Prefill profile fields
  useEffect(() => {
    if (customer) {
      const handleSetName = () => setEditName(customer.name || "");
      handleSetName();
      const handleSetPhone = () => setEditPhone(customer.phone || "");
      handleSetPhone();
    }
  }, [customer]);

  // Load wishlist when tab activates (only once)
  useEffect(() => {
    if (activeTab === "wishlist" && token && !wishlistLoaded) {
      const handleSetWishlistLoading = () => setWishlistLoading(true);
      handleSetWishlistLoading();
      getWishlist(token)
        .then((res) => {
          if (res.success) setWishlistProducts(res.data as Product[]);
          setWishlistLoaded(true);
        })
        .catch(() => {})
        .finally(() => setWishlistLoading(false));
    }
  }, [activeTab, token, wishlistLoaded]);

  // Load orders when tab activates (only once)
  useEffect(() => {
    if (activeTab === "orders" && token && !ordersLoaded) {
      const handleSetOrderLoading = () => setOrdersLoading(true);
      handleSetOrderLoading();
      getMyOrders(token)
        .then((res) => {
          if (res.success) setOrders(res.data);
          setOrdersLoaded(true);
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, token, ordersLoaded]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingProfile(true);
    try {
      await updateMyProfile(token, { name: editName, phone: editPhone });
      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      /* silent */
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (data: Omit<CustomerAddress, "_id">) => {
    if (!token) return;
    await addAddress(token, data);
    await refreshProfile();
  };

  const handleDeleteAddress = async (id: string) => {
    if (!token) return;
    await deleteAddress(token, id);
    await refreshProfile();
  };

  const handleEditAddress = async (data: Omit<CustomerAddress, "_id">) => {
    if (!token || !editingAddress) return;
    await updateAddress(token, editingAddress._id, data);
    await refreshProfile();
  };

  const handleRemoveWishlist = async (productId: string) => {
    if (!token) return;
    await removeFromWishlist(token, productId);
    setWishlistProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!token) return;
    setCancellingId(orderId);
    try {
      const res = await cancelOrder(token, orderId, "Cancelled by customer");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data : o)),
        );
      }
    } catch {
      /* silent */
    } finally {
      setCancellingId(null);
    }
  };

  // ── Switch tab + update URL ───────────────────────────────────────────────

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    router.replace(`/account?tab=${tab}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 size={40} className="text-coral animate-spin" />
      </div>
    );
  }

  if (!customer) return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "My Profile", icon: <User size={16} /> },
    { id: "orders", label: "My Orders", icon: <Package size={16} /> },
    { id: "wishlist", label: "Wishlist", icon: <Heart size={16} /> },
    { id: "addresses", label: "Addresses", icon: <MapPin size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal/20 flex items-center justify-center overflow-hidden">
              {customer.avatar ? (
                <Image
                  src={customer.avatar}
                  alt={customer.name || "Avatar"}
                  width={56}
                  height={56}
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-teal-dark">
                  {(customer.name || customer.email || "?")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-navy">
                {customer.name || "My Account"}
              </h1>
              <p className="text-brand-light-gray text-sm">{customer.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-brand-gray hover:text-coral transition-colors px-4 py-2 rounded-xl hover:bg-coral/10"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-3 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-coral text-white shadow-btn"
                      : "text-brand-gray hover:bg-gray-50 hover:text-brand-navy",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            {/* ── PROFILE ────────────────────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
                <h2 className="font-display font-bold text-xl text-brand-navy mb-6">
                  Personal Details
                </h2>
                {profileSuccess && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Profile updated successfully!
                  </div>
                )}
                <form
                  onSubmit={handleSaveProfile}
                  className="space-y-5 max-w-md"
                >
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1.5">
                      Full Name
                    </label>
                    <input
                      className="input-field"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1.5">
                      Email
                    </label>
                    <input
                      className="input-field bg-gray-50 cursor-not-allowed"
                      value={customer.email || ""}
                      readOnly
                    />
                    <p className="text-xs text-brand-light-gray mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1.5">
                      Phone Number
                    </label>
                    <input
                      className="input-field"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-primary"
                  >
                    {savingProfile ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Pencil size={16} />
                    )}
                    {savingProfile ? "Saving…" : "Save Changes"}
                  </button>
                </form>
              </div>
            )}

            {/* ── ORDERS ─────────────────────────────────────────────────── */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
                <h2 className="font-display font-bold text-xl text-brand-navy mb-6 flex items-center gap-2">
                  <Package size={20} className="text-coral" /> My Orders
                </h2>

                {ordersLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 size={32} className="text-coral animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-brand-gray font-medium">No orders yet</p>
                    <p className="text-brand-light-gray text-sm mt-1">
                      Your order history will appear here
                    </p>
                    <Link href="/shop" className="btn-primary mt-6 inline-flex">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-100 rounded-2xl p-5 hover:shadow-card transition-shadow"
                      >
                        {/* Order header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <p className="font-semibold text-brand-navy text-sm">
                              {order._orderNumber}
                            </p>
                            <p className="text-brand-light-gray text-xs mt-0.5">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <OrderStatusBadge status={order.status} />
                            <span
                              className={clsx(
                                "text-xs font-semibold px-2 py-0.5 rounded-full",
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700",
                              )}
                            >
                              {order.paymentStatus === "paid"
                                ? "✓ Paid"
                                : order.paymentMethod === "cod"
                                  ? "COD"
                                  : "Pending"}
                            </span>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                          {order.items.slice(0, 4).map((item, i) => (
                            <div
                              key={i}
                              className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden shrink-0 relative"
                            >
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl">
                                  🧸
                                </div>
                              )}
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-brand-gray shrink-0">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>

                        {/* Total + actions */}
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <span className="text-brand-light-gray text-xs">
                              Total
                            </span>
                            <p className="font-display font-bold text-brand-navy">
                              ₹{order.totalAmount.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/order-confirmation?id=${order._id}&num=${order._orderNumber}`}
                              className="flex items-center gap-1.5 text-sm text-teal-dark hover:text-coral font-medium transition-colors"
                            >
                              View Details <ChevronRight size={14} />
                            </Link>
                            {["placed", "confirmed"].includes(order.status) && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                disabled={cancellingId === order._id}
                                className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                              >
                                {cancellingId === order._id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <RotateCcw size={14} />
                                )}
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── WISHLIST ────────────────────────────────────────────────── */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
                <h2 className="font-display font-bold text-xl text-brand-navy mb-6">
                  My Wishlist
                </h2>
                {wishlistLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 size={32} className="text-coral animate-spin" />
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-brand-gray font-medium">
                      Your wishlist is empty
                    </p>
                    <p className="text-brand-light-gray text-sm mt-1">
                      Save products you love here
                    </p>
                    <Link href="/shop" className="btn-primary mt-6 inline-flex">
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex gap-4 p-4 border items-start border-gray-100 rounded-2xl group"
                      >
                        <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden shrink-0 relative">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              🧸
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-semibold text-brand-navy text-sm line-clamp-2 hover:text-coral transition-colors"
                          >
                            {product.name}
                          </Link>
                          <p className="text-coral font-bold mt-1">
                            ₹{product.price?.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveWishlist(product._id)}
                          className="shrink-0 p-2 rounded-xl text-brand-light-gray hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ADDRESSES ──────────────────────────────────────────────── */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl shadow-card p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-xl text-brand-navy">
                    Saved Addresses
                  </h2>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="btn-teal px-4! py-2! text-sm!"
                  >
                    <Plus size={16} /> Add Address
                  </button>
                </div>

                {customer.addresses.length === 0 ? (
                  <div className="text-center py-16">
                    <MapPin size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-brand-gray font-medium">
                      No saved addresses yet
                    </p>
                    <p className="text-brand-light-gray text-sm mt-1">
                      Add an address for faster checkout
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customer.addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={clsx(
                          "relative p-5 border-2 rounded-2xl group transition-all",
                          addr.isDefault
                            ? "border-coral bg-coral/5"
                            : "border-gray-100 hover:border-teal",
                        )}
                      >
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 bg-coral text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          {addr.label === "Home" ? (
                            <Home size={14} className="text-teal-dark" />
                          ) : addr.label === "Office" ? (
                            <Briefcase size={14} className="text-teal-dark" />
                          ) : (
                            <MapPin size={14} className="text-teal-dark" />
                          )}
                          <span className="text-xs font-semibold text-teal-dark uppercase tracking-wide">
                            {addr.label}
                          </span>
                        </div>
                        <p className="font-semibold text-brand-navy text-sm">
                          {addr.fullName}
                        </p>
                        <p className="text-brand-gray text-sm mt-0.5">
                          {addr.phone}
                        </p>
                        <p className="text-brand-light-gray text-sm mt-1 leading-relaxed">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ""}
                          <br />
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                        <div className="mt-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingAddress(addr);
                              setShowAddressModal(true);
                            }}
                            className="flex items-center gap-1 text-xs text-teal-dark hover:text-coral transition-colors"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="flex items-center gap-1 text-xs text-brand-light-gray hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal
          onClose={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
          onSave={editingAddress ? handleEditAddress : handleAddAddress}
          existing={editingAddress ?? undefined}
        />
      )}
    </div>
  );
}
