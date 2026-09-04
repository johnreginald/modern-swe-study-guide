import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MorePage from "@/components/pages/MorePage";
import { hasBurmese, t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  return hasBurmese() ? { title: t("my", "more.title") } : {};
}

export default function Page() {
  if (!hasBurmese()) notFound();
  return <MorePage lang="my" burmeseAvailable />;
}
