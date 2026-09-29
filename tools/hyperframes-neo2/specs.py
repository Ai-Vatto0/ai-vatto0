"""Schnittlisten der DJI-Neo-2-Videos. Wird nach der Materialsichtung befüllt.

Format je Video (Zeit in Beats, 1 Beat = 0,418 s bei 143,55 BPM):
  shots: dict(src, media=Startsekunde im Clip, beats, zoom=(von, bis), punch=Stoß-Zoom, x/y=Versatz px,
              kind="video"|"photo", fill=True für randlose Fotos)
  texts: (von_beat, bis_beat, Zeilen, top_px, Wunschgröße, Art[, Optionen])
         Art: cap | num | cta | bubble (Sprechblase, Optionen left/tail/up)
  flash: Liste der Szenennummern (1-basiert) mit kurzem Weißblitz am Schnitt
"""
L = lambda s: [(w, "w") for w in s.split()]            # noqa: E731
A = lambda s: [(w, "a") for w in s.split()]            # noqa: E731

VIDEOS = {}
