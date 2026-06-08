// import { PublicRoute } from "~/routes/PublicRoute";
import { PublicRoute } from "~/components/PublicRoute";
import SigninPage from "~/signin/page";

export default function SignInWrapper() {
  return (
    <PublicRoute>
      <SigninPage />
    </PublicRoute>
  );
}
