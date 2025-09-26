# Digital Market Space - Backend

## Quick steps
1. Copy `.env.example` -> `.env` and fill values.
2. Run `npm install`.
3. Execute `schema.sql` in your Postgres (Supabase) instance.
4. Seed admin user (see below).
5. `npm run dev` to run locally.
6. Deploy to Vercel; set env vars in Vercel Project Settings.

## Create admin (example)
Generate bcrypt hash:
