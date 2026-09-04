import type { Metadata } from "next";
import { getGuide } from "@/lib/guide";
import { Blocks } from "@/components/Blocks";

export const metadata: Metadata = { title: "If you only have half the time" };

export default function HalfTimePage() {
  const { halfTime } = getGuide();
  return (
    <>
      <header className="page-head">
        <h1>{halfTime.title}</h1>
      </header>
      <Blocks blocks={halfTime.blocks} />
    </>
  );
}
