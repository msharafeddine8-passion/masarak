// Consolidated (audit IA3): duplicate interview-prep tool. The canonical tool —
// referenced by the nav, footer, sitemap and tools hub — is /tools/interview-prep.
// The previous implementation remains in git history if ever needed.
import { redirect } from "next/navigation";

export default function InterviewRedirect() {
  redirect("/tools/interview-prep");
}
