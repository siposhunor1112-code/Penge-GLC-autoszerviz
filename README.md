# Penge GLC autószerviz – weboldal

Statikus, egyoldalas weboldal a Penge GLC autószerviznek (márkafüggetlen autószerviz, 1131 Budapest, Dolmány u. 7.).
Nincs szükség build lépésre: a `public/` mappa bármilyen statikus tárhelyen kiszolgálható (Cloudflare Workers, Netlify, GitHub Pages).

## Fájlok

- `public/` – maga a weboldal (ez kerül ki a netre):
  - `index.html` – az oldal szerkezete, szövegei, a szolgáltatások és a tünetkereső tartalma
  - `styles.css` – megjelenés (színek a `:root` változókban)
  - `script.js` – elérhetőség, nyitvatartás, a rajz kiemelései, tünetkereső és minden mozgás
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
- Megszólítás: végig magázó, udvarias hangnem

## Szekciók

- **Nyitókép**: „Penge munka.”, rövid bemutatás, Hívás gomb, és egy kódból rajzolt (SVG) SUV-tervrajz, ami betöltéskor
  „megrajzolódik”. Átlátszó rétegként rajta vannak az átvizsgálás fő pontjai, számozva:
  1 Motor (motorblokk a motorháztető alatt), 2 Hűtés (hűtő a hűtőrács mögött), 3 Fékrendszer (féktárcsa és féknyereg
  az első keréken), 4 Futómű (rugó a hátsó keréknél), 5 Kipufogó (katalizátor, dobok, végcső), 6 Diagnosztika
  (OBD-csatlakozó a műszerfal alatt). A lista egy-egy elemére kattintva (vagy magától, sorban) kiemelődik a rész, és
  megjelenik, mit nézünk át rajta. Alatta a tények: 4,9 ★ Google, Arany Vállalkozás díj, nyitvatartás, ingyenes parkolás
- **01 Szolgáltatások**: hat szolgáltatás-kártya
- **02 Így dolgozunk** (világos szekció): telefonos egyeztetés → átvizsgálás → érthető ajánlat → javítás és átadás;
  a vonal görgetésre telik
- **03 Tünetkereső**: 13 gyakori tünet (pl. „Puha a fékpedál”, „Túlmelegszik a motor”, „Kigyulladt a motorhiba-lámpa”),
  mindegyiknél: mi lehet az oka, mit tegyen, és mennyire sürgős (zöld: ráér, sárga: ne halogassa, piros: azonnal).
  Asztali gépen bal oldalt a lista, jobbra a kiválasztott tünet; telefonon lenyíló lista. Mindegyik alatt Hívás gomb
- **04 Vélemények**: a Google-értékelések visszatérő témái
- **05 Időpont-egyeztetés**: **telefonon** – nagy telefonszám, élő nyitva/zárva jelzés, Hívás gomb (számítógépen
  „Szám másolása” is), és egy lista arról, mit érdemes a híváskor kéznél tartani (autó adatai, forgalmi, tünetek,
  figyelmeztető lámpák, előzmények). Nincs űrlap, az oldal semmilyen adatot nem gyűjt
- **06 Hol vagyunk**: élő nyitva/zárva jelzés, nyitvatartás (a mai nap kiemelve), parkolás, útvonal Google Térképpel,
  Apple Térképpel és Waze-zel, térkép kattintásra (addig nem tölt be semmit a Google-tól)
- Telefonon alul mindig ott az **Útvonal** és a **Hívás** gomb
- Telefonra optimalizálva (320 px-től): nagy, legalább 44 px-es érintési felületek, lenyíló tünetlista, a rajz jelölései
  számozva a lista mellett; notch-os telefonokon a szélek szabadon maradnak; aki kikapcsolta az animációkat
  (`prefers-reduced-motion`), annak minden mozdulatlan
- Keresőknek: leírás, megosztási kép (Facebookon, Messengerben szép előnézet), és strukturált adat (`AutoRepair`)
  a nyitvatartással és az értékeléssel

## Tartalom szerkesztése

- `public/script.js` eleje:
  - `SHOP.phone` – telefonszám; ha `null`, eltűnnek a hívás gombok
  - `SHOP.hours` – napokra bontott nyitvatartás; ebből számolja az oldal budapesti idő szerint, hogy most nyitva van-e
  - `LEVELS` – a tünetkereső sürgősségi szövegei
- Szolgáltatások: `public/index.html`, `<section id="szolgaltatasok">` – egy kártya egy `<article class="svc">`
- Tünetek: `public/index.html`, `<section id="tunetek">` – új tünethez másoljon le egy `<article class="sym">` blokkot
  (egyedi `aria-controls` / `id` párral; `data-level` és a pötty színe: 1 = ráér, 2 = ne halogassa, 3 = azonnal)
- A rajz jelölései: `public/index.html`, `<figure class="blueprint">` – a `.bp-part` csoportok az alkatrészek,
  a `.pin` elemek a számok (helyük `--x` / `--y` a rajz szélességének és magasságának %-ában),
  a `data-part-desc` bekezdések a leírások
- Ha a nyitvatartás vagy a telefonszám változik, a `public/index.html`-ben is írja át (a `#kapcsolat` táblázata, a nyitókép
  tényei, a lábléc és a `application/ld+json` rész) – ez a JavaScript nélküli változat és a keresők miatt kell
- Új adatok után a megosztási kép frissítése: `node tools/images.js`

## Honnan jöttek az adatok (élesítés előtt egyeztesse a szervizzel!)

Nyilvános forrásokból (Waze, Arany Vállalkozás díj adatlap, ittlakunk.hu XIII. kerület, bonumventus.hu, keresőtalálatok):

- Cím: 1131 Budapest, Dolmány u. 7. · Telefon: +36 20 322 6614 – **ellenőrizze, hogy ezen a számon egyeztetnek-e időpontot**
- Nyitvatartás: hétfőtől péntekig 8:00–18:00, szombaton 8:00–14:00; hétvégén igény esetén megbeszélhető a munkavégzés
- Értékelés: 4,9 / 5, 289 Google-értékelés alapján; Arany Vállalkozás díj
- Parkolás: az utcán fizetős, a saját parkolóban ingyenes, a javításra váró autók díjmentesen parkolnak
- Szolgáltatások a forrásokban: teljes körű átvizsgálás, motor-, fék- és futómű-ellenőrzés, műszaki vizsgáztatás.
  **Az „Időszakos szerviz” (olaj- és szűrőcsere) kártya és a „Műszaki vizsgára felkészítés” megfogalmazás feltételezés** – kérem, nézze át
- **A szerviz nevében tett ígéretek**, amiket érdemes jóváhagyatni: „sürgős esetben igyekszünk még aznap fogadni”,
  „a javítást csak az Ön jóváhagyása után kezdjük el”, „ha kell, próbaútra visszük az autót”
- A „Vélemények” szekció a Google-értékelések összefoglalt, visszatérő témáit mutatja, nem szó szerinti idézeteket
- Egy keresőtalálat más címet és számot is említett (1139 Budapest, Pap Károly u. 12., +36 30 849 3538) –
  a legtöbb forrás a Dolmány utcát adja meg, az oldal ezt használja
- A tünetkereső és a rajz általános, tájékoztató jellegű autós tudnivaló – az oldal ezt ki is írja

## Saját fotók

Ha vannak fotók a műhelyről vagy a munkákról, tegye őket a `public/assets/` mappába, és beépíthetők a nyitóképbe
vagy a szolgáltatás-kártyákba.

## Helyi megtekintés

```sh
python3 -m http.server 8000 -d public
# majd: http://localhost:8000
```
