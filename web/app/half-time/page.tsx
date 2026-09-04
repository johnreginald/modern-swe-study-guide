import type { Metadata } from "next";
import SectionPage from "@/components/pages/SectionPage";

export const metadata: Metadata = { title: "If you only have half the time" };

export default function Page() {
  return <SectionPage lang="en" which="halfTime" />;
}
