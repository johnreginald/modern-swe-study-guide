import type { Metadata } from "next";
import { getGuide } from "@/lib/guide";
import { Blocks, JumpChips } from "@/components/Blocks";

export const metadata: Metadata = { title: "Suggested capstone" };

export default function CapstonePage() {
  const { capstone } = getGuide();
  return (
    <>
      <header className="page-head">
        <div className="eyebrow">After Week 10</div>
        <h1>{capstone.title}</h1>
      </header>
      <JumpChips blocks={capstone.blocks} />
      <Blocks blocks={capstone.blocks} />
    </>
  );
}
