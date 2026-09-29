# Penge GLC autószerviz – weboldal

Statikus, egyoldalas weboldal a Penge GLC autószerviznek (márkafüggetlen autószerviz, 1131 Budapest, Dolmány u. 7.).
Nincs szükség build lépésre: a `public/` mappa bármilyen statikus tárhelyen kiszolgálható (Cloudflare Workers, Netlify, GitHub Pages).

## Fájlok

- `public/` – maga a weboldal (ez kerül ki a netre):
  - `index.html` – az oldal szerkezete, szövegei, a szolgáltatások és a tünetkereső tartalma
  - `styles.css` – megjelenés (színek a `:root` változókban)
  - `script.js` – elérhetőség, nyitvatartás, tünetkereső, időpontkérés és minden mozgás
  - `404.html` – „P0404 hibakód” oldal a nem létező címekhez
  - `_headers` – biztonsági és gyorsítótár-beállítások a Cloudflare-nek (nem jelenik meg az oldalon)
  - `assets/` – ikonok, megosztási kép (`og.jpg`) és betűtípusok
  - `robots.txt` – a keresőknek
- `wrangler.jsonc` – Cloudflare-beállítás (a `public/` mappát teszi ki, a 404-oldallal együtt)
- `tools/images.js` – újragyártja a megosztási képet és az iPhone-ikont (`node tools/images.js`, Playwright kell hozzá)

## Megjelenés

- Prémium, „tervrajz” hangulat: grafitfekete háttér, csont színű szöveg, egyetlen kiemelőszín (féknyereg-piros),
  vékony vonalak, egy világos szekció a ritmus kedvéért – `public/styles.css`, `:root`
- Két betűtípus saját tárhelyről (SIL Open Font License, `public/assets/fonts/`): Archivo (változtatható szélességű –
  a címek széles, a szöveg normál változattal) és JetBrains Mono (címkék, számok)
- Logó: ferde „penge” jel piros éllel (`#blade` az `index.html` alján, és `assets/favicon.svg`)
- Nincs szükség fotóra: a nyitóképen az autó tervrajza kódból készül (SVG), betöltéskor „megrajzolódik”,
  és egy piros fénycsík fut végig a körvonalán

## Szekciók

- **Nyitókép**: „Penge munka.”, rövid bemutatás, Időpont és Hívás gomb, az autó tervrajza (Motor, Fék, Futómű, Diagnosztika
  jelölésekkel), alatta a tények: 4,9 ★ Google, Arany Vállalkozás díj, nyitvatartás, ingyenes parkolás
- **01 Szolgáltatások**: hat szolgáltatás-kártya
- **02 Így dolgozunk** (világos szekció): négy lépés, a vonal görgetésre telik
- **03 Tünetkereső**: a látogató kiválasztja, mit tapasztal (pl. „Nyikorog fékezéskor”, „Kigyulladt a motorhiba-lámpa”),
  és megkapja a valószínű okot, a teendőt és egy sürgősségi jelzést. Az „Időpontot kérek erre” gomb előre kitölti az űrlapot
- **04 Vélemények**: a Google-értékelések visszatérő témái
- **05 Időpontkérés**: az űrlapból kész üzenet lesz, ami egy koppintással SMS-ben elküldhető (vagy kimásolható).
  Az oldal nem küld és nem tárol adatot, nincs szükség szerverre
- **06 Hol vagyunk**: élő nyitva/zárva jelzés, nyitvatartás (a mai nap kiemelve), parkolás, útvonal Google Térképpel,
  Apple Térképpel és Waze-zel, térkép kattintásra (addig nem tölt be semmit a Google-tól)
- Telefonon alul mindig ott a **Hívás**, **Útvonal** és **Időpont** gomb
- Telefonra optimalizálva (320 px-től), notch-os telefonokon a szélek szabadon maradnak; aki kikapcsolta az animációkat
  (`prefers-reduced-motion`), annak minden mozdulatlan
- Keresőknek: leírás, megosztási kép (Facebookon, Messengerben szép előnézet), és strukturált adat (`AutoRepair`)
  a nyitvatartással és az értékeléssel

## Tartalom szerkesztése

- `public/script.js` eleje:
  - `SHOP.phone` – telefonszám; ha `null`, eltűnnek a hívás gombok és az SMS-küldés
  - `SHOP.hours` – napokra bontott nyitvatartás; ebből számolja az oldal budapesti idő szerint, hogy most nyitva van-e
  - `LEVELS` – a tünetkereső sürgősségi szövegei
- Szolgáltatások: `public/index.html`, `<section id="szolgaltatasok">` – egy kártya egy `<article class="svc">`
- Tünetek: `public/index.html`, `<section id="tunetek">` – új tünethez másolj le egy `<article class="sym">` blokkot
  (egyedi `id`, `data-level`: 1 = ráér, 2 = ne halogasd, 3 = azonnal; `data-service`: melyik szolgáltatást jelölje be az űrlapon)
- Ha a nyitvatartás vagy a telefonszám változik, a `public/index.html`-ben is írd át (a `#kapcsolat` táblázata, a nyitókép tényei,
  a lábléc és a `application/ld+json` rész) – ez a JavaScript nélküli változat és a keresők miatt kell
- Új adatok után a megosztási kép frissítése: `node tools/images.js`

## Honnan jöttek az adatok (élesítés előtt egyeztesd a szervizzel!)

Nyilvános forrásokból (Waze, Arany Vállalkozás díj adatlap, ittlakunk.hu XIII. kerület, bonumventus.hu, keresőtalálatok):

- Cím: 1131 Budapest, Dolmány u. 7. · Telefon: +36 20 322 6614
- Nyitvatartás: hétfőtől péntekig 8:00–18:00, szombaton 8:00–14:00; hétvégén igény esetén megbeszélhető a munkavégzés
- Értékelés: 4,9 / 5, 289 Google-értékelés alapján; Arany Vállalkozás díj
- Parkolás: az utcán fizetős, a saját parkolóban ingyenes, a javításra váró autók díjmentesen parkolnak
- Szolgáltatások a forrásokban: teljes körű átvizsgálás, motor-, fék- és futómű-ellenőrzés, műszaki vizsgáztatás.
  **Az „Időszakos szerviz” (olaj- és szűrőcsere) kártya és a „Műszaki vizsgára felkészítés” megfogalmazás feltételezés** – kérlek, nézd át
- A „Vélemények” szekció a Google-értékelések összefoglalt, visszatérő témáit mutatja, nem szó szerinti idézeteket
- Egy keresőtalálat más címet és számot is említett (1139 Budapest, Pap Károly u. 12., +36 30 849 3538) –
  a legtöbb forrás a Dolmány utcát adja meg, az oldal ezt használja
- A tünetkereső általános, tájékoztató jellegű autós tudnivaló – az oldal ezt ki is írja

## Saját fotók

Ha vannak fotók a műhelyről vagy a munkákról, tedd őket a `public/assets/` mappába, és beépíthetők a nyitóképbe
vagy a szolgáltatás-kártyákba.

## Helyi megtekintés

```sh
python3 -m http.server 8000 -d public
# majd: http://localhost:8000
```
