import { redirect } from "next/navigation";

// Bare /org → send to the dashboard (which itself routes to /org/claim if no membership).
export default function OrgIndexPage() {
  redirect("/org/dashboard");
}
