import React from "react";
import { Navigate } from "react-router-dom";
import { isVendorAuthenticated } from "~/utils/vendorAuth";

interface Props {
  children: React.ReactNode;
}

export function VendorProtectedRoute({ children }: Props) {
  if (typeof window !== "undefined" && !isVendorAuthenticated()) {
    return <Navigate to="/vendor/sign-in" replace />;
  }
  return <>{children}</>;
}
