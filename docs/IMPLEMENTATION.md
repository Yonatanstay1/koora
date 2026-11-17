# Koora review build — September 25, 2026

## Run and review

Node 24 is required for the bundled SQLite inquiry server.

```
npm ci
npm run build
npm run preview
```

Open http://127.0.0.1:4300. This serves the production website and the same-origin inquiry API. The development-only `next dev` server does not provide the inquiry API.

## Working now

- Redesigned homepage, collection, all nine property pages, About, FAQ, Contact and privacy information.
- Responsive navigation, accessible native gallery dialogs, mobile inquiry controls, skip link, reduced-motion support, date/guest query preservation.
- Verified published capacities/rates and property-specific photos against the original Koora listing pages. Provenance and capture time: `data/source-listings.json`. Published prices are reference rates, not live quotes. Casa Loma's source description/configuration remains ambiguous; page asks the team to confirm the layout.
- Compressed galleries in WebP, stored locally. Unverified testimonials and fake availability removed from the displayed pages.
- POST `/api/inquiries`: validation, capacity checks, explicit consent, honeypot, 16 KB request limit, same-origin check, five new requests per network address per hour, transactional SQLite writes and idempotent retry handling. No payment data collected.
- GET `/api/inquiries`: staff review API protected by `KOORA_ADMIN_TOKEN` (at least 32 characters). Returns up to 200 newest inquiries. Disabled if no sufficiently long token is set.
- SQLite data is in `.koora-data/inquiries.sqlite` by default. This directory is ignored by Git and is never publicly served.
- Optional Resend notification adapter: delivery state recorded separately from the saved inquiry. A successful form means saved, not reservation confirmed or email delivered.

## Production configuration

Use a persistent, backed-up disk for `KOORA_DATA_DIR`, one server process, and HTTPS termination. Do not deploy SQLite to an ephemeral serverless filesystem. This server defaults to loopback; set `HOST` for a container or reverse proxy and `PORT` as needed. `KOORA_ORIGIN` must match the exact public origin. Rate limiting currently uses the direct peer address; behind a reverse proxy this conservatively groups requests under that proxy. Configure a trusted-proxy strategy before production traffic; do not blindly trust user-provided X-Forwarded-For headers.

Environment variables:

- `KOORA_DATA_DIR`: private persistent data location.
- `KOORA_ORIGIN`: exact allowed website origin (e.g. https://your-domain.example).
- `KOORA_ADMIN_TOKEN`: independently generated secret of at least 32 characters, for the staff API.
- `RESEND_API_KEY`, `KOORA_EMAIL_FROM`, `KOORA_INQUIRY_TO`: enable team email notifications. Sender must be verified. No mail is sent when these are unset.
- `NEXT_PUBLIC_SITE_URL`: build-time canonical domain for social metadata and sitemap.

Review failed/pending notifications using the staff API. Automated retries and a staff dashboard are not included in this delivery. Retention, backups and deletion procedures must be configured for the real deployment.

## Connections not yet available

- Real availability/reservation provider and credentials: user confirmation pending. Dates are inquiry preferences; the website does not claim live availability, hold inventory or charge a card.
- Email provider credentials: not available. Local inquiries are saved and can be reviewed through the staff API. Guests can explicitly send a WhatsApp draft as an alternative.
- Firebase login expired (`firebase projects:list` rejected the saved credentials). Existing Firebase configuration is static hosting only and cannot run the new Node/SQLite API. Do not deploy the frontend alone as a complete backend deployment. Reauthenticate and choose a persistent Node host (with same-origin proxying), or implement a separate managed datastore/API adapter before publishing.
- Framework upgraded to Next.js 16.3.6 and React 19; dependency installation reports zero known vulnerabilities at the time of this build.

## Verification

`npm run test:backend` exercises validation, idempotency conflicts, rate limits and failure handling. `npm run test:browser` builds on the production export, starts an isolated server with temporary storage, checks desktop/mobile routes and tests the actual inquiry flow without sending external messages.

The previous Git commit already tracked generated `.next`, `out` and some `node_modules` content despite `.gitignore`. Build commands modify those tracked artifacts. No commit or deployment is performed as part of this review build.

### Completed checks

- Production build and TypeScript check passed on Next.js 16.3.6.
- Five backend tests passed, including reopening persisted storage.
- All 15 content routes passed at 360, 768 and 1440 pixels with no horizontal overflow.
- Browser journey passed: mobile menu → filtered collection → villa → gallery → inquiry → saved record in isolated storage.
- Staff API authentication and failed-submission fallback passed.
- Automated WCAG A/AA checks on homepage, collection, contact and villa detail reported no violations in the tested desktop state. This is an automated check, not a full accessibility certification.
- `npm audit --omit=dev --audit-level=moderate`: zero known vulnerabilities.
- Preview is running at http://127.0.0.1:4300. No public deployment or external test messages were sent.


## October 15, 2026 — architectural direction

The local working project is now organized around Stays, Estate Management and Development. The existing `/villas` URLs and inquiry backend are preserved. Homepage sequence follows the supplied brief; statistics, testimonials and selected sales are conditional and remain hidden until approved content is entered.

Implemented:
- Black/white design, large typography and property imagery, transparent homepage header that becomes black on scroll, complete navigation and black footer.
- Hero search, three featured villas, homeowner and development sections, five Why Koora pillars, Pick Your Pace, local guide, Journal, large CTA and homepage inquiry form.
- Estate Management, Development, Destination, Journal and two editorial notes, Selected Properties, Payment and service information pages.
- Mobile WhatsApp stays above the property inquiry bar.
- Inquiry category and phone are persisted by the existing API. Stay fields are optional and hidden for non-stay inquiries; service CTA links preselect the category. Guest date/guest/villa preservation remains functional.
- Video/360/floor-plan fields in villa and project templates; hero MP4 support with a pause control and reduced-motion fallback. Media appears only when configured. Journal videos use the same embed component. Use embed URLs, not YouTube watch-page URLs.
- A Spanish introduction at `/es` with a Spanish WhatsApp draft. This is **not** a full Spanish translation of the website; navigation and detail pages remain English.

Content configuration: `data/site.ts` holds approved statistics, guest/owner stories, selected sales, projects, Journal entries, hero video, YouTube channel and payment provider link. `data/villas.ts` holds property media and optional external booking URLs. No example statistics, reviews, project credits or sale listings were invented. Development images are labeled as architecture from the stays collection, not claimed as Koora construction projects. Replace the Malpaís mood image with verified destination photography when supplied. Lifestyle-specific photography and audiovisual content remain to be supplied.

Remaining inputs: verified numbers and testimonials; actual development project photos/renders/plans/progress/before-and-after material; cinematic video and villa tour embeds; confirmed YouTube channel; secure payment provider; live booking/availability integration; full Spanish copy. Booking still uses the existing inquiry/quote flow, not live inventory or confirmed reservations. Phase 2 map and downloadable guides are not included.

Validation: production build and TypeScript passed. Six backend tests passed. Browser suite checked 25 routes at 360, 768 and 1440 pixels with no horizontal overflow; guest navigation, search/date preservation, gallery, persisted guest and owner inquiries, staff authentication and error fallback passed. Automated WCAG A/AA checks reported no violations on the four representative pages tested. Desktop/mobile screenshots inspected. Test runner teardown was repaired so an early server failure cannot silently exit without reporting failure.

Review at http://127.0.0.1:4300 with `npm run preview`. No public deployment was performed: existing static hosting cannot run the Node/SQLite inquiry API, and hosting must preserve that backend. Previous production connection limitations above still apply.

### Shareable review deployment — October 15

The user requested a link to share with Cami. Firebase authentication is now working. The review export uses `NEXT_PUBLIC_INQUIRY_MODE=whatsapp` and `NEXT_PUBLIC_SITE_URL=https://koora-demo.web.app`; its form validates details and opens a WhatsApp draft rather than calling the unavailable Node API on static hosting. This does not send a message automatically. Default builds retain database-backed inquiry submission. A targeted browser check verified the preselected owner category and entered details in the outgoing draft while intercepting the external request. The production build passed. Publish the review export with `firebase deploy --only hosting --project mod8-495901 --non-interactive`.
