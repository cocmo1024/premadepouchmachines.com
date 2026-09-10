#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_TOPIC_HUBS, SEO_TOPIC_PAGES } from "../content/seo-clusters.mjs";
import { MACHINE_PAGES, STATIC_SEO_PAGES } from "../content/seo-machines.mjs";
import { hasMachineTermTranslation } from "../content/machine-localization.mjs";
import { LANGUAGES, absoluteUrl } from "../content/i18n.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ORIGIN = "https://premadepouchmachines.com";
const INVENTORY_CONTRACT = Object.freeze({
  languages: 7,
  languageCodes: ["en", "es", "fr", "de", "pt", "ru", "ar"],
  minimumMachines: 60,
  minimumTopics: 316,
  minimumPages: 802,
});
const TRUST_PATHS = ["/about.html", "/editorial-policy.html", "/privacy.html"];
const PUBLIC_ROUTE_ROOTS = [
  "machines",
  "applications",
  "formats",
  "guides",
  "industries",
  "insights",
  "technologies",
  "troubleshooting",
  "es",
  "fr",
  "de",
  "pt",
  "ru",
  "ar",
];
const PUBLIC_FILE_ROOTS = [...PUBLIC_ROUTE_ROOTS, "public"];
const LOCALE_PREFIXES = new Set(["es", "fr", "de", "pt", "ru", "ar"]);
const HTML_SCAN_SKIP_DIRS = new Set([".git", ".wrangler", "content", "docs", "functions", "node_modules", "outputs", "tmp", "tools"]);
const BUILD_WORKSPACE_PREFIXES = [".site-build-", ".site-backup-", "会话_"];

const PRIVATE_PATH_PREFIXES = [
  "/.agents/",
  "/.codex/",
  "/.git/",
  "/.github/",
  "/.wrangler/",
  "/content/",
  "/docs/",
  "/dist/",
  "/functions/",
  "/node_modules/",
  "/outputs/",
  "/tmp/",
  "/tools/",
];

const PRIVATE_FILE_PATHS = new Set([
  "/.assetsignore",
  "/.dev.vars",
  "/.env",
  "/.gitattributes",
  "/.gitignore",
  "/.site-build.lock",
  "/_headers",
  "/_redirects",
  "/agents.md",
  "/content_update_guide.md",
  "/package-lock.json",
  "/package.json",
  "/pnpm-lock.yaml",
  "/readme.md",
  "/wrangler.json",
  "/wrangler.jsonc",
  "/yarn.lock",
]);

const REQUIRED_ASSETSIGNORE_RULES = [
  "/*",
  "!/*.html",
  "!/styles.css",
  "!/script.js",
  "!/robots.txt",
  "!/sitemap.xml",
  "!/favicon.ico",
  "!/_headers",
  "!/_redirects",
  "!/machines/",
  "!/machines/**",
  "!/applications/",
  "!/applications/**",
  "!/formats/",
  "!/formats/**",
  "!/guides/",
  "!/guides/**",
  "!/industries/",
  "!/industries/**",
  "!/insights/",
  "!/insights/**",
  "!/technologies/",
  "!/technologies/**",
  "!/troubleshooting/",
  "!/troubleshooting/**",
  "!/es/",
  "!/es/**",
  "!/fr/",
  "!/fr/**",
  "!/de/",
  "!/de/**",
  "!/pt/",
  "!/pt/**",
  "!/ru/",
  "!/ru/**",
  "!/ar/",
  "!/ar/**",
  "!/public/",
  "!/public/**",
  "**/.git/**",
  "**/.github/**",
  "**/.agents/**",
  "**/.codex/**",
  "**/.assetsignore",
  "**/.gitignore",
  "**/.gitattributes",
  "**/.wrangler/**",
  "**/.vercel/**",
  "**/.DS_Store",
  "**/Thumbs.db",
  "**/.env*",
  "**/.dev.vars*",
  "**/.npmrc",
  "**/.netrc",
  "**/.pypirc",
  "**/.aws/**",
  "**/.ssh/**",
  "**/.docker/**",
  "**/.config/gcloud/**",
  "**/id_rsa*",
  "**/id_ed25519*",
  "**/service-account*.json",
  "**/*service-account*.json",
  "**/node_modules/**",
  "**/dist/**",
  "**/*.md",
  "**/*.mjs",
  "**/*.cjs",
  "**/*.ts",
  "**/*.map",
  "**/*.log",
  "**/*.csv",
  "**/*.tsv",
  "**/*.jsonl",
  "**/*.db",
  "**/*.sqlite*",
  "**/*.zip",
  "**/*.7z",
  "**/*.tar",
  "**/*.gz",
  "**/*.key",
  "**/*.pem",
  "**/*.p12",
  "**/*.pfx",
  "**/*.pdf",
  "**/*.doc",
  "**/*.docx",
  "**/*.xls",
  "**/*.xlsx",
  "**/*.ppt",
  "**/*.pptx",
  "**/*.py",
  "**/*.ps1",
  "**/*.sh",
  "**/credentials*.json",
  "**/secrets*.json",
  "**/content/**",
  "**/docs/**",
  "**/functions/**",
  "**/tmp/**",
  "**/tools/**",
  "**/outputs/**",
  "**/.site-build-*/**",
  "**/.site-backup-*/**",
  "**/.site-build.lock",
  "content/**",
  "docs/**",
  "functions/**",
  "tmp/**",
  "tools/**",
  "outputs/**",
  "package*.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "wrangler*.json*",
  "wrangler.toml",
  ".site-build-*/**",
  ".site-backup-*/**",
  ".site-build.lock",
  "README.md",
  "AGENTS.md",
  "CONTENT_UPDATE_GUIDE.md",
  "wrangler.jsonc",
];
const REQUIRED_ASSETS_ALLOW_RULES = REQUIRED_ASSETSIGNORE_RULES.filter((rule) => rule.startsWith("!"));
const ROOT_PUBLIC_RUNTIME_FILES = new Set([
  "_headers",
  "_redirects",
  "favicon.ico",
  "robots.txt",
  "script.js",
  "sitemap.xml",
  "styles.css",
]);

const SENSITIVE_FILE_PATTERN = /(?:^|\/)(?:\.env(?:\..+)?|\.dev\.vars(?:\..+)?|\.npmrc|\.netrc|\.pypirc|id_(?:ed25519|rsa)[^/]*|credentials[^/]*\.json|secrets?[^/]*\.json|[^/]*service-account[^/]*\.json|[^/]+\.(?:key|log|p12|pem|pfx))$/i;
const PRIVATE_SOURCE_FILE_PATTERN = /\.(?:7z|cjs|csv|db|docx?|gz|jsonl|md|mjs|pdf|pptx?|ps1|py|sh|sqlite\d*|tar|ts|tsv|xlsx?|zip)$/i;
const CRAWL_QUERY_KEYS = new Set(["machine", "product", "source", "q"]);
const NON_ENGLISH_FORBIDDEN_PHRASES = [
  "Acceptance checks before order",
  "Brochure evidence",
  "Compare nearby machine paths",
  "Good-output speed depends on",
  "Reference model family",
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
const MAX_ISSUES_TO_PRINT = 80;
const issues = [];
const UNTRANSLATED_MACHINE_TERMS_CACHE = new Map();

function issue(severity, code, file, message) {
  issues.push({ severity, code, file, message });
}

function untranslatedMachineTerms(langCode) {
  if (UNTRANSLATED_MACHINE_TERMS_CACHE.has(langCode)) return UNTRANSLATED_MACHINE_TERMS_CACHE.get(langCode);
  const fields = ["applications", "packageStyles", "materials", "workflow", "features", "options"];
  const terms = [
    ...new Set(MACHINE_PAGES.flatMap((item) => fields.flatMap((field) => item[field] || [])).filter(Boolean)),
  ].filter((term) => /[a-z]/i.test(term) && term.trim().split(/\s+/).length >= 2 && term.trim().length >= 8);
  const untranslated = terms.filter((term) => !hasMachineTermTranslation(term, langCode));
  UNTRANSLATED_MACHINE_TERMS_CACHE.set(langCode, untranslated);
  return untranslated;
}

function error(code, file, message) {
  issue("ERROR", code, file, message);
}

function warning(code, file, message) {
  issue("WARN", code, file, message);
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function relativeFile(filePath) {
  return toPosix(path.relative(ROOT, filePath));
}

function isPublishAllowlistedFile(filePath) {
  const relative = relativeFile(filePath);
  if (!relative || relative === ".." || relative.startsWith("../") || path.isAbsolute(relative)) return false;
  const segments = relative.split("/").filter(Boolean);
  if (segments.length === 1) {
    return relative.toLowerCase().endsWith(".html") || ROOT_PUBLIC_RUNTIME_FILES.has(relative);
  }
  if (PUBLIC_ROUTE_ROOTS.includes(segments[0])) return relative.toLowerCase().endsWith(".html");
  if (segments[0] !== "public") return false;

  const normalizedPath = `/${relative.toLowerCase()}`;
  if (SENSITIVE_FILE_PATTERN.test(normalizedPath) || PRIVATE_SOURCE_FILE_PATTERN.test(normalizedPath)) return false;
  return !segments.some((segment) => segment.startsWith(".") && segment !== ".well-known");
}

function decodeEntities(value) {
  return String(value)
    .replace(/&#(\d+);/g, (_match, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_match, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");
}

function decodeXml(value) {
  return decodeEntities(value);
}

function stripTags(value) {
  return decodeEntities(String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function parseAttributes(source) {
  const attributes = {};
  const pattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = pattern.exec(source))) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attributes[name] = decodeEntities(value);
  }
  return attributes;
}

function tagAttributes(html, tagName) {
  const matches = [];
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");
  let match;
  while ((match = pattern.exec(html))) {
    matches.push({ attributes: parseAttributes(match[1]), index: match.index, markup: match[0] });
  }
  return matches;
}

function fullElements(html, tagName) {
  const matches = [];
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>([\\s\\S]*?)<\\/${tagName}\\s*>`, "gi");
  let match;
  while ((match = pattern.exec(html))) {
    matches.push({
      attributes: parseAttributes(match[1]),
      body: match[2],
      index: match.index,
      markup: match[0],
    });
  }
  return matches;
}

function hasRel(attributes, value) {
  return String(attributes.rel || "")
    .toLowerCase()
    .split(/\s+/)
    .includes(value);
}

function routeForHtmlFile(filePath) {
  const relative = relativeFile(filePath);
  if (relative === "index.html") return "/";

  const withoutExtension = relative.slice(0, -".html".length);
  if (withoutExtension.endsWith("/index")) {
    return `/${withoutExtension.slice(0, -"/index".length)}/`;
  }
  return `/${withoutExtension}`;
}

function expectedCanonicalForFile(filePath) {
  return new URL(routeForHtmlFile(filePath), `${SITE_ORIGIN}/`).href;
}

function collectHtmlFiles() {
  const files = [];

  function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (
          directory === ROOT &&
          (HTML_SCAN_SKIP_DIRS.has(entry.name.toLowerCase()) ||
            BUILD_WORKSPACE_PREFIXES.some((prefix) => entry.name.startsWith(prefix)))
        ) {
          continue;
        }
        walk(absolutePath);
      }
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(absolutePath);
    }
  }

  walk(ROOT);

  return files.sort((a, b) => relativeFile(a).localeCompare(relativeFile(b)));
}

function singleValue(values, code, file, label) {
  if (values.length !== 1) {
    error(code, file, `Expected exactly one ${label}; found ${values.length}.`);
    return values[0] || "";
  }
  if (!String(values[0]).trim()) error(code, file, `${label} is empty.`);
  return values[0];
}

function canonicalUrl(value, base = `${SITE_ORIGIN}/`, context = null) {
  try {
    const url = new URL(value, base);
    if (context && (url.search || url.hash)) {
      error(
        context.code,
        context.file,
        `${context.label} must not contain a query string or fragment: "${value}".`,
      );
    }
    url.hash = "";
    url.search = "";
    return url.href;
  } catch {
    if (context) error(context.code, context.file, `Invalid ${context.label}: "${value}".`);
    return "";
  }
}

function collectIds(html) {
  const ids = new Set();
  const pattern = /\bid\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi;
  let match;
  while ((match = pattern.exec(html))) ids.add(decodeEntities(match[1] ?? match[2] ?? match[3]));
  return ids;
}

function schemaTypes(value) {
  return (Array.isArray(value) ? value : [value])
    .filter((item) => typeof item === "string")
    .map((item) => item.split(/[/#:]/).filter(Boolean).at(-1));
}

function validateJsonLdData(data, file, blockNumber) {
  const types = new Set();
  const dateModifiedValues = [];

  const visit = (value, key = "", objectPath = "$") => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, key, `${objectPath}[${index}]`));
      return;
    }
    if (value && typeof value === "object") {
      const objectTypes = schemaTypes(value["@type"]);
      objectTypes.forEach((type) => types.add(type));
      if (objectTypes.includes("Organization")) {
        if (value["@id"] !== `${SITE_ORIGIN}/#organization`) {
          error(
            "JSONLD_ORGANIZATION_ID",
            file,
            `JSON-LD block ${blockNumber} uses organization @id "${value["@id"] || "(missing)"}"; expected one stable site-wide ID.`,
          );
        }
        if (!value.logo) {
          error("JSONLD_ORGANIZATION_LOGO", file, "Organization JSON-LD is missing a logo.");
        } else {
          const logoUrl = internalUrl(typeof value.logo === "string" ? value.logo : value.logo.url, `${SITE_ORIGIN}/`);
          const logoFile = logoUrl ? localFileForUrl(logoUrl) : null;
          const dimensions = logoFile ? imageFileDimensions(logoFile) : null;
          if (!dimensions || dimensions.width < 112 || dimensions.height < 112) {
            error(
              "JSONLD_ORGANIZATION_LOGO",
              file,
              `Organization logo must be a crawlable image at least 112x112 pixels.`,
            );
          }
        }
      }
      Object.entries(value).forEach(([childKey, childValue]) =>
        visit(childValue, childKey, `${objectPath}.${childKey}`),
      );
      return;
    }

    if (key === "@type" && typeof value === "string") {
      const type = schemaTypes(value)[0];
      if (type) types.add(type);
      if (type === "SearchAction") {
        error("JSONLD_SEARCH_ACTION", file, `JSON-LD block ${blockNumber} contains SearchAction at ${objectPath}.`);
      }
    }
    if (key === "dateModified" && typeof value === "string") {
      dateModifiedValues.push(value);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        error("JSONLD_DATE_MODIFIED", file, `Invalid dateModified "${value}" in JSON-LD block ${blockNumber}.`);
      } else if (Date.parse(`${value}T00:00:00Z`) > Date.now()) {
        error("JSONLD_DATE_FUTURE", file, `Future dateModified "${value}" in JSON-LD block ${blockNumber}.`);
      }
    }
    if (typeof value !== "string") return;
    if (/search_term_string/i.test(value)) {
      error("JSONLD_SEARCH_TEMPLATE", file, `JSON-LD block ${blockNumber} contains search_term_string.`);
    }
    if (!/[?&](?:machine|product|source|q)=/i.test(value)) return;
    try {
      const url = new URL(value, `${SITE_ORIGIN}/`);
      if (url.origin !== SITE_ORIGIN) return;
      const keys = [...url.searchParams.keys()].filter((name) => CRAWL_QUERY_KEYS.has(name.toLowerCase()));
      if (keys.length) {
        error(
          "JSONLD_CRAWL_QUERY",
          file,
          `JSON-LD block ${blockNumber} exposes crawlable parameters (${keys.join(", ")}) at ${objectPath}.`,
        );
      }
    } catch {
      // Non-URL copy is handled as text, not as a structured URL.
    }
  };

  visit(data);
  return { dateModifiedValues, types };
}

function validateRequiredSchemaTypes(file, types) {
  let required = [];
  if (/^(?:[^/]+\/)?machines\//.test(file)) required = ["WebPage", "Service", "BreadcrumbList"];
  else if (/^(?:applications|formats|guides|industries|insights|technologies|troubleshooting)\/(?!index\.html$)/.test(file)) {
    required = ["WebPage", "TechArticle", "BreadcrumbList"];
  } else if (file === "index.html" || /^(?:es|fr|de|pt|ru|ar)\/index\.html$/.test(file)) {
    required = ["Organization", "WebSite", "ItemList"];
  } else if (/^(?:about|editorial-policy|privacy)\.html$/.test(file)) {
    required = ["WebPage", "BreadcrumbList"];
  } else if (/(?:^|\/)machine-index\.html$/.test(file)) {
    required = ["ItemList"];
  } else if (/^(?:applications|formats|guides|industries|insights|technologies|troubleshooting)\/index\.html$/.test(file)) {
    required = ["CollectionPage", "ItemList"];
  } else {
    required = ["CollectionPage", "BreadcrumbList", "ItemList"];
  }

  for (const type of required) {
    if (!types.has(type)) error("JSONLD_REQUIRED_TYPE", file, `Missing required JSON-LD type "${type}".`);
  }
}

function extractPage(filePath) {
  const file = relativeFile(filePath);
  const html = fs.readFileSync(filePath, "utf8");

  const titleValues = fullElements(html, "title").map((entry) => stripTags(entry.body));
  const metaDescriptionValues = tagAttributes(html, "meta")
    .filter(({ attributes }) => String(attributes.name || "").toLowerCase() === "description")
    .map(({ attributes }) => String(attributes.content || "").trim());
  const canonicalValues = tagAttributes(html, "link")
    .filter(({ attributes }) => hasRel(attributes, "canonical"))
    .map(({ attributes }) =>
      canonicalUrl(attributes.href, `${SITE_ORIGIN}/`, {
        code: "CANONICAL_URL",
        file,
        label: "canonical URL",
      }),
    );
  const h1Values = fullElements(html, "h1").map((entry) => stripTags(entry.body));
  const mainElements = tagAttributes(html, "main");
  const robotsDirectives = tagAttributes(html, "meta")
    .filter(({ attributes }) => String(attributes.name || "").toLowerCase() === "robots")
    .flatMap(({ attributes }) => String(attributes.content || "").toLowerCase().split(/\s*,\s*/));

  const title = singleValue(titleValues, "TITLE_COUNT", file, "title");
  const description = singleValue(metaDescriptionValues, "DESCRIPTION_COUNT", file, "meta description");
  const canonical = singleValue(canonicalValues, "CANONICAL_COUNT", file, "canonical URL");
  singleValue(h1Values, "H1_COUNT", file, "H1");
  if (robotsDirectives.includes("noindex") || robotsDirectives.includes("none")) {
    error("ROBOTS_NOINDEX", file, "A public sitemap page declares noindex.");
  }
  if (mainElements.length !== 1) {
    error("MAIN_COUNT", file, `Expected exactly one main element; found ${mainElements.length}.`);
  } else if (mainElements[0].attributes.id !== "main-content") {
    error("MAIN_ID", file, 'The main element must use id="main-content".');
  }

  const hasSkipLink = tagAttributes(html, "a").some(
    ({ attributes }) =>
      String(attributes.href || "") === "#main-content" &&
      String(attributes.class || "")
        .split(/\s+/)
        .includes("skip-link"),
  );
  if (!hasSkipLink) error("SKIP_LINK", file, 'Missing a .skip-link targeting "#main-content".');

  const expectedCanonical = expectedCanonicalForFile(filePath);
  if (canonical && canonical !== expectedCanonical) {
    error("CANONICAL_FILE_MAP", file, `Canonical "${canonical}" does not match file route "${expectedCanonical}".`);
  }

  const jsonLdBlocks = fullElements(html, "script").filter(
    ({ attributes }) => String(attributes.type || "").toLowerCase() === "application/ld+json",
  );
  const jsonLdTypes = new Set();
  const dateModifiedValues = [];
  if (!jsonLdBlocks.length) error("JSONLD_MISSING", file, "No JSON-LD block found.");
  for (const [index, block] of jsonLdBlocks.entries()) {
    try {
      const data = JSON.parse(block.body.trim());
      const result = validateJsonLdData(data, file, index + 1);
      result.types.forEach((type) => jsonLdTypes.add(type));
      dateModifiedValues.push(...result.dateModifiedValues);
    } catch (parseError) {
      error("JSONLD_INVALID", file, `JSON-LD block ${index + 1} is invalid: ${parseError.message}`);
    }
  }
  const uniqueDateModifiedValues = [...new Set(dateModifiedValues)];
  if (uniqueDateModifiedValues.length > 1) {
    error(
      "JSONLD_DATE_CONFLICT",
      file,
      `Conflicting JSON-LD dateModified values: ${uniqueDateModifiedValues.join(", ")}.`,
    );
  }
  validateRequiredSchemaTypes(file, jsonLdTypes);

  const alternates = new Map();
  const alternateEntries = tagAttributes(html, "link").filter(
    ({ attributes }) => hasRel(attributes, "alternate") && attributes.hreflang,
  );
  for (const { attributes } of alternateEntries) {
    const language = attributes.hreflang.toLowerCase();
    const href = canonicalUrl(attributes.href, canonical || expectedCanonical, {
      code: "HREFLANG_URL",
      file,
      label: `hreflang "${language}" URL`,
    });
    if (!href) {
      error("HREFLANG_URL", file, `Invalid hreflang URL for "${language}".`);
      continue;
    }
    if (alternates.has(language)) error("HREFLANG_DUPLICATE", file, `Duplicate hreflang "${language}".`);
    alternates.set(language, href);
  }
  if (!alternates.has("x-default")) error("HREFLANG_XDEFAULT", file, "Missing x-default hreflang.");
  if (canonical && ![...alternates.entries()].some(([language, href]) => language !== "x-default" && href === canonical)) {
    error("HREFLANG_SELF", file, "No non-x-default hreflang points to the page canonical.");
  }

  const htmlTag = tagAttributes(html, "html")[0]?.attributes || {};
  const lang = String(htmlTag.lang || "").toLowerCase();
  if (!lang) error("HTML_LANG", file, "The html element has no lang attribute.");
  if (lang === "ar" && String(htmlTag.dir || "").toLowerCase() !== "rtl") {
    error("HTML_DIR", file, 'Arabic page is missing dir="rtl".');
  }
  if (lang && lang.split("-")[0] !== "en") {
    const localizedUiHtml = html.replace(
      /<([a-z][\w:-]*)\b[^>]*\blang\s*=\s*["']en(?:-[a-z0-9]+)?["'][^>]*>[\s\S]*?<\/\1\s*>/gi,
      " ",
    );
    const visibleText = stripTags(
      localizedUiHtml
        .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " "),
    );
    const visibleAttributes = ["alt", "aria-label", "placeholder", "title"]
      .flatMap((attribute) => {
        const pattern = new RegExp(`\\b${attribute}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)')`, "gi");
        return [...localizedUiHtml.matchAll(pattern)].map((match) => decodeEntities(match[1] ?? match[2] ?? ""));
      })
      .join(" ");
    const buyerVisibleCopy = `${visibleText} ${visibleAttributes}`.toLowerCase();
    for (const phrase of NON_ENGLISH_FORBIDDEN_PHRASES) {
      if (buyerVisibleCopy.includes(phrase.toLowerCase())) {
        error("NON_ENGLISH_FALLBACK", file, `Known English fallback remains in visible ${lang} copy: "${phrase}".`);
      }
    }
    for (const term of untranslatedMachineTerms(lang.split("-")[0])) {
      if (buyerVisibleCopy.includes(term.toLowerCase())) {
        error("NON_ENGLISH_SOURCE_LANGUAGE", file, `Unmarked English machine term remains in visible ${lang} copy: "${term}".`);
      }
    }
  }

  return {
    alternates,
    canonical,
    dateModifiedValues: uniqueDateModifiedValues,
    description,
    file,
    filePath,
    html,
    ids: collectIds(html),
    lang,
    title,
  };
}

function reportDuplicateValues(pages, property, code, label) {
  const groups = new Map();
  for (const page of pages) {
    const value = page[property];
    if (!value) continue;
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(page.file);
  }

  for (const [value, files] of groups) {
    if (files.length > 1) {
      for (const file of files) {
        error(code, file, `Duplicate ${label} shared by ${files.length} pages: "${value}"`);
      }
    }
  }
}

function parseSitemap() {
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(sitemapPath)) {
    error("SITEMAP_MISSING", "sitemap.xml", "sitemap.xml does not exist.");
    return new Map();
  }

  const xml = fs.readFileSync(sitemapPath, "utf8");
  const entries = new Map();
  const blocks = xml.match(/<url\b[^>]*>[\s\S]*?<\/url>/gi) || [];

  for (const block of blocks) {
    const locValues = [...block.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)].map((match) =>
      canonicalUrl(decodeXml(match[1].trim()), `${SITE_ORIGIN}/`, {
        code: "SITEMAP_LOC",
        file: "sitemap.xml",
        label: "sitemap loc",
      }),
    );
    const loc = singleValue(locValues, "SITEMAP_LOC", "sitemap.xml", "loc in sitemap url block");
    if (!loc) continue;
    if (entries.has(loc)) error("SITEMAP_DUPLICATE_LOC", "sitemap.xml", `Duplicate sitemap loc "${loc}".`);
    const lastmodValues = [...block.matchAll(/<lastmod\b[^>]*>([\s\S]*?)<\/lastmod>/gi)].map((match) =>
      decodeXml(match[1].trim()),
    );
    const lastmod = singleValue(lastmodValues, "SITEMAP_LASTMOD", "sitemap.xml", `lastmod for "${loc}"`);
    if (lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(lastmod)) {
      error("SITEMAP_LASTMOD_FORMAT", "sitemap.xml", `Invalid lastmod "${lastmod}" for "${loc}".`);
    } else if (lastmod && Date.parse(`${lastmod}T00:00:00Z`) > Date.now()) {
      error("SITEMAP_LASTMOD_FUTURE", "sitemap.xml", `Future lastmod "${lastmod}" for "${loc}".`);
    }

    const alternates = new Map();
    const pattern = /<xhtml:link\b([^>]*)>/gi;
    let linkMatch;
    while ((linkMatch = pattern.exec(block))) {
      const attributes = parseAttributes(linkMatch[1]);
      const language = String(attributes.hreflang || "").toLowerCase();
      const href = canonicalUrl(attributes.href, loc, {
        code: "SITEMAP_HREFLANG",
        file: "sitemap.xml",
        label: `sitemap hreflang "${language || "(missing)"}" URL`,
      });
      if (!language || !href) {
        error("SITEMAP_HREFLANG", "sitemap.xml", `Invalid alternate on "${loc}".`);
        continue;
      }
      if (alternates.has(language)) {
        error("SITEMAP_HREFLANG_DUPLICATE", "sitemap.xml", `Duplicate "${language}" alternate on "${loc}".`);
      }
      alternates.set(language, href);
    }
    entries.set(loc, { alternates, lastmod });
  }

  return entries;
}

function compareSitemapAndPages(pages, sitemapEntries) {
  const pageByCanonical = new Map(pages.filter((page) => page.canonical).map((page) => [page.canonical, page]));

  if (pages.length !== sitemapEntries.size) {
    error(
      "SITEMAP_COUNT",
      "sitemap.xml",
      `HTML page count ${pages.length} does not match sitemap URL count ${sitemapEntries.size}.`,
    );
  }

  for (const page of pages) {
    if (!page.canonical || !sitemapEntries.has(page.canonical)) {
      error("SITEMAP_MISSING_URL", page.file, `Canonical "${page.canonical || "(missing)"}" is absent from sitemap.xml.`);
      continue;
    }

    const sitemapEntry = sitemapEntries.get(page.canonical);
    const sitemapAlternates = sitemapEntry.alternates;
    if (sitemapAlternates.size !== page.alternates.size) {
      error(
        "SITEMAP_HREFLANG_SET",
        page.file,
        `HTML has ${page.alternates.size} alternates but sitemap has ${sitemapAlternates.size}.`,
      );
    }
    for (const [language, href] of page.alternates) {
      if (sitemapAlternates.get(language) !== href) {
        error("SITEMAP_HREFLANG_SET", page.file, `Sitemap alternate "${language}" does not match HTML.`);
      }
    }
    if (page.dateModifiedValues?.length === 1 && page.dateModifiedValues[0] !== sitemapEntry.lastmod) {
      error(
        "SITEMAP_LASTMOD_JSONLD",
        page.file,
        `Sitemap lastmod "${sitemapEntry.lastmod}" does not match JSON-LD dateModified (${page.dateModifiedValues.join(", ")}).`,
      );
    }
  }

  for (const loc of sitemapEntries.keys()) {
    if (!pageByCanonical.has(loc)) {
      error("SITEMAP_UNKNOWN_URL", "sitemap.xml", `Sitemap URL "${loc}" has no generated HTML page.`);
    }
    if (isPrivateUrlPath(new URL(loc).pathname)) {
      error("PRIVATE_SITEMAP_URL", "sitemap.xml", `Private or sensitive path appears in sitemap: "${loc}".`);
    }
  }
}

function validateHreflangReciprocity(pages) {
  const pageByCanonical = new Map(pages.filter((page) => page.canonical).map((page) => [page.canonical, page]));

  for (const page of pages) {
    for (const [language, href] of page.alternates) {
      const target = pageByCanonical.get(href);
      if (!target) {
        error("HREFLANG_TARGET", page.file, `hreflang "${language}" targets missing page "${href}".`);
        continue;
      }
      const reciprocal = [...target.alternates.entries()].some(
        ([targetLanguage, targetHref]) => targetLanguage !== "x-default" && targetHref === page.canonical,
      );
      if (!reciprocal) {
        error("HREFLANG_RECIPROCAL", page.file, `hreflang target "${href}" does not link back to "${page.canonical}".`);
      }
    }
  }
}

function logicalLocaleRoute(canonical) {
  const url = new URL(canonical);
  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length && LOCALE_PREFIXES.has(segments[0].toLowerCase())) segments.shift();
  return `/${segments.join("/")}${url.pathname.endsWith("/") && segments.length ? "/" : ""}`;
}

function validateLanguageClusters(pages) {
  const clusters = new Map();
  for (const page of pages) {
    if (!page.canonical) continue;
    const logicalRoute = logicalLocaleRoute(page.canonical);
    if (!clusters.has(logicalRoute)) clusters.set(logicalRoute, new Map());
    const language = page.lang.split("-")[0];
    if (clusters.get(logicalRoute).has(language)) {
      error("LANGUAGE_ROUTE_DUPLICATE", page.file, `Logical route "${logicalRoute}" has more than one ${language} page.`);
    }
    clusters.get(logicalRoute).set(language, page);
  }

  for (const [logicalRoute, languagePages] of clusters) {
    const expected = new Map([...languagePages].map(([language, page]) => [language, page.canonical]));
    const defaultUrl = expected.get("en") || expected.values().next().value;
    for (const [, page] of languagePages) {
      const actual = new Map([...page.alternates].filter(([language]) => language !== "x-default"));
      if (actual.size !== expected.size) {
        error(
          "LANGUAGE_CLUSTER_SIZE",
          page.file,
          `Logical route "${logicalRoute}" has ${expected.size} language pages but ${actual.size} non-default alternates.`,
        );
      }
      for (const [language, url] of expected) {
        if (actual.get(language) !== url) {
          error("LANGUAGE_CLUSTER_TARGET", page.file, `hreflang "${language}" does not match "${url}".`);
        }
        const target = pages.find((candidate) => candidate.canonical === actual.get(language));
        if (target && target.lang.split("-")[0] !== language) {
          error(
            "HREFLANG_LANGUAGE_MISMATCH",
            page.file,
            `hreflang "${language}" targets a page declared lang="${target.lang}".`,
          );
        }
      }
      if (page.alternates.get("x-default") !== defaultUrl) {
        error("LANGUAGE_CLUSTER_DEFAULT", page.file, `x-default must point to "${defaultUrl}".`);
      }
    }
  }
}

function isPrivateUrlPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return true;
  }

  const normalized = path.posix.normalize(decoded.replaceAll("\\", "/")).toLowerCase();
  if (normalized.split("/").some((segment) => segment === "..")) return true;
  if (BUILD_WORKSPACE_PREFIXES.some((prefix) => normalized.startsWith(`/${prefix}`))) return true;
  if (PRIVATE_PATH_PREFIXES.some((prefix) => normalized === prefix.slice(0, -1) || normalized.startsWith(prefix))) {
    return true;
  }
  if (PRIVATE_FILE_PATHS.has(normalized)) return true;
  if (SENSITIVE_FILE_PATTERN.test(normalized)) return true;
  if (PRIVATE_SOURCE_FILE_PATTERN.test(normalized)) return true;
  return normalized
    .split("/")
    .filter(Boolean)
    .some((segment) => segment.startsWith(".") && segment !== ".well-known");
}

function imageFileDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
      return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    if (buffer.length >= 12 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      const startOfFrame = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
      let offset = 2;
      while (offset + 8 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const marker = buffer[offset + 1];
        const segmentLength = buffer.readUInt16BE(offset + 2);
        if (startOfFrame.has(marker)) {
          return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
        }
        if (segmentLength < 2) break;
        offset += 2 + segmentLength;
      }
    }
    const source = buffer.slice(0, 4096).toString("utf8");
    if (source.includes("<svg")) {
      const width = Number(source.match(/\bwidth=["']([0-9]+(?:\.[0-9]+)?)(?:px)?["']/i)?.[1]);
      const height = Number(source.match(/\bheight=["']([0-9]+(?:\.[0-9]+)?)(?:px)?["']/i)?.[1]);
      if (width > 0 && height > 0) return { width, height };
      const viewBox = source
        .match(/\bviewBox=["']\s*[-0-9.]+\s+[-0-9.]+\s+([0-9.]+)\s+([0-9.]+)\s*["']/i)
        ?.slice(1, 3)
        .map(Number);
      if (viewBox?.[0] > 0 && viewBox?.[1] > 0) return { width: viewBox[0], height: viewBox[1] };
    }
  } catch {
    return null;
  }
  return null;
}

function localFileForUrl(url) {
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  const relativePath = pathname.replaceAll("\\", "/").replace(/^\/+/, "");
  const absolutePath = path.resolve(ROOT, relativePath);
  const relative = path.relative(ROOT, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  if (!fs.existsSync(absolutePath) || !fs.lstatSync(absolutePath).isFile()) return null;

  let current = path.resolve(ROOT);
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (fs.lstatSync(current).isSymbolicLink()) return null;
  }
  return absolutePath;
}

function internalUrl(value, base) {
  if (!value || /^(?:data|javascript|mailto|sms|tel):/i.test(value)) return null;
  try {
    const url = new URL(value, base);
    return url.origin === SITE_ORIGIN ? url : null;
  } catch {
    return null;
  }
}

function srcsetUrls(value) {
  return String(value || "")
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function elementMarkupById(html, id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const openingPattern = new RegExp(
    `<([a-z][\\w:-]*)\\b[^>]*\\bid\\s*=\\s*(?:\"${escapedId}\"|'${escapedId}')[^>]*>`,
    "i",
  );
  const opening = openingPattern.exec(html);
  if (!opening) return "";

  const closingPattern = new RegExp(`<\\/${opening[1]}\\s*>`, "i");
  const closing = closingPattern.exec(html.slice(opening.index + opening[0].length));
  if (!closing) return opening[0];
  const end = opening.index + opening[0].length + closing.index + closing[0].length;
  return html.slice(opening.index, end);
}

function containsPrivacyLink(markup) {
  return tagAttributes(markup, "a").some(({ attributes }) => /privacy/i.test(String(attributes.href || "")));
}

function validateLeadForms(page) {
  const forms = fullElements(page.html, "form");
  for (const [index, form] of forms.entries()) {
    const fields = [
      ...tagAttributes(form.body, "input"),
      ...tagAttributes(form.body, "select"),
      ...tagAttributes(form.body, "textarea"),
    ];
    const fieldNames = fields.map(({ attributes }) => String(attributes.name || "").toLowerCase());
    const hasPersonalField = fields.some(({ attributes }) =>
      ["email", "tel"].includes(String(attributes.type || "").toLowerCase()),
    );
    const isLeadForm =
      Object.hasOwn(form.attributes, "data-lead-form") ||
      hasPersonalField ||
      fieldNames.some((name) => ["company", "email", "name", "phone"].includes(name));

    if (!isLeadForm) continue;

    const method = String(form.attributes.method || "").toLowerCase();
    const rawAction = String(form.attributes.action || "").trim();
    if (method !== "post") {
      error("FORM_METHOD", page.file, `Lead form ${index + 1} must use method="post"; found "${method || "(missing)"}".`);
    }
    if (!rawAction) {
      error("FORM_ACTION", page.file, `Lead form ${index + 1} has no explicit action.`);
    } else {
      try {
        const actionUrl = new URL(rawAction, page.canonical);
        if (actionUrl.search || actionUrl.hash) {
          error("FORM_ACTION_QUERY", page.file, `Lead form ${index + 1} action must not contain a query or fragment.`);
        }
      } catch {
        error("FORM_ACTION", page.file, `Lead form ${index + 1} has an invalid action "${rawAction}".`);
      }
    }

    const requiredNames = ["name", "email", "country", "product", "package", "privacy_acknowledged"];
    for (const name of requiredNames) {
      const field = fields.find(({ attributes }) => String(attributes.name || "").toLowerCase() === name);
      if (!field) {
        error("FORM_REQUIRED_FIELD", page.file, `Lead form ${index + 1} is missing field "${name}".`);
      } else if (!Object.hasOwn(field.attributes, "required")) {
        error("FORM_REQUIRED_FIELD", page.file, `Lead form ${index + 1} field "${name}" is not required.`);
      }
    }

    const privacyField = fields.find(
      ({ attributes }) => String(attributes.name || "").toLowerCase() === "privacy_acknowledged",
    );
    if (privacyField && String(privacyField.attributes.type || "").toLowerCase() !== "checkbox") {
      error("FORM_PRIVACY_CONTROL", page.file, "privacy_acknowledged must be a required checkbox.");
    }
    const honeypot = fields.find(({ attributes }) => String(attributes.name || "").toLowerCase() === "website");
    if (
      !honeypot ||
      String(honeypot.attributes.tabindex || "") !== "-1" ||
      String(honeypot.attributes.autocomplete || "").toLowerCase() !== "off"
    ) {
      error("FORM_HONEYPOT", page.file, `Lead form ${index + 1} is missing the non-focusable website honeypot.`);
    }
    for (const label of fullElements(form.body, "label")) {
      const containsCheckbox = tagAttributes(label.markup, "input").some(
        ({ attributes }) => String(attributes.type || "").toLowerCase() === "checkbox",
      );
      if (containsCheckbox && tagAttributes(label.markup, "a").length) {
        error("FORM_NESTED_PRIVACY_LINK", page.file, "Privacy link must not be nested inside the checkbox label.");
      }
    }

    let associated = containsPrivacyLink(form.markup) || /privacy/i.test(String(form.attributes["data-privacy-url"] || ""));
    const describedBy = String(form.attributes["aria-describedby"] || "")
      .split(/\s+/)
      .filter(Boolean);
    for (const id of describedBy) {
      const markup = elementMarkupById(page.html, id);
      if (containsPrivacyLink(markup)) associated = true;
    }

    if (!associated) {
      error(
        "FORM_PRIVACY",
        page.file,
        `Lead form ${index + 1} has no form-level privacy link or aria-describedby privacy association.`,
      );
    }

    const hasNoScriptFallback = fullElements(page.html, "noscript").some((element) => {
      const links = tagAttributes(element.body, "a").map(({ attributes }) => String(attributes.href || ""));
      return links.some((href) => /^mailto:/i.test(href)) && links.some((href) => /(?:wa\.me|whatsapp)/i.test(href));
    });
    if (!hasNoScriptFallback) {
      error("FORM_NOSCRIPT_FALLBACK", page.file, "Lead form page has no noscript email and WhatsApp fallback.");
    }
    const hasStructuredWhatsappHandoff = tagAttributes(form.body, "button").some(({ attributes }) =>
      Object.hasOwn(attributes, "data-rfq-whatsapp"),
    );
    if (!hasStructuredWhatsappHandoff) {
      error("FORM_WHATSAPP_HANDOFF", page.file, "Lead form has no structured WhatsApp handoff.");
    }
  }
}

function validateReferences(pages) {
  const pageByUrl = new Map(pages.filter((page) => page.canonical).map((page) => [page.canonical, page]));
  const outboundByCanonical = new Map();
  let internalLinkCount = 0;
  let imageCount = 0;

  for (const page of pages) {
    const links = tagAttributes(page.html, "a").map((entry) => ({ ...entry, attribute: "href" }));
    const forms = tagAttributes(page.html, "form").map((entry) => ({ ...entry, attribute: "action", isForm: true }));
    const pageOutbound = new Set();

    for (const reference of [...links, ...forms]) {
      const rawValue = String(reference.attributes[reference.attribute] || "");
      if (!rawValue || rawValue.startsWith("#") && !page.canonical) continue;
      const url = internalUrl(rawValue, page.canonical);
      if (!url) continue;

      internalLinkCount += 1;
      if (isPrivateUrlPath(url.pathname)) {
        error("PRIVATE_REFERENCE", page.file, `Internal reference exposes private path "${rawValue}".`);
        continue;
      }
      if (/\.html$/i.test(url.pathname)) {
        error("PUBLIC_HTML_LINK", page.file, `Public internal reference contains .html: "${rawValue}".`);
      }
      const crawlQueryKeys = [...url.searchParams.keys()].filter((key) => CRAWL_QUERY_KEYS.has(key.toLowerCase()));
      if (crawlQueryKeys.length) {
        error(
          "INTERNAL_CRAWL_QUERY",
          page.file,
          `Internal reference exposes crawlable context/search parameters (${crawlQueryKeys.join(", ")}): "${rawValue}".`,
        );
      }

      url.search = "";
      let fragment = "";
      try {
        fragment = url.hash ? decodeURIComponent(url.hash.slice(1)) : "";
      } catch {
        error("INTERNAL_FRAGMENT_ENCODING", page.file, `Fragment has invalid URL encoding: "${rawValue}".`);
        continue;
      }
      url.hash = "";
      const targetUrl = url.href;
      const targetPage = pageByUrl.get(targetUrl);

      if (targetPage) {
        if (reference.attribute === "href") pageOutbound.add(targetUrl);
        if (fragment && !targetPage.ids.has(fragment)) {
          error("INTERNAL_FRAGMENT", page.file, `Fragment "#${fragment}" does not exist on "${targetUrl}".`);
        }
        continue;
      }

      if (reference.isForm && String(reference.attributes.method || "").toLowerCase() === "post") continue;
      if (!localFileForUrl(url)) {
        error("INTERNAL_TARGET", page.file, `Internal reference target does not exist: "${rawValue}".`);
      }
    }

    const images = tagAttributes(page.html, "img");
    imageCount += images.length;
    const highPriorityImages = images.filter(
      ({ attributes }) => String(attributes.fetchpriority || "").toLowerCase() === "high",
    );
    const eagerImages = images.filter(({ attributes }) => String(attributes.loading || "").toLowerCase() === "eager");
    if (highPriorityImages.length > 1) {
      error("IMAGE_PRIORITY_COUNT", page.file, `More than one image uses fetchpriority="high" (${highPriorityImages.length}).`);
    }
    if (eagerImages.length > 1) {
      error("IMAGE_EAGER_COUNT", page.file, `More than one image uses loading="eager" (${eagerImages.length}).`);
    }
    for (const { attributes } of images) {
      if (!Object.hasOwn(attributes, "alt")) {
        error("IMAGE_ALT", page.file, `Image "${attributes.src || "(missing src)"}" has no alt attribute.`);
      } else if (/\b(?:image|photo|visual)\s*\d*$/i.test(attributes.alt.trim())) {
        warning("IMAGE_ALT_GENERIC", page.file, `Image alt text is generic: "${attributes.alt}".`);
      }
      if (!/^\d+$/.test(String(attributes.width || "")) || Number(attributes.width) < 1) {
        error("IMAGE_WIDTH", page.file, `Image "${attributes.src || "(missing src)"}" has no valid intrinsic width.`);
      }
      if (!/^\d+$/.test(String(attributes.height || "")) || Number(attributes.height) < 1) {
        error("IMAGE_HEIGHT", page.file, `Image "${attributes.src || "(missing src)"}" has no valid intrinsic height.`);
      }
      const loading = String(attributes.loading || "").toLowerCase();
      const priority = String(attributes.fetchpriority || "").toLowerCase();
      if (priority === "high" && loading !== "eager") {
        error("IMAGE_PRIORITY_LOADING", page.file, `High-priority image "${attributes.src}" is not loaded eagerly.`);
      }
      if (loading === "lazy" && String(attributes.decoding || "").toLowerCase() !== "async") {
        error("IMAGE_LAZY_DECODING", page.file, `Lazy image "${attributes.src}" does not use decoding="async".`);
      }

      for (const rawValue of [attributes.src, ...srcsetUrls(attributes.srcset)]) {
        validateAssetReference(page, rawValue, "image");
      }
    }

    for (const { attributes } of tagAttributes(page.html, "source")) {
      for (const rawValue of [attributes.src, ...srcsetUrls(attributes.srcset)].filter(Boolean)) {
        validateAssetReference(page, rawValue, "source image");
      }
    }

    for (const { attributes } of tagAttributes(page.html, "link")) {
      if (hasRel(attributes, "stylesheet") || hasRel(attributes, "icon") || String(attributes.as).toLowerCase() === "image") {
        validateAssetReference(page, attributes.href, "linked asset");
      }
    }

    const imagePreloads = tagAttributes(page.html, "link").filter(
      ({ attributes }) => hasRel(attributes, "preload") && String(attributes.as || "").toLowerCase() === "image",
    );
    if (imagePreloads.length > 1) {
      error("IMAGE_PRELOAD_COUNT", page.file, `More than one image preload is declared (${imagePreloads.length}).`);
    }
    if (imagePreloads.length !== highPriorityImages.length) {
      error(
        "IMAGE_PRELOAD_PRIORITY",
        page.file,
        `Image preload count ${imagePreloads.length} does not match high-priority image count ${highPriorityImages.length}.`,
      );
    }
    const highPriorityUrls = new Set(
      highPriorityImages
        .flatMap(({ attributes }) => [attributes.src, ...srcsetUrls(attributes.srcset)])
        .filter(Boolean)
        .map((value) => internalUrl(value, page.canonical)?.href)
        .filter(Boolean),
    );
    const preloadUrls = new Set(
      imagePreloads
        .flatMap(({ attributes }) => [attributes.href, ...srcsetUrls(attributes.imagesrcset)])
        .filter(Boolean)
        .map((value) => internalUrl(value, page.canonical)?.href)
        .filter(Boolean),
    );
    if (
      highPriorityUrls.size !== preloadUrls.size ||
      [...highPriorityUrls].some((url) => !preloadUrls.has(url))
    ) {
      error("IMAGE_PRELOAD_TARGET", page.file, "Image preload URLs do not match the high-priority image URLs.");
    }

    for (const { attributes } of tagAttributes(page.html, "script")) {
      if (attributes.src) validateAssetReference(page, attributes.src, "script");
    }

    for (const { attributes } of tagAttributes(page.html, "meta")) {
      if (String(attributes.property || "").toLowerCase() === "og:image") {
        validateAssetReference(page, attributes.content, "Open Graph image");
      }
    }

    validateLeadForms(page);
    if (page.canonical) outboundByCanonical.set(page.canonical, pageOutbound);
  }

  return { imageCount, internalLinkCount, outboundByCanonical };
}

function validateLinkGraph(pages, outboundByCanonical) {
  const pageByCanonical = new Map(pages.filter((page) => page.canonical).map((page) => [page.canonical, page]));
  const homeUrl = `${SITE_ORIGIN}/`;
  if (!pageByCanonical.has(homeUrl)) {
    error("HOME_CANONICAL", "index.html", `Homepage canonical "${homeUrl}" is missing.`);
    return { maxDepth: 0, orphanCount: pages.length };
  }

  const inbound = new Map([...pageByCanonical.keys()].map((url) => [url, new Set()]));
  for (const [source, targets] of outboundByCanonical) {
    for (const target of targets) {
      if (source !== target && inbound.has(target)) inbound.get(target).add(source);
    }
  }

  let orphanCount = 0;
  for (const [url, sources] of inbound) {
    if (url === homeUrl || sources.size) continue;
    orphanCount += 1;
    error("ORPHAN_PAGE", pageByCanonical.get(url)?.file || url, "No other canonical page links to this page.");
  }

  const depth = new Map([[homeUrl, 0]]);
  const queue = [homeUrl];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const source = queue[cursor];
    const nextDepth = depth.get(source) + 1;
    for (const target of outboundByCanonical.get(source) || []) {
      if (!pageByCanonical.has(target) || depth.has(target)) continue;
      depth.set(target, nextDepth);
      queue.push(target);
    }
  }

  for (const [url, page] of pageByCanonical) {
    if (!depth.has(url)) {
      error("UNREACHABLE_PAGE", page.file, "Page is not reachable from the homepage through canonical internal links.");
    } else if (depth.get(url) > 3) {
      warning("CLICK_DEPTH", page.file, `Homepage click depth is ${depth.get(url)}; target is 3 or fewer.`);
    }
  }

  return {
    maxDepth: Math.max(0, ...depth.values()),
    orphanCount,
  };
}

function validateAssetReference(page, rawValue, label) {
  if (!rawValue) {
    error("ASSET_URL", page.file, `${label} has an empty URL.`);
    return;
  }

  const url = internalUrl(rawValue, page.canonical);
  if (!url) return;
  if (isPrivateUrlPath(url.pathname)) {
    error("PRIVATE_ASSET", page.file, `${label} points to private path "${rawValue}".`);
    return;
  }
  const localFile = localFileForUrl(url);
  if (!localFile) {
    error("ASSET_MISSING", page.file, `${label} does not exist: "${rawValue}".`);
  } else if (!isPublishAllowlistedFile(localFile)) {
    error("ASSET_NOT_PUBLISHABLE", page.file, `${label} is not covered by the fail-closed asset allow-list: "${rawValue}".`);
  }
}

function validateAssetsIgnore() {
  const filePath = path.join(ROOT, ".assetsignore");
  if (!fs.existsSync(filePath)) {
    error("ASSETSIGNORE_MISSING", ".assetsignore", "Missing .assetsignore.");
    return;
  }

  const orderedRules = fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const rules = new Set(orderedRules);
  if (orderedRules[0] !== "/*") {
    error("ASSETSIGNORE_FAIL_CLOSED", ".assetsignore", 'The first effective rule must be "/*" so unknown root assets are denied.');
  }
  for (const required of REQUIRED_ASSETSIGNORE_RULES) {
    if (!rules.has(required)) {
      error("ASSETSIGNORE_RULE", ".assetsignore", `Required private-path rule is missing: "${required}".`);
    }
  }
  const actualAllowRules = orderedRules.filter((rule) => rule.startsWith("!"));
  if (JSON.stringify(actualAllowRules) !== JSON.stringify(REQUIRED_ASSETS_ALLOW_RULES)) {
    const unexpected = actualAllowRules.filter((rule) => !REQUIRED_ASSETS_ALLOW_RULES.includes(rule));
    const missing = REQUIRED_ASSETS_ALLOW_RULES.filter((rule) => !actualAllowRules.includes(rule));
    error(
      "ASSETSIGNORE_ALLOWLIST_EXACT",
      ".assetsignore",
      [
        "Negated rules must exactly match the reviewed public allow-list and order.",
        unexpected.length ? `unexpected: ${unexpected.join(", ")}` : "",
        missing.length ? `missing: ${missing.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }
  const publicAllowIndex = orderedRules.indexOf("!/public/**");
  for (const protectiveRule of ["**/.env*", "**/.dev.vars*", "**/*.csv", "**/*.key", "**/*.md", "**/*.pem"]) {
    if (orderedRules.lastIndexOf(protectiveRule) < publicAllowIndex) {
      error(
        "ASSETSIGNORE_RULE_ORDER",
        ".assetsignore",
        `Protective rule must appear after the public-asset allow-list so it cannot be negated: "${protectiveRule}".`,
      );
    }
  }
  const lastAllowRuleIndex = orderedRules.reduce(
    (lastIndex, rule, index) => (rule.startsWith("!") ? index : lastIndex),
    -1,
  );
  if (lastAllowRuleIndex > publicAllowIndex) {
    error(
      "ASSETSIGNORE_LATE_NEGATION",
      ".assetsignore",
      `Allow-list rule "${orderedRules[lastAllowRuleIndex]}" appears after the protective deny rules and could re-expose a private file.`,
    );
  }
}

function validateDeploymentMetadata() {
  for (const relativeFile of ["_headers", "favicon.ico", "robots.txt", "script.js", "sitemap.xml", "styles.css"]) {
    const filePath = path.join(ROOT, relativeFile);
    const stats = fs.existsSync(filePath) ? fs.lstatSync(filePath) : null;
    if (!stats || stats.isSymbolicLink() || !stats.isFile()) {
      error("PUBLIC_RUNTIME_FILE", relativeFile, "Required public runtime file is missing or is not a normal file.");
    } else if (!isPublishAllowlistedFile(filePath)) {
      error("PUBLIC_RUNTIME_ALLOWLIST", relativeFile, "Required public runtime file is not covered by the asset allow-list.");
    }
  }

  const headersPath = path.join(ROOT, "_headers");
  if (!fs.existsSync(headersPath)) return;
  const headers = fs.readFileSync(headersPath, "utf8");
  for (const requiredPattern of [
    "https://premadepouchmachines.com/*",
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "X-Frame-Options: SAMEORIGIN",
    "Permissions-Policy:",
    "Strict-Transport-Security: max-age=31536000",
    "/styles.css",
    "/script.js",
    "/public/assets/*",
  ]) {
    if (!headers.includes(requiredPattern)) {
      error("HEADERS_CONTRACT", "_headers", `Required deployment header rule is missing: "${requiredPattern}".`);
    }
  }
  if (/Strict-Transport-Security:[^\r\n]*(?:includeSubDomains|preload)/i.test(headers)) {
    error("HSTS_SCOPE", "_headers", "HSTS must not add includeSubDomains or preload without an explicit domain-wide approval.");
  }
}

function validateNoSensitiveFilesInPublicRoots() {
  const publicRoots = [ROOT, ...PUBLIC_FILE_ROOTS.map((rootName) => path.join(ROOT, rootName))];
  const visited = new Set();

  function inspect(directory, rootOnly = false) {
    const resolvedDirectory = path.resolve(directory).toLowerCase();
    if (visited.has(resolvedDirectory)) return;
    visited.add(resolvedDirectory);

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolutePath = path.join(directory, entry.name);
      const relative = relativeFile(absolutePath);
      if (entry.isDirectory()) {
        if (!rootOnly) inspect(absolutePath);
        continue;
      }
      if (entry.isFile() && SENSITIVE_FILE_PATTERN.test(`/${toPosix(relative)}`)) {
        error("SENSITIVE_PUBLIC_FILE", relative, "Sensitive-looking file exists inside a public route root.");
      }
    }
  }

  inspect(ROOT, true);
  for (const directory of publicRoots.slice(1)) {
    if (fs.existsSync(directory)) inspect(directory);
  }
}

function expectedPublicCanonicals() {
  const languageCodes = LANGUAGES.map((lang) => lang.code);
  return new Set([
    ...STATIC_SEO_PAGES.flatMap((page) => languageCodes.map((langCode) => absoluteUrl(langCode, page.path))),
    ...MACHINE_PAGES.flatMap((item) =>
      languageCodes.map((langCode) => absoluteUrl(langCode, `/machines/${item.slug}.html`)),
    ),
    ...SEO_TOPIC_HUBS.map((hub) => absoluteUrl("en", hub.path)),
    ...SEO_TOPIC_PAGES.map((page) => absoluteUrl("en", page.path)),
    ...TRUST_PATHS.map((routePath) => absoluteUrl("en", routePath)),
  ]);
}

function validateInventoryContract(pages) {
  const languageCodes = LANGUAGES.map((lang) => lang.code);
  if (LANGUAGES.length !== INVENTORY_CONTRACT.languages) {
    error(
      "INVENTORY_LANGUAGES",
      "content/i18n.mjs",
      `Expected ${INVENTORY_CONTRACT.languages} languages; found ${LANGUAGES.length}.`,
    );
  }
  if (
    JSON.stringify([...languageCodes].sort()) !==
    JSON.stringify([...INVENTORY_CONTRACT.languageCodes].sort())
  ) {
    error(
      "INVENTORY_LANGUAGE_CODES",
      "content/i18n.mjs",
      `Expected language codes ${INVENTORY_CONTRACT.languageCodes.join(", ")}; found ${languageCodes.join(", ")}.`,
    );
  }
  if (MACHINE_PAGES.length < INVENTORY_CONTRACT.minimumMachines) {
    error(
      "INVENTORY_MACHINES",
      "content/seo-machines.mjs",
      `Machine inventory ${MACHINE_PAGES.length} is below ${INVENTORY_CONTRACT.minimumMachines}.`,
    );
  }
  if (SEO_TOPIC_PAGES.length < INVENTORY_CONTRACT.minimumTopics) {
    error(
      "INVENTORY_TOPICS",
      "content/seo-clusters.mjs",
      `Topic inventory ${SEO_TOPIC_PAGES.length} is below ${INVENTORY_CONTRACT.minimumTopics}.`,
    );
  }

  const expected = expectedPublicCanonicals();
  const actual = new Set(pages.map((page) => page.canonical).filter(Boolean));
  if (expected.size < INVENTORY_CONTRACT.minimumPages || pages.length < INVENTORY_CONTRACT.minimumPages) {
    error(
      "INVENTORY_PAGES",
      ".",
      `Expected/generated page inventory fell below ${INVENTORY_CONTRACT.minimumPages}: source ${expected.size}, generated ${pages.length}.`,
    );
  }
  for (const url of expected) {
    if (!actual.has(url)) error("INVENTORY_MISSING_PAGE", ".", `Expected source route is not generated: "${url}".`);
  }
  for (const url of actual) {
    if (!expected.has(url)) error("INVENTORY_UNDECLARED_PAGE", ".", `Generated page is not declared by the source model: "${url}".`);
  }
}

function printIssues(severity) {
  const matching = issues.filter((entry) => entry.severity === severity);
  if (!matching.length) return;

  console.log(`\n${severity}S (${matching.length})`);
  for (const entry of matching.slice(0, MAX_ISSUES_TO_PRINT)) {
    console.log(`[${entry.code}] ${entry.file}: ${entry.message}`);
  }
  if (matching.length > MAX_ISSUES_TO_PRINT) {
    console.log(`... ${matching.length - MAX_ISSUES_TO_PRINT} more ${severity.toLowerCase()} issues omitted.`);
  }
}

function run() {
  validateAssetsIgnore();
  validateDeploymentMetadata();
  validateNoSensitiveFilesInPublicRoots();

  const htmlFiles = collectHtmlFiles();
  if (!htmlFiles.length) error("HTML_MISSING", ".", "No generated HTML files found.");
  const pages = htmlFiles.map(extractPage);
  for (const page of pages) {
    if (!isPublishAllowlistedFile(path.join(ROOT, page.file))) {
      error("PAGE_NOT_PUBLISHABLE", page.file, "Generated page is outside the reviewed asset allow-list.");
    }
  }
  validateInventoryContract(pages);

  reportDuplicateValues(pages, "title", "TITLE_DUPLICATE", "title");
  reportDuplicateValues(pages, "description", "DESCRIPTION_DUPLICATE", "meta description");
  reportDuplicateValues(pages, "canonical", "CANONICAL_DUPLICATE", "canonical URL");

  const sitemapEntries = parseSitemap();
  compareSitemapAndPages(pages, sitemapEntries);
  validateHreflangReciprocity(pages);
  validateLanguageClusters(pages);
  const referenceMetrics = validateReferences(pages);
  const graphMetrics = validateLinkGraph(pages, referenceMetrics.outboundByCanonical);

  const errors = issues.filter((entry) => entry.severity === "ERROR");
  const warnings = issues.filter((entry) => entry.severity === "WARN");
  console.log("Generated site audit");
  console.log(`HTML pages: ${pages.length}`);
  console.log(`Sitemap URLs: ${sitemapEntries.size}`);
  console.log(`Internal references checked: ${referenceMetrics.internalLinkCount}`);
  console.log(`Images checked: ${referenceMetrics.imageCount}`);
  console.log(`Maximum homepage click depth: ${graphMetrics.maxDepth}`);
  console.log(`Orphan pages: ${graphMetrics.orphanCount}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);

  printIssues("ERROR");
  printIssues("WARN");

  if (errors.length) {
    console.error("\nAudit failed.");
    process.exitCode = 1;
  } else {
    console.log("\nAudit passed.");
  }
}

function runDeploymentBoundaryOnly() {
  validateAssetsIgnore();
  validateDeploymentMetadata();
  validateNoSensitiveFilesInPublicRoots();
  const errors = issues.filter((entry) => entry.severity === "ERROR");
  const warnings = issues.filter((entry) => entry.severity === "WARN");
  console.log("Deployment boundary audit");
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  printIssues("ERROR");
  printIssues("WARN");
  if (errors.length) {
    console.error("\nDeployment boundary audit failed.");
    process.exitCode = 1;
  } else {
    console.log("\nDeployment boundary audit passed.");
  }
}

if (process.argv.includes("--deployment-boundary-only")) runDeploymentBoundaryOnly();
else run();
