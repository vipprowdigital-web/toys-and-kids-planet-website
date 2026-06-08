import { PublicRoute } from "~/components/PublicRoute";
import SignupPage from "~/signup/page";

export default function SignUpWrapper() {
  return (
    <PublicRoute>
      <SignupPage />
    </PublicRoute>
  );
}
