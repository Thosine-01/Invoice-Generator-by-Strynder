# Invoice Generator by Strynder

Professional invoice generator for Nigerian SMBs, creatives, and freelancers.

## Features

- Supabase Auth (register, login, password reset)
- Business profile with logo (Supabase Storage), contact details, slogan
- Separate payment details (bank name, account number, etc.)
- Invoice creation with line items, optional VAT (7.5%), NGN/USD/GBP
- 8 customizable header colors
- Live preview and PDF download
- Invoice list, view, duplicate, and delete

## Tech Stack

- **Next.js 15** (App Router)
- **Supabase** (Auth, PostgreSQL, Storage)
- **Tailwind CSS 4**
- **@react-pdf/renderer** for PDF export

## Documentation

| Document | Markdown | PDF |
|----------|----------|-----|
| Product Requirements | [PRD.md](PRD.md) | [PRD.pdf](PRD.pdf) |
| Technical Specification | [TECH-SPEC.md](TECH-SPEC.md) | [TECH-SPEC.pdf](TECH-SPEC.pdf) |
| Decisions | [DECISIONS.md](DECISIONS.md) | — |

## Getting Started

### 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in [supabase/migrations/20250609000000_initial_schema.sql](supabase/migrations/20250609000000_initial_schema.sql) via the SQL Editor
3. Copy your project URL and keys

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run start` — Production server
- `python3 scripts/generate_docs_pdf.py` — Regenerate PRD/Tech Spec PDFs
