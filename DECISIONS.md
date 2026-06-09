# PRD Implementation Decisions

Resolved open questions from the PRD for v1.0:

| Topic | Decision |
|-------|----------|
| Monetization | Free at launch; no invoice limits in v1 |
| Invoice numbering | Auto-generated `INV-YYYYMMDD-###`; editable on create |
| Payment details | Separate `payment_details` table with bank name, account name, account number, additional note |
| NDPR | Standard privacy notice on register; account deletion deferred to v1.1; Supabase region chosen for data residency |
| Currency | NGN default; USD and GBP per invoice |
| Header themes | 8 preset colors including Navy, Teal, Emerald, Burgundy, Charcoal, Gold Accent |
| Platform / database | Full Supabase: Auth, PostgreSQL, Storage for logos |
| Data access | Supabase JS client (`@supabase/supabase-js` + `@supabase/ssr`); no Prisma/SQLite |
