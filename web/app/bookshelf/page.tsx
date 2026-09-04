import type { Metadata } from "next";
import SectionPage from "@/components/pages/SectionPage";

export const metadata: Metadata = { title: "The short bookshelf" };

export default function Page() {
  return <SectionPage lang="en" which="bookshelf" />;
}
