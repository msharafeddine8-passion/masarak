# =========================================
# push-phase4.ps1 — Phase 4 GitHub Push
# شغّله من PowerShell في مجلد masarak
# =========================================

Write-Host "🔧 Removing git lock..." -ForegroundColor Yellow
Remove-Item -Force ".git\index.lock" -ErrorAction SilentlyContinue
Write-Host "✅ Lock removed" -ForegroundColor Green

Write-Host "📦 Staging all changes..." -ForegroundColor Yellow
git add -A

Write-Host "💾 Committing..." -ForegroundColor Yellow
git commit -m "Phase 4: Student Context + University Comparison + Dashboard 2.0 + Onboarding + Scholarships Eligibility + AI Context + Mobile Nav

- StudentContextProvider: persists CareerDNA, SkillGap, saved items (localStorage + Supabase)
- University Comparison Tool: select up to 3, full comparison table with DNA match %
- Dashboard 2.0: DNA card, skill gap widget, urgent deadlines, progress ring, personalized recs
- Onboarding Wizard: 4-step flow feeds StudentContext automatically
- Scholarships: Eligibility Filter wizard with GPA/major/region matching
- AI Career Assistant: dynamic system prompt with full student profile context
- MobileBottomNav: sticky 5-tab bottom nav for mobile
- layout.tsx: StudentContextProvider + MobileBottomNav wrapping entire app"

Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Done! Check Vercel for the live deploy." -ForegroundColor Green
Write-Host "🔗 https://masarak-khaki.vercel.app" -ForegroundColor Cyan
