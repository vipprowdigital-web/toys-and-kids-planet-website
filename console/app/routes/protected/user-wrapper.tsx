import ProfilePage from "~/admin/users/profile/page";
import { ProtectedRoute } from "~/components/ProtectedRoute";

export default function UserWrapper() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}
