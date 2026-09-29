// Elkészíti a megosztási képet (public/assets/og.jpg) és az iPhone-ikont (public/assets/apple-touch-icon.png).
// Futtatás:  node tools/images.js      (kell hozzá a Playwright: npm i -g playwright, vagy NODE_PATH-on elérhetően)
const path = require("path");
const fs = require("fs");
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/node22/lib/node_modules/playwright")); }

const ROOT = path.join(__dirname, "..", "public");
// A betűket beágyazva adjuk át (az üres lapról a böngésző nem tölthet be helyi fájlt)
const font = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, "assets", "fonts", f)).toString("base64")}`;

const base = `
  @font-face { font-family: Archivo; font-weight: 100 900; font-stretch: 62% 125%; src: url(${font("archivo-latin-wdth-normal.woff2")}); }
  @font-face { font-family: Archivo; font-weight: 100 900; font-stretch: 62% 125%; src: url(${font("archivo-latin-ext-wdth-normal.woff2")}); unicode-range: U+0100-02BA; }
  @font-face { font-family: Mono; font-weight: 500; src: url(${font("jetbrains-mono-latin-500-normal.woff2")}); }
  @font-face { font-family: Mono; font-weight: 500; src: url(${font("jetbrains-mono-latin-ext-500-normal.woff2")}); unicode-range: U+0100-02BA; }
  * { margin: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  body { background: #0a0b0c; color: #ecebe6; font-family: Archivo; overflow: hidden; position: relative; }
  .grid { position: absolute; inset: 0; opacity: .6;
    background-image: linear-gradient(rgba(236,235,230,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(236,235,230,.08) 1px, transparent 1px);
    background-size: 60px 60px; -webkit-mask-image: radial-gradient(70% 80% at 70% 60%, #000 10%, transparent 75%); }
  .glow { position: absolute; inset: 0; background: radial-gradient(520px 360px at 75% 70%, rgba(255,61,46,.16), transparent 70%); }
`;

const blade = `<svg viewBox="0 0 40 40"><path d="M9 34 L21 4 H31 L19 34 Z" fill="#ecebe6"/><path d="M24 34 L28 24 H34 L30 34 Z" fill="#ff3d2e"/></svg>`;

const og = `<style>${base}
  .wrap { position: absolute; inset: 64px 72px; display: flex; flex-direction: column; }
  .top { display: flex; align-items: center; gap: 18px; font: 500 20px/1 Mono; letter-spacing: .2em; text-transform: uppercase; color: #9b9ea3; }
  .top svg { width: 46px; height: 46px; }
  h1 { margin-top: auto; font-stretch: 125%; font-weight: 900; text-transform: uppercase; font-size: 150px; line-height: .86; letter-spacing: -.035em; }
  h1 span { display: block; }
  h1 .o { color: transparent; -webkit-text-stroke: 2px #ecebe6; }
  h1 .o::after { content: ""; display: inline-block; width: .17em; height: .17em; background: #ff3d2e; margin-left: .06em; transform: skewX(-20deg); }
  .bottom { margin-top: 34px; display: flex; gap: 40px; font: 500 22px/1 Mono; letter-spacing: .08em; color: #9b9ea3; }
  .bottom b { color: #ecebe6; font-weight: 500; }
  .bottom i { font-style: normal; color: #ff3d2e; }
</style>
<div class="grid"></div><div class="glow"></div>
<div class="wrap">
  <div class="top">${blade} Penge GLC · márkafüggetlen autószerviz</div>
  <h1><span>Penge</span><span class="o">munka</span></h1>
  <div class="bottom"><span><b>4,9</b> <i>★</i> Google</span><span>Budapest XIII., Dolmány u. 7.</span><span><b>+36 20 322 6614</b></span></div>
</div>`;

const icon = `<style>${base}
  body { display: grid; place-items: center; }
  svg { width: 62%; height: 62%; }
</style>${blade}`;

(async () => {
  const browser = await chromium.launch();
  const shot = async (html, w, h, file, type) => {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(ROOT, "assets", file), type, ...(type === "jpeg" ? { quality: 88 } : {}) });
    await page.close();
    console.log("kész:", file);
  };
  await shot(og, 1200, 630, "og.jpg", "jpeg");
  await shot(icon, 180, 180, "apple-touch-icon.png", "png");
  await browser.close();
})();
