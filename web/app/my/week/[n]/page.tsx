import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuide, getWeek } from "@/lib/guide";
import { hasBurmese, t } from "@/lib/i18n";
import WeekPage from "@/components/pages/WeekPage";

export function generateStaticParams() {
  return hasBurmese() ? getGuide("my").weeks.map((w) => ({ n: String(w.n) })) : [];
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/my/week/[n]">): Promise<Metadata> {
  if (!hasBurmese()) return {};
  const { n } = await params;
  const week = getWeek(Number(n), "my");
  if (!week) return {};
  return { title: `${t("my", "week.label", { n: week.n })} — ${week.title}`, description: week.focus.replace(/<[^>]+>/g, "") };
}

export default async function Page({ params }: PageProps<"/my/week/[n]">) {
  if (!hasBurmese()) notFound();
  const { n } = await params;
  return <WeekPage lang="my" n={Number(n)} />;
}
