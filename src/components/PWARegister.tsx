"use client";

import { useEffect } from "react";

// مكوّن لتسجيل Service Worker تلقائياً
// يضاف لـ root layout
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        if (reg.installing) {
          // installing
        } else if (reg.waiting) {
          // waiting
        } else if (reg.active) {
          // active
        }
      } catch (err) {
        // فشل التسجيل — تجاهل بهدوء
        console.warn("SW registration failed", err);
      }
    };

    register();
  }, []);

  return null;
}
