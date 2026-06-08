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
import { useAuth } from "~/hooks/useAuth";
import one_states_logo from "@/welcome/one_states_logo.png";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const navigate = useNavigate();

  // handle field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // handle submit via TanStack mutation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword)
      return setMessage({ type: "error", text: "All fields are required." });

    if (password !== confirmPassword)
      return setMessage({ type: "error", text: "Passwords do not match." });

    if (password.length < 8)
      return setMessage({
        type: "error",
        text: "Password must be at least 8 characters long.",
      });

    register(
      { name, email, password },
      {
        onSuccess: () => {
          setMessage({
            type: "success",
            text: "Account created successfully! Redirecting...",
          });
          setFormData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          setTimeout(() => navigate("/sign-in"), 1500);
        },
        onError: (error: any) => {
          setMessage({
            type: "error",
            text: error?.message || "Registration failed. Please try again.",
          });
        },
      },
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details below to create your account
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
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {/* <FieldDescription>Input Description</FieldDescription> */}
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {/* <FieldDescription>Input Description</FieldDescription> */}
              </Field>

              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account?{" "}
                <Link to="/sign-in" className="hover:text-secondary">
                  Sign In
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="relative hidden md:block bg-white dark:bg-white">
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
