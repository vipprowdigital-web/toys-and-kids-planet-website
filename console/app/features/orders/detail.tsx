// app/features/orders/detail.tsx
// Order detail + status management page.

import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  MapPin,
  CreditCard,
  User,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} from "./data/orderApi";

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

const STATUS_COLORS: Record<string, string> = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-sky-100 text-sky-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  returned: "bg-purple-100 text-purple-700",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-purple-100 text-purple-700",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useGetOrderByIdQuery(id ?? "", { skip: !id });
  const [updateStatus, { isLoading: isSaving }] = useUpdateOrderStatusMutation();

  const order = data?.data;

  // Local form state
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("");
  const [adminNote, setAdminNote] = useState("");

  // Pre-fill once order loads
  const [prefilled, setPrefilled] = useState(false);
  if (order && !prefilled) {
    setStatus(order.status);
    setPaymentStatus(order.paymentStatus);
    setTrackingNumber(order.trackingNumber ?? "");
    setCourierName(order.courierName ?? "");
    setAdminNote(order.adminNote ?? "");
    setPrefilled(true);
  }

  const handleSave = async () => {
    if (!id) return;
    try {
      await updateStatus({
        id,
        status,
        paymentStatus,
        trackingNumber,
        courierName,
        adminNote,
      }).unwrap();
      toast.success("Order updated successfully!");
    } catch {
      toast.error("Failed to update order.");
    }
  };

  if (isLoading || !order) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const customer = typeof order.customer === "object" ? order.customer : null;
  const addr = order.shippingAddress;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Orders
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">
            {order._orderNumber || order._id}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${STATUS_COLORS[order.status] || "bg-gray-100"}`}
          >
            {order.status}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${PAYMENT_COLORS[order.paymentStatus] || "bg-gray-100"}`}
          >
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Items + Address + Customer ────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" /> Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🧸
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {(item.variant?.color || item.variant?.size) && (
                        <p className="text-xs text-muted-foreground">
                          {[item.variant.color, item.variant.size]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="font-semibold text-sm flex-shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t mt-4 pt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>GST</span>
                  <span>₹{order.tax?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  {order.shippingCharge === 0 ? (
                    <span className="text-green-600 font-medium">FREE</span>
                  ) : (
                    <span>₹{order.shippingCharge?.toLocaleString("en-IN")}</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-1">
                  <span>Total</span>
                  <span>₹{order.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-semibold">{addr?.fullName}</p>
              <p className="text-muted-foreground">{addr?.phone}</p>
              <p className="text-muted-foreground">
                {addr?.line1}
                {addr?.line2 ? `, ${addr.line2}` : ""}
              </p>
              <p className="text-muted-foreground">
                {addr?.city}, {addr?.state} – {addr?.pincode}
              </p>
            </CardContent>
          </Card>

          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-semibold">{customer?.name || "—"}</p>
              <p className="text-muted-foreground">{customer?.email || order.customerEmail}</p>
              <p className="text-muted-foreground">{customer?.phone || order.customerPhone || "—"}</p>
            </CardContent>
          </Card>

          {/* Payment info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium uppercase">{order.paymentMethod}</span>
              </div>
              {order.razorpayOrderId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Razorpay Order ID</span>
                  <span className="font-mono text-xs">{order.razorpayOrderId}</span>
                </div>
              )}
              {order.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="font-mono text-xs">{order.razorpayPaymentId}</span>
                </div>
              )}
              {order.customerNote && (
                <div>
                  <span className="text-muted-foreground block mb-1">Customer Note</span>
                  <p className="bg-muted rounded-lg p-2 text-xs">{order.customerNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Right: Update Panel ──────────────────────────────────────── */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Update Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Order Status */}
              <div className="space-y-1.5">
                <Label>Order Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status */}
              <div className="space-y-1.5">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tracking */}
              <div className="space-y-1.5">
                <Label>Tracking Number</Label>
                <Input
                  placeholder="e.g. DTD123456789IN"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Courier Name</Label>
                <Input
                  placeholder="e.g. Delhivery, BlueDart"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                />
              </div>

              {/* Admin note */}
              <div className="space-y-1.5">
                <Label>Admin Note (internal)</Label>
                <Textarea
                  placeholder="Notes visible only to admin"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>

              {/* Quick status shortcuts */}
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Quick Actions
                </p>
                {[
                  { label: "✓ Confirm Order", s: "confirmed", p: "pending" },
                  { label: "📦 Mark Processing", s: "processing", p: undefined },
                  { label: "🚚 Mark Shipped", s: "shipped", p: undefined },
                  { label: "✅ Mark Delivered", s: "delivered", p: "paid" },
                ].map(({ label, s, p }) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={async () => {
                      setStatus(s);
                      if (p) setPaymentStatus(p);
                      try {
                        await updateStatus({
                          id: id!,
                          status: s,
                          ...(p ? { paymentStatus: p } : {}),
                        }).unwrap();
                        toast.success(`Order marked as ${s}`);
                        setPrefilled(false); // re-sync
                      } catch {
                        toast.error("Update failed.");
                      }
                    }}
                    disabled={isSaving}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
