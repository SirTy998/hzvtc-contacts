/* ============================================================
   高校通讯录 · 杭州职业技术大学
   移动端优先 · 部门/成员三级导航 · Excel 导入导出 · localStorage
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 图标 ---------------- */
  const ICON = {
    back:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    share:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/></svg>',
    personPlus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M18 7v6M15 10h6"/></svg>',
    dept:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="6" rx="1"/><rect x="3" y="14" width="8" height="6" rx="1"/><rect x="14" y="9" width="7" height="6" rx="1"/><path d="M11 7h3v2M11 17h3v-4"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    more:   '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
    phone:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg>',
    message:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/></svg>',
    chevron:'<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    file:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v5h5"/><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8Z"/><path d="M9 13h6M9 16h6"/></svg>',
    grip:   '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>',
    sort:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20V4M8 4l-3 3M8 4l3 3"/><path d="M16 4v16M16 20l-3-3M16 20l3-3"/></svg>',
    list:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1.4" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.4" fill="currentColor" stroke="none"/></svg>',
    contact:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.6 19.3c1.4-5.1 4.5-7.3 7.4-7.3s6 2.2 7.4 7.3a1 1 0 0 1-1 1.3H5.6a1 1 0 0 1-1-1.3Z"/><circle cx="12" cy="8.2" r="4.2"/></svg>',
  };

  const PALETTE = ["#fa8c16","#52c41a","#1677ff","#722ed1","#13c2c2","#eb2f96","#fa541c","#2f54eb","#eb5757","#27ae60"];

  /* ---------------- 状态 ---------------- */
  const STORAGE_KEY = "hzvtc_contacts_v2";
  const UNLOCK_KEY = "hzvtc_unlocked_v1";
  let departments = [];
  let members = [];
  const ROOT_ID = "d_root";

  /* ---------------- 口令门禁 ---------------- */
  // 解锁状态记在 localStorage：同一设备解锁一次后，后续打开（含 PWA 桌面图标）不再要求口令；
  // 仅当本机通讯录数据不可用（清除/损坏/缺根部门）时才会重新要求口令，解锁后自动重写有效数据。
  function isUnlocked() {
    try {
      if (localStorage.getItem(UNLOCK_KEY) !== "1") return false;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      return Array.isArray(d.departments) && d.departments.some((x) => x.id === ROOT_ID);
    } catch (e) { return false; }
  }
  function setUnlocked() {
    try { localStorage.setItem(UNLOCK_KEY, "1"); } catch (e) { /* 存储不可用时每次进入都要口令 */ }
  }

  /* ---------------- 触觉反馈（Android 支持；iOS Safari 无此 API，自动忽略） ---------------- */
  function haptic(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms || 12); } catch (e) {} }
  }

  /* ---------------- 存储 ---------------- */
  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        departments = d.departments || [];
        members = d.members || [];
        // 仅接受含根部门的有效数据，否则走锁屏重解密，避免白屏崩溃
        if (departments.length && departments.some((x) => x.id === ROOT_ID)) return;
      } catch (e) { /* 损坏则重置 */ }
    }
    // 无本地数据时：
    // 1) 明文 SEED_DATA（本地开发 / 兼容旧版）→ 直接载入；
    // 2) 加密种子 SEED_DATA_ENCRYPTED → 暂不载入，等解锁后用口令解密；
    // 3) 都没有（异常兜底）→ 使用内置示例数据。
    if (typeof SEED_DATA !== "undefined" && SEED_DATA && SEED_DATA.departments && SEED_DATA.departments.length) {
      departments = JSON.parse(JSON.stringify(SEED_DATA.departments));
      members = JSON.parse(JSON.stringify(SEED_DATA.members));
    } else if (typeof SEED_DATA_ENCRYPTED === "undefined" || !SEED_DATA_ENCRYPTED) {
      seedData();
    }
  }
  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ departments, members }));
  }

  /* 用口令解密种子数据（口令即钥匙：解密成功 = 口令正确，口令本身不写入代码） */
  function b64ToBuf(b64) {
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }
  async function decryptSeed(passcode) {
    const enc = window.SEED_DATA_ENCRYPTED;
    if (!enc || !enc.data) return false;
    try {
      const keyMaterial = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(passcode), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: b64ToBuf(enc.salt), iterations: enc.iter || 100000, hash: "SHA-256" },
        keyMaterial, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      const plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: b64ToBuf(enc.iv) }, key, b64ToBuf(enc.data));
      const obj = JSON.parse(new TextDecoder().decode(plain));
      if (!obj || !Array.isArray(obj.departments) || !obj.departments.length) return false;
      departments = obj.departments;
      members = obj.members || [];
      saveData();
      return true;
    } catch (e) {
      return false;   // 口令错误或数据损坏（AES-GCM 校验失败）
    }
  }

  function uid(p) { return p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function pickColor(i) { return PALETTE[i % PALETTE.length]; }

  function seedData() {
    departments = [
      { id: "d_root",  name: "高校-杭州职业技术大学", parentId: null },
      { id: "d_off",   name: "办公室（机关党委、发展研究中心）", parentId: "d_root" },
      { id: "d_jwc",   name: "教务处", parentId: "d_root" },
      { id: "d_xsc",   name: "学生工作处", parentId: "d_root" },
      { id: "d_cwc",   name: "财务处", parentId: "d_root" },
      { id: "d_rsc",   name: "人事处", parentId: "d_root" },
      { id: "d_hq",    name: "后勤保障处", parentId: "d_root" },
      { id: "d_jd",    name: "机电工程学院", parentId: "d_root" },
      { id: "d_xx",    name: "信息工程学院", parentId: "d_root" },
      { id: "d_sm",    name: "商贸旅游学院", parentId: "d_root" },
      { id: "d_ys",    name: "艺术设计学院", parentId: "d_root" },
      { id: "d_off_zh",name: "综合科", parentId: "d_off" },
      { id: "d_xx_rj", name: "软件技术教研室", parentId: "d_xx" },
      { id: "d_xx_wl", name: "网络技术教研室", parentId: "d_xx" },
    ];
    const mk = (name, pos, dept, mobile, office, email) => ({
      id: uid("m"), name, position: pos, departmentId: dept,
      mobilePhone: mobile, officePhone: office, email,
      avatarColor: pickColor(members.length),
    });
    members = [
      mk("张伟", "办公室主任、发展研究中心主任", "d_off", "13738151907", "56700002", "zhangwei@hzvtc.edu.cn"),
      mk("李娜", "办公室副主任", "d_off", "13738152011", "56700003", "lina@hzvtc.edu.cn"),
      mk("王芳", "综合科科长", "d_off_zh", "13738153022", "56700010", "wangfang@hzvtc.edu.cn"),
      mk("陈强", "教务处处长", "d_jwc", "13738154033", "56700101", "chenqiang@hzvtc.edu.cn"),
      mk("刘洋", "教务处副处长", "d_jwc", "13738155044", "56700102", "liuyang@hzvtc.edu.cn"),
      mk("赵敏", "学籍管理科科员", "d_jwc", "13738156055", "56700105", "zhaomin@hzvtc.edu.cn"),
      mk("孙磊", "学生工作处处长", "d_xsc", "13738157066", "56700201", "sunlei@hzvtc.edu.cn"),
      mk("周婷", "资助管理中心主任", "d_xsc", "13738158077", "56700203", "zhouting@hzvtc.edu.cn"),
      mk("吴军", "财务处处长", "d_cwc", "13738159088", "56700301", "wujun@hzvtc.edu.cn"),
      mk("郑爽", "会计核算科科员", "d_cwc", "13738151099", "56700305", "zhengshuang@hzvtc.edu.cn"),
      mk("冯涛", "人事处处长", "d_rsc", "13738152011", "56700401", "fengtao@hzvtc.edu.cn"),
      mk("何静", "师资科科长", "d_rsc", "13738153022", "56700402", "hejing@hzvtc.edu.cn"),
      mk("许磊", "后勤保障处处长", "d_hq", "13738154033", "56700501", "xulei@hzvtc.edu.cn"),
      mk("邓超", "机电工程学院院长", "d_jd", "13738155044", "56700601", "dengchao@hzvtc.edu.cn"),
      mk("韩雪", "机电工程学院副院长", "d_jd", "13738156055", "56700602", "hanxue@hzvtc.edu.cn"),
      mk("曹颖", "信息工程学院院长", "d_xx", "13738157066", "56700701", "caoying@hzvtc.edu.cn"),
      mk("彭飞", "软件技术教研室主任", "d_xx_rj", "13738158077", "56700710", "pengfei@hzvtc.edu.cn"),
      mk("袁泉", "网络技术教研室主任", "d_xx_wl", "13738159088", "56700711", "yuanquan@hzvtc.edu.cn"),
      mk("蒋琳", "商贸旅游学院院长", "d_sm", "13738151099", "56700801", "jianglin@hzvtc.edu.cn"),
      mk("沈浩", "艺术设计学院院长", "d_ys", "13738152011", "56700901", "shenhao@hzvtc.edu.cn"),
    ];
    normalizeOrders();
    saveData();
  }

  /* ---------------- 查询辅助 ---------------- */
  const getDept = (id) => departments.find((d) => d.id === id);
  const byOrder = (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0);
  const childDepts = (id) => departments.filter((d) => d.parentId === id).sort(byOrder);
  const deptMembers = (id) => members.filter((m) => m.departmentId === id).sort(byOrder);
  // 取某分组内下一个排序值（新建条目时使用）
  const nextOrder = (arr, pred) => {
    const s = arr.filter(pred);
    return s.length ? Math.max.apply(null, s.map((x) => x.sortOrder || 0)) + 1 : 0;
  };
  // 为种子数据补齐 sortOrder（保证同组内有序）
  function normalizeOrders() {
    const gd = {};
    departments.forEach((d) => { (gd[d.parentId] = gd[d.parentId] || []).push(d); });
    Object.keys(gd).forEach((k) => gd[k].forEach((d, i) => (d.sortOrder = i)));
    const gm = {};
    members.forEach((m) => { (gm[m.departmentId] = gm[m.departmentId] || []).push(m); });
    Object.keys(gm).forEach((k) => gm[k].forEach((m, i) => (m.sortOrder = i)));
  }
  function ancestorChain(id) {
    const chain = [];
    let cur = getDept(id);
    while (cur) { chain.unshift(cur); cur = cur.parentId ? getDept(cur.parentId) : null; }
    return chain;
  }
  /* 头像完整显示姓名：按长度动态缩小字号 */
  function avatarText(name) { return name ? name.trim() : "?"; }
  function avatarLen(name) { return avatarText(name).length; }
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- 搜索历史 ---------------- */
  const HISTORY_KEY = "hzvtc_search_history_v1";
  const MAX_HISTORY = 12;
  function getSearchHistory() {
    try { const arr = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); return Array.isArray(arr) ? arr : []; } catch (e) { return []; }
  }
  function addSearchHistory(kw) {
    if (!kw) return;
    const list = getSearchHistory().filter((x) => x !== kw);
    list.unshift(kw);
    if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  }
  function clearSearchHistory() { localStorage.removeItem(HISTORY_KEY); }

  /* ---------------- 高亮匹配文字 ---------------- */
  function highlightText(text, kw) {
    if (!kw) return esc(text);
    const t = String(text == null ? "" : text);
    const lowerT = t.toLowerCase();
    const lowerK = String(kw).toLowerCase();
    const out = [];
    let i = 0;
    while (i < t.length) {
      const idx = lowerT.indexOf(lowerK, i);
      if (idx === -1) { out.push(esc(t.slice(i))); break; }
      if (idx > i) out.push(esc(t.slice(i, idx)));
      out.push(`<mark class="match">${esc(t.slice(idx, idx + lowerK.length))}</mark>`);
      i = idx + lowerK.length;
    }
    return out.join("");
  }

  /* ---------------- 页面栈 / 滑动动画 ---------------- */
  const screenEl = document.getElementById("screen");
  let stack = [];

  function pushPage(el, animate = true) {
    const prev = stack[stack.length - 1];
    stack.push(el);
    screenEl.appendChild(el);
    if (!animate) { el.classList.remove("enter"); el.classList.add("active"); return; }
    void el.offsetWidth;
    el.classList.remove("enter");
    el.classList.add("active");
    if (prev) { prev.classList.remove("active"); prev.classList.add("prev"); }
  }
  function popPage() {
    if (stack.length <= 1) return;
    const cur = stack.pop();
    const prev = stack[stack.length - 1];
    cur.classList.remove("active");
    cur.classList.add("leaving");
    if (prev) { prev.classList.remove("prev"); prev.classList.add("active"); }
    setTimeout(() => { if (cur.parentNode) cur.parentNode.removeChild(cur); }, 470);
  }
  function refreshCurrent() {
    const top = stack[stack.length - 1];
    if (top && top._refresh) top._refresh();
  }

  /* ---------------- 双击空白区域返回上一级 ---------------- */
  // 在页面非交互（空白）区域检测"快速双击"，执行 popPage() 返回上一级。
  // 通过位移/时长阈值区分点按与滚动、拖拽、长按；多指触控与搜索聚焦时禁用，误触率低。
  function initDoubleTapBack() {
    let downX = 0, downY = 0, downT = 0;
    let lastTap = null;
    const activePointers = new Set();
    let multiTouch = false;
    const MOVE_TOL = 12;   // 位移阈值(px)：超过即视为滚动/拖拽
    const MAX_DUR  = 250;  // 单次点按时长上限(ms)：超过即视为长按
    const DBL_T    = 320;  // 两次点按最大间隔(ms)
    const DBL_DIST = 34;   // 两次点按最大间距(px)：限定为"同一片空白区域"

    // 落点是否为空白区域（非交互元素）
    const isBlank = (target) =>
      !target.closest("[data-act], button, a, input, textarea, select, label, .modal-mask, .modal, .drag-handle");

    screenEl.addEventListener("pointerdown", (e) => {
      activePointers.add(e.pointerId);
      if (activePointers.size > 1) multiTouch = true;
      downX = e.clientX; downY = e.clientY; downT = Date.now();
    }, true);

    screenEl.addEventListener("pointerup", (e) => {
      // 多点触控期间及其收尾阶段一律作废，避免双指误触发
      if (multiTouch) {
        activePointers.delete(e.pointerId);
        if (activePointers.size === 0) multiTouch = false;
        lastTap = null;
        return;
      }
      const nPointers = activePointers.size;
      activePointers.delete(e.pointerId);
      if (nPointers !== 1 || e.button !== 0) { lastTap = null; return; }

      // 位移过大或时长过长 -> 不是一次干净的点按
      const dx = e.clientX - downX, dy = e.clientY - downY;
      if (Math.hypot(dx, dy) > MOVE_TOL || (Date.now() - downT) > MAX_DUR) { lastTap = null; return; }
      // 落点在交互元素上 -> 交给各自的点击逻辑，不触发返回
      if (!isBlank(e.target)) { lastTap = null; return; }

      const now = Date.now();
      // 搜索框聚焦时不返回，避免输入过程中误触
      const ae = document.activeElement;
      if (ae && ae.id === "searchInput") { lastTap = { time: now, x: e.clientX, y: e.clientY }; return; }

      if (lastTap && (now - lastTap.time) <= DBL_T &&
          Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) <= DBL_DIST) {
        lastTap = null;
        lastDblTapPop = Date.now();    // 抑制本次手势派生的残余 click（见 isDblTapSyntheticClick）
        popPage();                       // 已在根页面时 popPage 内部自动忽略
      } else {
        lastTap = { time: now, x: e.clientX, y: e.clientY };
      }
    }, true);

    screenEl.addEventListener("pointercancel", (e) => {
      activePointers.delete(e.pointerId);
      if (activePointers.size === 0) multiTouch = false;
      lastTap = null;
    }, true);
  }

  /* ---------------- 通用页头片段 ---------------- */
  function topbarSearch(opts) {
    // opts: { back:bool, rightHTML:string }
    const backBtn = opts.back
      ? `<button class="icon-btn" data-act="back">${ICON.back}</button>`
      : `<span style="width:40px;flex:0 0 auto"></span>`;
    const right = opts.rightHTML || "";
    return `<div class="topbar">
      ${backBtn}
      <label class="search-box" id="searchBox">
        ${ICON.search}
        <input type="search" id="searchInput" placeholder="搜索姓名 / 部门 / 职务 / 电话" enterkeyhint="search" autocomplete="off" />
        <button class="search-clear" id="searchClear" type="button" aria-label="清除">×</button>
      </label>
      ${right}
    </div>
    <div class="search-history" id="searchHistory"></div>`;
  }

  function renderSearchHistory(ctx, el) {
    const histEl = el.querySelector("#searchHistory");
    if (!histEl) return;
    const list = getSearchHistory();
    if (!ctx.searchFocused || ctx.keyword || !list.length) { histEl.innerHTML = ""; histEl.classList.remove("show"); return; }
    histEl.innerHTML = `
      <div class="history-hd">
        <span>历史搜索</span>
        <button class="history-clear" data-act="clear-history" type="button">清空</button>
      </div>
      <div class="history-tags">
        ${list.map((k) => `<span class="history-tag" data-act="history-item" data-kw="${esc(k)}">${esc(k)}</span>`).join("")}
      </div>`;
    histEl.classList.add("show");
  }

  function bindSearch(ctx, el) {
    const box = el.querySelector("#searchBox");
    const input = el.querySelector("#searchInput");
    const clear = el.querySelector("#searchClear");
    const histEl = el.querySelector("#searchHistory");
    if (!input) return;
    let jumpTimer = null;
    function updateClear() { if (clear) clear.style.display = input.value ? "flex" : "none"; }
    // 部门页全局搜索：若仅匹配到唯一员工，自动跳转其详情页
    function tryJumpToUnique() {
      if (ctx.type !== "deptList" || !ctx.keyword) return;
      const matched = members.filter((m) => matchesMember(m, ctx.keyword));
      if (matched.length === 1) {
        addSearchHistory(ctx.keyword);
        openMemberDetail(matched[0].id);
      }
    }
    input.addEventListener("focus", () => {
      box.classList.add("focus");
      ctx.searchFocused = true;
      renderSearchHistory(ctx, el);
      if (ctx.renderList) ctx.renderList();
    });
    input.addEventListener("blur", () => {
      box.classList.remove("focus");
      // 延迟隐藏，避免点击历史标签时先触发 blur 导致点不到
      setTimeout(() => {
        ctx.searchFocused = false;
        renderSearchHistory(ctx, el);
        if (ctx.renderList) ctx.renderList();
      }, 150);
    });
    input.addEventListener("input", () => {
      ctx.keyword = input.value.trim();
      updateClear();
      renderSearchHistory(ctx, el);
      if (ctx.renderList) ctx.renderList();
      if (jumpTimer) clearTimeout(jumpTimer);
      jumpTimer = setTimeout(tryJumpToUnique, 700);
    });
    input.addEventListener("search", tryJumpToUnique);
    if (clear) clear.addEventListener("click", () => { input.value = ""; ctx.keyword = ""; updateClear(); input.focus(); ctx.renderList(); });
    // 阻止历史标签被 blur 抢先隐藏
    if (histEl) {
      histEl.addEventListener("pointerdown", (e) => { if (e.target.closest("[data-act='history-item'], [data-act='clear-history']")) e.preventDefault(); });
    }
  }

  /* ---------------- 搜索匹配 ---------------- */
  function matchesMember(m, kw) {
    if (!kw) return true;
    const k = kw.toLowerCase();
    const dept = getDept(m.departmentId);
    return (
      m.name.toLowerCase().includes(k) ||
      (dept && dept.name.toLowerCase().includes(k)) ||
      (m.position || "").toLowerCase().includes(k) ||
      (m.mobilePhone || "").includes(k) ||
      (m.officePhone || "").includes(k)
    );
  }
  function deptMatches(d, kw) {
    if (!kw) return true;
    if (d.name.toLowerCase().includes(kw.toLowerCase())) return true;
    if (members.some((m) => m.departmentId === d.id && matchesMember(m, kw))) return true;
    return childDepts(d.id).some((c) => deptMatches(c, kw));
  }

  /* ---------------- 页面 1：部门列表（根） ---------------- */
  function openDeptList() {
    const el = document.createElement("div");
    el.className = "page enter";
    const ctx = { type: "deptList", deptId: ROOT_ID, keyword: "", sortingMode: false };

    el.innerHTML = `
      <div class="appbar">
        ${topbarSearch({ back: false, rightHTML: `<button class="icon-btn" data-act="export" title="导出">${ICON.share}</button>` })}
      </div>
      <div class="page-content">
        <div class="title-row">
          <span class="page-title">${esc(getDept(ROOT_ID).name)}</span>
        </div>
        <div class="action-row">
          <button class="func-btn" data-act="add-person">${ICON.personPlus}添加人员</button>
          <button class="func-btn" data-act="toggle-sort" id="btnSort"><span class="btn-ico">${ICON.sort}</span><span class="btn-label">调整顺序</span></button>
          <button class="func-btn" data-act="import">${ICON.file}导入Excel</button>
        </div>
        <div class="list" id="list"></div>
      </div>`;

    function syncSortBtn() {
      const b = el.querySelector("#btnSort");
      if (!b) return;
      b.classList.toggle("active", ctx.sortingMode);
      b.querySelector(".btn-label").textContent = ctx.sortingMode ? "完成" : "调整顺序";
    }

    ctx.renderList = function () {
      const kwRaw = ctx.keyword;
      const kw = kwRaw.toLowerCase();
      const sorting = ctx.sortingMode && !kw && !ctx.searchFocused;
      const list = el.querySelector("#list");
      // 搜索框聚焦且未输入：隐藏列表，历史记录由 renderSearchHistory 控制
      if (ctx.searchFocused && !kwRaw) { list.innerHTML = ""; return; }

      if (kw) {
        // 全局搜索员工（覆盖全平台人员数据），优先定位到个人详情
        const matched = members
          .filter((m) => matchesMember(m, kw))
          .sort((a, b) => {
            const da = getDept(a.departmentId), db = getDept(b.departmentId);
            return (da ? da.sortOrder : 0) - (db ? db.sortOrder : 0) || a.sortOrder - b.sortOrder;
          });
        let html = "";
        if (matched.length) {
          html += `<div class="section-label">员工（${matched.length}）</div>`;
          html += `<div class="card">` + matched.map((m) => {
              const color = m.avatarColor || pickColor(members.indexOf(m));
              const dept = getDept(m.departmentId);
              return `<div class="row" data-type="member" data-act="open-member" data-id="${m.id}">
                <span class="avatar" style="background:${color}" data-len="${avatarLen(m.name)}">${esc(avatarText(m.name))}</span>
                <span class="member-main">
                  <span class="member-name">${highlightText(m.name, kwRaw)}</span>
                  <span class="member-pos">${esc(dept ? dept.name : "—")}${m.position ? " · " + highlightText(m.position, kwRaw) : ""}</span>
                </span>
                <span class="member-actions">
                  ${m.mobilePhone ? `<span class="row-icon call" data-act="call" data-tel="${esc(m.mobilePhone)}" title="拨打">${ICON.phone}</span>` : ""}
                </span>
              </div>`;
            }).join("") + `</div>`;
        } else {
          // 无员工匹配时，回退到部门名匹配
          const kids = childDepts(ctx.deptId).filter((d) => deptMatches(d, kw));
          if (kids.length) {
            html += `<div class="section-label">部门</div>`;
            html += `<div class="card">` + kids.map((d) => {
                const count = deptMembers(d.id).length;
                return `<div class="row" data-type="dept" data-act="open-dept" data-id="${d.id}">
                  <span class="dept-name">${highlightText(d.name, kwRaw)}</span>
                  <span class="dept-meta">${count}人 ${ICON.chevron}</span>
                </div>`;
              }).join("") + `</div>`;
          }
        }
        list.innerHTML = html || `<div class="empty">没有匹配的结果</div>`;
        return;
      }

      // 无关键词：正常部门列表
      const kids = childDepts(ctx.deptId);
      if (!kids.length) { list.innerHTML = `<div class="empty">没有匹配的部门</div>`; return; }
      list.innerHTML = `<div class="section-label">部门（${kids.length}）</div>` +
        `<div class="card" id="group-root-depts">` + kids.map((d) => {
          const count = deptMembers(d.id).length;
          return `<div class="row" data-type="dept" data-act="open-dept" data-id="${d.id}">
            ${sorting ? `<span class="drag-handle" title="拖拽排序">${ICON.grip}</span>` : ""}
            <span class="dept-name">${esc(d.name)}</span>
            <span class="dept-meta">${count}人 ${ICON.chevron}</span>
          </div>`;
        }).join("") + `</div>`;
      if (sorting) enableSortable(list.querySelector("#group-root-depts"), '.row[data-type="dept"]', (ids) => reorderDept(ctx.deptId, ids));
    };
    ctx.renderList();
    bindSearch(ctx, el);

    el.addEventListener("click", (e) => {
      if (e.target.closest(".drag-handle")) return;
      const t = e.target.closest("[data-act]");
      if (!t) return;
      const act = t.dataset.act;
      if (isDblTapSyntheticClick()) return;   // 双击返回后的残余 click，不触发任何操作
      if (isDragSyntheticClick(act)) return;   // 拖拽刚结束的合成点击，不触发导航
      if (act === "call") { confirmCall(t.dataset.tel); return; }
      if (act === "back") popPage();
      else if (act === "add-person") openPersonForm(null, null);
      else if (act === "toggle-sort") { ctx.sortingMode = !ctx.sortingMode; ctx.renderList(); syncSortBtn(); }
      else if (act === "import") triggerImport();
      else if (act === "export") openExportSheet();
      else if (act === "history-item") { ctx.keyword = t.dataset.kw; el.querySelector("#searchInput").value = t.dataset.kw; ctx.renderList(); renderSearchHistory(ctx, el); }
      else if (act === "clear-history") { clearSearchHistory(); renderSearchHistory(ctx, el); }
      else if (act === "open-dept") { if (ctx.keyword) addSearchHistory(ctx.keyword); openMemberList(t.dataset.id); }
      else if (act === "open-member") { if (ctx.keyword) addSearchHistory(ctx.keyword); openMemberDetail(t.dataset.id); }
    });

    el._refresh = ctx.renderList;
    pushPage(el, stack.length === 0 ? false : true);
  }

  /* ---------------- 页面 2：成员列表 ---------------- */
  function openMemberList(deptId) {
    const el = document.createElement("div");
    el.className = "page enter";
    const dept = getDept(deptId);
    const chain = ancestorChain(deptId);
    const ctx = { type: "memberList", deptId, keyword: "", sortingMode: false };
    function syncSortBtn() {
      const b = el.querySelector("#btnSort");
      if (!b) return;
      b.classList.toggle("active", ctx.sortingMode);
      b.querySelector(".btn-label").textContent = ctx.sortingMode ? "完成" : "调整顺序";
    }

    const crumbs = chain.map((c, i) =>
      `<span class="crumb" data-act="crumb" data-id="${c.id}">${esc(c.name)}</span>` +
      (i < chain.length - 1 ? `<span class="sep">›</span>` : "")
    ).join("");

    el.innerHTML = `
      <div class="appbar">
        ${topbarSearch({ back: true })}
      </div>
      <div class="page-content">
        <div class="title-row"><span class="page-title">${esc(dept.name)}</span></div>
        <div class="breadcrumb">${crumbs}</div>
        <div class="action-row">
          <button class="func-btn" data-act="add-person">${ICON.personPlus}添加人员</button>
          <button class="func-btn" data-act="toggle-sort" id="btnSort"><span class="btn-ico">${ICON.sort}</span><span class="btn-label">调整顺序</span></button>
          <button class="func-btn" data-act="edit-dept">${ICON.pencil}编辑部门</button>
        </div>
        <div class="list" id="list"></div>
      </div>`;

    ctx.renderList = function () {
      const kw = ctx.keyword.toLowerCase();
      const sorting = ctx.sortingMode && !kw && !ctx.searchFocused;
      const grip = sorting ? `<span class="drag-handle" title="拖拽排序">${ICON.grip}</span>` : "";
      const list = el.querySelector("#list");
      if (ctx.searchFocused && !kw) { list.innerHTML = ""; return; }
      const kids = childDepts(deptId).filter((d) => deptMatches(d, kw));
      const mems = deptMembers(deptId).filter((m) => matchesMember(m, kw));
      let html = "";

      if (kids.length) {
        html += `<div class="section-label">子部门</div>`;
        html += `<div class="card sort-group" id="group-depts">`;
        html += kids.map((d) => {
          const count = deptMembers(d.id).length;
          return `<div class="row" data-type="dept" data-act="open-dept" data-id="${d.id}">
            ${grip}
            <span class="dept-name">${highlightText(d.name, ctx.keyword)}</span>
            <span class="dept-meta">${count}人 ${ICON.chevron}</span>
          </div>`;
        }).join("");
        html += `</div>`;
      }
      if (mems.length) {
        html += `<div class="section-label">成员（${mems.length}）</div>`;
        html += `<div class="card sort-group" id="group-members">`;
        html += mems.map((m) => {
          const color = m.avatarColor || pickColor(members.indexOf(m));
          const label = esc(avatarText(m.name));
          const pos = highlightText(m.position || "—", ctx.keyword);
          return `<div class="row" data-type="member" data-act="open-member" data-id="${m.id}">
            ${grip}
            <span class="avatar" style="background:${color}" data-len="${avatarLen(m.name)}">${label}</span>
            <span class="member-main">
              <span class="member-name">${highlightText(m.name, ctx.keyword)}</span>
              <span class="member-pos">${pos}</span>
            </span>
            <span class="member-actions">
              ${m.mobilePhone ? `<span class="row-icon call" data-act="call" data-tel="${esc(m.mobilePhone)}" title="拨打">${ICON.phone}</span>` : ""}
            </span>
          </div>`;
        }).join("");
        html += `</div>`;
      }
      list.innerHTML = html || `<div class="empty">没有匹配的结果</div>`;
      if (sorting) {
        enableSortable(list.querySelector("#group-depts"), '.row[data-type="dept"]', (ids) => reorderDept(deptId, ids));
        enableSortable(list.querySelector("#group-members"), '.row[data-type="member"]', (ids) => reorderMembers(deptId, ids));
      }
    };
    ctx.renderList();
    bindSearch(ctx, el);

    el.addEventListener("click", (e) => {
      if (e.target.closest(".drag-handle")) return;
      const t = e.target.closest("[data-act]");
      if (!t) return;
      const act = t.dataset.act;
      if (isDblTapSyntheticClick()) return;   // 双击返回后的残余 click，不触发任何操作
      if (isDragSyntheticClick(act)) return;   // 拖拽刚结束的合成点击，不触发导航
      if (act === "call") { confirmCall(t.dataset.tel); return; }
      if (act === "back") popPage();
      else if (act === "add-person") openPersonForm(null, deptId);
      else if (act === "toggle-sort") { ctx.sortingMode = !ctx.sortingMode; ctx.renderList(); syncSortBtn(); }
      else if (act === "edit-dept") openDeptForm(dept, dept.parentId);
      else if (act === "history-item") { ctx.keyword = t.dataset.kw; el.querySelector("#searchInput").value = t.dataset.kw; ctx.renderList(); renderSearchHistory(ctx, el); }
      else if (act === "clear-history") { clearSearchHistory(); renderSearchHistory(ctx, el); }
      else if (act === "open-dept") { if (ctx.keyword) addSearchHistory(ctx.keyword); openMemberList(t.dataset.id); }
      else if (act === "open-member") { if (ctx.keyword) addSearchHistory(ctx.keyword); openMemberDetail(t.dataset.id); }
      else if (act === "crumb") { while (stack.length > 1) popPage(); if (t.dataset.id !== ROOT_ID) openMemberListSafe(t.dataset.id); }
    });

    el._refresh = ctx.renderList;
    pushPage(el);
  }
  // 面包屑跳转：回到根后按需进入目标部门
  function openMemberListSafe(deptId) {
    // 关闭到只剩根页
    while (stack.length > 1) popPage();
    setTimeout(() => openMemberList(deptId), 360);
  }

  /* ---------------- 页面 3：成员详情 ---------------- */
  function openMemberDetail(memberId) {
    const el = document.createElement("div");
    el.className = "page enter";
    const m = members.find((x) => x.id === memberId);
    if (!m) { popPage(); return; }
    const dept = getDept(m.departmentId);
    const color = m.avatarColor || pickColor(members.indexOf(m));
    const schoolName = getDept(ROOT_ID).name;

    el.innerHTML = `
      <div class="appbar">
        <div class="topbar">
          <button class="icon-btn" data-act="back">${ICON.back}</button>
          <span style="flex:1"></span>
          <button class="icon-btn" data-act="edit" title="编辑">${ICON.pencil}</button>
          <button class="icon-btn" data-act="more" title="更多">${ICON.more}</button>
        </div>
      </div>
      <div class="page-content">
        <div class="detail-hero">
          <span class="avatar lg" style="background:${color}" data-len="${avatarLen(m.name)}">${esc(avatarText(m.name))}</span>
          <div class="detail-name">${esc(m.name)}</div>
        </div>
        <div class="info-block">
          <div class="info-unit">所属单位：${esc(schoolName)}</div>
          <div class="info-row">
            <span class="info-label">工作手机</span>
            <span class="info-value ${m.mobilePhone ? "link" : ""}" ${m.mobilePhone ? `data-act="call" data-tel="${esc(m.mobilePhone)}"` : ""}>${esc(m.mobilePhone || "—")}</span>
            <span class="info-actions">
              ${m.mobilePhone ? `<span class="row-icon call" data-act="call" data-tel="${esc(m.mobilePhone)}" title="拨打">${ICON.phone}</span>` : ""}
            </span>
          </div>
          <div class="info-row" data-act="open-dept" data-id="${m.departmentId}">
            <span class="info-label">部门</span>
            <span class="info-value">${esc(dept ? dept.name : "—")}</span>
            <span class="info-actions">${ICON.chevron}</span>
          </div>
          <div class="info-row">
            <span class="info-label">职位</span>
            <span class="info-value">${esc(m.position || "—")}</span>
          </div>
          <div class="info-row">
            <span class="info-label">固定电话</span>
            <span class="info-value ${m.officePhone ? "link" : ""}" ${m.officePhone ? `data-act="call" data-tel="${esc(m.officePhone)}"` : ""}>${esc(m.officePhone || "—")}</span>
            <span class="info-actions">
              ${m.officePhone ? `<span class="row-icon call" data-act="call" data-tel="${esc(m.officePhone)}" title="拨打">${ICON.phone}</span>` : ""}
            </span>
          </div>
        </div>
      </div>`;

    el.addEventListener("click", (e) => {
      const t = e.target.closest("[data-act]");
      if (!t) return;
      const act = t.dataset.act;
      if (isDblTapSyntheticClick()) return;   // 双击返回后的残余 click，不触发任何操作
      if (act === "call") { confirmCall(t.dataset.tel); return; }
      if (act === "back") popPage();
      else if (act === "edit") openPersonForm(m, m.departmentId);
      else if (act === "more") openDetailSheet(m);
      else if (act === "open-dept") openMemberList(m.departmentId);
    });

    pushPage(el);
  }

  /* ---------------- 模态框系统 ---------------- */
  const modalLayer = document.getElementById("modalLayer");

  function openModal(innerHTML, afterMount) {
    const mask = document.createElement("div");
    mask.className = "modal-mask";
    mask.innerHTML = `<div class="modal">${innerHTML}</div>`;
    modalLayer.appendChild(mask);
    void mask.offsetWidth;
    mask.classList.add("show");
    mask.addEventListener("click", (e) => { if (e.target === mask) closeModal(mask); });
    if (afterMount) afterMount(mask);
    return mask;
  }
  function closeModal(mask) {
    mask.classList.add("closing");
    mask.classList.remove("show");
    setTimeout(() => { if (mask.parentNode) mask.parentNode.removeChild(mask); }, 420);
  }

  function deptOptions(selectedId, excludeId) {
    // 排除自身及其子孙（避免循环父级）
    const forbidden = new Set();
    if (excludeId) {
      forbidden.add(excludeId);
      const collect = (id) => childDepts(id).forEach((c) => { forbidden.add(c.id); collect(c.id); });
      collect(excludeId);
    }
    return departments
      .filter((d) => d.id !== ROOT_ID && !forbidden.has(d.id))
      .map((d) => `<option value="${d.id}" ${d.id === selectedId ? "selected" : ""}>${esc(d.name)}</option>`)
      .join("");
  }

  /* 添加 / 编辑 人员 */
  function openPersonForm(member, defaultDeptId) {
    const isEdit = !!member;
    const sel = member ? member.departmentId : (defaultDeptId || (childDepts(ROOT_ID)[0] && childDepts(ROOT_ID)[0].id) || "");
    const v = (k) => (member ? esc(member[k] || "") : "");
    const title = isEdit ? "编辑成员" : "添加人员";
    const html = `
      <div class="modal-title">${title}</div>
      <div class="field"><label>姓名</label><input id="f_name" value="${v("name")}" placeholder="请输入姓名" /></div>
      <div class="field"><label>所属部门</label><select id="f_dept">${deptOptions(sel)}</select></div>
      <div class="field"><label>职务</label><input id="f_pos" value="${v("position")}" placeholder="请输入职务" /></div>
      <div class="field"><label>手机号码</label><input id="f_mobile" value="${v("mobilePhone")}" placeholder="如 13738151907" inputmode="numeric" /></div>
      <div class="field"><label>固定电话</label><input id="f_office" value="${v("officePhone")}" placeholder="如 56700002" /></div>
      <div class="modal-actions">
        ${isEdit ? `<button class="btn btn-danger" data-act="del">删除</button>` : ""}
        <button class="btn btn-cancel" data-act="cancel">取消</button>
        <button class="btn btn-confirm" data-act="save">${isEdit ? "保存" : "添加"}</button>
      </div>`;
    const mask = openModal(html, (m) => { const i = m.querySelector("#f_name"); if (i) i.focus(); });
    mask.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (!act) return;
      const a = act.dataset.act;
      if (a === "cancel") return closeModal(mask);
      if (a === "del") {
        confirmDialog("删除成员", `确定删除「${member.name}」吗？此操作不可撤销。`, () => {
          members = members.filter((x) => x.id !== member.id);
          saveData(); closeModal(mask); refreshCurrent(); haptic(12); toast("已删除成员");
        });
        return;
      }
      if (a === "save") {
        const name = mask.querySelector("#f_name").value.trim();
        if (!name) { toast("请填写姓名"); return; }
        const data = {
          name,
          departmentId: mask.querySelector("#f_dept").value,
          position: mask.querySelector("#f_pos").value.trim(),
          mobilePhone: mask.querySelector("#f_mobile").value.trim(),
          officePhone: mask.querySelector("#f_office").value.trim(),
        };
        if (isEdit) {
          Object.assign(member, data);
        } else {
          members.push(Object.assign({ id: uid("m"), avatarColor: pickColor(members.length), sortOrder: nextOrder(members, (x) => x.departmentId === data.departmentId) }, data));
        }
        saveData(); closeModal(mask); refreshCurrent(); haptic(12); toast(isEdit ? "已保存" : "已添加成员");
      }
    });
  }

  /* 添加 / 编辑 部门 */
  function openDeptForm(dept, defaultParentId) {
    const isEdit = !!dept;
    const parent = dept ? dept.parentId : (defaultParentId || ROOT_ID);
    const title = isEdit ? "编辑部门" : "添加子部门";
    const html = `
      <div class="modal-title">${title}</div>
      <div class="field"><label>部门名称</label><input id="f_dname" value="${isEdit ? esc(dept.name) : ""}" placeholder="请输入部门名称" /></div>
      <div class="field"><label>上级部门</label><select id="f_dparent">${deptOptions(parent, isEdit ? dept.id : null)}</select></div>
      <div class="modal-actions">
        ${isEdit ? `<button class="btn btn-danger" data-act="del">删除</button>` : ""}
        <button class="btn btn-cancel" data-act="cancel">取消</button>
        <button class="btn btn-confirm" data-act="save">${isEdit ? "保存" : "添加"}</button>
      </div>`;
    const mask = openModal(html, (m) => { const i = m.querySelector("#f_dname"); if (i) i.focus(); });
    mask.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (!act) return;
      const a = act.dataset.act;
      if (a === "cancel") return closeModal(mask);
      if (a === "del") {
        const count = deptMembers(dept.id).length + childDepts(dept.id).length;
        confirmDialog("删除部门", `确定删除「${dept.name}」吗？${count ? `该部门下还有 ${count} 个子项将被一并移除。` : ""}`, () => {
          // 递归删除子孙
          const toDel = new Set([dept.id]);
          const collect = (id) => childDepts(id).forEach((c) => { toDel.add(c.id); collect(c.id); });
          collect(dept.id);
          departments = departments.filter((d) => !toDel.has(d.id));
          members = members.filter((m) => !toDel.has(m.departmentId));
          saveData(); closeModal(mask); refreshCurrent(); haptic(12); toast("已删除部门");
        });
        return;
      }
      if (a === "save") {
        const name = mask.querySelector("#f_dname").value.trim();
        if (!name) { toast("请填写部门名称"); return; }
        const pid = mask.querySelector("#f_dparent").value;
        if (isEdit) {
          dept.name = name; dept.parentId = pid;
        } else {
          departments.push({ id: uid("d"), name, parentId: pid, sortOrder: nextOrder(departments, (x) => x.parentId === pid) });
        }
        saveData(); closeModal(mask); refreshCurrent(); haptic(12); toast(isEdit ? "已保存" : "已添加部门");
      }
    });
  }

  /* 详情页更多菜单 */
  function openDetailSheet(member) {
    const mask = openModal(`
      <button class="sheet-item" data-act="edit">${ICON.pencil}编辑资料</button>
      <button class="sheet-item danger" data-act="del">${ICON.more}删除联系人</button>
      <button class="sheet-cancel" data-act="cancel">取消</button>`, () => {});
    mask.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (!act) return;
      const a = act.dataset.act;
      if (a === "cancel") return closeModal(mask);
      if (a === "edit") { closeModal(mask); openPersonForm(member, member.departmentId); }
      if (a === "del") {
        closeModal(mask);
        confirmDialog("删除联系人", `确定删除「${member.name}」吗？`, () => {
          members = members.filter((x) => x.id !== member.id);
          saveData(); refreshCurrent(); haptic(12); toast("已删除成员");
          while (stack.length > 1) popPage(); // 返回上一级
        });
      }
    });
  }

  /* 通用确认框 */
  function confirmDialog(title, msg, onConfirm) {
    const mask = openModal(`
      <div class="modal-title">${esc(title)}</div>
      <div style="font-size:15px;color:#666;line-height:1.6;margin-bottom:20px">${esc(msg)}</div>
      <div class="modal-actions">
        <button class="btn btn-cancel" data-act="cancel">取消</button>
        <button class="btn btn-confirm" data-act="ok">确定</button>
      </div>`);
    mask.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (!act) return;
      if (act.dataset.act === "cancel") closeModal(mask);
      if (act.dataset.act === "ok") { closeModal(mask); onConfirm(); }
    });
  }

  /* ---------------- 拨号确认 ---------------- */
  function doCall(number) { window.location.href = "tel:" + number; }
  function confirmCall(number) {
    if (!number) return;
    const mask = openModal(`
      <div class="modal-title">拨打电话</div>
      <div class="call-number">${esc(number)}</div>
      <div class="call-hint">确认要拨打此号码吗？</div>
      <div class="modal-actions">
        <button class="btn btn-cancel" data-act="cancel">取消</button>
        <button class="btn btn-confirm" data-act="ok">拨打</button>
      </div>`);
    mask.addEventListener("click", (e) => {
      const act = e.target.closest("[data-act]");
      if (!act) return;
      if (act.dataset.act === "cancel") return closeModal(mask);
      if (act.dataset.act === "ok") { closeModal(mask); haptic(12); doCall(number); }
    });
  }

  /* ---------------- 拖拽排序（指针事件，兼容触摸/鼠标） ---------------- */
  // 拖拽结束时刻：之后 400ms 内忽略列表行/拨号的合成点击，避免误触导航；
  // 按钮（如“完成”）的点击始终放行，不会像旧的 blockNextClick 那样吞掉用户点击。
  let lastDragEnd = 0;
  const DRAG_CLICK_GUARD_MS = 400;
  const isDragSyntheticClick = (act) =>
    Date.now() - lastDragEnd < DRAG_CLICK_GUARD_MS &&
    (act === "open-dept" || act === "open-member" || act === "call" || act === "crumb");

  // 双击空白返回后，浏览器仍会为同一手势派发残余 click；此时页面栈已变，
  // 该 click 会落在上一页同坐标的交互元素上（部门行/成员行/返回键等），
  // 若不抑制会立刻再次导航（“弹回后又弹入下一级”）。短时间内忽略一切 data-act 点击。
  let lastDblTapPop = 0;
  const DBLTAP_CLICK_GUARD_MS = 500;
  const isDblTapSyntheticClick = () => Date.now() - lastDblTapPop < DBLTAP_CLICK_GUARD_MS;
  function reorderDept(parentId, ids) {
    ids.forEach((id, i) => { const d = getDept(id); if (d) d.sortOrder = i; });
    saveData(); haptic(10); toast("部门顺序已保存");
  }
  function reorderMembers(deptId, ids) {
    ids.forEach((id, i) => { const m = members.find((x) => x.id === id); if (m) m.sortOrder = i; });
    saveData(); haptic(10); toast("成员顺序已保存");
  }
  function enableSortable(groupEl, itemSelector, onReorder) {
    if (!groupEl) return;
    let dragEl = null, clone = null, startX = 0, startY = 0, offX = 0, offY = 0, dragging = false;
    const THRESH = 6;

    const items = () => Array.from(groupEl.querySelectorAll(itemSelector));

    function onDown(e) {
      const handle = e.target.closest(".drag-handle");
      if (!handle) return;
      const item = e.target.closest(itemSelector);
      if (!item || !groupEl.contains(item)) return;
      e.preventDefault();
      dragEl = item; startX = e.clientX; startY = e.clientY; dragging = false;
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    }
    function begin() {
      dragging = true;
      const r = dragEl.getBoundingClientRect();
      offX = startX - r.left; offY = startY - r.top;
      clone = dragEl.cloneNode(true);
      clone.classList.add("drag-clone");
      clone.style.width = r.width + "px";
      clone.style.left = r.left + "px";
      clone.style.top = r.top + "px";
      const gh = clone.querySelector(".drag-handle"); if (gh) gh.style.visibility = "hidden";
      document.body.appendChild(clone);
      dragEl.classList.add("drag-placeholder");
    }
    function onMove(e) {
      if (!dragEl) return;
      if (!dragging) {
        if (Math.abs(e.clientX - startX) <= THRESH && Math.abs(e.clientY - startY) <= THRESH) return;
        begin();
      }
      e.preventDefault();
      clone.style.left = (e.clientX - offX) + "px";
      clone.style.top = (e.clientY - offY) + "px";
      const others = items().filter((it) => it !== dragEl);
      let placed = false;
      for (const it of others) {
        const r = it.getBoundingClientRect();
        if (e.clientY < r.top + r.height / 2) { groupEl.insertBefore(dragEl, it); placed = true; break; }
      }
      if (!placed) groupEl.appendChild(dragEl);
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!dragEl) return;
      if (dragging) {
        if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
        dragEl.classList.remove("drag-placeholder");
        lastDragEnd = Date.now();
        onReorder(items().map((it) => it.dataset.id));
      }
      dragEl = null; clone = null; dragging = false;
    }
    groupEl.addEventListener("pointerdown", onDown);
  }

  /* ---------------- Toast ---------------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2000);
  }

  /* ---------------- Excel 导入 / 导出 ---------------- */
  const excelInput = document.getElementById("excelInput");
  function triggerImport() { excelInput.value = ""; excelInput.click(); }
  excelInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) importExcel(file);
  });

  /* Excel 导入：支持多 sheet、表头模糊匹配、按姓名+部门去重更新 */
  function normalizeName(s) { return String(s || "").trim().replace(/\s+/g, " "); }
  function normalizeDeptName(s) { return String(s || "").trim().replace(/\s+/g, " ").replace(/^\s+|\s+$/g, ""); }
  function normalizePhone(s) { return String(s || "").trim().replace(/[^\d+]/g, ""); }
  function mapColumns(header) {
    const h = header.map((x) => String(x == null ? "" : x).trim().toLowerCase().replace(/\s+/g, ""));
    const idx = {};
    h.forEach((cell, i) => {
      if (!cell) return;
      if (idx.name == null && /姓名|名字|name/.test(cell)) idx.name = i;
      else if (idx.dept == null && /部门|单位|院系|dept/.test(cell)) idx.dept = i;
      else if (idx.position == null && /职务|职位|岗位|职称|position|job|title/.test(cell)) idx.position = i;
      else if (idx.mobile == null && !/办公|固定|座机/.test(cell) && /手机|mobile/.test(cell)) idx.mobile = i;
      else if (idx.office == null && /办公电话|固定电话|座机/.test(cell)) idx.office = i;
    });
    // fallback：宽泛的"电话"列
    h.forEach((cell, i) => {
      if (!cell) return;
      if (idx.mobile == null && !/办公|固定|座机/.test(cell) && /电话|tel|phone/.test(cell)) idx.mobile = i;
      if (idx.office == null && /电话|tel|phone/.test(cell)) idx.office = i;
    });
    return idx;
  }
  function findHeaderRow(rows) {
    for (let i = 0; i < Math.min(rows.length, 30); i++) {
      const header = rows[i].map((x) => String(x == null ? "" : x).trim());
      const idx = mapColumns(header);
      if (idx.name != null && (idx.mobile != null || idx.office != null || idx.position != null)) return { idx, rowIndex: i };
    }
    return null;
  }
  function ensureDept(name, order) {
    name = normalizeDeptName(name) || "未分类";
    const found = departments.find((d) => d.name === name && d.parentId === ROOT_ID);
    if (found) return { dept: found, isNew: false };
    const d = { id: uid("d"), name, parentId: ROOT_ID, sortOrder: (order != null ? order : nextOrder(departments, (x) => x.parentId === ROOT_ID)) };
    departments.push(d);
    return { dept: d, isNew: true };
  }
  function upsertMember(name, deptId, position, mobile, office) {
    const existing = members.find((m) => m.name === name && m.departmentId === deptId);
    if (existing) {
      if (position) existing.position = position;
      if (mobile) existing.mobilePhone = mobile;
      if (office) existing.officePhone = office;
      return "update";
    }
    members.push({
      id: uid("m"), name,
      position: position || "",
      departmentId: deptId,
      mobilePhone: mobile || "",
      officePhone: office || "",
      avatarColor: pickColor(members.length),
      sortOrder: nextOrder(members, (x) => x.departmentId === deptId),
    });
    return "create";
  }
  function cellVal(r, i) { return i != null && i >= 0 && r[i] != null ? String(r[i]) : ""; }

  function importExcel(file) {
    if (typeof XLSX === "undefined") { toast("Excel 组件未加载，请检查网络"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      let wb;
      try {
        wb = XLSX.read(ev.target.result, { type: "array" });
      } catch (err) {
        console.error(err);
        toast("解析失败，请确认文件格式");
        return;
      }
      if (!wb.SheetNames.length) { toast("文件为空"); return; }
      const isMultiSheet = wb.SheetNames.length > 1;
      const curCount = Math.max(members.length + departments.length - 1, 0); // 不含根部门

      // 完全覆盖：导入前弹确认，确认后清空除根部门外的全部数据，仅以 Excel 内容为准
      confirmDialog("覆盖导入", `导入将清空当前通讯录全部数据（共 ${curCount} 条记录），仅以本 Excel 内容为准。确定继续吗？`, () => {
        const root = departments.find((d) => d.id === ROOT_ID) || { id: ROOT_ID, name: "高校-杭州职业技术大学", parentId: null };
        departments = [root];
        members = [];

        let nDept = 0, nMem = 0, nSkippedSheet = 0;

        wb.SheetNames.forEach((sheetName, sIdx) => {
          const ws = wb.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
          const found = findHeaderRow(rows);
          if (!found) { nSkippedSheet++; return; }
          const { idx, rowIndex } = found;
          const sheetDept = ensureDept(sheetName, sIdx);
          if (sheetDept.isNew) nDept++;

          rows.slice(rowIndex + 1).forEach((r, mIdx) => {
            const name = normalizeName(cellVal(r, idx.name));
            if (!name) return;
            const position = normalizeName(cellVal(r, idx.position));
            const mobile = normalizePhone(cellVal(r, idx.mobile));
            const office = normalizePhone(cellVal(r, idx.office));
            // 单 sheet 且有部门列时，以行内部门为准；多 sheet 以 sheet 名为准
            let dept = sheetDept.dept;
            if (!isMultiSheet && idx.dept != null) {
              const dName = normalizeDeptName(cellVal(r, idx.dept));
              if (dName) {
                const d = ensureDept(dName);
                if (d.isNew) nDept++;
                dept = d.dept;
              }
            }
            members.push({
              id: uid("m"), name,
              position: position || "",
              departmentId: dept.id,
              mobilePhone: mobile || "",
              officePhone: office || "",
              avatarColor: pickColor(members.length),
              sortOrder: mIdx,
            });
            nMem++;
          });
        });

        saveData();
        refreshCurrent();
        haptic(15);
        if (nSkippedSheet) toast(`已覆盖导入：${nDept} 个部门、${nMem} 名成员（${nSkippedSheet} 张表未识别）`);
        else toast(`已覆盖导入：${nDept} 个部门、${nMem} 名成员`);
      });
    };
    reader.readAsArrayBuffer(file);
  }

  function exportExcel() {
    if (typeof XLSX === "undefined") { toast("Excel 组件未加载，请检查网络"); return; }
    const data = [["部门", "姓名", "职务", "手机号码", "固定电话"]];
    members.forEach((m) => {
      const d = getDept(m.departmentId);
      data.push([d ? d.name : "", m.name, m.position || "", m.mobilePhone || "", m.officePhone || ""]);
    });
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "通讯录");
    XLSX.writeFile(wb, "通讯录_杭州职业技术大学.xlsx");
    toast("已导出 Excel");
  }

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

  /* 生成 .vcf 并交给系统（优先分享面板存文件；不支持时回退下载） */
  const VCF_FILE_NAME = "杭州职业技术大学通讯录.vcf";
  async function exportVCard() {
    if (!members.length) { toast("暂无联系人可导出"); return; }
    const blob = new Blob([buildVCard()], { type: "text/vcard;charset=utf-8" });
    // iOS 15+ / Android：打开系统分享面板，可选择“存储到文件”，文件不会直接跳进通讯录
    try {
      const file = new File([blob], VCF_FILE_NAME, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        toast("请在分享面板选择“存储到文件”，再从“文件”中打开 .vcf 导入通讯录");
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") return;   // 用户取消分享
      // 其他异常回退到下载
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = VCF_FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("通讯录文件已生成并保存到“下载”，请在“文件”App 中打开导入");
  }

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
          `将生成通讯录文件（共 ${members.length} 人）。确认后请在系统面板选择“存储到文件”，再从“文件”中打开该 .vcf 导入通讯录；若提示“更新现有联系人/新建联系人”，请选择“更新”，即可避免重复新建。`,
          exportVCard);
      }
    });
  }

  /* ---------------- 状态栏时钟 ---------------- */
  const sbTime = document.getElementById("sbTime");
  function tick() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    sbTime.textContent = `${hh}:${mm}`;
  }

  /* ---------------- 启动（先过口令，再进入应用） ---------------- */
  const lockScreen = document.getElementById("lockScreen");
  const lockInput = document.getElementById("lockInput");
  const lockBtn = document.getElementById("lockBtn");
  const lockCard = document.getElementById("lockCard");
  const lockField = document.getElementById("lockField");

  function bootApp() {
    openDeptList();
    initDoubleTapBack();

    // 首次使用提示一次：双击空白区域返回（仅展示一次，不打扰后续操作）
    if (!localStorage.getItem("hzvtc_dbltap_hint_v1")) {
      setTimeout(() => {
        toast("提示：双击页面空白处可快速返回上一级");
        try { localStorage.setItem("hzvtc_dbltap_hint_v1", "1"); } catch (e) {}
      }, 1400);
    }
  }

  function showLockScreen() {
    lockScreen.hidden = false;
    let unlocking = false;

    async function tryUnlock() {
      if (unlocking) return;
      const val = lockInput.value;
      if (!val) return;
      unlocking = true;
      lockBtn.disabled = true;
      // 口令即钥匙：能成功解密 = 口令正确
      const ok = await decryptSeed(val);
      if (ok) {
        setUnlocked();
        haptic(15);
        toastEl.classList.remove("show");   // 清除解锁前的错误提示
        lockScreen.classList.add("unlocked");
        setTimeout(() => {
          lockScreen.hidden = true;
          bootApp();
        }, 340);
      } else {
        // 错误反馈：输入框红边 + 卡片抖动 + 轻提示
        lockField.classList.add("error");
        lockCard.classList.remove("lock-shake");
        void lockCard.offsetWidth;   // 重置动画
        lockCard.classList.add("lock-shake");
        lockInput.value = "";
        lockInput.focus();
        haptic(30);
        toast("口令错误，请重试");
        setTimeout(() => lockField.classList.remove("error"), 650);
      }
      unlocking = false;
      lockBtn.disabled = false;
    }

    lockBtn.addEventListener("click", tryUnlock);
    lockInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });
    lockCard.addEventListener("animationend", () => lockCard.classList.remove("lock-shake"));
    setTimeout(() => lockInput.focus(), 350);
  }

  loadData();
  tick();
  setInterval(tick, 30000);

  if (isUnlocked()) {
    lockScreen.remove();
    bootApp();
  } else {
    showLockScreen();
  }

  /* 注册 Service Worker（方案 A：离线可用） */
  if ("serviceWorker" in navigator) {
    let refreshing = false;
    // 新版本就绪并接管页面后自动刷新一次，确保用户拿到最新代码
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => { /* 离线能力不可用时静默降级 */ });
    });
  }
})();
