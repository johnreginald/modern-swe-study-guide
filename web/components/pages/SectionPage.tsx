import { getGuide } from "@/lib/guide";
import { t, type Lang } from "@/lib/i18n";
import { Blocks, JumpChips } from "@/components/Blocks";

type Which = "capstone" | "bookshelf" | "halfTime";

export default function SectionPage({ lang, which }: { lang: Lang; which: Which }) {
  const guide = getGuide(lang);
  const section = guide[which];
  return (
    <div className={lang === "my" ? "lang-my" : undefined}>
      <header className="page-head">
        {which === "capstone" ? <div className="eyebrow">{t(lang, "capstone.eyebrow")}</div> : null}
        <h1>{section.title}</h1>
      </header>
      {which === "capstone" ? <JumpChips blocks={section.blocks} /> : null}
      <Blocks blocks={section.blocks} />
    </div>
  );
}
