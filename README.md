# RS Dach- und Fassadenreinigung – Website

One-Pager im Apple-Stil mit Scroll-Animationen, Parallax und prozedural gerenderten Grafiken
(keine Stockfotos nötig). Gebaut mit **Vite**, **GSAP** (ScrollTrigger, SplitText) und **Lenis**.

## Start

```bash
npm install
npm run dev       # Entwicklungsserver auf http://localhost:5173
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal ansehen
```

Den Inhalt von `dist/` auf jeden beliebigen Webspace hochladen – es ist eine statische Seite.

## Struktur

```
index.html              Inhalte aller Sektionen (SEO-freundlich im HTML)
impressum.html          Vorlage – gelb markierte Platzhalter ausfüllen!
datenschutz.html        Vorlage – Hosting-Anbieter ergänzen, rechtlich prüfen
src/data/company.js     Firmendaten: Telefon, Öffnungszeiten, Instagram, Adresse
src/js/
  textures.js           Prozedurale Dach-, Fassaden- und Solar-Texturen (vorher/nachher)
  clean-scene.js        Gepinnte Szene: Hochdrucklanze reinigt das Dach beim Scrollen
  hero.js               Intro, Allgäu-Dorf-Silhouette, Parallax, Wassertropfen-Partikel
  services.js           Horizontal scrollende Leistungskarten mit Wisch-Reinigung
  pressure.js           „250 bar“-Zoom mit Druckring + Manometer
  compare.js            Vorher/Nachher-Slider (Dach / Fassade / Solar)
  reviews.js            Google-Bewertungen, Sterne, geschwindigkeitsabhängiges Laufband
  instagram.js          iPhone-Mockup, 2-Klick-Einbindung des Instagram-Profils
  hours.js              Live-Status „Jetzt geöffnet“ (Zeitzone Europe/Berlin)
  nav.js, cursor.js, magnetic.js, reveal.js, preloader.js, smooth-scroll.js
src/styles/             base, chrome (Nav/Footer/Cursor), hero, sections
```

## Anpassen

- **Öffnungszeiten, Telefon, Instagram:** `src/data/company.js`
- **Einzelne Instagram-Beiträge einbetten:** Beitrags-URLs in `company.instagram.posts` eintragen.
  Sie werden nach dem Klick auf „Live-Feed laden“ unter dem iPhone angezeigt.
- **Echte Fotos:** Die Vorher/Nachher-Grafiken sind Illustrationen. Für echte Bilder in `compare.js`
  statt `renderTexture(...)` einfach zwei `Image`-Objekte auf die Canvas zeichnen.

## Datenschutz

- Schrift (Inter) wird lokal ausgeliefert – keine Verbindung zu Google Fonts.
- Keine Cookies, kein Tracking.
- Instagram wird erst nach aktivem Klick geladen (2-Klick-Lösung).
- Google Maps ist nur verlinkt, nicht eingebettet.

## Barrierefreiheit

- `prefers-reduced-motion` wird respektiert (kein Preloader, kein Smooth-Scroll, keine Dauer-Animationen).
- Vorher/Nachher-Slider per Tastatur bedienbar (verstecktes `input[type=range]`).
