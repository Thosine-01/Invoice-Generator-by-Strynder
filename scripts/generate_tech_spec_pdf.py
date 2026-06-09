#!/usr/bin/env python3
"""Generate TECH-SPEC.pdf from TECH-SPEC.md."""

from pathlib import Path

from md_to_pdf import generate_pdf

ROOT = Path(__file__).resolve().parent.parent

if __name__ == "__main__":
    generate_pdf(
        ROOT / "TECH-SPEC.md",
        ROOT / "TECH-SPEC.pdf",
        footer_label="Invoice Generator by Strynder — Technical Specification",
        doc_title="Invoice Generator by Strynder — Technical Specification",
    )
    print(f"Generated {ROOT / 'TECH-SPEC.pdf'}")
