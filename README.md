# La Maison Paris — Restaurant Website

A responsive, multi-page restaurant website concept for **La Maison**, a fictional Parisian French dining room. The front end uses plain HTML, CSS and JavaScript; the Vercel API uses the Neon serverless driver.

## Pages

- `index.html` — restaurant overview, signature dishes, guest notes and experience links
- `menu.html` — food and wine menus with category tabs
- `about.html` — restaurant story and culinary philosophy
- `gallery.html` — food, dining room and event gallery with category filters
- `events.html` — chef's table, tasting and special-event information
- `private-dining.html` — private salon and group dining information
- `reservations.html` — date, party-size and time request form
- `contact.html` — contact details, opening hours, map and enquiry form
- `privacy.html` — cookie categories, analytics details and privacy setup notes
- `admin.html` — protected analytics dashboard (noindex)

## Run locally

For a static preview, serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. This serves the pages, themes and local controls, but not the Vercel `/api` functions. To exercise the admin login and database-backed analytics locally, use the Vercel CLI (`vercel dev`) with the environment variables above.

## Features

- Light and dark themes, with contrast-aware colors across the menu, forms, cards and admin console
- Readability tools: adjustable page-wide text size, high contrast, reduced motion and keyboard-accessible controls
- Smooth anchor navigation and subtle card depth / 3D hover effects, disabled for reduced-motion preferences or touch-only devices
- Cookie choices with essential preference storage plus optional analytics and marketing categories; optional cookies stay off until the visitor chooses. Analytics is intentionally consent-based and can be withdrawn.
- An admin sign-in at `admin.html` (email: `admin@lamasion.com`) with an HttpOnly signed session cookie and a dashboard for page views, opt-in unique visitors, daily trends, top pages, referrers and device categories
- First-party analytics only after consent; the schema does not store raw IP addresses, names, emails, full URLs, or query strings
- Reservation and contact forms use the visitor's email application (`mailto:`); a message is **not sent** and a reservation is **not confirmed** until the restaurant replies
- Local image assets and an original La Maison wordmark in SVG

## Neon and Vercel setup

The SQL schema is ready at [`db/schema.sql`](db/schema.sql). Apply it to the Neon database before enabling analytics. Deploy the repository to Vercel, then set these **server-side** environment variables in Vercel (do not add them to frontend JavaScript or commit them):

- `DATABASE_URL` — Neon pooled connection string
- `ADMIN_PASSWORD` — a strong, unique password (12+ characters) for the admin account
- `ADMIN_SESSION_SECRET` — a random secret with at least 32 characters for signing admin sessions
- `ANALYTICS_HASH_SECRET` — a separate random secret with at least 32 characters for hashing pseudonymous analytics IDs
- `CRON_SECRET` — a random secret with at least 32 characters for the scheduled retention endpoint

The admin email is fixed in the server-side login handler as `admin@lamasion.com`; passwords are never embedded in the site. API endpoints live under `api/` and use the Neon serverless driver. Vercel runs the daily job in `vercel.json` to delete analytics rows older than 90 days. Analytics will show a configuration message until a database is connected and the schema has been applied. Configure Vercel's deployment protection or firewall/rate limiting for additional production hardening.

Consent note: essential preference storage is always active. Analytics and marketing are optional and start disabled; visitors can change their choice at any time. Analytics is deliberately not forced on because cookie-consent requirements vary by jurisdiction and Paris-facing sites may serve visitors covered by GDPR/ePrivacy rules.

## Project structure

```text
.
├── index.html, about.html, menu.html, gallery.html, contact.html
├── events.html, private-dining.html, reservations.html, privacy.html, admin.html
├── api/                 # Vercel serverless functions
├── db/schema.sql        # Neon PostgreSQL analytics schema
├── lib/                 # Auth and HTTP helpers
├── css/                 # Base, theme and accessibility styles
├── js/                  # Site interactions and admin dashboard
├── package.json
├── vercel.json          # Security headers and daily retention cron
└── images/
```

## Before production

This repository is a visual/demo concept: the restaurant, address, menu, reviews, chef bio and contact details are illustrative and must be replaced with verified business information. The static forms do not have a backend; connect a reservation/contact service before accepting real bookings. Review and replace supplied photography with assets for which you have the appropriate rights. External Google Fonts, Font Awesome and the optional gallery lightbox require an internet connection; the core pages and local imagery work without those enhancements.
