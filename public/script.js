/* =========================================================
   Penge GLC autószerviz – adatok és mozgás
   ========================================================= */

/* ---------- Adatok: ezeket kell módosítani, ha valami változik ---------- */
const SHOP = {
  name: "Penge GLC autószerviz",
  // Ha phone null, a weboldal elrejti a hívás gombokat és az SMS-küldést.
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
  1: "Ráér – de tervezd be",
  2: "Ne halogasd",
  3: "Most azonnal – hívj minket",
};

const DAY_NAMES = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const phoneDigits = SHOP.phone ? SHOP.phone.replace(/[^\d+]/g, "") : null;

document.documentElement.classList.replace("no-js", "js");

/* ---------- Telefonszám mindenhol ---------- */
$$("[data-phone-link]").forEach((a) => {
  if (!SHOP.phone) { a.hidden = true; return; }
  a.href = `tel:${phoneDigits}`;
});
$$("[data-phone-text]").forEach((el) => { if (SHOP.phone) el.textContent = SHOP.phone; });
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
    return left <= 45
      ? { open: true, text: `Nyitva még ${left} percig`, short: `Még ${left} percig` }
      : { open: true, text: `Most nyitva · ${pretty(today[1])}-ig`, short: `Nyitva · ${pretty(today[1])}-ig` };
  }
  if (today && minutes < toMinutes(today[0])) {
    return { open: false, text: `Zárva · ma ${pretty(today[0])}-kor nyitunk`, short: `Ma ${pretty(today[0])}-kor nyit` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    if (SHOP.hours[d]) {
      const when = i === 1 ? "holnap" : DAY_NAMES[d].toLowerCase();
      return { open: false, text: `Zárva · ${when} ${pretty(SHOP.hours[d][0])}-kor nyitunk`, short: "Zárva" };
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
  const long = $("[data-status-long]");
  if (long) long.textContent = s.open
    ? `${s.text}. Hívj bátran – ha épp szerelünk, visszahívunk.`
    : `${s.text}. Addig is összeállíthatod az üzenetet, és elküldheted SMS-ben.`;
  const { day } = budapestNow();
  $$("[data-hours] tr").forEach((tr) => tr.classList.toggle("is-today", Number(tr.dataset.day) === day));
}
renderStatus();
setInterval(renderStatus, 30_000);
narrow.addEventListener?.("change", renderStatus);

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

function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle("is-scrolled", y > 10);
  dock?.classList.toggle("is-shown", y > window.innerHeight * 0.5);
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Az aktuális szekció kiemelése a menüben
const menuLinks = $$("#menu a[href^='#']").filter((a) => !a.classList.contains("nav__menu-cta"));
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
$$(".hero [data-rise]").forEach((el, i) => el.style.setProperty("--d", `${0.12 + i * 0.1}s`));
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-ready")));

const blueprint = $(".blueprint");
const bpSvg = $("[data-blueprint]");
setTimeout(() => blueprint?.classList.add("is-drawn"), reduced ? 0 : 450);
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
// A tervrajz animációja csak akkor fut, amíg látszik
if ("IntersectionObserver" in window && bpSvg?.pauseAnimations && !reduced) {
  new IntersectionObserver(([en]) => (en.isIntersecting ? bpSvg.unpauseAnimations() : bpSvg.pauseAnimations())).observe(bpSvg);
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
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = fmt(target * eased);
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
const diag = $("[data-diag]");
let chosenService = null;
let chosenSymptom = null;
if (diag) {
  const chips = $("[data-diag-chips]", diag);
  const syms = $$(".sym", diag);
  const meterBox = $("[data-diag-meter]", diag);
  const meter = $(".meter", meterBox);
  const levelText = $("[data-diag-level]", diag);
  const bookBtn = $("[data-diag-book]", diag);

  syms.forEach((sym, i) => {
    const title = $(".sym__title", sym).textContent.trim();
    const b = document.createElement("button");
    b.type = "button";
    b.className = "diag__chip";
    b.id = `chip-${sym.id}`;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", sym.id);
    b.textContent = title;
    b.addEventListener("click", () => select(i, true));
    b.addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const n = (i + keys[e.key] + syms.length) % syms.length;
      select(n, true);
      chips.children[n].focus();
    });
    chips.appendChild(b);
    sym.setAttribute("role", "tabpanel");
    sym.setAttribute("aria-labelledby", b.id);
  });

  function select(i, user) {
    syms.forEach((s, n) => s.classList.toggle("is-active", n === i));
    $$(".diag__chip", chips).forEach((c, n) => {
      c.setAttribute("aria-selected", String(n === i));
      c.tabIndex = n === i ? 0 : -1;
    });
    const level = syms[i].dataset.level;
    meter.dataset.level = level;
    levelText.textContent = LEVELS[level] || "";
    chosenService = syms[i].dataset.service || null;
    chosenSymptom = $(".sym__title", syms[i]).textContent.trim();
    meterBox.hidden = false;
    if (user && window.matchMedia("(max-width: 900px)").matches) {
      chips.children[i].scrollIntoView({ block: "nearest", inline: "center", behavior: reduced ? "auto" : "smooth" });
    }
  }
  select(0, false);

  // „Időpontot kérek erre”: előre kitölti az űrlapot
  bookBtn.addEventListener("click", () => {
    const form = $("[data-booking]");
    if (!form) return;
    $$("input[name=service]", form).forEach((c) => { if (c.value === chosenService) c.checked = true; });
    const msg = $("#f-msg");
    if (msg && !msg.value.trim()) msg.value = chosenSymptom || "";
  });
}

/* ---------- Időpontkérés: üzenet összeállítása ---------- */
const form = $("[data-booking]");
if (form) {
  const out = $("[data-booking-out]", form);
  const preview = $("[data-booking-preview]", form);
  const sms = $("[data-booking-sms]", form);
  const copy = $("[data-booking-copy]", form);
  const hint = $("[data-booking-hint]", form);

  const buildText = () => {
    const f = new FormData(form);
    const services = f.getAll("service");
    const lines = [
      "Jó napot! Időpontot szeretnék kérni.",
      `Név: ${f.get("name").trim()}`,
      `Autó: ${f.get("car").trim()}`,
    ];
    if (services.length) lines.push(`Munka: ${services.join(", ")}`);
    lines.push(`Mikor: ${f.get("when")}`);
    const msg = f.get("msg").trim();
    if (msg) lines.push(`Tapasztalat: ${msg}`);
    lines.push("Köszönöm!");
    return lines.join("\n");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstBad = null;
    $$("[required]", form).forEach((el) => {
      const bad = !el.value.trim();
      el.setAttribute("aria-invalid", String(bad));
      if (bad && !firstBad) firstBad = el;
    });
    if (firstBad) { firstBad.focus(); return; }

    const text = buildText();
    preview.textContent = text;
    out.hidden = false;
    if (SHOP.phone) {
      // „?&body=” – így iPhone-on és Androidon is kitöltődik az üzenet
      sms.href = `sms:${phoneDigits}?&body=${encodeURIComponent(text)}`;
      sms.hidden = false;
      hint.textContent = finePointer
        ? `Számítógépről: másold ki a szöveget, és küldd el SMS-ben a ${SHOP.phone} számra – vagy hívj minket.`
        : "Az SMS gomb megnyitja az üzenetküldőt a kész szöveggel – csak a Küldés gombot kell megnyomnod.";
    } else {
      sms.hidden = true;
      hint.textContent = "";
    }
    out.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  });

  form.addEventListener("input", (e) => {
    if (e.target.hasAttribute("required") && e.target.value.trim()) e.target.setAttribute("aria-invalid", "false");
    if (!out.hidden) {
      const text = buildText();
      preview.textContent = text;
      if (SHOP.phone) sms.href = `sms:${phoneDigits}?&body=${encodeURIComponent(text)}`;
    }
  });

  copy.addEventListener("click", async () => {
    const text = preview.textContent;
    try {
      await navigator.clipboard.writeText(text);
      copy.textContent = "Kimásolva ✓";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(preview);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copy.textContent = "Kijelölve – másold ki";
    }
    setTimeout(() => { copy.textContent = "Szöveg másolása"; }, 2400);
  });
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
