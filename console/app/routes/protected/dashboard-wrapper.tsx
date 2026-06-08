// app/routes/protected/dashboard-wrapper.tsx

import AdminLayout from "~/admin/layout";
import { ProtectedRoute } from "~/components/ProtectedRoute";
import DashboardPage from "~/dashboard/page";

export default function DashboardWrapper() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
