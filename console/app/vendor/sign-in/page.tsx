import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginVendor } from "~/api/vendorAuth.api";
import { saveVendorToken, saveVendorData } from "~/utils/vendorAuth";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import one_states_logo from "@/welcome/one_states_logo.png";

export default function VendorSignInPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginVendor,
    onSuccess: (data) => {
      if (data.data?.status !== "approved") {
        setMessage({ type: "error", text: `Your shop is ${data.data?.status || "pending"}. Contact support.` });
        return;
      }
      saveVendorToken(data.token);
      saveVendorData(data.data);
      setMessage({ type: "success", text: "Signed in successfully." });
      setTimeout(() => navigate("/vendor/products"), 200);
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err.message || "Login failed." });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!formData.email || !formData.password) {
      return setMessage({ type: "error", text: "Email and password are required." });
    }
    login(formData);
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center mb-4">
                  <h1 className="text-2xl font-bold">Vendor Sign In</h1>
                  <p className="text-muted-foreground text-sm">
                    Login to manage your shop
                  </p>
                </div>

                {message && (
                  <div className={`text-sm p-2 rounded mb-4 ${message.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                    {message.text}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" placeholder="shop@example.com" value={formData.email} onChange={handleChange} required />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
                </Field>

                <Field>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </Field>

                <FieldDescription className="text-center text-sm">
                  New vendor?{" "}
                  <Link to="/vendor/register" className="underline">Register your shop</Link>
                </FieldDescription>
              </FieldGroup>
            </form>

            <div className="relative hidden md:block bg-white dark:bg-secondary">
              <img src={one_states_logo} alt="Logo" className="absolute inset-0 h-full w-full object-contain p-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
