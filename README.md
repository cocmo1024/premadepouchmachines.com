# Premade Pouch Machines site

Integrated multilingual packaging machine website for `premadepouchmachines.com`, built for paid campaigns and organic buyer search.

Current build output:

- 771 generated HTML pages with matching `sitemap.xml` entries
- 60 machine intent pages, generated in 7 public language versions
- 287 English long-tail buyer-intent pages across applications, packaging formats, buying guides, industry insights, buyer-industry playbooks and packaging technologies
- 6 English SEO topic hubs for applications, formats, procurement guides, industry intelligence, buyer industries and packaging technologies
- 1370 mapped target search terms across product, format, cost, supplier, compliance, trend, role/persona and technical-intent pages
- 83 application pages spanning food, beverage, household, medical, hospitality, industrial-component, consumer-goods and material-processing searches, with product-specific machine paths and RFQ requirements
- 48 industry-insight pages covering AI, automation, robotics, PPWR, sustainable packaging, 2D barcodes, flexible packaging markets, trade-show trends, market outlook, labor shortage, traceability, private label, ecommerce readiness, data governance, EPR, OT cybersecurity, combustible dust, financing, export/import, channel-distributor demand, EU Machinery Regulation 2027, Cyber Resilience Act, updated FSMA traceability timing, retail 2D barcode readiness, operator training, material-supplier collaboration, architecture comparisons, dosing comparisons, filling-method comparisons, payback planning, EU AI Act machinery guidance, controls obsolescence and digital work instructions
- 35 buyer-industry playbooks for coffee roasters, tea brands, supplement and nutrition powders, spice factories, pet food, rice and grain processors, snack brands, sauce producers, frozen food, hardware kits, cosmetics/daily chemicals, bakery/confectionery, private-label food, powder co-packers, beverage powders, seed processors, meal kits, cleaning products, ecommerce consumer goods, food manufacturers, condiment factories, nutraceutical brands, agrochemical products, personal-care samples, industrial parts kits, foodservice portion packs, bakery snack bars, seafood/meat vacuum packs, frozen dumplings, condiment co-packers, sustainability-focused brands, startup food brands, private-label sauce lines and protein powder brands
- 42 packaging-technology guides for servo control, multi-head weighing, auger filling, pump filling, ultrasonic sealing, film heat-seal windows, vacuum/nitrogen, changeover, OEE, 2D barcode verification, HMI/PLC/remote support, cartoning/case integration, vision inspection, coding, recyclable mono-material film, robotic feeding, hygienic design, recipe management, OPC/data collection, residual oxygen testing, end-of-line palletizing, X-ray inspection, pouch leak testing, metal detector validation, checkweigher calibration, servo vs pneumatic motion, compressed air/vacuum utilities, allergen changeover, safety interlocks, predictive maintenance, remote FAT, CIP, anti-drip filling, nitrogen generator integration, case label verification, change-parts/tooling, data logging, cleaning/changeover, ISO 13849 controls, ISO 14119 interlocks, ISO 13850 emergency stops and EHEDG hygienic design
- 15 machine categories across premade pouch, VFFS, sachet, tea, coffee, vacuum, flow wrap, filling, cartoning and downstream lines
- Page-specific JSON-LD with canonical URLs, hreflang alternates, FAQ, Breadcrumb, ItemList, citation, WebSite, Organization, SearchAction and product/article schema
- Buyer-visible `About` and `Editorial Policy` pages documenting brochure sources, reference-range limits, automation, official-source usage, corrections and trademark boundaries
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
- `tools/build-multilingual-site.mjs` - multilingual page and sitemap generator
- `tools/build-seo-pages.mjs` - compatibility entrypoint that runs the multilingual generator
- `premade-pouch-packaging-machine.html` - rotary premade pouch machine content page
- `vertical-form-fill-seal-machine.html` - VFFS machine content page
- `tea-coffee-packaging-machine.html` - tea and drip coffee packaging content page
- `sachet-stick-pack-machine.html` - sachet, stick pack and multi-lane content page
- `vacuum-flow-wrap-shrink-overwrap-machines.html` - vacuum, flow wrap, shrink and overwrap content page
- `filling-cartoning-lines.html` - filling, sealing, cartoning and case line content page
- `sitemap.xml` and `robots.txt` - search crawler discovery files
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

When `LEAD_ENDPOINT` is empty, the form opens a prepared email draft instead of silently dropping leads.

## Local preview

From this directory:

```powershell
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Regenerate multilingual catalog pages

After editing machine data or language copy:

```powershell
node tools/build-multilingual-site.mjs
```

The generator rebuilds localized machine pages, localized category hubs and `sitemap.xml` with `hreflang` alternates.

## Content and asset policy

The public site avoids manufacturer trademarks, original model prefixes, certificate pages, legal-document screenshots, QR codes, partner/logo-heavy visuals and sample bag artwork that could create attribution or ad-review risk. Use `content/brochure-machines.mjs` and `public/assets/brochure/` as the current approved content layer.

Before deployment, run:

```powershell
node tools/build-multilingual-site.mjs
```

Then preview at `http://localhost:4173/` and confirm the generated sitemap count matches the page count.
