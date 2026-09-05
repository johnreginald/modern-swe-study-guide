import type { Metadata } from "next";
import PrintPage from "@/components/pages/PrintPage";

export const metadata: Metadata = { title: "Print", robots: { index: false, follow: false } };

export default function Page() {
  return <PrintPage lang="en" />;
}
