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
const page = await browser.newPage({ viewport: { width: 420, height: 900 }, hasTouch: true });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
// 模拟剪贴板：记录写入内容，避免无头环境权限问题
await page.addInitScript(() => {
  window.__copied = null;
  try {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (t) => { window.__copied = t; } },
    });
  } catch (e) {}
});
await server.listen(8907, "127.0.0.1");

await page.goto("http://127.0.0.1:8907/index.html", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
await page.waitForSelector("#lockScreen:not([hidden])", { timeout: 8000 });
await page.fill("#lockInput", "CastASpell");
await page.click("#lockBtn");
await page.waitForSelector("#lockScreen[hidden]", { state: "attached", timeout: 8000 });
await page.waitForTimeout(700);

// 根页 -> 校领导 -> 陈文岳 详情
await page.click('[data-act="open-dept"][data-id="d_1"]');
await page.waitForTimeout(700);
await page.click('[data-act="open-member"]');
await page.waitForTimeout(700);

const mobile = await page.locator('.info-value.link[data-tel]').first().textContent();
const box = await page.locator('.info-value.link[data-tel]').first().boundingBox();

// 长按工作手机号码
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.waitForTimeout(700); // 超过 500ms 长按阈值
await page.mouse.up();
await page.waitForTimeout(500);

check("长按后弹出号码菜单", await page.locator('.modal [data-act="copy-number"]').count() === 1);
check("菜单中显示被长按的号码", (await page.locator(".sheet-number").textContent()) === mobile.trim());
check("长按未触发拨打确认框", (await page.locator(".modal-title").count() === 0) || (await page.locator(".modal-title").first().textContent()) !== "拨打电话");

// 点复制
await page.click('.modal [data-act="copy-number"]');
await page.waitForTimeout(600);
check("复制按钮写入剪贴板", (await page.evaluate(() => window.__copied)) === mobile.trim());

// 回归：普通点按号码仍弹拨打确认
const box2 = await page.locator('.info-value.link[data-tel]').first().boundingBox();
await page.mouse.click(box2.x + box2.width / 2, box2.y + box2.height / 2);
await page.waitForTimeout(500);
check("普通点按仍弹拨打确认框", (await page.locator(".modal-title").first().textContent()) === "拨打电话");

await browser.close();
server.close();
console.log(failures ? "RESULT: FAIL (" + failures + ")" : "RESULT: PASS");
process.exit(failures ? 1 : 0);
