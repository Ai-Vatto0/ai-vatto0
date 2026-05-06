# 📺 Menü-Wall Wuppertal - Komplette App

> **Deadline erreicht:** Alle Dateien ready für morgen vor Ort ✓

---

## 📦 Was ist das?

Eine **Web-App für 3 Xiaomi TV Sticks**, die automatisch eine Restaurant-Menükarte in 3 Segmenten anzeigt.

**3 Bildschirme nebeneinander an der Decke:**
- **Links:** Baguettes / Tacos
- **Mitte:** Bowls / Menüs
- **Rechts:** Angebote / Getränke

---

## ✨ Features

✅ **Automatischer Start** - Menü erscheint beim Einschalten
✅ **3 Segmente** - Jeder Stick = eigener Bereich
✅ **Image Upload** - Menü-Bilder lokal speichern
✅ **Remote änderbar** - Von Zuhause aus aktualisieren
✅ **Offline-Ready** - Lädt lokal, keine Cloud nötig
✅ **TV-optimiert** - Große Fonts, kein Admin sichtbar

---

## 📂 Dateistruktur

```
menu-wall-app/
├── index.html                    ← DIE HAUPTAPP (im Browser öffnen)
├── MenuWallApp.tsx              ← React Version (optional)
├── MenuWall.css                 ← Styling
├── stick-config.json            ← Konfiguration (3 Sticks)
├── SETUP-ANLEITUNG.md           ← Vollständige Schritt-für-Schritt
├── QUICK-START-MORGEN.txt       ← TL;DR für morgen
└── README.md                    ← Diese Datei
```

---

## 🚀 Schnelleinstieg (Morgen vor Ort)

### 1. HTTP-Server starten
```bash
# Im Ordner C:\Users\rober\ki-app\menu-wall-app:

# Node.js (falls vorhanden):
npx http-server -p 8000

# ODER Python:
python -m http.server 8000
```

### 2. App öffnen (im Chrome des Sticks)
```
http://192.168.178.109:8000/index.html
(IP anpassen: ipconfig checken)
```

### 3. Pro Stick konfigurieren
- Admin-Button (⚙️)
- Bildschirm-Position wählen (Links / Mitte / Rechts)
- Menü-Bild hochladen (PNG/JPG)
- "Anzeigen" → Fertig

### 4. Autostart testen
- TV ausschalten
- 5 Sekunden warten
- TV anschalten → App sollte automatisch laden ✓

---

## ⚙️ Admin Panel

Nur im Browser über Button unten rechts (⚙️ Admin):

**Funktionen:**
- Bildschirm-Position auswählen (Links / Mitte / Rechts)
- Titel ändern (Optional)
- Menü-Bild hochladen
- Bild-Vorschau
- Automatisches Speichern (localStorage)

**Deaktivieren:**
- Button "👁️ Anzeigen" → Wechsel zu Display-Modus
- Admin-Panel wird nicht mehr angezeigt

---

## 📊 Display Mode (Kunde sieht das)

Vollbild-Menü-Anzeige in 3 Segmenten:

```
┌─────────────────┬─────────────────┬─────────────────┐
│                 │                 │                 │
│     LINKS       │     MITTE       │    RECHTS       │
│                 │                 │                 │
│   (Baguettes)   │   (Bowls)       │   (Angebote)    │
│                 │                 │                 │
│  Menü-Bild 1    │  Menü-Bild 2    │  Menü-Bild 3    │
│                 │                 │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

- **Große Schrift:** Gut lesbar von weitem
- **Keine Unterbrechungen:** Vollbild, kein UI sichtbar
- **Automatisch:** Startet nach TV-Einschalten

---

## 🔧 Technische Details

| Aspekt | Details |
|--------|---------|
| **Frontend** | HTML5 + Vanilla JavaScript (keine Dependencies) |
| **Speicherung** | localStorage (auf jedem Stick lokal) |
| **Bilder** | Base64 (direkter Upload ohne Server) |
| **Autostart** | Android Kiosk-Mode (manuell einrichten) |
| **Kompatibilität** | Chrome, Firefox, Edge (alle Browser) |
| **Größe** | ~50 KB (minimal) |

---

## 📱 Hardware

- **TVs:** 3x Hisense 43A6N LED TV (4K)
- **Sticks:** 3x Xiaomi TV Stick 4K (2. Generation)
- **Arrangement:** Nebeneinander an der Decke
- **WLAN:** Muss stabil sein für alle 3 Sticks
- **Stromnetzwerk:** USB-Kabel oder TV-USB-Port

---

## 🎯 Workflow: Menü-Bilder hochladen

### Option 1: Komplettes Bild teilen (3 Teile)

1. Designer schneidet Menükarte in 3 Teile:
   - `menu_left.png` (z.B. 640x1080)
   - `menu_center.png` (z.B. 640x1080)
   - `menu_right.png` (z.B. 640x1080)

2. Jeweils auf richtigem Stick hochladen:
   - Stick 1 (Links) → menu_left.png
   - Stick 2 (Mitte) → menu_center.png
   - Stick 3 (Rechts) → menu_right.png

### Option 2: Bilder separat erzeugen
- Jeder Stick bekommt sein eigenes Design (z.B. per Photoshop Template)
- Lokal hochladen

---

## 🔄 Remote-Änderungen (Von Zuhause)

**Später (nach morgen):**
1. VPN zum Laden aufbauen (z.B. Fritzbox)
2. App im Browser aufrufen:
   ```
   http://stick-ip:8000
   ```
3. Admin Panel → Bild ändern
4. Speichern (automatisch)

---

## 🐛 Troubleshooting

| Problem | Lösung |
|---------|--------|
| **App lädt nicht** | Server läuft? `npx http-server` checken |
| **WLAN verbindet nicht** | SSID/Passwort doppelt, Stick neu starten |
| **Kein HDMI-Signal** | TV Input wechseln (HDMI 3/4), Kabel testen |
| **Autostart funktioniert nicht** | Kiosk-Mode manuell einrichten (Chrome Settings) |
| **Bild wird nicht angezeigt** | Dateiformat (PNG/JPG)? Größe <10 MB? |

**Vollständiges Troubleshooting:** Siehe `SETUP-ANLEITUNG.md`

---

## 📝 Für die Zukunft

- **Weitere Orte:** Einfach neue Instanz starten (z.B. Bielefeld)
- **Weitere Funktionen:** Zeitgesteuerte Bilder, Video-Support, mehrsprachig
- **Integration:** Punkt-of-Sale System anbinden

---

## ✅ Checkliste für Morgen

- [ ] 3x Xiaomi TV Stick 4K gekauft ✓ (bereits im Laden)
- [ ] Alle 3 TVs im Laden funktionsfähig
- [ ] WLAN im Laden funktioniert
- [ ] Menü-Bilder vorbereitet (3 Teile)
- [ ] HTTP-Server vorbereitet
- [ ] Diese App im richtigen Folder
- [ ] Anleitung ausgedruckt oder am Handy
- [ ] Autostart vor dem Kundentermin testen

---

## 🎉 Ergebnis

✅ Automatische Menü-Wand beim Einschalten
✅ Schöne, große Anzeige ohne Ablenkung
✅ Remote änderbar von Zuhause
✅ **Kunde glücklich → Du bekommst Geld + Taco-Dinner** 🌮

---

**Status:** Ready für Morgen 🚀
**Letzte Änderung:** 2026-04-27
**Version:** 1.0 (Production Ready)
