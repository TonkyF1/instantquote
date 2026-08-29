# InstantQuote

Professional estimates and invoices for sole traders. Sixty seconds on a phone. UK defaults: pounds, VAT, sort code.

Create an account with email and password. Quotes save on the device and in the account. Print or Save as PDF.

## What you get

- Live A4 preview while you type
- Bathroom, cleaning, tutoring templates (free)
- Platinum trades pack: plumbing call-out, electrical, decorating, roofing, landscaping, boiler, handyman, wedding, catering, consulting, bridal
- Client book, rate card, convert estimate → invoice
- Bank transfer, PayPal, Stripe, cash on completion

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (port 8080).

```bash
npm run build
```

Auth is email/password (Better Auth). Set a Postgres `DATABASE_URL` in production. Preview uses embedded PGLite.

New accounts get a 14-day Platinum trial.

## Stack

TanStack Start, React, Tailwind, Zustand, Better Auth.

This is a document generator, not legal or tax advice.
