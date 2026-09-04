import type { Metadata } from "next";
import { getGuide, getWeek } from "@/lib/guide";
import WeekPage from "@/components/pages/WeekPage";

export function generateStaticParams() {
  return getGuide("en").weeks.map((w) => ({ n: String(w.n) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/week/[n]">): Promise<Metadata> {
  const { n } = await params;
  const week = getWeek(Number(n), "en");
  if (!week) return {};
  return { title: `Week ${week.n} — ${week.title}`, description: week.focus.replace(/<[^>]+>/g, "") };
}

export default async function Page({ params }: PageProps<"/week/[n]">) {
  const { n } = await params;
  return <WeekPage lang="en" n={Number(n)} />;
}
