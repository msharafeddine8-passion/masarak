'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { UNIVERSITIES } from '@/app/universities/data';

// Lebanese university coordinates (approx; refined from public Google Maps).
const UNI_COORDS: Record<number, [number, number]> = {
  1:  [33.9003, 35.4777], // AUB
  2:  [33.8938, 35.4915], // LAU
  3:  [33.8892, 35.5043], // USJ
  4:  [33.8736, 35.5442], // UL
  5:  [33.9817, 35.6111], // USEK
  6:  [34.3702, 35.6803], // UOB - Balamand
  7:  [34.0167, 35.7167], // NDU - Louaize
  8:  [33.8889, 35.5103], // ESA
  9:  [33.8333, 35.6000], // UA
  10: [33.8900, 35.5200], // LIU
  11: [33.8775, 35.5108], // HU - Haigazian
  12: [33.8867, 35.5167], // ALBA - Sin El Fil
  13: [34.4361, 35.8497], // UJ - Tripoli
  14: [33.8542, 35.4839], // IAU
  15: [34.0117, 35.6450], // LGU
  16: [34.4361, 35.8500], // EIU - Tripoli
  17: [33.8633, 35.5111], // UC - Beirut suburb
  18: [33.4500, 35.4000], // UIL - South
  19: [34.4350, 35.8487], // UT - Tripoli
};

export default function UniversitiesMapPage() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for Leaflet to load from CDN
    const init = setInterval(() => {
      // @ts-expect-error Leaflet attaches to window
      if (typeof window === 'undefined' || !window.L || !mapRef.current) return;
      clearInterval(init);
      // @ts-expect-error
      const L = window.L;
      if (mapRef.current.dataset.initialized === '1') return;
      mapRef.current.dataset.initialized = '1';

      const map = L.map(mapRef.current).setView([33.85, 35.65], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      UNIVERSITIES.forEach((u) => {
        const c = UNI_COORDS[u.id];
        if (!c) return;
        const m = L.marker(c).addTo(map);
        const popup = `
          <div style="direction:rtl;min-width:200px;font-family:system-ui">
            <strong style="font-size:14px;color:#012730">${u.name}</strong>
            <div style="font-size:11px;color:#666;margin:4px 0">${u.short} · ${u.region}</div>
            <div style="font-size:12px;color:#1b3a6b">رسوم: $${u.tuitionMin.toLocaleString()} – $${u.tuitionMax.toLocaleString()} سنوياً</div>
            <a href="/universities/${u.id}" style="display:inline-block;margin-top:8px;background:#1b3a6b;color:white;padding:4px 10px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:700">صفحة الجامعة ←</a>
          </div>
        `;
        m.bindPopup(popup);
      });
    }, 200);

    return () => clearInterval(init);
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <Script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" strategy="afterInteractive" />

      <main className="min-h-screen bg-bg" dir="rtl">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <nav aria-label="مسار التنقل" className="text-sm text-ink-muted mb-4">
            <Link href="/" className="hover:text-primary">الرئيسية</Link>
            <span className="mx-2">←</span>
            <Link href="/universities" className="hover:text-primary">الجامعات</Link>
            <span className="mx-2">←</span>
            <span className="text-ink font-semibold">الخريطة</span>
          </nav>

          <header className="mb-6">
            <div className="text-5xl mb-3">🗺️</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-2">
              خريطة الجامعات اللبنانية
            </h1>
            <p className="text-ink-muted">
              ٢٣ جامعة على الخريطة. اضغط على أي علامة لتشوف الرسوم وتفتح صفحة الجامعة.
            </p>
          </header>

          <div
            ref={mapRef}
            className="w-full rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden"
            style={{ height: '600px' }}
          />

          <div className="mt-6 grid sm:grid-cols-3 gap-3">
            <div className="bg-mint-pale rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-primary">23</div>
              <div className="text-xs text-ink-muted">جامعة على الخريطة</div>
            </div>
            <div className="bg-mint-pale rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-primary">8</div>
              <div className="text-xs text-ink-muted">مناطق لبنانية</div>
            </div>
            <div className="bg-mint-pale rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold text-primary">$200 – $22,000</div>
              <div className="text-xs text-ink-muted">نطاق الرسوم السنوية</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
