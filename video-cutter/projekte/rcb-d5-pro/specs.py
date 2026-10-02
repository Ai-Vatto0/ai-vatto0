# Erzeugt videos/<v>/spec.json aus kompakten Definitionen. "ab" = Wort im VO, ab dem die Szene beginnt (erstes Vorkommen nach der vorigen Szene).
import json, os
MARKUS = {"anbieter": "yapper", "modell": "eleven_v3", "name": "Markus – Young Natural German", "voice_id": "IeQubAjK1ujbppIdhJw4"}
PATRICK = {"anbieter": "yapper", "modell": "eleven_v3", "name": "Patrick – Northern German Chat", "voice_id": "rUxG6T3T35OAyiiJgocG"}
LOGO = {"datei": "assets/rcb-logo-karte.png", "intro": 0, "ende": False}
F = "dji0925-0012"; H = "dji0926-0021"
def ST(zahl, einheit, label, belege): return {"zahl": zahl, "einheit": einheit, "label": label, "belege": belege, **({"bedingung_ok": True} if "gelreifen" in belege else {})}
def T(inhalt, betonung, belege, **kw): return {"inhalt": inhalt, "betonung": betonung, "belege": belege, **kw}
V = {
 "a": dict(titel="Kein Spielzeug – Wiese, Hügel, Waldweg", idee=dict(winkel="pov_erlebnis", zielgruppe="Männer 20–45, wollen Fahrspaß ohne Wackel-Roller", hook="Fahrer rollt über die Wiese direkt auf die Kamera zu – „Bro, du willst einen Roller, der nicht beim ersten Bordstein auseinanderfällt?“", emotion="Freiheit, Action"),
   format="Action-Voiceover-Montage, schneller Schnitt, Speed-Ramp", look="rcb", textposition="oben", stimme=MARKUS,
   vo=[("Bro, du willst einen Roller, der nicht beim ersten Bordstein auseinanderfällt?",["meinung"]),("Dann guck dir den hier an.",["meinung"]),("Wiese, Waldweg, Hügel runter, der zieht einfach durch.",["meinung"]),("500 Watt Motor, Federung vorne und hinten.",["motor_500w","federung"]),("Und trotzdem mit Straßenzulassung.",["abe_20kmh"]),("Kein Plastikbomber, Bro. Ein echtes Teil.",["meinung"]),("Jetzt im TikTok Shop, Link ist unten.",[])],
   sz=[(H,29.8,None,"hook","kenburns_in","zoom",T("KEIN SPIELZEUG",["SPIELZEUG"],["meinung"])),("foto-wald1",0,"ersten","detail","kenburns_in","whip",None),(H,35.0,"Wiese,","emotion","kenburns_in","cut",T("OFFROAD? LÄUFT.",["LÄUFT."],["meinung"]),{"tempo":"ramp"}),("dji0924-0004",17.1,"der","emotion","kenburns_out","flash",None),("foto-federung",0,"500","beweis","kenburns_in","zoom",T("METALL STATT PLASTIK",["METALL"],["metall"])),("foto-display",0,"Und","beweis","punch","whip",T("ABE · 20 KM/H",["ABE"],["abe_20kmh"])),(H,53.0,"Kein","emotion","kenburns_in","cut",None),("foto-abend-endkarte",0,"Jetzt","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Dein neuer Daily Driver.")),
 "b": dict(titel="Plastikbomber? Dieser nicht.", idee=dict(winkel="einwand", zielgruppe="Käufer, die Angst vor billigen, klapprigen Rollern haben", hook="Nahaufnahme Doppelfederung + „Viele Roller da draußen? Plastikbomber.“", emotion="Vertrauen, Trotz"),
   format="Einwand-Antwort mit Detail-Fotos (Ken Burns), andere Stimme (A/B-Test Patrick)", look="rcb_tag", textposition="unten", stimme=PATRICK, schrift_alt=True,
   vo=[("Viele Roller da draußen? Plastikbomber.",["meinung"]),("Der hier ist anders gebaut.",["meinung"]),("Rahmen und Gabel aus Metall, vorne doppelt gefedert, hinten auch.",["metall","federung"]),("Trägt bis 150 Kilo.",["max_150kg"]),("Und die Zehn-Zoll-Gelreifen dichten kleine Löcher bis drei Millimeter selbst ab.",["gelreifen"]),("Einmal draufgestanden, und Plastik ist für dich erledigt.",["meinung"]),("Jetzt im TikTok Shop.",[])],
   sz=[("foto-front",0,None,"hook","kenburns_in","flash",T("DIESER NICHT.",["NICHT."],["meinung"])),("dji0924-0001-seg2",0,"Der","beweis","punch","zoom",None),("foto-wald2",0,"Rahmen","beweis","kenburns_in","whip",T("MASSIV GEBAUT",["MASSIV"],["meinung"])),("foto-karton",0,"Trägt","beweis","kenburns_in","flash",T("AUCH FÜR KRÄFTIGE FAHRER",["KRÄFTIGE"],["max_150kg"])),("dji0924-0001-seg2",7.8,"Und","beweis","kenburns_out","zoom",None),("foto-abend",0,"Einmal","emotion","kenburns_out","cut",None),("dji0924-0001-seg3",0,"Jetzt","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Rahmen und Gabel aus Metall.")),
 "f": dict(titel="Groß und schwer? Kein Problem.", idee=dict(winkel="problem_loesung", zielgruppe="große, schwere Fahrer (100–150 kg), die bei Plastikrollern Angst haben", hook="Slam: Weißblitz + Wackler + Punch-In auf den RCB am Felsen mit Licht an + „Stopp!“ + Text „ÜBER 100 KILO?“", emotion="endlich ernst genommen"),
   format="Problem-Lösung für schwere Fahrer: Felsen-Rundgang, Zeitlupe, Daten-Karten, Fahrt von hinten", look="rcb_dunkel", textposition="unten", stimme=MARKUS, hook_effekt="slam",
   regel_ausnahme="Eine Zeitlupe (Szene 2, 60-fps-iPhone-Quelle, 0,5x ohne Interpolation) – Produkt-Reveal",
   vo=[("Stopp! Du bist groß, schwer, und jeder Roller ächzt unter dir?",["meinung"]),("Dann schau dir den hier an.",["meinung"]),("Bis 150 Kilo belastbar.",["max_150kg"]),("Getestet mit einem Fahrer von 140 Kilo, und der zieht trotzdem sauber durch.",["getestet_140kg"]),("Starker Motor mit 500 Watt, dazu ein stabiler Rahmen aus Metall.",["motor_500w","metall"]),("Gebaut für große Jungs, nicht für Plastikspielzeug.",["meinung"]),("Jetzt im TikTok Shop.",[])],
   sz=[("img8258",0.0,None,"hook","kenburns_in","flash",T("ÜBER 100 KILO?",["KILO?"],["meinung"])),("img8241",16.0,"Dann","detail","none","whip",None,{"tempo":0.5}),("img8241",20.0,"Bis","beweis","punch","zoom",None,{"stat":ST(150,"KG","max. Belastung",["max_150kg"])}),("img8251",75.0,"Getestet","beweis","none","cut",None,{"stat":ST(500,"W","Motor",["motor_500w"])}),("img8251",23.0,"Starker","beweis","none","whip",None,{"stat":ST(10,"ZOLL","Gelreifen",["gelreifen"])}),("img8251",3.3,"Gebaut","emotion","none","cut",None,{"tempo":"ramp"}),("foto-stein-endkarte",0,"Jetzt","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Bis 150 kg belastbar.")),
 "g": dict(titel="Wald-Modus: Federung bügelt alles weg", idee=dict(winkel="feature_demo", zielgruppe="Pendler und Feierabend-Fahrer mit schlechten Wegen", hook="Slam: sauberes Rollerfoto im Wald (Licht an) + Weißblitz + Wackler + Text „WALD-MODUS: AN“", emotion="Souveränität, Komfort"),
   format="Feature-Demo im POV: Display-Fahrten, Felsen-Details (Federbeine, Bremse), Daten-Karten", look="rcb_tag", textposition="oben", stimme=MARKUS, hook_effekt="slam",
   vo=[("Wurzeln, Schotter, Bordsteinkanten?",["meinung"]),("Die Federung bügelt das einfach weg, super smooth.",["federung","meinung"]),("Vorne doppelt gefedert, hinten auch, dazu Zehn-Zoll-Gelreifen und Doppelbremse.",["federung","gelreifen","doppelbremse"]),("Licht an, Display im Blick, drei Fahrstufen bis zwanzig Kilometer pro Stunde.",["licht","display","drei_gaenge","abe_20kmh"]),("Und mit deutscher ABE und Versicherungskennzeichen ganz legal auf die Straße.",["abe_20kmh"]),("Jetzt im TikTok Shop.",[])],
   sz=[("foto-wald3",0,None,"hook","kenburns_in","cut",T("WALD-MODUS: AN",["AN"],["meinung"])),("img8251",69.0,"Die","beweis","none","cut",T("BORDSTEIN? EGAL.",["EGAL."],["meinung"])),("img8258",5.0,"Vorne","beweis","kenburns_in","whip",None,{"stat":ST("V+H","","Doppel-Federung",["federung"])}),("img8258",8.0,"dazu","beweis","punch","flash",None,{"stat":ST(2,"×","Scheibenbremse",["doppelbremse"])}),("img8241",0.0,"Licht","detail","none","cut",None,{"stat":ST(3,"","Fahrstufen",["drei_gaenge"])}),("img8239",3.0,"Und","beweis","none","cut",T("STRASSENTAUGLICH",["STRASSENTAUGLICH"],["abe_20kmh"])),("foto-wald-licht-endkarte",0,"Jetzt","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Mit deutscher ABE.")),
 "h": dict(titel="Daten-Montage ohne Sprecher (Musik von Vatto)", idee=dict(winkel="alltag", zielgruppe="Scroller, die ohne Ton schauen", hook="Slam: Annäherung an den RCB im Wald + Weißblitz + Wackler + „KEIN PLASTIKBOMBER.“", emotion="Lust aufs Fahren"),
   format="Text-/Daten-Montage im Takt, keine Stimme – Vatto legt Musik drauf", look="rcb", textposition="unten", stimme=None, hook_effekt="slam", ohne_vo=True,
   vo=[("KEIN PLASTIKBOMBER.",["meinung"],3.0),("20 KM/H MIT ABE",["abe_20kmh"],3.2),("10 ZOLL GELREIFEN",["gelreifen"],3.5),("FEDERUNG VORNE + HINTEN",["federung"],3.2),("BIS 150 KG",["max_150kg"],3.2),("500 W MOTOR",["motor_500w"],3.2),("JETZT IM TIKTOK SHOP",[],1.0)],
   sz=[("img8240",0.3,None,"hook","kenburns_in","flash",T("KEIN PLASTIKBOMBER.",["PLASTIKBOMBER."],["meinung"])),("img8258",1.0,"20","beweis","none","whip",None,{"stat":ST(20,"KM/H","mit ABE",["abe_20kmh"])}),("img8251",31.0,"10","emotion","none","zoom",None,{"stat":ST(10,"ZOLL","Gelreifen",["gelreifen"])}),("img8240",17.6,"FEDERUNG","beweis","none","flash",T("FEDERUNG VORNE + HINTEN",["FEDERUNG"],["federung"])),("img8240",9.0,"BIS","beweis","none","whip",None,{"stat":ST(150,"KG","belastbar",["max_150kg"])}),("img8258",13.0,"500","beweis","kenburns_out","zoom",None,{"stat":ST(500,"W","Motor",["motor_500w"])}),("foto-nacht-oben-endkarte",0,"JETZT","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="RCB D5 Pro · mit ABE")),
 "i": dict(titel="Detail-Tour: nur der Roller", idee=dict(winkel="detail_tour", zielgruppe="Käufer, die genau hinschauen, bevor sie bestellen", hook="Slam auf den RCB im Wald (Licht an) + „SCHAU GENAU HIN.“ + Cool-Smiley", emotion="Neugier, Wertigkeit"),
   format="Detail-Rundgang ohne Person, Ken Burns, animierte Metall-Infokarten mit Icons, keine Stimme (Musik von Vatto)", look="metall", textposition="unten", stimme=None, hook_effekt="slam", ohne_vo=True, logo=None, badge={"ende": True},
   vo=[("SCHAU GENAU HIN.",["meinung"],2.7),("Federbeine vorne doppelt",["federung"],2.5),("Bremsscheibe hinten",["doppelbremse"],2.5),("Trittbrett trägt viel",["max_150kg"],2.5),("Lenkrohr mit Antrieb",["motor_500w"],2.5),("Link im Shop",[],1.0)],
   sz=[("img8252",0.2,None,"hook","kenburns_in","flash",T("SCHAU GENAU HIN.",["HIN."],["meinung"],sticker="smiley"),{"ausschnitt":{"x":0.42,"y":0.2,"h":0.42}}),("img8241",20.0,"Federbeine","beweis","kenburns_in","whip",None,{"stat":{**ST("V+H","","Federung",["federung"]),"icon":"feder"}}),("img8241",3.3,"Bremsscheibe","beweis","kenburns_out","zoom",None,{"stat":{**ST(2,"×","Bremsen v + h",["doppelbremse"]),"icon":"bremse"}}),("img8241",8.1,"Trittbrett","beweis","kenburns_in","whip",None,{"stat":{**ST(150,"KG","belastbar",["max_150kg"]),"icon":"gewicht"}}),("img8240",19.0,"Lenkrohr","beweis","kenburns_out","flash",None,{"stat":{**ST(500,"W","Motor",["motor_500w"]),"icon":"blitz"}}),("foto-wald1-endkarte",0,"Link","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Federung vorne + hinten.")),
 "j": dict(titel="Fahrgefühl: Wald und Wiese aus Fahrersicht", idee=dict(winkel="fahrgefuehl", zielgruppe="Fahrer, die Lust auf Touren abseits der Straße haben", hook="Slam auf den RCB auf dem Waldweg + „AB IN DEN WALD.“ + Cool-Smiley", emotion="Fahrspaß, Freiheit"),
   format="POV-Fahrten (nur Lenker, Display, Weg) + Wiese im Zuschnitt, harte Schnitte ohne Zoom, Metall-Karten, keine Stimme", look="metall_dunkel", textposition="unten", stimme=None, hook_effekt="slam", ohne_vo=True, logo=None, badge={"ende": True},
   vo=[("AB IN DEN WALD.",["meinung"],2.4),("3 FAHRSTUFEN",["drei_gaenge"],2.1),("WALDWEG",["meinung"],2.1),("WIESE",["meinung"],1.6),("10 ZOLL GELREIFEN",["gelreifen"],2.1),("ABE",["abe_20kmh"],2.1),("JETZT IM TIKTOK SHOP",[],1.2)],
   sz=[("img8251",98.0,None,"hook","none","cut",T("AB IN DEN WALD.",["WALD."],["meinung"],sticker="smiley",top=300)),("img8239",16.0,"3","beweis","none","cut",None,{"stat":{**ST(3,"","Fahrstufen",["drei_gaenge"]),"icon":"tacho"}}),("img8251",38.5,"WALDWEG","emotion","none","cut",T("WALDWEG? EASY.",["EASY."],["meinung"],top=300)),("dji0926-0021",21.0,"WIESE","emotion","none","cut",T("WIESE? LÄUFT.",["LÄUFT."],["meinung"],top=300),{"ausschnitt":{"x":0.48,"y":0.64,"h":0.32}}),("img8251",76.5,"10","beweis","none","cut",None,{"stat":{**ST(10,"ZOLL","Gelreifen",["gelreifen"]),"icon":"reifen"}}),("img8239",19.0,"ABE","beweis","none","cut",None,{"stat":{**ST("ABE","","Straßenzulassung",["abe_20kmh"]),"icon":"haken"}}),("foto-wald2-endkarte",0,"JETZT","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="RCB D5 Pro · mit ABE.")),
 "k": dict(titel="Licht-Check: Tag, Wald, Nacht", idee=dict(winkel="licht_check", zielgruppe="Pendler, die auch abends und im Wald unterwegs sind", hook="Slam auf den RCB bei Nacht mit Scheinwerfer + „LICHT AN.“", emotion="Sicherheit, Stil"),
   format="Licht-Fokus: Nachtfoto, Scheinwerfer und Rücklicht im Wald, Display, Metall-Karten auf Orange, keine Stimme", look="metall_glanz", textposition="oben", stimme=None, hook_effekt="slam", ohne_vo=True, logo=None, badge={"ende": True},
   vo=[("LICHT AN.",["meinung"],2.7),("SCHEINWERFER UND RÜCKLICHT",["licht"],2.5),("GESEHEN WERDEN",["meinung"],2.5),("DISPLAY",["display"],2.5),("FEIERABEND",["meinung"],2.5),("JETZT IM TIKTOK SHOP",[],1.0)],
   sz=[("foto-nacht-oben",0,None,"hook","kenburns_in","flash",T("LICHT AN.",["AN."],["meinung"])),("img8240",2.6,"SCHEINWERFER","beweis","kenburns_in","whip",None,{"stat":{**ST("V+H","","Licht",["licht"]),"icon":"licht"}}),("img8251",111.8,"GESEHEN","emotion","none","cut",T("GESEHEN WERDEN.",["WERDEN."],["meinung"])),("img8258",18.0,"DISPLAY","beweis","kenburns_in","zoom",None,{"stat":{**ST("ALLES","","im Blick",["display"]),"icon":"display"}}),("foto-wald-licht",0,"FEIERABEND","emotion","kenburns_out","flash",T("FEIERABEND? LOS.",["LOS."],["meinung"],sticker="smiley")),("foto-nacht-heck-endkarte",0,"JETZT","cta","kenburns_out",None,None)],
   cta=dict(text="Jetzt im TikTok Shop", zusatz="Licht vorne + hinten.")),
}
FERTIG = {"a", "b", "f", "g", "h"}  # abgenommen + im Drive → Spec nie mehr neu schreiben
for vid, d in V.items():
    if vid in FERTIG and os.path.exists(f"videos/{vid}/spec.json"): continue
    worte = " ".join(v[0] for v in d["vo"]).split()
    szenen, idx = [], -1
    for z in d["sz"]:
        clip, von, ab, rolle, zoom, ueb, text = z[:7]
        extra = z[7] if len(z) > 7 else {}
        s = {"clip": clip, "von": von, "bis": round(von + 2.5, 3), "rolle": rolle, "zoom": zoom}
        if ueb: s["uebergang"] = ueb
        if ab is not None:
            idx = worte.index(ab, idx + 1); s["ab_wort"] = idx
        if text:
            if any(b in ("gelreifen", "spitze_1600w", "getestet_140kg") for b in text["belege"]): text["bedingung_ok"] = True
            s["text"] = text
        s.update(extra); szenen.append(s)
    t = lambda i: 0.25 + i / 2.75
    if d.get("ohne_vo"):  # gleiche Zeitspur wie tools/stumm-vo.mjs: je Takt „dauer“ s, Wörter gleichmäßig verteilt
        ws, t0 = [], 0.0
        for v in d["vo"]:
            n = len(v[0].split()); ws += [t0 + k * v[2] / n for k in range(n)]; t0 += v[2]
        ws.append(t0); t = lambda i, ws=ws: 0.25 + ws[i]
    for k, s in enumerate(szenen):
        a = 0 if k == 0 else t(s["ab_wort"]) - 0.12
        e = t(szenen[k + 1]["ab_wort"]) - 0.12 if k + 1 < len(szenen) else t(len(worte)) + 1.4
        s["bis"] = round(s["von"] + (e - a) * (1.25 if s.get("tempo") == "ramp" else 1), 3)
    vo = [{"satz": v[0], "belege": v[1], **({"dauer": v[2]} if len(v) > 2 else {}), **({"bedingung_ok": True} if any(x in v[1] for x in ("gelreifen", "getestet_140kg")) else {})} for v in d["vo"]]
    spec = {**{k: d[k] for k in ("schrift_alt", "hook_effekt", "ohne_vo", "regel_ausnahme") if d.get(k)}, "titel": d["titel"], "idee": d["idee"], "format": d["format"], "look": d["look"], "textposition": d["textposition"], "stimme": d["stimme"],
            **({"logo": d.get("logo", LOGO)} if d.get("logo", LOGO) else {}), **({"badge": d["badge"]} if d.get("badge") else {}), "voiceover": vo, "szenen": szenen, "cta": {**d["cta"], "top": 450 if d.get("badge", {}).get("ende") else 330}}
    os.makedirs(f"videos/{vid}", exist_ok=True)
    json.dump(spec, open(f"videos/{vid}/spec.json", "w"), ensure_ascii=False, indent=2)
    print(vid, len(worte), "Wörter", len(szenen), "Szenen")
