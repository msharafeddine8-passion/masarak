import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "تواصل معنا — مسارك",
  description:
    "عندك سؤال، اقتراح، أو بدك تتواصل مع فريق مسارك؟ ابعتلنا رسالة وبنرد عليك بسرعة. support@masaraklb.com",
  path: "/contact",
  keywords: ["تواصل مسارك", "دعم مسارك", "اتصل بنا"],
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
