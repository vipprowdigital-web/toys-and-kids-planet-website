"use client";
/**
 * /auth/callback
 *
 * The backend redirects here after Google OAuth with ?token=<jwt>
 * We store it via the CustomerContext then redirect to account.
 */
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCustomer } from "@/context/CustomerContext";
import { getMyProfile } from "@/lib/customerApi";

function AuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useCustomer();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      router.replace("/auth?error=google_failed");
      return;
    }

    getMyProfile(token)
      .then((res) => {
        if (res.success) {
          login(token, res.data);
          router.replace("/account");
        } else {
          router.replace("/auth?error=google_failed");
        }
      })
      .catch(() => router.replace("/auth?error=server_error"));
  }, [params, login, router]);

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
      <Loader2 size={40} className="text-coral animate-spin" />
      <p className="text-brand-gray font-medium">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
          <Loader2 size={40} className="text-coral animate-spin" />
          <p className="text-brand-gray font-medium">Signing you in…</p>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
