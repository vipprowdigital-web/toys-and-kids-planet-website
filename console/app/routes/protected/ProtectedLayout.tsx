import { Outlet } from "react-router";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}
