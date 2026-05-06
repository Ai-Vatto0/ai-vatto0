# 🍔 Menü-Wall Wuppertal - Setup-Anleitung für Morgen

**Zeitrahmen:** ~45-60 Min für alle 3 Sticks inkl. Test

---

## Phase 1: Vorbereitung (Vor Ort, 10 Min)

### Schritt 1: Sticks auspacken & anschließen
- [ ] 3x Xiaomi TV Stick 4K aus der Verpackung
- [ ] Jeden Stick mit dem **HDMI-Anschluss** des entsprechenden Fernsehers verbinden
- [ ] USB-Kabel von Stick zum Netzteil (oder USB-Port des TVs testen)
- [ ] **WICHTIG:** TV muss auf richtigen HDMI-Eingang gestellt sein (meist HDMI 3 oder 4)

### Schritt 2: Sticks mit WLAN verbinden
- [ ] Jeden Stick hochfahren (grüne LED blinkt)
- [ ] Via Fernbedienung zu **Settings** → **Network** → **WiFi**
- [ ] Lade-WLAN auswählen + Passwort
- [ ] **Alle 3 Sticks mit WLAN verbinden** (nacheinander oder parallel)
- [ ] Bestätigung: Kleine Netzwerkverbindung auf dem Screen sichtbar

### Schritt 3: Chrome Browser aktivieren
- [ ] Auf jedem Stick **Chrome** installieren oder öffnen
  - Play Store → Chrome suchen → Install
  - ODER: Chrome sollte bereits vorinstalliert sein
- [ ] Chrome öffnen

---

## Phase 2: App laden (Pro Stick, 5 Min)

### Schritt 4: Menu Wall App öffnen
**OPTION A: Lokal vom Computer (schnellste Methode)**
```bash
# Am Windows-Computer:
cd C:\Users\rober\ki-app\menu-wall-app
# HTTP Server starten (Node.js falls vorhanden):
npx http-server -p 8000
# ODER Python:
python -m http.server 8000
```

**Dann in Chrome des Sticks:**
- Adressleiste antippen
- `http://COMPUTER-IP:8000/index.html` eingeben
  - COMPUTER-IP = Windows-IP (z.B. 192.168.178.109)
  - Siehe: Settings → Network → IP Address

**OPTION B: Online-Version (falls offline nicht funktioniert)**
- App später auf Server deployen
- Für Morgen: Lokal ist schneller

### Schritt 5: Per Stick konfigurieren
**Auf jedem Stick einzeln:**

1. App laden in Chrome
2. **Admin-Button** drücken (unten rechts: ⚙️ Admin)
3. **Bildschirm-Position wählen:**
   - TV 1 (Links): **Links** Button
   - TV 2 (Mitte): **Mitte** Button
   - TV 3 (Rechts): **Rechts** Button

4. **Titel eingeben** (Optional, Standard ist OK):
   - TV 1: "Baguettes / Tacos"
   - TV 2: "Bowls / Menüs"
   - TV 3: "Angebote / Getränke"

5. **Menü-Bild hochladen:**
   - "Menü-Bild hochladen" Button
   - Die entsprechende PNG/JPG der Menükarte (dein Kundenbild in 3 Teilen)
   - Warten bis Bild in Vorschau angezeigt wird

6. **Zurück zu Display:**
   - "👁️ Anzeigen" Button
   - Menü sollte auf dem entsprechenden TV sichtbar sein ✓

---

## Phase 3: Test & Autostart (10-15 Min)

### Schritt 6: Autostart simulieren
**Ziel:** App startet automatisch, wenn TV morgens angeschaltet wird

**Schritt 6a: Chrome Kiosk-Modus einrichten**

Auf **jedem Stick einzeln:**

1. Chrome öffnen und zur App navigieren:
   `http://192.168.178.109:8000/index.html`

2. URL einprägen (oder Pin bar)

3. Chrome beenden

4. Zu **Settings** → **Apps** → **Chrome**
   - "Default apps" / "Set as default"
   - Oder Launcher konfigurieren

5. **Alternativ (Sicherer):** Launcher-App nutzen
   - Play Store: "Fully Kiosk Browser" (kostenlos)
   - Damit App als Kiosk starten

**Schritt 6b: TV-Startup testen**
- [ ] TV komplett ausschalten (Strom aus)
- [ ] 5 Sekunden warten
- [ ] TV wieder anschalten
- [ ] Beobachten:
  - Stick startet hoch (LED grün)
  - Chrome öffnet sich
  - App lädt Menü
  - **Menü erscheint auf dem Screen**

⏱️ Das sollte max. 30-40 Sekunden dauern

---

## Phase 4: Finale Anpassungen (10 Min)

### Schritt 7: Menü-Bilder hochladen
**Falls noch nicht gemacht:**

1. Menükarte in 3 Teile aufteilen (Grafiker/Designer):
   - `menu_left.png` (Baguettes / Tacos)
   - `menu_center.png` (Bowls / Menüs)
   - `menu_right.png` (Angebote / Getränke)

2. Auf jedem Stick über Admin-Panel hochladen:
   - Admin → Stick auswählen → Bild hochladen
   - **Wichtig:** Die **richtigen** Bilder auf den **richtigen** Sticks!

### Schritt 8: Langzeit-Test
- [ ] App 5 Minuten im Display-Modus laufen lassen
- [ ] Auf Flimmern oder Fehler prüfen
- [ ] WLAN-Verbindung stabil?
- [ ] Bilder werden korrekt angezeigt?

---

## Phase 5: Remote-Verwaltung (Setup für später)

### So änderst du Inhalte von Zuhause:

1. **Im Laden auf jedem Stick:**
   - "Admin" Button drücken
   - Neues Menü-Bild hochladen
   - Änderungen werden **sofort lokal gespeichert**

2. **Von Zuhause aus (später):**
   - VPN zum Laden aufbauen (z.B. via Fritzbox)
   - App im Browser unter `http://stick-ip:8000` aufrufen
   - Admin → Bild ändern
   - Speichern

---

## ⚙️ Troubleshooting

### Problem: Stick startet nicht / Keine HDMI
**Lösung:**
- USB-Kabel checken
- Netzteil prüfen
- TV HDMI-Eingang testen (mit anderen Geräten)
- Stick in anderen TV-Eingang probieren

### Problem: WLAN verbindet nicht
**Lösung:**
- SSID + Passwort doppelt checken
- Router in der Nähe?
- Andere Sticks können verbinden?
- Router neustarten

### Problem: App lädt nicht
**Lösung:**
- Lokal-Server läuft? → `npx http-server -p 8000`
- Computer-IP korrekt? → `ipconfig` checken
- Firewall blockiert? → Windows Firewall deaktivieren (temporär)

### Problem: Bild wird nicht angezeigt
**Lösung:**
- Dateiformat OK? (PNG/JPG)
- Dateigröße nicht zu groß? (< 10 MB)
- localStorage funktioniert? → Browser Cache clearen

---

## 📱 Wichtige Nummern/Info

- **WLAN SSID:** [Lade-WLAN Name]
- **WLAN Passwort:** [Passwort]
- **Computer IP:** 192.168.178.109 (oder `ipconfig` checken)
- **App-URL:** http://192.168.178.109:8000/index.html

---

## ✅ Checkliste für morgen

- [ ] 3x Xiaomi TV Stick gekauft
- [ ] Alle 3 TVs im Laden funktionsfähig
- [ ] Lade-WLAN funktioniert
- [ ] Menü-Bilder in 3 Teile aufgeteilt (PNG/JPG)
- [ ] HTTP-Server auf Computer bereit
- [ ] index.html + Bilder im richtigen Folder
- [ ] **Erste Konfiguration vor Ort durchführen**
- [ ] Autostart testen
- [ ] Admin-Panel zeigen (remote ändern testen)

---

## 🎉 Kunde sieht:

1. **Morgens:** TVs anschalten → Menü-Wand erscheint automatisch ✓
2. **Tagsüber:** Schöne, große Menü-Anzeige ohne Unterbrechungen ✓
3. **Remote:** Du kannst Bilder von Zuhause aus ändern ✓
4. **Zukunft:** Weitere Orte sind einfach zu erweitern ✓

**Viel Erfolg morgen! 🍔🎬**
