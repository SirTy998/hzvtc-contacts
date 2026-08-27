# 一键导出到手机通讯录（vCard）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 PWA 中新增“导出到手机通讯录”：一键生成含全部成员的标准 vCard（.vcf）文件，由 iOS 系统通讯录导入；多次导入时依靠系统“更新/合并”提示避免重复。

**Architecture:** 全部逻辑放在现有单文件应用 `app.js` 的 IIFE 内：新增纯函数 vCard 构建（转义 + UTF-8 安全折行 + 下载），根页“导出”图标改为弹出底部菜单（导出 Excel / 导出到手机通讯录），选择 vcf 后先出防重复说明确认框，再生成并下载文件。

**Tech Stack:** 原生 HTML/CSS/JS（无框架），Playwright + 无头 Chrome（`playwright-core`，绝对路径导入）做端到端验证。

## Global Constraints

- 仅改根页面导出入口；其他页面的导出逻辑不动。
- vCard 3.0；UTF-8 无 BOM；转义规则：`\`→`\\`、`,`→`\,`、`;`→`\;`、换行→`\n`。
- 长行按 ≤75 字节折行（物理行含续行前导空格），折行不切断多字节 UTF-8 字符。
- 文件名字符串固定为 `杭州职业技术大学通讯录.vcf`。
- 手机号/办公电话保留数字与 `+`。
- 防重复文案必须包含：再次导入时若系统提示“更新现有联系人/新建联系人”，选择“更新”即可避免重复新建。
- 修改 `app.js` 后必须同步 `dist/app.js`；更新 `对话总结.md` 追加 R22 记录。
- 测试在仓库 `tests/` 下；运行命令需在无沙箱/授权环境（本机 Chrome 启动需要权限）。

---

### Task 1: vCard 生成与下载核心逻辑

**Files:**
- Modify: `app.js`（在 `exportExcel` 附近新增 vCard 工具与导出函数）
- Test: `tests/vcf-export-core.spec.mjs`（新建）

**Interfaces:**
- Produces: `buildVCard()`（返回完整 .vcf 文本，供 Task 2 的 `exportVCard` 调用）、`exportVCard()`（生成 Blob 并触发下载）。
- 依赖现有：`members`、`departments`、`getDept(id)`、`toast(msg)`、`esc(s)`。

- [ ] **Step 1: 写失败测试**

新建 `tests/vcf-export-core.spec.mjs`：

```js
import { chromium } from "/Users/ty/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/Users/ty/Desktop/Codex项目文件/高校通讯录";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
});

let failures = 0;
const check = (name, cond) => { console.log((cond ? "PASS" : "FAIL") + " - " + name); if (!cond) failures++; };

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await server.listen(8902, "127.0.0.1");

// 真实数据：全新上下文，走完整解锁流程
await page.goto("http://127.0.0.1:8902/index.html", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
await page.waitForSelector("#lockScreen:not([hidden])", { timeout: 8000 });
await page.fill("#lockInput", "CastASpell");
await page.click("#lockBtn");
await page.waitForSelector("#lockScreen[hidden]", { state: "attached", timeout: 8000 });
await page.waitForTimeout(700);

// 点导出图标 -> 菜单出现
await page.click('[data-act="export"]');
await page.waitForSelector('.modal [data-act="export-excel"], .sheet-item', { timeout: 5000 });
check("导出菜单出现", await page.locator('.modal [data-act="export-excel"]').count() === 1);

// 点“导出到手机通讯录” -> 确认框 -> 下载 .vcf
await page.click('.modal [data-act="export-vcf"]');
await page.waitForSelector('.modal [data-act="ok"]', { timeout: 5000 });
const dlgText = await page.locator(".modal").textContent();
check("确认框包含防重复提示", dlgText.includes("更新"));
const [download] = await Promise.all([
  page.waitForEvent("download"),
  page.click('.modal [data-act="ok"]'),
]);
check("下载文件名正确", download.suggestedFilename() === "杭州职业技术大学通讯录.vcf");

const text = fs.readFileSync(await download.path(), "utf8");
const cards = text.split("BEGIN:VCARD").slice(1);
check("包含全部 107 名成员", cards.length === 107);
check("首条成员字段完整", cards[0].includes("FN:陈文岳") && cards[0].includes("N:陈文岳;;;;") && cards[0].includes("TITLE:党委书记") && cards[0].includes("ORG:杭州职业技术大学;校领导") && cards[0].includes("TEL;TYPE=CELL:13588811505") && cards[0].includes("TEL;TYPE=WORK,VOICE:56700066"));
check("每条记录以 END:VCARD 结束", cards.every((c) => c.includes("END:VCARD")));
check("所有物理行 ≤75 字节", text.split(/\r\n|\n/).every((line) => Buffer.byteLength(line, "utf8") <= 75));

await browser.close();
server.close();
console.log(failures ? "RESULT: FAIL (" + failures + ")" : "RESULT: PASS");
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node tests/vcf-export-core.spec.mjs`（需授权环境）
Expected: FAIL —— 页面无 `.modal [data-act="export-excel"]`，等待超时。

- [ ] **Step 3: 实现核心逻辑（先加下载函数，暂不改入口）**

在 `app.js` 的 `exportExcel` 函数之后追加：

```js
  /* vCard 工具：转义 + UTF-8 安全折行（RFC 6350：物理行 ≤75 字节） */
  const vcfEscape = (s) => String(s == null ? "" : s)
    .replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\r?\n/g, "\\n");
  function vcfFold(text) {
    const bytes = new TextEncoder().encode(text);
    const out = [];
    let start = 0;
    while (start < bytes.length) {
      let end = Math.min(start + 74, bytes.length);
      if (end < bytes.length) {
        while (end > start && (bytes[end] & 0xC0) === 0x80) end--; // 不在多字节字符中间断行
      }
      out.push(new TextDecoder().decode(bytes.slice(start, end)));
      start = end;
    }
    return out.join("\r\n ");
  }

  /* 生成完整 vCard 文本（全部成员） */
  function buildVCard() {
    const root = getDept(ROOT_ID);
    const org = root ? root.name : "杭州职业技术大学";
    const cards = members.map((m) => {
      const dept = getDept(m.departmentId);
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "UID:hzvtc-" + m.id + "@hzvtc-contacts",
        "FN:" + vcfEscape(m.name),
        "N:" + vcfEscape(m.name) + ";;;;",
      ];
      if (m.position) lines.push("TITLE:" + vcfEscape(m.position));
      lines.push("ORG:" + vcfEscape(org) + ";" + (dept ? vcfEscape(dept.name) : ""));
      if (m.mobilePhone) lines.push("TEL;TYPE=CELL:" + m.mobilePhone);
      if (m.officePhone) lines.push("TEL;TYPE=WORK,VOICE:" + m.officePhone);
      lines.push("END:VCARD");
      return lines.map(vcfFold).join("\r\n");
    });
    return cards.join("\r\n") + "\r\n";
  }

  /* 生成 .vcf 并触发下载 */
  function exportVCard() {
    if (!members.length) { toast("暂无联系人可导出"); return; }
    const blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "杭州职业技术大学通讯录.vcf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("通讯录文件已生成，请在“下载/文件”中打开，按系统提示添加到通讯录");
  }
```

说明：每条属性行先整体转义、再逐行折行；`TITLE`/`ORG` 等长中文行会被正确折行且不切断字符。

- [ ] **Step 4: 接入入口（菜单 + 确认框），让测试通过**

1. 在 `ICON` 对象中新增联系人图标：

```js
contact: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.6 19.3c1.4-5.1 4.5-7.3 7.4-7.3s6 2.2 7.4 7.3a1 1 0 0 1-1 1.3H5.6a1 1 0 0 1-1-1.3Z"/><circle cx="12" cy="8.2" r="4.2"/></svg>',
```

2. 在 `exportVCard` 之后新增导出菜单：

```js
  /* 导出菜单：Excel / 手机通讯录 */
  function openExportSheet() {
    const mask = openModal(`
      <button class="sheet-item" data-act="export-excel">${ICON.file}导出 Excel</button>
      <button class="sheet-item" data-act="export-vcf">${ICON.contact}导出到手机通讯录（.vcf）</button>
      <button class="sheet-cancel" data-act="cancel">取消</button>`, () => {});
    mask.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (!act) return;
      const a = act.dataset.act;
      if (a === "cancel") return closeModal(mask);
      if (a === "export-excel") { closeModal(mask); exportExcel(); }
      if (a === "export-vcf") {
        closeModal(mask);
        confirmDialog("导出到手机通讯录",
          `将生成通讯录文件（共 ${members.length} 人），在手机“下载/文件”中打开即可导入系统通讯录。再次导入时，若系统提示“更新现有联系人/新建联系人”，请选择“更新”，即可避免重复新建。`,
          exportVCard);
      }
    });
  }
```

3. 根页点击处理中把 `else if (act === "export") exportExcel();` 改为 `else if (act === "export") openExportSheet();`

- [ ] **Step 5: 运行测试确认通过**

Run: `node tests/vcf-export-core.spec.mjs`
Expected: PASS（10 项断言全过）

- [ ] **Step 6: 同步并提交**

```bash
cp app.js dist/app.js
git add app.js dist/app.js tests/vcf-export-core.spec.mjs
git commit -m "功能：导出手机通讯录 vCard 核心逻辑"
```

---

### Task 2: vCard 转义与折行边界用例 + Excel 回归

**Files:**
- Modify: `app.js`（无代码改动，本任务为测试补充；若暴露缺陷则修复）
- Test: `tests/vcf-export-edge.spec.mjs`（新建）

**Interfaces:**
- Consumes: Task 1 的 `openExportSheet()` / `exportVCard()`（通过 UI 驱动）。

- [ ] **Step 1: 写边界用例测试**

新建 `tests/vcf-export-edge.spec.mjs`：用 `addInitScript` 预置含特殊字符的本地数据（跳过锁屏），导出后校验转义、折行、缺省字段与 Excel 回归。

```js
import { chromium } from "/Users/ty/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/index.mjs";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = "/Users/ty/Desktop/Codex项目文件/高校通讯录";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end("not found"); return; }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
});

let failures = 0;
const check = (name, cond) => { console.log((cond ? "PASS" : "FAIL") + " - " + name); if (!cond) failures++; };

const seed = {
  departments: [
    { id: "d_root", name: "杭州职业技术大学", parentId: null },
    { id: "d_1", name: "校领导", parentId: "d_root", sortOrder: 0 },
  ],
  members: [
    { id: "m_1", name: "测,试;员\\甲", position: "主任,兼\n副处长", departmentId: "d_1", mobilePhone: "13800138000", officePhone: "56700001", avatarColor: "#fa8c16", sortOrder: 0 },
    { id: "m_2", name: "李 四", position: "这位同志的职务名称特别长，用于验证 vCard 折行逻辑是否真的会触发并且不会切断多字节字符", departmentId: "d_1", mobilePhone: "13900139000", officePhone: "", avatarColor: "#52c41a", sortOrder: 1 },
  ],
};

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
await context.addInitScript((s) => {
  localStorage.setItem("hzvtc_unlocked_v1", "1");
  localStorage.setItem("hzvtc_contacts_v2", JSON.stringify(s));
}, seed);
const page = await context.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await server.listen(8903, "127.0.0.1");
await page.goto("http://127.0.0.1:8903/index.html", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
await page.waitForSelector('[data-act="export"]', { timeout: 8000 });

await page.click('[data-act="export"]');
await page.click('.modal [data-act="export-vcf"]');
const [dl] = await Promise.all([page.waitForEvent("download"), page.click('.modal [data-act="ok"]')]);
const text = fs.readFileSync(await dl.path(), "utf8");

// 拆卡（先解折行，再做字段断言）
const unfolded = text.replace(/\r\n /g, "");
const cards = unfolded.split("BEGIN:VCARD").slice(1);
check("合成数据导出 2 条记录", cards.length === 2);
const c1 = cards[0];
check("FN 转义逗号", c1.includes("FN:测\\,试;员\\甲"));
check("N 转义分号与反斜杠", c1.includes("N:测\\,试\\;员\\\\甲;;;;"));
check("TITLE 转义并保留换行转义", c1.includes("TITLE:主任\\,兼\\n副处长"));
check("手机/办公电话均导出", c1.includes("TEL;TYPE=CELL:13800138000") && c1.includes("TEL;TYPE=WORK,VOICE:56700001"));
const c2 = cards[1];
check("无办公电话时不生成 WORK 行", !c2.includes("TEL;TYPE=WORK"));
check("长职务触发折行（原始文本含 \\r\\n 空格）", text.includes("\r\n "));
check("折行后解折文本一致", unfolded.includes("这位同志的职务名称特别长，用于验证 vCard 折行逻辑是否真的会触发并且不会切断多字节字符"));
check("所有物理行 ≤75 字节", text.split(/\r\n|\n/).every((line) => Buffer.byteLength(line, "utf8") <= 75));

// Excel 回归：导出图标 -> 导出 Excel 仍生成 xlsx
await page.click('[data-act="export"]');
const [dlX] = await Promise.all([page.waitForEvent("download"), page.click('.modal [data-act="export-excel"]')]);
check("Excel 导出文件名不变", dlX.suggestedFilename() === "通讯录_杭州职业技术大学.xlsx");

await browser.close();
server.close();
console.log(failures ? "RESULT: FAIL (" + failures + ")" : "RESULT: PASS");
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: 运行测试**

Run: `node tests/vcf-export-edge.spec.mjs`
Expected: 全部 PASS。若转义/折行断言失败，修正 Task 1 的 `vcfEscape`/`vcfFold` 后重跑。

- [ ] **Step 3: 同步并提交**

```bash
cp app.js dist/app.js
git add app.js dist/app.js tests/vcf-export-edge.spec.mjs
git commit -m "测试：vCard 转义折行边界与 Excel 导出回归"
```

---

### Task 3: 文档与部署

**Files:**
- Modify: `对话总结.md`、`dist/app.js`

- [ ] **Step 1: 更新对话总结.md**

在 `R21` 之后追加 `R22`：

```markdown
### R22 — 导出到手机通讯录（vCard，2026-08-27 维护）
- 需求：一键把通讯录导入手机系统通讯录；多次导入不重复新建已有联系人。
- 实现：根页“导出”图标改为底部菜单（导出 Excel / 导出到手机通讯录）；vcf 导出含 107 名成员的姓名、职务、单位+部门、手机号、办公电话，vCard 3.0 / UTF-8 / 规范折行，文件名 `杭州职业技术大学通讯录.vcf`。
- 防重复：依赖 iOS 导入提示（“更新现有联系人/新建联系人”，选“更新”）；导出前确认框已写明。
- 验证：Playwright 端到端（107 条记录、字段完整性、≤75 字节折行、特殊字符转义、Excel 导出回归）。
```

- [ ] **Step 2: 同步 dist 并提交推送**

```bash
cp app.js dist/app.js
git add app.js dist/app.js 对话总结.md docs/superpowers/plans/2026-08-27-phone-contacts-vcf-export.md
git commit -m "文档：R22 导出到手机通讯录记录 + 实现计划"
git push origin main
```

- [ ] **Step 3: 验证线上**

Run: `curl -sS https://sirty998.github.io/hzvtc-contacts/app.js | rg -n "exportVCard|openExportSheet"`
Expected: 两处均命中；GitHub Actions 部署成功（`curl -sS https://api.github.com/repos/SirTy998/hzvtc-contacts/actions/runs?per_page=1` 显示最新 run `completed success`）。
