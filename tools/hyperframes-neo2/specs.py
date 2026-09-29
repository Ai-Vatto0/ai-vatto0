"""Schnittlisten der DJI-Neo-2-Videos (Auftrag Vatto 29.09.2026: 5 Videos, max. 20 s, Hook in Sekunde 1,
wenig Gesicht, knallige Texte, lustige Sprüche bei „Drohne filmt Drohne“).

Format je Video (Zeit in Beats, 1 Beat = 0,418 s bei 143,55 BPM):
  shots: dict(src, media=Startsekunde im Zwischenclip, beats, zoom=(von, bis), punch=Stoß-Zoom, x/y=Versatz px,
              kind="video"|"photo", fill=True für randlose Fotos)
  texts: (von_beat, bis_beat, Zeilen, top_px, Wunschgröße, Art[, Optionen])
         Art: cap | num | cta | bubble (Sprechblase, Optionen left/tail/up)
  flash: Szenennummern (1-basiert) mit kurzem Weißblitz am Schnitt

Aussagen nur aus memory/projekte/dji-neo-2.md (grün): 151 g, Start aus der Hand, folgt automatisch,
8 Richtungen, bis zu 12 m/s (~43 km/h), 4K, mechanischer 2-Achsen-Gimbal, Rocket/Dronie (QuickShots),
Steuerung per Handy/Geste, Rückkehr bei niedrigem Akku. Keine Preise, keine Reichweite, kein „crashsicher“.
"""
L = lambda s: [(w, "w") for w in s.split()]            # noqa: E731
A = lambda s: [(w, "a") for w in s.split()]            # noqa: E731
B = lambda s: [(w, "w") for w in s.split()]            # Sprechblase (dunkle Schrift)  # noqa: E731

CTA = lambda b0, b1: (b0, b1, [A("JETZT IM"), A("TIKTOK SHOP.")], 1000, 128, "cta", {"arrow_top": 1300})  # noqa: E731

VIDEOS = {
    # ---------------- 1: Unboxing, aber mit Action ----------------
    "neo2-v1-unboxing": dict(
        title="Neo 2 – Unboxing mit Action",
        shots=[
            dict(src="n_unbox.mp4", media=7.0, beats=3, zoom=(1.0, 1.06), punch=1.18),
            dict(src="n_rocket_top.mp4", media=0.4, beats=2, zoom=(1.0, 1.08)),
            dict(src="n_behind_sunset.mp4", media=4.0, beats=2, zoom=(1.05, 1.1)),
            dict(src="n_side.mp4", media=5.0, beats=3, zoom=(1.0, 1.05)),
            dict(src="n_unbox.mp4", media=31.5, beats=5, zoom=(1.0, 1.08), punch=1.12),
            dict(src="n_unbox.mp4", media=45.0, beats=4, zoom=(1.0, 1.05)),
            dict(src="n_palm.mp4", media=1.2, beats=5, zoom=(1.0, 1.06)),
            dict(src="n_launch_sky.mp4", media=0.2, beats=3, zoom=(1.0, 1.04)),
            dict(src="n_behind_field.mp4", media=0.2, beats=4, zoom=(1.0, 1.06)),
            dict(src="p_drohne_box.jpg", kind="photo", fill=True, beats=8, zoom=(1.0, 1.08)),
        ],
        flash=[2, 5],
        texts=[
            (0, 3, [L("WAS IN"), A("DIESER BOX"), L("STECKT?")], 230, 130, "cap"),
            (3, 10, [L("EINE DROHNE,"), A("DIE DIR FOLGT.")], 230, 120, "cap"),
            (10, 15, [L("NUR"), A("151 GRAMM.")], 230, 140, "cap"),
            (15, 19, [A("AUSGEPACKT."), L("LOS GEHT'S.")], 230, 120, "cap"),
            (19, 27, [L("STARTET AUS"), A("DEINER HAND.")], 230, 120, "cap"),
            (27, 31, [L("FILMT IN"), A("4K.")], 230, 150, "cap"),
            CTA(31.2, 39),
        ],
    ),
    # ---------------- 2: Mein neuer Kameramann (hinten / vorne / seitlich) ----------------
    "neo2-v2-kameramann": dict(
        title="Neo 2 – Mein neuer Kameramann",
        shots=[
            dict(src="n_phone_cam.mp4", media=5.6, beats=3, zoom=(1.0, 1.05)),
            dict(src="n_phone_cam.mp4", media=9.5, beats=2, zoom=(1.05, 1.12)),
            dict(src="n_behind_field.mp4", media=0.2, beats=4, zoom=(1.0, 1.06)),
            dict(src="n_front_forest.mp4", media=1.0, beats=4, zoom=(1.0, 1.05)),
            dict(src="n_side.mp4", media=2.5, beats=4, zoom=(1.0, 1.05)),
            dict(src="n_forest_behind.mp4", media=2.0, beats=4, zoom=(1.0, 1.05)),
            dict(src="n_behind_sunset2.mp4", media=10.0, beats=5, zoom=(1.0, 1.06)),
            dict(src="n_rocket_top2.mp4", media=3.0, beats=3, zoom=(1.0, 1.05)),
            dict(src="n_palm.mp4", media=3.0, beats=8, zoom=(1.0, 1.06)),
        ],
        flash=[2, 3],
        texts=[
            (0, 5, [L("MEIN NEUER"), A("KAMERAMANN.")], 230, 140, "cap"),
            (5, 9, [L("FOLGT"), A("VON HINTEN.")], 230, 130, "cap"),
            (9, 13, [A("VON VORNE.")], 230, 140, "cap"),
            (13, 17, [L("VON DER"), A("SEITE.")], 230, 140, "cap"),
            (17, 21, [A("8 RICHTUNGEN."), L("AUTOMATISCH.")], 230, 120, "cap"),
            (21, 26, [L("HÄLT MIT BIS ZU"), A("43 KM/H.")], 230, 120, "cap"),
            (26, 29, [L("UND"), A("VON OBEN.")], 230, 140, "cap"),
            CTA(29.2, 37),
        ],
    ),
    # ---------------- 3: Zuckerbuckel runter – Action ----------------
    "neo2-v3-zuckerbuckel": dict(
        title="Neo 2 – Zuckerbuckel runter",
        shots=[
            dict(src="n_launch_sky.mp4", media=0.2, beats=3, zoom=(1.0, 1.05)),
            dict(src="n_hill_wide.mp4", media=7.0, beats=5, zoom=(1.0, 1.05), punch=1.15),
            dict(src="n_hill_wide.mp4", media=10.0, beats=4, zoom=(1.0, 1.05)),
            dict(src="n_rocket_top2.mp4", media=2.0, beats=4, zoom=(1.0, 1.06)),
            dict(src="n_behind_sunset2.mp4", media=20.0, beats=4, zoom=(1.0, 1.05)),
            dict(src="n_side.mp4", media=9.0, beats=4, zoom=(1.0, 1.05)),
            dict(src="n_forest_behind.mp4", media=4.0, beats=4, zoom=(1.0, 1.05)),
            dict(src="n_fly_car.mp4", media=5.6, beats=8, zoom=(1.0, 1.05)),
        ],
        flash=[2, 4],
        texts=[
            (0, 3, [L("BERG RUNTER."), A("UND DIE DROHNE?")], 230, 120, "cap"),
            (3, 12, [A("BLEIBT DRAN.")], 230, 140, "cap"),
            (12, 16, [A("ROCKET"), L("MODUS.")], 230, 140, "cap"),
            (16, 20, [L("FILMT IN"), A("4K.")], 230, 150, "cap"),
            (20, 24, [L("ALLES"), A("AUTOMATISCH.")], 230, 130, "cap"),
            (24, 28, [L("MECHANISCHER"), A("GIMBAL.")], 230, 120, "cap"),
            CTA(28.2, 36),
        ],
    ),
    # ---------------- 4: Nur dein Handy + Akku leer ----------------
    "neo2-v4-handy": dict(
        title="Neo 2 – Nur dein Handy",
        shots=[
            dict(src="n_palm.mp4", media=0.2, beats=3, zoom=(1.0, 1.06), punch=1.15),
            dict(src="n_app_modes.mp4", media=5.6, beats=3, zoom=(1.0, 1.0)),
            dict(src="n_app_modes.mp4", media=2.9, beats=3, zoom=(1.0, 1.0)),
            dict(src="n_rocket_top.mp4", media=0.4, beats=6, zoom=(1.0, 1.08)),
            dict(src="n_akku.mp4", media=12.8, beats=5, zoom=(1.0, 1.0)),
            dict(src="n_akku.mp4", media=17.0, beats=4, zoom=(1.0, 1.0)),
            dict(src="n_behind_sunset.mp4", media=14.0, beats=4, zoom=(1.0, 1.05)),
            dict(src="n_palm.mp4", media=3.5, beats=8, zoom=(1.0, 1.06)),
        ],
        flash=[4],
        texts=[
            (0, 3, [L("KEIN CONTROLLER."), A("NUR DEIN HANDY.")], 230, 110, "cap"),
            (3, 6, [A("MODUS"), L("WÄHLEN.")], 190, 130, "cap"),
            (6, 9, [A("START"), L("DRÜCKEN.")], 190, 130, "cap"),
            (9, 15, [L("SIE"), A("MACHT DEN REST.")], 230, 120, "cap"),
            (15, 20, [A("AKKU"), L("FAST LEER?")], 190, 130, "cap"),
            (20, 24, [L("FLIEGT"), A("VON SELBST"), L("ZURÜCK.")], 190, 120, "cap"),
            (24, 28, [L("FOLGT DIR"), A("AUTOMATISCH.")], 230, 120, "cap"),
            CTA(28.2, 36),
        ],
    ),
    # ---------------- 5: Wenn deine Drohne reden könnte (lustig) ----------------
    "neo2-v5-hallo": dict(
        title="Neo 2 – Wenn deine Drohne reden könnte",
        shots=[
            dict(src="n_phone_cam.mp4", media=4.8, beats=5, zoom=(1.0, 1.05)),
            dict(src="n_wave.mp4", media=0.3, beats=5, zoom=(1.0, 1.06)),
            dict(src="n_behind_sunset.mp4", media=8.0, beats=5, zoom=(1.0, 1.05)),
            dict(src="n_gesture.mp4", media=1.0, beats=5, zoom=(1.0, 1.05)),
            dict(src="n_rocket_top.mp4", media=0.4, beats=4, zoom=(1.0, 1.08)),
            dict(src="n_akku.mp4", media=12.8, beats=4, zoom=(1.0, 1.0)),
            dict(src="n_fly_car.mp4", media=6.0, beats=8, zoom=(1.0, 1.05)),
        ],
        flash=[5],
        texts=[
            (0, 5, [L("WENN DEINE DROHNE"), A("REDEN KÖNNTE")], 200, 110, "cap"),
            (1, 5, [B("Hi! Wie geht's dir?")], 590, 72, "bubble", {"left": 220, "tail": 200}),
            (5, 10, [B("Gut! Und dir?")], 450, 72, "bubble", {"left": 400, "tail": 150}),
            (10, 15, [B("Ich flieg hier nur rum."), B("Und folg dir mal ...")], 220, 70, "bubble", {"left": 80, "tail": 360}),
            (10, 15, [L("FOLGT DIR"), A("AUTOMATISCH.")], 1150, 110, "cap"),
            (15, 20, [B("Ok ok,"), B("ich komm ja schon!")], 240, 72, "bubble", {"left": 120, "tail": 330}),
            (15, 20, [A("GESTEN"), L("STEUERUNG.")], 1150, 120, "cap"),
            (20, 24, [B("Und tschüss!")], 300, 80, "bubble", {"left": 320, "tail": 120}),
            (24, 28, [B("Akku fast leer ..."), B("ich flieg heim.")], 180, 72, "bubble", {"left": 120, "tail": 330}),
            CTA(28.2, 36),
        ],
    ),
}
