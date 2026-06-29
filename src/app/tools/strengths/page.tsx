// Consolidated (audit IA3): this was a duplicate strengths/RIASEC assessment with
// no inbound links. The canonical, nav-linked tool is /tools/skill-strengths.
// The previous implementation remains in git history if ever needed.
import { redirect } from "next/navigation";

export default function StrengthsRedirect() {
  redirect("/tools/skill-strengths");
}
