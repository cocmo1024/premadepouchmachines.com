#!/usr/bin/env node

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT_PATH = path.resolve(ROOT);
const HOST = "127.0.0.1";
const DEFAULT_PORT = 4173;

const PRIVATE_TOP_LEVEL = new Set([
  ".git",
  ".wrangler",
  "content",
  "functions",
  "node_modules",
  "tmp",
  "tools",
]);

const PRIVATE_FILE_NAMES = new Set([
  ".assetsignore",
  ".env",
  ".gitattributes",
  ".gitignore",
  "_headers",
  "_redirects",
  "agents.md",
  "content_update_guide.md",
  "package-lock.json",
  "package.json",
  "pnpm-lock.yaml",
  "readme.md",
  "wrangler.json",
  "wrangler.jsonc",
  "yarn.lock",
]);

const MIME_TYPES = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".csv", "text/csv; charset=utf-8"],
  [".gif", "image/gif"],
  [".htm", "text/html; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".mp4", "video/mp4"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function portFromEnvironment() {
  if (!process.env.PORT) return DEFAULT_PORT;

  const rawPort = process.env.PORT.trim();
  const port = Number(rawPort);
  if (!/^\d+$/.test(rawPort) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535; received "${process.env.PORT}".`);
  }
  return port;
}

function isWithinRoot(candidate) {
  const relative = path.relative(ROOT_PATH, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function containsSymbolicLink(candidate) {
  const relative = path.relative(ROOT_PATH, candidate);
  if (!relative) return false;

  let current = ROOT_PATH;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    const stat = await fs.promises.lstat(current);
    if (stat.isSymbolicLink()) return true;
  }
  return false;
}

function isPrivateWebPath(webPath) {
  const segments = webPath
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());

  if (!segments.length) return false;
  if (PRIVATE_TOP_LEVEL.has(segments[0])) return true;
  if (segments[0].startsWith("会话_")) return true;
  if (segments.some((segment) => segment.startsWith(".") && segment !== ".well-known")) return true;

  const fileName = segments.at(-1);
  if (PRIVATE_FILE_NAMES.has(fileName)) return true;
  if (fileName.endsWith(".pem") || fileName.endsWith(".key") || fileName.endsWith(".p12") || fileName.endsWith(".pfx")) {
    return true;
  }
  return false;
}

function decodeAndValidatePath(rawUrl) {
  const rawPath = String(rawUrl || "/").split(/[?#]/, 1)[0] || "/";
  let decoded;

  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    return { error: 400, message: "Malformed URL encoding." };
  }

  decoded = decoded.replaceAll("\\", "/");
  if (decoded.includes("\0")) return { error: 400, message: "Invalid path." };

  const rawSegments = decoded.split("/");
  if (rawSegments.some((segment) => segment === "." || segment === "..")) {
    return { error: 403, message: "Directory traversal is not allowed." };
  }

  const normalized = path.posix.normalize(decoded.startsWith("/") ? decoded : `/${decoded}`);
  if (!normalized.startsWith("/") || isPrivateWebPath(normalized)) {
    return { error: 404, message: "Not found." };
  }

  return { pathname: normalized, hadTrailingSlash: decoded.endsWith("/") };
}

async function existingFile(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  if (!isWithinRoot(absolutePath)) return null;

  try {
    const stat = await fs.promises.lstat(absolutePath);
    if (!stat.isFile()) return null;
    if (await containsSymbolicLink(absolutePath)) return null;
    return { filePath: absolutePath, stat };
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return null;
    throw error;
  }
}

async function existingDirectory(relativePath) {
  const absolutePath = path.resolve(ROOT, relativePath);
  if (!isWithinRoot(absolutePath)) return false;

  try {
    const stat = await fs.promises.lstat(absolutePath);
    if (!stat.isDirectory()) return false;
    return !(await containsSymbolicLink(absolutePath));
  } catch (error) {
    if (error?.code === "ENOENT" || error?.code === "ENOTDIR") return false;
    throw error;
  }
}

async function resolveRequest(rawUrl) {
  const validated = decodeAndValidatePath(rawUrl);
  if (validated.error) return validated;

  const webPath = validated.pathname;
  const relativeWebPath = webPath.slice(1);

  if (validated.hadTrailingSlash || webPath === "/") {
    const indexPath = path.join(relativeWebPath, "index.html");
    const file = await existingFile(indexPath);
    return file ? { ...file } : { error: 404, message: "Not found." };
  }

  if (path.posix.extname(webPath)) {
    const file = await existingFile(relativeWebPath);
    return file ? { ...file } : { error: 404, message: "Not found." };
  }

  const cleanUrlFile = await existingFile(`${relativeWebPath}.html`);
  if (cleanUrlFile) return { ...cleanUrlFile };

  if (await existingDirectory(relativeWebPath)) {
    const parsed = new URL(rawUrl || "/", `http://${HOST}`);
    return { redirect: `${parsed.pathname}/${parsed.search}` };
  }

  return { error: 404, message: "Not found." };
}

function sendText(response, statusCode, message, extraHeaders = {}, headOnly = false) {
  const body = `${message}\n`;
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  });
  response.end(headOnly ? undefined : body);
}

const port = portFromEnvironment();
const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendText(response, 405, "Method not allowed.", { Allow: "GET, HEAD" });
    return;
  }

  try {
    const result = await resolveRequest(request.url);
    if (result.redirect) {
      response.writeHead(308, {
        "Cache-Control": "no-store",
        Location: result.redirect,
      });
      response.end();
      return;
    }

    if (result.error) {
      sendText(response, result.error, result.message, {}, request.method === "HEAD");
      return;
    }

    const extension = path.extname(result.filePath).toLowerCase();
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": result.stat.size,
      "Content-Type": MIME_TYPES.get(extension) || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    const stream = fs.createReadStream(result.filePath);
    stream.on("error", () => {
      if (!response.headersSent) sendText(response, 500, "Unable to read file.");
      else response.destroy();
    });
    stream.pipe(response);
  } catch (error) {
    console.error(error);
    if (!response.headersSent) sendText(response, 500, "Internal preview server error.", {}, request.method === "HEAD");
    else response.destroy();
  }
});

server.on("clientError", (_error, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
});

server.listen(port, HOST, () => {
  console.log(`Previewing ${ROOT}`);
  console.log(`http://${HOST}:${port}/`);
  console.log("Clean URLs and directory index routes are enabled. Press Ctrl+C to stop.");
});
