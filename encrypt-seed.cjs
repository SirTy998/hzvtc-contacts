/* 种子数据加密脚本
   用法：node encrypt-seed.cjs [口令]
   读取 seed-data.private.js（明文，已被 git 忽略），
   用口令经 PBKDF2-SHA256(100000) 派生 AES-256-GCM 密钥加密，
   输出 window.SEED_DATA_ENCRYPTED 到 seed-data.js 与 dist/seed-data.js。
   浏览器端在解锁时用同一口令解密（口令即钥匙，口令本身不写入代码）。 */
const fs = require("fs");
const crypto = require("crypto");

const pass = process.argv[2] || "CastASpell";
const ITER = 100000;
const src = fs.readFileSync("seed-data.private.js", "utf8");
const eq = src.indexOf("=");
if (eq < 0) throw new Error("seed-data.private.js 格式异常");
const json = src.slice(eq + 1).trim().replace(/;\s*$/, "");
const obj = JSON.parse(json);

const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pass, salt, ITER, 32, "sha256");
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const enc = Buffer.concat([cipher.update(JSON.stringify(obj), "utf8"), cipher.final()]);
const tag = cipher.getAuthTag();
const data = Buffer.concat([enc, tag]).toString("base64");

const out =
  "window.SEED_DATA_ENCRYPTED = {v:1, iter:" + ITER +
  ', salt:"' + salt.toString("base64") +
  '", iv:"' + iv.toString("base64") +
  '", data:"' + data + '"};\n';

fs.writeFileSync("seed-data.js", out);
fs.writeFileSync("dist/seed-data.js", out);
console.log("encrypted seed written:", data.length, "base64 chars");
