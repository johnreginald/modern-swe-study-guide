import type { Metadata } from "next";
import { getGuide } from "@/lib/guide";

export const metadata: Metadata = { title: "The short bookshelf" };

export default function BookshelfPage() {
  const { bookshelf } = getGuide();
  return (
    <>
      <header className="page-head">
        <h1>{bookshelf.title}</h1>
      </header>
      <article className="prose" dangerouslySetInnerHTML={{ __html: bookshelf.html }} />
    </>
  );
}
