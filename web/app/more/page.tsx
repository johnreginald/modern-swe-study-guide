import type { Metadata } from "next";
import MorePage from "@/components/pages/MorePage";
import { hasBurmese } from "@/lib/i18n";

export const metadata: Metadata = { title: "More" };

export default function Page() {
  return <MorePage lang="en" burmeseAvailable={hasBurmese()} />;
}
