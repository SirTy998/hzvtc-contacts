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
check("FN 转义逗号/分号/反斜杠", c1.includes("FN:测\\,试\\;员\\\\甲"));
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
