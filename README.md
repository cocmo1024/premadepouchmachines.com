# Premade Pouch Machines site

Integrated multilingual packaging machine website for `premadepouchmachines.com`, built for paid campaigns and organic buyer search.

> **Updating content?** Read [`CONTENT_UPDATE_GUIDE.md`](CONTENT_UPDATE_GUIDE.md) first. It defines the generator-only workflow, seven-language rules, claim boundaries and required release checks.

Target output after the pending full regeneration:

- 802 generated HTML pages with matching `sitemap.xml` entries
- 60 machine intent pages, generated in 7 public language versions
- 316 English buyer-intent pages across applications, packaging formats, buying guides, industry insights, buyer-industry playbooks, packaging technologies and symptom-led troubleshooting
- 7 English topic hubs for applications, formats, procurement guides, industry intelligence, buyer industries, packaging technologies and troubleshooting
- 1515 mapped search phrases used for content planning and on-site discovery across product, format, cost, supplier, compliance, trend, role/persona, technical and problem-diagnosis intents
- 94 application pages spanning food, beverage, household, medical, hospitality, industrial-component, consumer-goods, material-processing and product-behavior searches, with product-specific machine paths and RFQ requirements
- 18 troubleshooting pages with symptom-to-action diagnostic matrices for pouch handling, sealing, filling accuracy, VFFS film control, nitrogen, vacuum, flow wrapping, static, utilities and line capacity
- 48 industry-insight pages covering AI, automation, robotics, PPWR, sustainable packaging, 2D barcodes, flexible packaging markets, trade-show trends, market outlook, labor shortage, traceability, private label, ecommerce readiness, data governance, EPR, OT cybersecurity, combustible dust, financing, export/import, channel-distributor demand, EU Machinery Regulation 2027, Cyber Resilience Act, updated FSMA traceability timing, retail 2D barcode readiness, operator training, material-supplier collaboration, architecture comparisons, dosing comparisons, filling-method comparisons, payback planning, EU AI Act machinery guidance, controls obsolescence and digital work instructions
- 35 buyer-industry playbooks for coffee roasters, tea brands, supplement and nutrition powders, spice factories, pet food, rice and grain processors, snack brands, sauce producers, frozen food, hardware kits, cosmetics/daily chemicals, bakery/confectionery, private-label food, powder co-packers, beverage powders, seed processors, meal kits, cleaning products, ecommerce consumer goods, food manufacturers, condiment factories, nutraceutical brands, agrochemical products, personal-care samples, industrial parts kits, foodservice portion packs, bakery snack bars, seafood/meat vacuum packs, frozen dumplings, condiment co-packers, sustainability-focused brands, startup food brands, private-label sauce lines and protein powder brands
- 42 packaging-technology guides for servo control, multi-head weighing, auger filling, pump filling, ultrasonic sealing, film heat-seal windows, vacuum/nitrogen, changeover, OEE, 2D barcode verification, HMI/PLC/remote support, cartoning/case integration, vision inspection, coding, recyclable mono-material film, robotic feeding, hygienic design, recipe management, OPC/data collection, residual oxygen testing, end-of-line palletizing, X-ray inspection, pouch leak testing, metal detector validation, checkweigher calibration, servo vs pneumatic motion, compressed air/vacuum utilities, allergen changeover, safety interlocks, predictive maintenance, remote FAT, CIP, anti-drip filling, nitrogen generator integration, case label verification, change-parts/tooling, data logging, cleaning/changeover, ISO 13849 controls, ISO 14119 interlocks, ISO 13850 emergency stops and EHEDG hygienic design
- 15 machine categories across premade pouch, VFFS, sachet, tea, coffee, vacuum, flow wrap, filling, cartoning and downstream lines
- Page-specific JSON-LD with canonical URLs, hreflang alternates, Breadcrumb, ItemList, citation, WebSite, Organization, Service and TechArticle schema; visible FAQ sections are not marked up as rich-result FAQ schema, and deprecated parameterized search actions are intentionally excluded
- Buyer-visible `About`, `Editorial Policy` and `Privacy` pages documenting brochure sources, reference-range limits, corrections, trademark boundaries and inquiry-data handling
- 49 cleaned brochure image assets used as the primary machine visual library

## Files

- `index.html` - conversion-focused home page with machine catalog, guide, specs and FAQ sections
- `machine-index.html` - generated machine catalog index
- `es/`, `fr/`, `de/`, `pt/`, `ru/`, `ar/` - generated multilingual site versions
- `machines/` - generated machine pages for specific equipment and production lines
- `content/seo-machines.mjs` - source data for generated machine pages
- `content/brochure-machines.mjs` - brochure-derived long-tail machines, image mappings and rich SEO fields
- `content/i18n.mjs` - language metadata, hreflang rules and localized buyer copy
- `content/seo-clusters.mjs` - long-tail application, format, buying-guide, industry-insight, buyer-industry and technology pages for broader search coverage
- `docs/COMPETITOR_BENCHMARK_2026-07-24.md`, `docs/GSC_BASELINE_2026-07-24.md` and `docs/VISUAL_EVIDENCE_GAPS_2026-07-24.md` - private decision evidence excluded from the public asset allow-list
- `tools/build-multilingual-site.mjs` - multilingual page and sitemap generator
- `tools/build-seo-pages.mjs` - compatibility entrypoint that runs the multilingual generator
- `tools/audit-generated-site.mjs` - post-generation SEO, accessibility, link, asset, privacy and private-path gate
- `tools/serve-preview.mjs` - local clean-URL preview server that mirrors the public route shape without exposing project sources
- `premade-pouch-packaging-machine.html` - rotary premade pouch machine content page
- `vertical-form-fill-seal-machine.html` - VFFS machine content page
- `tea-coffee-packaging-machine.html` - tea and drip coffee packaging content page
- `sachet-stick-pack-machine.html` - sachet, stick pack and multi-lane content page
- `vacuum-flow-wrap-shrink-overwrap-machines.html` - vacuum, flow wrap, shrink and overwrap content page
- `filling-cartoning-lines.html` - filling, sealing, cartoning and case line content page
- `sitemap.xml` and `robots.txt` - search crawler discovery files
- `privacy.html` - generated inquiry-data notice linked directly from every RFQ form
- `styles.css` - responsive industrial visual system
- `script.js` - mobile navigation, catalog and topic search, spec tabs and RFQ form behavior
- `public/assets/brochure/` - cleaned machine visuals extracted from the authorized brochure and selected for public use
- `tmp/pdf-extract/` - local extraction workspace for rendered PDF pages, raw images and review contact sheets

## Contact configuration

The RFQ form and visible contact blocks use `info@szcomo.com` as the email fallback by default. To change it, edit `script.js` and `tools/build-multilingual-site.mjs`:

```js
const CONTACT_EMAIL = window.CONTACT_EMAIL || "info@szcomo.com";
```

For production campaigns, connect the form to a CRM, Formspree, Make, Zapier, Cloudflare Worker or your own API by setting:

```js
const LEAD_ENDPOINT = window.LEAD_ENDPOINT || "";
```

When `LEAD_ENDPOINT` is empty, the form offers two filled handoff paths: a prepared email draft and a structured WhatsApp RFQ. These handoffs still require the visitor to press Send in the destination app; a configured endpoint is required for server-confirmed receipt.

## Local preview

From this directory:

```powershell
node tools/serve-preview.mjs
```

Then open `http://127.0.0.1:4173/`.

## Production routing

Cloudflare Workers Static Assets publishes the repository root. `.assetsignore` therefore starts from a deny-all rule and explicitly re-allows only managed route directories, root HTML, required runtime files, Cloudflare metadata and `public/`; source, documents, data exports, secrets and build-transaction workspaces are excluded again after the allow-list. `wrangler.jsonc` explicitly keeps `auto-trailing-slash` HTML handling so `.html` and slash variants converge on the clean canonical route. The zone-level canonical redirect must send only the apex and `www` production hosts to `https://premadepouchmachines.com`, preserving the original path and query string. `_headers` adds conservative security headers and `Strict-Transport-Security: max-age=31536000` only on the canonical host, without `includeSubDomains` or preload. CSS, JavaScript and public images use a seven-day browser cache with one day of stale-while-revalidate; HTML keeps the platform's revalidation-first default.

## Regenerate multilingual catalog pages

After editing machine data or language copy:

```powershell
node tools/build-multilingual-site.mjs --validate-only
node tools/build-multilingual-site.mjs
```

`--validate-only` renders the complete route inventory in memory and checks source contracts, the preserved-URL fingerprint, canonical and hreflang maps, output collisions, images, forms, localized UI and the current generated-output boundary without writing files. A normal run acquires an owned lock, writes the complete output to a same-volume staging area, verifies it, and then replaces the managed directories, root HTML and `sitemap.xml` through an append-logged backup-and-rollback transaction. Existing generated directories must contain only normal directories and HTML files; unfinished transaction workspaces stop the next build for inspection. Do not run generation concurrently with preview validation, Wrangler dry-run or deployment because the current layout still requires several top-level rename operations. The generator rebuilds localized machine pages, localized category hubs and `sitemap.xml` with `hreflang` alternates. `node tools/build-multilingual-site.mjs --print-route-fingerprint` prints the current exact URL-set fingerprint; change its contract only with an intentional route migration or approved inventory expansion.

Non-English machine pages publish buyer UI, titles, summaries and only the technical terms explicitly reviewed in `content/machine-localization.mjs`. Unmapped English feature or application phrases are not presented as translated copy; brochure-derived specification values may remain in the source language only when the HTML declares `lang="en"`. Inspect the explicit terminology baseline with `node tools/build-multilingual-site.mjs --print-localization-coverage`.

## Content and asset policy

The public site avoids manufacturer trademarks, original model prefixes, certificate pages, legal-document screenshots, QR codes, partner/logo-heavy visuals and sample bag artwork that could create attribution or ad-review risk. Use `content/brochure-machines.mjs` and `public/assets/brochure/` as the current approved machine-content layer; the site-owned Organization mark is `public/assets/brand/premade-pouch-machines-logo.svg`.

Before deployment, run:

```powershell
node tools/build-multilingual-site.mjs
node tools/audit-generated-site.mjs
node tools/audit-generated-site.mjs --deployment-boundary-only
```

Then preview at `http://127.0.0.1:4173/` and confirm the generated sitemap count matches the page count.
