import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PrintPage from "@/components/pages/PrintPage";
import { hasBurmese } from "@/lib/i18n";

export const metadata: Metadata = { title: "Print", robots: { index: false, follow: false } };

export default function Page() {
  if (!hasBurmese()) notFound();
  return <PrintPage lang="my" />;
}
