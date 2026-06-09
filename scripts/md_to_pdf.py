#!/usr/bin/env python3
"""Shared markdown-to-PDF generator using ReportLab."""

from __future__ import annotations

import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN = 2 * cm


def parse_table(lines: list[str]) -> tuple[list[list[str]], int]:
    rows: list[list[str]] = []
    i = 0
    while i < len(lines) and lines[i].strip().startswith("|"):
        row = [cell.strip() for cell in lines[i].strip().strip("|").split("|")]
        if not all(set(cell) <= {"-", ":"} for cell in row):
            rows.append(row)
        i += 1
    return rows, i


def build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "DocTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            spaceAfter=14,
            textColor=colors.HexColor("#065f46"),
        ),
        "h2": ParagraphStyle(
            "DocH2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            spaceBefore=16,
            spaceAfter=8,
            textColor=colors.HexColor("#111827"),
        ),
        "h3": ParagraphStyle(
            "DocH3",
            parent=base["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=11,
            spaceBefore=10,
            spaceAfter=6,
            textColor=colors.HexColor("#374151"),
        ),
        "body": ParagraphStyle(
            "DocBody",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "DocBullet",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            leftIndent=14,
            bulletIndent=6,
            spaceAfter=4,
        ),
        "code": ParagraphStyle(
            "DocCode",
            parent=base["Code"],
            fontName="Courier",
            fontSize=8,
            leading=10,
            backColor=colors.HexColor("#f3f4f6"),
            leftIndent=8,
            rightIndent=8,
            spaceBefore=6,
            spaceAfter=6,
        ),
    }


def md_inline(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = text.replace("&", "&amp;").replace("<b>", "\0").replace("</b>", "\1")
    text = text.replace("<", "&lt;").replace(">", "&gt;")
    text = text.replace("\0", "<b>").replace("\1", "</b>")
    return text


def table_flowable(rows: list[list[str]], styles) -> Table:
    data = [[Paragraph(md_inline(cell), styles["body"]) for cell in row] for row in rows]
    col_count = max(len(r) for r in rows)
    col_width = (PAGE_WIDTH - 2 * MARGIN) / col_count
    table = Table(data, colWidths=[col_width] * col_count, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#ecfdf5")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#065f46")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def parse_markdown(content: str, styles) -> list:
    flowables = []
    lines = content.splitlines()
    i = 0
    in_code = False
    code_buffer: list[str] = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            if in_code:
                flowables.append(Preformatted("\n".join(code_buffer), styles["code"]))
                code_buffer = []
                in_code = False
            else:
                in_code = True
            i += 1
            continue

        if in_code:
            code_buffer.append(line)
            i += 1
            continue

        if stripped == "---":
            flowables.append(Spacer(1, 6))
            flowables.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e5e7eb")))
            flowables.append(Spacer(1, 6))
            i += 1
            continue

        if stripped.startswith("# "):
            flowables.append(Paragraph(md_inline(stripped[2:]), styles["title"]))
            i += 1
            continue

        if stripped.startswith("## "):
            flowables.append(Paragraph(md_inline(stripped[3:]), styles["h2"]))
            i += 1
            continue

        if stripped.startswith("### "):
            flowables.append(Paragraph(md_inline(stripped[4:]), styles["h3"]))
            i += 1
            continue

        if stripped.startswith("|"):
            rows, next_i = parse_table(lines[i:])
            if rows:
                flowables.append(Spacer(1, 4))
                flowables.append(table_flowable(rows, styles))
                flowables.append(Spacer(1, 8))
            i = i + (next_i if next_i else 1)
            continue

        if stripped.startswith("- "):
            flowables.append(Paragraph(f"• {md_inline(stripped[2:])}", styles["bullet"]))
            i += 1
            continue

        if re.match(r"^\d+\.\s", stripped):
            flowables.append(Paragraph(md_inline(stripped), styles["bullet"]))
            i += 1
            continue

        if stripped.startswith("- [ ]"):
            flowables.append(Paragraph(f"☐ {md_inline(stripped[5:].strip())}", styles["bullet"]))
            i += 1
            continue

        if stripped:
            flowables.append(Paragraph(md_inline(stripped), styles["body"]))

        i += 1

    return flowables


def generate_pdf(
    md_path: Path,
    pdf_path: Path,
    *,
    footer_label: str,
    doc_title: str,
) -> None:
    if not md_path.exists():
        raise FileNotFoundError(f"Missing {md_path}")

    content = md_path.read_text(encoding="utf-8")
    styles = build_styles()
    flowables = parse_markdown(content, styles)

    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#6b7280"))
        canvas.drawString(MARGIN, 1.2 * cm, footer_label)
        canvas.drawRightString(PAGE_WIDTH - MARGIN, 1.2 * cm, f"Page {doc.page}")
        canvas.restoreState()

    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title=doc_title,
        author="Strynder",
    )
    doc.build(flowables, onFirstPage=add_page_number, onLaterPages=add_page_number)
