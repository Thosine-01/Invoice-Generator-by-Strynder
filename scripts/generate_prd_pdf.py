#!/usr/bin/env python3
"""Generate PRD.pdf from PRD.md."""

from pathlib import Path

from md_to_pdf import generate_pdf

ROOT = Path(__file__).resolve().parent.parent

if __name__ == "__main__":
    generate_pdf(
        ROOT / "PRD.md",
        ROOT / "PRD.pdf",
        footer_label="Invoice Generator by Strynder — PRD",
        doc_title="Invoice Generator by Strynder — PRD",
    )
    print(f"Generated {ROOT / 'PRD.pdf'}")
