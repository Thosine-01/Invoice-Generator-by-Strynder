# Invoice Generator by Strynder — PRD

## 1. Product summary

**Product name:** Invoice Generator by Strynder  
**Platform (v1):** Responsive web app (desktop + mobile browser)  
**Primary market:** Nigeria — small/medium business owners, creatives, freelancers  
**Core value:** Let users create professional invoices in minutes by reusing saved business identity and payment details, with Naira as the default currency.

**v1 delivery:** PDF download only (no email send, no shareable link).

---

## 2. Problem statement

Nigerian SMBs and freelancers often invoice via WhatsApp messages, Word docs, or ad-hoc templates. This is slow, inconsistent, and unprofessional. They need a simple tool that:

- Stores business branding once and reuses it
- Supports NGN-first invoicing with USD/GBP when needed
- Produces clean, downloadable PDFs suitable for clients and record-keeping

---

## 3. Goals and success metrics

| Goal | Metric (v1) |
|------|-------------|
| Fast invoice creation | Median time from "New invoice" to PDF download < 3 minutes |
| Profile reuse | ≥ 80% of invoices use pre-filled business details |
| Adoption | Registered users who create ≥ 1 invoice within 7 days |
| Output quality | PDF renders correctly on mobile and desktop viewers |

**Non-goals (v1):** Payments collection, accounting/ledger, multi-user teams, native mobile apps, client CRM, recurring invoices, e-invoicing compliance automation.

---

## 4. Target users

### Primary personas

1. **Freelancer / creative** — designer, writer, photographer; invoices per project; needs polished PDFs and optional USD/GBP for foreign clients.
2. **SMB owner** — retail, services, agency; invoices regularly; may need VAT line items.
3. **Sole proprietor** — trades, consulting; minimal setup; bank transfer details on invoice.

### User needs

- One-time business profile setup (all fields optional)
- Quick line-item entry with automatic totals
- NGN default; switch currency per invoice
- Branded header with color choice
- PDF export for WhatsApp/email attachment outside the app

---

## 5. User flows

### 5.1 Registration and auth

- Email + password sign-up and login (via Supabase Auth)
- Password reset via email
- Session persists across browser visits

### 5.2 Onboarding (skippable)

After first login, prompt user to complete business profile and payment details. All fields optional; user can skip and complete later from dashboard.

### 5.3 Dashboard

Central hub with:

- **Business profile** — edit identity fields
- **Payment details** — edit bank/payment fields
- **Invoices** — list of past invoices (view + re-download PDF)
- **Create invoice** — primary CTA

### 5.4 Create invoice

1. Business/payment blocks auto-populated from saved profile (editable per invoice without overwriting profile)
2. User enters client details and line items
3. Optional VAT toggle
4. Select header color theme
5. Select currency (default NGN)
6. Preview → Download PDF

---

## 6. Functional requirements

### 6.1 Account and authentication

| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-01 | Users can register with email and password | P0 |
| AUTH-02 | Users can log in and log out | P0 |
| AUTH-03 | Password reset flow | P1 |
| AUTH-04 | One account per email | P0 |

### 6.2 Business profile (dashboard)

All fields **optional**. Saved per user; used as defaults on new invoices.

| Field | Type | Notes |
|-------|------|-------|
| Full name | Text | Personal name |
| Business name | Text | Displayed prominently on invoice if provided |
| Logo | Image upload | PNG/JPG/WebP; max 2MB; stored in Supabase Storage |
| Address | Textarea | Multi-line |
| Phone number | Text | Nigeria format friendly (+234) |
| Email address | Email | Business contact email |
| Business slogan | Text | Short tagline under business name |

| ID | Requirement | Priority |
|----|-------------|----------|
| PROF-01 | CRUD business profile fields | P0 |
| PROF-02 | Logo upload, preview, remove | P1 |
| PROF-03 | Profile data pre-fills new invoices | P0 |
| PROF-04 | Per-invoice overrides do not mutate saved profile | P0 |

### 6.3 Payment details (dashboard)

All fields **optional**.

| Field | Type | Notes |
|-------|------|-------|
| Bank name | Text | e.g. GTBank, Access Bank |
| Account name | Text | Name on account |
| Account number | Text | Numeric/string |
| Additional payment note | Textarea | e.g. "Sort code", PayPal, MoMo instructions |

| ID | Requirement | Priority |
|----|-------------|----------|
| PAY-01 | CRUD payment detail fields | P0 |
| PAY-02 | Payment block shown on invoice only if at least one field filled | P0 |
| PAY-03 | Payment data pre-fills new invoices | P0 |

### 6.4 Invoice creation

#### Invoice metadata

| Field | Required | Notes |
|-------|----------|-------|
| Invoice number | Auto-generated, editable | Format: INV-YYYYMMDD-### or user-defined prefix |
| Date of issue | Yes | Default: today |
| Due date | No | Optional |
| Currency | Yes | Default NGN; options: NGN, USD, GBP |
| Client name | Yes | |
| Client email | No | Stored only; not emailed in v1 |
| Client address | No | |
| Notes / terms | No | Footer text |

#### Line items (tabular)

| Column | Required | Notes |
|--------|----------|-------|
| Order (#) | Auto | Row index, reorderable |
| Description | Yes | Service/product name |
| Quantity | Yes | Numeric, min 1 |
| Unit price | Yes | In selected currency |
| Line total | Computed | qty × unit price |

| ID | Requirement | Priority |
|----|-------------|----------|
| INV-01 | Add, edit, remove line items | P0 |
| INV-02 | Auto-calculate line totals and subtotal | P0 |
| INV-03 | Optional VAT toggle | P0 |
| INV-04 | VAT rate editable when enabled (default 7.5% — Nigeria standard) | P0 |
| INV-05 | Display subtotal, VAT amount (if on), grand total | P0 |
| INV-06 | Currency symbol/format per selection (₦, $, £) | P0 |
| INV-07 | Save invoice draft to account history | P0 |
| INV-08 | Duplicate existing invoice | P2 |

#### VAT behavior

- Off by default
- When on: VAT = subtotal × rate; Grand total = subtotal + VAT
- VAT row labeled clearly on PDF (e.g. "VAT (7.5%)")

### 6.5 Invoice design and branding

| ID | Requirement | Priority |
|----|-------------|----------|
| DES-01 | Professional, clean invoice layout | P0 |
| DES-02 | User selects header color from preset palette (≥ 6 options) | P1 |
| DES-03 | Logo and business name in header when provided | P0 |
| DES-04 | Responsive preview before download | P0 |
| DES-05 | PDF matches on-screen preview (A4 portrait) | P0 |

**Suggested header palette (v1):** Navy, Teal, Emerald, Burgundy, Charcoal, Gold-accent neutral.

### 6.6 PDF export

| ID | Requirement | Priority |
|----|-------------|----------|
| PDF-01 | One-click PDF download from preview | P0 |
| PDF-02 | Filename: {invoice-number}_{client-name}.pdf | P1 |
| PDF-03 | PDF includes all visible invoice sections | P0 |
| PDF-04 | Re-download from invoice history | P0 |

### 6.7 Invoice history

| ID | Requirement | Priority |
|----|-------------|----------|
| HIST-01 | List invoices: number, client, date, total, currency | P0 |
| HIST-02 | View invoice detail | P0 |
| HIST-03 | Re-download PDF | P0 |

---

## 7. Non-functional requirements

| Area | Requirement |
|------|-------------|
| Performance | Invoice preview loads < 2s; PDF generation < 5s |
| Responsiveness | Usable on mobile browsers (320px+) |
| Security | Supabase Auth for sessions; passwords hashed by Supabase; HTTPS; Row Level Security (RLS) on all database tables so users access only their own data |
| Availability | Target 99% uptime post-launch (Vercel + Supabase SLA) |
| Data | User can delete account and associated data |
| Accessibility | Form labels, keyboard nav, sufficient color contrast on themes |

---

## 8. Information architecture

```
/ (marketing landing — optional v1)
/login
/register
/forgot-password
/dashboard
  /profile
  /payment-details
  /invoices
  /invoices/new
  /invoices/:id
  /invoices/:id/preview
```

---

## 9. UI / UX requirements

### Design principles

- Minimal steps to first invoice
- Nigerian context without clutter (NGN default, +234 phone hint, local bank labels)
- Premium feel: generous whitespace, clear typography, restrained color use

### Key screens

1. **Dashboard** — cards for profile completion %, recent invoices, "Create invoice" button
2. **Profile / Payment** — grouped optional fields; empty states with short guidance
3. **Invoice builder** — left: client + dates; center: line-item table; right/sidebar: totals, VAT, currency, theme
4. **Preview** — full invoice mock; sticky "Download PDF" action

### Empty states

- No logo: show business name text only
- No payment details: omit payment section on PDF
- No invoices yet: illustration + CTA to create first invoice

---

## 10. Data model (conceptual)

All `user_id` columns reference `auth.users.id` in Supabase.

**User** — managed by Supabase Auth (`auth.users`: id, email, created_at)

**BusinessProfile** — user_id, full_name, business_name, logo_url, address, phone, email, slogan, default_currency, default_header_color

**PaymentDetails** — user_id, bank_name, account_name, account_number, additional_note

**Invoice** — id, user_id, invoice_number, issue_date, due_date, currency, client_name, client_email, client_address, vat_enabled, vat_rate, header_color, profile_snapshot, payment_details, notes, subtotal, vat_amount, grand_total, status

**LineItem** — id, invoice_id, sort_order, description, quantity, unit_price, line_total

Relationships: User has one BusinessProfile, one PaymentDetails, many Invoices. Invoice has many LineItems.

---

## 11. Technical stack (v1)

| Layer | Decision |
|-------|----------|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS |
| Backend | Next.js Server Actions or Route Handlers |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password, password reset) |
| File storage | Supabase Storage (logo uploads) |
| PDF | `@react-pdf/renderer` (client-side) |
| Hosting | Vercel + Supabase cloud |

---

## 12. Release scope

### MVP (v1.0) — must ship

- Auth (register, login) via Supabase Auth
- Business profile + payment details (all optional)
- Invoice CRUD with line items, VAT toggle, currency (NGN/USD/GBP)
- Header color themes
- Preview + PDF download
- Invoice history + re-download

### v1.1 — fast follow

- Password reset (Supabase built-in)
- Logo upload (Supabase Storage)
- Invoice duplicate
- Profile completion indicator

### v2+ — out of scope

- Email invoice to client
- Shareable public invoice link
- Client directory
- Recurring invoices
- Paystack/Flutterwave payment links
- Multi-user business accounts
- PWA / native apps

---

## 13. Assumptions and dependencies

| Assumption | Notes |
|------------|-------|
| Users export PDF and share via WhatsApp/email manually | Per v1 delivery choice |
| Nigeria VAT default 7.5% | User can override rate when VAT enabled |
| English-only UI | v1 |
| No legal/tax advice | Disclaimer: user responsible for tax compliance |
| Free tier for launch | Monetization TBD |
| Supabase project provisioned before build | Auth, PostgreSQL, Storage configured |
| NDPR compliance | Data region chosen per Supabase project settings |

---

## 14. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| PDF layout breaks with long descriptions | Truncate/wrap rules; test with max content |
| Logo upload abuse | File size/type limits; Supabase Storage policies |
| Currency formatting errors | Use Intl.NumberFormat per currency |
| Low profile completion | Skippable onboarding; show benefits on empty states |
| RLS misconfiguration | Test policies; users cannot read/write other users' rows |

---

## 15. Open questions

- Monetization: free forever vs freemium (invoice limit)?
- Invoice number format: strict auto vs fully custom?
- Additional payment methods in v1.1 (Paystack link field)?
- Terms of service / privacy policy for Nigerian data protection (NDPR)?

---

## 16. Acceptance criteria (v1 done definition)

- User can register, log in, and skip optional profile setup
- User can save business and payment details; fields appear on new invoices automatically
- User can create invoice with line items, optional VAT, and NGN/USD/GBP
- User can pick header color; preview reflects choice
- User can download PDF that matches preview
- User can view history and re-download past invoices
- App works on mobile and desktop browsers
