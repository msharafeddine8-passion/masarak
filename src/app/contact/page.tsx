// src/app/contact/page.tsx
// Server component — preserves SEO metadata. Visual + interactive content
// lives in ContactClient.tsx.

import { buildMetadata } from "@/lib/seo";
import ContactClient from "./ContactClient";

export const metadata = buildMetadata({
  title: "تواصل معنا — Contact",
  description: "تواصل مع فريق مسارك. أسئلة، اقتراحات، شراكات، وتعاون.",
  path: "/contact",
});

export default function ContactPage() {
  return <ContactClient />;
}
