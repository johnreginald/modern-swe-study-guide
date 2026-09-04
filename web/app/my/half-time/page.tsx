import { notFound } from "next/navigation";
import SectionPage from "@/components/pages/SectionPage";
import { hasBurmese } from "@/lib/i18n";

export default function Page() {
  if (!hasBurmese()) notFound();
  return <SectionPage lang="my" which="halfTime" />;
}
