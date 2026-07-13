import { redirect } from "next/navigation";

// The old /school-admin page was a hardcoded mockup (fake students, static
// charts) — audit M5. Schools now get the REAL org dashboard, same as
// universities: claim/redeem an org account (org_type='school') and manage the
// school profile, messages, events and announcements from /org/dashboard.
export default function SchoolAdminRedirect() {
  redirect("/org/dashboard");
}
