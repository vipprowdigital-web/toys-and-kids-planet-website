import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerVendor } from "~/api/vendorAuth.api";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";

export default function VendorRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    description: "",
    gstNumber: "",
    panNumber: "",
  });
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const { mutate: register, isPending } = useMutation({
    mutationFn: registerVendor,
    onSuccess: () => {
      setMessage({
        type: "success",
        text: "Shop registration submitted! You will receive an email once approved by our team.",
      });
      setTimeout(() => navigate("/vendor/sign-in"), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err.message || "Registration failed." });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!formData.shopName || !formData.ownerName || !formData.email || !formData.password) {
      return setMessage({ type: "error", text: "Shop name, owner name, email and password are required." });
    }
    if (formData.password !== formData.confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match." });
    }
    const { confirmPassword, ...payload } = formData;
    register(payload);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-2 text-center mb-6">
              <h1 className="text-2xl font-bold">Register Your Shop</h1>
              <p className="text-muted-foreground text-sm">
                Create a vendor account to start selling on our platform
              </p>
            </div>

            {message && (
              <div className={`text-sm p-3 rounded mb-6 ${message.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="shopName">Shop Name *</FieldLabel>
                  <Input id="shopName" placeholder="My Awesome Toy Store" value={formData.shopName} onChange={handleChange} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ownerName">Owner Name *</FieldLabel>
                  <Input id="ownerName" placeholder="John Doe" value={formData.ownerName} onChange={handleChange} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email *</FieldLabel>
                  <Input id="email" type="email" placeholder="shop@example.com" value={formData.email} onChange={handleChange} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input id="phone" placeholder="+91 9999999999" value={formData.phone} onChange={handleChange} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password *</FieldLabel>
                  <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password *</FieldLabel>
                  <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="gstNumber">GST Number</FieldLabel>
                  <Input id="gstNumber" placeholder="22AAAAA0000A1Z5" value={formData.gstNumber} onChange={handleChange} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="panNumber">PAN Number</FieldLabel>
                  <Input id="panNumber" placeholder="AAAPL1234C" value={formData.panNumber} onChange={handleChange} />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="description">Shop Description</FieldLabel>
                <Textarea id="description" placeholder="Tell customers about your shop..." value={formData.description} onChange={handleChange} rows={3} />
              </Field>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Submitting..." : "Register Shop"}
              </Button>

              <FieldDescription className="text-center text-sm">
                Already have a vendor account?{" "}
                <Link to="/vendor/sign-in" className="underline">Sign In</Link>
              </FieldDescription>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
