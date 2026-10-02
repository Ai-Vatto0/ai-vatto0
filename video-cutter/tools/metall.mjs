// METALL-STIL für baue-spec.mjs (Looks metall / metall_dunkel / metall_glanz, Vatto 02.10.: „orange-metallic, schwarz“).
// Liefert: CSS, animierte Info-Karten mit eigenen SVG-Icons (Pop + Icon-Eigenanimation + Hochzählen + Glanz-Sweep),
// Metallic-Schlagzeilen mit Sticker (Cool-Smiley) und den RCB-D5-PRO-Schriftzug (SVG, transparent, mit Glanz).
// Alle Bewegungen bleiben innerhalb der Safe Zone (Einflug per Skalierung/Drehung, nie von außerhalb des Bildes).
import { r3 } from "./lib.mjs";

const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const MO = ["#FFE7C7", "#FFA24A", "#E85D00", "#FFB46B", "#A33F00"]; // Metallic-Orange-Verlauf
const grad = (id, dir = "0 0 0 1") => {
  const [x1, y1, x2, y2] = dir.split(" ");
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${MO[0]}"/><stop offset=".28" stop-color="${MO[1]}"/><stop offset=".52" stop-color="${MO[2]}"/><stop offset=".68" stop-color="${MO[3]}"/><stop offset="1" stop-color="${MO[4]}"/></linearGradient>`;
};
export const CSS_GRAD = `linear-gradient(180deg, ${MO[0]} 0%, ${MO[1]} 30%, ${MO[2]} 52%, ${MO[3]} 68%, ${MO[4]} 100%)`;
const CHROM = "linear-gradient(180deg, #FFFFFF 0%, #E9E4DC 40%, #9C958B 55%, #F4EFE8 75%, #BDB5AA 100%)";

// ---- Icons: viewBox 0 0 100 100, Teile mit Klassen für die Eigenanimation ----
const S = `fill="none" stroke="#140F05" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
export const ICONS = {
  blitz: `<path class="ia" d="M56 10 L26 56 H48 L40 90 L74 42 H52 Z" fill="#140F05"/>`,
  feder: `<g class="ia" style="transform-origin:50px 86px"><path d="M30 14 H70" ${S}/><path d="M34 22 L66 32 L34 42 L66 52 L34 62 L66 72" ${S}/><path d="M30 84 H70" ${S}/></g>`,
  reifen: `<g class="ia" style="transform-origin:50px 50px"><circle cx="50" cy="50" r="34" ${S} stroke-width="12"/><circle cx="50" cy="50" r="10" fill="#140F05"/><path d="M50 26 V40 M50 60 V74 M26 50 H40 M60 50 H74" ${S} stroke-width="5"/></g>`,
  bremse: `<g class="ia" style="transform-origin:50px 50px"><circle cx="50" cy="50" r="32" ${S}/><circle cx="50" cy="50" r="8" fill="#140F05"/>${[0, 60, 120, 180, 240, 300].map((w) => `<circle cx="${r3(50 + 20 * Math.cos((w * Math.PI) / 180))}" cy="${r3(50 + 20 * Math.sin((w * Math.PI) / 180))}" r="4" fill="#140F05"/>`).join("")}</g><path d="M70 22 Q88 50 70 78" ${S} stroke-width="11"/>`,
  gewicht: `<g class="ia"><path d="M36 30 Q36 18 50 18 Q64 18 64 30" ${S}/><path d="M22 34 H78 L86 86 H14 Z" fill="#140F05"/><text x="50" y="72" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="26" fill="#FFB46B">KG</text></g>`,
  haken: `<circle cx="50" cy="50" r="36" ${S}/><path class="ia" d="M32 52 L45 65 L70 36" ${S} stroke-width="10" stroke-dasharray="70" stroke-dashoffset="70"/>`,
  licht: `<g class="ia" style="transform-origin:40px 50px"><path d="M60 26 Q34 26 30 50 Q34 74 60 74 Z" fill="#140F05"/><path d="M68 34 H88 M68 50 H92 M68 66 H88" ${S} stroke-width="6"/></g>`,
  tacho: `<path d="M16 66 A34 34 0 0 1 84 66" ${S} stroke-width="9"/><g class="ia" style="transform-origin:50px 66px"><path d="M50 66 L50 34" ${S} stroke-width="7"/></g><circle cx="50" cy="66" r="7" fill="#140F05"/>`,
  display: `<rect x="16" y="24" width="68" height="46" rx="8" ${S}/><g class="ia"><path d="M28 56 A12 12 0 0 1 52 56" ${S} stroke-width="5"/><path d="M58 40 H74 M58 52 H70" ${S} stroke-width="5"/></g><path d="M40 82 H60" ${S}/>`,
  smiley: `<circle cx="50" cy="50" r="38" fill="#FFC21C" stroke="#140F05" stroke-width="6"/><g class="ia"><path d="M20 40 H80 L76 52 Q66 60 56 50 L50 44 L44 50 Q34 60 24 52 Z" fill="#140F05"/></g><path d="M34 66 Q50 80 68 64" ${S} stroke-width="6"/>`,
};
// Eigenanimation je Icon (t = Startzeit, sel = Selektor des Icon-Teils)
const ICON_ANIM = {
  blitz: (sel, t) => `tl.fromTo("${sel}", { opacity: 0.2 }, { opacity: 1, duration: 0.05 }, ${r3(t)}); tl.fromTo("${sel}", { opacity: 0.3 }, { opacity: 1, duration: 0.06 }, ${r3(t + 0.12)});`,
  feder: (sel, t) => `tl.fromTo("${sel}", { scaleY: 1 }, { scaleY: 0.72, duration: 0.14, ease: "power2.in" }, ${r3(t)}); tl.to("${sel}", { scaleY: 1, duration: 0.4, ease: "elastic.out(1.2,0.35)" }, ${r3(t + 0.14)});`,
  reifen: (sel, t) => `tl.fromTo("${sel}", { rotation: -200 }, { rotation: 0, duration: 0.8, ease: "power3.out" }, ${r3(t)});`,
  bremse: (sel, t) => `tl.fromTo("${sel}", { rotation: -320 }, { rotation: 0, duration: 0.55, ease: "expo.out" }, ${r3(t)});`,
  gewicht: (sel, t) => `tl.fromTo("${sel}", { y: -26 }, { y: 0, duration: 0.45, ease: "bounce.out" }, ${r3(t)});`,
  haken: (sel, t) => `tl.fromTo("${sel}", { strokeDashoffset: 70 }, { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" }, ${r3(t)});`,
  licht: (sel, t) => `tl.fromTo("${sel}", { scale: 0.7, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(3)" }, ${r3(t)});`,
  tacho: (sel, t) => `tl.fromTo("${sel}", { rotation: -80 }, { rotation: 55, duration: 0.5, ease: "power3.out" }, ${r3(t)}); tl.to("${sel}", { rotation: 30, duration: 0.3, ease: "power2.inOut" }, ${r3(t + 0.5)});`,
  display: (sel, t) => `tl.fromTo("${sel}", { opacity: 0 }, { opacity: 1, duration: 0.08 }, ${r3(t)}); tl.fromTo("${sel}", { opacity: 0.3 }, { opacity: 1, duration: 0.08 }, ${r3(t + 0.14)});`,
  smiley: (sel, t) => `tl.fromTo("${sel}", { y: -60, rotation: -12 }, { y: 0, rotation: 0, duration: 0.4, ease: "bounce.out" }, ${r3(t)});`,
};
const iconSvg = (name, id) => `<svg class="mk-icon" viewBox="0 0 120 120"><defs>${grad(`${id}-g`, "0 0 1 1")}</defs><circle cx="60" cy="60" r="56" fill="url(#${id}-g)" stroke="#140F05" stroke-width="5"/><g transform="translate(10 10)">${ICONS[name] || ICONS.blitz}</g></svg>`;

// Varianten der drei Looks
export const VARIANTE = {
  metall: { karteBg: "linear-gradient(160deg,#241b12 0%,#0c0906 70%)", zahl: "grad", label: "#FFF7E8", hl: "grad", em: "chrom", plate: false },
  metall_dunkel: { karteBg: "linear-gradient(160deg,#0f0f10 0%,#000 80%)", zahl: "chrom", label: "#FFB46B", hl: "chrom", em: "grad", plate: true },
  metall_glanz: { karteBg: CSS_GRAD, zahl: "dunkel", label: "#140F05", hl: "grad", em: "chrom", plate: false, karteHell: true },
};

// Metallic-Füllung: echte Schrift in Grundfarbe (für hyperframes check: sichtbar + Kontrast) + Verlauf als ::after-Ebene (data-t = gleicher Text)
const GRUND = { grad: MO[1], chrom: "#F4EFE8", dunkel: "#140F05" };
const VERLAUF = { grad: CSS_GRAD, chrom: CHROM };
const fill = (art) => `color: ${GRUND[art]};`;
// Verlaufs-Ebene aus seit 02.10. (Vatto: „Schrift doppelt, irritiert“) → volle Farbe + schwarzer Rand
const ebene = () => "";
export const ctaCss = () => `
        .ctabox .cta-tx { -webkit-text-stroke: 0; text-shadow: none; color: ${MO[1]}; filter: drop-shadow(5px 0 0 #140F05) drop-shadow(-5px 0 0 #140F05) drop-shadow(0 5px 0 #140F05) drop-shadow(0 -5px 0 #140F05) drop-shadow(0 12px 0 rgba(12,9,3,.6)); }${ebene(".ctabox .cta-tx", "grad")}`;
const KONTUR = "filter: drop-shadow(4px 0 0 #140F05) drop-shadow(-4px 0 0 #140F05) drop-shadow(0 4px 0 #140F05) drop-shadow(0 -4px 0 #140F05) drop-shadow(0 12px 0 rgba(12,9,3,.6));";

export function css(look, TEXT_Y) {
  const v = VARIANTE[look];
  return `
        .hl-in.metall { font-family: "Marker", sans-serif; font-weight: 400; transform: rotate(-3deg); letter-spacing: .01em; ${v.plate ? "background: rgba(8,7,6,.82); padding: 6px 30px 16px; border-radius: 20px; border-bottom: 8px solid #E85D00;" : ""} }
        .hl-in.metall .hw { ${fill(v.hl)} ${KONTUR} padding: 0 6px; }
        .hl-in.metall .hw.em { ${fill(v.em)} }${ebene(".hl-in.metall .hw", v.hl)}${ebene(".hl-in.metall .hw.em", v.em)}
        .sticker { display: inline-block; width: 150px; height: 150px; vertical-align: middle; margin-left: 10px; }
        .mk { position: absolute; left: 60px; right: 140px; display: flex; justify-content: center; perspective: 900px; }
        .mk-rahmen { position: relative; padding: 7px; border-radius: 30px; background: ${v.karteHell ? "#140F05" : CSS_GRAD}; box-shadow: 0 16px 0 rgba(12,9,3,.5); transform-origin: 50% 50%; }
        .mk-in { position: relative; overflow: hidden; display: flex; align-items: center; gap: 26px; padding: 18px 44px 22px 22px; border-radius: 24px; background: ${v.karteBg}; }
        .mk-icon { width: 150px; height: 150px; flex: none; }
        .mk-zahl { font-family: "Marker", sans-serif; font-size: 150px; line-height: .98; ${fill(v.zahl)} ${v.zahl === "dunkel" ? "" : "-webkit-text-stroke: 8px #140F05; paint-order: stroke fill; filter: drop-shadow(0 6px 0 rgba(0,0,0,.55));"} white-space: nowrap; }${ebene(".mk-zahl .mz", v.zahl)}
        .mk-einheit { font-size: 76px; margin-left: 12px; }
        .mk-label { font-family: "Poppins", sans-serif; font-weight: 700; font-size: 42px; letter-spacing: .1em; text-transform: uppercase; color: ${v.label}; margin-top: 2px; white-space: nowrap; }
        .mk-glanz { position: absolute; top: -40px; bottom: -40px; left: 0; width: 140px; background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.55) 50%, rgba(255,255,255,0) 100%); transform: translateX(-260px) skewX(-20deg); pointer-events: none; }
        .badge { position: absolute; color: ${MO[1]}; }
        .badge svg { width: 100%; height: auto; display: block; overflow: visible; }`;
}

// Info-Karte: { zahl, einheit, label, icon }
export function karte(id, z, a, e, top) {
  const zahlNum = typeof z.zahl === "number";
  const html = `
        <div id="${id}" class="clip mk" data-start="${a}" data-duration="${r3(e - a)}" data-track-index="6" style="top:${top}px"><div class="mk-rahmen"><div class="mk-in">${iconSvg(z.icon || "blitz", id)}<div class="mk-txt"><div class="mk-zahl"><span id="${id}-n" class="mz" data-t="${zahlNum ? 0 : esc(z.zahl)}">${zahlNum ? 0 : esc(z.zahl)}</span><span class="mz mk-einheit" data-t="${esc(z.einheit || "")}">${esc(z.einheit || "")}</span></div><div class="mk-label">${esc(z.label || "")}</div></div><div class="mk-glanz"></div></div></div></div>`;
  let js = `\n        tl.fromTo("#${id} .mk-rahmen", { scale: 0.3, rotationY: -75, rotation: 8, opacity: 0 }, { scale: 1, rotationY: 0, rotation: -2, opacity: 1, duration: 0.42, ease: "back.out(1.6)" }, ${a});`;
  js += `\n        tl.fromTo("#${id} .mk-icon", { scale: 0, rotation: -160 }, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2.2)" }, ${r3(a + 0.12)});`;
  js += `\n        ${(ICON_ANIM[z.icon] || ICON_ANIM.blitz)(`#${id} .ia`, a + 0.5)}`;
  if (zahlNum) js += `\n        (() => { const o = { v: 0 }; const el = () => document.querySelector("#${id}-n"); tl.fromTo(o, { v: 0 }, { v: ${z.zahl}, duration: 0.6, ease: "power2.out", onUpdate: () => { const n = el(); if (n) { n.textContent = Math.round(o.v); n.dataset.t = Math.round(o.v); } } }, ${r3(a + 0.15)}); })();`;
  else js += `\n        tl.fromTo("#${id} .mk-zahl", { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2.5)" }, ${r3(a + 0.18)});`;
  js += `\n        tl.fromTo("#${id} .mk-label", { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power3.out" }, ${r3(a + 0.32)});`;
  js += `\n        tl.fromTo("#${id} .mk-glanz", { x: -260 }, { x: 980, duration: 0.6, ease: "power2.inOut" }, ${r3(a + 0.62)});`;
  js += `\n        tl.to("#${id} .mk-rahmen", { scale: 0.55, opacity: 0, duration: 0.2, ease: "power3.in" }, ${r3(e - 0.2)});`;
  return { html, js };
}

export const sticker = (id, name) => `<svg id="${id}" class="sticker" viewBox="0 0 100 100">${ICONS[name] || ICONS.smiley}</svg>`;
export const stickerJs = (id, name, a) => `\n        tl.fromTo("#${id}", { scale: 0, rotation: -40 }, { scale: 1, rotation: 8, duration: 0.4, ease: "back.out(2.6)" }, ${r3(a + 0.25)});\n        ${(ICON_ANIM[name] || ICON_ANIM.smiley)(`#${id} .ia`, a + 0.45)}`;

// RCB-D5-PRO-Schriftzug (eigene Gestaltung, kein Nachbau des Herstellerlogos): Tempo-Streifen + „RCB“ + Modellplakette
export function badge(id, { left, top, breite }, a, e, gross) {
  const g = `${id}-g`;
  const html = `
        <div id="${id}" class="clip badge" data-start="${r3(a)}" data-duration="${r3(e - a)}" data-track-index="${gross ? 4 : 5}" style="left:${left}px; top:${top}px; width:${breite}px"><svg viewBox="0 0 560 210">${gross ? "" : `<rect x="-14" y="6" width="588" height="214" rx="30" fill="rgba(10,8,5,.78)"/>`}<defs>${grad(g)}<clipPath id="${id}-c"><text x="132" y="128" font-family="Poppins" font-weight="700" font-style="italic" font-size="142" letter-spacing="-6">RCB</text></clipPath></defs>
          <g class="bd-str">${[0, 1, 2, 3].map((k) => `<path d="M${18 + k * 26} 128 L${58 + k * 26} 22 H${74 + k * 26} L${34 + k * 26} 128 Z" fill="url(#${g})" stroke="#140F05" stroke-width="5" stroke-linejoin="round"/>`).join("")}</g>
          <text class="bd-rcb" x="132" y="128" font-family="Poppins" font-weight="700" font-style="italic" font-size="142" letter-spacing="-6" fill="url(#${g})" stroke="#140F05" stroke-width="12" paint-order="stroke" stroke-linejoin="round">RCB</text>
          <g clip-path="url(#${id}-c)"><rect class="bd-glanz" x="-160" y="0" width="70" height="160" fill="#FFFFFF" opacity=".6" transform="skewX(-20)"/></g>
          <path class="bd-linie" d="M20 150 H470" stroke="url(#${g})" stroke-width="10" stroke-linecap="round" stroke-dasharray="460" stroke-dashoffset="460"/>
          <g class="bd-plakette"><rect x="300" y="164" width="230" height="44" rx="10" fill="#140F05" stroke="url(#${g})" stroke-width="4"/><text x="415" y="198" text-anchor="middle" font-family="Poppins" font-weight="700" font-size="32" letter-spacing="6" fill="#FFF7E8">D5 PRO</text></g>
        </svg></div>`;
  const t = a + 0.05;
  let js = `\n        tl.fromTo("#${id} .bd-str path", { scaleX: 0, transformOrigin: "0% 100%", opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.25, ease: "power3.out", stagger: 0.05 }, ${r3(t)});`;
  js += `\n        tl.fromTo("#${id} .bd-rcb", { scale: 0.6, opacity: 0, transformOrigin: "50% 60%" }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(2)" }, ${r3(t + 0.12)});`;
  js += `\n        tl.fromTo("#${id} .bd-linie", { strokeDashoffset: 460 }, { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" }, ${r3(t + 0.3)});`;
  js += `\n        tl.fromTo("#${id} .bd-plakette", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: "back.out(2)" }, ${r3(t + 0.45)});`;
  js += `\n        tl.fromTo("#${id} .bd-glanz", { x: 0 }, { x: 620, duration: 0.7, ease: "power2.inOut" }, ${r3(t + 0.7)});`;
  if (e - a > 4) js += `\n        tl.fromTo("#${id} .bd-glanz", { x: 0 }, { x: 620, duration: 0.7, ease: "power2.inOut", immediateRender: false }, ${r3(t + 4)});`;
  return { html, js };
}
