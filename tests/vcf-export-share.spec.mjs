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
    { id: "m_1", name: "张三", position: "主任", departmentId: "d_1", mobilePhone: "13800138000", officePhone: "56700001", avatarColor: "#fa8c16", sortOrder: 0 },
  ],
};

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
await context.addInitScript((s) => {
  localStorage.setItem("hzvtc_unlocked_v1", "1");
  localStorage.setItem("hzvtc_contacts_v2", JSON.stringify(s));
  // 模拟 iOS 15+ 支持文件分享：记录分享内容，避免真的打开系统面板
  Object.defineProperty(Navigator.prototype, "canShare", { configurable: true, value: () => true });
  Object.defineProperty(Navigator.prototype, "share", {
    configurable: true,
    value: async (data) => { window.__shared = { files: (data.files || []).map((f) => f.name), type: (data.files || [])[0] && (data.files)[0].type }; },
  });
}, seed);
const page = await context.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
const downloads = [];
page.on("download", (d) => downloads.push(d.suggestedFilename()));
await server.listen(8906, "127.0.0.1");
await page.goto("http://127.0.0.1:8906/index.html", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
await page.waitForSelector('[data-act="export"]', { timeout: 8000 });

await page.click('[data-act="export"]');
await page.click('.modal [data-act="export-vcf"]');
await page.click('.modal [data-act="ok"]');
await page.waitForTimeout(800);

const shared = await page.evaluate(() => window.__shared || null);
check("分享面板被调用", shared !== null);
check("分享的文件名为杭州职业技术大学通讯录.vcf", shared && shared.files.length === 1 && shared.files[0] === "杭州职业技术大学通讯录.vcf");
check("分享文件类型为 vCard", shared && shared.type === "text/vcard;charset=utf-8");
check("分享成功后未触发下载（文件交给系统面板）", downloads.length === 0);

await browser.close();
server.close();
console.log(failures ? "RESULT: FAIL (" + failures + ")" : "RESULT: PASS");
process.exit(failures ? 1 : 0);
