import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePage from "@/components/pages/HomePage";
import { hasBurmese, t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  return hasBurmese() ? { title: { absolute: t("my", "site.name") }, description: t("my", "site.description") } : {};
}

export default function Page() {
  if (!hasBurmese()) notFound();
  return <HomePage lang="my" burmeseAvailable />;
}
