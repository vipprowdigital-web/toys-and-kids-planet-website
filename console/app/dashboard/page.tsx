import { redirect } from "react-router";

// app/dashboard/page.tsx
export default function DashboardPage() {
  redirect("/blog");
  return null;
}
