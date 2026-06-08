import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // for redirect
import { saveToken } from "~/utils/auth";
import { useAuth } from "~/hooks/useAuth";
import one_states_logo from "@/welcome/one_states_logo.png";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  console.log("INSIDE SignInForm....");

  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const navigate = useNavigate();

  // Handle Each input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.email || !formData.password) {
      return setMessage({
        type: "error",
        text: "Email and Password are required.",
      });
    }

    login(formData, {
      onSuccess: (data) => {
        setMessage({ type: "success", text: "Signed in successfully." });
        setFormData({ email: "", password: "" });

        // Redirect after short delay
        setTimeout(() => navigate("/admin/blog"), 100);
      },
      onError: (error: any) => {
        setMessage({
          type: "error",
          text: error?.message || "Login failed. Please try again.",
        });
      },
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Login to your {import.meta.env.VITE_APP_NAME || "APP"} account
                </p>
              </div>

              {message && (
                <div
                  className={`text-sm p-2 rounded ${
                    message.type === "error"
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {/* <FieldDescription>Input Description</FieldDescription> */}
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Don't have an account? Contact with Admin.
                <Link to="/sign-up"> Sign Up</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden md:block bg-white dark:bg-secondary">
            <img
              src={one_states_logo}
              alt="Image"
              className="absolute inset-0 h-full w-full object-contain p-5"
            />
          </div>
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  );
}
