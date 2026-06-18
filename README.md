# Premade Pouch Machines site

Integrated multilingual packaging machine website for `premadepouchmachines.com`, built for paid campaigns and organic buyer search.

Current build output:

- 476 generated HTML pages with matching `sitemap.xml` entries
- 60 machine intent pages, generated in 7 public language versions
- 15 machine categories across premade pouch, VFFS, sachet, tea, coffee, vacuum, flow wrap, filling, cartoning and downstream lines
- 476 JSON-LD blocks with canonical URLs, hreflang alternates and page-specific schema
- 49 cleaned brochure image assets used as the primary machine visual library

## Files

- `index.html` - conversion-focused home page with machine catalog, guide, specs and FAQ sections
- `machine-index.html` - generated machine catalog index
- `es/`, `fr/`, `de/`, `pt/`, `ru/`, `ar/` - generated multilingual site versions
- `machines/` - generated machine pages for specific equipment and production lines
- `content/seo-machines.mjs` - source data for generated machine pages
- `content/brochure-machines.mjs` - brochure-derived long-tail machines, image mappings and rich SEO fields
- `content/i18n.mjs` - language metadata, hreflang rules and localized buyer copy
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
- `script.js` - mobile navigation, spec tabs and RFQ form behavior
- `public/assets/brochure/` - cleaned machine visuals extracted from the authorized brochure and selected for public use
- `tmp/pdf-extract/` - local extraction workspace for rendered PDF pages, raw images and review contact sheets

## Contact configuration

The RFQ form uses `sales@premadepouchmachines.com` as the email fallback by default. To change it, edit `script.js`:

```js
const CONTACT_EMAIL = window.CONTACT_EMAIL || "sales@premadepouchmachines.com";
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
