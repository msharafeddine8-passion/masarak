// src/lib/notify.ts
// Lightweight toast + confirm replacement for native alert()/confirm().
// Zero dependencies. Renders into <body> via plain DOM (no React state),
// so it works from any code path — including non-React event handlers.
//
// API:
//   toast("تم الحفظ", "ok")
//   toast("فشل: ...", "warn")
//   const ok = await confirmAction("هل أنت متأكد من الحذف؟");
//
// In RTL Arabic-first contexts. Animates from the top-center.

type Tone = "ok" | "warn" | "info";

const TONE: Record<Tone, { bg: string; fg: string; border: string; icon: string }> = {
  ok:   { bg: "#dcfce7", fg: "#065f46", border: "#86efac", icon: "✓" },
  warn: { bg: "#fee2e2", fg: "#7f1d1d", border: "#fca5a5", icon: "⚠" },
  info: { bg: "#e0f2fe", fg: "#075985", border: "#7dd3fc", icon: "ℹ" },
};

let toastContainer: HTMLDivElement | null = null;

function ensureContainer(): HTMLDivElement {
  if (typeof document === "undefined") {
    throw new Error("notify: only callable from the browser");
  }
  if (toastContainer && document.body.contains(toastContainer)) return toastContainer;
  const el = document.createElement("div");
  el.id = "masarak-toast-host";
  el.style.cssText =
    "position:fixed;top:1rem;left:50%;transform:translateX(-50%);z-index:9999;" +
    "display:flex;flex-direction:column;gap:.5rem;pointer-events:none;" +
    "font-family:Tajawal,system-ui,sans-serif;direction:rtl";
  document.body.appendChild(el);
  toastContainer = el;
  return el;
}

/** Show a transient toast. Auto-dismisses after `durationMs` (default 4000). */
export function toast(message: string, tone: Tone = "info", durationMs = 4000): void {
  if (typeof window === "undefined") return;
  const t = TONE[tone];
  const host = ensureContainer();
  const el = document.createElement("div");
  el.role = "status";
  el.style.cssText =
    `background:${t.bg};color:${t.fg};border:1px solid ${t.border};` +
    "padding:.75rem 1.25rem;border-radius:.75rem;font-size:.95rem;font-weight:700;" +
    "box-shadow:0 4px 14px rgba(0,0,0,.1);max-width:90vw;pointer-events:auto;" +
    "display:flex;align-items:center;gap:.5rem;animation:masarak-toast-in .25s ease-out";
  el.innerHTML = `<span aria-hidden="true">${t.icon}</span><span>${escapeHtml(message)}</span>`;

  // Inject the @keyframes once (idempotent)
  if (!document.getElementById("masarak-toast-anim")) {
    const style = document.createElement("style");
    style.id = "masarak-toast-anim";
    style.textContent = `
      @keyframes masarak-toast-in { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      @keyframes masarak-toast-out { to { opacity:0; transform:translateY(-10px); } }
    `;
    document.head.appendChild(style);
  }

  host.appendChild(el);
  setTimeout(() => {
    el.style.animation = "masarak-toast-out .25s ease-in forwards";
    setTimeout(() => el.remove(), 260);
  }, durationMs);
}

/** Promise-based confirm. Returns true on confirm, false on cancel. */
export function confirmAction(
  message: string,
  opts: { confirmLabel?: string; cancelLabel?: string; danger?: boolean } = {}
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(false);
      return;
    }
    const { confirmLabel = "تأكيد", cancelLabel = "إلغاء", danger = false } = opts;

    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.5);" +
      "display:flex;align-items:center;justify-content:center;padding:1rem;" +
      "font-family:Tajawal,system-ui,sans-serif;direction:rtl;animation:masarak-toast-in .15s ease-out";

    const card = document.createElement("div");
    card.style.cssText =
      "background:white;border-radius:1rem;padding:1.5rem;max-width:24rem;width:100%;" +
      "box-shadow:0 20px 50px rgba(0,0,0,.3)";

    const confirmBg = danger ? "#dc2626" : "#012730";

    card.innerHTML = `
      <div style="font-size:1.05rem;font-weight:800;color:#0f172a;margin-bottom:.5rem">${danger ? "⚠ " : ""}تأكيد</div>
      <div style="font-size:.95rem;color:#475569;line-height:1.6;margin-bottom:1.25rem">${escapeHtml(message)}</div>
      <div style="display:flex;gap:.5rem;justify-content:flex-start">
        <button data-act="confirm" style="background:${confirmBg};color:white;border:none;border-radius:.6rem;padding:.6rem 1.25rem;font-weight:700;font-size:.9rem;cursor:pointer">${escapeHtml(confirmLabel)}</button>
        <button data-act="cancel" style="background:#f1f5f9;color:#475569;border:none;border-radius:.6rem;padding:.6rem 1.25rem;font-weight:700;font-size:.9rem;cursor:pointer">${escapeHtml(cancelLabel)}</button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    function cleanup(answer: boolean) {
      overlay.remove();
      window.removeEventListener("keydown", onKey);
      resolve(answer);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") cleanup(false);
      if (e.key === "Enter") cleanup(true);
    }
    window.addEventListener("keydown", onKey);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cleanup(false);
    });
    card.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-act]");
      if (!btn) return;
      cleanup(btn.dataset.act === "confirm");
    });
  });
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
