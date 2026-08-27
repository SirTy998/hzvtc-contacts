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
await page.waitForSelector('.modal [data-act="export-vcf"]', { state: "detached", timeout: 5000 });
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
