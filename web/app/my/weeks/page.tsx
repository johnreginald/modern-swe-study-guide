import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WeeksPage from "@/components/pages/WeeksPage";
import { hasBurmese, t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  return hasBurmese() ? { title: t("my", "weeks.title") } : {};
}

export default function Page() {
  if (!hasBurmese()) notFound();
  return <WeeksPage lang="my" />;
}
