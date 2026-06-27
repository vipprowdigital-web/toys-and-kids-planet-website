import { Outlet } from "react-router-dom";
import { VendorProtectedRoute } from "~/components/VendorProtectedRoute";

export default function VendorProtectedLayout() {
  return (
    <VendorProtectedRoute>
      <Outlet />
    </VendorProtectedRoute>
  );
}
