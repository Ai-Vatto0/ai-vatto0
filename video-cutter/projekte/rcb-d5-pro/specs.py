# Erzeugt videos/<v>/spec.json aus kompakten Definitionen. "ab" = Wort im VO, ab dem die Szene beginnt (erstes Vorkommen nach der vorigen Szene).
import json, os
MARKUS = {"anbieter": "yapper", "modell": "eleven_v3", "name": "Markus – Young Natural German", "voice_id": "IeQubAjK1ujbppIdhJw4"}
PATRICK = {"anbieter": "yapper", "modell": "eleven_v3", "name": "Patrick – Northern German Chat", "voice_id": "rUxG6T3T35OAyiiJgocG"}
LOGO = {"datei": "assets/rcb-logo-karte.png", "intro": 0, "ende": False}
F = "dji0925-0012"; H = "dji0926-0021"
def T(inhalt, betonung, belege, **kw): return {"inhalt": inhalt, "betonung": betonung, "belege": belege, **kw}
V = {
 "a": dict(titel="Kein Spielzeug – Wiese, Hügel, Waldweg", idee=dict(winkel="pov_erlebnis", zielgruppe="Männer 20–45, wollen Fahrspaß ohne Wackel-Roller", hook="Fahrer rollt über die Wiese direkt auf die Kamera zu – „Bro, du willst einen Roller, der nicht beim ersten Bordstein auseinanderfällt?“", emotion="Freiheit, Action"),
   format="Action-Voiceover-Montage, schneller Schnitt, Speed-Ramp", look="rcb", textposition="oben", stimme=MARKUS,
   vo=[("Bro, du willst einen Roller, der nicht beim ersten Bordstein auseinanderfällt?",["meinung"]),("Dann guck dir den hier an.",["meinung"]),("Wiese, Waldweg, Hügel runter, der zieht einfach durch.",["meinung"]),("500 Watt Motor, Federung vorne und hinten.",["motor_500w","federung"]),("Und trotzdem mit Straßenzulassung.",["abe_20kmh"]),("Kein Plastikbomber, Bro. Ein echtes Teil.",["meinung"]),("Jetzt im TikTok Shop, Link ist unten.",[])],
   sz=[(H,29.8,None,"hook","kenburns_in","zoom",T("KEIN SPIELZEUG",["SPIELZEUG"],["meinung"])),(H,51.2,"Dann","beweis","punch","whip",None),(H,35.0,"Wiese,","emotion","kenburns_in","cut",T("OFFROAD? LÄUFT.",["LÄUFT."],["meinung"]),{"tempo":"ramp"}),(H,63.2,"der","emotion","kenburns_out","flash",None),("foto-federung",0,"500","beweis","kenburns_in","zoom",T("METALL STATT PLASTIK",["METALL"],["metall"])),(H,16.2,"Und","beweis","punch","whip",T("ABE · 20 KM/H",["ABE"],["abe_20kmh"])),(H,24.9,"Kein","emotion","kenburns_in","cut",None),(H,19.8,"Jetzt","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Dein neuer Daily Driver.")),
 "b": dict(titel="Plastikbomber? Dieser nicht.", idee=dict(winkel="einwand", zielgruppe="Käufer, die Angst vor billigen, klapprigen Rollern haben", hook="Nahaufnahme Doppelfederung + „Viele Roller da draußen? Plastikbomber.“", emotion="Vertrauen, Trotz"),
   format="Einwand-Antwort mit Detail-Fotos (Ken Burns), andere Stimme (A/B-Test Patrick)", look="rcb_tag", textposition="unten", stimme=PATRICK,
   vo=[("Viele Roller da draußen? Plastikbomber.",["meinung"]),("Der hier ist anders gebaut.",["meinung"]),("Rahmen und Gabel aus Metall, vorne doppelt gefedert, hinten auch.",["metall","federung"]),("Trägt bis 150 Kilo.",["max_150kg"]),("Und die Zehn-Zoll-Gelreifen dichten kleine Löcher bis drei Millimeter selbst ab.",["gelreifen"]),("Einmal draufgestanden, und Plastik ist für dich erledigt.",["meinung"]),("Jetzt im TikTok Shop.",[])],
   sz=[("foto-front",0,None,"hook","kenburns_in","flash",T("DIESER NICHT.",["NICHT."],["meinung"])),("dji0924-0001-seg2",0,"Der","beweis","punch","zoom",None),("foto-wald2",0,"Rahmen","beweis","kenburns_in","whip",T("MASSIV GEBAUT",["MASSIV"],["meinung"])),("foto-karton",0,"Trägt","beweis","kenburns_in","flash",T("AUCH FÜR KRÄFTIGE FAHRER",["KRÄFTIGE"],["max_150kg"])),("dji0924-0001-seg2",7.8,"Und","beweis","kenburns_out","zoom",None),(F,94.0,"Einmal","emotion","punch","cut",None),("dji0924-0001-seg3",0,"Jetzt","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Rahmen und Gabel aus Metall.")),
 "c": dict(titel="Kurzer Check: Was der RCB draufhat", idee=dict(winkel="feature_demo", zielgruppe="Pendler und Technik-Interessierte, die Ausstattung vergleichen", hook="Display-Nahaufnahme in Sekunde 0 + „Kurzer Check, was der RCB draufhat.“", emotion="Klarheit, Sicherheit"),
   format="Funktions-Check, ruhiger Schnitt ohne Effekte, wenig Text", look="rcb", textposition="unten", stimme=MARKUS,
   vo=[("Kurzer Check, was der RCB draufhat.",["meinung"]),("Display mit drei Fahrstufen, bis 20 Kilometer pro Stunde.",["drei_gaenge","display","abe_20kmh"]),("Doppelbremse vorne und hinten.",["doppelbremse"]),("Scheinwerfer und Rücklicht für den Heimweg im Dunkeln.",["licht"]),("Nach der Fahrt einfach zusammenklappen und verstauen.",["faltbar"]),("Und dank deutscher ABE: Versicherungskennzeichen dran, und ab auf die Straße.",["abe_20kmh"]),("Jetzt im TikTok Shop.",[])],
   sz=[("foto-display",0,None,"hook","kenburns_in","cut",T("DAS STECKT DRIN",["DRIN"],["meinung"])),("foto-pov",0,"Display","detail","none","cut",None),(F,84.0,"Doppelbremse","beweis","none","cut",None),("dji0925-0012-seg2",0.1,"Scheinwerfer","detail","none","cut",None),(F,110.0,"Nach","beweis","none","cut",None),(F,60.5,"Und","beweis","none","cut",T("STRASSENTAUGLICH",["STRASSENTAUGLICH"],["abe_20kmh"])),("foto-wald1",0,"Jetzt","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Mit deutscher ABE.")),
 "d": dict(titel="Feierabendrunde", idee=dict(winkel="alltag", zielgruppe="Berufstätige, die nach der Arbeit abschalten wollen", hook="Abendlicht, Fahrt über den Feldweg + großes RCB-Logo + „Feierabend.“", emotion="Ruhe, Freiheit"),
   format="Stimmungs-Video, lange ruhige Einstellungen, Logo-Intro groß", look="rcb_tag", textposition="oben", stimme=MARKUS, logo={**LOGO, "intro": 1.4, "top": 740},
   vo=[("Feierabend.",["meinung"]),("Handy weg, Roller raus, und einfach los.",["meinung"]),("Noch eine Runde, bevor die Sonne weg ist.",["meinung"]),("Keine Parkplatzsuche, kein Gedränge, nur du und der Feldweg.",["meinung"]),("Mit 20 Sachen, und die Federung bügelt die Huckel einfach weg.",["abe_20kmh","federung"]),("Genau für solche Abende ist der gemacht.",["meinung"]),("Jetzt im TikTok Shop.",[])],
   sz=[("dji0924-0004",9.0,None,"hook","none","cut",T("DEINE ABENDRUNDE",["ABENDRUNDE"],["meinung"])),("foto-abend",0,"Noch","emotion","kenburns_in","cut",None),("dji0924-0004",21.5,"Keine","emotion","none","cut",None),("dji0924-0001-seg2",3.5,"Mit","beweis","none","cut",T("FELDWEG? KEIN THEMA.",["THEMA."],["meinung"])),("dji0924-0001-seg4",0.3,"Genau","emotion","none","cut",None),("dji0924-0004",14.0,"Jetzt","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Für deine Abendrunde.")),
 "e": dict(titel="Wald-Test: Schotter, Wurzeln, Schlaglöcher", idee=dict(winkel="problem_loesung", zielgruppe="Fahrer mit schlechten Wegen, Pendler über Feld- und Waldwege", hook="Fahrt aus dem hellen Waldrand in den Wald + „Schotter, Wurzeln, Schlaglöcher?“", emotion="Souveränität"),
   format="Problem-Lösung, lange Drohnen-Fahrten mit Ken Burns, dunkler Text-Look", look="rcb_dunkel", textposition="unten", stimme=MARKUS,
   vo=[("Schotter, Wurzeln, Schlaglöcher?",["meinung"]),("Mit einem Plastikroller wird das schnell ungemütlich.",["meinung"]),("Der RCB fährt einfach drüber.",["meinung"]),("Zehn-Zoll-Reifen, Federung vorne und hinten und 500 Watt Motor.",["gelreifen","federung","motor_500w"]),("Und mit bis zu 150 Kilo Zuladung nimmt er auch deinen großen Kumpel mit.",["max_150kg"]),("Kurz gesagt: der kann was.",["meinung"]),("Jetzt im TikTok Shop.",[])],
   sz=[(F,18.0,None,"hook","kenburns_in","zoom",T("WALD-TEST",["TEST"],["meinung"])),("dji0925-0012-seg1",1.1,"Der","beweis","none","whip",None),(F,70.0,"Zehn-Zoll-Reifen,","beweis","kenburns_in","flash",T("HARDWARE STATT PLASTIK",["HARDWARE"],["metall"])),(F,106.0,"Und","emotion","none","zoom",None),(F,136.0,"Jetzt","cta","kenburns_in",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Für Wald, Feld und Stadt.")),
}
for vid, d in V.items():
    worte = " ".join(s for s, _ in d["vo"]).split()
    szenen, idx = [], -1
    for z in d["sz"]:
        clip, von, ab, rolle, zoom, ueb, text = z[:7]
        extra = z[7] if len(z) > 7 else {}
        s = {"clip": clip, "von": von, "bis": round(von + 2.5, 3), "rolle": rolle, "zoom": zoom}
        if ueb: s["uebergang"] = ueb
        if ab is not None:
            idx = worte.index(ab, idx + 1); s["ab_wort"] = idx
        if text:
            if any(b in ("gelreifen", "spitze_1600w") for b in text["belege"]): text["bedingung_ok"] = True
            s["text"] = text
        s.update(extra); szenen.append(s)
    t = lambda i: 0.25 + i / 2.75
    for k, s in enumerate(szenen):
        a = 0 if k == 0 else t(s["ab_wort"]) - 0.12
        e = t(szenen[k + 1]["ab_wort"]) - 0.12 if k + 1 < len(szenen) else t(len(worte)) + 1.4
        s["bis"] = round(s["von"] + (e - a) * (1.25 if s.get("tempo") == "ramp" else 1), 3)
    vo = [{"satz": s, "belege": b, **({"bedingung_ok": True} if "gelreifen" in b else {})} for s, b in d["vo"]]
    spec = {"titel": d["titel"], "idee": d["idee"], "format": d["format"], "look": d["look"], "textposition": d["textposition"], "stimme": d["stimme"],
            "logo": d.get("logo", LOGO), "voiceover": vo, "szenen": szenen, "cta": {**d["cta"], "top": 330}}
    os.makedirs(f"videos/{vid}", exist_ok=True)
    json.dump(spec, open(f"videos/{vid}/spec.json", "w"), ensure_ascii=False, indent=2)
    print(vid, len(worte), "Wörter", len(szenen), "Szenen")
