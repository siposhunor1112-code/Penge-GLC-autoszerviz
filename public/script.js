/* =========================================================
   Penge GLC autószerviz – adatok és mozgás
   ========================================================= */

/* ---------- Adatok: ezeket kell módosítani, ha valami változik ---------- */
const SHOP = {
  name: "Penge GLC autószerviz",
  // Ha phone null, a weboldal elrejti a hívás gombokat.
  phone: "+36 20 322 6614",
  address: "1131 Budapest, Dolmány u. 7.",
  // Nyitvatartás napokra bontva (0 = vasárnap … 6 = szombat); null = zárva
  hours: {
    1: ["08:00", "18:00"],
    2: ["08:00", "18:00"],
    3: ["08:00", "18:00"],
    4: ["08:00", "18:00"],
    5: ["08:00", "18:00"],
    6: ["08:00", "14:00"],
    0: null,
  },
  // A Google Térkép, ami kattintásra betölt
  mapEmbed: "https://www.google.com/maps?q=Penge%20GLC%20aut%C3%B3szerviz%2C%201131%20Budapest%2C%20Dolm%C3%A1ny%20u.%207&output=embed",
};

// A tünetkereső sürgősségi szintjei (a tünetek maguk az index.html-ben vannak)
const LEVELS = {
  1: "Ráér – tervezze be",
  2: "Ne halogassa",
  3: "Azonnal",
};

const DAY_NAMES = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const desktop = window.matchMedia("(min-width: 901px)");
const phoneDigits = SHOP.phone ? SHOP.phone.replace(/[^\d+]/g, "") : null;

document.documentElement.classList.replace("no-js", "js");

/* ---------- Telefonszám mindenhol ---------- */
function applyPhone(root = document) {
  $$("[data-phone-link]", root).forEach((a) => {
    if (!SHOP.phone) { a.hidden = true; return; }
    a.href = `tel:${phoneDigits}`;
  });
  $$("[data-phone-text]", root).forEach((el) => { if (SHOP.phone) el.textContent = SHOP.phone; });
}
applyPhone();
$$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ---------- Nyitvatartás (budapesti idő szerint) ---------- */
function budapestNow() {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Budapest", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const minutes = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
    if (day < 0 || Number.isNaN(minutes)) throw new Error("hiányos időzóna-adat");
    return { day, minutes };
  } catch (err) {
    // Tartalék: CET, nyári időszámítás március utolsó vasárnapjától október utolsó vasárnapjáig
    const now = new Date();
    const y = now.getUTCFullYear();
    const lastSunday = (month) => { const d = new Date(Date.UTC(y, month + 1, 0, 1)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d; };
    const summer = now >= lastSunday(2) && now < lastSunday(9);
    const t = new Date(now.getTime() + (summer ? 2 : 1) * 3600e3);
    return { day: t.getUTCDay(), minutes: t.getUTCHours() * 60 + t.getUTCMinutes() };
  }
}
const toMinutes = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const pretty = (hhmm) => hhmm.replace(/^0/, "");

function openStatus() {
  const { day, minutes } = budapestNow();
  const today = SHOP.hours[day];
  if (today && minutes >= toMinutes(today[0]) && minutes < toMinutes(today[1])) {
    const left = toMinutes(today[1]) - minutes;
    return {
      open: true,
      text: left <= 45 ? `Nyitva még ${left} percig` : `Most nyitva · ${pretty(today[1])}-ig`,
      short: left <= 45 ? `Még ${left} percig` : `Nyitva · ${pretty(today[1])}-ig`,
    };
  }
  if (today && minutes < toMinutes(today[0])) {
    return { open: false, text: `Zárva · ma ${pretty(today[0])}-kor nyitunk`, short: `Ma ${pretty(today[0])}-kor nyit` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (SHOP.hours[d]) {
      const when = i === 1 ? "holnap" : DAY_NAMES[d];
      return {
        open: false,
        text: `Zárva · ${when} ${pretty(SHOP.hours[d][0])}-kor nyitunk`,
        short: "Zárva",
      };
    }
  }
  return { open: false, text: "Átmenetileg zárva", short: "Zárva" };
}

const narrow = window.matchMedia("(max-width: 600px)");
function renderStatus() {
  const s = openStatus();
  $$("[data-status]").forEach((el) => {
    el.classList.toggle("is-open", s.open);
    el.classList.toggle("is-closed", !s.open);
    const inNav = !!el.closest(".nav");
    $("[data-status-text]", el).textContent = inNav && narrow.matches ? s.short : s.text;
  });
  const { day } = budapestNow();
  $$("[data-hours] tr").forEach((tr) => tr.classList.toggle("is-today", Number(tr.dataset.day) === day));
}
renderStatus();
setInterval(renderStatus, 30_000);
narrow.addEventListener?.("change", renderStatus);

/* ---------- Számítógépen: szám másolása (ott a tel: link sokszor nem működik) ---------- */
const copyBtn = $("[data-copy-phone]");
if (copyBtn && SHOP.phone && finePointer) {
  copyBtn.hidden = false;
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(SHOP.phone);
      copyBtn.textContent = "Kimásolva ✓";
    } catch {
      copyBtn.textContent = SHOP.phone;
    }
    setTimeout(() => { copyBtn.textContent = "Szám másolása"; }, 2400);
  });
}

/* ---------- Fejléc és menü ---------- */
const nav = $("[data-nav]");
const toggle = $(".nav__toggle");
const dock = $(".dock");
function setMenu(open) {
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  document.body.style.overflow = open ? "hidden" : "";
}
toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
$$("#menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); } });
desktop.addEventListener?.("change", () => setMenu(false));

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle("is-scrolled", y > 10);
  dock?.classList.toggle("is-shown", y > window.innerHeight * 0.6);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Az aktuális szekció kiemelése a menüben
const menuLinks = $$("#menu a[href^='#']");
if ("IntersectionObserver" in window) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      menuLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${en.target.id}`)));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  menuLinks.forEach((a) => { const t = $(a.getAttribute("href")); if (t) spy.observe(t); });
}

/* ---------- Nyitókép ---------- */
$$(".hero [data-rise]").forEach((el, i) => el.style.setProperty("--d", `${0.1 + i * 0.08}s`));
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-ready")));

const blueprint = $(".blueprint");
const bpSvg = $("[data-blueprint]");
setTimeout(() => blueprint?.classList.add("is-drawn"), reduced ? 0 : 500);
if (reduced && bpSvg?.pauseAnimations) bpSvg.pauseAnimations();

// A fény finoman követi az egeret
const hero = $(".hero");
if (finePointer && !reduced && hero) {
  let raf = 0;
  hero.addEventListener("pointermove", (e) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      hero.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });
}

/* ---------- Az autó alkatrészei: kiemelés ---------- */
const partBtns = $$("[data-part-btn]");
const partNames = partBtns.map((b) => b.dataset.partBtn);
let partIndex = 0;
let partTimer = null;
let heroVisible = true;

function setPart(name) {
  partIndex = Math.max(0, partNames.indexOf(name));
  $$(".bp-part, .pin").forEach((el) => el.classList.toggle("is-active", el.dataset.part === name));
  $$("[data-part-desc]").forEach((el) => el.classList.toggle("is-active", el.dataset.partDesc === name));
  partBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.partBtn === name)));
}
function stopCycle() { clearInterval(partTimer); partTimer = null; }
function startCycle() {
  if (reduced || partTimer) return;
  partTimer = setInterval(() => { if (heroVisible) setPart(partNames[(partIndex + 1) % partNames.length]); }, 3200);
}
if (partNames.length) {
  setPart(partNames[0]);
  // Magától végigmegy a részeken, amíg a látogató bele nem nyúl
  setTimeout(startCycle, 2600);
  let touched = false;
  partBtns.forEach((b) => {
    b.addEventListener("click", () => { touched = true; stopCycle(); setPart(b.dataset.partBtn); });
    b.addEventListener("mouseenter", () => { if (finePointer) { stopCycle(); setPart(b.dataset.partBtn); } });
    b.addEventListener("mouseleave", () => { if (finePointer && !touched) startCycle(); });
    b.addEventListener("focus", () => { stopCycle(); setPart(b.dataset.partBtn); });
  });
  if ("IntersectionObserver" in window && blueprint) {
    new IntersectionObserver(([en]) => {
      heroVisible = en.isIntersecting;
      if (bpSvg?.pauseAnimations && !reduced) (heroVisible ? bpSvg.unpauseAnimations() : bpSvg.pauseAnimations());
    }).observe(blueprint);
  }
}

/* ---------- Számlálók ---------- */
function countUp(el) {
  const target = Number(el.dataset.count);
  const dec = Number(el.dataset.decimals || 0);
  const fmt = (v) => v.toFixed(dec).replace(".", ",");
  if (reduced) { el.textContent = fmt(target); return; }
  const start = performance.now();
  const dur = 1400;
  const step = (now) => {
    const t = Math.min(1, (now - start) / dur);
    el.textContent = fmt(target * (1 - Math.pow(1 - t, 4)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Megjelenés görgetésre ---------- */
if ("IntersectionObserver" in window && !reduced) {
  // Egy csoportban lévő elemek kicsit egymás után jelennek meg
  $$(".services, .steps, .themes").forEach((g) => $$("[data-reveal]", g).forEach((el, i) => el.style.setProperty("--d", `${(i % 3) * 0.08}s`)));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  const counters = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { countUp(en.target); counters.unobserve(en.target); } });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => counters.observe(el));
} else {
  $$("[data-reveal]").forEach((el) => el.classList.add("is-in"));
}

/* ---------- Folyamat: a vonal görgetésre telik ---------- */
const steps = $("[data-steps]");
if (steps) {
  const items = $$(".step", steps);
  let ticking = false;
  const update = () => {
    ticking = false;
    const r = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.35)));
    steps.style.setProperty("--progress", reduced ? 1 : p.toFixed(3));
    items.forEach((it, i) => it.classList.toggle("is-active", reduced || p >= i / items.length + 0.02));
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/* ---------- Tünetkereső ---------- */
// Asztali gépen: bal oldalt a lista, jobbra a kiválasztott tünet (mindig egy van nyitva).
// Telefonon: lenyíló lista, a tünet közvetlenül a címe alatt nyílik ki (be is csukható).
const diag = $("[data-diag]");
if (diag) {
  const syms = $$(".sym", diag);
  diag.style.setProperty("--rows", syms.length);

  syms.forEach((sym) => {
    const body = $(".sym__body", sym);
    const level = sym.dataset.level;
    // Sürgősségi jelzés és hívás gomb minden tünethez
    const lvl = document.createElement("p");
    lvl.className = "sym__level";
    lvl.innerHTML = `<span class="meter" aria-hidden="true"><span></span><span></span><span></span></span>${LEVELS[level] || ""}`;
    const title = $(".sym__title", body);
    title.after(lvl);
    if (SHOP.phone) {
      const call = document.createElement("a");
      call.className = "btn btn--accent btn--sm sym__call";
      call.href = `tel:${phoneDigits}`;
      call.innerHTML = `<svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>${level === "3" ? "Hívjon most" : "Hívjon minket"}`;
      body.appendChild(call);
    }
  });

  function open(sym, user) {
    const isOpen = sym.classList.contains("is-open");
    if (isOpen && desktop.matches) return; // asztali gépen mindig marad egy nyitott
    syms.forEach((s) => {
      const on = s === sym && !isOpen;
      s.classList.toggle("is-open", on);
      $(".sym__toggle", s).setAttribute("aria-expanded", String(on));
    });
    // Telefonon a kinyitott tünet címe kerüljön a képernyő tetejére
    if (user && !desktop.matches && !isOpen) {
      requestAnimationFrame(() => {
        const top = sym.getBoundingClientRect().top;
        const navH = nav.getBoundingClientRect().height;
        if (top < navH || top > window.innerHeight * 0.5) {
          window.scrollBy({ top: top - navH - 12, behavior: reduced ? "auto" : "smooth" });
        }
      });
    }
  }
  syms.forEach((sym) => $(".sym__toggle", sym).addEventListener("click", () => open(sym, true)));
  if (desktop.matches) open(syms[0], false);
  desktop.addEventListener?.("change", (e) => { if (e.matches && !syms.some((s) => s.classList.contains("is-open"))) open(syms[0], false); });
}

/* ---------- Térkép kattintásra ---------- */
const mapBtn = $("[data-map]");
mapBtn?.addEventListener("click", () => {
  const frame = document.createElement("iframe");
  frame.src = SHOP.mapEmbed;
  frame.title = `${SHOP.name} a térképen`;
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer-when-downgrade";
  mapBtn.replaceWith(frame);
});
