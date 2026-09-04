import type { Block } from "@/lib/guide";

/** Renders parsed content blocks: a heading (with optional time chip) plus its cards/prose. */
export function Blocks({ blocks, level = 2 }: { blocks: Block[]; level?: 2 | 3 }) {
  return (
    <>
      {blocks.map((b) => (
        <section key={b.id} id={b.id} className="block">
          {b.title ? (
            level === 2 ? (
              <h2 className="block-title">
                {b.title}
                {b.time ? <span className="chip">{b.time}</span> : null}
              </h2>
            ) : (
              <h3 className="block-title">
                {b.title}
                {b.time ? <span className="chip">{b.time}</span> : null}
              </h3>
            )
          ) : null}
          <div className="prose" dangerouslySetInnerHTML={{ __html: b.html }} />
        </section>
      ))}
    </>
  );
}

/** Horizontal chip row linking to each block on the page. */
export function JumpChips({ blocks, extra }: { blocks: Block[]; extra?: { id: string; title: string }[] }) {
  const items = [...blocks.filter((b) => b.title).map((b) => ({ id: b.id, title: b.title })), ...(extra ?? [])];
  if (items.length < 2) return null;
  return (
    <nav className="toc" aria-label="On this page">
      {items.map((b) => (
        <a key={b.id} href={`#${b.id}`}>
          {b.title}
        </a>
      ))}
    </nav>
  );
}
