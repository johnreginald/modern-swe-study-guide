import type { Metadata } from "next";
import WeeksPage from "@/components/pages/WeeksPage";

export const metadata: Metadata = { title: "Weeks" };

export default function Page() {
  return <WeeksPage lang="en" />;
}
