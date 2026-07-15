# Premade Pouch Machines 内容更新执行指南

本文件是 `premadepouchmachines.com` 后续新增、重写、翻译或删除内容时的强制执行规范。开始工作前先完整阅读本文件；如果实际代码与本文不一致，先查清生成逻辑并更新本文，不能绕过生成器直接修改成品页。

## 1. 架构原则：生成器是唯一事实源

这个项目不是 801 个彼此独立的手写网页。内容数据和模板生成所有公开 HTML 与 `sitemap.xml`：

- 内容数据：`content/*.mjs`
- 页面、导航、JSON-LD、canonical、hreflang 与 sitemap 模板：`tools/build-multilingual-site.mjs`
- 兼容入口：`tools/build-seo-pages.mjs`，它只调用主生成器
- 生成成品：根目录 HTML、`machines/`、`applications/`、`formats/`、`guides/`、`industries/`、`insights/`、`technologies/`、`troubleshooting/`、六个非英语目录及 `sitemap.xml`

**禁止直接编辑任何生成的 HTML 或 `sitemap.xml`。** 直接修改会在下一次生成时丢失，还可能造成语言版本、canonical、hreflang 和 sitemap 不一致。即使只改首页一句话，也应修改 `content/` 或 `tools/build-multilingual-site.mjs` 中的源，然后重新生成全部页面。

当前基线为 **801 个 HTML、801 个 sitemap URL**。这是验收基线，不是强行维持的上限；如有意新增、合并或删除页面，两个数字必须同步变化，并更新 `README.md` 中的库存说明。

## 2. 应该修改哪个文件

| 任务 | 唯一应修改的源 |
| --- | --- |
| 新增或调整机器型号页、规格、选件、应用 | `content/seo-machines.mjs`；授权宣传册派生机器和图库映射在 `content/brochure-machines.mjs` |
| 调整机器页的六种非英语翻译、术语或规格标签 | `content/machine-localization.mjs` |
| 修改语言列表、站点地址、`LASTMOD`、主页/分类页公共翻译、六个 pillar 路由 | `content/i18n.mjs` |
| 新增或调整英文应用、格式、采购、行业、技术、故障诊断内容 | `content/seo-clusters.mjs`；行为型和补充意图数据在 `content/search-intent-expansion.mjs` |
| 修改页面结构、导航、CTA、邮件/WhatsApp、HTML 元数据、JSON-LD、hreflang 或 sitemap 生成 | `tools/build-multilingual-site.mjs` |
| 修改视觉样式或交互 | `styles.css`、`script.js`；如果浏览器必须立即取得新版本，同时更新生成器中的 `ASSET_VERSION` |
| 添加批准使用的机器图片 | `public/assets/brochure/` 或现有机器资源目录，并在内容源中引用；不要把临时提取文件放进公开目录 |

不要把 `tmp/` 中的提取结果当作已经批准的公开素材。`content/`、`tools/`、`tmp/`、项目说明和部署配置都属于私有项目文件，必须继续由 `.assetsignore` 排除。

## 3. 新内容立项门槛

每个新页面在动笔前都要能回答：

1. 它服务哪个明确买家任务：选机、比较方案、排查故障、定义验收、准备 RFQ，还是理解法规影响？
2. 它与已有页面的搜索意图和工程决策有什么实质差异？仅更换产品名、行业名或同义词不能成为新页面。
3. 它能否给出可执行的选择条件、风险、试机要求、验收方法或 RFQ 输入，而不只是介绍机器？
4. 它引用的设备能力、规格和法规是否有可追溯证据？
5. 它应该进入哪个既有 hub，且会从哪些相关页面获得自然的上下文内链？

优先重写或合并重叠内容，不以页面数、字数或关键词密度作为质量目标。不要批量制造“某产品 packaging machine”近义页。

### GSC 与页面去重证据

新增、合并、删除或改动重要 title/description 前，先查看尽可能新的 Google Search Console **Queries** 与 **Pages** 数据：

1. 比较最近 28 天与前 28 天；重要主题再看最近 3 个月、6 个月和去年同期，记录取数日期、clicks、impressions、CTR、average position 与实际落地页。
2. 同一查询已经由某个页面获得展示时，优先补强该 URL，不再创建只换产品名、行业名或同义词的竞争页。
3. 展示增长但 CTR 低时，先核对 title、description、语言和页面答案是否匹配买家任务；不要先改 slug。
4. 低点击或零点击不能单独证明页面应删除，尤其是曝光很少、刚上线或非英语样本不足时。合并/下线前还要检查查询重叠、内链、外链、询盘价值和 hreflang 角色。
5. 多语言页按语言、国家和落地 URL 分开判断；不能把英语表现直接当作西语、法语、德语、葡语、俄语或阿语需求证据。
6. GSC 导出、客户查询词、询盘和未公开商业数据只保存在私有工作记录中，不写入生成器或公开 HTML。

新页上线后记录规范 URL、提交号和日期；待抓取后用同一 query/page 组复盘。短期波动不是批量改标题、刷新 `LASTMOD` 或再建近义页的理由。

## 4. 设备能力与规格声明

- 速度、袋宽/袋长、填充范围、精度、功率、气压、材料与选件必须来自授权宣传册、已确认的设备资料或可复核的工程记录。
- 所有数值必须说明适用的机型、框架、袋型、产品状态或试验条件。优先写成“参考范围”“selected configurations”“depending on product/bag size”，不要包装成全机型保证值。
- 理论循环速度不能等同于合格成品速度。涉及产能时应同时提示产品流动性、计量、封口、补料、停机和废品率。
- 食品接触不等于防爆、粉尘安全或具体地区合规；不把不锈钢机架写成认证结论。
- 不声称 CE、UL、FDA、EHEDG、ISO、ATEX 或其他认证/合规状态，除非项目拥有对应设备、版本、签发主体和有效文件。标准与法规内容优先引用官方当前版本，并写清适用地区和日期。
- 不承诺最终价格、交期、精度、OEE、回收期或适配性。把这些结果落到样品、商业膜材、目标 SKU、FAT 协议和最终配置确认上。
- 不使用未经授权的厂商品牌、型号前缀、商标、证书截图、二维码、合作方 logo 或带客户归属的包装样品。

内容至少应帮助买家形成一份更好的 RFQ：产品照片/样品、密度或黏度/颗粒信息、填充量、袋或膜样、目标合格产能、电压、压缩空气、场地、前后道接口、检测和验收要求。

## 5. 七语言与 hreflang 规则

公开语言固定为：英语 `en`、西班牙语 `es`、法语 `fr`、德语 `de`、葡萄牙语 `pt`、俄语 `ru`、阿拉伯语 `ar`。

- 首页、机器目录、六个 pillar 和机器详情当前均生成 7 个语言版本；英文专题 hub 与长尾专题目前仅生成英语。不要给不存在的翻译页输出 hreflang。
- 添加到 7 语言路由的内容时，必须同步完成 `content/i18n.mjs` / `content/machine-localization.mjs` 中的所有语言文案。不能先复制英语占位再上线。
- 翻译必须由具备该语言能力的人复核：机器类别、计量方式、封口、单位、CTA 与 RFQ 字段要符合工业采购语境，不能逐字机翻。阿拉伯语同时检查 `lang="ar"`、`dir="rtl"`、标点、数字与移动布局。
- 产品名、单位、范围和限制条件在七种语言中必须等价；翻译不能擅自提高速度、精度、认证或保证程度。
- 生成器负责 reciprocal hreflang、`x-default`、canonical 与 sitemap alternate。不要在成品 HTML 中补标签。
- 只在发生实质内容更新时修改 `content/i18n.mjs` 的 `LASTMOD`；不能为了“看起来新”每天刷新日期。

## 6. 内链、结构化数据与 URL

- 保留已经上线的 URL。重写内容时保留原 `slug`/路径、canonical 与对应 hreflang；确需改 URL 时必须同时设计永久重定向并验证旧 URL，不允许只删除旧页。
- 新页必须归入已有 topic hub，并添加少量真正推进下一步决策的相关机器、相关专题和 RFQ 内链。
- 每页只能有一个主要 H1；title、description、H1 与正文要描述同一买家任务，不堆砌关键词。
- JSON-LD 只能描述页面中买家实际能看到的内容。FAQ、规格、产品/文章、引用与 ItemList 数据必须与正文一致；不要伪造评价、评分、库存、价格或认证。
- 所有站内链接使用生成器的路由函数和既有公开路径，避免重新引入旧 `.html` 内链。pillar 文件名是现有公开 URL，不能与普通旧式内部链接规则混淆。

## 7. 图片与加载规则

- 图片必须解释真实机器、工位、包装形式或工程差异；不以图片数量作为 SEO 指标。
- 只使用获授权且已清理的素材。发布前检查商标、型号铭牌、二维码、证书、客户包装、人物隐私和误导性裁剪。
- 使用有意义的英文文件名和准确 alt；alt 描述画面和用途，不堆关键词，不写图片中不存在的能力。
- 首页只允许主要 Hero 使用 `loading="eager"`、`fetchpriority="high"`；其他首屏以下图片保持 `loading="lazy" decoding="async"`。已知尺寸时写入 `width`/`height`，避免布局跳动。
- 优先新增压缩后的 WebP/AVIF 或合理大小的现有格式。不要用 CSS 缩小超大原图代替资源优化。
- `/public/assets/*` 当前浏览器缓存 7 天。替换图片优先使用新文件名；修改 `styles.css` 或 `script.js` 时检查并按需提升 `ASSET_VERSION`，避免用户继续命中旧资源。

## 8. 标准更新流程

从仓库根目录执行：

```powershell
git status --short
node tools/build-multilingual-site.mjs
git diff --stat
git diff --check
```

生成后不要只看一个页面。至少人工抽查：

- 英语首页和本次新增/修改页；
- 一页机器详情和所属 hub；
- `es`、`fr`、`de`、`pt`、`ru` 各一页；
- 阿拉伯语桌面与移动页面；
- title、description、canonical、hreflang、H1、JSON-LD、内链、CTA、邮件和 WhatsApp；
- Hero 只有一张 eager/high 图片，其余图片保持 lazy；
- 规格、单位、限制条件和来源与内容源一致。

本地预览：

```powershell
python -m http.server 4173
```

浏览 `http://localhost:4173/`，不要用直接双击 HTML 的结果代替 HTTP 预览。

## 9. 必须通过的自动验收

页面与 sitemap 数量必须相等；当前正常结果是 `801 / 801`：

```powershell
$publicRouteRoots = @('machines','applications','formats','guides','industries','insights','technologies','troubleshooting','es','fr','de','pt','ru','ar')
$htmlCount = (Get-ChildItem -File -Filter *.html).Count
$publicRouteRoots | ForEach-Object {
  $htmlCount += (Get-ChildItem $_ -Recurse -File -Filter *.html).Count
}
$sitemapCount = (Select-String -Path .\sitemap.xml -Pattern '<loc>' -AllMatches).Matches.Count
"HTML=$htmlCount; sitemap=$sitemapCount"
if ($htmlCount -ne $sitemapCount) { throw 'HTML and sitemap counts differ' }
```

当前每个非英语目录有 68 个 HTML。若机器或多语言 pillar 数量有意变化，六个目录应同步变化：

```powershell
'es','fr','de','pt','ru','ar' | ForEach-Object {
  "$_=$((Get-ChildItem $_ -Recurse -File -Filter *.html).Count)"
}
```

检查关键 SEO 标签、私有路径排除和部署包：

```powershell
Select-String -Path .\index.html -Pattern 'rel="canonical"','hreflang="x-default"','fetchpriority="high"'
Select-String -Path .\ar\index.html -Pattern '<html lang="ar" dir="rtl">','hreflang="x-default"'
Select-String -Path .\.assetsignore -Pattern '^content/','^tools/','^tmp/','^AGENTS\.md$','^CONTENT_UPDATE_GUIDE\.md$'
npx wrangler@4.111.0 deploy --dry-run
```

如果不是明确的页面库存调整，生成后出现大批无关 HTML 差异就是异常：先停止，检查日期、排序、换行、编码或生成器是否被意外改变，不能把噪声一起提交。

## 10. 上线与生产验收

只有在代码审核、远端推送和部署均获授权后执行：

```powershell
git add <本次明确修改的源文件和重新生成的公开文件>
git commit -m "Update <packaging topic> content"
git push origin main
npx wrangler@4.111.0 deploy
```

`4.111.0` 是本指南当前验证过的 Wrangler 版本；升级部署工具应作为单独改动完成 dry-run 和生产验收。如果 Cloudflare Git 集成是当前唯一部署链路，`git push` 即为部署触发器，不要再手动部署。

上线后至少验证：

```powershell
curl.exe -I https://premadepouchmachines.com/
curl.exe -I https://premadepouchmachines.com/sitemap.xml
curl.exe -I https://premadepouchmachines.com/styles.css
curl.exe -I https://premadepouchmachines.com/public/assets/brochure/rotary-premade-line-hero.png
curl.exe -I https://premadepouchmachines.com/content/i18n.mjs
curl.exe -I https://premadepouchmachines.com/tools/build-multilingual-site.mjs
curl.exe -I https://premadepouchmachines.com/CONTENT_UPDATE_GUIDE.md
```

预期：首页、sitemap 和公开资源为 `200`；`content/`、`tools/` 和本指南为 `404`。公开 HTML 不应获得长期 immutable 缓存；CSS、JavaScript 和公开图片应保留当前 7 天缓存策略。再检查三种非规范主机形式均单跳到 HTTPS apex，且路径与查询参数不丢失。

最后在生产环境抽查修改页、一个非英语版本和阿拉伯语版本，确认 canonical/hreflang、JSON-LD、图片加载、RFQ CTA 与 sitemap 中的 URL 均为最终线上结果。
