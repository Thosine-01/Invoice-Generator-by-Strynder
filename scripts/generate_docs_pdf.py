#!/usr/bin/env python3
"""Generate all project documentation PDFs."""

import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent

for script in ("generate_prd_pdf.py", "generate_tech_spec_pdf.py"):
    result = subprocess.run([sys.executable, str(SCRIPTS_DIR / script)], check=False)
    if result.returncode != 0:
        raise SystemExit(result.returncode)

print("All documentation PDFs generated.")
