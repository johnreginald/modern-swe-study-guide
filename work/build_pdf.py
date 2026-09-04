from __future__ import annotations

import html
import hashlib
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


NAVY = colors.HexColor("#132238")
TEAL = colors.HexColor("#157A7A")
TEAL_LIGHT = colors.HexColor("#E7F4F2")
INK = colors.HexColor("#243142")
MUTED = colors.HexColor("#657181")
LINE = colors.HexColor("#D9E1E8")
AMBER = colors.HexColor("#F4B942")
PAPER = colors.HexColor("#FAFBFC")
WHITE = colors.white


def register_fonts() -> None:
    font_dir = Path("/System/Library/Fonts/Supplemental")
    pdfmetrics.registerFont(TTFont("GuideSans", str(font_dir / "Arial.ttf")))
    pdfmetrics.registerFont(TTFont("GuideSans-Bold", str(font_dir / "Arial Bold.ttf")))
    pdfmetrics.registerFont(TTFont("GuideSans-Italic", str(font_dir / "Arial Italic.ttf")))
    pdfmetrics.registerFont(TTFont("GuideMono", "/System/Library/Fonts/SFNSMono.ttf"))


def ascii_dashes(text: str) -> str:
    return (
        text.replace("‑", "-")
        .replace("→", " -> ")
    )


def inline_markup(text: str) -> str:
    text = ascii_dashes(text)
    placeholders: list[str] = []

    def stash(value: str) -> str:
        placeholders.append(value)
        return f"@@PH{len(placeholders) - 1}@@"

    def link_sub(match: re.Match[str]) -> str:
        label = html.escape(match.group(1), quote=False)
        url = html.escape(match.group(2), quote=True)
        return stash(f'<link href="{url}" color="#0B6666"><u>{label}</u></link>')

    def code_sub(match: re.Match[str]) -> str:
        code = html.escape(match.group(1), quote=False)
        return stash(f'<font name="GuideMono" backColor="#EEF2F5"> {code} </font>')

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link_sub, text)
    text = re.sub(r"`([^`]+)`", code_sub, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", text)
    for idx, value in enumerate(placeholders):
        text = text.replace(f"@@PH{idx}@@", value)
    return text


class GuideDocTemplate(BaseDocTemplate):
    def __init__(self, filename: str, **kwargs):
        super().__init__(filename, **kwargs)
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and flowable.style.name == "H2":
            text = flowable.getPlainText()
            key = "section-" + hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(text, key, level=0, closed=False)
            self.notify("TOCEntry", (0, text, self.page, key))


def cover_page(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)

    canvas.setFillColor(TEAL)
    canvas.rect(0, height - 12 * mm, width, 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(AMBER)
    canvas.rect(0, 0, 24 * mm, 7 * mm, fill=1, stroke=0)

    canvas.setFillColor(TEAL_LIGHT)
    canvas.roundRect(24 * mm, height - 58 * mm, 50 * mm, 10 * mm, 5 * mm, fill=1, stroke=0)
    canvas.setFont("GuideSans-Bold", 9)
    canvas.setFillColor(TEAL)
    canvas.drawCentredString(49 * mm, height - 54.4 * mm, "2026 EDITION")

    canvas.setFillColor(WHITE)
    canvas.setFont("GuideSans-Bold", 28)
    canvas.drawString(24 * mm, height - 84 * mm, "Agent Engineer")
    canvas.setFont("GuideSans-Bold", 21)
    canvas.drawString(24 * mm, height - 101 * mm, "Study Guide 2026")

    canvas.setStrokeColor(colors.HexColor("#416078"))
    canvas.setLineWidth(1)
    canvas.line(24 * mm, height - 114 * mm, width - 24 * mm, height - 114 * mm)

    canvas.setFillColor(colors.HexColor("#C8D9E5"))
    canvas.setFont("GuideSans", 13)
    canvas.drawString(24 * mm, height - 128 * mm, "A curated, project-based ten-week guide to building with coding agents")
    canvas.setFont("GuideSans", 10)
    canvas.drawString(24 * mm, height - 139 * mm, "Videos, courses, articles, books, weekly builds, and a capstone")

    # A compact visual path through the ten-week progression.
    labels = ["Agent", "Context", "Skills", "Repo", "Harness", "Review", "Secure", "Async", "Team", "Factory"]
    x0 = 24 * mm
    y = 54 * mm
    usable = width - 48 * mm
    step = usable / 9
    canvas.setStrokeColor(colors.HexColor("#416078"))
    canvas.setLineWidth(2)
    canvas.line(x0, y, x0 + usable, y)
    for i, label in enumerate(labels):
        x = x0 + i * step
        canvas.setFillColor(AMBER if i in (0, 9) else TEAL)
        canvas.circle(x, y, 2.5 * mm, fill=1, stroke=0)
        canvas.setFillColor(colors.HexColor("#C8D9E5"))
        canvas.setFont("GuideSans", 6.5)
        canvas.drawCentredString(x, y - 8 * mm, label)

    canvas.setFillColor(colors.HexColor("#8FAABD"))
    canvas.setFont("GuideSans", 8.5)
    canvas.drawRightString(width - 24 * mm, 17 * mm, "Updated September 4, 2026")
    canvas.restoreState()


def body_page(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(PAPER)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 8 * mm, width, 8 * mm, fill=1, stroke=0)
    canvas.setFont("GuideSans-Bold", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(19 * mm, height - 15 * mm, "AGENT ENGINEER STUDY GUIDE 2026")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.6)
    canvas.line(19 * mm, 15 * mm, width - 19 * mm, 15 * mm)
    canvas.setFont("GuideSans", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(19 * mm, 9.5 * mm, "Independent guide - structure follows the Stanford CS146S Fall 2026 syllabus")
    canvas.drawRightString(width - 19 * mm, 9.5 * mm, str(doc.page))
    canvas.restoreState()


def make_styles():
    base = getSampleStyleSheet()
    return {
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="GuideSans",
            fontSize=9.4,
            leading=14.2,
            textColor=INK,
            spaceAfter=6,
            splitLongWords=False,
        ),
        "lead": ParagraphStyle(
            "Lead",
            parent=base["BodyText"],
            fontName="GuideSans",
            fontSize=11,
            leading=16.5,
            textColor=INK,
            spaceAfter=10,
            borderColor=TEAL,
            borderWidth=0,
            borderPadding=(0, 0, 0, 10),
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Heading1"],
            fontName="GuideSans-Bold",
            fontSize=20,
            leading=24,
            textColor=NAVY,
            spaceBefore=2,
            spaceAfter=12,
            keepWithNext=True,
        ),
        "h3": ParagraphStyle(
            "H3",
            parent=base["Heading2"],
            fontName="GuideSans-Bold",
            fontSize=12,
            leading=15,
            textColor=TEAL,
            spaceBefore=10,
            spaceAfter=5,
            keepWithNext=True,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["BodyText"],
            fontName="GuideSans",
            fontSize=9.2,
            leading=13.8,
            textColor=INK,
            leftIndent=15,
            firstLineIndent=-8,
            bulletIndent=3,
            spaceAfter=4,
        ),
        "number": ParagraphStyle(
            "Number",
            parent=base["BodyText"],
            fontName="GuideSans",
            fontSize=9.2,
            leading=13.8,
            textColor=INK,
            leftIndent=18,
            firstLineIndent=-12,
            spaceAfter=5,
        ),
        "toc_title": ParagraphStyle(
            "TOCTitle",
            parent=base["Heading1"],
            fontName="GuideSans-Bold",
            fontSize=22,
            leading=26,
            textColor=NAVY,
            spaceAfter=14,
        ),
        "toc": ParagraphStyle(
            "TOCEntry",
            parent=base["Normal"],
            fontName="GuideSans",
            fontSize=10,
            leading=18,
            textColor=INK,
            leftIndent=0,
            firstLineIndent=0,
        ),
        "code": ParagraphStyle(
            "Code",
            parent=base["BodyText"],
            fontName="GuideMono",
            fontSize=8.2,
            leading=11.5,
            textColor=INK,
            backColor=colors.HexColor("#EEF2F5"),
            borderPadding=(4, 6, 4, 6),
            leftIndent=6,
            spaceBefore=4,
            spaceAfter=10,
        ),
        "cell": ParagraphStyle(
            "Cell",
            parent=base["BodyText"],
            fontName="GuideSans",
            fontSize=8.4,
            leading=11.5,
            textColor=INK,
        ),
        "cell_head": ParagraphStyle(
            "CellHead",
            parent=base["BodyText"],
            fontName="GuideSans-Bold",
            fontSize=8.4,
            leading=11.5,
            textColor=WHITE,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="GuideSans",
            fontSize=8.2,
            leading=12,
            textColor=MUTED,
            spaceAfter=5,
        ),
    }


def parse_markdown(markdown_text: str, styles) -> list:
    lines = markdown_text.splitlines()
    # The H1 and standalone update line are represented on the cover.
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
    while lines and not lines[0].strip():
        lines.pop(0)
    if lines and lines[0].startswith("Updated "):
        lines = lines[1:]

    story: list = []
    paragraph: list[str] = []
    table_rows: list[list[str]] = []
    seen_first_section = False
    keep_group: list | None = None  # collects a "Done when" heading + its bullets

    def flush_group():
        nonlocal keep_group
        if keep_group:
            story.append(KeepTogether(keep_group))
        keep_group = None

    def flush_table():
        nonlocal table_rows
        if not table_rows:
            return
        rows = table_rows
        table_rows = []
        head = [Paragraph(inline_markup(c), styles["cell_head"]) for c in rows[0]]
        body = [[Paragraph(inline_markup(c), styles["cell"]) for c in r] for r in rows[1:]]
        ncols = len(rows[0])
        avail = A4[0] - 38 * mm
        if ncols == 2:
            widths = [avail * 0.34, avail * 0.66]
        elif ncols == 3:
            widths = [avail * 0.09, avail * 0.455, avail * 0.455]
        else:
            widths = [avail / ncols] * ncols
        t = Table([head] + body, colWidths=widths, repeatRows=1, hAlign="LEFT")
        style = [
            ("BACKGROUND", (0, 0), (-1, 0), TEAL),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
            ("TOPPADDING", (0, 0), (-1, -1), 3.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3.5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ]
        for i in range(1, len(body) + 1):
            if i % 2 == 0:
                style.append(("BACKGROUND", (0, i), (-1, i), TEAL_LIGHT))
        t.setStyle(TableStyle(style))
        story.append(t)
        story.append(Spacer(1, 4 * mm))

    def flush_paragraph():
        nonlocal paragraph
        if paragraph:
            content = " ".join(part.strip() for part in paragraph)
            style = styles["lead"] if not seen_first_section else styles["body"]
            story.append(Paragraph(inline_markup(content), style))
            paragraph = []

    for raw in lines:
        line = raw.rstrip()
        stripped = line.strip()
        if stripped.startswith("|"):
            flush_paragraph()
            cells = [c.strip() for c in stripped.strip("|").split("|")]
            if all(re.fullmatch(r":?-{2,}:?", c) for c in cells):
                continue
            table_rows.append(cells)
            continue
        flush_table()
        if not stripped:
            flush_paragraph()
            continue
        if re.fullmatch(r"`[^`]+`", stripped):
            flush_paragraph()
            story.append(Paragraph(html.escape(ascii_dashes(stripped[1:-1]), quote=False), styles["code"]))
            continue
        if stripped == "---":
            flush_paragraph()
            flush_group()
            story.append(Spacer(1, 3 * mm))
            story.append(HRFlowable(width="100%", thickness=0.7, color=LINE, spaceBefore=2, spaceAfter=6))
            continue
        if stripped.startswith("## "):
            flush_paragraph()
            flush_group()
            heading = stripped[3:].strip()
            if heading.startswith("Week ") or heading in {
                "Suggested capstone",
                "The short bookshelf",
                "If you only have half the time",
            }:
                if story:
                    story.append(PageBreak())
            story.append(Paragraph(inline_markup(heading), styles["h2"]))
            rule = HRFlowable(width=34 * mm, thickness=3, color=AMBER, spaceBefore=0, spaceAfter=8, hAlign="LEFT")
            rule.keepWithNext = 1  # keep the heading + rule with the first flowable after them
            story.append(rule)
            seen_first_section = True
            continue
        if stripped.startswith("### "):
            flush_paragraph()
            flush_group()
            h3 = Paragraph(inline_markup(stripped[4:].strip()), styles["h3"])
            if stripped[4:].strip() == "Done when":
                keep_group = [h3]
            else:
                story.append(h3)
            continue
        numbered = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if numbered:
            flush_paragraph()
            story.append(
                Paragraph(
                    inline_markup(numbered.group(2)),
                    styles["number"],
                    bulletText=f"{numbered.group(1)}.",
                )
            )
            continue
        if stripped.startswith("- "):
            flush_paragraph()
            bullet = Paragraph(inline_markup(stripped[2:]), styles["bullet"], bulletText="•")
            if keep_group is not None:
                keep_group.append(bullet)
            else:
                story.append(bullet)
            continue
        paragraph.append(stripped)

    flush_paragraph()
    flush_table()
    flush_group()
    return story


def build(source: Path, destination: Path) -> None:
    register_fonts()
    styles = make_styles()
    page_w, page_h = A4

    doc = GuideDocTemplate(
        str(destination),
        pagesize=A4,
        leftMargin=19 * mm,
        rightMargin=19 * mm,
        topMargin=21 * mm,
        bottomMargin=20 * mm,
        title="Agent Engineer Study Guide 2026",
        author="Agent Engineer Study Guide",
        subject="Ten-week project-based guide to building software with coding agents",
    )

    cover_frame = Frame(0, 0, page_w, page_h, id="cover-frame", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    body_frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="body-frame",
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )
    doc.addPageTemplates(
        [
            PageTemplate(id="cover", frames=[cover_frame], onPage=cover_page),
            PageTemplate(id="body", frames=[body_frame], onPage=body_page),
        ]
    )

    story = [
        Spacer(1, page_h - 1),
        NextPageTemplate("body"),
        PageBreak(),
        Paragraph("Contents", styles["toc_title"]),
    ]
    toc = TableOfContents()
    toc.levelStyles = [styles["toc"]]
    toc.dotsMinLevel = 0
    story.extend([toc, PageBreak()])
    story.extend(parse_markdown(source.read_text(encoding="utf-8"), styles))

    destination.parent.mkdir(parents=True, exist_ok=True)
    doc.multiBuild(story)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: build_pdf.py SOURCE.md DESTINATION.pdf")
    build(Path(sys.argv[1]), Path(sys.argv[2]))
