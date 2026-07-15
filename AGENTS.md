# Repository Instructions

任何新增、改写、翻译、合并或删除站点内容的任务，开始前都必须完整阅读并执行根目录的 `CONTENT_UPDATE_GUIDE.md`。

- `tools/build-multilingual-site.mjs` 与 `content/*.mjs` 是内容事实源；禁止直接编辑生成的 HTML、语言目录或 `sitemap.xml`。
- 必须保持七语言、canonical、hreflang、JSON-LD、页面数与 sitemap 一致，并核验设备规格、翻译和图片授权。
- 修改源后必须重新运行生成器以及指南中的数量、私有路径、预览和 Cloudflare dry-run 验收。
- 保留现有 URL、工业设计与 RFQ 路径。不要为了数量批量制造近义内容，也不要在没有证据时承诺性能、认证、价格或交期。
- 未获得明确授权时，不得提交、推送或部署。
