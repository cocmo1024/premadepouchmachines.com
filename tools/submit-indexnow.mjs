#!/usr/bin/env node
// Submit all sitemap URLs to IndexNow (Bing/Yandex etc.).
// Key file must be published at https://premadepouchmachines.com/<key>.txt
import fs from "node:fs";
const KEY = "51c57f96e042f854af9a9d9f3ba48d02";
const HOST = "premadepouchmachines.com";
const sitemap = fs.readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
const urls = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`Submitting ${urls.length} URLs to IndexNow with key ${KEY}`);
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: batch }),
  });
  console.log(`Batch ${i / 10000 + 1}: HTTP ${res.status} ${await res.text().then(t => t.slice(0, 200))}`);
  if (![200, 202].includes(res.status)) process.exitCode = 1;
}
