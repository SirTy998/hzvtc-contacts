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

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
await server.listen(8905, "127.0.0.1");

async function bootWith(seedValue) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript((v) => {
    localStorage.setItem("hzvtc_unlocked_v1", "1");
    localStorage.setItem("hzvtc_contacts_v2", v);
  }, seedValue);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:8905/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4500);
  const st = await page.evaluate(() => ({
    lockVisible: (() => { const ls = document.getElementById("lockScreen"); return ls ? !ls.hidden : false; })(),
    pages: document.querySelectorAll("#screen > .page").length,
    rootRows: document.querySelectorAll('[data-act="open-dept"]').length,
    errors: window.__errs || [],
  }));
  await context.close();
  return { st, errors };
}

const validOld = JSON.stringify({
  departments: [{ id: "d_root", name: "杭州职业技术大学", parentId: null }, { id: "d_1", name: "校领导", parentId: "d_root", sortOrder: 0 }],
  members: [{ id: "m_1", name: "测试", position: "职务", departmentId: "d_1", mobilePhone: "13800138000", officePhone: "", avatarColor: "#fa8c16", sortOrder: 0 }],
});

// 1) flag=1 + 空数据：不得白屏，应回锁屏并可解锁恢复
let r = await bootWith(JSON.stringify({ departments: [], members: [] }));
check("空数据：无崩溃", r.errors.length === 0);
check("空数据：显示锁屏而非白屏", r.st.lockVisible === true);

// 2) flag=1 + 损坏 JSON：同上
r = await bootWith('{"departments":[truncated');
check("损坏 JSON：无崩溃", r.errors.length === 0);
check("损坏 JSON：显示锁屏", r.st.lockVisible === true);

// 3) flag=1 + 缺根部门数据：同上
r = await bootWith(JSON.stringify({ departments: [{ id: "root_x", name: "旧结构", parentId: null }], members: [] }));
check("缺根部门：无崩溃", r.errors.length === 0);
check("缺根部门：显示锁屏", r.st.lockVisible === true);

// 4) flag=1 + 有效数据：正常免口令直接进入
r = await bootWith(validOld);
check("有效数据：无崩溃", r.errors.length === 0);
check("有效数据：直接进入（无锁屏）", r.st.lockVisible === false && r.st.pages === 1 && r.st.rootRows === 1);

// 5) 锁屏输入正确口令后，应用恢复正常（空数据场景）
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.addInitScript((v) => {
  localStorage.setItem("hzvtc_unlocked_v1", "1");
  localStorage.setItem("hzvtc_contacts_v2", v);
}, JSON.stringify({ departments: [], members: [] }));
const page = await context.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto("http://127.0.0.1:8905/index.html", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4500);
await page.fill("#lockInput", "CastASpell");
await page.click("#lockBtn");
await page.waitForTimeout(2500);
const recovered = await page.evaluate(() => ({
  lockHidden: document.getElementById("lockScreen")?.hidden ?? null,
  pages: document.querySelectorAll("#screen > .page").length,
  rootRows: document.querySelectorAll('[data-act="open-dept"]').length,
}));
check("解锁后应用恢复（42 部门）", recovered.lockHidden === true && recovered.pages === 1 && recovered.rootRows === 42);
await context.close();

await browser.close();
server.close();
console.log(failures ? "RESULT: FAIL (" + failures + ")" : "RESULT: PASS");
process.exit(failures ? 1 : 0);
