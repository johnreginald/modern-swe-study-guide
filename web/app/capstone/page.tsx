import type { Metadata } from "next";
import SectionPage from "@/components/pages/SectionPage";

export const metadata: Metadata = { title: "Suggested capstone" };

export default function Page() {
  return <SectionPage lang="en" which="capstone" />;
}
