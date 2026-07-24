import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { SEO_TOPIC_HUBS, SEO_TOPIC_PAGES } from "../content/seo-clusters.mjs";
import { MACHINE_PAGES, STATIC_SEO_PAGES } from "../content/seo-machines.mjs";
import {
  hasMachineTermTranslation,
  localizeMachineTerm,
  localizedMachine,
} from "../content/machine-localization.mjs";
import {
  BASE_URL,
  COPY,
  LANGUAGES,
  LASTMOD,
  PILLAR_PAGES,
  absoluteUrl,
  categoryFor,
  copyFor,
  localizedPath,
  normalizePath,
} from "../content/i18n.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD_STAGE_PREFIX = ".site-build-";
const BUILD_BACKUP_PREFIX = ".site-backup-";
const ASSET_VERSION = "20260724a";
const SITE_REFRESH_DATE = "2026-07-24";
const HERO_IMAGE = "public/assets/brochure/rotary-premade-line.jpg";
const DEFAULT_SOCIAL_IMAGE = HERO_IMAGE;
const ORGANIZATION_LOGO_PATH = "public/assets/brand/premade-pouch-machines-logo.svg";
const ORGANIZATION_LOGO_URL = `${BASE_URL}/${ORGANIZATION_LOGO_PATH}`;
const CONTACT_EMAIL = "info@szcomo.com";
const WHATSAPP_NUMBER = "8615301541312";
const INSTANT_CHAT_DISPLAY = "+86 15301541312";
const SITE_NAME = "Premade Pouch Machines";
const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const INVENTORY_CONTRACT = Object.freeze({
  languages: 7,
  languageCodes: ["en", "es", "fr", "de", "pt", "ru", "ar"],
  minimumMachines: 60,
  minimumTopics: 316,
  minimumPublicPages: 802,
  minimumLocalizedMachineTerms: 242,
  routeInventoryFingerprint: "79d2d77ec8f7094e2da7bf9c7327ebbcb75dc802f3b0fc05f497114927a3f7ea",
});
const MACHINE_UPDATED_AT = new Map(
  [
    "powder-premade-bag-packing-machine",
    "compact-premade-bag-packing-machine",
    "servo-premade-bag-packing-machine",
    "vertical-vacuum-packing-machine",
    "roll-film-outer-bag-tea-packing-machine",
    "drip-coffee-inner-outer-bag-packing-machine",
    "ultrasonic-non-woven-packing-machine",
    "round-corner-granule-packing-machine",
    "stand-up-pouch-filling-capping-machine",
    "semi-auto-powder-filling-machine",
    "semi-auto-granule-weighing-packing-machine",
    "automatic-filling-machine",
    "full-automatic-unmanned-packaging-production-line",
  ].map((slug) => [slug, SITE_REFRESH_DATE]),
);
const DISALLOWED = [
  ["Q", "i", "n", "d", "i", "a", "n"].join(""),
  String.fromCharCode(0x94a6, 0x5178),
  ["Q", "D", "-"].join(""),
];

const NON_DEFAULT_LANGUAGES = LANGUAGES.filter((lang) => lang.code !== "en");
const REMOVED_LOCALE_DIRS = [String.fromCharCode(0x7a, 0x68)];
const GENERATED_ROUTE_DIRS = Object.freeze([
  "machines",
  "applications",
  "formats",
  "guides",
  "industries",
  "insights",
  "technologies",
  "troubleshooting",
  ...NON_DEFAULT_LANGUAGES.map((lang) => lang.code),
  ...REMOVED_LOCALE_DIRS,
]);
const TRUST_ROUTES = [
  { path: "/about.html", priority: "0.7", changefreq: "monthly", languages: ["en"] },
  { path: "/editorial-policy.html", priority: "0.64", changefreq: "monthly", languages: ["en"] },
  { path: "/privacy.html", priority: "0.3", changefreq: "yearly", languages: ["en"], lastmod: SITE_REFRESH_DATE },
];
const ROUTES = [
  ...STATIC_SEO_PAGES.map((entry) => ({
    ...entry,
    lastmod: effectiveModifiedDate(entry.lastmod, SITE_REFRESH_DATE),
    languages: LANGUAGES.map((lang) => lang.code),
  })),
  ...MACHINE_PAGES.map((item) => ({
    path: `/machines/${item.slug}.html`,
    priority: "0.78",
    changefreq: "monthly",
    languages: LANGUAGES.map((lang) => lang.code),
    lastmod: effectiveModifiedDate(item.updatedAt, MACHINE_UPDATED_AT.get(item.slug), SITE_REFRESH_DATE),
  })),
  ...SEO_TOPIC_HUBS.map((page) => ({
    path: page.path,
    priority: page.priority,
    changefreq: page.changefreq,
    languages: ["en"],
    lastmod: effectiveModifiedDate(page.updatedAt, SITE_REFRESH_DATE),
  })),
  ...SEO_TOPIC_PAGES.map((page) => ({
    path: page.path,
    priority: page.priority,
    changefreq: page.changefreq,
    languages: ["en"],
    lastmod: effectiveModifiedDate(page.updatedAt, SITE_REFRESH_DATE),
  })),
  ...TRUST_ROUTES.map((entry) => ({
    ...entry,
    lastmod: effectiveModifiedDate(entry.lastmod, SITE_REFRESH_DATE),
  })),
];

const FEATURED_TOPIC_SLUGS = [
  "frozen-food-packaging-machine",
  "pet-food-packaging-machine",
  "packaging-machine-rfq-checklist",
  "factory-acceptance-test-packaging-machine",
  "roll-film-vs-premade-pouch-cost-guide",
  "vision-inspection-packaging-line-guide",
  "premade-pouch-not-opening-troubleshooting",
  "nutraceutical-supplement-packaging-line",
];

const GUIDE_CARDS = [
  {
    title: "Start with product behavior",
    text: "Free-flowing granules, dusty powders, viscous sauces, fragile tea, hardware kits and regular solid goods each need a different dosing and sealing strategy.",
  },
  {
    title: "Then choose package economics",
    text: "Finished pouches support premium retail appearance. Roll film VFFS and sachet machines usually reduce film cost. Flow wrap and shrink machines fit regular solids and bundles.",
  },
  {
    title: "Confirm the automation boundary",
    text: "A single machine can solve primary packing. A production line adds feeding, weighing, coding, checking, cartoning, case forming, sealing and conveyor logic.",
  },
  {
    title: "Build the RFQ around evidence",
    text: "Useful quotations need product photos, fill weight, pouch or film samples, target output, voltage, compressed air, footprint and downstream packing requirements.",
  },
];

const APPLICATION_CLUSTERS = [
  {
    title: "Food, snacks and grains",
    text: "Premade pouch, VFFS, vacuum and filling systems for rice, beans, roasted nuts, frozen food, puffed food, biscuits, seeds and retail dry food packs.",
  },
  {
    title: "Powder and seasoning",
    text: "Auger, screw feeding, dust control and powder filling choices for flour, milk powder, protein powder, seasoning, solid beverages and chemical powders.",
  },
  {
    title: "Tea, coffee and beverage packs",
    text: "Triangle tea bags, thread-and-tag tea bags, drip coffee inner/outer envelopes and compact beverage packs with ultrasonic sealing and small-dose filling.",
  },
  {
    title: "Liquid, sauce and paste",
    text: "Pump-filled sachets, premade pouches, PE film packs, stand-up pouch capping systems and bottle filling lines for liquids, sauces, oils and daily chemical products.",
  },
  {
    title: "Regular solids and secondary packs",
    text: "Flow wrapping, shrink packing, transparent film overwrapping, cartoning, case forming and case sealing for retail multipacks and logistics-ready cartons.",
  },
  {
    title: "Hardware and mixed small parts",
    text: "Counting, multi-material filling, screw packing and kit packaging pages cover quantity control, mixed accessories and small industrial parts.",
  },
];

const SPEC_REFERENCE_LINES = [
  ["Premade pouch systems", "Finished pouches, W100-350mm and L150-480mm reference range, up to 60 bags/min on selected small formats."],
  ["VFFS roll-film systems", "Bag size around L80-450mm and W80-350mm by frame, electronic scale, cup, auger or pump dosing."],
  ["Sachet and stick pack", "Small-dose formats from 1-100g reference range, single lane, double line, multi-line and round-corner options."],
  ["Tea and drip coffee", "1-15g beverage formats with ultrasonic sealing, outer envelopes, thread/tag, nitrogen and small-dose accuracy choices."],
  ["Flow wrap and shrink", "Top-feed, bottom-feed, reciprocating, pillow line and shrink configurations for regular solids and grouped packs."],
  ["Filling and downstream lines", "Semi-auto fillers through full granule, powder, liquid, cartoning and case-packing production lines."],
];

const LINE_FLOW_STEPS = [
  { step: "01", title: "Product feeding", text: "Elevator, screw conveyor, bowl feeder or manual loading selected by product flow and hygiene requirements." },
  { step: "02", title: "Dosing and filling", text: "Multi-head scale, linear scale, auger, volumetric cup, piston pump or counting module matched to target accuracy." },
  { step: "03", title: "Primary packaging", text: "Premade pouch, VFFS roll film, sachet, tea bag, flow wrap, vacuum, cup, bottle or carton format." },
  { step: "04", title: "Seal, code and verify", text: "Heat sealing, ultrasonic sealing, vacuum, nitrogen, date coding, checkweighing and reject handling." },
  { step: "05", title: "Secondary packing", text: "Cartoning, shrink bundling, overwrapping, case forming, case packing and case sealing where required." },
  { step: "06", title: "RFQ evidence", text: "Photos, pack samples, fill weight, output target, voltage, compressed air and layout define the final machine scope." },
];

const APPLICATION_VISUALS = [
  { image: "public/assets/brochure/electronic-scale-vffs.jpg", href: "/vertical-form-fill-seal-machine.html" },
  { image: "public/assets/brochure/powder-vffs-line.jpg", href: "/vertical-form-fill-seal-machine.html" },
  { image: "public/assets/brochure/triangle-tea-bag.jpg", href: "/tea-coffee-packaging-machine.html" },
  { image: "public/assets/brochure/sauce-liquid-sachet.jpg", href: "/sachet-stick-pack-machine.html" },
  { image: "public/assets/brochure/high-speed-pillow-system.jpg", href: "/vacuum-flow-wrap-shrink-overwrap-machines.html" },
  { image: "public/assets/brochure/hardware-screw.jpg", href: "/sachet-stick-pack-machine.html" },
];

const FAQ_ITEMS = [
  ["Which machine should we quote first?", "Start with product flow, pack format and target output. A finished stand-up pouch usually points to rotary premade pouch equipment; low film cost often points to VFFS or sachet systems."],
  ["What samples are required for testing?", "Send product photos, fill weight, density or viscosity, pouch or film samples, expected seal style and any downstream carton or case size."],
  ["Can one line handle different products?", "Yes when product behavior and pack size stay within the same mechanical range. Dosing modules, forming parts, pouch width and sealing jaws determine the changeover boundary."],
  ["What affects lead time and final price?", "Machine family, dosing accuracy, material contact parts, print/coding, nitrogen, vacuum, dust control, checkweighing, cartoning, case packing and local compliance requirements."],
  ["How do we compare pouch, VFFS and sachet cost?", "Compare finished pack value, film or pouch cost, output, waste rate, operator count and changeover frequency. The lowest machine price is rarely the lowest line cost."],
  ["What prevents rework after quotation?", "Confirm product behavior, target speed, bag dimensions, filling tolerance, voltage, compressed air, footprint, conveyor direction and acceptance samples before final machine configuration."],
];

const TRUST_PAGES = [
  {
    path: "/about.html",
    kicker: "About this catalog",
    title: "About Premade Pouch Machines",
    description: "How this buyer-focused packaging machine catalog turns authorized brochure specifications, application knowledge and official industry sources into RFQ-ready guidance.",
    h1: "A packaging machine catalog built around buyer evidence.",
    lede: "Premade Pouch Machines is a buyer-oriented equipment catalog and technical research library. It helps factories, brands, co-packers, engineers and procurement teams move from a search query to a realistic machine shortlist and RFQ package.",
    sections: [
      ["What the site covers", "The catalog covers premade pouch, VFFS, sachet, tea, coffee, vacuum, flow wrap, filling, cartoning and case-packing systems. Application and technology pages connect product behavior, package format, dosing, sealing, inspection, utilities and acceptance testing."],
      ["Where machine information comes from", "Machine families, reference models, specifications and primary images are derived from a manufacturer-authorized product brochure. Reference ranges are presented as starting points, not universal guarantees. Final performance depends on product samples, packaging materials, options, utilities and testing."],
      ["How current topics are handled", "Regulatory, safety, traceability and market pages cite official or authoritative sources where available. The site translates those signals into buyer questions and RFQ checks instead of presenting legal, certification or market claims as automatic machine guarantees."],
      ["How to use the catalog", "Start with the product or pack-format page, compare linked machine families, review specification signals, then send product photos, pack samples, fill weight, target output, voltage and required options through the RFQ contact path."],
    ],
  },
  {
    path: "/editorial-policy.html",
    kicker: "Editorial policy",
    title: "Editorial and Technical Content Policy",
    description: "Editorial policy for machine specifications, industry sources, standards coverage, updates, corrections and commercial RFQ content on Premade Pouch Machines.",
    h1: "How technical content is researched, produced and reviewed.",
    lede: "The site's purpose is to help industrial buyers make better packaging-equipment decisions. A page is published only when it serves a distinct product, format, engineering, procurement or troubleshooting task and can be connected to relevant equipment capability.",
    sections: [
      ["Machine specification policy", "Published dimensions, speeds, weights, utilities and model references are treated as brochure-derived reference ranges. Pages repeatedly direct buyers to confirm final scope with samples, drawings, factory utilities and acceptance tests."],
      ["Research and source policy", "Standards, regulations and time-sensitive industry claims use direct links to official bodies or recognized industry organizations. Source notes are visible on the same page as the claim and are not hidden only in structured data."],
      ["Authorship and structured publishing", "Content is assembled from structured brochure data, application mapping and source research. The publishing system supports consistency and relevant internal linking; it does not justify repeated keyword variants or replace buyer-specific engineering validation and professional compliance advice."],
      ["Troubleshooting and safety boundary", "Diagnostic pages organize symptoms, evidence and controlled checks. They do not replace the machine manual, trained maintenance personnel, risk assessment, isolation of energy, lockout/tagout or manufacturer-approved repair procedures."],
      ["Corrections and updates", "Material changes update the page and sitemap date. If a specification, source statement or link needs correction, contact info@szcomo.com with the page URL and the evidence to review."],
      ["Commercial independence and trademarks", "Third-party company names may appear only in neutral market-comparison context. The site does not claim affiliation with those companies and avoids reproducing third-party logos or implying approval."],
    ],
  },
  {
    path: "/privacy.html",
    updatedAt: SITE_REFRESH_DATE,
    kicker: "Privacy notice",
    title: "Privacy Notice | Premade Pouch Machines",
    description: "How RFQ details, contact information, browser attribution data and communication records are handled when you contact Premade Pouch Machines.",
    h1: "Privacy information for RFQs and direct contact.",
    lede: "This notice explains the limited information collected through this website, why it is needed for an equipment inquiry, and how to request access, correction or deletion. Sending an RFQ is not a marketing subscription.",
    sections: [
      ["Information you choose to send", "An RFQ may include your name, business email, company, country or region, telephone or WhatsApp number, product, package format, fill amount, package dimensions, target output and project notes. If you continue by email or chat, you may also send photos, drawings, samples, specifications and communication records."],
      ["Technical and attribution information", "The RFQ form can include the page URL, page title, referring page, language and campaign parameters such as UTM, GCLID, GBRAID or WBRAID when they are present. First-touch campaign context may be kept in session storage for the current browser session. The repository does not load a marketing analytics tag by default."],
      ["Why the information is used", "Information is used to understand the requested packaging task, identify a plausible machine or test path, prepare and follow up a technical or commercial response, prevent obvious form abuse and maintain necessary business records. The RFQ acknowledgement is not consent to unrelated promotional email."],
      ["Delivery and service providers", "Depending on the contact method, information may be processed by website hosting, email, messaging, security or customer-management providers used to deliver and respond to the request. These providers may operate in more than one country. Do not send trade secrets or regulated personal data until an appropriate confidentiality and data-handling arrangement is in place."],
      ["Controller identification boundary", `This website currently publishes ${CONTACT_EMAIL} as its inquiry and privacy contact but does not yet publish a verified legal-entity name, registered address or controller jurisdiction. Those facts, the applicable retention schedule and the relevant service-provider list must be confirmed and published before paid acquisition or expanded personal-data processing. Do not send sensitive or regulated personal data through this form.`],
      ["Retention and security boundary", "Inquiry records are retained only as long as reasonably needed for evaluation, follow-up, commercial recordkeeping, dispute handling or applicable legal obligations. No public website or email channel can promise absolute security. Use the contact address below if a different secure transfer method is required for sensitive files."],
      ["Your choices and requests", "You may ask what inquiry information is held, request correction or deletion where applicable, or withdraw from further non-contractual contact. Send the request from the relevant business email to info@szcomo.com and include enough detail to identify the inquiry. Legal rights and response obligations depend on your location and the applicable law."],
      ["Changes and contact", `Material changes will update this notice and its date. Questions or privacy requests can be sent to ${CONTACT_EMAIL}. Last updated ${SITE_REFRESH_DATE}.`],
    ],
  },
];

const BROCHURE_SOURCE_BY_SLUG = {
  "granule-premade-bag-packing-machine": { model: "240/300/350K premade pouch platform", page: "Brochure p.6" },
  "powder-premade-bag-packing-machine": { model: "240/300/350K premade pouch platform with auger filling", page: "Brochure p.7" },
  "sauce-liquid-premade-bag-packing-machine": { model: "240/300/350K premade pouch platform with pump filling", page: "Brochure p.8" },
  "compact-premade-bag-packing-machine": { model: "QD-180 premade pouch platform", page: "Brochure p.9" },
  "servo-premade-bag-packing-machine": { model: "QD-200-04/06 premade pouch platform", page: "Brochure p.9" },
  "electronic-scale-granule-vffs-machine": { model: "420/520/620/720K electronic scale VFFS platform", page: "Brochure p.10" },
  "full-automatic-electronic-scale-packing-machine": { model: "420/520/620/720K electronic scale VFFS platform", page: "Brochure p.10" },
  "vertical-vacuum-packing-machine": { model: "420KZ vertical vacuum platform", page: "Brochure p.11" },
  "full-automatic-powder-vffs-packing-machine": { model: "420/520/620/720F powder VFFS platform", page: "Brochure p.12" },
  "triangle-tea-bag-packing-machine": { model: "20DJ triangle tea bag platform", page: "Brochure p.14" },
  "roll-film-outer-bag-tea-packing-machine": { model: "20DJ roll-film outer envelope tea platform", page: "Brochure p.14" },
  "prefabricated-outer-bag-tea-packing-machine": { model: "20DY prefabricated outer bag tea platform", page: "Brochure p.15" },
  "inner-outer-tea-bag-vacuum-packing-machine": { model: "48-II inner and outer tea vacuum platform", page: "Brochure p.16" },
  "thread-tag-tea-bag-packing-machine": { model: "11 thread-and-tag tea bag platform", page: "Brochure p.16" },
  "tea-bag-packing-machine-with-outer-envelope": { model: "18-II tea bag outer envelope platform", page: "Brochure p.17" },
  "drip-coffee-inner-outer-bag-packing-machine": { model: "18-KFC/18-KFY drip coffee inner and outer platform", page: "Brochure pp.18-19" },
  "granule-sachet-packing-machine": { model: "61K granule sachet platform", page: "Brochure p.20" },
  "powder-sachet-packing-machine": { model: "61F powder sachet platform", page: "Brochure p.20" },
  "sauce-liquid-sachet-packing-machine": { model: "61J/Y sauce and liquid sachet platform", page: "Brochure p.21" },
  "multi-channel-counting-packing-machine": { model: "61A4 multi-channel counting platform", page: "Brochure p.21" },
  "ultrasonic-non-woven-packing-machine": { model: "62 ultrasonic non-woven platform", page: "Brochure p.22" },
  "round-corner-granule-packing-machine": { model: "65KY round-corner granule platform", page: "Brochure p.22" },
  "round-corner-powder-packing-machine": { model: "65FY round-corner powder platform", page: "Brochure p.23" },
  "round-corner-sauce-liquid-packing-machine": { model: "65J/Y round-corner liquid platform", page: "Brochure p.23" },
  "multi-material-packing-machine": { model: "65D multi-material platform", page: "Brochure p.24" },
  "eight-treasure-tea-packing-machine": { model: "65DS multi-material tea platform", page: "Brochure p.25" },
  "hardware-screw-packing-machine": { model: "60T hardware screw platform", page: "Brochure p.26" },
  "stick-pack-granule-packing-machine": { model: "10/40/150 stick and small-granule platform", page: "Brochure p.27" },
  "automatic-granular-packing-machine": { model: "80 automatic granule platform", page: "Brochure p.28" },
  "double-line-packaging-machine": { model: "QD-220 dual-lane sachet platform", page: "Brochure p.29" },
  "multi-line-granule-liquid-powder-packing-machine": { model: "12A/B/C multi-line platform", page: "Brochure p.30" },
  "multi-functional-back-seal-triangle-three-side-packing-machine": { model: "3 multi-functional specialty bag platform", page: "Brochure p.31" },
  "single-film-liquid-packing-machine": { model: "1000 single-film liquid platform", page: "Brochure p.31" },
  "stand-up-pouch-filling-capping-machine": { model: "ZLD-2/6 stand-up pouch filling and capping platform", page: "Brochure p.32" },
  "tube-film-packing-machine": { model: "260T tube film platform", page: "Brochure p.32" },
  "pe-film-filling-machine": { model: "260T PE tube film platform", page: "Brochure p.32" },
  "t-type-high-speed-bag-making-bagging-machine": { model: "35 T-type bag-making and bagging platform", page: "Brochure p.33" },
  "stretch-film-vacuum-packaging-machine": { model: "420LS/520LS stretch film vacuum platform", page: "Brochure p.34" },
  "high-speed-pillow-packing-machine": { model: "250L/250S flow-wrap platform", page: "Brochure p.39" },
  "pillow-packing-machine-paper-from-top": { model: "QD-250/350/450/600B/D top-feed pillow packing platform", page: "Brochure p.35" },
  "pillow-packing-machine-paper-from-bottom": { model: "QD-250/350/450/600X bottom-feed pillow packing platform", page: "Brochure p.36" },
  "reciprocating-pillow-packing-machine": { model: "QD-450W/600W reciprocating pillow packing platform", page: "Brochure p.37" },
  "pillow-type-full-automatic-packaging-production-line": { model: "250L/250S pillow type automatic production line", page: "Brochure p.39" },
  "high-speed-automatic-packing-machine": { model: "320/898 high-speed automatic platform", page: "Brochure pp.28, 38" },
  "heat-shrink-sealing-cutting-machine": { model: "100 heat shrink and sealing-cutting platform", page: "Brochure p.41" },
  "full-servo-high-speed-heat-shrink-packing-machine": { model: "QD-590 full-servo heat shrink platform", page: "Brochure p.40" },
  "adjustable-transparent-film-overwrapping-machine": { model: "01 adjustable transparent overwrapping platform", page: "Brochure p.42" },
  "transparent-film-overwrapping-machine": { model: "2000B/D/E transparent film overwrapping platform", page: "Brochure p.43" },
  "capsule-coffee-filling-sealing-machine": { model: "1A capsule coffee filling and sealing platform", page: "Brochure p.44" },
  "full-automatic-cup-filling-sealing-machine": { model: "4/8/12 cup filling and sealing platform", page: "Brochure p.45" },
  "automatic-cartoning-machine": { model: "120 automatic cartoning platform", page: "Brochure p.46" },
  "automatic-box-opening-sealing-machine": { model: "40F/560FX case opening and sealing platform", page: "Brochure p.47" },
  "semi-auto-powder-filling-machine": { model: "5F semi-auto powder filling platform", page: "Brochure p.48" },
  "semi-auto-granule-weighing-packing-machine": { model: "5K semi-auto granule weighing platform", page: "Brochure p.48" },
  "automatic-granule-filling-production-line": { model: "5KL granule filling line", page: "Brochure p.49" },
  "automatic-powder-filling-production-line": { model: "5FL powder filling line", page: "Brochure p.50" },
  "automatic-liquid-filling-production-line": { model: "5YL liquid filling line", page: "Brochure p.51" },
  "automatic-carton-case-packing-line": { model: "case opening, sealing and packing line", page: "Brochure p.52" },
  "automatic-filling-machine": { model: "Filling-machine selection guide", page: "No dedicated brochure model; compare brochure pp.44-51" },
  "full-automatic-unmanned-packaging-production-line": { model: "full automatic unmanned packaging line", page: "Brochure p.52" },
};

const VISUAL_EVIDENCE_BY_SLUG = {
  "powder-premade-bag-packing-machine": { status: "Exact product visual pending", placeholder: true },
  "sauce-liquid-premade-bag-packing-machine": { status: "Exact product visual pending", placeholder: true },
  "granule-sachet-packing-machine": { status: "Exact QD-61K visual pending", placeholder: true },
  "powder-sachet-packing-machine": { status: "Exact QD-61F visual pending", placeholder: true },
  "double-line-packaging-machine": { status: "Exact QD-220 visual pending", placeholder: true },
  "pillow-packing-machine-paper-from-top": { status: "Exact top-feed frame visual pending", placeholder: true },
  "pillow-packing-machine-paper-from-bottom": { status: "Exact bottom-feed frame visual pending", placeholder: true },
  "full-servo-high-speed-heat-shrink-packing-machine": { status: "Exact QD-590 visual pending", placeholder: true },
  "automatic-filling-machine": { status: "Category reference visual", placeholder: false },
};

const HOME_DETAIL_COPY = {
  en: {
    guideCards: GUIDE_CARDS,
    applicationClusters: APPLICATION_CLUSTERS,
    specReferenceLines: SPEC_REFERENCE_LINES,
    form: ["Name", "Email", "Company", "Machine interest", "Product", "Target output", "Project notes"],
  },
  es: {
    guideCards: [
      ["Empiece por el producto", "Gránulos, polvos, salsas, té, kits y sólidos regulares requieren dosificación, sellado y manejo distintos."],
      ["Defina la economía del empaque", "El pouch terminado mejora la presencia en anaquel; VFFS y sachet suelen reducir el costo de film."],
      ["Fije el límite de automatización", "Una máquina resuelve el empaque primario; una línea añade alimentación, control, cartón, cajas y transporte."],
      ["Prepare un RFQ con evidencia", "Buenas cotizaciones necesitan fotos, muestras, peso, salida objetivo, voltaje, aire y espacio disponible."],
    ],
    applicationClusters: [
      ["Alimentos, snacks y granos", "Sistemas premade pouch, VFFS, vacío y llenado para arroz, frijoles, nueces, congelados, semillas y packs retail."],
      ["Polvos y sazonadores", "Opciones con sinfín, alimentación por tornillo y control de polvo para harina, leche en polvo, proteína, condimentos y químicos."],
      ["Té, café y bebidas", "Bolsas piramidales, té con hilo, drip coffee y sobres con sellado ultrasónico y dosificación pequeña."],
      ["Líquidos, salsas y pastas", "Sachets con bomba, pouches, PE film, tapado de pouch y líneas de llenado para aceites, salsas y químicos diarios."],
      ["Sólidos regulares y empaque secundario", "Flow pack, shrink, sobreenvoltura, cartón y cajas para multipacks retail y logística."],
      ["Hardware y piezas mixtas", "Conteo, multi-material, tornillos y kits con control de cantidad y mezcla de accesorios."],
    ],
    specReferenceLines: [
      ["Sistemas premade pouch", "Pouches terminados, rango W100-350mm y L150-480mm, hasta 60 bolsas/min en formatos pequeños seleccionados."],
      ["VFFS con film en rollo", "Tamaños aprox. L80-450mm y W80-350mm; báscula, vaso, sinfín o bomba según producto."],
      ["Sachet y stick pack", "Dosis pequeñas 1-100g; una línea, doble línea, multi-línea y esquinas redondas."],
      ["Té y drip coffee", "Formatos 1-15g con ultrasonido, sobre exterior, hilo/etiqueta, nitrógeno y precisión de dosis."],
      ["Flow pack y shrink", "Alimentación superior/inferior, movimiento reciprocante, pillow line y shrink para sólidos y grupos."],
      ["Llenado y final de línea", "Desde llenadoras semi-auto hasta líneas completas de gránulo, polvo, líquido, cartón y cajas."],
    ],
    form: ["Nombre", "Email", "Empresa", "Máquina de interés", "Producto", "Producción objetivo", "Notas del proyecto"],
  },
  fr: {
    guideCards: [
      ["Commencer par le produit", "Granulés, poudres, sauces, thé, kits et solides réguliers imposent des choix de dosage, scellage et convoyage."],
      ["Définir l'économie du pack", "Le sachet préformé valorise le rayon; VFFS et sachet réduisent souvent le coût du film."],
      ["Fixer le périmètre d'automation", "Une machine couvre le primaire; une ligne ajoute alimentation, contrôle, cartonnage, caisse et convoyage."],
      ["Construire le RFQ sur preuves", "Un devis utile demande photos, échantillons, poids, cadence, tension, air et espace disponible."],
    ],
    applicationClusters: [
      ["Aliments, snacks et céréales", "Systèmes pouch, VFFS, vide et remplissage pour riz, haricots, noix, surgelés, graines et packs retail."],
      ["Poudres et assaisonnements", "Vis sans fin, alimentation par vis et contrôle poussière pour farine, lait, protéines, épices et poudres chimiques."],
      ["Thé, café et boissons", "Sachets pyramide, fil/étiquette, drip coffee et enveloppes avec ultrason et petites doses précises."],
      ["Liquides, sauces et pâtes", "Sachets pompe, pouches, film PE, bouchage et lignes de remplissage pour huiles, sauces et produits chimiques courants."],
      ["Solides réguliers et secondaire", "Flow pack, shrink, suremballage, cartonnage et caisses pour multipacks retail et logistique."],
      ["Quincaillerie et pièces mixtes", "Comptage, multi-matière, visserie et kits avec contrôle quantité et accessoires mélangés."],
    ],
    specReferenceLines: [
      ["Systèmes pouch préformé", "Sachets finis, plage W100-350mm et L150-480mm, jusqu'à 60 sachets/min sur petits formats sélectionnés."],
      ["VFFS à film en rouleau", "Formats env. L80-450mm et W80-350mm; balance, godet, vis ou pompe selon produit."],
      ["Sachet et stick pack", "Petites doses 1-100g; une voie, double voie, multi-voies et coins arrondis."],
      ["Thé et drip coffee", "Formats 1-15g avec ultrason, enveloppe extérieure, fil/étiquette, azote et précision de dosage."],
      ["Flow pack et shrink", "Alimentation haut/bas, mouvement alternatif, ligne pillow et shrink pour solides et lots."],
      ["Remplissage et aval", "De la remplisseuse semi-auto aux lignes granulé, poudre, liquide, cartonnage et caisse."],
    ],
    form: ["Nom", "Email", "Entreprise", "Machine recherchée", "Produit", "Cadence cible", "Notes projet"],
  },
  de: {
    guideCards: [
      ["Mit dem Produkt beginnen", "Granulat, Pulver, Saucen, Tee, Kits und reguläre Feststoffe brauchen unterschiedliche Dosier-, Siegel- und Handlingkonzepte."],
      ["Packökonomie festlegen", "Fertigbeutel stärken die Regalwirkung; VFFS und Sachet senken oft die Folienkosten."],
      ["Automationsgrenze klären", "Eine Maschine löst Primärverpackung; eine Linie ergänzt Zuführung, Kontrolle, Karton, Case und Fördertechnik."],
      ["RFQ mit Fakten erstellen", "Gute Angebote benötigen Fotos, Muster, Gewicht, Zielleistung, Spannung, Druckluft und verfügbare Fläche."],
    ],
    applicationClusters: [
      ["Lebensmittel, Snacks und Getreide", "Pouch-, VFFS-, Vakuum- und Füllsysteme für Reis, Bohnen, Nüsse, Tiefkühlware, Saaten und Retail-Packs."],
      ["Pulver und Gewürze", "Schnecke, Zuführung und Staubkontrolle für Mehl, Milchpulver, Protein, Gewürze und chemische Pulver."],
      ["Tee, Kaffee und Getränke", "Pyramidenbeutel, Faden/Etikett, Drip Coffee und Umschläge mit Ultraschall und Kleindosierung."],
      ["Flüssigkeiten, Saucen und Pasten", "Pumpensachets, Pouches, PE-Film, Verschluss und Fülllinien für Öle, Saucen und Alltagschemie."],
      ["Regelmäßige Feststoffe und Sekundärpack", "Flowpack, Shrink, Overwrapping, Kartonierung und Cases für Retail-Multipacks und Logistik."],
      ["Hardware und gemischte Kleinteile", "Zählen, Multi-Material, Schrauben und Kits mit Mengen- und Zubehörkontrolle."],
    ],
    specReferenceLines: [
      ["Premade-Pouch-Systeme", "Fertigbeutel, Referenz W100-350mm und L150-480mm, bis 60 Beutel/min auf ausgewählten Kleinformaten."],
      ["VFFS Rollenfilm", "Format ca. L80-450mm und W80-350mm; Waage, Becher, Schnecke oder Pumpe je nach Produkt."],
      ["Sachet und Stickpack", "Kleindosen 1-100g; einbahnig, zweibahnig, mehrbahnig und Rund-Ecken-Optionen."],
      ["Tee und Drip Coffee", "1-15g Formate mit Ultraschall, Außenumschlag, Faden/Etikett, Stickstoff und Dosiergenauigkeit."],
      ["Flowpack und Shrink", "Top-/Bottom-Feed, Hubbewegung, Pillow-Linie und Shrink für Feststoffe und Gruppen."],
      ["Füllung und End-of-Line", "Von Semi-Auto-Füllern bis zu Granulat-, Pulver-, Flüssig-, Kartonier- und Case-Linien."],
    ],
    form: ["Name", "E-Mail", "Unternehmen", "Maschineninteresse", "Produkt", "Zielausstoß", "Projektnotizen"],
  },
  pt: {
    guideCards: [
      ["Comece pelo produto", "Grânulos, pós, molhos, chá, kits e sólidos regulares exigem dosagem, selagem e manuseio diferentes."],
      ["Defina a economia da embalagem", "Pouch pronto valoriza o varejo; VFFS e sachê normalmente reduzem custo de filme."],
      ["Fixe o limite de automação", "Uma máquina resolve a embalagem primária; uma linha adiciona alimentação, controle, cartucho, caixa e transporte."],
      ["Monte o RFQ com evidências", "Boas cotações precisam de fotos, amostras, peso, produção alvo, tensão, ar e área disponível."],
    ],
    applicationClusters: [
      ["Alimentos, snacks e grãos", "Sistemas pouch, VFFS, vácuo e envase para arroz, feijão, castanhas, congelados, sementes e packs de varejo."],
      ["Pós e temperos", "Rosca, alimentação por parafuso e controle de pó para farinha, leite em pó, proteína, temperos e químicos."],
      ["Chá, café e bebidas", "Sachês piramidais, fio/etiqueta, drip coffee e envelopes com ultrassom e pequenas doses precisas."],
      ["Líquidos, molhos e pastas", "Sachês com bomba, pouches, filme PE, tampas e linhas de envase para óleos, molhos e químicos diários."],
      ["Sólidos regulares e secundário", "Flow pack, shrink, sobreenvoltura, cartucho e caixas para multipacks e logística."],
      ["Hardware e peças mistas", "Contagem, multi-material, parafusos e kits com controle de quantidade e acessórios mistos."],
    ],
    specReferenceLines: [
      ["Sistemas premade pouch", "Pouches prontos, referência W100-350mm e L150-480mm, até 60 bolsas/min em pequenos formatos selecionados."],
      ["VFFS com filme em bobina", "Formato aprox. L80-450mm e W80-350mm; balança, copo, rosca ou bomba por produto."],
      ["Sachê e stick pack", "Pequenas doses 1-100g; uma linha, dupla linha, multilinhas e cantos arredondados."],
      ["Chá e drip coffee", "Formatos 1-15g com ultrassom, envelope externo, fio/etiqueta, nitrogênio e precisão."],
      ["Flow pack e shrink", "Alimentação superior/inferior, movimento alternado, linha pillow e shrink para sólidos e grupos."],
      ["Envase e final de linha", "De envasadoras semi-auto a linhas de grânulo, pó, líquido, cartucho e caixas."],
    ],
    form: ["Nome", "Email", "Empresa", "Máquina de interesse", "Produto", "Produção alvo", "Notas do projeto"],
  },
  ru: {
    guideCards: [
      ["Начните с продукта", "Гранулы, порошки, соусы, чай, наборы и твердые изделия требуют разных решений по дозированию, запайке и подаче."],
      ["Определите экономику упаковки", "Готовый пакет усиливает вид на полке; VFFS и саше часто снижают расход пленки."],
      ["Зафиксируйте границу автоматизации", "Одна машина закрывает первичную упаковку; линия добавляет подачу, контроль, короб, кейс и транспорт."],
      ["Соберите RFQ на фактах", "Для точного предложения нужны фото, образцы, вес дозы, целевая скорость, напряжение, воздух и площадь."],
    ],
    applicationClusters: [
      ["Еда, снеки и зерновые", "Pouch, VFFS, вакуум и фасовка для риса, бобов, орехов, заморозки, семян и розничных пакетов."],
      ["Порошки и специи", "Шнек, винтовая подача и пылеудаление для муки, молока, протеина, специй и химических порошков."],
      ["Чай, кофе и напитки", "Пирамидальные пакеты, нить/ярлык, drip coffee и конверты с ультразвуком и малой дозой."],
      ["Жидкости, соусы и пасты", "Саше с насосом, pouches, PE-пленка, укупорка и линии розлива для масел, соусов и бытовой химии."],
      ["Регулярные твердые продукты", "Flow pack, shrink, overwrap, картонатор и короба для retail multipack и логистики."],
      ["Метизы и смешанные детали", "Счет, multi-material, винты и наборы с контролем количества и смешанных аксессуаров."],
    ],
    specReferenceLines: [
      ["Системы premade pouch", "Готовые пакеты, ориентир W100-350mm и L150-480mm, до 60 пакетов/мин на малых форматах."],
      ["VFFS с рулонной пленкой", "Размер около L80-450mm и W80-350mm; весы, стакан, шнек или насос по продукту."],
      ["Саше и stick pack", "Малые дозы 1-100g; одна линия, двойная линия, мультилиния и круглые углы."],
      ["Чай и drip coffee", "Форматы 1-15g с ультразвуком, внешним конвертом, нитью/ярлыком, азотом и точностью."],
      ["Flow pack и shrink", "Верхняя/нижняя подача, возвратно-поступательное движение, pillow line и shrink для твердых продуктов."],
      ["Фасовка и конец линии", "От полуавтоматических дозаторов до линий гранул, порошков, жидкостей, картонов и коробов."],
    ],
    form: ["Имя", "Email", "Компания", "Интересующая машина", "Продукт", "Целевая скорость", "Заметки проекта"],
  },
  ar: {
    guideCards: [
      ["ابدأ من المنتج", "الحبيبات والمساحيق والصلصات والشاي والأطقم والمواد الصلبة تحتاج جرعات ولحام ومناولة مختلفة."],
      ["حدد اقتصاد العبوة", "الكيس الجاهز يعزز مظهر البيع، بينما VFFS والساشيه يخفضان غالباً تكلفة الفيلم."],
      ["حدد مستوى الأتمتة", "آلة واحدة تغطي التعبئة الأولية، والخط يضيف التغذية والفحص والكرتنة والصناديق والنقل."],
      ["ابن RFQ على بيانات", "العرض الدقيق يحتاج صوراً، عينات، وزن تعبئة، إنتاجية، جهد، هواء مضغوط ومساحة متاحة."],
    ],
    applicationClusters: [
      ["الأغذية والسناكس والحبوب", "أنظمة pouch وVFFS والفاكيوم والتعبئة للأرز، البقول، المكسرات، المجمدات، البذور وعبوات التجزئة."],
      ["المساحيق والتوابل", "لولب، تغذية بالبرغي وتحكم بالغبار للدقيق، الحليب، البروتين، التوابل والمساحيق الكيميائية."],
      ["الشاي والقهوة والمشروبات", "أكياس هرمية، خيط/بطاقة، drip coffee وأظرف مع لحام فوق صوتي وجرعات صغيرة دقيقة."],
      ["السوائل والصلصات والمعاجين", "ساشيه بمضخة، pouches، فيلم PE، أغطية وخطوط تعبئة للزيوت والصلصات والمواد اليومية."],
      ["مواد صلبة وتغليف ثانوي", "Flow pack وshrink وoverwrap والكرتنة والصناديق لعبوات التجزئة واللوجستيات."],
      ["المعادن والقطع المختلطة", "عد، multi-material، براغي وأطقم مع تحكم في الكمية والملحقات المختلطة."],
    ],
    specReferenceLines: [
      ["أنظمة premade pouch", "أكياس جاهزة، مرجع W100-350mm وL150-480mm، حتى 60 كيس/دقيقة في بعض الأحجام الصغيرة."],
      ["VFFS بفيلم رول", "حجم تقريبي L80-450mm وW80-350mm؛ ميزان، كوب، لولب أو مضخة حسب المنتج."],
      ["ساشيه وstick pack", "جرعات صغيرة 1-100g؛ خط واحد، خط مزدوج، خطوط متعددة وخيار الزوايا الدائرية."],
      ["الشاي وdrip coffee", "أحجام 1-15g مع لحام فوق صوتي، ظرف خارجي، خيط/بطاقة، نيتروجين ودقة جرعة."],
      ["Flow pack وshrink", "تغذية علوية/سفلية، حركة ترددية، خط pillow وshrink للمواد الصلبة والمجموعات."],
      ["التعبئة ونهاية الخط", "من آلات نصف أوتوماتيكية إلى خطوط حبيبات، مساحيق، سوائل، كرتنة وصناديق."],
    ],
    form: ["الاسم", "البريد الإلكتروني", "الشركة", "الآلة المطلوبة", "المنتج", "الإنتاجية المطلوبة", "ملاحظات المشروع"],
  },
};

const EXPERIENCE_COPY = {
  en: {
    skip: "Skip to main content",
    navSolutions: "Solutions",
    navResources: "Resources",
    navAbout: "About",
    proofLabel: "Four inputs before machine selection",
    proof: [
      ["01", "Product behavior", "Flow, dust, viscosity, fragility or part geometry"],
      ["02", "Finished pack", "Pouch or film structure, size, closure and presentation"],
      ["03", "Good output", "Accepted packs per hour, accuracy, rejects and changeovers"],
      ["04", "Acceptance", "Samples, run duration, seal tests, utilities and FAT limits"],
    ],
    selectorLabels: ["Package basis", "Dosing path", "Where it fits", "Evidence to confirm"],
    selectorModes: {
      pouch: ["Finished pouch / zipper / shaped", "Scale, auger, pump or counting", "Retail formats with a qualified pouch supply", "Final pouches, product samples, fill range and good-output target"],
      vffs: ["Roll film / pillow / gusset", "Scale, auger, cup or pump", "Film economy and continuous bag production", "Film structure, bag drawing, product behavior and seal window"],
      specialty: ["Tea, coffee, sachet, vacuum or end-of-line", "Application-specific modules", "Projects defined by a specialist pack or downstream task", "Complete process, interfaces, utilities and measurable acceptance criteria"],
    },
    form: {
      country: "Country / region",
      phone: "Phone / WhatsApp (optional)",
      package: "Pouch or package format",
      fill: "Fill weight or volume",
      dimensions: "Pack dimensions",
      consent: "I understand that my inquiry details will be processed as described in the privacy notice. This is not a marketing subscription.",
      privacy: "Read the privacy notice",
      requiredNote: "Required first-step details: product, package, fill amount, target output, country and contact.",
      send: "Send RFQ",
      sending: "Preparing RFQ…",
      success: "RFQ received. Keep the reference shown for follow-up.",
      mailto: "Your email application is opening with the RFQ prepared. Review it and press Send.",
      failed: "Direct delivery is unavailable, so an email draft has been prepared.",
      blocked: "Please review the required fields and try again.",
    },
  },
  es: {
    skip: "Saltar al contenido principal", navSolutions: "Soluciones", navResources: "Recursos", navAbout: "Empresa",
    proofLabel: "Cuatro datos antes de seleccionar la máquina",
    proof: [["01", "Comportamiento", "Fluidez, polvo, viscosidad, fragilidad o geometría"], ["02", "Empaque final", "Material, tamaño, cierre y presentación"], ["03", "Producción útil", "Packs aceptados, precisión, rechazos y cambios"], ["04", "Aceptación", "Muestras, duración, sellos, servicios y límites FAT"]],
    selectorLabels: ["Base del empaque", "Ruta de dosificación", "Dónde encaja", "Evidencia por confirmar"],
    selectorModes: {
      pouch: ["Pouch terminado / zipper / formato especial", "Báscula, sinfín, bomba o conteo", "Formatos retail con pouch calificado", "Pouches finales, muestras, rango de llenado y producción útil"],
      vffs: ["Film en rollo / pillow / fuelle", "Báscula, sinfín, vaso o bomba", "Economía de film y producción continua", "Estructura del film, plano de bolsa, producto y ventana de sellado"],
      specialty: ["Té, café, sachet, vacío o final de línea", "Módulos según aplicación", "Proyectos definidos por formato o proceso especial", "Proceso completo, interfaces, servicios y criterios medibles"],
    },
    form: { country: "País / región", phone: "Teléfono / WhatsApp (opcional)", package: "Formato de pouch o empaque", fill: "Peso o volumen de llenado", dimensions: "Dimensiones del empaque", consent: "Entiendo que los datos de mi consulta se tratarán como se describe en el aviso de privacidad. No es una suscripción de marketing.", privacy: "Leer el aviso de privacidad (inglés)", requiredNote: "Datos iniciales requeridos: producto, empaque, cantidad, producción, país y contacto.", send: "Enviar RFQ", sending: "Preparando RFQ…", success: "RFQ recibido. Conserve la referencia para el seguimiento.", mailto: "Se abre su correo con el RFQ preparado. Revíselo y pulse Enviar.", failed: "La entrega directa no está disponible; se preparó un borrador de correo.", blocked: "Revise los campos obligatorios e inténtelo de nuevo." },
  },
  fr: {
    skip: "Aller au contenu principal", navSolutions: "Solutions", navResources: "Ressources", navAbout: "Société",
    proofLabel: "Quatre données avant le choix machine",
    proof: [["01", "Comportement produit", "Écoulement, poussière, viscosité, fragilité ou géométrie"], ["02", "Pack fini", "Structure, dimensions, fermeture et présentation"], ["03", "Débit utile", "Packs acceptés, précision, rejets et changements"], ["04", "Réception", "Échantillons, durée, scellage, utilités et limites FAT"]],
    selectorLabels: ["Base du pack", "Mode de dosage", "Domaine adapté", "Preuves à confirmer"],
    selectorModes: {
      pouch: ["Sachet fini / zip / forme spéciale", "Balance, vis, pompe ou comptage", "Formats retail avec sachet qualifié", "Sachets finaux, échantillons, plage de dose et débit utile"],
      vffs: ["Film rouleau / coussin / soufflet", "Balance, vis, godet ou pompe", "Économie de film et production continue", "Structure film, plan du sachet, produit et fenêtre de scellage"],
      specialty: ["Thé, café, sachet, vide ou fin de ligne", "Modules propres à l'application", "Projets définis par un pack ou une étape spécialisée", "Process complet, interfaces, utilités et critères mesurables"],
    },
    form: { country: "Pays / région", phone: "Téléphone / WhatsApp (facultatif)", package: "Format du sachet ou pack", fill: "Poids ou volume de remplissage", dimensions: "Dimensions du pack", consent: "Je comprends que les données de ma demande seront traitées comme décrit dans l'avis de confidentialité. Ce n'est pas un abonnement marketing.", privacy: "Lire l'avis de confidentialité (anglais)", requiredNote: "Données initiales requises : produit, pack, dose, cadence, pays et contact.", send: "Envoyer le RFQ", sending: "Préparation du RFQ…", success: "RFQ reçu. Conservez la référence pour le suivi.", mailto: "Votre messagerie s'ouvre avec le RFQ préparé. Vérifiez puis envoyez.", failed: "L'envoi direct est indisponible ; un brouillon d'e-mail a été préparé.", blocked: "Vérifiez les champs obligatoires puis réessayez." },
  },
  de: {
    skip: "Zum Hauptinhalt springen", navSolutions: "Lösungen", navResources: "Ressourcen", navAbout: "Unternehmen",
    proofLabel: "Vier Angaben vor der Maschinenauswahl",
    proof: [["01", "Produktverhalten", "Fluss, Staub, Viskosität, Empfindlichkeit oder Geometrie"], ["02", "Fertigpackung", "Material, Größe, Verschluss und Präsentation"], ["03", "Gutausstoß", "Akzeptierte Packs, Genauigkeit, Ausschuss und Wechsel"], ["04", "Abnahme", "Muster, Laufzeit, Siegeltests, Medien und FAT-Grenzen"]],
    selectorLabels: ["Packungsbasis", "Dosierweg", "Einsatzbereich", "Zu bestätigende Daten"],
    selectorModes: {
      pouch: ["Fertigbeutel / Zipper / Sonderform", "Waage, Schnecke, Pumpe oder Zählen", "Retail-Formate mit qualifiziertem Beutel", "Finale Beutel, Produktmuster, Füllbereich und Gutausstoß"],
      vffs: ["Rollenfolie / Kissen / Seitenfalte", "Waage, Schnecke, Becher oder Pumpe", "Folienökonomie und kontinuierliche Produktion", "Folienaufbau, Beutelzeichnung, Produkt und Siegelfenster"],
      specialty: ["Tee, Kaffee, Sachet, Vakuum oder End-of-Line", "Anwendungsspezifische Module", "Projekte mit Spezialpackung oder Folgeschritt", "Gesamtprozess, Schnittstellen, Medien und messbare Abnahme"],
    },
    form: { country: "Land / Region", phone: "Telefon / WhatsApp (optional)", package: "Beutel- oder Packungsformat", fill: "Füllgewicht oder Volumen", dimensions: "Packungsabmessungen", consent: "Ich verstehe, dass meine Anfragedaten wie im Datenschutzhinweis beschrieben verarbeitet werden. Keine Marketing-Anmeldung.", privacy: "Datenschutzhinweis lesen (Englisch)", requiredNote: "Erforderlich: Produkt, Packung, Füllmenge, Zielleistung, Land und Kontakt.", send: "RFQ senden", sending: "RFQ wird vorbereitet…", success: "RFQ empfangen. Referenz für Rückfragen aufbewahren.", mailto: "Ihr E-Mail-Programm öffnet den vorbereiteten RFQ. Prüfen und senden Sie ihn.", failed: "Direkte Zustellung ist nicht verfügbar; ein E-Mail-Entwurf wurde vorbereitet.", blocked: "Bitte Pflichtfelder prüfen und erneut versuchen." },
  },
  pt: {
    skip: "Ir para o conteúdo principal", navSolutions: "Soluções", navResources: "Recursos", navAbout: "Empresa",
    proofLabel: "Quatro dados antes de escolher a máquina",
    proof: [["01", "Comportamento", "Fluxo, pó, viscosidade, fragilidade ou geometria"], ["02", "Embalagem final", "Estrutura, tamanho, fechamento e apresentação"], ["03", "Produção útil", "Packs aceitos, precisão, rejeitos e trocas"], ["04", "Aceitação", "Amostras, duração, selagem, utilidades e limites FAT"]],
    selectorLabels: ["Base da embalagem", "Rota de dosagem", "Onde se aplica", "Evidência a confirmar"],
    selectorModes: {
      pouch: ["Pouch pronto / zíper / formato especial", "Balança, rosca, bomba ou contagem", "Formatos de varejo com pouch qualificado", "Pouches finais, amostras, faixa de envase e produção útil"],
      vffs: ["Filme em bobina / pillow / fole", "Balança, rosca, copo ou bomba", "Economia de filme e produção contínua", "Estrutura do filme, desenho, produto e janela de selagem"],
      specialty: ["Chá, café, sachê, vácuo ou final de linha", "Módulos por aplicação", "Projetos definidos por embalagem ou etapa especial", "Processo completo, interfaces, utilidades e critérios mensuráveis"],
    },
    form: { country: "País / região", phone: "Telefone / WhatsApp (opcional)", package: "Formato do pouch ou embalagem", fill: "Peso ou volume de envase", dimensions: "Dimensões da embalagem", consent: "Entendo que os dados da minha consulta serão tratados conforme descrito no aviso de privacidade. Não é uma inscrição de marketing.", privacy: "Ler aviso de privacidade (inglês)", requiredNote: "Dados iniciais obrigatórios: produto, embalagem, quantidade, produção, país e contato.", send: "Enviar RFQ", sending: "Preparando RFQ…", success: "RFQ recebido. Guarde a referência para acompanhamento.", mailto: "Seu e-mail abrirá com o RFQ preparado. Revise e envie.", failed: "A entrega direta está indisponível; um rascunho de e-mail foi preparado.", blocked: "Revise os campos obrigatórios e tente novamente." },
  },
  ru: {
    skip: "Перейти к основному содержанию", navSolutions: "Решения", navResources: "Материалы", navAbout: "О проекте",
    proofLabel: "Четыре входных данных до выбора машины",
    proof: [["01", "Свойства продукта", "Сыпучесть, пыль, вязкость, хрупкость или геометрия"], ["02", "Готовая упаковка", "Структура, размер, закрытие и внешний вид"], ["03", "Годный выпуск", "Принятые пачки, точность, брак и переналадки"], ["04", "Приемка", "Образцы, длительность, швы, ресурсы и пределы FAT"]],
    selectorLabels: ["Основа упаковки", "Способ дозирования", "Область применения", "Что подтвердить"],
    selectorModes: {
      pouch: ["Готовый пакет / zipper / фигурный", "Весы, шнек, насос или счет", "Розничные форматы с согласованным пакетом", "Финальные пакеты, продукт, диапазон дозы и годный выпуск"],
      vffs: ["Рулонная пленка / pillow / gusset", "Весы, шнек, стакан или насос", "Экономия пленки и непрерывный выпуск", "Структура пленки, чертеж, продукт и окно запайки"],
      specialty: ["Чай, кофе, саше, вакуум или конец линии", "Модули по применению", "Проекты со специальной упаковкой или операцией", "Полный процесс, интерфейсы, ресурсы и измеримые критерии"],
    },
    form: { country: "Страна / регион", phone: "Телефон / WhatsApp (необязательно)", package: "Формат пакета или упаковки", fill: "Вес или объем дозы", dimensions: "Размеры упаковки", consent: "Я понимаю, что данные запроса будут обработаны, как описано в уведомлении о конфиденциальности. Это не маркетинговая подписка.", privacy: "Уведомление о конфиденциальности (английский)", requiredNote: "Нужны: продукт, упаковка, доза, выпуск, страна и контакт.", send: "Отправить RFQ", sending: "Подготовка RFQ…", success: "RFQ получен. Сохраните номер для связи.", mailto: "Открывается почта с подготовленным RFQ. Проверьте и отправьте.", failed: "Прямая отправка недоступна; подготовлен черновик письма.", blocked: "Проверьте обязательные поля и повторите." },
  },
  ar: {
    skip: "الانتقال إلى المحتوى الرئيسي", navSolutions: "الحلول", navResources: "الموارد", navAbout: "عن الموقع",
    proofLabel: "أربع بيانات قبل اختيار الآلة",
    proof: [["01", "سلوك المنتج", "التدفق والغبار واللزوجة والهشاشة أو شكل القطعة"], ["02", "العبوة النهائية", "التركيب والحجم والإغلاق والمظهر"], ["03", "الإنتاج المقبول", "العبوات الجيدة والدقة والرفض وتغيير المقاس"], ["04", "القبول", "العينات ومدة التشغيل واللحام والمرافق وحدود FAT"]],
    selectorLabels: ["أساس العبوة", "مسار الجرعات", "الاستخدام المناسب", "البيانات المطلوبة"],
    selectorModes: {
      pouch: ["كيس جاهز / سحاب / شكل خاص", "ميزان أو لولب أو مضخة أو عد", "عبوات تجزئة مع كيس نهائي مؤهل", "الأكياس النهائية والعينات ونطاق التعبئة والإنتاج الجيد"],
      vffs: ["فيلم رول / pillow / gusset", "ميزان أو لولب أو كوب أو مضخة", "اقتصاد الفيلم والإنتاج المستمر", "تركيب الفيلم ورسم الكيس وسلوك المنتج ونافذة اللحام"],
      specialty: ["شاي أو قهوة أو ساشيه أو فاكيوم أو نهاية خط", "وحدات حسب التطبيق", "مشروعات يحددها شكل خاص أو خطوة لاحقة", "العملية الكاملة والواجهات والمرافق ومعايير قبول قابلة للقياس"],
    },
    form: { country: "الدولة / المنطقة", phone: "الهاتف / واتساب (اختياري)", package: "شكل الكيس أو العبوة", fill: "وزن أو حجم التعبئة", dimensions: "أبعاد العبوة", consent: "أفهم أن بيانات الاستفسار ستعالج كما هو موضح في إشعار الخصوصية، وليست اشتراكاً تسويقياً.", privacy: "قراءة إشعار الخصوصية (بالإنجليزية)", requiredNote: "المطلوب أولاً: المنتج والعبوة والكمية والإنتاجية والدولة ووسيلة الاتصال.", send: "إرسال RFQ", sending: "جارٍ إعداد RFQ…", success: "تم استلام RFQ. احتفظ بالرقم للمتابعة.", mailto: "سيُفتح بريدك مع RFQ جاهز. راجعه ثم اضغط إرسال.", failed: "الإرسال المباشر غير متاح، لذلك تم إعداد مسودة بريد.", blocked: "راجع الحقول المطلوبة وحاول مرة أخرى." },
  },
};

function experienceFor(langCode) {
  return EXPERIENCE_COPY[langCode] || EXPERIENCE_COPY.en;
}

const UI_COPY = {
  en: {
    breadcrumb: "Breadcrumb",
    categoryScope: "Category scope",
    catalogStats: "Machine catalog statistics",
    conversionActions: "Conversion actions",
    keyCapabilities: "Key machine capabilities",
    directContact: "Direct contact channels",
    copyEmail: "Copy email address",
    copy: "Copy",
    copyHint: "Click to copy",
    instantChat: "Instant chat",
    quickContact: "Quick contact",
    chat: "Chat",
    search: "Search",
    searchPlaceholder: "Search machine, product, format or application",
    machinePagesAvailable: (count) => `${count} machine pages available.`,
    buyerResources: "Buyer resources",
    trustContact: "Trust & contact",
    about: "About",
    editorial: "Editorial policy",
    privacy: "Privacy notice",
    privacyEnglish: "Privacy notice (English)",
    footerStatement: "Buyer-oriented machine catalog. Final performance requires samples and acceptance testing.",
    noScriptTitle: "JavaScript is unavailable.",
    noScriptBody: "Use email or WhatsApp for the RFQ. Do not submit the form below because direct web delivery requires JavaScript.",
    lineFlow: LINE_FLOW_STEPS,
    faq: FAQ_ITEMS,
  },
  es: {
    breadcrumb: "Ruta de navegación",
    categoryScope: "Alcance de la categoría",
    catalogStats: "Datos del catálogo de máquinas",
    conversionActions: "Acciones de contacto",
    keyCapabilities: "Capacidades principales",
    directContact: "Canales de contacto directo",
    copyEmail: "Copiar dirección de email",
    copy: "Copiar",
    copyHint: "Haga clic para copiar",
    instantChat: "Chat inmediato",
    quickContact: "Contacto rápido",
    chat: "Chat",
    search: "Buscar",
    searchPlaceholder: "Buscar máquina, producto, formato o aplicación",
    machinePagesAvailable: (count) => `${count} páginas de máquinas disponibles.`,
    buyerResources: "Recursos para compradores",
    trustContact: "Confianza y contacto",
    about: "Acerca del sitio",
    editorial: "Política editorial",
    privacy: "Aviso de privacidad",
    privacyEnglish: "Aviso de privacidad (inglés)",
    footerStatement: "Catálogo para compradores. El rendimiento final requiere muestras y pruebas de aceptación.",
    noScriptTitle: "JavaScript no está disponible.",
    noScriptBody: "Use email o WhatsApp para el RFQ. No envíe el formulario inferior porque la entrega web directa requiere JavaScript.",
    lineFlow: [
      { step: "01", title: "Alimentación del producto", text: "Elevador, transportador de tornillo, alimentador vibratorio o carga manual según fluidez e higiene." },
      { step: "02", title: "Dosificación y llenado", text: "Báscula multicabezal o lineal, sinfín, vaso, bomba o conteo según la precisión requerida." },
      { step: "03", title: "Empaque primario", text: "Pouch terminado, film VFFS, sachet, bolsa de té, flow pack, vacío, vaso, botella o cartón." },
      { step: "04", title: "Sellar, codificar y verificar", text: "Sellado térmico o ultrasónico, vacío, nitrógeno, fecha, control de peso y rechazo." },
      { step: "05", title: "Empaque secundario", text: "Encartonado, agrupado shrink, sobreenvoltura, formado, llenado y sellado de cajas." },
      { step: "06", title: "Evidencia para RFQ", text: "Fotos, muestras, peso, producción objetivo, voltaje, aire y layout definen el alcance final." },
    ],
    faq: [
      ["¿Qué máquina debemos cotizar primero?", "Empiece por el comportamiento del producto, el formato y la producción útil. Un pouch terminado suele llevar a equipo rotativo; el menor costo de film suele llevar a VFFS o sachet."],
      ["¿Qué muestras se necesitan para probar?", "Envíe fotos, peso de llenado, densidad o viscosidad, muestras de pouch o film, estilo de sellado y tamaños de cartón o caja."],
      ["¿Una línea puede procesar productos distintos?", "Sí, cuando el comportamiento y el tamaño quedan dentro del mismo rango mecánico. Dosificador, formadores, ancho y mordazas fijan el límite de cambio."],
      ["¿Qué cambia el plazo y el precio?", "Familia de máquina, precisión, materiales de contacto, codificación, nitrógeno, vacío, polvo, control de peso, cartón, cajas y cumplimiento local."],
      ["¿Cómo comparar pouch, VFFS y sachet?", "Compare valor del pack, costo de film o pouch, producción útil, desperdicio, operadores y cambios. El menor precio de máquina rara vez es el menor costo de línea."],
      ["¿Qué evita retrabajo tras la oferta?", "Confirme producto, producción, dimensiones, tolerancia, voltaje, aire, espacio, sentido del transportador y muestras de aceptación antes de cerrar la configuración."],
    ],
  },
  fr: {
    breadcrumb: "Fil d’Ariane",
    categoryScope: "Périmètre de la catégorie",
    catalogStats: "Données du catalogue machines",
    conversionActions: "Actions de contact",
    keyCapabilities: "Capacités principales",
    directContact: "Canaux de contact direct",
    copyEmail: "Copier l’adresse e-mail",
    copy: "Copier",
    copyHint: "Cliquer pour copier",
    instantChat: "Chat immédiat",
    quickContact: "Contact rapide",
    chat: "Chat",
    search: "Rechercher",
    searchPlaceholder: "Rechercher machine, produit, format ou application",
    machinePagesAvailable: (count) => `${count} pages machines disponibles.`,
    buyerResources: "Ressources acheteurs",
    trustContact: "Confiance et contact",
    about: "À propos",
    editorial: "Politique éditoriale",
    privacy: "Avis de confidentialité",
    privacyEnglish: "Avis de confidentialité (anglais)",
    footerStatement: "Catalogue pour acheteurs. Les performances finales exigent des échantillons et des essais de réception.",
    noScriptTitle: "JavaScript n’est pas disponible.",
    noScriptBody: "Utilisez l’e-mail ou WhatsApp pour le RFQ. N’envoyez pas le formulaire ci-dessous : la remise web directe nécessite JavaScript.",
    lineFlow: [
      { step: "01", title: "Alimentation produit", text: "Élévateur, vis, bol vibrant ou chargement manuel selon l’écoulement et l’hygiène." },
      { step: "02", title: "Dosage et remplissage", text: "Peseuse multi-têtes ou linéaire, vis, godet, pompe ou comptage selon la précision cible." },
      { step: "03", title: "Emballage primaire", text: "Sachet fini, film VFFS, sachet-dose, thé, flow pack, vide, gobelet, bouteille ou carton." },
      { step: "04", title: "Sceller, coder et contrôler", text: "Thermoscellage ou ultrason, vide, azote, datage, contrôle pondéral et rejet." },
      { step: "05", title: "Emballage secondaire", text: "Cartonnage, fardelage, suremballage, formage, remplissage et fermeture des caisses." },
      { step: "06", title: "Preuves pour le RFQ", text: "Photos, échantillons, dose, cadence, tension, air et implantation fixent le périmètre final." },
    ],
    faq: [
      ["Quelle machine chiffrer d’abord ?", "Commencez par le comportement produit, le format et le débit utile. Un sachet fini oriente souvent vers une rotative ; l’économie de film vers VFFS ou sachet-dose."],
      ["Quels échantillons faut-il tester ?", "Envoyez photos, dose, densité ou viscosité, sachets ou film, type de scellage et dimensions des cartons ou caisses."],
      ["Une ligne peut-elle traiter plusieurs produits ?", "Oui si comportement et dimensions restent dans la même plage mécanique. Doseur, pièces de format, largeur et mâchoires fixent la limite de changement."],
      ["Qu’est-ce qui modifie délai et prix ?", "Famille machine, précision, matériaux en contact, codage, azote, vide, poussière, contrôle pondéral, cartonnage, caisses et exigences locales."],
      ["Comment comparer sachet fini, VFFS et sachet-dose ?", "Comparez valeur du pack, coût matière, débit utile, déchets, opérateurs et changements. Le prix machine le plus bas est rarement le coût de ligne le plus bas."],
      ["Comment éviter les reprises après devis ?", "Confirmez produit, cadence, dimensions, tolérance, tension, air, encombrement, sens du convoyeur et échantillons de réception avant de figer la configuration."],
    ],
  },
  de: {
    breadcrumb: "Brotkrümelnavigation",
    categoryScope: "Kategorieumfang",
    catalogStats: "Daten zum Maschinenkatalog",
    conversionActions: "Kontaktaktionen",
    keyCapabilities: "Wichtige Maschinenfunktionen",
    directContact: "Direkte Kontaktwege",
    copyEmail: "E-Mail-Adresse kopieren",
    copy: "Kopieren",
    copyHint: "Zum Kopieren anklicken",
    instantChat: "Direkt-Chat",
    quickContact: "Schnellkontakt",
    chat: "Chat",
    search: "Suchen",
    searchPlaceholder: "Maschine, Produkt, Format oder Anwendung suchen",
    machinePagesAvailable: (count) => `${count} Maschinenseiten verfügbar.`,
    buyerResources: "Ressourcen für Käufer",
    trustContact: "Vertrauen & Kontakt",
    about: "Über das Projekt",
    editorial: "Redaktionsrichtlinie",
    privacy: "Datenschutzhinweis",
    privacyEnglish: "Datenschutzhinweis (Englisch)",
    footerStatement: "Käuferorientierter Maschinenkatalog. Endleistung erfordert Muster und Abnahmetests.",
    noScriptTitle: "JavaScript ist nicht verfügbar.",
    noScriptBody: "Nutzen Sie E-Mail oder WhatsApp für die RFQ. Senden Sie das Formular unten nicht ab; die direkte Webzustellung benötigt JavaScript.",
    lineFlow: [
      { step: "01", title: "Produktzuführung", text: "Elevator, Schneckenförderer, Vibrationsförderer oder manuelle Aufgabe nach Fließverhalten und Hygiene." },
      { step: "02", title: "Dosieren und Füllen", text: "Mehrkopf- oder Linearwaage, Schnecke, Becher, Pumpe oder Zählmodul passend zur Zielgenauigkeit." },
      { step: "03", title: "Primärverpackung", text: "Fertigbeutel, VFFS-Folie, Sachet, Teebeutel, Flowpack, Vakuum, Becher, Flasche oder Karton." },
      { step: "04", title: "Siegeln, Codieren, Prüfen", text: "Heiß- oder Ultraschallsiegeln, Vakuum, Stickstoff, Datierung, Kontrollwaage und Ausschleusung." },
      { step: "05", title: "Sekundärverpackung", text: "Kartonieren, Schrumpfbündeln, Umverpacken sowie Aufrichten, Packen und Verschließen von Cases." },
      { step: "06", title: "RFQ-Nachweise", text: "Fotos, Muster, Füllmenge, Gutausstoß, Spannung, Luft und Layout bestimmen den Endumfang." },
    ],
    faq: [
      ["Welche Maschine zuerst anfragen?", "Beginnen Sie mit Produktverhalten, Packformat und Gutausstoß. Fertigbeutel führen oft zur Rotationsmaschine; Folienökonomie eher zu VFFS oder Sachet."],
      ["Welche Muster werden benötigt?", "Senden Sie Fotos, Füllmenge, Dichte oder Viskosität, Beutel- oder Folienmuster, Siegelart sowie Karton- oder Case-Maße."],
      ["Kann eine Linie mehrere Produkte fahren?", "Ja, wenn Verhalten und Format im gleichen mechanischen Bereich bleiben. Dosierung, Formatteile, Breite und Siegelbacken setzen die Wechselgrenze."],
      ["Was beeinflusst Lieferzeit und Preis?", "Maschinenfamilie, Genauigkeit, Kontaktmaterialien, Codierung, Stickstoff, Vakuum, Staub, Kontrollwaage, Kartonierung, Case-Packing und lokale Anforderungen."],
      ["Wie werden Fertigbeutel, VFFS und Sachet verglichen?", "Vergleichen Sie Packwert, Materialkosten, Gutausstoß, Ausschuss, Bediener und Wechsel. Der niedrigste Maschinenpreis ist selten der niedrigste Linienpreis."],
      ["Was verhindert Nacharbeit nach dem Angebot?", "Produkt, Leistung, Maße, Toleranz, Spannung, Luft, Stellfläche, Förderrichtung und Abnahmemuster vor der Endkonfiguration bestätigen."],
    ],
  },
  pt: {
    breadcrumb: "Navegação estrutural",
    categoryScope: "Escopo da categoria",
    catalogStats: "Dados do catálogo de máquinas",
    conversionActions: "Ações de contato",
    keyCapabilities: "Capacidades principais",
    directContact: "Canais de contato direto",
    copyEmail: "Copiar endereço de email",
    copy: "Copiar",
    copyHint: "Clique para copiar",
    instantChat: "Chat imediato",
    quickContact: "Contato rápido",
    chat: "Chat",
    search: "Buscar",
    searchPlaceholder: "Buscar máquina, produto, formato ou aplicação",
    machinePagesAvailable: (count) => `${count} páginas de máquinas disponíveis.`,
    buyerResources: "Recursos para compradores",
    trustContact: "Confiança e contato",
    about: "Sobre o site",
    editorial: "Política editorial",
    privacy: "Aviso de privacidade",
    privacyEnglish: "Aviso de privacidade (inglês)",
    footerStatement: "Catálogo para compradores. O desempenho final exige amostras e testes de aceitação.",
    noScriptTitle: "JavaScript não está disponível.",
    noScriptBody: "Use email ou WhatsApp para o RFQ. Não envie o formulário abaixo; a entrega direta pela web requer JavaScript.",
    lineFlow: [
      { step: "01", title: "Alimentação do produto", text: "Elevador, rosca, alimentador vibratório ou carga manual conforme fluxo e higiene." },
      { step: "02", title: "Dosagem e envase", text: "Balança multicabeçal ou linear, rosca, copo, bomba ou contagem conforme a precisão." },
      { step: "03", title: "Embalagem primária", text: "Pouch pronto, filme VFFS, sachê, chá, flow pack, vácuo, copo, garrafa ou cartucho." },
      { step: "04", title: "Selar, codificar e verificar", text: "Selagem térmica ou ultrassônica, vácuo, nitrogênio, data, controle de peso e rejeição." },
      { step: "05", title: "Embalagem secundária", text: "Cartonagem, shrink, sobreenvoltura, formação, encaixotamento e selagem de caixas." },
      { step: "06", title: "Evidência para RFQ", text: "Fotos, amostras, dose, produção, tensão, ar e layout definem o escopo final." },
    ],
    faq: [
      ["Qual máquina devemos cotar primeiro?", "Comece pelo comportamento do produto, formato e produção útil. Pouch pronto costuma indicar rotativa; economia de filme, VFFS ou sachê."],
      ["Quais amostras são necessárias?", "Envie fotos, dose, densidade ou viscosidade, pouch ou filme, tipo de selagem e dimensões de cartuchos ou caixas."],
      ["Uma linha pode processar produtos diferentes?", "Sim, se comportamento e tamanho ficarem no mesmo intervalo mecânico. Dosagem, formatadores, largura e mordentes definem o limite de troca."],
      ["O que altera prazo e preço?", "Família da máquina, precisão, materiais de contato, codificação, nitrogênio, vácuo, pó, controle de peso, cartonagem, caixas e requisitos locais."],
      ["Como comparar pouch, VFFS e sachê?", "Compare valor da embalagem, custo de material, produção útil, perdas, operadores e trocas. O menor preço de máquina raramente é o menor custo de linha."],
      ["O que evita retrabalho após a proposta?", "Confirme produto, produção, dimensões, tolerância, tensão, ar, espaço, sentido do transportador e amostras de aceitação antes da configuração final."],
    ],
  },
  ru: {
    breadcrumb: "Навигационная цепочка",
    categoryScope: "Границы категории",
    catalogStats: "Данные каталога машин",
    conversionActions: "Способы связи",
    keyCapabilities: "Ключевые возможности",
    directContact: "Прямые каналы связи",
    copyEmail: "Скопировать адрес электронной почты",
    copy: "Копировать",
    copyHint: "Нажмите, чтобы скопировать",
    instantChat: "Быстрый чат",
    quickContact: "Быстрый контакт",
    chat: "Чат",
    search: "Поиск",
    searchPlaceholder: "Поиск машины, продукта, формата или применения",
    machinePagesAvailable: (count) => `Доступно страниц машин: ${count}.`,
    buyerResources: "Материалы для покупателя",
    trustContact: "Доверие и контакты",
    about: "О проекте",
    editorial: "Редакционная политика",
    privacy: "Уведомление о конфиденциальности",
    privacyEnglish: "Уведомление о конфиденциальности (английский)",
    footerStatement: "Каталог для покупателя. Итоговая производительность требует образцов и приемочных испытаний.",
    noScriptTitle: "JavaScript недоступен.",
    noScriptBody: "Для RFQ используйте электронную почту или WhatsApp. Не отправляйте форму ниже: прямая веб-доставка требует JavaScript.",
    lineFlow: [
      { step: "01", title: "Подача продукта", text: "Элеватор, шнек, вибропитатель или ручная загрузка по сыпучести и требованиям гигиены." },
      { step: "02", title: "Дозирование и фасовка", text: "Мультиголовочные или линейные весы, шнек, стакан, насос или счетчик под нужную точность." },
      { step: "03", title: "Первичная упаковка", text: "Готовый пакет, пленка VFFS, саше, чайный пакет, flow pack, вакуум, стакан, бутылка или картон." },
      { step: "04", title: "Запайка, кодирование, контроль", text: "Термо- или ультразвуковая запайка, вакуум, азот, дата, контроль веса и отбраковка." },
      { step: "05", title: "Вторичная упаковка", text: "Картон, shrink, обертка, формирование, укладка и заклейка транспортных коробов." },
      { step: "06", title: "Данные для RFQ", text: "Фото, образцы, доза, годный выпуск, напряжение, воздух и планировка задают конечный объем." },
    ],
    faq: [
      ["Какую машину запрашивать первой?", "Начните со свойств продукта, формата и годного выпуска. Готовый пакет обычно ведет к роторной машине, экономия пленки — к VFFS или саше."],
      ["Какие образцы нужны для испытаний?", "Пришлите фото, дозу, плотность или вязкость, пакет или пленку, тип шва и размеры картонной или транспортной коробки."],
      ["Может ли линия работать с разными продуктами?", "Да, если свойства и размер остаются в одном механическом диапазоне. Дозатор, форматные части, ширина и губки задают предел переналадки."],
      ["Что влияет на срок и цену?", "Семейство машины, точность, контактные материалы, кодирование, азот, вакуум, пыль, контроль веса, картон, короба и местные требования."],
      ["Как сравнить готовый пакет, VFFS и саше?", "Сравнивайте ценность упаковки, материал, годный выпуск, отходы, операторов и переналадки. Самая дешевая машина редко дает самую дешевую линию."],
      ["Что предотвращает переделки после предложения?", "До финальной конфигурации подтвердите продукт, выпуск, размеры, допуск, напряжение, воздух, площадь, направление конвейера и приемочные образцы."],
    ],
  },
  ar: {
    breadcrumb: "مسار التنقل",
    categoryScope: "نطاق الفئة",
    catalogStats: "بيانات كتالوج الآلات",
    conversionActions: "خيارات التواصل",
    keyCapabilities: "القدرات الرئيسية",
    directContact: "قنوات الاتصال المباشر",
    copyEmail: "نسخ عنوان البريد الإلكتروني",
    copy: "نسخ",
    copyHint: "انقر للنسخ",
    instantChat: "محادثة فورية",
    quickContact: "اتصال سريع",
    chat: "محادثة",
    search: "بحث",
    searchPlaceholder: "ابحث عن آلة أو منتج أو شكل عبوة أو تطبيق",
    machinePagesAvailable: (count) => `تتوفر ${count} صفحة آلات.`,
    buyerResources: "موارد المشتري",
    trustContact: "الثقة والاتصال",
    about: "عن الموقع",
    editorial: "السياسة التحريرية",
    privacy: "إشعار الخصوصية",
    privacyEnglish: "إشعار الخصوصية (بالإنجليزية)",
    footerStatement: "كتالوج موجه للمشتري. يتطلب الأداء النهائي عينات واختبارات قبول.",
    noScriptTitle: "JavaScript غير متاح.",
    noScriptBody: "استخدم البريد الإلكتروني أو واتساب لطلب RFQ. لا ترسل النموذج أدناه لأن الإرسال المباشر عبر الويب يتطلب JavaScript.",
    lineFlow: [
      { step: "01", title: "تغذية المنتج", text: "رافعة أو ناقل لولبي أو مغذٍ اهتزازي أو تحميل يدوي حسب التدفق والنظافة." },
      { step: "02", title: "الجرعات والتعبئة", text: "ميزان متعدد الرؤوس أو خطي أو لولب أو كوب أو مضخة أو عد وفق الدقة المطلوبة." },
      { step: "03", title: "التعبئة الأولية", text: "كيس جاهز أو فيلم VFFS أو ساشيه أو شاي أو flow pack أو فاكيوم أو كوب أو زجاجة أو كرتون." },
      { step: "04", title: "اللحام والترميز والفحص", text: "لحام حراري أو فوق صوتي، فاكيوم، نيتروجين، تاريخ، فحص وزن ورفض." },
      { step: "05", title: "التعبئة الثانوية", text: "كرتنة أو shrink أو تغليف خارجي أو تشكيل الصندوق وتعبئته وإغلاقه." },
      { step: "06", title: "أدلة RFQ", text: "الصور والعينات والجرعة والإنتاج المقبول والجهد والهواء والمخطط تحدد النطاق النهائي." },
    ],
    faq: [
      ["أي آلة نطلب عرضها أولاً؟", "ابدأ بسلوك المنتج وشكل العبوة والإنتاج المقبول. الكيس الجاهز يشير عادة إلى آلة دوارة، واقتصاد الفيلم إلى VFFS أو الساشيه."],
      ["ما العينات اللازمة للاختبار؟", "أرسل الصور وجرعة التعبئة والكثافة أو اللزوجة وعينات الكيس أو الفيلم ونوع اللحام وأبعاد الكرتون أو الصندوق."],
      ["هل يمكن لخط واحد تشغيل منتجات مختلفة؟", "نعم إذا بقي السلوك والحجم ضمن النطاق الميكانيكي نفسه. الجرعات وقطع المقاس والعرض وفكوك اللحام تحدد حدود التغيير."],
      ["ما الذي يغير المهلة والسعر؟", "فئة الآلة والدقة ومواد التلامس والترميز والنيتروجين والفاكيوم والغبار وفحص الوزن والكرتنة والصناديق والمتطلبات المحلية."],
      ["كيف نقارن الكيس الجاهز وVFFS والساشيه؟", "قارن قيمة العبوة وتكلفة المادة والإنتاج المقبول والهدر وعدد المشغلين وتغيير المقاس. أقل سعر للآلة نادراً ما يعني أقل تكلفة للخط."],
      ["ما الذي يمنع إعادة العمل بعد العرض؟", "أكد المنتج والإنتاج والأبعاد والتفاوت والجهد والهواء والمساحة واتجاه الناقل وعينات القبول قبل تثبيت التكوين النهائي."],
    ],
  },
};

function uiFor(langCode) {
  return UI_COPY[langCode] || UI_COPY.en;
}

const NON_ENGLISH_UI_FALLBACKS = [
  "Product feeding",
  "Dosing and filling",
  "Primary packaging",
  "Seal, code and verify",
  "Secondary packing",
  "Which machine should we quote first",
  "Search machine, product, format or application",
  "Machine catalog statistics",
  "Direct contact channels",
  "Copy email address",
  "Click to copy",
  "Instant chat",
  "Buyer-oriented machine catalog",
  "Category scope",
];
const PROJECT_SPECIFIC_OUTPUT = Object.freeze({
  en: "Project-specific after product and pack testing",
  es: "Específico del proyecto tras probar el producto y el empaque",
  fr: "À définir par projet après essais du produit et du pack",
  de: "Projektspezifisch nach Produkt- und Packungstests",
  pt: "Específico do projeto após testar o produto e a embalagem",
  ru: "Определяется проектом после испытаний продукта и упаковки",
  ar: "يحدد حسب المشروع بعد اختبار المنتج والعبوة",
});
const TECHNICAL_DETAILS_FALLBACK = Object.freeze({
  en: "Confirm with product and final pack samples",
  es: "Confirmar con muestras del producto y del empaque final",
  fr: "À confirmer avec le produit et le pack final",
  de: "Mit Produkt- und finalen Packmustern bestätigen",
  pt: "Confirmar com amostras do produto e da embalagem final",
  ru: "Подтвердить на образцах продукта и готовой упаковки",
  ar: "يؤكد بعينات المنتج والعبوة النهائية",
});

const VISUAL_COPY = {
  en: { label: "Visual evidence", pending: "Exact product visual pending", linked: "Brochure-linked machine visual", reference: "Category reference visual", title: "Visual evidence boundary", body: "The exact product image is withheld until the brochure frame and public asset can be matched without ambiguity." },
  es: { label: "Evidencia visual", pending: "Imagen exacta pendiente", linked: "Imagen vinculada al catálogo", reference: "Imagen de referencia de categoría", title: "Límite de evidencia visual", body: "La imagen exacta se omite hasta poder vincular sin ambigüedad el equipo del catálogo con el activo público." },
  fr: { label: "Preuve visuelle", pending: "Visuel produit exact en attente", linked: "Visuel machine lié à la brochure", reference: "Visuel de catégorie", title: "Limite de preuve visuelle", body: "Le visuel exact est retenu tant que la machine de la brochure et l'actif public ne peuvent pas être associés sans ambiguïté." },
  de: { label: "Bildnachweis", pending: "Exaktes Produktbild ausstehend", linked: "Mit Broschüre verknüpftes Maschinenbild", reference: "Kategorie-Referenzbild", title: "Grenze des Bildnachweises", body: "Das exakte Produktbild bleibt ausgeblendet, bis Broschürenrahmen und öffentliches Asset eindeutig zugeordnet sind." },
  pt: { label: "Evidência visual", pending: "Imagem exata pendente", linked: "Imagem vinculada ao catálogo", reference: "Imagem de referência da categoria", title: "Limite de evidência visual", body: "A imagem exata fica retida até que o equipamento do catálogo e o ativo público possam ser associados sem ambiguidade." },
  ru: { label: "Визуальное подтверждение", pending: "Точное изображение ожидает проверки", linked: "Изображение связано с брошюрой", reference: "Изображение категории", title: "Граница визуальных доказательств", body: "Точное изображение не публикуется, пока оборудование в брошюре и публичный файл нельзя сопоставить однозначно." },
  ar: { label: "الدليل المرئي", pending: "الصورة الدقيقة بانتظار التحقق", linked: "صورة مرتبطة بالكتيب", reference: "صورة مرجعية للفئة", title: "حدود الدليل المرئي", body: "لا تُعرض صورة المنتج الدقيقة حتى يمكن مطابقة آلة الكتيب مع الملف العام دون التباس." },
};

function visualCopyFor(langCode) {
  return VISUAL_COPY[langCode] || VISUAL_COPY.en;
}

const ENGINEERING_LABELS = {
  en: {
    sourceModel: "Reference model family",
    sourceEvidence: "Brochure evidence",
    rfqSignal: "RFQ signal",
    acceptance: "Acceptance checks before order",
    acceptanceShort: "Acceptance",
    acceptanceProperty: "Acceptance checks",
    internalLinks: "Compare nearby machine paths",
    categoryMachines: "Machine pages",
    categoryFormat: "Primary format",
    categoryRfq: "RFQ focus",
    categoryOutput: "Output basis",
    categoryChooser: "Choose the closest machine page",
    onThisPage: "On this page",
    selectionReference: "selection reference",
    evidenceAria: "Brochure-derived engineering evidence",
    machineVisuals: "Machine visuals",
    breadcrumb: "Breadcrumb",
    home: "Home",
    targetOutput: "the target accepted output",
    selectedDosing: "the selected dosing method",
    finalPackage: "package format",
    compareFamily: "Compare the full {category} family before selecting one machine.",
    brochurePage: "Brochure p. {page}",
    brochurePages: "Brochure pp. {pages}",
    noDedicatedModel: "No dedicated brochure model; compare brochure pp. {pages}",
    equipmentFamily: "Brochure-derived equipment family",
  },
  es: {
    sourceModel: "Familia de modelo",
    sourceEvidence: "Evidencia del catálogo",
    rfqSignal: "Dato para RFQ",
    acceptance: "Pruebas de aceptación antes del pedido",
    acceptanceShort: "Aceptación",
    acceptanceProperty: "Pruebas de aceptación",
    internalLinks: "Comparar máquinas cercanas",
    categoryMachines: "Páginas de máquinas",
    categoryFormat: "Formato principal",
    categoryRfq: "Enfoque RFQ",
    categoryOutput: "Base de producción",
    categoryChooser: "Elegir la máquina más cercana",
    onThisPage: "En esta página",
    selectionReference: "referencia de selección",
    evidenceAria: "Evidencia de ingeniería derivada del catálogo",
    machineVisuals: "Imágenes de la máquina",
    breadcrumb: "Ruta de navegación",
    home: "Inicio",
    targetOutput: "la producción conforme objetivo",
    selectedDosing: "la dosificación seleccionada",
    finalPackage: "envase final",
    compareFamily: "Compare toda la familia de {category} antes de elegir una máquina.",
    brochurePage: "Catálogo, p. {page}",
    brochurePages: "Catálogo, pp. {pages}",
    noDedicatedModel: "Sin modelo específico en el catálogo; compare las pp. {pages}",
    equipmentFamily: "Familia de equipos derivada del catálogo",
  },
  fr: {
    sourceModel: "Famille de modèle",
    sourceEvidence: "Preuve brochure",
    rfqSignal: "Donnée RFQ",
    acceptance: "Contrôles de réception avant commande",
    acceptanceShort: "Réception",
    acceptanceProperty: "Contrôles de réception",
    internalLinks: "Comparer les machines proches",
    categoryMachines: "Pages machines",
    categoryFormat: "Format principal",
    categoryRfq: "Priorité RFQ",
    categoryOutput: "Base de cadence",
    categoryChooser: "Choisir la machine la plus proche",
    onThisPage: "Sur cette page",
    selectionReference: "référence de sélection",
    evidenceAria: "Preuves techniques issues de la brochure",
    machineVisuals: "Visuels de la machine",
    breadcrumb: "Fil d’Ariane",
    home: "Accueil",
    targetOutput: "la cadence conforme visée",
    selectedDosing: "du dosage sélectionné",
    finalPackage: "format d’emballage final",
    compareFamily: "Comparer toute la famille {category} avant de choisir une machine.",
    brochurePage: "Brochure, p. {page}",
    brochurePages: "Brochure, pp. {pages}",
    noDedicatedModel: "Aucun modèle dédié dans la brochure ; comparer les pp. {pages}",
    equipmentFamily: "Famille d’équipements issue de la brochure",
  },
  de: {
    sourceModel: "Referenz-Modellfamilie",
    sourceEvidence: "Broschürennachweis",
    rfqSignal: "RFQ-Angabe",
    acceptance: "Abnahmeprüfungen vor Bestellung",
    acceptanceShort: "Abnahme",
    acceptanceProperty: "Abnahmeprüfungen",
    internalLinks: "Naheliegende Maschinenwege vergleichen",
    categoryMachines: "Maschinenseiten",
    categoryFormat: "Primärformat",
    categoryRfq: "RFQ-Schwerpunkt",
    categoryOutput: "Leistungsbasis",
    categoryChooser: "Passendste Maschinenseite wählen",
    onThisPage: "Auf dieser Seite",
    selectionReference: "Auswahlreferenz",
    evidenceAria: "Technische Nachweise aus der Broschüre",
    machineVisuals: "Maschinenansichten",
    breadcrumb: "Brotkrümelnavigation",
    home: "Startseite",
    targetOutput: "die angestrebte Gutleistung",
    selectedDosing: "der gewählten Dosierung",
    finalPackage: "finalen Verpackungsformats",
    compareFamily: "Die gesamte Familie {category} vergleichen, bevor eine Maschine gewählt wird.",
    brochurePage: "Broschüre, S. {page}",
    brochurePages: "Broschüre, S. {pages}",
    noDedicatedModel: "Kein eigenes Broschürenmodell; Broschürenseiten {pages} vergleichen",
    equipmentFamily: "Aus der Broschüre abgeleitete Maschinenfamilie",
  },
  pt: {
    sourceModel: "Família de modelo",
    sourceEvidence: "Evidência do catálogo",
    rfqSignal: "Dado para RFQ",
    acceptance: "Verificações de aceitação antes do pedido",
    acceptanceShort: "Aceitação",
    acceptanceProperty: "Verificações de aceitação",
    internalLinks: "Comparar máquinas próximas",
    categoryMachines: "Páginas de máquinas",
    categoryFormat: "Formato principal",
    categoryRfq: "Foco do RFQ",
    categoryOutput: "Base de produção",
    categoryChooser: "Escolher a máquina mais próxima",
    onThisPage: "Nesta página",
    selectionReference: "referência de seleção",
    evidenceAria: "Evidência de engenharia derivada do catálogo",
    machineVisuals: "Imagens da máquina",
    breadcrumb: "Trilha de navegação",
    home: "Início",
    targetOutput: "a produção conforme pretendida",
    selectedDosing: "da dosagem selecionada",
    finalPackage: "formato final da embalagem",
    compareFamily: "Compare toda a família de {category} antes de escolher uma máquina.",
    brochurePage: "Catálogo, p. {page}",
    brochurePages: "Catálogo, pp. {pages}",
    noDedicatedModel: "Sem modelo dedicado no catálogo; compare as pp. {pages}",
    equipmentFamily: "Família de equipamentos derivada do catálogo",
  },
  ru: {
    sourceModel: "Семейство модели",
    sourceEvidence: "Источник в брошюре",
    rfqSignal: "Данные для RFQ",
    acceptance: "Приемочные проверки до заказа",
    acceptanceShort: "Приемка",
    acceptanceProperty: "Приемочные проверки",
    internalLinks: "Сравнить близкие варианты машин",
    categoryMachines: "Страницы машин",
    categoryFormat: "Основной формат",
    categoryRfq: "Фокус RFQ",
    categoryOutput: "Основа производительности",
    categoryChooser: "Выбрать ближайшую страницу машины",
    onThisPage: "На этой странице",
    selectionReference: "ориентир для выбора",
    evidenceAria: "Инженерные данные из брошюры",
    machineVisuals: "Изображения машины",
    breadcrumb: "Навигационная цепочка",
    home: "Главная",
    targetOutput: "целевую производительность годной продукции",
    selectedDosing: "выбранного дозирования",
    finalPackage: "окончательного формата упаковки",
    compareFamily: "Сравнить все семейство «{category}» до выбора конкретной машины.",
    brochurePage: "Брошюра, стр. {page}",
    brochurePages: "Брошюра, стр. {pages}",
    noDedicatedModel: "В брошюре нет отдельной модели; сравните стр. {pages}",
    equipmentFamily: "Семейство оборудования по данным брошюры",
  },
  ar: {
    sourceModel: "عائلة الموديل المرجعية",
    sourceEvidence: "دليل الكتيب",
    rfqSignal: "بيانات RFQ",
    acceptance: "اختبارات القبول قبل الطلب",
    acceptanceShort: "القبول",
    acceptanceProperty: "اختبارات القبول",
    internalLinks: "مقارنة مسارات الآلات القريبة",
    categoryMachines: "صفحات الآلات",
    categoryFormat: "الشكل الرئيسي",
    categoryRfq: "تركيز RFQ",
    categoryOutput: "أساس الإنتاجية",
    categoryChooser: "اختر أقرب صفحة آلة",
    onThisPage: "في هذه الصفحة",
    selectionReference: "مرجع للاختيار",
    evidenceAria: "أدلة هندسية مستمدة من الكتيب",
    machineVisuals: "صور الآلة",
    breadcrumb: "مسار التنقل",
    home: "الرئيسية",
    targetOutput: "الإنتاج المطابق المستهدف",
    selectedDosing: "طريقة الجرعات المختارة",
    finalPackage: "شكل العبوة النهائي",
    compareFamily: "قارن عائلة {category} كاملة قبل اختيار آلة واحدة.",
    brochurePage: "الكتيب، ص. {page}",
    brochurePages: "الكتيب، ص. {pages}",
    noDedicatedModel: "لا يوجد موديل مستقل في الكتيب؛ قارن الصفحات {pages}",
    equipmentFamily: "عائلة معدات مستمدة من الكتيب",
  },
};

const ACCEPTANCE_TEMPLATES = {
  en: [
    ({ speed, packageStyle }) => `Validate ${speed} with real product samples, final ${packageStyle} dimensions and the chosen dosing method.`,
    ({ packageStyle }) => `Run seal and leak checks with the final ${packageStyle} material, filling temperature and expected product residue.`,
    ({ dosing }) => `Confirm ${dosing} accuracy, cleaning access, product-contact material and changeover time before the final quotation.`,
    ({ model }) => `Use ${model} only as a starting platform; lock voltage, air, footprint, conveyor direction and add-ons in the RFQ.`,
  ],
  es: [
    ({ speed, packageStyle }) => `Valide ${speed} con producto real, las dimensiones del ${packageStyle} y el método de dosificación elegido.`,
    ({ packageStyle }) => `Pruebe el sellado y las fugas con el material del ${packageStyle}, la temperatura de llenado y el residuo esperado.`,
    ({ dosing }) => `Confirme la precisión de ${dosing}, el acceso para limpieza, el material en contacto y el tiempo de cambio antes de la cotización final.`,
    ({ model }) => `Use ${model} solo como plataforma inicial; fije voltaje, aire, espacio, dirección y opciones en el RFQ.`,
  ],
  fr: [
    ({ speed, packageStyle }) => `Valider ${speed} avec le produit réel, les dimensions finales du ${packageStyle} et le dosage retenu.`,
    ({ packageStyle }) => `Tester scellage et fuite avec le matériau final du ${packageStyle}, la température de remplissage et les résidus attendus.`,
    ({ dosing }) => `Confirmer la précision ${dosing}, l'accès au nettoyage, le matériau en contact et le temps de changement avant le devis final.`,
    ({ model }) => `Utiliser ${model} comme base uniquement ; fixer tension, air, encombrement, sens convoyeur et options dans le RFQ.`,
  ],
  de: [
    ({ speed, packageStyle }) => `${speed} mit realem Produkt, den finalen Abmessungen des ${packageStyle} und der gewählten Dosierung validieren.`,
    ({ packageStyle }) => `Siegel- und Dichtheitsprüfungen mit dem finalen Material des ${packageStyle}, der Fülltemperatur und erwarteten Rückständen durchführen.`,
    ({ dosing }) => `Genauigkeit von ${dosing}, Reinigungszugang, Kontaktmaterial und Wechselzeit vor dem finalen Angebot bestätigen.`,
    ({ model }) => `${model} nur als Ausgangsplattform nutzen; Spannung, Luft, Platz, Förderrichtung und Optionen im RFQ festlegen.`,
  ],
  pt: [
    ({ speed, packageStyle }) => `Valide ${speed} com produto real, as dimensões do ${packageStyle} e o método de dosagem escolhido.`,
    ({ packageStyle }) => `Teste selagem e vazamento com o material do ${packageStyle}, a temperatura de envase e o resíduo esperado.`,
    ({ dosing }) => `Confirme a precisão ${dosing}, o acesso para limpeza, o material de contato e o tempo de troca antes da cotação final.`,
    ({ model }) => `Use ${model} apenas como plataforma inicial; fixe tensão, ar, espaço, direção e opções no RFQ.`,
  ],
  ru: [
    ({ speed, packageStyle }) => `Проверить ${speed} на реальном продукте, финальных размерах ${packageStyle} и выбранном дозировании.`,
    ({ packageStyle }) => `Провести проверку шва и герметичности на финальном материале ${packageStyle}, при рабочей температуре и ожидаемых остатках продукта.`,
    ({ dosing }) => `Подтвердить точность ${dosing}, доступ для мойки, контактные материалы и время переналадки до финального предложения.`,
    ({ model }) => `Использовать ${model} только как исходную платформу; зафиксировать питание, воздух, место, направление и опции в RFQ.`,
  ],
  ar: [
    ({ speed, packageStyle }) => `تحقق من ${speed} باستخدام المنتج الحقيقي وأبعاد ${packageStyle} النهائية وطريقة الجرعات المختارة.`,
    ({ packageStyle }) => `اختبر اللحام والتسرب بمادة ${packageStyle} النهائية ودرجة التعبئة وبقايا المنتج المتوقعة.`,
    ({ dosing }) => `أكد دقة ${dosing} وسهولة التنظيف ومواد ملامسة المنتج وزمن التغيير قبل العرض النهائي.`,
    ({ model }) => `استخدم ${model} كنقطة بداية فقط، وثبت الجهد والهواء والمساحة والاتجاه والخيارات في RFQ.`,
  ],
};

const PILLAR_TEXT = {
  premade: {
    en: ["Rotary premade pouch systems for stand-up pouches, zipper pouches and shaped bags.", "Best for retail packs where pouch appearance and flexible dosing matter."],
    es: ["Sistemas rotativos para pouches stand-up, zipper y bolsas con forma.", "Ideales para envases retail donde la apariencia y la dosificación flexible importan."],
    fr: ["Systèmes rotatifs pour sachets stand-up, zippés et formes spéciales.", "Adaptés aux packs retail où l'apparence et le dosage flexible sont essentiels."],
    de: ["Rotative Systeme für Standbodenbeutel, Zipper-Beutel und Formbeutel.", "Ideal für Retail-Packs mit hoher Beuteloptik und flexibler Dosierung."],
    pt: ["Sistemas rotativos para pouches stand-up, zipper e formatos especiais.", "Indicados para embalagens de varejo com aparência premium e dosagem flexível."],
    ru: ["Ротационные системы для stand-up пакетов, zipper-пакетов и фигурных форматов.", "Подходят для розничной упаковки, где важны внешний вид и гибкое дозирование."],
    ar: ["أنظمة دوارة للأكياس القائمة وأكياس السحاب والأشكال الخاصة.", "مناسبة لعبوات البيع بالتجزئة عندما يكون الشكل والجرعات المرنة مهمين."],
  },
  vffs: {
    en: ["Roll-film vertical form fill seal systems for snacks, powders, frozen food and granules.", "Use when film economy, pillow bags and high-throughput commodity packing are priorities."],
    es: ["Sistemas verticales VFFS con film en rollo para snacks, polvos, congelados y gránulos.", "Adecuados cuando importan el costo del film, bolsas tipo almohada y alta producción."],
    fr: ["Systèmes VFFS à film en rouleau pour snacks, poudres, surgelés et granulés.", "À choisir pour l'économie de film, les sachets coussin et les cadences élevées."],
    de: ["Vertikale VFFS-Systeme mit Rollenfilm für Snacks, Pulver, Tiefkühlkost und Granulate.", "Geeignet bei Filmökonomie, Kissenbeuteln und hohem Durchsatz."],
    pt: ["Sistemas VFFS com filme em bobina para snacks, pós, congelados e grânulos.", "Use quando economia de filme, pillow bag e alta produção forem prioridades."],
    ru: ["Вертикальные VFFS-системы с рулонной пленкой для снеков, порошков, заморозки и гранул.", "Выбирайте для экономии пленки, pillow bag и высокой производительности."],
    ar: ["أنظمة VFFS بفيلم رول للوجبات الخفيفة والمساحيق والمجمدات والحبيبات.", "اختيار مناسب عند أهمية اقتصاد الفيلم وأكياس الوسادة والإنتاج العالي."],
  },
  teaCoffee: {
    en: ["Dedicated tea and coffee machines for triangle bags, drip coffee and inner/outer envelopes.", "Built around aroma protection, tag/thread handling and clean small-dose sealing."],
    es: ["Máquinas para té y café: bolsas piramidales, drip coffee y sobres internos/externos.", "Diseñadas para aroma, etiqueta/hilo y sellado limpio de dosis pequeñas."],
    fr: ["Machines dédiées au thé et café: sachets pyramide, drip coffee et enveloppes.", "Conçues pour l'arôme, étiquette/fil et scellage propre de petites doses."],
    de: ["Spezialmaschinen für Tee und Kaffee: Pyramidenbeutel, Drip Coffee und Innen/Außenbeutel.", "Ausgelegt auf Aromaschutz, Tag/Faden und saubere Kleindosierung."],
    pt: ["Máquinas para chá e café: sachês piramidais, drip coffee e envelopes internos/externos.", "Focadas em aroma, etiqueta/fio e selagem limpa de pequenas doses."],
    ru: ["Машины для чая и кофе: пирамидальные пакетики, drip coffee и внутренние/внешние пакеты.", "Ориентированы на аромат, ярлык/нить и чистую запайку малых доз."],
    ar: ["ماكينات للشاي والقهوة: أكياس هرمية، قهوة مقطرة وأكياس داخلية/خارجية.", "مصممة لحماية النكهة والتعامل مع الخيط والبطاقة ولحام الجرعات الصغيرة."],
  },
  sachet: {
    en: ["Sachet, stick pack and multi-lane systems for powder, granule, liquid and sauce.", "Useful for high-SKU small-dose products and high-output parallel lanes."],
    es: ["Sistemas sachet, stick pack y multilínea para polvo, gránulo, líquido y salsa.", "Útiles para dosis pequeñas, muchos SKU y producción paralela."],
    fr: ["Systèmes sachet, stick pack et multilignes pour poudre, granulé, liquide et sauce.", "Adaptés aux petites doses, nombreux SKU et cadences parallèles."],
    de: ["Sachet-, Stickpack- und Mehrbahn-Systeme für Pulver, Granulat, Flüssigkeit und Sauce.", "Für kleine Dosierungen, viele SKU und parallele Hochleistung."],
    pt: ["Sistemas sachê, stick pack e multilinhas para pó, grânulo, líquido e molho.", "Úteis para pequenas doses, muitos SKUs e produção paralela."],
    ru: ["Саше, stick pack и многоручьевые системы для порошков, гранул, жидкостей и соусов.", "Подходят для малых доз, большого числа SKU и высокой параллельной выработки."],
    ar: ["أنظمة ساشيه وستيك باك ومتعددة المسارات للمسحوق والحبيبات والسوائل والصلصات.", "مناسبة للجرعات الصغيرة وعدد كبير من المنتجات والإنتاج المتوازي."],
  },
  specialty: {
    en: ["Vacuum, flow wrapping, shrink sealing and overwrapping for specialty product protection.", "Covers rice bricks, candy, regular objects, boxed products and secondary retail packs."],
    es: ["Vacío, flow pack, termoencogible y sobreenvoltura para protección especial.", "Cubre arroz compacto, dulces, objetos regulares, cajas y packs retail secundarios."],
    fr: ["Vide, flow pack, shrink et suremballage pour protection produit spécialisée.", "Couvre riz compact, confiserie, objets réguliers, boîtes et packs retail secondaires."],
    de: ["Vakuum, Flowpack, Schrumpfen und Overwrapping für spezielle Produktschutzaufgaben.", "Für Reisblöcke, Süßwaren, regelmäßige Produkte, Boxen und Sekundärpacks."],
    pt: ["Vácuo, flow pack, shrink e sobreenvoltura para proteção especial.", "Atende arroz compacto, doces, objetos regulares, caixas e packs secundários."],
    ru: ["Вакуум, flow pack, термоусадка и overwrapping для специализированной защиты.", "Для рисовых брикетов, конфет, регулярных изделий, коробок и вторичной упаковки."],
    ar: ["فاكيوم وفلو باك وانكماش وتغليف خارجي لحماية المنتجات الخاصة.", "يغطي أرزاً مضغوطاً وحلوى ومنتجات منتظمة وصناديق وعبوات تجزئة ثانوية."],
  },
  filling: {
    en: ["Filling, sealing, cartoning, case opening and case sealing lines for downstream automation.", "Connect primary packs to retail cartons, shipping cases and e-commerce logistics."],
    es: ["Líneas de llenado, sellado, encartonado, armado y cierre de cajas.", "Conectan el empaque primario con cartones retail, cajas de envío y e-commerce."],
    fr: ["Lignes de remplissage, scellage, cartonnage, formage et fermeture de caisses.", "Relient l'emballage primaire aux cartons retail, caisses d'expédition et e-commerce."],
    de: ["Abfüll-, Siegel-, Kartonier-, Case-Erector- und Verschließlinien.", "Verbinden Primärpacks mit Retail-Kartons, Versandcases und E-Commerce-Logistik."],
    pt: ["Linhas de envase, selagem, cartuchamento, abertura e fechamento de caixas.", "Conectam embalagem primária a cartuchos, caixas de envio e logística e-commerce."],
    ru: ["Линии фасовки, запайки, картонаторов, формирования и заклейки коробов.", "Соединяют первичную упаковку с розничными коробками, транспортной тарой и e-commerce."],
    ar: ["خطوط تعبئة ولحام وكرتنة وفتح وإغلاق الصناديق.", "تربط العبوة الأساسية بالكرتون التجاري وصناديق الشحن ولوجستيات التجارة الإلكترونية."],
  },
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

function conciseMetaDescription(value, maxLength = 180) {
  const text = String(value).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;

  const window = text.slice(0, maxLength);
  const sentenceEnd = Math.max(window.lastIndexOf(". "), window.lastIndexOf("? "), window.lastIndexOf("! "));
  if (sentenceEnd >= 110) return window.slice(0, sentenceEnd + 1);

  const wordEnd = window.lastIndexOf(" ");
  return `${window.slice(0, wordEnd > 110 ? wordEnd : maxLength - 1).replace(/[,:;.\s]+$/, "")}.`;
}

function heroImageFor(imagePath) {
  if (!imagePath.startsWith("public/assets/brochure/")) return imagePath;
  return imagePath.replace("public/assets/brochure/", "public/assets/brochure/hero/");
}

const IMAGE_DIMENSION_CACHE = new Map();

function imageDimensions(imagePath) {
  const normalized = imagePath.replace(/^\/+/, "");
  if (IMAGE_DIMENSION_CACHE.has(normalized)) return IMAGE_DIMENSION_CACHE.get(normalized);
  const filePath = path.join(ROOT, normalized);
  let dimensions = null;

  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
      dimensions = { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    } else if (buffer.length >= 12 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
      let offset = 2;
      while (offset + 8 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const marker = buffer[offset + 1];
        if (marker === 0xd8 || marker === 0xd9) {
          offset += 2;
          continue;
        }
        const segmentLength = buffer.readUInt16BE(offset + 2);
        if (startOfFrame.has(marker)) {
          dimensions = { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
          break;
        }
        if (segmentLength < 2) break;
        offset += 2 + segmentLength;
      }
    } else if (buffer.slice(0, 4096).toString("utf8").includes("<svg")) {
      const source = buffer.slice(0, 4096).toString("utf8");
      const width = Number(source.match(/\bwidth=["']([0-9]+(?:\.[0-9]+)?)(?:px)?["']/i)?.[1]);
      const height = Number(source.match(/\bheight=["']([0-9]+(?:\.[0-9]+)?)(?:px)?["']/i)?.[1]);
      if (width > 0 && height > 0) {
        dimensions = { width, height };
      } else {
        const viewBox = source
          .match(/\bviewBox=["']\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)\s*["']/i)
          ?.slice(1, 3)
          .map(Number);
        if (viewBox?.[0] > 0 && viewBox?.[1] > 0) dimensions = { width: viewBox[0], height: viewBox[1] };
      }
    }
  } catch {
    dimensions = null;
  }

  IMAGE_DIMENSION_CACHE.set(normalized, dimensions);
  return dimensions;
}

function imageAttrs(imagePath, { priority = false } = {}) {
  const dimensions = imageDimensions(imagePath);
  return [
    dimensions ? `width="${dimensions.width}" height="${dimensions.height}"` : "",
    `loading="${priority ? "eager" : "lazy"}"`,
    'decoding="async"',
    priority ? 'fetchpriority="high"' : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function json(value) {
  return JSON.stringify(value, null, 2).replaceAll("</", "<\\/");
}

function effectiveModifiedDate(...values) {
  const dates = values.filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || "")));
  return dates.sort().at(-1) || SITE_REFRESH_DATE;
}

function routeInventoryFingerprint(urls = ROUTES.flatMap((route) =>
  (route.languages || []).map((langCode) => absoluteUrl(langCode, route.path)),
)) {
  return createHash("sha256").update([...urls].sort().join("\n")).digest("hex");
}

function organizationSchema(description = "") {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${BASE_URL}/`,
    email: CONTACT_EMAIL,
    ...(description ? { description } : {}),
    logo: {
      "@type": "ImageObject",
      "@id": `${BASE_URL}/#logo`,
      url: ORGANIZATION_LOGO_URL,
      contentUrl: ORGANIZATION_LOGO_URL,
      width: 512,
      height: 512,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: CONTACT_EMAIL,
        telephone: INSTANT_CHAT_DISPLAY,
        availableLanguage: LANGUAGES.map((lang) => lang.hreflang),
      },
    ],
  };
}

function machineLocalizationCoverage() {
  const fields = ["applications", "packageStyles", "materials", "workflow", "features", "options"];
  const termUses = MACHINE_PAGES
    .flatMap((item) => fields.flatMap((field) => item[field] || []))
    .filter(Boolean);
  const terms = uniqueList(termUses);
  return NON_DEFAULT_LANGUAGES.map((lang) => {
    const untranslated = terms.filter((term) => !hasMachineTermTranslation(term, lang.code));
    const translatedUses = termUses.filter((term) => hasMachineTermTranslation(term, lang.code)).length;
    return {
      language: lang.code,
      terms: terms.length,
      translated: terms.length - untranslated.length,
      ratio: Number(((terms.length - untranslated.length) / terms.length).toFixed(4)),
      termUses: termUses.length,
      translatedUses,
      weightedRatio: Number((translatedUses / termUses.length).toFixed(4)),
      untranslated,
    };
  });
}

function machineLocalizationPriorities(limit = 80) {
  const fields = ["applications", "packageStyles", "materials", "workflow", "features", "options"];
  const frequency = new Map();
  for (const item of MACHINE_PAGES) {
    for (const field of fields) {
      for (const term of item[field] || []) {
        const missingLanguages = NON_DEFAULT_LANGUAGES
          .filter((lang) => !hasMachineTermTranslation(term, lang.code))
          .map((lang) => lang.code);
        if (!missingLanguages.length) continue;
        const current = frequency.get(term) || { term, uses: 0, fields: new Set(), missingLanguages };
        current.uses += 1;
        current.fields.add(field);
        frequency.set(term, current);
      }
    }
  }
  return [...frequency.values()]
    .sort((a, b) => b.uses - a.uses || a.term.localeCompare(b.term))
    .slice(0, limit)
    .map(({ term, uses, fields: fieldSet, missingLanguages }) => ({
      term,
      uses,
      fields: [...fieldSet],
      missingLanguages,
    }));
}

const UNTRANSLATED_MACHINE_TERMS_CACHE = new Map();

function untranslatedMachineTerms(langCode) {
  if (UNTRANSLATED_MACHINE_TERMS_CACHE.has(langCode)) return UNTRANSLATED_MACHINE_TERMS_CACHE.get(langCode);
  const fields = ["applications", "packageStyles", "materials", "workflow", "features", "options"];
  const terms = uniqueList(
    MACHINE_PAGES.flatMap((item) => fields.flatMap((field) => item[field] || [])).filter(Boolean),
  ).filter((term) => /[a-z]/i.test(term) && term.trim().split(/\s+/).length >= 2 && term.trim().length >= 8);
  const untranslated = terms.filter((term) => !hasMachineTermTranslation(term, langCode));
  UNTRANSLATED_MACHINE_TERMS_CACHE.set(langCode, untranslated);
  return untranslated;
}

function reviewDate(value = LASTMOD) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function lstatIfPresent(target) {
  try {
    return fs.lstatSync(target);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function resolveInsideRoot(...segments) {
  const target = path.resolve(ROOT, ...segments);
  const relative = path.relative(ROOT, target);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Generated path escapes or resolves to the repository root: ${target}`);
  }
  let current = ROOT;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    const stats = lstatIfPresent(current);
    if (stats?.isSymbolicLink()) {
      throw new Error(`Generated path crosses a symbolic link: ${current}`);
    }
  }
  return target;
}

function routeHasUnsafeSegments(routePath) {
  let candidate = String(routePath || "");
  for (let pass = 0; pass < 3; pass += 1) {
    if (candidate.includes("\\") || candidate.includes("\0")) return true;
    if (candidate.split("/").some((segment) => segment === "." || segment === "..")) return true;
    let decoded;
    try {
      decoded = decodeURIComponent(candidate);
    } catch {
      return true;
    }
    if (decoded === candidate) break;
    candidate = decoded;
  }
  return candidate.includes("\\") || candidate.split("/").some((segment) => segment === "." || segment === "..");
}

function routeToFile(langCode, routePath) {
  const normalized = normalizePath(routePath);
  if (langCode === "en") {
    if (normalized === "/") return resolveInsideRoot("index.html");
    return resolveInsideRoot(normalized.slice(1));
  }

  const withoutSlash = normalized === "/" ? "index.html" : normalized.slice(1);
  return resolveInsideRoot(langCode, withoutSlash);
}

function localizedHref(langCode, routePath, hash = "") {
  return `${localizedPath(langCode, routePath)}${hash}`;
}

function skipLink(langCode) {
  return `<a class="skip-link" href="#main-content">${escapeHtml(experienceFor(langCode).skip)}</a>`;
}

function rfqDataAttributes({ machine = "", product = "", source = "" } = {}) {
  return [
    'data-rfq-context',
    machine ? `data-rfq-machine="${escapeAttr(machine)}"` : "",
    product ? `data-rfq-product="${escapeAttr(product)}"` : "",
    source ? `data-rfq-source="${escapeAttr(source)}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function mailtoHref(subject = "Packaging machine RFQ", body = "") {
  const query = new URLSearchParams({ subject, body });
  return `mailto:${CONTACT_EMAIL}?${query.toString()}`;
}

function whatsappHref(message = "Hello, I would like to discuss a packaging machine RFQ.") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function contactMessage(title = "packaging machine", langCode = "en") {
  const messages = {
    en: `Hello, I would like to discuss a ${title} RFQ. I can share product photos, pack size, target output, voltage and project requirements.`,
    es: `Hola, deseo consultar un RFQ de ${title}. Puedo compartir fotos del producto, tamaño del empaque, producción objetivo, voltaje y requisitos del proyecto.`,
    fr: `Bonjour, je souhaite discuter d'un RFQ pour ${title}. Je peux fournir photos produit, dimensions du pack, cadence cible, tension et exigences du projet.`,
    de: `Guten Tag, ich möchte eine RFQ für ${title} besprechen. Ich kann Produktfotos, Packungsgröße, Zielleistung, Spannung und Projektanforderungen senden.`,
    pt: `Olá, desejo discutir um RFQ de ${title}. Posso enviar fotos do produto, tamanho da embalagem, produção alvo, tensão e requisitos do projeto.`,
    ru: `Здравствуйте, я хочу обсудить RFQ для ${title}. Я могу отправить фото продукта, размер упаковки, целевой выпуск, напряжение и требования проекта.`,
    ar: `مرحباً، أود مناقشة طلب RFQ بشأن ${title}. يمكنني إرسال صور المنتج وحجم العبوة والإنتاج المطلوب والجهد ومتطلبات المشروع.`,
  };
  return messages[langCode] || messages.en;
}

function routeLanguageCodes(routePath) {
  const normalized = normalizePath(routePath);
  const route = ROUTES.find((entry) => normalizePath(entry.path) === normalized);
  return route?.languages || LANGUAGES.map((lang) => lang.code);
}

function routeLanguages(routePath) {
  const codes = routeLanguageCodes(routePath);
  return LANGUAGES.filter((lang) => codes.includes(lang.code));
}

function alternateTags(routePath) {
  const languages = routeLanguages(routePath);
  const defaultLang = languages.find((lang) => lang.code === "en") || languages[0];
  return [
    ...languages.map((lang) => `    <link rel="alternate" hreflang="${lang.hreflang}" href="${absoluteUrl(lang.code, routePath)}" />`),
    `    <link rel="alternate" hreflang="x-default" href="${absoluteUrl(defaultLang.code, routePath)}" />`,
  ].join("\n");
}

function languageSwitcher(langCode, routePath) {
  const current = LANGUAGES.find((lang) => lang.code === langCode) || LANGUAGES[0];
  const copy = copyFor(langCode);
  const languages = routeLanguages(routePath);
  if (languages.length < 2) {
    return `<div class="language-switcher language-switcher-single">
          <span class="language-toggle language-static" aria-label="${escapeAttr(copy.nav.language)}">
            <span class="language-code">${escapeHtml(current.short)}</span>
          </span>
        </div>`;
  }
  return `<div class="language-switcher" data-language-switcher>
          <button class="language-toggle" type="button" aria-label="${escapeAttr(copy.nav.language)}" aria-haspopup="true" aria-expanded="false" data-language-toggle>
            <span class="language-code">${escapeHtml(current.short)}</span>
            <span class="language-chevron" aria-hidden="true"></span>
          </button>
          <div class="language-menu" data-language-menu>
            ${languages.map(
              (lang) => `<a href="${localizedHref(lang.code, routePath)}" hreflang="${lang.hreflang}" lang="${lang.htmlLang || lang.code}"${lang.code === langCode ? ' aria-current="true" class="is-active"' : ""}>
              <span>${escapeHtml(lang.nativeName)}</span>
              <small>${escapeHtml(lang.short)}</small>
            </a>`,
            ).join("\n            ")}
          </div>
        </div>`;
}

function nav(langCode, routePath) {
  const copy = copyFor(langCode);
  const experience = experienceFor(langCode);
  const solutionsHref = langCode === "en" ? localizedHref("en", "/applications/index.html") : localizedHref(langCode, "/", "#applications");
  const resourcesHref = langCode === "en" ? localizedHref("en", "/guides/index.html") : localizedHref(langCode, "/", "#guide");
  return `<header class="site-header" data-header>
      <a class="brand" href="${localizedHref(langCode, "/", "#top")}" aria-label="${escapeAttr(copy.nav.homeLabel)}">
        <span class="brand-mark">PPM</span>
        <span class="brand-text">Premade Pouch Machines</span>
      </a>
      <button class="menu-toggle" type="button" aria-label="${escapeAttr(copy.nav.openNav)}" aria-expanded="false" data-menu-toggle>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="site-nav" data-nav aria-label="${escapeAttr(copy.nav.openNav)}">
        <a href="${localizedHref(langCode, "/machine-index.html")}">${escapeHtml(copy.nav.machines)}</a>
        <a href="${solutionsHref}">${escapeHtml(experience.navSolutions)}</a>
        <a href="${resourcesHref}">${escapeHtml(experience.navResources)}</a>
        ${langCode === "en" ? `<a href="${localizedHref("en", "/about.html")}">${escapeHtml(experience.navAbout)}</a>` : ""}
        <a href="${localizedHref(langCode, "/", "#quote")}" class="nav-quote" data-track="nav_rfq">${escapeHtml(copy.nav.quote)}</a>
        ${languageSwitcher(langCode, routePath)}
      </nav>
    </header>`;
}

function footer(langCode) {
  const copy = copyFor(langCode);
  const ui = uiFor(langCode);
  return `<footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-intro">
          <strong>Premade Pouch Machines</strong>
          <p>${escapeHtml(copy.home.description)}</p>
          <div class="footer-contact">
            <a class="copy-email-inline" href="${mailtoHref()}" data-copy-email="${CONTACT_EMAIL}" aria-label="${escapeAttr(ui.copyEmail)}">
              <span>${CONTACT_EMAIL}</span>
              <small data-copy-status>${escapeHtml(ui.copy)}</small>
            </a>
            <a class="instant-chat-inline" href="${whatsappHref(contactMessage(copy.home.title, langCode))}" target="_blank" rel="noopener" aria-label="${escapeAttr(`${ui.instantChat} ${INSTANT_CHAT_DISPLAY}`)}" data-track="whatsapp_click">
              <span>${escapeHtml(ui.instantChat)}</span>
              <strong>${INSTANT_CHAT_DISPLAY}</strong>
            </a>
          </div>
        </div>
        <div class="footer-link-group">
          <strong>${escapeHtml(copy.nav.machines)}</strong>
          <a href="${localizedHref(langCode, "/machine-index.html")}">${escapeHtml(copy.nav.seoLibrary)}</a>
          <a href="${localizedHref(langCode, "/premade-pouch-packaging-machine.html")}">${escapeHtml(categoryFor(langCode, "Premade pouch machines"))}</a>
          <a href="${localizedHref(langCode, "/vertical-form-fill-seal-machine.html")}">VFFS</a>
          <a href="${localizedHref(langCode, "/sachet-stick-pack-machine.html")}">${escapeHtml(categoryFor(langCode, "Sachet and stick pack machines"))}</a>
        </div>
        ${
          langCode === "en"
            ? `<div class="footer-link-group">
          <strong>${escapeHtml(ui.buyerResources)}</strong>
          ${SEO_TOPIC_HUBS.slice(0, 4).map((hub) => `<a href="${localizedHref("en", hub.path)}">${escapeHtml(hub.label)}</a>`).join("\n          ")}
        </div>
        <div class="footer-link-group">
          <strong>${escapeHtml(ui.trustContact)}</strong>
          <a href="${localizedHref("en", "/about.html")}">${escapeHtml(ui.about)}</a>
          <a href="${localizedHref("en", "/editorial-policy.html")}">${escapeHtml(ui.editorial)}</a>
          <a href="${localizedHref("en", "/privacy.html")}">${escapeHtml(ui.privacy)}</a>
          <a href="${localizedHref("en", "/", "#quote")}">RFQ</a>
        </div>`
            : `<div class="footer-link-group">
          <strong>RFQ</strong>
          <a href="${localizedHref("en", "/privacy.html")}" hreflang="en">${escapeHtml(ui.privacyEnglish)}</a>
          <a href="${localizedHref(langCode, "/", "#quote")}">${escapeHtml(copy.nav.quote)}</a>
        </div>`
        }
      </div>
      <div class="footer-bottom">
        <span>${escapeHtml(ui.footerStatement)}</span>
        <a href="${localizedHref("en", "/privacy.html")}" hreflang="en">${escapeHtml(langCode === "en" ? ui.privacy : ui.privacyEnglish)}</a>
      </div>
    </footer>`;
}

function mobileContactBar(langCode, title = "packaging machine") {
  const ui = uiFor(langCode);
  return `<div class="mobile-contact-bar" aria-label="${escapeAttr(ui.quickContact)}" data-nosnippet>
      <a class="chat" href="${whatsappHref(contactMessage(title, langCode))}" target="_blank" rel="noopener" aria-label="${escapeAttr(`${ui.instantChat} ${INSTANT_CHAT_DISPLAY}`)}" data-track="whatsapp_click">${escapeHtml(ui.chat)}</a>
      <a class="mobile-primary-rfq" href="${localizedHref(langCode, "/", "#quote")}" data-track="mobile_rfq">RFQ</a>
    </div>`;
}

function pageHead({ langCode, routePath, title, description, image = DEFAULT_SOCIAL_IMAGE, imageAlt = title, type = "website", jsonLd = null, preloadImage = false }) {
  const copy = copyFor(langCode);
  const canonical = absoluteUrl(langCode, routePath);
  const imageUrl = image.startsWith("http") ? image : `${BASE_URL}/${image}`;
  const metaDescription = conciseMetaDescription(description);
  const alternateLocales = routeLanguages(routePath)
    .filter((lang) => lang.code !== langCode)
    .map((lang) => `    <meta property="og:locale:alternate" content="${escapeAttr(copyFor(lang.code).locale)}" />`)
    .join("\n");
  return `<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#081018" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttr(metaDescription)}" />
    <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />
${alternateTags(routePath)}
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    ${preloadImage ? `<link rel="preload" as="image" href="/${escapeAttr(image)}" fetchpriority="high" />` : ""}
    <meta property="og:locale" content="${escapeAttr(copy.locale)}" />
${alternateLocales}
    <meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(metaDescription)}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:alt" content="${escapeAttr(imageAlt)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(metaDescription)}" />
    <meta name="twitter:image" content="${imageUrl}" />
    <meta name="twitter:image:alt" content="${escapeAttr(imageAlt)}" />
    ${jsonLd ? `<script type="application/ld+json">${json(jsonLd)}</script>` : ""}
    <link rel="stylesheet" href="/styles.css?v=${ASSET_VERSION}" />
  </head>`;
}

function relatedFor(item) {
  const sameCategory = MACHINE_PAGES.filter((candidate) => candidate.category === item.category && candidate.slug !== item.slug);
  const fallback = MACHINE_PAGES.filter((candidate) => candidate.slug !== item.slug);
  return [...sameCategory, ...fallback].slice(0, 4);
}

const CATEGORY_DEFAULTS = {
  "Premade pouch machines": {
    packageStyles: ["stand-up pouch", "zipper pouch", "flat pouch", "special shaped pouch"],
    materials: ["finished composite pouch", "foil laminate pouch", "paper composite pouch"],
    workflow: ["Finished pouch feeding", "Pouch opening", "Filling or dosing", "Heat sealing", "Shaping", "Output"],
    lineFit: "Best when pouch appearance, zipper formats and finished-bag flexibility are more important than roll-film economy.",
  },
  "Vertical form fill seal machines": {
    packageStyles: ["pillow bag", "gusset bag", "block-bottom bag", "roll-film pouch"],
    materials: ["OPP/PE", "PET/PE", "OPP/CPP", "foil laminate roll film"],
    workflow: ["Product lifting", "Dosing", "Film forming", "Filling", "Vertical and horizontal sealing", "Cutting and output"],
    lineFit: "Best when film economy, continuous output and roll-film purchasing are the primary project drivers.",
  },
  "Tea and coffee packaging machines": {
    packageStyles: ["triangle tea bag", "flat tea bag", "drip coffee bag", "outer envelope"],
    materials: ["nylon mesh", "non-woven fabric", "corn fiber", "filter paper", "outer envelope film"],
    workflow: ["Small-dose measuring", "Inner bag forming", "Ultrasonic or heat sealing", "Outer envelope packing", "Counting and output"],
    lineFit: "Best for aroma-sensitive small-dose beverage products that need clean sealing and retail-ready outer packs.",
  },
  "Sachet and stick pack machines": {
    packageStyles: ["sachet", "stick pack", "three-side seal bag", "back seal bag", "round-corner sachet"],
    materials: ["heat-seal roll film", "foil laminate film", "composite sachet film"],
    workflow: ["Film unwinding", "Bag forming", "Dosing", "Sealing", "Cutting", "Counting"],
    lineFit: "Best for small-dose SKUs, samples and high-output portion packs.",
  },
  "Flow wrapping machines": {
    packageStyles: ["pillow pack", "flow wrap", "regular-object wrap", "tray pack"],
    materials: ["OPP", "CPP", "laminated flow-wrap film"],
    workflow: ["Product infeed", "Film forming", "Longitudinal sealing", "End sealing", "Cutting", "Output"],
    lineFit: "Best for regular solids, bakery items, trays and retail products that move continuously on a conveyor.",
  },
  "Filling and sealing machines": {
    packageStyles: ["bottle", "jar", "can", "cup", "stand-up pouch"],
    materials: ["container-specific seals", "lids", "caps", "food-grade contact parts"],
    workflow: ["Container feeding", "Positioning", "Filling", "Sealing or capping", "Coding", "Output"],
    lineFit: "Best when the container format is fixed and the core challenge is accurate filling, capping or sealing.",
  },
  "Complete filling lines": {
    packageStyles: ["bottle", "can", "carton", "shipping case", "integrated production line"],
    materials: ["project-specific primary and secondary packaging materials"],
    workflow: ["Feeding", "Filling", "Capping or sealing", "Inspection", "Labeling", "Cartoning or case packing"],
    lineFit: "Best for factories planning a connected line rather than a standalone packaging machine.",
  },
};

function fallbackMachineLabel(copy, key, fallback) {
  const labels = ENGINEERING_LABELS[copy.htmlLang] || ENGINEERING_LABELS.en;
  return copy.machine[key] || labels[key] || COPY.en.machine[key] || ENGINEERING_LABELS.en[key] || fallback;
}

function uniqueList(values) {
  return [...new Set(values.filter(Boolean))];
}

function homeDetailFor(langCode) {
  return HOME_DETAIL_COPY[langCode] || HOME_DETAIL_COPY.en;
}

function formatTemplate(template, values) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function defaultFor(item) {
  return CATEGORY_DEFAULTS[item.category] || {
    packageStyles: ["custom package format", "retail pack", "industrial pack"],
    materials: ["project-specific packaging materials"],
    workflow: ["Feeding", "Dosing", "Packing", "Sealing", "Output"],
    lineFit: "Best fit depends on the product behavior, target package and automation boundary.",
  };
}

function galleryFor(item) {
  return uniqueList([item.image, ...(item.gallery || [])]).slice(0, 4);
}

function specLookup(item, patterns) {
  const found = item.specs.find(([label]) => patterns.some((pattern) => label.toLowerCase().includes(pattern)));
  return found ? found[1] : "";
}

function sourceFor(item) {
  return (
    BROCHURE_SOURCE_BY_SLUG[item.slug] || {
      model: `${item.category.toLowerCase()} configurable platform`,
      page: "Brochure-derived equipment family",
    }
  );
}

function engineeringLabelsFor(langCode) {
  return ENGINEERING_LABELS[langCode] || ENGINEERING_LABELS.en;
}

function publicSourceModelFor(item, langCode) {
  const rawModel = sourceFor(item).model.replaceAll("QD-", "");
  if (langCode === "en") return rawModel;

  const modelIdentifier = rawModel.match(/^([A-Z0-9][A-Z0-9/-]*(?:\s+(?:and|or)\s+[A-Z0-9][A-Z0-9/-]*)?)(?=\s|$)/)?.[1];
  const localizedTitle = localizedItemFor(item, langCode).title;
  return modelIdentifier ? `${modelIdentifier} · ${localizedTitle}` : localizedTitle;
}

function localizedSourceEvidenceFor(item, langCode) {
  const source = sourceFor(item);
  const labels = engineeringLabelsFor(langCode);
  const singlePage = source.page.match(/^Brochure p\.(\d+)$/i);
  if (singlePage) return formatTemplate(labels.brochurePage, { page: singlePage[1] });

  const pageRange = source.page.match(/^Brochure pp\.([\d-]+)$/i);
  if (pageRange) return formatTemplate(labels.brochurePages, { pages: pageRange[1] });

  const noDedicatedModel = source.page.match(/^No dedicated brochure model; compare brochure pp\.([\d-]+)$/i);
  if (noDedicatedModel) return formatTemplate(labels.noDedicatedModel, { pages: noDedicatedModel[1] });

  if (source.page === "Brochure-derived equipment family") return labels.equipmentFamily;
  return langCode === "en" ? source.page : labels.sourceEvidence;
}

function visualEvidenceFor(item) {
  return VISUAL_EVIDENCE_BY_SLUG[item.slug] || { status: "Brochure-linked machine visual", placeholder: false };
}

function displayImageForMachine(item) {
  if (!visualEvidenceFor(item).placeholder) return heroImageFor(item.image);
  return heroImageFor(categoryPillarFor(item.category).image);
}

function categoryPillarFor(category) {
  return PILLAR_PAGES.find((page) => page.category === category) || PILLAR_PAGES[0];
}

function quoteHrefFor(langCode, item) {
  return localizedHref(langCode, "/", "#quote");
}

function acceptanceChecksFor(item, langCode = "en") {
  const labels = engineeringLabelsFor(langCode);
  const templates = ACCEPTANCE_TEMPLATES[langCode] || ACCEPTANCE_TEMPLATES.en;
  const values = {
    speed: labels.targetOutput,
    dosing: labels.selectedDosing,
    packageStyle: labels.finalPackage,
    model: localizedItemFor(item, langCode).title,
  };
  return templates.map((template) => template(values));
}

function comparisonLinksFor(item, langCode) {
  const sameCategory = MACHINE_PAGES.filter((candidate) => candidate.category === item.category && candidate.slug !== item.slug).slice(0, 5);
  const pillar = categoryPillarFor(item.category);
  const localizedCategory = categoryFor(langCode, item.category);
  return [
    {
      label: localizedCategory,
      href: localizedHref(langCode, pillar.path),
      text: formatTemplate(engineeringLabelsFor(langCode).compareFamily, { category: localizedCategory }),
    },
    ...sameCategory.map((candidate) => {
      const relatedItem = localizedItemFor(candidate, langCode);
      return {
        label: relatedItem.title,
        href: localizedHref(langCode, `/machines/${candidate.slug}.html`),
        text: relatedItem.summary,
      };
    }),
  ].slice(0, 6);
}

function machineBySlug(slug) {
  return MACHINE_PAGES.find((item) => item.slug === slug);
}

function topicPagesForMachine(item) {
  const matches = SEO_TOPIC_PAGES.filter((page) => page.machineSlugs.includes(item.slug));
  const newest = matches.slice(-6).reverse();
  const core = matches.slice(0, 6);
  return uniqueList([...newest, ...core].map((page) => page.path))
    .map((pagePath) => matches.find((page) => page.path === pagePath))
    .filter(Boolean)
    .slice(0, 10);
}

function relatedTopicsFor(page) {
  const machineSet = new Set(page.machineSlugs);
  const explicitRelated = new Set(page.relatedSlugs || []);
  const scored = SEO_TOPIC_PAGES.filter((candidate) => candidate.path !== page.path).map((candidate) => {
    let score = candidate.group === page.group ? 2 : 0;
    if (explicitRelated.has(candidate.slug)) score += 20;
    if ((candidate.relatedSlugs || []).includes(page.slug)) score += 12;
    score += candidate.machineSlugs.filter((slug) => machineSet.has(slug)).length * 3;
    score += candidate.searchTerms.filter((term) => page.searchTerms.includes(term)).length;
    return { candidate, score };
  });
  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .map((entry) => entry.candidate)
    .slice(0, 6);
}

function topicHubFor(group) {
  return SEO_TOPIC_HUBS.find((hub) => hub.group === group) || SEO_TOPIC_HUBS[0];
}

function topicTitleFor(page) {
  const candidate = `${page.title} | ${page.titleSuffix}`;
  return candidate.length <= 72 ? candidate : page.title;
}

function topicCardDetail(page) {
  const details = uniqueList([...(page.products || []).slice(0, 2), ...(page.formats || []).slice(0, 2)]);
  return details.slice(0, 4).join(" | ") || page.intentType;
}

function topicPageCount(group) {
  return SEO_TOPIC_PAGES.filter((page) => page.group === group).length;
}

function snapshotFor(item, localized, langCode) {
  const labels = copyFor(langCode).machine.snapshotLabels || COPY.en.machine.snapshotLabels;
  const defaults = defaultFor(item);
  const packageStyles = item.packageStyles || defaults.packageStyles;
  const speed = specLookup(item, ["speed", "output", "production"]);
  const dosing = specLookup(item, ["dosing", "filling", "measuring", "weighing"]);
  const detailFallback = TECHNICAL_DETAILS_FALLBACK[langCode] || TECHNICAL_DETAILS_FALLBACK.en;
  return [
    {
      label: labels[0],
      valueHtml: localizedTermListMarkup(item.applications, localized.applications, langCode, 4, detailFallback),
    },
    {
      label: labels[1],
      valueHtml: localizedTermListMarkup(packageStyles, localized.packageStyles, langCode, 4, detailFallback),
    },
    {
      label: labels[2],
      valueHtml: escapeHtml(speed || PROJECT_SPECIFIC_OUTPUT[langCode] || PROJECT_SPECIFIC_OUTPUT.en),
      valueAttr: speed && langCode !== "en" ? ' lang="en"' : "",
    },
    {
      label: labels[3],
      valueHtml: dosing
        ? escapeHtml(dosing)
        : localizedTermListMarkup(item.options, localized.options, langCode, 3, detailFallback),
      valueAttr: dosing && langCode !== "en" ? ' lang="en"' : "",
    },
  ];
}

function workflowFor(item) {
  const defaults = defaultFor(item);
  const process = specLookup(item, ["process", "workflow", "line process"]);
  if (item.workflow?.length) return item.workflow;
  if (process) return process.split(/,| and |;/).map((part) => part.trim()).filter(Boolean).slice(0, 7);
  return defaults.workflow;
}

function applicationSentenceMarkup(sourceApplication, application, localizedCategory, langCode) {
  const template = copyFor(langCode).machine.applicationTemplate || COPY.en.machine.applicationTemplate;
  const applicationToken = "__APPLICATION_TERM__";
  const sentence = formatTemplate(template, {
    application: applicationToken,
    category: localizedCategory.toLowerCase(),
  });
  return escapeHtml(sentence).replaceAll(
    applicationToken,
    `<span${sourceLanguageAttr(sourceApplication, application, langCode)}>${escapeHtml(application)}</span>`,
  );
}

function rfqDetailsFor(item, localized, langCode = "en") {
  const machineCopy = copyFor(langCode).machine;
  const packageStyles = item.packageStyles || defaultFor(item).packageStyles;
  const detailFallback = TECHNICAL_DETAILS_FALLBACK[langCode] || TECHNICAL_DETAILS_FALLBACK.en;
  return [
    `${escapeHtml(machineCopy.rfqProducts)}: ${localizedTermListMarkup(item.applications, localized.applications, langCode, 5, detailFallback)}.`,
    `${escapeHtml(machineCopy.rfqPackage)}: ${localizedTermListMarkup(packageStyles, localized.packageStyles, langCode, 4, detailFallback)}.`,
    `${escapeHtml(machineCopy.rfqOptions)}: ${localizedTermListMarkup(item.options, localized.options, langCode, 6, detailFallback)}.`,
    escapeHtml(machineCopy.rfqEvidence),
  ];
}

function localizedItemFor(item, langCode) {
  const defaults = defaultFor(item);
  const completeItem = {
    ...item,
    packageStyles: item.packageStyles || defaults.packageStyles,
    materials: item.materials || defaults.materials,
    workflow: workflowFor(item),
  };
  return localizedMachine(completeItem, langCode, categoryFor(langCode, item.category));
}

function sourceLanguageAttr(sourceValue, localizedValue, langCode) {
  if (
    langCode !== "en" &&
    /[a-z]{3}/i.test(String(sourceValue || "")) &&
    !hasMachineTermTranslation(sourceValue, langCode) &&
    String(sourceValue || "").trim().toLowerCase() === String(localizedValue || "").trim().toLowerCase()
  ) {
    return ' lang="en"';
  }
  return "";
}

function localizedTermPairs(sourceValues, localizedValues, langCode) {
  return (localizedValues || [])
    .map((localizedValue, index) => ({ sourceValue: sourceValues?.[index], localizedValue }))
    .filter(({ sourceValue }) => langCode === "en" || hasMachineTermTranslation(sourceValue, langCode));
}

function localizedTermListMarkup(sourceValues, localizedValues, langCode, limit = Infinity, fallback = "") {
  const markup = localizedTermPairs(sourceValues, localizedValues, langCode)
    .slice(0, limit)
    .map(
      ({ sourceValue, localizedValue }) =>
        `<span${sourceLanguageAttr(sourceValue, localizedValue, langCode)}>${escapeHtml(localizedValue)}</span>`,
    )
    .join(", ");
  return markup || escapeHtml(fallback);
}

function translatedTermsOnly(values, langCode) {
  if (langCode === "en") return values;
  return values
    .map((value) => ({ source: value, localized: localizeMachineTerm(value, langCode) }))
    .filter(({ source }) => hasMachineTermTranslation(source, langCode))
    .map(({ localized }) => localized);
}

function machineJsonLd(item, related, langCode) {
  const copy = copyFor(langCode);
  const engineeringLabels = engineeringLabelsFor(langCode);
  const routePath = `/machines/${item.slug}.html`;
  const url = absoluteUrl(langCode, routePath);
  const home = absoluteUrl(langCode, "/");
  const library = absoluteUrl(langCode, "/machine-index.html");
  const gallery = galleryFor(item);
  const localized = localizedItemFor(item, langCode);
  const visualEvidence = visualEvidenceFor(item);
  const acceptanceChecks = acceptanceChecksFor(item, langCode);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: localized.title,
        description: localized.summary,
        inLanguage: copy.htmlLang,
        dateModified: effectiveModifiedDate(item.updatedAt, MACHINE_UPDATED_AT.get(item.slug), SITE_REFRESH_DATE),
        isPartOf: { "@id": `${home}#website` },
        mainEntity: { "@id": `${url}#service` },
      },
      {
        "@type": "Service",
        "@id": `${url}#service`,
        url,
        name: localized.title,
        serviceType: categoryFor(langCode, item.category),
        category: categoryFor(langCode, item.category),
        description: localized.summary,
        ...(visualEvidence.placeholder ? {} : { image: gallery.map((image) => `${BASE_URL}/${heroImageFor(image)}`) }),
        provider: { "@id": ORGANIZATION_ID },
        mainEntityOfPage: { "@id": `${url}#webpage` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: engineeringLabels.home, item: home },
          { "@type": "ListItem", position: 2, name: copy.nav.seoLibrary, item: library },
          { "@type": "ListItem", position: 3, name: localized.title, item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#related-machines`,
        name: copy.machine.related,
        itemListElement: related.map((candidate, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: localizedItemFor(candidate, langCode).title,
          url: absoluteUrl(langCode, `/machines/${candidate.slug}.html`),
        })),
      },
    ],
  };
}

function machinePage(item, langCode) {
  const copy = copyFor(langCode);
  const engineeringLabels = engineeringLabelsFor(langCode);
  const routePath = `/machines/${item.slug}.html`;
  const related = relatedFor(item);
  const localizedCategory = categoryFor(langCode, item.category);
  const localized = localizedItemFor(item, langCode);
  const titleCandidate = `${localized.title} | ${copy.machine.titleSuffix}`;
  const title = titleCandidate.length <= 72 ? titleCandidate : localized.title;
  const description = localized.summary;
  const gallery = galleryFor(item);
  const snapshot = snapshotFor(item, localized, langCode);
  const workflow = localized.workflow;
  const packageStyles = localized.packageStyles;
  const materials = localized.materials;
  const applicationPairs = localizedTermPairs(item.applications, localized.applications, langCode);
  const workflowPairs = localizedTermPairs(workflowFor(item), workflow, langCode);
  const packageStylePairs = localizedTermPairs(item.packageStyles || defaultFor(item).packageStyles, packageStyles, langCode);
  const materialPairs = localizedTermPairs(item.materials || defaultFor(item).materials, materials, langCode);
  const featurePairs = localizedTermPairs(item.features, localized.features, langCode);
  const optionPairs = localizedTermPairs(item.options, localized.options, langCode);
  const detailFallback = TECHNICAL_DETAILS_FALLBACK[langCode] || TECHNICAL_DETAILS_FALLBACK.en;
  const productBehavior = localized.productBehavior || copy.machine.productBehaviorFallback;
  const lineFit = localized.lineFit || copy.machine.lineFitFallback;
  const visualEvidence = visualEvidenceFor(item);
  const visualCopy = visualCopyFor(langCode);
  const acceptanceChecks = acceptanceChecksFor(item, langCode);
  const comparisonLinks = comparisonLinksFor(item, langCode);
  const topicLinks = langCode === "en" ? topicPagesForMachine(item) : [];
  const quoteHref = quoteHrefFor(langCode, item);
  const quoteContext = {
    machine: localized.title,
    product: localized.applications.slice(0, 3).join(", "),
    source: item.slug,
  };
  const galleryImages = visualEvidence.placeholder ? [] : gallery.filter((image) => image !== item.image);
  const pageVisual = visualEvidence.placeholder ? DEFAULT_SOCIAL_IMAGE : heroImageFor(item.image);

  return `<!doctype html>
<html lang="${copy.htmlLang}" dir="${LANGUAGES.find((lang) => lang.code === langCode).dir}">
  ${pageHead({ langCode, routePath, title, description, image: pageVisual, imageAlt: visualEvidence.placeholder ? `${localizedCategory} — ${engineeringLabels.selectionReference}` : localized.title, type: "article", jsonLd: machineJsonLd(item, related, langCode), preloadImage: !visualEvidence.placeholder })}
  <body>
    ${skipLink(langCode)}
    ${nav(langCode, routePath)}
    <main class="article-main" id="main-content">
      <section class="article-hero">
        <div class="article-hero-copy">
          <p class="section-kicker">${escapeHtml(localizedCategory)}</p>
          <h1>${escapeHtml(localized.h1 || localized.title)}</h1>
          <p>${escapeHtml(description)}</p>
          <div class="article-hero-actions">
            <a class="button button-primary" href="${quoteHref}" ${rfqDataAttributes(quoteContext)} data-track="machine_hero_rfq">${escapeHtml(copy.machine.request)}</a>
            <a class="button button-secondary" href="${whatsappHref(contactMessage(localized.title, langCode))}" target="_blank" rel="noopener" data-track="whatsapp_click">WhatsApp</a>
          </div>
          <nav class="section-jumps" aria-label="${escapeAttr(engineeringLabels.onThisPage)}">
            <a href="#fit">${escapeHtml(copy.machine.overview)}</a>
            <a href="#specifications">${escapeHtml(copy.machine.technical)}</a>
            <a href="#acceptance">${escapeHtml(fallbackMachineLabel(copy, "acceptanceShort", "Acceptance"))}</a>
            <a href="#rfq-checklist">${escapeHtml(copy.machine.checklist)}</a>
          </nav>
        </div>
        ${
          visualEvidence.placeholder
            ? `<div class="article-hero-media machine-visual-pending" role="img" aria-label="${escapeAttr(`${localized.title}: ${visualCopy.pending}`)}">
          <span>${escapeHtml(visualCopy.title)}</span>
          <strong>${escapeHtml(publicSourceModelFor(item, langCode))}</strong>
          <p>${escapeHtml(visualCopy.body)}</p>
        </div>`
            : `<div class="article-hero-media">
          <img src="/${escapeAttr(heroImageFor(item.image))}" alt="${escapeAttr(localized.title)}" ${imageAttrs(heroImageFor(item.image), { priority: true })} />
        </div>`
        }
      </section>

      <article class="article-body">
        <nav class="breadcrumb" aria-label="${escapeAttr(engineeringLabels.breadcrumb)}">
          <a href="${localizedHref(langCode, "/")}">${escapeHtml(engineeringLabels.home)}</a>
          <span>/</span>
          <a href="${localizedHref(langCode, "/machine-index.html")}">${escapeHtml(copy.nav.seoLibrary)}</a>
          <span>/</span>
          <span>${escapeHtml(localized.title)}</span>
        </nav>

        <p class="article-lede">${escapeHtml(copy.machine.lede)}</p>

        <div class="machine-snapshot" id="fit" aria-label="${escapeAttr(copy.machine.overview)}">
          ${snapshot
            .map(
              ({ label, valueHtml, valueAttr = "" }) => `<div>
            <span>${escapeHtml(label)}</span>
            <strong${valueAttr}>${valueHtml}</strong>
          </div>`,
            )
            .join("\n          ")}
        </div>

        <div class="evidence-strip" aria-label="${escapeAttr(engineeringLabels.evidenceAria)}">
          <div>
            <span>${escapeHtml(fallbackMachineLabel(copy, "sourceModel", "Reference model family"))}</span>
            <strong>${escapeHtml(publicSourceModelFor(item, langCode))}</strong>
          </div>
          <div>
            <span>${escapeHtml(fallbackMachineLabel(copy, "sourceEvidence", "Brochure evidence"))}</span>
            <strong>${escapeHtml(localizedSourceEvidenceFor(item, langCode))}</strong>
          </div>
          <div>
            <span>${escapeHtml(fallbackMachineLabel(copy, "rfqSignal", "RFQ signal"))}</span>
            <strong>${localizedTermListMarkup(item.applications, localized.applications, langCode, 3, detailFallback)}</strong>
          </div>
          <div>
            <span>${escapeHtml(visualCopy.label)}</span>
            <strong>${escapeHtml(visualEvidence.placeholder ? visualCopy.pending : visualEvidence.status === "Category reference visual" ? visualCopy.reference : visualCopy.linked)}</strong>
          </div>
        </div>

        <h2>${escapeHtml(copy.machine.overview)}</h2>
        <p>${escapeHtml(localized.summary)} ${escapeHtml(productBehavior)}</p>

        ${
          galleryImages.length
            ? `<div class="machine-gallery" aria-label="${escapeAttr(engineeringLabels.machineVisuals)}">
          ${galleryImages
            .map(
              (image, index) => `<figure>
            <img src="/${escapeAttr(heroImageFor(image))}" alt="${escapeAttr(`${localized.title}: ${visualCopy.label}`)}" ${imageAttrs(heroImageFor(image))} />
            <figcaption>${escapeHtml(visualCopy.linked)}</figcaption>
          </figure>`,
            )
            .join("\n          ")}
        </div>`
            : ""
        }

        <h2>${escapeHtml(copy.machine.applications)}</h2>
        <div class="article-card-grid three">
          ${(applicationPairs.length ? applicationPairs : [{ sourceValue: "", localizedValue: localizedCategory, fallback: true }])
            .map(
              ({ sourceValue, localizedValue, fallback = false }) => `<div class="content-card">
            <h3${fallback ? "" : sourceLanguageAttr(sourceValue, localizedValue, langCode)}>${escapeHtml(localizedValue)}</h3>
            <p>${fallback ? escapeHtml(productBehavior) : applicationSentenceMarkup(sourceValue, localizedValue, localizedCategory, langCode)}</p>
          </div>`,
            )
            .join("\n          ")}
        </div>

        <h2>${escapeHtml(copy.machine.configuration)}</h2>
        <div class="process-flow">
          ${(workflowPairs.length ? workflowPairs : [{ sourceValue: "", localizedValue: detailFallback }]).map(({ sourceValue, localizedValue }, index) => `<div><span>${String(index + 1).padStart(2, "0")}</span><strong${sourceValue ? sourceLanguageAttr(sourceValue, localizedValue, langCode) : ""}>${escapeHtml(localizedValue)}</strong></div>`).join("\n          ")}
        </div>

        <h2>${escapeHtml(copy.machine.engineering)}</h2>
        <div class="engineering-grid">
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.packageFormats)}</h3>
            <ul>${(packageStylePairs.length ? packageStylePairs : [{ sourceValue: "", localizedValue: detailFallback }]).map(({ sourceValue, localizedValue }) => `<li${sourceValue ? sourceLanguageAttr(sourceValue, localizedValue, langCode) : ""}>${escapeHtml(localizedValue)}</li>`).join("")}</ul>
          </div>
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.compatibleMaterials)}</h3>
            <ul>${(materialPairs.length ? materialPairs : [{ sourceValue: "", localizedValue: detailFallback }]).map(({ sourceValue, localizedValue }) => `<li${sourceValue ? sourceLanguageAttr(sourceValue, localizedValue, langCode) : ""}>${escapeHtml(localizedValue)}</li>`).join("")}</ul>
          </div>
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.lineFitHeading)}</h3>
            <p>${escapeHtml(lineFit)}</p>
          </div>
        </div>

        <h2 id="specifications">${escapeHtml(copy.machine.technical)}</h2>
        <div class="article-table">
          <div class="row head">
            <span>${escapeHtml(copy.machine.parameter)}</span>
            <span>${escapeHtml(copy.machine.value)}</span>
          </div>
          ${localized.specs
            .map(
              ([label, value], index) => `<div class="row">
            <span${sourceLanguageAttr(item.specs[index]?.[0], label, langCode)}>${escapeHtml(label)}</span>
            <span${langCode === "en" ? "" : ' lang="en"'}>${escapeHtml(value)}</span>
          </div>`,
            )
            .join("\n          ")}
        </div>

        <h2 id="acceptance">${escapeHtml(fallbackMachineLabel(copy, "acceptance", "Acceptance checks before order"))}</h2>
        <div class="article-card-grid two compact-cards">
          ${acceptanceChecks
            .map(
              (line, index) => `<div class="content-card evidence-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <p>${escapeHtml(line)}</p>
          </div>`,
            )
            .join("\n          ")}
        </div>

        <h2>${escapeHtml(copy.machine.features)}</h2>
        <div class="content-columns">
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.features)}</h3>
            <ul>${(featurePairs.length ? featurePairs : [{ sourceValue: "", localizedValue: detailFallback }]).map(({ sourceValue, localizedValue }) => `<li${sourceValue ? sourceLanguageAttr(sourceValue, localizedValue, langCode) : ""}>${escapeHtml(localizedValue)}</li>`).join("")}</ul>
          </div>
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.options)}</h3>
            <ul>${(optionPairs.length ? optionPairs : [{ sourceValue: "", localizedValue: detailFallback }]).map(({ sourceValue, localizedValue }) => `<li${sourceValue ? sourceLanguageAttr(sourceValue, localizedValue, langCode) : ""}>${escapeHtml(localizedValue)}</li>`).join("")}</ul>
          </div>
        </div>

        <h2 id="rfq-checklist">${escapeHtml(copy.machine.checklist)}</h2>
        <div class="rfq-detail-grid">
          ${rfqDetailsFor(item, localized, langCode).map((line) => `<p>${line}</p>`).join("\n          ")}
        </div>
        <ul>${copy.machine.checklistItems.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>

        <h2>${escapeHtml(copy.machine.related)}</h2>
        ${localized.relatedIntro ? `<p>${escapeHtml(localized.relatedIntro)}</p>` : ""}
        <div class="article-card-grid">
          ${related
            .map((candidate) => {
              const relatedItem = localizedItemFor(candidate, langCode);
              return `<a class="content-card related-card" href="${localizedHref(langCode, `/machines/${candidate.slug}.html`)}">
            <h3>${escapeHtml(relatedItem.title)}</h3>
            <p>${escapeHtml(relatedItem.summary)}</p>
          </a>`;
            })
            .join("\n          ")}
        </div>

        ${
          topicLinks.length
            ? `<h2>Related application and engineering guides</h2>
        <div class="seo-page-grid compact-topic-grid">
          ${topicLinks
            .map(
              (topic) => `<a class="content-card seo-page-card" href="${localizedHref("en", topic.path)}">
            <span>${escapeHtml(topic.groupLabel)}</span>
            <h3>${escapeHtml(topic.title)}</h3>
            <p>${escapeHtml(topic.description)}</p>
            <small>${escapeHtml(topicCardDetail(topic))}</small>
          </a>`,
            )
            .join("\n          ")}
        </div>`
            : ""
        }

        <h2>${escapeHtml(fallbackMachineLabel(copy, "internalLinks", "Compare nearby machine paths"))}</h2>
        <div class="seo-link-grid">
          ${comparisonLinks
            .map(
              (link) => `<a href="${link.href}">
            <strong>${escapeHtml(link.label)}</strong>
            <span>${escapeHtml(link.text)}</span>
          </a>`,
            )
            .join("\n          ")}
        </div>

        <div class="article-cta" id="quote-next">
          <div>
            <h2>${escapeHtml(copy.machine.quoteHeading)}</h2>
            <p>${escapeHtml(copy.machine.quoteText)}</p>
          </div>
          <a class="button button-primary" href="${quoteHref}" ${rfqDataAttributes(quoteContext)} data-track="machine_bottom_rfq">${escapeHtml(copy.machine.request)}</a>
        </div>
      </article>
    </main>
    ${footer(langCode)}
    ${mobileContactBar(langCode, localized.title)}
    <script src="/script.js?v=${ASSET_VERSION}" defer></script>
  </body>
</html>`;
}

function pillarPage(page, langCode) {
  const copy = copyFor(langCode);
  const ui = uiFor(langCode);
  const engineeringLabels = engineeringLabelsFor(langCode);
  const routePath = page.path;
  const category = categoryFor(langCode, page.category);
  const fullTitle = `${category} | ${copy.machine.titleSuffix}`;
  const shortSuffix = {
    en: "Specs & RFQ Guide",
    es: "Especificaciones y RFQ",
    fr: "Spécifications et RFQ",
    de: "Technik & RFQ",
    pt: "Especificações e RFQ",
    ru: "Характеристики и RFQ",
    ar: "المواصفات وRFQ",
  }[langCode];
  const shortTitle = `${category} | ${shortSuffix}`;
  const title = fullTitle.length <= 72 ? fullTitle : shortTitle.length <= 72 ? shortTitle : category;
  const [summary, secondary] = PILLAR_TEXT[page.key][langCode] || PILLAR_TEXT[page.key].en;
  const related = MACHINE_PAGES.filter((item) => item.image === page.image || item.category === page.category);
  const adjacentCategories = PILLAR_PAGES.filter((candidate) => candidate.path !== page.path).slice(0, 5);
  const localizedPackageStyles = uniqueList(
    translatedTermsOnly(
      related.flatMap((item) => item.packageStyles || defaultFor(item).packageStyles),
      langCode,
    ),
  ).slice(0, 8);
  const localizedMaterials = uniqueList(
    translatedTermsOnly(
      related.flatMap((item) => item.materials || defaultFor(item).materials),
      langCode,
    ),
  ).slice(0, 8);
  const localizedOptions = uniqueList(
    translatedTermsOnly(related.flatMap((item) => item.options || []), langCode),
  ).slice(0, 8);
  const quoteContext = { machine: category, source: `category-${page.key}` };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${absoluteUrl(langCode, routePath)}#page`,
        name: title,
        description: `${summary} ${secondary}`,
        inLanguage: copy.htmlLang,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${absoluteUrl(langCode, routePath)}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: engineeringLabels.home, item: absoluteUrl(langCode, "/") },
          { "@type": "ListItem", position: 2, name: categoryFor(langCode, page.category), item: absoluteUrl(langCode, routePath) },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${absoluteUrl(langCode, routePath)}#category-machines`,
        name: categoryFor(langCode, page.category),
        itemListElement: related.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: localizedItemFor(item, langCode).title,
          url: absoluteUrl(langCode, `/machines/${item.slug}.html`),
        })),
      },
    ],
  };

  return `<!doctype html>
<html lang="${copy.htmlLang}" dir="${LANGUAGES.find((lang) => lang.code === langCode).dir}">
  ${pageHead({ langCode, routePath, title, description: `${summary} ${secondary}`, image: heroImageFor(page.image), imageAlt: category, type: "article", jsonLd, preloadImage: true })}
  <body>
    ${skipLink(langCode)}
    ${nav(langCode, routePath)}
    <main class="article-main" id="main-content">
      <section class="article-hero">
        <div class="article-hero-copy">
          <p class="section-kicker">${escapeHtml(categoryFor(langCode, page.category))}</p>
          <h1>${escapeHtml(categoryFor(langCode, page.category))}</h1>
          <p>${escapeHtml(summary)}</p>
          <div class="article-hero-actions">
            <a class="button button-primary" href="${localizedHref(langCode, "/", "#quote")}" ${rfqDataAttributes(quoteContext)} data-track="category_hero_rfq">${escapeHtml(copy.machine.request)}</a>
            <a class="button button-secondary" href="#category-machines">${escapeHtml(fallbackMachineLabel(copy, "categoryChooser", "Compare machines"))}</a>
          </div>
        </div>
        <div class="article-hero-media">
          <img src="/${escapeAttr(heroImageFor(page.image))}" alt="${escapeAttr(categoryFor(langCode, page.category))}" ${imageAttrs(heroImageFor(page.image), { priority: true })} />
        </div>
      </section>

      <article class="article-body">
        <nav class="breadcrumb" aria-label="${escapeAttr(engineeringLabels.breadcrumb || ui.breadcrumb)}">
          <a href="${localizedHref(langCode, "/")}">${escapeHtml(engineeringLabels.home)}</a>
          <span>/</span>
          <span>${escapeHtml(categoryFor(langCode, page.category))}</span>
        </nav>
        <p class="article-lede">${escapeHtml(secondary)}</p>
        <div class="machine-snapshot category-snapshot" aria-label="${escapeAttr(ui.categoryScope)}">
          <div><span>${escapeHtml(fallbackMachineLabel(copy, "categoryMachines", "Machine pages"))}</span><strong>${related.length}</strong></div>
          <div><span>${escapeHtml(fallbackMachineLabel(copy, "categoryFormat", "Primary format"))}</span><strong>${escapeHtml(categoryFor(langCode, page.category))}</strong></div>
          <div><span>${escapeHtml(fallbackMachineLabel(copy, "categoryRfq", "RFQ focus"))}</span><strong>${escapeHtml(copy.machine.rfqProducts)}</strong></div>
          <div><span>${escapeHtml(fallbackMachineLabel(copy, "categoryOutput", "Output basis"))}</span><strong>${escapeHtml(copy.machine.snapshotLabels[2])}</strong></div>
        </div>
        <h2>${escapeHtml(copy.machine.engineering)}</h2>
        <div class="article-card-grid three">
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.packageFormats)}</h3>
            <p>${escapeHtml(localizedPackageStyles.join(", ") || copy.machine.productBehaviorFallback)}</p>
          </div>
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.compatibleMaterials)}</h3>
            <p>${escapeHtml(localizedMaterials.join(", ") || copy.machine.rfqEvidence)}</p>
          </div>
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.snapshotLabels[3])}</h3>
            <p>${escapeHtml(localizedOptions.join(", ") || copy.machine.rfqEvidence)}</p>
          </div>
          <div class="content-card">
            <h3>${escapeHtml(copy.machine.lineFitHeading)}</h3>
            <p>${escapeHtml(copy.machine.lineFitFallback)}</p>
          </div>
        </div>

        <h2 id="category-machines">${escapeHtml(fallbackMachineLabel(copy, "categoryChooser", "Choose the closest machine page"))}</h2>
        <div class="category-machine-grid">
          ${related
            .map((item) => {
              const relatedItem = localizedItemFor(item, langCode);
              return `<a class="category-machine-card" href="${localizedHref(langCode, `/machines/${item.slug}.html`)}">
            <img src="/${escapeAttr(displayImageForMachine(item))}" alt="${escapeAttr(visualEvidenceFor(item).placeholder ? `${relatedItem.title} — ${visualCopyFor(langCode).reference}` : relatedItem.title)}" ${imageAttrs(displayImageForMachine(item))} />
            <div>
              <span>${escapeHtml(publicSourceModelFor(item, langCode))}</span>
              <h3>${escapeHtml(relatedItem.title)}</h3>
              <p>${escapeHtml(relatedItem.summary)}</p>
            </div>
          </a>`;
            })
            .join("\n          ")}
        </div>

        <h2>${escapeHtml(copy.machine.technical)}</h2>
        <div class="article-table">
          <div class="row head">
            <span>${escapeHtml(copy.machine.parameter)}</span>
            <span>${escapeHtml(copy.machine.value)}</span>
          </div>
          ${related
            .slice(0, 8)
            .map((item) => {
              const relatedItem = localizedItemFor(item, langCode);
              const outputReference = specLookup(item, ["speed", "output", "production"]);
              return `<div class="row">
            <span>${escapeHtml(relatedItem.title)}</span>
            <span${outputReference && langCode !== "en" ? ' lang="en"' : ""}>${escapeHtml(outputReference || PROJECT_SPECIFIC_OUTPUT[langCode] || PROJECT_SPECIFIC_OUTPUT.en)}</span>
          </div>`;
            })
            .join("\n          ")}
        </div>

        <h2>${escapeHtml(copy.machine.related)}</h2>
        <div class="seo-page-grid">
          ${adjacentCategories
            .map((item) => `<a class="content-card seo-page-card" href="${localizedHref(langCode, item.path)}">
            <span>${escapeHtml(copy.nav.seoLibrary)}</span>
            <h3>${escapeHtml(categoryFor(langCode, item.category))}</h3>
            <p>${escapeHtml(copy.home.catalogText)}</p>
          </a>`)
            .join("\n          ")}
        </div>
        <div class="article-cta">
          <div>
            <h2>${escapeHtml(copy.machine.quoteHeading)}</h2>
            <p>${escapeHtml(copy.machine.quoteText)}</p>
          </div>
          <a class="button button-primary" href="${localizedHref(langCode, "/", "#quote")}" ${rfqDataAttributes(quoteContext)} data-track="category_bottom_rfq">${escapeHtml(copy.machine.request)}</a>
        </div>
      </article>
    </main>
    ${footer(langCode)}
    ${mobileContactBar(langCode, categoryFor(langCode, page.category))}
    <script src="/script.js?v=${ASSET_VERSION}" defer></script>
  </body>
</html>`;
}

function homeJsonLd(langCode) {
  const copy = copyFor(langCode);
  const home = absoluteUrl(langCode, "/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(copy.home.description),
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: SITE_NAME,
        inLanguage: copy.htmlLang,
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "ItemList",
        "@id": `${absoluteUrl(langCode, "/")}#machine-catalog`,
        name: copy.home.portfolioTitle,
        itemListElement: PILLAR_PAGES.map((page, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: categoryFor(langCode, page.category),
          url: absoluteUrl(langCode, page.path),
        })),
      },
    ],
  };
}

function topicDiscoverySection(langCode, variant = "section") {
  if (langCode !== "en") return "";
  const featuredTopics = FEATURED_TOPIC_SLUGS.map((slug) => SEO_TOPIC_PAGES.find((page) => page.slug === slug)).filter(Boolean);
  const wrapperClass = variant === "article" ? "topic-library-block article-topic-block" : "section topic-library-block";
  return `<section class="${wrapperClass}" id="decision-library" aria-labelledby="decision-library-title">
        <div class="section-heading">
          <div>
            <p class="section-kicker">Decision library</p>
            <h2 id="decision-library-title">Find the right packaging path by product, format, industry, technology or operating problem.</h2>
          </div>
          <p>Start from the decision in front of you. Compare products to pack, package formats, dosing and sealing technologies, line-planning requirements, current industry constraints and symptom-led troubleshooting checks.</p>
        </div>
        <div class="topic-hub-row" aria-label="Packaging decision hubs">
          ${SEO_TOPIC_HUBS.map((hub) => `<a class="topic-hub-card" href="${localizedHref("en", hub.path)}">
            <span>${escapeHtml(hub.label)}</span>
            <strong>${topicPageCount(hub.group)}</strong>
            <small>${escapeHtml(hub.description)}</small>
          </a>`).join("\n          ")}
        </div>
        <div class="seo-page-grid topic-feature-grid">
          ${featuredTopics
            .map(
              (page) => `<a class="content-card seo-page-card" href="${localizedHref("en", page.path)}">
            <span>${escapeHtml(page.groupLabel)}</span>
            <h3>${escapeHtml(page.title)}</h3>
            <p>${escapeHtml(page.description)}</p>
            <small>${escapeHtml(topicCardDetail(page))}</small>
          </a>`,
            )
            .join("\n          ")}
        </div>
      </section>`;
}

function homePage(langCode) {
  const copy = copyFor(langCode);
  const lang = LANGUAGES.find((item) => item.code === langCode);
  const routePath = "/";
  const homeDetail = homeDetailFor(langCode);
  const experience = experienceFor(langCode);
  const ui = uiFor(langCode);
  const selectorModes = experience.selectorModes;
  return `<!doctype html>
<html lang="${copy.htmlLang}" dir="${lang.dir}">
  ${pageHead({ langCode, routePath, title: copy.home.title, description: copy.home.description, imageAlt: copy.home.h1, jsonLd: homeJsonLd(langCode), preloadImage: true })}
  <body>
    ${skipLink(langCode)}
    ${nav(langCode, routePath)}
    <main id="main-content">
      <span id="top" class="anchor-target" aria-hidden="true"></span>
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-machine" aria-hidden="true">
          <img src="/${escapeAttr(HERO_IMAGE)}" alt="" ${imageAttrs(HERO_IMAGE, { priority: true })} />
        </div>
        <div class="hero-panel" aria-hidden="true"></div>
        <div class="hero-content">
          <p class="eyebrow">${escapeHtml(copy.home.eyebrow)}</p>
          <h1 id="hero-title">${escapeHtml(copy.home.h1)}</h1>
          <p class="hero-lede">${escapeHtml(copy.home.lede)}</p>
          <div class="hero-actions" aria-label="${escapeAttr(ui.conversionActions)}">
            <a class="button button-primary" href="#quote" data-track="home_hero_rfq">${escapeHtml(copy.home.primaryCta)}</a>
            <a class="button button-secondary" href="${localizedHref(langCode, "/machine-index.html")}">${escapeHtml(copy.home.secondaryCta)}</a>
          </div>
          <div class="hero-tags" aria-label="${escapeAttr(ui.keyCapabilities)}">
            <span>${escapeHtml(categoryFor(langCode, "Premade pouch machines"))}</span>
            <span>${escapeHtml(categoryFor(langCode, "Vertical form fill seal machines"))}</span>
            <span>${escapeHtml(categoryFor(langCode, "Filling, cartoning and case lines"))}</span>
          </div>
        </div>
        <aside class="hero-console" aria-label="${escapeAttr(experience.proofLabel)}">
          <div class="console-header">
            <span>${escapeHtml(copy.machine.configuration)}</span>
            <strong>01—04</strong>
          </div>
          <ol class="decision-console">
            ${experience.proof.map(([number, label, detail]) => `<li><span>${escapeHtml(number)}</span><div><strong>${escapeHtml(label)}</strong><small>${escapeHtml(detail)}</small></div></li>`).join("")}
          </ol>
        </aside>
      </section>

      <section class="proof-strip" aria-label="${escapeAttr(experience.proofLabel)}">
        ${experience.proof.map(([number, label, detail]) => `<div><strong>${escapeHtml(number)}</strong><span>${escapeHtml(label)}</span><small>${escapeHtml(detail)}</small></div>`).join("")}
      </section>

      <section class="section selector-section" id="selector" aria-labelledby="selector-title">
        <div class="selector-shell">
          <div class="selector-copy">
            <p class="section-kicker">${escapeHtml(copy.nav.guide)}</p>
            <h2 id="selector-title">${escapeHtml(copy.home.guideTitle)}</h2>
            <p>${escapeHtml(copy.home.guideText)}</p>
            <div class="selector-route">
              <span>${escapeHtml(copy.machine.rfqProducts)}</span>
              <strong>${escapeHtml(copy.machine.rfqPackage)}</strong>
              <strong>${escapeHtml(copy.machine.rfqOptions)}</strong>
            </div>
          </div>
          <div class="selector-stack">
            <div class="selector-media">
              <img src="/public/assets/brochure/compact-premade-pouch.jpg" alt="${escapeAttr(categoryFor(langCode, "Premade pouch machines"))}" ${imageAttrs("public/assets/brochure/compact-premade-pouch.jpg")} />
              <div><strong>RFQ</strong><span>${escapeHtml(copy.machine.rfqEvidence)}</span></div>
            </div>
            <div class="selector-panel" aria-label="${escapeAttr(copy.machine.technical)}">
              <div class="selector-tabs" aria-label="${escapeAttr(copy.machine.configuration)}">
                <button class="spec-tab is-active" data-spec="pouch" data-spec-package="${escapeAttr(selectorModes.pouch[0])}" data-spec-dosing="${escapeAttr(selectorModes.pouch[1])}" data-spec-fit="${escapeAttr(selectorModes.pouch[2])}" data-spec-evidence="${escapeAttr(selectorModes.pouch[3])}" type="button" aria-pressed="true">${escapeHtml(categoryFor(langCode, "Premade pouch machines"))}</button>
                <button class="spec-tab" data-spec="vffs" data-spec-package="${escapeAttr(selectorModes.vffs[0])}" data-spec-dosing="${escapeAttr(selectorModes.vffs[1])}" data-spec-fit="${escapeAttr(selectorModes.vffs[2])}" data-spec-evidence="${escapeAttr(selectorModes.vffs[3])}" type="button" aria-pressed="false">VFFS</button>
                <button class="spec-tab" data-spec="specialty" data-spec-package="${escapeAttr(selectorModes.specialty[0])}" data-spec-dosing="${escapeAttr(selectorModes.specialty[1])}" data-spec-fit="${escapeAttr(selectorModes.specialty[2])}" data-spec-evidence="${escapeAttr(selectorModes.specialty[3])}" type="button" aria-pressed="false">${escapeHtml(categoryFor(langCode, "Tea and coffee packaging machines"))}</button>
              </div>
              <div class="selector-specs">
                <div><span>${escapeHtml(experience.selectorLabels[0])}</span><strong data-spec-field="package">${escapeHtml(selectorModes.pouch[0])}</strong></div>
                <div><span>${escapeHtml(experience.selectorLabels[1])}</span><strong data-spec-field="dosing">${escapeHtml(selectorModes.pouch[1])}</strong></div>
                <div><span>${escapeHtml(experience.selectorLabels[2])}</span><strong data-spec-field="fit">${escapeHtml(selectorModes.pouch[2])}</strong></div>
                <div><span>${escapeHtml(experience.selectorLabels[3])}</span><strong data-spec-field="evidence">${escapeHtml(selectorModes.pouch[3])}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section products-section" id="products" aria-labelledby="products-title">
        <div class="section-heading">
          <div>
            <p class="section-kicker">${escapeHtml(copy.home.machinePortfolio)}</p>
            <h2 id="products-title">${escapeHtml(copy.home.portfolioTitle)}</h2>
          </div>
          <p>${escapeHtml(copy.home.portfolioText)}</p>
        </div>
        <div class="product-grid">
          ${PILLAR_PAGES.map((page, index) => {
            const [summary] = PILLAR_TEXT[page.key][langCode] || PILLAR_TEXT[page.key].en;
            return `<a class="product-card${index === 0 ? " product-card-primary" : ""}" href="${localizedHref(langCode, page.path)}">
            <div class="product-media">
              <img src="/${escapeAttr(heroImageFor(page.image))}" alt="${escapeAttr(categoryFor(langCode, page.category))}" ${imageAttrs(heroImageFor(page.image))} />
            </div>
            <div class="product-body">
              <h3>${escapeHtml(categoryFor(langCode, page.category))}</h3>
              <p>${escapeHtml(summary)}</p>
              <span class="product-route">${escapeHtml(copy.home.secondaryCta)}</span>
            </div>
          </a>`;
          }).join("\n          ")}
        </div>
      </section>

      <section class="section line-section" id="guide" aria-labelledby="guide-title">
        <div class="section-heading">
          <div>
            <p class="section-kicker">${escapeHtml(copy.nav.guide)}</p>
            <h2 id="guide-title">${escapeHtml(copy.machine.configuration)}</h2>
          </div>
          <p>${escapeHtml(copy.home.guideText)}</p>
        </div>
        <div class="line-system">
          <div class="line-visual">
            <img src="/public/assets/brochure/granule-filling-line-cropped.jpg" alt="${escapeAttr(copy.home.portfolioTitle)}" ${imageAttrs("public/assets/brochure/granule-filling-line-cropped.jpg")} />
            <div class="line-visual-note">
              <span>${escapeHtml(copy.machine.configuration)}</span>
              <strong>${escapeHtml(copy.home.portfolioText)}</strong>
            </div>
          </div>
          <div class="line-flow" aria-label="${escapeAttr(copy.machine.configuration)}">
            ${ui.lineFlow.map((item) => `<article>
              <span>${escapeHtml(item.step)}</span>
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.text)}</p>
            </article>`).join("\n            ")}
          </div>
        </div>
        <div class="guide-grid procurement-grid">
          ${homeDetail.guideCards.map(
            (card, index) => `<article>
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(card.title || card[0])}</h3>
            <p>${escapeHtml(card.text || card[1])}</p>
          </article>`,
          ).join("\n          ")}
        </div>
      </section>

      <section class="mid-rfq-strip" aria-label="${escapeAttr(copy.nav.quote)}">
        <div>
          <span>RFQ</span>
          <strong>${escapeHtml(copy.home.quoteTitle)}</strong>
          <p>${escapeHtml(copy.home.quoteText)}</p>
        </div>
        <a class="button button-primary" href="#quote">${escapeHtml(copy.nav.quote)}</a>
      </section>

      <section class="section applications-section" id="applications" aria-labelledby="applications-title">
        <div class="section-heading">
          <div>
            <p class="section-kicker">${escapeHtml(copy.nav.applications)}</p>
            <h2 id="applications-title">${escapeHtml(copy.nav.applications)}</h2>
          </div>
          <p>${escapeHtml(copy.home.portfolioText)}</p>
        </div>
        <div class="solution-grid">
          ${homeDetail.applicationClusters.map(
            (item, index) => {
              const visual = APPLICATION_VISUALS[index] || APPLICATION_VISUALS[0];
              return `<article class="solution-card">
            <div class="solution-media">
              <img src="/${escapeAttr(heroImageFor(visual.image))}" alt="${escapeAttr(item.title || item[0])}" ${imageAttrs(heroImageFor(visual.image))} />
            </div>
            <div class="solution-copy">
              <h3>${escapeHtml(item.title || item[0])}</h3>
              <p>${escapeHtml(item.text || item[1])}</p>
              <a href="${localizedHref(langCode, visual.href)}">${escapeHtml(copy.home.secondaryCta)}</a>
            </div>
          </article>`;
            }
          ).join("\n          ")}
        </div>
      </section>

      <section class="section specs-section" id="specs" aria-labelledby="specs-title">
        <div class="section-heading">
          <div>
            <p class="section-kicker">${escapeHtml(copy.nav.specs)}</p>
            <h2 id="specs-title">${escapeHtml(copy.home.specsTitle)}</h2>
          </div>
          <p>${escapeHtml(copy.machine.rfqEvidence)}</p>
        </div>
        <div class="spec-matrix">
          ${homeDetail.specReferenceLines.map(([label, value], index) => `<article>
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(label)}</h3>
            <p>${escapeHtml(value)}</p>
          </article>`).join("\n          ")}
        </div>
      </section>

      <section class="section catalog-section" id="catalog" aria-labelledby="catalog-title">
        <div class="catalog-layout">
          <div class="catalog-copy">
            <p class="section-kicker">${escapeHtml(copy.nav.seoLibrary)}</p>
            <h2 id="catalog-title">${escapeHtml(copy.home.catalogTitle)}</h2>
            <p>${escapeHtml(copy.home.catalogText)}</p>
            <a class="button button-primary" href="${localizedHref(langCode, "/machine-index.html")}">${escapeHtml(copy.nav.catalog)}</a>
          </div>
          <div class="catalog-preview">
            ${PILLAR_PAGES.map((page) => {
              const count = MACHINE_PAGES.filter((item) => item.category === page.category).length;
              return `<a href="${localizedHref(langCode, page.path)}">
                <span>${count || "+"}</span>
                <strong>${escapeHtml(categoryFor(langCode, page.category))}</strong>
              </a>`;
            }).join("\n            ")}
          </div>
        </div>
      </section>

      ${topicDiscoverySection(langCode)}

      <section class="section faq-section" id="faq" aria-labelledby="faq-title">
        <div class="section-heading compact">
          <p class="section-kicker">${escapeHtml(copy.nav.faq)}</p>
          <h2 id="faq-title">${escapeHtml(copy.home.faqTitle)}</h2>
        </div>
        <div class="faq-grid">
          ${ui.faq.map(([question, answer]) => `<article><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("")}
        </div>
      </section>

      <section class="quote-section" id="quote" aria-labelledby="quote-title">
        <div class="quote-copy">
          <p class="section-kicker">RFQ</p>
          <h2 id="quote-title">${escapeHtml(copy.home.quoteTitle)}</h2>
          <p>${escapeHtml(copy.home.quoteText)}</p>
          <div class="quote-contact" aria-label="${escapeAttr(ui.directContact)}">
            <a class="contact-pill contact-mail" href="${mailtoHref(`RFQ: ${copy.home.quoteTitle}`, contactMessage(copy.home.quoteTitle, langCode))}" data-copy-email="${CONTACT_EMAIL}" aria-label="${escapeAttr(ui.copyEmail)}">
              <span>${escapeHtml(ui.copyEmail)}</span>
              <strong>${CONTACT_EMAIL}</strong>
              <small class="copy-hint" data-copy-status>${escapeHtml(ui.copyHint)}</small>
            </a>
            <a class="contact-pill contact-chat" href="${whatsappHref(contactMessage(copy.home.quoteTitle, langCode))}" target="_blank" rel="noopener">
              <span>${escapeHtml(ui.instantChat)}</span>
              <strong>${INSTANT_CHAT_DISPLAY}</strong>
              <small class="chat-hint">WhatsApp</small>
            </a>
          </div>
        </div>
        <noscript>
          <div class="noscript-rfq">
            <strong>${escapeHtml(ui.noScriptTitle)}</strong>
            <p>${escapeHtml(ui.noScriptBody)}</p>
            <a href="${mailtoHref(`RFQ: ${copy.home.quoteTitle}`, contactMessage(copy.home.quoteTitle, langCode))}">${escapeHtml(ui.copyEmail)}</a>
            <a href="${whatsappHref(contactMessage(copy.home.quoteTitle, langCode))}">WhatsApp</a>
          </div>
        </noscript>
        <form class="quote-form" action="/rfq-submit" method="post" accept-charset="UTF-8" data-lead-form hidden
          data-label-idle="${escapeAttr(experience.form.send)}"
          data-label-sending="${escapeAttr(experience.form.sending)}"
          data-status-success="${escapeAttr(experience.form.success)}"
          data-status-mailto="${escapeAttr(experience.form.mailto)}"
          data-status-failed="${escapeAttr(experience.form.failed)}"
          data-status-blocked="${escapeAttr(experience.form.blocked)}">
          <p class="rfq-required-note full">${escapeHtml(experience.form.requiredNote)}</p>
          <label><span>${escapeHtml(homeDetail.form[0])}</span><input name="name" type="text" autocomplete="name" maxlength="120" required /></label>
          <label><span>${escapeHtml(homeDetail.form[1])}</span><input name="email" type="email" autocomplete="email" maxlength="180" required /></label>
          <label><span>${escapeHtml(homeDetail.form[2])}</span><input name="company" type="text" autocomplete="organization" maxlength="180" /></label>
          <label><span>${escapeHtml(experience.form.country)}</span><input name="country" type="text" autocomplete="country-name" maxlength="120" required /></label>
          <label><span>${escapeHtml(experience.form.phone)}</span><input name="phone" type="tel" autocomplete="tel" maxlength="80" /></label>
          <label><span>${escapeHtml(homeDetail.form[3])}</span><select name="machine" required><option value="" selected disabled>—</option>${PILLAR_PAGES.map((page) => `<option value="${escapeAttr(categoryFor(langCode, page.category))}">${escapeHtml(categoryFor(langCode, page.category))}</option>`).join("")}</select></label>
          <label><span>${escapeHtml(homeDetail.form[4])}</span><input name="product" type="text" maxlength="220" required /></label>
          <label><span>${escapeHtml(experience.form.package)}</span><input name="package" type="text" maxlength="220" required /></label>
          <label><span>${escapeHtml(experience.form.fill)}</span><input name="fill" type="text" maxlength="120" required /></label>
          <label><span>${escapeHtml(experience.form.dimensions)}</span><input name="dimensions" type="text" maxlength="160" /></label>
          <label><span>${escapeHtml(homeDetail.form[5])}</span><input name="speed" type="text" maxlength="120" required /></label>
          <label class="full"><span>${escapeHtml(homeDetail.form[6])}</span><textarea name="message" rows="5" maxlength="4000"></textarea></label>
          <div class="privacy-consent full">
            <input id="privacy-acknowledged-${escapeAttr(langCode)}" name="privacy_acknowledged" type="checkbox" value="yes" required />
            <div>
              <label for="privacy-acknowledged-${escapeAttr(langCode)}">${escapeHtml(experience.form.consent)}</label>
              <a href="${localizedHref("en", "/privacy.html")}" hreflang="en" target="_blank" rel="noopener">${escapeHtml(experience.form.privacy)}</a>.
            </div>
          </div>
          <div class="hp-field" aria-hidden="true"><label>Website<input name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>
          <input name="page_url" type="hidden" />
          <input name="page_title" type="hidden" />
          <input name="referrer" type="hidden" />
          <input name="language" type="hidden" value="${escapeAttr(langCode)}" />
          <input name="rfq_source" type="hidden" />
          <input name="utm_source" type="hidden" />
          <input name="utm_medium" type="hidden" />
          <input name="utm_campaign" type="hidden" />
          <input name="utm_term" type="hidden" />
          <input name="utm_content" type="hidden" />
          <input name="gclid" type="hidden" />
          <input name="gbraid" type="hidden" />
          <input name="wbraid" type="hidden" />
          <button class="button button-primary full" type="submit">${escapeHtml(experience.form.send)}</button>
          <p class="form-status full" data-form-status role="status"></p>
        </form>
      </section>
    </main>
    ${footer(langCode)}
    ${mobileContactBar(langCode, copy.home.title)}
    <script src="/script.js?v=${ASSET_VERSION}" defer></script>
  </body>
</html>`;
}

function hubPage(langCode) {
  const copy = copyFor(langCode);
  const ui = uiFor(langCode);
  const routePath = "/machine-index.html";
  const hubUrl = absoluteUrl(langCode, routePath);
  const homeUrl = absoluteUrl(langCode, "/");
  const groups = [...new Set(MACHINE_PAGES.map((item) => item.category))].map((category) => ({
    category,
    items: MACHINE_PAGES.filter((item) => item.category === category),
  }));
  const itemList = MACHINE_PAGES.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: localizedItemFor(item, langCode).title,
    url: absoluteUrl(langCode, `/machines/${item.slug}.html`),
  }));

  return `<!doctype html>
<html lang="${copy.htmlLang}" dir="${LANGUAGES.find((lang) => lang.code === langCode).dir}">
  ${pageHead({
    langCode,
    routePath,
    title: copy.hub.title,
    description: copy.hub.description,
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${hubUrl}#webpage`,
          url: hubUrl,
          name: copy.hub.title,
          description: copy.hub.description,
          inLanguage: copy.htmlLang,
          isPartOf: { "@id": `${homeUrl}#website` },
          mainEntity: { "@id": `${hubUrl}#machine-library` },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${hubUrl}#breadcrumbs`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: copy.nav.homeLabel, item: homeUrl },
            { "@type": "ListItem", position: 2, name: copy.hub.title, item: hubUrl },
          ],
        },
        {
          "@type": "ItemList",
          "@id": `${hubUrl}#machine-library`,
          name: copy.hub.title,
          itemListElement: itemList,
        },
      ],
    },
  })}
  <body>
    ${skipLink(langCode)}
    ${nav(langCode, routePath)}
    <main class="article-main" id="main-content">
      <section class="article-hero seo-library-hero">
        <div class="article-hero-copy">
          <p class="section-kicker">${escapeHtml(copy.nav.seoLibrary)}</p>
          <h1>${escapeHtml(copy.hub.h1)}</h1>
          <p>${escapeHtml(copy.hub.lede)}</p>
        </div>
        <div class="seo-library-panel" aria-label="${escapeAttr(ui.catalogStats)}">
          <div><strong>${MACHINE_PAGES.length}</strong><span>${escapeHtml(copy.hub.statPages)}</span></div>
          <div><strong>${groups.length}</strong><span>${escapeHtml(copy.hub.statCategories)}</span></div>
          <div><strong>100+</strong><span>${escapeHtml(copy.hub.statIntent)}</span></div>
        </div>
      </section>

      ${topicDiscoverySection(langCode, "article")}

      <section class="article-body">
        <form class="catalog-search" role="search" action="${localizedHref(langCode, "/machine-index.html")}" data-catalog-search>
          <label for="catalog-search-input">${escapeHtml(copy.nav.catalog)}</label>
          <div>
            <input id="catalog-search-input" type="search" placeholder="${escapeAttr(ui.searchPlaceholder)}" autocomplete="off" data-catalog-search-input />
            <button class="button button-primary" type="submit">${escapeHtml(ui.search)}</button>
          </div>
          <p data-catalog-search-status aria-live="polite">${escapeHtml(ui.machinePagesAvailable(MACHINE_PAGES.length))}</p>
        </form>
        ${groups
          .map(
            (group) => `<h2>${escapeHtml(categoryFor(langCode, group.category))}</h2>
        <div class="seo-page-grid">
          ${group.items
            .map((item) => {
              const localized = localizedItemFor(item, langCode);
              const searchText = [localized.title, localized.summary, item.category, ...(item.keywords || []), ...(item.applications || []), ...(item.options || [])].join(" ");
              return `<a class="content-card seo-page-card" href="${localizedHref(langCode, `/machines/${item.slug}.html`)}" data-catalog-card data-search="${escapeAttr(searchText.toLowerCase())}">
            <span>${escapeHtml(categoryFor(langCode, item.category))}</span>
            <h3>${escapeHtml(localized.title)}</h3>
            <p>${escapeHtml(localized.summary)}</p>
            <small>${localizedTermListMarkup(item.applications, localized.applications, langCode, 3, categoryFor(langCode, item.category))}</small>
          </a>`;
            })
            .join("\n          ")}
        </div>`,
          )
          .join("\n\n        ")}
      </section>
    </main>
    ${footer(langCode)}
    ${mobileContactBar(langCode, copy.hub.title)}
    <script src="/script.js?v=${ASSET_VERSION}" defer></script>
  </body>
</html>`;
}

function topicJsonLd(page, relatedTopics, relatedMachines) {
  const url = absoluteUrl("en", page.path);
  const home = absoluteUrl("en", "/");
  const hub = absoluteUrl("en", page.hubPath);
  const articleImage = page.image
    ? heroImageFor(page.image)
    : displayImageForMachine(relatedMachines[0] || MACHINE_PAGES[0]);
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: SITE_NAME,
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        url,
        headline: page.h1,
        name: page.title,
        description: page.description,
        inLanguage: "en",
        image: `${BASE_URL}/${articleImage}`,
        dateModified: effectiveModifiedDate(page.updatedAt, SITE_REFRESH_DATE),
        about: uniqueList([...(page.products || []), ...(page.formats || [])]).slice(0, 12).map((item) => ({ "@type": "Thing", name: item })),
        mentions: relatedMachines.map((machine) => ({ "@type": "Thing", name: machine.title, url: absoluteUrl("en", `/machines/${machine.slug}.html`) })),
        ...(page.sourceNotes?.length ? { citation: page.sourceNotes.map((source) => source.url).filter(Boolean) } : {}),
        author: { "@id": ORGANIZATION_ID },
        publisher: { "@id": ORGANIZATION_ID },
        mainEntityOfPage: `${url}#webpage`,
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "en",
        dateModified: effectiveModifiedDate(page.updatedAt, SITE_REFRESH_DATE),
        isPartOf: { "@id": `${home}#website` },
        primaryImageOfPage: `${BASE_URL}/${articleImage}`,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: home },
          { "@type": "ListItem", position: 2, name: page.groupLabel, item: hub },
          { "@type": "ListItem", position: 3, name: page.title, item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#recommended-machines`,
        name: "Recommended machine paths",
        itemListElement: relatedMachines.map((machine, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: machine.title,
          url: absoluteUrl("en", `/machines/${machine.slug}.html`),
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${url}#related-decisions`,
        name: "Related packaging decisions",
        itemListElement: relatedTopics.map((topic, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: topic.title,
          url: absoluteUrl("en", topic.path),
        })),
      },
    ],
  };
}

function topicHubJsonLd(hub, pages) {
  const url = absoluteUrl("en", hub.path);
  const home = absoluteUrl("en", "/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: SITE_NAME,
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: hub.title,
        description: hub.description,
        inLanguage: "en",
        isPartOf: { "@id": `${home}#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("en", "/") },
          { "@type": "ListItem", position: 2, name: hub.label, item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#topic-pages`,
        name: hub.label,
        itemListElement: pages.map((page, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: page.title,
          url: absoluteUrl("en", page.path),
        })),
      },
    ],
  };
}

function topicHubPage(hub) {
  const pages = SEO_TOPIC_PAGES.filter((page) => page.group === hub.group);
  const machineLinks = uniqueList(pages.flatMap((page) => page.machineSlugs)).map(machineBySlug).filter(Boolean).slice(0, 12);
  return `<!doctype html>
<html lang="en" dir="ltr">
  ${pageHead({ langCode: "en", routePath: hub.path, title: hub.title, description: hub.description, image: DEFAULT_SOCIAL_IMAGE, type: "article", jsonLd: topicHubJsonLd(hub, pages) })}
  <body>
    ${skipLink("en")}
    ${nav("en", hub.path)}
    <main class="article-main" id="main-content">
      <section class="article-hero seo-library-hero topic-hub-hero">
        <div class="article-hero-copy">
          <p class="section-kicker">${escapeHtml(hub.label)}</p>
          <h1>${escapeHtml(hub.h1)}</h1>
          <p>${escapeHtml(hub.lede)}</p>
        </div>
        <div class="seo-library-panel" aria-label="${escapeAttr(hub.label)} statistics">
          <div><strong>${pages.length}</strong><span>topic pages</span></div>
          <div><strong>${machineLinks.length}</strong><span>linked machines</span></div>
          <div><strong>${uniqueList(pages.flatMap((page) => page.formats || [])).length}</strong><span>package formats</span></div>
        </div>
      </section>

      <section class="article-body topic-body">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <span>${escapeHtml(hub.label)}</span>
        </nav>
        <p class="article-lede">${escapeHtml(hub.description)}</p>
        <form class="catalog-search topic-search" role="search" action="${localizedHref("en", hub.path)}" data-topic-search>
          <label for="topic-search-${escapeAttr(hub.group)}">Find a packaging topic</label>
          <div>
            <input id="topic-search-${escapeAttr(hub.group)}" type="search" placeholder="Search product, package, machine or production problem" autocomplete="off" data-topic-search-input />
            <button class="button button-primary" type="submit">Search</button>
          </div>
          <p aria-live="polite" data-topic-search-status>${pages.length} topic pages available.</p>
        </form>
        <div class="seo-page-grid topic-index-grid">
          ${pages
            .map(
              (page) => {
                const searchText = [page.title, page.description, page.groupLabel, ...(page.products || []), ...(page.formats || []), ...(page.searchTerms || [])].join(" ");
                return `<a class="content-card seo-page-card" href="${localizedHref("en", page.path)}" data-topic-card data-search="${escapeAttr(searchText.toLowerCase())}">
            <span>${escapeHtml(page.groupLabel)}</span>
            <h3>${escapeHtml(page.title)}</h3>
            <p>${escapeHtml(page.description)}</p>
            <small>${escapeHtml(topicCardDetail(page))}</small>
          </a>`;
              },
            )
            .join("\n          ")}
        </div>

        <h2>Machine families linked from this hub</h2>
        <div class="seo-link-grid">
          ${machineLinks
            .map(
              (machine) => `<a href="${localizedHref("en", `/machines/${machine.slug}.html`)}">
            <strong>${escapeHtml(machine.title)}</strong>
            <span>${escapeHtml(machine.summary)}</span>
          </a>`,
            )
            .join("\n          ")}
        </div>
      </section>
    </main>
    ${footer("en")}
    ${mobileContactBar("en", hub.label)}
    <script src="/script.js?v=${ASSET_VERSION}" defer></script>
  </body>
</html>`;
}

function topicPage(page) {
  const hub = topicHubFor(page.group);
  const relatedMachines = page.machineSlugs.map(machineBySlug).filter(Boolean);
  const relatedTopics = relatedTopicsFor(page);
  const leadMachine = relatedMachines[0] || MACHINE_PAGES[0];
  const topicHeroImage = page.image ? heroImageFor(page.image) : displayImageForMachine(leadMachine);
  const isTroubleshooting = page.group === "troubleshooting";
  const productScope = page.products.slice(0, 3).join(", ") || "the target product";
  const formatScope = page.formats.slice(0, 2).join(", ") || "the proposed package";
  const quoteHref = localizedHref("en", "/", "#quote");
  const quoteContext = {
    machine: page.title,
    product: page.products.slice(0, 4).join(", "),
    source: page.slug,
  };
  const reviewedAt = effectiveModifiedDate(page.updatedAt, SITE_REFRESH_DATE);
  const quoteHeading = isTroubleshooting ? "Send the fault evidence for a practical machine review." : "Turn this decision into a practical RFQ.";
  const quoteText = isTroubleshooting
    ? "Send a full-cycle video, good and failed packs, current settings, material details, alarms and measured utilities. The review can focus on the first process deviation instead of guessing from the final defect."
    : `For ${page.title}, send representative ${productScope} samples, ${formatScope} samples, fill range, target output, voltage and required options. This lets the first reply identify a testable machine path instead of quoting a generic frame.`;

  return `<!doctype html>
<html lang="en" dir="ltr">
  ${pageHead({ langCode: "en", routePath: page.path, title: topicTitleFor(page), description: page.description, image: topicHeroImage, imageAlt: page.title, type: "article", jsonLd: topicJsonLd(page, relatedTopics, relatedMachines), preloadImage: true })}
  <body>
    ${skipLink("en")}
    ${nav("en", page.path)}
    <main class="article-main" id="main-content">
      <section class="article-hero topic-hero">
        <div class="article-hero-copy">
          <p class="section-kicker">${escapeHtml(page.groupLabel)}</p>
          <h1>${escapeHtml(page.h1)}</h1>
          <p>${escapeHtml(page.description)}</p>
          <div class="article-hero-actions">
            <a class="button button-primary" href="${quoteHref}" ${rfqDataAttributes(quoteContext)} data-track="topic_hero_rfq">${isTroubleshooting ? "Request evidence review" : "Request testable scope"}</a>
            <a class="button button-secondary" href="#recommended-machines">Compare machine paths</a>
          </div>
        </div>
        <div class="article-hero-media">
          <img src="/${escapeAttr(topicHeroImage)}" alt="${escapeAttr(page.title)}" ${imageAttrs(topicHeroImage, { priority: true })} />
        </div>
      </section>

      <article class="article-body topic-body">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="${localizedHref("en", hub.path)}">${escapeHtml(hub.label)}</a>
          <span>/</span>
          <span>${escapeHtml(page.title)}</span>
        </nav>

        <p class="article-lede">${escapeHtml(page.intent)}</p>

        <div class="article-review" aria-label="Content review and capability basis">
          <div><span>Decision intent</span><strong>${escapeHtml(page.intentType)}</strong></div>
          <div><span>Capability basis</span><strong>Authorized brochure and machine data</strong></div>
          <div><span>Reviewed</span><strong><time datetime="${escapeAttr(reviewedAt)}">${escapeHtml(reviewDate(reviewedAt))}</time></strong></div>
          <a href="${localizedHref("en", "/editorial-policy.html")}">Editorial method and reference limits</a>
        </div>

        <div class="machine-snapshot topic-snapshot" aria-label="Project decision snapshot">
          <div><span>Products</span><strong>${escapeHtml(page.products.slice(0, 5).join(", ") || page.title)}</strong></div>
          <div><span>Package formats</span><strong>${escapeHtml(page.formats.slice(0, 4).join(", ") || "Project-specific")}</strong></div>
          <div><span>Decision stage</span><strong>${escapeHtml(page.intentType)}</strong></div>
          <div><span>Machine paths</span><strong>${relatedMachines.length}</strong></div>
        </div>

        <h2>${isTroubleshooting ? "What the symptom can indicate" : "What the project must solve"}</h2>
        <div class="article-card-grid three">
          ${page.painPoints
            .map(
              (point, index) => `<div class="content-card evidence-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <p>${escapeHtml(point)}</p>
          </div>`,
            )
            .join("\n          ")}
        </div>

        ${
          page.contentSections?.length
            ? `<h2>Buyer analysis</h2>
        <div class="insight-section-stack">
          ${page.contentSections
            .map(
              (section) => `<section class="insight-section">
            <h3>${escapeHtml(section.heading)}</h3>
            <p>${escapeHtml(section.body)}</p>
          </section>`,
            )
            .join("\n          ")}
        </div>`
            : ""
        }

        ${
          page.diagnosticMatrix?.length
            ? `<h2>Symptom-to-action diagnostic matrix</h2>
        <div class="article-table diagnostic-table">
          <div class="row head">
            <span>Observed pattern</span>
            <span>Evidence to check</span>
            <span>Controlled next action</span>
          </div>
          ${page.diagnosticMatrix
            .map(
              ([symptom, check, action]) => `<div class="row">
            <span data-label="Symptom">${escapeHtml(symptom)}</span>
            <span data-label="Check">${escapeHtml(check)}</span>
            <span data-label="Action">${escapeHtml(action)}</span>
          </div>`,
            )
            .join("\n          ")}
        </div>`
            : ""
        }

        ${
          page.sourceNotes?.length
            ? `<h2>Sources and standards</h2>
        <div class="source-note-grid">
          ${page.sourceNotes
            .map(
              (source) => `<a class="source-note-card" href="${escapeAttr(source.url)}" target="_blank" rel="noopener noreferrer">
            <span>${escapeHtml(source.label)}</span>
            <p>${escapeHtml(source.note)}</p>
          </a>`,
            )
            .join("\n          ")}
        </div>`
            : ""
        }

        <h2 id="recommended-machines">Recommended machine paths</h2>
        <div class="category-machine-grid">
          ${relatedMachines
            .map(
              (machine) => `<a class="category-machine-card" href="${localizedHref("en", `/machines/${machine.slug}.html`)}">
            <img src="/${escapeAttr(displayImageForMachine(machine))}" alt="${escapeAttr(visualEvidenceFor(machine).placeholder ? `${machine.title} — category reference` : machine.title)}" ${imageAttrs(displayImageForMachine(machine))} />
            <div>
              <span>${escapeHtml(machine.category)}</span>
              <h3>${escapeHtml(machine.title)}</h3>
              <p>${escapeHtml(machine.summary)}</p>
            </div>
          </a>`,
            )
            .join("\n          ")}
        </div>

        <h2>Brochure-grounded capability references</h2>
        <p class="table-note">The rows below connect ${escapeHtml(page.title)} to published machine ranges and stated applications. Use them for shortlisting only; final output, accuracy and package quality require testing with the actual product, package material and line conditions.</p>
        <div class="article-table capability-reference-table">
          <div class="row head">
            <span>Machine path</span>
            <span>Selected brochure reference data</span>
          </div>
          ${relatedMachines
            .map(
              (machine) => `<div class="row">
            <span><a href="${localizedHref("en", `/machines/${machine.slug}.html`)}">${escapeHtml(machine.title)}</a></span>
            <span>${escapeHtml(machine.specs.slice(0, 3).map(([label, value]) => `${label}: ${value}`).join("; "))} Stated applications include ${escapeHtml(machine.applications.slice(0, 4).join(", "))}.</span>
          </div>`,
            )
            .join("\n          ")}
        </div>

        <h2>Specification signals to confirm</h2>
        <div class="article-table">
          <div class="row head">
            <span>Project input</span>
            <span>Why it changes the decision</span>
          </div>
          ${page.specFocus
            .map(
              (line, index) => `<div class="row">
            <span>Check ${String(index + 1).padStart(2, "0")}</span>
            <span>${escapeHtml(line)}</span>
          </div>`,
            )
            .join("\n          ")}
        </div>

        <h2>RFQ checklist for this page</h2>
        <div class="rfq-detail-grid">
          ${page.rfqChecklist.map((line) => `<p>${escapeHtml(line)}</p>`).join("\n          ")}
        </div>

        <h2>From evidence to a machine decision</h2>
        <div class="conversion-path-grid">
          <article>
            <span>01</span>
            <h3>Capture the evidence that changes the decision</h3>
            <p>${escapeHtml(page.rfqChecklist.slice(0, 2).join(" "))}</p>
          </article>
          <article>
            <span>02</span>
            <h3>${isTroubleshooting ? "Trace the first process deviation" : "Compare the closest machine families"}</h3>
            <p>${escapeHtml(relatedMachines.slice(0, 3).map((machine) => machine.title).join(", ") || "Premade pouch, VFFS, sachet, flow wrap or filling systems are matched by product behavior and pack format.")}</p>
          </article>
          <article>
            <span>03</span>
            <h3>${isTroubleshooting ? "Verify the correction under normal variation" : "Lock the acceptance test before price comparison"}</h3>
            <p>${isTroubleshooting ? "Run the corrected process with normal product, material and utility variation. Confirm reject rate and pack quality before making the new setting a standard." : `Set acceptance criteria for ${escapeHtml(page.title)}: usable output, accuracy, seal quality, reject logic, utilities, sample tests and documentation. Compare price only after suppliers accept the same test basis.`}</p>
          </article>
        </div>

        ${page.faq?.length ? `<h2>Common decision questions</h2>
        <div class="faq-grid topic-faq-grid">
          ${page.faq.map(([question, answer]) => `<article><h3>${escapeHtml(question)}</h3><p>${escapeHtml(answer)}</p></article>`).join("")}
        </div>` : ""}

        <h2>Related packaging decisions</h2>
        <div class="seo-page-grid compact-topic-grid">
          ${relatedTopics
            .map(
              (topic) => `<a class="content-card seo-page-card" href="${localizedHref("en", topic.path)}">
            <span>${escapeHtml(topic.groupLabel)}</span>
            <h3>${escapeHtml(topic.title)}</h3>
            <p>${escapeHtml(topic.description)}</p>
          </a>`,
            )
            .join("\n          ")}
        </div>

        <div class="article-cta">
          <div>
            <h2>${escapeHtml(quoteHeading)}</h2>
            <p>${escapeHtml(quoteText)}</p>
          </div>
          <a class="button button-primary" href="${quoteHref}" ${rfqDataAttributes(quoteContext)} data-track="topic_bottom_rfq">${isTroubleshooting ? "Request review" : "Request proposal"}</a>
        </div>
      </article>
    </main>
    ${footer("en")}
    ${mobileContactBar("en", page.title)}
    <script src="/script.js?v=${ASSET_VERSION}" defer></script>
  </body>
</html>`;
}

function trustPageJsonLd(page) {
  const url = absoluteUrl("en", page.path);
  const home = absoluteUrl("en", "/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "en",
        dateModified: effectiveModifiedDate(page.updatedAt, SITE_REFRESH_DATE),
        isPartOf: { "@id": `${home}#website` },
        about: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: home },
          { "@type": "ListItem", position: 2, name: page.title, item: url },
        ],
      },
    ],
  };
}

function trustPage(page) {
  const isPrivacy = page.path === "/privacy.html";
  return `<!doctype html>
<html lang="en" dir="ltr">
  ${pageHead({ langCode: "en", routePath: page.path, title: page.title, description: page.description, image: DEFAULT_SOCIAL_IMAGE, type: "article", jsonLd: trustPageJsonLd(page) })}
  <body>
    ${skipLink("en")}
    ${nav("en", page.path)}
    <main class="article-main" id="main-content">
      <section class="article-hero seo-library-hero trust-hero">
        <div class="article-hero-copy">
          <p class="section-kicker">${escapeHtml(page.kicker)}</p>
          <h1>${escapeHtml(page.h1)}</h1>
          <p>${escapeHtml(page.lede)}</p>
        </div>
        <div class="seo-library-panel trust-principles" aria-label="Content trust principles">
          <div><strong>01</strong><span>Brochure-linked machine data</span></div>
          <div><strong>02</strong><span>Visible evidence limits</span></div>
          <div><strong>03</strong><span>Sample-based RFQ validation</span></div>
        </div>
      </section>
      <article class="article-body topic-body trust-body">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>${escapeHtml(page.title)}</span></nav>
        <p class="article-lede">${escapeHtml(page.lede)}</p>
        <div class="insight-section-stack">
          ${page.sections.map(([heading, body]) => `<section class="insight-section"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(body)}</p></section>`).join("\n          ")}
        </div>
        <div class="article-cta">
          <div><h2>${isPrivacy ? "Need to make a privacy request?" : "Need a machine recommendation?"}</h2><p>${isPrivacy ? "Email the address below from the business account connected to the inquiry and identify the relevant RFQ or conversation." : "Send product photos, package samples, fill weight, output target, voltage and required options for an RFQ-focused machine shortlist."}</p></div>
          <a class="button button-primary" href="${isPrivacy ? mailtoHref("Privacy request", "Please identify the RFQ or conversation relevant to this request.") : "/#quote"}">${isPrivacy ? "Email privacy request" : "Start an RFQ"}</a>
        </div>
      </article>
    </main>
    ${footer("en")}
    ${mobileContactBar("en", page.title)}
    <script src="/script.js?v=${ASSET_VERSION}" defer></script>
  </body>
</html>`;
}

function sitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${ROUTES.flatMap((entry) =>
  routeLanguages(entry.path).map(
    (lang) => `  <url>
    <loc>${absoluteUrl(lang.code, entry.path)}</loc>
    <lastmod>${entry.lastmod || LASTMOD}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
${routeLanguages(entry.path).map((alternate) => `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${absoluteUrl(alternate.code, entry.path)}" />`).join("\n")}
    <xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(routeLanguages(entry.path).find((alternate) => alternate.code === "en")?.code || routeLanguages(entry.path)[0].code, entry.path)}" />
  </url>`,
  ),
).join("\n")}
</urlset>
`;
}

function validateNoDisallowed(filePath, html) {
  for (const token of DISALLOWED) {
    if (html.includes(token)) {
      throw new Error(`Disallowed token "${token}" found in ${filePath}`);
    }
  }

  const legacyInternalUrl = html.match(/(?:href|action)="(?:https:\/\/premadepouchmachines\.com)?\/[^"#?]*\.html(?:["#?])/i);
  const legacyStructuredUrl = html.match(/https:\/\/premadepouchmachines\.com\/[^"\s]*\.html(?:["#?\s])/i);
  if (legacyInternalUrl || legacyStructuredUrl) {
    throw new Error(`Legacy .html public URL found in ${filePath}: ${(legacyInternalUrl || legacyStructuredUrl)[0]}`);
  }

  const crawlableRfqParameter = html.match(
    /(?:href|action|target)\s*=\s*["'][^"']*[?&](?:machine|product|source|q)=/i,
  );
  const deprecatedSearchAction = html.match(/SearchAction|search_term_string/i);
  if (crawlableRfqParameter || deprecatedSearchAction) {
    throw new Error(`Crawlable parameter URL found in ${filePath}: ${(crawlableRfqParameter || deprecatedSearchAction)[0]}`);
  }

  const jsonLdPattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdPattern.exec(html))) {
    let data;
    try {
      data = JSON.parse(jsonLdMatch[1].trim());
    } catch (error) {
      throw new Error(`Invalid JSON-LD in ${filePath}: ${error.message}`);
    }

    const visit = (value, key = "") => {
      if (Array.isArray(value)) {
        value.forEach((item) => visit(item, key));
        return;
      }
      if (value && typeof value === "object") {
        Object.entries(value).forEach(([childKey, childValue]) => visit(childValue, childKey));
        return;
      }
      if (key === "@type" && typeof value === "string" && /(?:^|[/#:])SearchAction$/i.test(value)) {
        throw new Error(`Deprecated SearchAction found in ${filePath}`);
      }
      if (typeof value !== "string") return;
      let url;
      try {
        url = new URL(value, BASE_URL);
      } catch {
        return;
      }
      if (url.origin !== BASE_URL) return;
      const disallowedKeys = [...url.searchParams.keys()].filter((name) =>
        ["machine", "product", "source", "q"].includes(name.toLowerCase()),
      );
      if (disallowedKeys.length) {
        throw new Error(`Crawlable JSON-LD parameter URL found in ${filePath}: ${value}`);
      }
    };
    visit(data);
  }
}

function validateMachineEvidenceRegistry() {
  const machineSlugs = new Set(MACHINE_PAGES.map((item) => item.slug));
  const missingSources = [...machineSlugs].filter((slug) => !BROCHURE_SOURCE_BY_SLUG[slug]);
  const staleSources = Object.keys(BROCHURE_SOURCE_BY_SLUG).filter((slug) => !machineSlugs.has(slug));
  const vagueSources = Object.entries(BROCHURE_SOURCE_BY_SLUG)
    .filter(([, source]) => !source.model || !source.page || /\bsection\b/i.test(source.page))
    .map(([slug]) => slug);

  if (missingSources.length || staleSources.length || vagueSources.length) {
    throw new Error(
      [
        missingSources.length ? `Missing brochure evidence: ${missingSources.join(", ")}` : "",
        staleSources.length ? `Stale brochure evidence: ${staleSources.join(", ")}` : "",
        vagueSources.length ? `Vague brochure evidence: ${vagueSources.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }
}

function validateSourceModel() {
  validateMachineEvidenceRegistry();
  const problems = [];
  const publicRouteKeys = new Set();
  const outputFileKeys = new Set();
  const machineSlugs = new Set();
  const topicSlugs = new Set();
  const trustPaths = new Set(TRUST_PAGES.map((page) => normalizePath(page.path)));
  const languageCodes = LANGUAGES.map((lang) => lang.code);
  const expectedLanguageCodes = [...INVENTORY_CONTRACT.languageCodes].sort();

  if (!fs.existsSync(path.join(ROOT, ORGANIZATION_LOGO_PATH))) {
    problems.push(`Missing organization logo: ${ORGANIZATION_LOGO_PATH}`);
  } else {
    const logoDimensions = imageDimensions(ORGANIZATION_LOGO_PATH);
    if (!logoDimensions || logoDimensions.width < 112 || logoDimensions.height < 112) {
      problems.push(`Organization logo must be at least 112x112: ${ORGANIZATION_LOGO_PATH}`);
    }
  }

  if (LANGUAGES.length !== INVENTORY_CONTRACT.languages) {
    problems.push(`Language inventory changed: expected ${INVENTORY_CONTRACT.languages}, found ${LANGUAGES.length}`);
  }
  if (JSON.stringify([...languageCodes].sort()) !== JSON.stringify(expectedLanguageCodes)) {
    problems.push(`Language codes changed: expected ${expectedLanguageCodes.join(", ")}, found ${languageCodes.join(", ")}`);
  }

  for (const route of ROUTES) {
    const normalized = normalizePath(route.path);
    if (
      routeHasUnsafeSegments(route.path) ||
      /[?#]/.test(normalized) ||
      (normalized !== "/" && !/^\/(?:[^/?#]+\/)*[^/?#]+\.html$/.test(normalized))
    ) {
      problems.push(`Unsupported public route format: ${route.path}`);
    }
    if (!Array.isArray(route.languages) || !route.languages.length) {
      problems.push(`Route has no languages: ${route.path}`);
      continue;
    }
    for (const langCode of route.languages || []) {
      if (!languageCodes.includes(langCode)) problems.push(`Route uses unknown language ${langCode}: ${route.path}`);
      const key = absoluteUrl(langCode, normalized);
      if (publicRouteKeys.has(key)) problems.push(`Duplicate public route ${key}`);
      publicRouteKeys.add(key);

      const fileKey = path.resolve(routeToFile(langCode, normalized)).toLowerCase();
      if (outputFileKeys.has(fileKey)) problems.push(`Duplicate output file ${fileKey}`);
      outputFileKeys.add(fileKey);
    }
  }

  for (const item of MACHINE_PAGES) {
    if (!item.slug || machineSlugs.has(item.slug)) problems.push(`Duplicate or missing machine slug: ${item.slug || "(empty)"}`);
    machineSlugs.add(item.slug);
    if (!item.title || !item.summary || !item.category || !item.image) problems.push(`Incomplete machine identity: ${item.slug}`);
    for (const field of ["specs", "applications", "features", "options", "keywords"]) {
      if (!Array.isArray(item[field]) || !item[field].length) problems.push(`Machine has no ${field}: ${item.slug}`);
    }
    for (const field of ["gallery", "packageStyles", "materials", "workflow"]) {
      if (item[field] !== undefined && !Array.isArray(item[field])) problems.push(`Machine ${field} is not an array: ${item.slug}`);
    }

    for (const image of uniqueList([item.image, ...(Array.isArray(item.gallery) ? item.gallery : [])]).filter(Boolean)) {
      const publicImage = heroImageFor(image);
      if (!fs.existsSync(path.join(ROOT, publicImage))) {
        problems.push(`Missing machine image: ${item.slug} -> ${publicImage}`);
        continue;
      }
      const dimensions = imageDimensions(publicImage);
      if (!dimensions || !Number.isInteger(dimensions.width) || dimensions.width < 1 || !Number.isInteger(dimensions.height) || dimensions.height < 1) {
        problems.push(`Unreadable machine image dimensions: ${item.slug} -> ${publicImage}`);
      }
    }

    for (const lang of LANGUAGES) {
      try {
        const localized = localizedItemFor(item, lang.code);
        if (!localized.title || !localized.summary || !localized.h1) {
          problems.push(`Incomplete ${lang.code} machine copy: ${item.slug}`);
        }
        if (lang.code !== "en" && localized.title.trim().toLowerCase() === item.title.trim().toLowerCase()) {
          problems.push(`Untranslated ${lang.code} machine title: ${item.slug}`);
        }
      } catch (error) {
        problems.push(`Failed ${lang.code} machine localization: ${item.slug} -> ${error.message}`);
      }
    }
  }

  const localizedMachineFields = ["applications", "packageStyles", "materials", "workflow", "features", "options"];
  const localizedMachineTerms = uniqueList(
    MACHINE_PAGES.flatMap((item) =>
      localizedMachineFields.flatMap((field) => (Array.isArray(item[field]) ? item[field] : [])),
    ),
  );
  for (const term of localizedMachineTerms) {
    const translatedLanguages = NON_DEFAULT_LANGUAGES
      .filter((lang) => hasMachineTermTranslation(term, lang.code))
      .map((lang) => lang.code);
    if (translatedLanguages.length > 0 && translatedLanguages.length !== NON_DEFAULT_LANGUAGES.length) {
      const missingLanguages = NON_DEFAULT_LANGUAGES
        .map((lang) => lang.code)
        .filter((langCode) => !translatedLanguages.includes(langCode));
      problems.push(`Partial machine-term localization: "${term}" is missing ${missingLanguages.join(", ")}`);
    }
  }

  for (const page of SEO_TOPIC_PAGES) {
    if (!page.slug || topicSlugs.has(page.slug)) problems.push(`Duplicate or missing topic slug: ${page.slug || "(empty)"}`);
    topicSlugs.add(page.slug);
    if (!page.title || !page.description || !page.intent || !page.path || !page.hubPath) problems.push(`Incomplete topic identity: ${page.slug}`);
    for (const field of ["machineSlugs", "searchTerms", "painPoints", "specFocus", "rfqChecklist"]) {
      if (!Array.isArray(page[field]) || !page[field].length) problems.push(`Topic has no ${field}: ${page.slug}`);
    }
    for (const field of ["products", "formats", "relatedSlugs", "contentSections", "diagnosticMatrix", "sourceNotes", "faq"]) {
      if (page[field] !== undefined && !Array.isArray(page[field])) problems.push(`Topic ${field} is not an array: ${page.slug}`);
    }
    if (page.image && !fs.existsSync(path.join(ROOT, heroImageFor(page.image)))) {
      problems.push(`Missing topic image: ${page.slug} -> ${heroImageFor(page.image)}`);
    } else if (page.image) {
      const dimensions = imageDimensions(heroImageFor(page.image));
      if (!dimensions || dimensions.width < 1 || dimensions.height < 1) {
        problems.push(`Unreadable topic image dimensions: ${page.slug} -> ${heroImageFor(page.image)}`);
      }
    }
    for (const machineSlug of page.machineSlugs || []) {
      if (!machineSlugs.has(machineSlug)) problems.push(`Unknown machine link: ${page.slug} -> ${machineSlug}`);
    }
  }

  for (const page of SEO_TOPIC_PAGES) {
    for (const relatedSlug of page.relatedSlugs || []) {
      if (!topicSlugs.has(relatedSlug)) problems.push(`Unknown related topic: ${page.slug} -> ${relatedSlug}`);
      if (relatedSlug === page.slug) problems.push(`Self-related topic: ${page.slug}`);
    }
  }

  for (const route of TRUST_ROUTES) {
    if (!trustPaths.has(normalizePath(route.path))) problems.push(`Trust route has no page content: ${route.path}`);
  }
  for (const pagePath of trustPaths) {
    if (!TRUST_ROUTES.some((route) => normalizePath(route.path) === pagePath)) {
      problems.push(`Trust page is missing from public routes: ${pagePath}`);
    }
  }

  for (const route of ROUTES) {
    if (route.lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(route.lastmod)) {
      problems.push(`Invalid lastmod for ${route.path}: ${route.lastmod}`);
    }
  }

  if (MACHINE_PAGES.length < INVENTORY_CONTRACT.minimumMachines) {
    problems.push(`Machine inventory fell below ${INVENTORY_CONTRACT.minimumMachines}: ${MACHINE_PAGES.length}`);
  }
  if (SEO_TOPIC_PAGES.length < INVENTORY_CONTRACT.minimumTopics) {
    problems.push(`Topic inventory fell below ${INVENTORY_CONTRACT.minimumTopics}: ${SEO_TOPIC_PAGES.length}`);
  }
  if (publicRouteKeys.size < INVENTORY_CONTRACT.minimumPublicPages) {
    problems.push(`Public page inventory fell below ${INVENTORY_CONTRACT.minimumPublicPages}: ${publicRouteKeys.size}`);
  }
  for (const coverage of machineLocalizationCoverage()) {
    if (coverage.translated < INVENTORY_CONTRACT.minimumLocalizedMachineTerms) {
      problems.push(
        `${coverage.language} localized machine-term inventory fell below ${INVENTORY_CONTRACT.minimumLocalizedMachineTerms}: ${coverage.translated}`,
      );
    }
  }
  const inventoryFingerprint = routeInventoryFingerprint(publicRouteKeys);
  if (
    INVENTORY_CONTRACT.routeInventoryFingerprint &&
    inventoryFingerprint !== INVENTORY_CONTRACT.routeInventoryFingerprint
  ) {
    problems.push(
      `Public route identity changed: expected ${INVENTORY_CONTRACT.routeInventoryFingerprint}, found ${inventoryFingerprint}. Additions, removals and URL migrations require an explicit inventory-contract update.`,
    );
  }

  if (problems.length) {
    throw new Error(`Source model validation failed (${problems.length}):\n- ${problems.slice(0, 40).join("\n- ")}`);
  }

  return {
    languages: LANGUAGES.length,
    machines: MACHINE_PAGES.length,
    publicPages: publicRouteKeys.size,
    topics: SEO_TOPIC_PAGES.length,
  };
}

function validatePreparedHtml(langCode, filePath, html) {
  if (!/<main\b[^>]*\bid=["']main-content["'][^>]*>/i.test(html)) {
    throw new Error(`Missing main#main-content in ${filePath}`);
  }
  if (!/<a\b[^>]*\bclass=["'][^"']*\bskip-link\b[^"']*["'][^>]*\bhref=["']#main-content["'][^>]*>/i.test(html)) {
    throw new Error(`Missing skip link in ${filePath}`);
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    const attributes = match[1];
    for (const required of ["alt", "width", "height", "loading", "decoding"]) {
      if (!new RegExp(`\\b${required}=["'][^"']*["']`, "i").test(attributes)) {
        throw new Error(`Image missing ${required} in ${filePath}: ${match[0].slice(0, 160)}`);
      }
    }
  }

  const leadForm = html.match(/<form\b([^>]*\bdata-lead-form\b[^>]*)>([\s\S]*?)<\/form>/i);
  if (leadForm) {
    const opening = leadForm[1];
    if (!/\bmethod=["']post["']/i.test(opening) || !/\baction=["'][^"']+["']/i.test(opening)) {
      throw new Error(`Lead form must declare a nonempty POST action in ${filePath}`);
    }
    const requiredFields = ["name", "email", "country", "machine", "product", "package", "fill", "speed", "privacy_acknowledged"];
    for (const name of requiredFields) {
      const field = leadForm[2].match(
        new RegExp(`<(?:input|select|textarea)\\b[^>]*\\bname=["']${name}["'][^>]*>`, "i"),
      );
      if (!field || !/\brequired(?:\s|=|\/|>)/i.test(field[0])) {
        throw new Error(`Lead form field "${name}" is missing or not required in ${filePath}`);
      }
    }
    for (const label of leadForm[2].matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)) {
      if (/<input\b[^>]*type=["']checkbox["']/i.test(label[1]) && /<a\b/i.test(label[1])) {
        throw new Error(`Privacy link is nested inside a checkbox label in ${filePath}`);
      }
    }
    if (!/<noscript\b[^>]*>[\s\S]*?mailto:[\s\S]*?(?:wa\.me|whatsapp)/i.test(html)) {
      throw new Error(`Lead form has no noscript email and WhatsApp fallback in ${filePath}`);
    }
  }

  if (langCode !== "en") {
    const localizedUiHtml = html.replace(
      /<([a-z][\w:-]*)\b[^>]*\blang\s*=\s*["']en(?:-[a-z0-9]+)?["'][^>]*>[\s\S]*?<\/\1\s*>/gi,
      " ",
    );
    const buyerVisibleCopy = localizedUiHtml
      .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();
    for (const phrase of NON_ENGLISH_UI_FALLBACKS) {
      if (buyerVisibleCopy.includes(phrase.toLowerCase())) {
        throw new Error(`Known English UI fallback "${phrase}" remains in ${filePath}`);
      }
    }
    for (const term of untranslatedMachineTerms(langCode)) {
      const termIndex = buyerVisibleCopy.indexOf(term.toLowerCase());
      if (termIndex >= 0) {
        const context = buyerVisibleCopy.slice(Math.max(0, termIndex - 70), termIndex + term.length + 70);
        throw new Error(`Unmarked English machine term "${term}" remains in ${filePath}: ${context}`);
      }
    }
  }
}

function tagAttribute(tag, name) {
  const match = String(tag).match(
    new RegExp("(?:^|\\s)" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s\"'=<>`]+))", "i"),
  );
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").replaceAll("&amp;", "&").trim();
}

function linkTagsWithRel(markup, relToken) {
  return [...String(markup).matchAll(/<(?:xhtml:)?link\b[^>]*>/gi)]
    .map((match) => match[0])
    .filter((tag) => tagAttribute(tag, "rel").toLowerCase().split(/\s+/).includes(relToken));
}

function expectedAlternateMap(routePath) {
  const languages = routeLanguages(routePath);
  const defaultLang = languages.find((lang) => lang.code === "en") || languages[0];
  return new Map([
    ...languages.map((lang) => [lang.hreflang.toLowerCase(), absoluteUrl(lang.code, routePath)]),
    ["x-default", absoluteUrl(defaultLang.code, routePath)],
  ]);
}

function validateAlternateMarkup(markup, routePath, label) {
  const expected = expectedAlternateMap(routePath);
  const actual = new Map();
  for (const tag of linkTagsWithRel(markup, "alternate")) {
    const hreflang = tagAttribute(tag, "hreflang").toLowerCase();
    const href = tagAttribute(tag, "href");
    if (!hreflang || !href) throw new Error(`Incomplete hreflang alternate in ${label}: ${tag}`);
    if (actual.has(hreflang)) throw new Error(`Duplicate hreflang "${hreflang}" in ${label}`);
    actual.set(hreflang, href);
  }
  const missing = [...expected].filter(([hreflang, href]) => actual.get(hreflang) !== href);
  const unexpected = [...actual].filter(([hreflang, href]) => expected.get(hreflang) !== href);
  if (actual.size !== expected.size || missing.length || unexpected.length) {
    throw new Error(
      [
        `Hreflang mismatch in ${label}`,
        missing.length ? `missing/wrong: ${missing.map(([code, href]) => `${code}=${href}`).join(", ")}` : "",
        unexpected.length ? `unexpected: ${unexpected.map(([code, href]) => `${code}=${href}`).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }
}

function prepareRoute(langCode, routePath, html) {
  const filePath = routeToFile(langCode, routePath);
  const cleanHtml = html.replace(/[ \t]+$/gm, "");
  validateNoDisallowed(filePath, cleanHtml);
  validatePreparedHtml(langCode, filePath, cleanHtml);
  const canonicalTags = linkTagsWithRel(cleanHtml, "canonical");
  const expectedCanonical = absoluteUrl(langCode, routePath);
  const canonical = canonicalTags.length === 1 ? tagAttribute(canonicalTags[0], "href") : "";
  if (canonicalTags.length !== 1 || canonical !== expectedCanonical) {
    throw new Error(
      `Canonical mismatch for ${filePath}: expected exactly one ${expectedCanonical}, found ${canonicalTags.length} (${canonical || "missing"})`,
    );
  }
  validateAlternateMarkup(cleanHtml, routePath, filePath);
  return {
    canonical: expectedCanonical,
    filePath,
    html: cleanHtml,
    langCode,
    routePath,
  };
}

function renderManifest(sourceMetrics) {
  const entries = [];
  const canonicalKeys = new Set();
  const fileKeys = new Set();

  const add = (langCode, routePath, html) => {
    const entry = prepareRoute(langCode, routePath, html);
    const fileKey = path.resolve(entry.filePath).toLowerCase();
    if (canonicalKeys.has(entry.canonical)) throw new Error(`Duplicate rendered canonical: ${entry.canonical}`);
    if (fileKeys.has(fileKey)) throw new Error(`Duplicate rendered output file: ${entry.filePath}`);
    canonicalKeys.add(entry.canonical);
    fileKeys.add(fileKey);
    entries.push(entry);
  };

  for (const lang of LANGUAGES) {
    add(lang.code, "/", homePage(lang.code));
    add(lang.code, "/machine-index.html", hubPage(lang.code));
    for (const page of PILLAR_PAGES) add(lang.code, page.path, pillarPage(page, lang.code));
    for (const item of MACHINE_PAGES) add(lang.code, `/machines/${item.slug}.html`, machinePage(item, lang.code));
  }
  for (const hub of SEO_TOPIC_HUBS) add("en", hub.path, topicHubPage(hub));
  for (const page of SEO_TOPIC_PAGES) add("en", page.path, topicPage(page));
  for (const page of TRUST_PAGES) add("en", page.path, trustPage(page));

  const expectedCanonicals = new Set(
    ROUTES.flatMap((route) => (route.languages || []).map((langCode) => absoluteUrl(langCode, route.path))),
  );
  const missing = [...expectedCanonicals].filter((url) => !canonicalKeys.has(url));
  const unexpected = [...canonicalKeys].filter((url) => !expectedCanonicals.has(url));
  if (entries.length !== sourceMetrics.publicPages || missing.length || unexpected.length) {
    throw new Error(
      [
        `Rendered ${entries.length} pages but source model declares ${sourceMetrics.publicPages}`,
        missing.length ? `Missing rendered routes: ${missing.slice(0, 12).join(", ")}` : "",
        unexpected.length ? `Unexpected rendered routes: ${unexpected.slice(0, 12).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }

  const sitemapXml = sitemap();
  const sitemapBlocks = [...sitemapXml.matchAll(/<url>\s*([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  const sitemapByUrl = new Map();
  for (const block of sitemapBlocks) {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1]?.replaceAll("&amp;", "&").trim();
    if (!loc) throw new Error("Sitemap URL block is missing loc.");
    if (sitemapByUrl.has(loc)) throw new Error(`Duplicate sitemap loc: ${loc}`);
    sitemapByUrl.set(loc, block);
  }
  const sitemapUrls = new Set(sitemapByUrl.keys());
  const sitemapMissing = [...canonicalKeys].filter((url) => !sitemapUrls.has(url));
  const sitemapUnexpected = [...sitemapUrls].filter((url) => !canonicalKeys.has(url));
  if (sitemapBlocks.length !== entries.length || sitemapUrls.size !== entries.length || sitemapMissing.length || sitemapUnexpected.length) {
    throw new Error(
      [
        `Sitemap contains ${sitemapBlocks.length} blocks / ${sitemapUrls.size} unique URLs but manifest contains ${entries.length}`,
        sitemapMissing.length ? `Sitemap missing: ${sitemapMissing.slice(0, 12).join(", ")}` : "",
        sitemapUnexpected.length ? `Sitemap unexpected: ${sitemapUnexpected.slice(0, 12).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }
  for (const entry of entries) {
    const block = sitemapByUrl.get(entry.canonical);
    validateAlternateMarkup(block, entry.routePath, `sitemap entry ${entry.canonical}`);
    const sitemapLastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1]?.trim();
    const route = ROUTES.find((candidate) => normalizePath(candidate.path) === normalizePath(entry.routePath));
    const expectedLastmod = route?.lastmod || LASTMOD;
    if (sitemapLastmod !== expectedLastmod) {
      throw new Error(
        `Sitemap lastmod mismatch for ${entry.canonical}: expected ${expectedLastmod}, found ${sitemapLastmod || "(missing)"}`,
      );
    }
  }

  return { entries, sitemapXml };
}

function normalizedWindowsPathKey(value) {
  return String(value).normalize("NFC").toLowerCase();
}

function assertSafeTopLevelReplacement(relativeTarget) {
  const candidate = String(relativeTarget || "");
  const lowerCandidate = candidate.toLowerCase();
  const isGeneratedDirectory = GENERATED_ROUTE_DIRS.includes(lowerCandidate);
  const isGeneratedFile = candidate === "sitemap.xml" || /^[a-z0-9][a-z0-9._-]*\.html$/i.test(candidate);
  const reservedWindowsName = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(candidate);

  if (
    !candidate ||
    candidate !== path.basename(candidate) ||
    candidate.includes("/") ||
    candidate.includes("\\") ||
    candidate.includes(":") ||
    candidate.includes("\0") ||
    /[. ]$/.test(candidate) ||
    reservedWindowsName ||
    (!isGeneratedDirectory && !isGeneratedFile)
  ) {
    throw new Error(`Unsafe generated replacement target: ${candidate || "(empty)"}`);
  }

  return candidate;
}

function rootHtmlTargets(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.name.toLowerCase().endsWith(".html"))
    .map((entry) => entry.name);
}

function assertReplaceableGeneratedDirectory(relativeDir) {
  assertSafeTopLevelReplacement(relativeDir);
  const directory = resolveInsideRoot(relativeDir);
  const directoryStats = lstatIfPresent(directory);
  if (!directoryStats) return;
  if (directoryStats.isSymbolicLink() || !directoryStats.isDirectory()) {
    throw new Error(`Generated-directory target is not a normal directory: ${directory}`);
  }

  const pending = [directory];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      const stats = lstatIfPresent(entryPath);
      if (!stats) throw new Error(`Generated directory changed during validation: ${entryPath}`);
      if (stats.isSymbolicLink()) {
        throw new Error(`Generated directory contains a symbolic link or junction: ${entryPath}`);
      }
      if (stats.isDirectory()) {
        pending.push(entryPath);
        continue;
      }
      if (!stats.isFile() || !entry.name.toLowerCase().endsWith(".html")) {
        throw new Error(`Generated directory contains a non-HTML artifact: ${entryPath}`);
      }
    }
  }
}

function assertReplaceableGeneratedFile(relativeFile) {
  assertSafeTopLevelReplacement(relativeFile);
  const filePath = resolveInsideRoot(relativeFile);
  const stats = lstatIfPresent(filePath);
  if (!stats) return;
  if (stats.isSymbolicLink() || !stats.isFile()) {
    throw new Error(`Generated-file target is not a normal file: ${filePath}`);
  }
}

function assertNoUnfinishedBuildWorkspaces() {
  const unfinished = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .map((entry) => entry.name)
    .filter((name) => name.startsWith(BUILD_STAGE_PREFIX) || name.startsWith(BUILD_BACKUP_PREFIX));
  if (unfinished.length) {
    throw new Error(
      `Unfinished generated-site transaction found: ${unfinished.join(", ")}. Inspect and recover it before generating again.`,
    );
  }
}

function generationLockPath() {
  return resolveInsideRoot(".site-build.lock");
}

function acquireGenerationLock() {
  const lockPath = generationLockPath();
  const token = randomUUID();
  let descriptor;
  try {
    descriptor = fs.openSync(lockPath, "wx");
    fs.writeFileSync(
      descriptor,
      `${JSON.stringify({ pid: process.pid, token, startedAt: new Date().toISOString() })}\n`,
      "utf8",
    );
    fs.fsyncSync(descriptor);
  } catch (error) {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (descriptor !== undefined && lstatIfPresent(lockPath)) {
      try {
        const stats = lstatIfPresent(lockPath);
        if (stats && !stats.isSymbolicLink() && stats.isFile()) fs.unlinkSync(lockPath);
      } catch {
        // Preserve the original lock-acquisition error; a residual lock is intentionally fail-closed.
      }
    }
    throw new Error(`Could not acquire the generated-site lock at ${lockPath}: ${error.message}`);
  }
  fs.closeSync(descriptor);
  return { lockPath, token };
}

function releaseGenerationLock(lock) {
  const { lockPath, token } = lock;
  try {
    const stats = lstatIfPresent(lockPath);
    if (!stats) return;
    if (stats.isSymbolicLink() || !stats.isFile()) {
      throw new Error("lock path is not a normal file");
    }
    const currentLock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
    if (currentLock.token !== token || currentLock.pid !== process.pid) {
      throw new Error("lock ownership changed; refusing to remove another process's lock");
    }
    fs.unlinkSync(lockPath);
  } catch (error) {
    console.warn(`Generated-site lock cleanup failed; inspect ${lockPath}: ${error.message}`);
  }
}

function assertWorkspacePath(workspacePath, prefix) {
  const resolved = path.resolve(workspacePath);
  if (
    path.dirname(resolved) !== ROOT ||
    !path.basename(resolved).startsWith(prefix) ||
    resolved === ROOT
  ) {
    throw new Error(`Refusing unsafe build-workspace path: ${resolved}`);
  }
  const stats = lstatIfPresent(resolved);
  if (stats) {
    if (stats.isSymbolicLink() || !stats.isDirectory()) {
      throw new Error(`Build workspace is not a normal directory: ${resolved}`);
    }
  }
  return resolved;
}

function cleanupBuildWorkspace(workspacePath, prefix) {
  try {
    const resolved = assertWorkspacePath(workspacePath, prefix);
    if (lstatIfPresent(resolved)) fs.rmSync(resolved, { recursive: true, force: true });
    return "";
  } catch (error) {
    return error.message;
  }
}

function manifestRelativeFile(entry) {
  const relative = path.relative(ROOT, entry.filePath);
  if (
    !relative ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative) ||
    !relative.toLowerCase().endsWith(".html")
  ) {
    throw new Error(`Manifest output is outside the generated HTML boundary: ${entry.filePath}`);
  }
  return relative;
}

function pathInsideWorkspace(workspacePath, relativePath) {
  const workspaceName = path.basename(workspacePath);
  const target = resolveInsideRoot(workspaceName, relativePath);
  const relative = path.relative(workspacePath, target);
  if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`Build-workspace path escapes its boundary: ${target}`);
  }
  return target;
}

function stageRenderedManifest(manifest) {
  const stageRoot = fs.mkdtempSync(path.join(ROOT, BUILD_STAGE_PREFIX));
  try {
    assertWorkspacePath(stageRoot, BUILD_STAGE_PREFIX);
    for (const entry of manifest.entries) {
      const stagedFile = pathInsideWorkspace(stageRoot, manifestRelativeFile(entry));
      fs.mkdirSync(path.dirname(stagedFile), { recursive: true });
      fs.writeFileSync(stagedFile, entry.html, { encoding: "utf8", flag: "wx" });
    }
    const stagedSitemap = pathInsideWorkspace(stageRoot, "sitemap.xml");
    fs.writeFileSync(stagedSitemap, manifest.sitemapXml, { encoding: "utf8", flag: "wx" });
    return stageRoot;
  } catch (error) {
    const cleanupError = cleanupBuildWorkspace(stageRoot, BUILD_STAGE_PREFIX);
    throw new Error(
      `Could not stage the generated site: ${error.message}${cleanupError ? ` | staging cleanup failed: ${cleanupError}` : ""}`,
    );
  }
}

function filesUnder(directory) {
  const files = [];
  const pending = [directory];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      const stats = lstatIfPresent(entryPath);
      if (!stats) throw new Error(`Build tree changed during validation: ${entryPath}`);
      if (stats.isSymbolicLink()) throw new Error(`Build tree contains a symbolic link or junction: ${entryPath}`);
      if (stats.isDirectory()) pending.push(entryPath);
      else if (stats.isFile()) files.push(path.relative(directory, entryPath));
      else throw new Error(`Build tree contains an unsupported filesystem node: ${entryPath}`);
    }
  }
  return files;
}

function filesystemNodeFingerprint(targetPath) {
  const initialStats = lstatIfPresent(targetPath);
  if (!initialStats) return "missing";
  const digest = createHash("sha256");

  function visit(currentPath, relativePath) {
    const stats = lstatIfPresent(currentPath);
    if (!stats) throw new Error(`Generated target changed while fingerprinting: ${currentPath}`);
    if (stats.isSymbolicLink()) throw new Error(`Generated target contains a symbolic link or junction: ${currentPath}`);
    const portablePath = String(relativePath || ".").split(path.sep).join("/").normalize("NFC");
    if (stats.isDirectory()) {
      digest.update(`D\0${portablePath}\n`);
      const entries = fs
        .readdirSync(currentPath, { withFileTypes: true })
        .map((entry) => entry.name)
        .sort((left, right) => normalizedWindowsPathKey(left).localeCompare(normalizedWindowsPathKey(right)));
      for (const entryName of entries) {
        visit(path.join(currentPath, entryName), relativePath ? path.join(relativePath, entryName) : entryName);
      }
      return;
    }
    if (!stats.isFile()) throw new Error(`Generated target contains an unsupported filesystem node: ${currentPath}`);
    digest.update(`F\0${portablePath}\0${createHash("sha256").update(fs.readFileSync(currentPath)).digest("hex")}\n`);
  }

  visit(targetPath, "");
  return `${initialStats.isDirectory() ? "directory" : "file"}:${digest.digest("hex")}`;
}

function verifyManifestAtRoot(manifest, outputRoot) {
  const expected = new Map(
    manifest.entries.map((entry) => [normalizedWindowsPathKey(manifestRelativeFile(entry)), entry]),
  );
  expected.set(normalizedWindowsPathKey("sitemap.xml"), {
    html: manifest.sitemapXml,
    relativeFile: "sitemap.xml",
  });

  const actualFiles = filesUnder(outputRoot);
  const actualKeys = new Set(actualFiles.map((relativeFile) => normalizedWindowsPathKey(relativeFile)));
  const unexpected = actualFiles.filter((relativeFile) => !expected.has(normalizedWindowsPathKey(relativeFile)));
  const missing = [...expected].filter(([key]) => !actualKeys.has(key)).map(([, entry]) => entry.relativeFile || manifestRelativeFile(entry));
  if (unexpected.length || missing.length || actualFiles.length !== expected.size) {
    throw new Error(
      [
        `Generated tree contains ${actualFiles.length} files; expected ${expected.size}`,
        missing.length ? `missing: ${missing.slice(0, 12).join(", ")}` : "",
        unexpected.length ? `unexpected: ${unexpected.slice(0, 12).join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }

  for (const [key, entry] of expected) {
    const relativeFile = entry.relativeFile || manifestRelativeFile(entry);
    const actualFile = actualFiles.find((candidate) => normalizedWindowsPathKey(candidate) === key);
    const content = fs.readFileSync(path.join(outputRoot, actualFile), "utf8");
    if (content !== entry.html) {
      throw new Error(`Generated content verification failed: ${relativeFile}`);
    }
  }
}

function uniqueReplacementTargets(...targetGroups) {
  const targets = new Map();
  for (const rawTarget of targetGroups.flat()) {
    const target = assertSafeTopLevelReplacement(rawTarget);
    const key = normalizedWindowsPathKey(target);
    if (targets.has(key) && targets.get(key) !== target) {
      throw new Error(`Case or Unicode collision in generated replacement targets: ${targets.get(key)} / ${target}`);
    }
    targets.set(key, target);
  }
  return [...targets.values()];
}

function writeTransactionLog(transaction) {
  const logPath = pathInsideWorkspace(transaction.backupRoot, "transaction.jsonl");
  const descriptor = fs.openSync(logPath, "a");
  try {
    fs.writeFileSync(
      descriptor,
      `${JSON.stringify(
        {
          state: transaction.state,
          startedAt: transaction.startedAt,
          updatedAt: new Date().toISOString(),
          stageDirectory: path.basename(transaction.stageRoot),
          backupDirectory: path.basename(transaction.backupRoot),
          targets: transaction.entries.map((entry) => ({
            target: entry.relativeTarget,
            originalFingerprint: entry.originalFingerprint,
            backupIntent: entry.backupIntent,
            oldMoved: entry.oldMoved,
            promotionIntent: entry.promotionIntent,
            newInstalled: entry.newInstalled,
          })),
        },
      )}\n`,
      "utf8",
    );
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

function verifyInstalledManifest(manifest, staleRootHtmlTargets) {
  for (const entry of manifest.entries) {
    const installed = fs.readFileSync(entry.filePath, "utf8");
    if (installed !== entry.html) throw new Error(`Installed HTML differs from the rendered manifest: ${entry.filePath}`);
  }
  const installedSitemap = fs.readFileSync(resolveInsideRoot("sitemap.xml"), "utf8");
  if (installedSitemap !== manifest.sitemapXml) throw new Error("Installed sitemap differs from the rendered manifest.");

  const targetRootHtml = new Set(
    manifest.entries
      .map((entry) => manifestRelativeFile(entry))
      .filter((relativeFile) => path.dirname(relativeFile) === ".")
      .map(normalizedWindowsPathKey),
  );
  for (const staleFile of staleRootHtmlTargets) {
    if (!targetRootHtml.has(normalizedWindowsPathKey(staleFile)) && lstatIfPresent(resolveInsideRoot(staleFile))) {
      throw new Error(`Stale root HTML remained after replacement: ${staleFile}`);
    }
  }
  for (const removedDir of REMOVED_LOCALE_DIRS) {
    if (lstatIfPresent(resolveInsideRoot(removedDir))) {
      throw new Error(`Removed locale directory remained after replacement: ${removedDir}`);
    }
  }
}

function renameWithTransientRetry(sourcePath, targetPath, label) {
  const retryableCodes = new Set(["EACCES", "EBUSY", "EPERM"]);
  const delays = [20, 60, 140, 300];
  let lastError;
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      fs.renameSync(sourcePath, targetPath);
      return;
    } catch (error) {
      lastError = error;
      if (!retryableCodes.has(error?.code) || attempt === delays.length) break;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delays[attempt]);
    }
  }
  throw new Error(`${label}: ${lastError?.message || "rename failed"}`);
}

function rollbackGeneratedReplacement(transaction) {
  const rollbackErrors = [];
  transaction.state = "ROLLING_BACK";
  try {
    writeTransactionLog(transaction);
  } catch (error) {
    rollbackErrors.push(`could not record rollback start: ${error.message}`);
  }

  for (const entry of [...transaction.entries].reverse()) {
    if (!entry.newInstalled) continue;
    try {
      if (!lstatIfPresent(entry.targetPath)) {
        throw new Error(`installed target is missing: ${entry.targetPath}`);
      }
      if (lstatIfPresent(entry.stagedPath)) {
        throw new Error(`staging target already exists: ${entry.stagedPath}`);
      }
      fs.mkdirSync(path.dirname(entry.stagedPath), { recursive: true });
      renameWithTransientRetry(entry.targetPath, entry.stagedPath, `Could not withdraw ${entry.relativeTarget}`);
      entry.newInstalled = false;
      writeTransactionLog(transaction);
    } catch (error) {
      rollbackErrors.push(`could not withdraw ${entry.relativeTarget}: ${error.message}`);
    }
  }

  for (const entry of [...transaction.entries].reverse()) {
    if (!entry.oldMoved) continue;
    try {
      if (!lstatIfPresent(entry.backupPath)) {
        throw new Error(`backup target is missing: ${entry.backupPath}`);
      }
      if (lstatIfPresent(entry.targetPath)) {
        throw new Error(`live target is occupied: ${entry.targetPath}`);
      }
      renameWithTransientRetry(entry.backupPath, entry.targetPath, `Could not restore ${entry.relativeTarget}`);
      entry.oldMoved = false;
      writeTransactionLog(transaction);
    } catch (error) {
      rollbackErrors.push(`could not restore ${entry.relativeTarget}: ${error.message}`);
    }
  }

  for (const entry of transaction.entries) {
    try {
      const restoredFingerprint = filesystemNodeFingerprint(entry.targetPath);
      if (restoredFingerprint !== entry.originalFingerprint) {
        rollbackErrors.push(
          `restored fingerprint mismatch for ${entry.relativeTarget}: expected ${entry.originalFingerprint}, found ${restoredFingerprint}`,
        );
      }
    } catch (error) {
      rollbackErrors.push(`could not verify restored ${entry.relativeTarget}: ${error.message}`);
    }
  }
  for (const entry of transaction.entries) {
    if (entry.newInstalled || entry.oldMoved) {
      rollbackErrors.push(
        `rollback state remained active for ${entry.relativeTarget}: newInstalled=${entry.newInstalled}, oldMoved=${entry.oldMoved}`,
      );
    }
  }

  transaction.state = rollbackErrors.length ? "ROLLBACK_FAILED" : "ROLLED_BACK";
  try {
    writeTransactionLog(transaction);
  } catch (error) {
    rollbackErrors.push(`could not record rollback result: ${error.message}`);
  }
  return rollbackErrors;
}

function generatedReplacementPlan(manifest) {
  assertNoUnfinishedBuildWorkspaces();
  const currentRootHtml = rootHtmlTargets(ROOT);
  for (const relativeDir of GENERATED_ROUTE_DIRS) assertReplaceableGeneratedDirectory(relativeDir);
  for (const relativeFile of currentRootHtml) assertReplaceableGeneratedFile(relativeFile);
  assertReplaceableGeneratedFile("sitemap.xml");
  const targetRootHtml = manifest.entries
    .map((entry) => manifestRelativeFile(entry))
    .filter((relativeFile) => path.dirname(relativeFile) === ".")
    .map((relativeFile) => path.basename(relativeFile));
  const relativeTargets = uniqueReplacementTargets(
    GENERATED_ROUTE_DIRS,
    currentRootHtml,
    targetRootHtml,
    ["sitemap.xml"],
  );
  const originalFingerprints = new Map(
    relativeTargets.map((relativeTarget) => [
      normalizedWindowsPathKey(relativeTarget),
      filesystemNodeFingerprint(resolveInsideRoot(relativeTarget)),
    ]),
  );
  return { currentRootHtml, originalFingerprints, relativeTargets };
}

function replaceGeneratedOutput(manifest) {
  const { currentRootHtml, originalFingerprints, relativeTargets } = generatedReplacementPlan(manifest);
  const stageRoot = stageRenderedManifest(manifest);
  try {
    verifyManifestAtRoot(manifest, stageRoot);
  } catch (error) {
    const cleanupError = cleanupBuildWorkspace(stageRoot, BUILD_STAGE_PREFIX);
    throw new Error(
      `Staged generated-site verification failed: ${error.message}${cleanupError ? ` | staging cleanup failed: ${cleanupError}` : ""}`,
    );
  }

  let backupRoot = "";
  let transaction;
  try {
    backupRoot = fs.mkdtempSync(path.join(ROOT, BUILD_BACKUP_PREFIX));
    assertWorkspacePath(backupRoot, BUILD_BACKUP_PREFIX);
    transaction = {
      state: "PREPARED",
      startedAt: new Date().toISOString(),
      stageRoot,
      backupRoot,
      entries: relativeTargets.map((relativeTarget) => ({
        relativeTarget,
        originalFingerprint: originalFingerprints.get(normalizedWindowsPathKey(relativeTarget)),
        targetPath: resolveInsideRoot(relativeTarget),
        stagedPath: pathInsideWorkspace(stageRoot, relativeTarget),
        backupPath: pathInsideWorkspace(backupRoot, relativeTarget),
        backupIntent: false,
        oldMoved: false,
        promotionIntent: false,
        newInstalled: false,
      })),
    };
    writeTransactionLog(transaction);
  } catch (error) {
    const stageCleanupError = cleanupBuildWorkspace(stageRoot, BUILD_STAGE_PREFIX);
    const backupCleanupError = backupRoot ? cleanupBuildWorkspace(backupRoot, BUILD_BACKUP_PREFIX) : "";
    throw new Error(
      `Could not initialize the generated-site transaction: ${error.message}${
        stageCleanupError || backupCleanupError
          ? ` | cleanup failed: ${[stageCleanupError, backupCleanupError].filter(Boolean).join(" | ")}`
          : ""
      }`,
    );
  }

  try {
    transaction.state = "BACKING_UP";
    writeTransactionLog(transaction);
    for (const entry of transaction.entries) {
      if (!lstatIfPresent(entry.targetPath)) continue;
      entry.backupIntent = true;
      writeTransactionLog(transaction);
      fs.mkdirSync(path.dirname(entry.backupPath), { recursive: true });
      renameWithTransientRetry(entry.targetPath, entry.backupPath, `Could not back up ${entry.relativeTarget}`);
      entry.oldMoved = true;
      writeTransactionLog(transaction);
    }

    transaction.state = "BACKED_UP";
    writeTransactionLog(transaction);
    transaction.state = "PROMOTING";
    writeTransactionLog(transaction);
    for (const entry of transaction.entries) {
      if (!lstatIfPresent(entry.stagedPath)) continue;
      entry.promotionIntent = true;
      writeTransactionLog(transaction);
      renameWithTransientRetry(entry.stagedPath, entry.targetPath, `Could not promote ${entry.relativeTarget}`);
      entry.newInstalled = true;
      writeTransactionLog(transaction);
    }

    transaction.state = "VERIFYING";
    writeTransactionLog(transaction);
    verifyInstalledManifest(manifest, currentRootHtml);
    transaction.state = "COMMITTED";
    writeTransactionLog(transaction);
  } catch (error) {
    const rollbackErrors = rollbackGeneratedReplacement(transaction);
    if (!rollbackErrors.length) {
      const stageCleanupError = cleanupBuildWorkspace(stageRoot, BUILD_STAGE_PREFIX);
      const backupCleanupError = cleanupBuildWorkspace(backupRoot, BUILD_BACKUP_PREFIX);
      if (stageCleanupError || backupCleanupError) {
        console.warn(
          `Generated-site rollback succeeded, but transaction cleanup needs inspection: ${[stageCleanupError, backupCleanupError].filter(Boolean).join(" | ")}`,
        );
      }
    }
    throw new Error(
      `Generated-site replacement failed: ${error.message}${
        rollbackErrors.length ? ` | rollback incomplete: ${rollbackErrors.join(" | ")}` : " | previous output restored"
      }`,
    );
  }

  const stageCleanupError = cleanupBuildWorkspace(stageRoot, BUILD_STAGE_PREFIX);
  const backupCleanupError = cleanupBuildWorkspace(backupRoot, BUILD_BACKUP_PREFIX);
  if (stageCleanupError || backupCleanupError) {
    console.warn(
      `Generated site committed, but transaction cleanup needs inspection: ${[stageCleanupError, backupCleanupError].filter(Boolean).join(" | ")}`,
    );
  }
}

function build() {
  const lock = acquireGenerationLock();
  try {
    assertNoUnfinishedBuildWorkspaces();
    const sourceMetrics = validateSourceModel();
    const manifest = renderManifest(sourceMetrics);
    replaceGeneratedOutput(manifest);
    console.log(`Generated ${sourceMetrics.publicPages} multilingual pages and sitemap.xml`);
  } finally {
    releaseGenerationLock(lock);
  }
}

if (process.argv.includes("--print-localization-priorities")) {
  console.log(JSON.stringify(machineLocalizationPriorities(), null, 2));
} else if (process.argv.includes("--print-localization-coverage")) {
  console.log(
    JSON.stringify(
      machineLocalizationCoverage().map(({ untranslated, ...summary }) => ({
        ...summary,
        untranslatedExamples: untranslated.slice(0, 12),
      })),
      null,
      2,
    ),
  );
} else if (process.argv.includes("--print-route-fingerprint")) {
  console.log(`${ROUTES.reduce((count, route) => count + (route.languages || []).length, 0)} ${routeInventoryFingerprint()}`);
} else if (process.argv.includes("--validate-only")) {
  const sourceMetrics = validateSourceModel();
  const manifest = renderManifest(sourceMetrics);
  generatedReplacementPlan(manifest);
  console.log(
    `Source model and pre-render valid: ${sourceMetrics.publicPages} pages, ${sourceMetrics.machines} machines, ${sourceMetrics.topics} topics, ${sourceMetrics.languages} languages.`,
  );
} else {
  build();
}
