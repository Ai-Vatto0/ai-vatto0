// Remotion-Gegenstück zu video-cutter/tools/baue-spec.mjs – liest dieselbe Spec (props.json aus remotion-props.mjs),
// spielt dieselben Zwischenclips 1:1 ab. Nur für den Engine-Vergleich; SmokeTest bleibt unberührt.
import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";

type Text = { inhalt: string; betonung?: string[]; top?: number; anker_wort?: number };
type Szene = { src: string; von: number; dauer: number; zoom: string; zoomMax: number; uebergang: string; produktton: boolean; text: Text | null };
export type SpecProps = {
  basis: string; fps: number; gesamt: number; voStart: number; look: "gelb" | "nacht"; textposition: "oben" | "unten";
  cta: { text: string; zusatz?: string }; szenen: Szene[]; woerter: { text: string; s: number; e: number }[];
};

const LOOKS = {
  gelb: { akzent: "#FFD400", pille: "transparent", headline: 104, caption: 70, flash: "#FFFFFF" },
  nacht: { akzent: "#4DD8FF", pille: "rgba(8,12,22,.78)", headline: 92, caption: 62, flash: "#CFF4FF" },
};
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const SzeneView: React.FC<{ s: Szene; next?: Szene; prev?: Szene }> = ({ s, prev }) => {
  const f = useCurrentFrame(); // lokal in der Sequence
  let scale = 1;
  if (s.zoom === "kenburns_in") scale = interpolate(f, [0, s.dauer], [1, s.zoomMax], clamp);
  if (s.zoom === "kenburns_out") scale = interpolate(f, [0, s.dauer], [s.zoomMax, 1], clamp);
  if (s.zoom === "punch") { const at = Math.round(s.dauer * 0.35); scale = interpolate(f, [at, at + 4], [1, Math.min(1.2, s.zoomMax + 0.05)], { ...clamp, easing: Easing.out(Easing.poly(4)) }); }
  let tx = 0, trScale = 1, blur = 0;
  const end = s.dauer;
  if (s.uebergang === "whip") { tx = interpolate(f, [end - 5, end], [0, -38], { ...clamp, easing: Easing.in(Easing.cubic) }); blur = interpolate(f, [end - 5, end], [0, 14], clamp); }
  if (s.uebergang === "zoom") { trScale = interpolate(f, [end - 4, end], [1, 1.22], clamp); blur = interpolate(f, [end - 4, end], [0, 8], clamp); }
  if (prev?.uebergang === "whip") { const k = interpolate(f, [0, 6], [38, 0], { ...clamp, easing: Easing.out(Easing.cubic) }); tx += k; blur = Math.max(blur, interpolate(f, [0, 6], [14, 0], clamp)); }
  if (prev?.uebergang === "zoom") { trScale *= interpolate(f, [0, 7], [1.3, 1], { ...clamp, easing: Easing.out(Easing.cubic) }); blur = Math.max(blur, interpolate(f, [0, 7], [10, 0], clamp)); }
  return (
    <AbsoluteFill style={{ overflow: "hidden", transform: `translateX(${tx}%) scale(${trScale})`, filter: blur ? `blur(${blur}px)` : undefined }}>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "50% 45%" }}>
        <OffthreadVideo src={staticFile(s.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {s.produktton ? <Audio src={staticFile(s.src)} volume={0.16} /> : null}
    </AbsoluteFill>
  );
};

export const SpecVideo: React.FC<SpecProps> = (p) => {
  const frame = useCurrentFrame();
  const L = LOOKS[p.look];
  const oben = p.textposition === "oben";
  const Y = oben ? { caption: 230, headline: 1150 } : { caption: 1290, headline: 250 };
  const cta = p.szenen[p.szenen.length - 1];
  const font = `@font-face { font-family: "Poppins"; src: url("${staticFile(`${p.basis}/Poppins-Bold.ttf`)}") format("truetype"); font-weight: 700; }`;
  const stroke = p.look === "gelb" ? { WebkitTextStroke: "12px #000", paintOrder: "stroke fill" } : { background: L.pille, padding: "14px 30px", borderRadius: 26 };
  // Untertitel-Blöcke wie baue-spec: bis 4 Wörter, Bruch an Satzzeichen
  const bloecke: { i: number; text: string; s: number; e: number }[][] = [];
  let cur: { i: number; text: string; s: number; e: number }[] = [];
  p.woerter.forEach((w, i) => { cur.push({ ...w, i }); if (cur.length >= 4 || /[.!?,]$/.test(w.text) || i === p.woerter.length - 1) { bloecke.push(cur); cur = []; } });
  const block = bloecke.find((b, k) => { const s = p.voStart + b[0].s; const e = bloecke[k + 1] ? p.voStart + bloecke[k + 1][0].s : p.gesamt; return frame >= s && frame < Math.min(e, p.voStart + b[b.length - 1].e + 10, cta.von); });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: "Poppins, sans-serif", fontWeight: 700 }}>
      <style>{font}</style>
      {p.szenen.map((s, i) => (
        <Sequence key={i} from={s.von} durationInFrames={s.dauer}>
          <SzeneView s={s} prev={p.szenen[i - 1]} />
        </Sequence>
      ))}
      {p.szenen.slice(0, -1).map((s, i) => s.uebergang === "flash" ? (
        <Sequence key={`fl${i}`} from={s.von + s.dauer - 2} durationInFrames={7}>
          <AbsoluteFill style={{ background: L.flash, opacity: interpolate(frame - (s.von + s.dauer - 2), [0, 2, 6], [0, 0.85, 0], clamp) }} />
        </Sequence>
      ) : null)}
      {p.szenen.slice(0, -1).map((s, i) => s.uebergang && s.uebergang !== "cut" ? (
        <Sequence key={`w${i}`} from={s.von + s.dauer - 1} durationInFrames={6}><Audio src={staticFile(`${p.basis}/wumms.wav`)} /></Sequence>
      ) : null)}
      <Sequence from={0} durationInFrames={27}><Audio src={staticFile(`${p.basis}/boom.wav`)} /></Sequence>
      <Sequence from={p.voStart}><Audio src={staticFile(`${p.basis}/vo.wav`)} volume={1} /></Sequence>
      {/* Headlines */}
      {p.szenen.slice(0, -1).map((s, i) => s.text ? (
        <Sequence key={`h${i}`} from={s.von + 3} durationInFrames={s.dauer - 4}>
          <Headline text={s.text} top={s.text.top ?? Y.headline} look={p.look} akzent={L.akzent} size={L.headline} len={s.dauer - 4} />
        </Sequence>
      ) : null)}
      {/* Untertitel */}
      {block ? (
        <div style={{ position: "absolute", left: 60, right: 140, top: Y.caption, display: "flex", justifyContent: "center" }}>
          <p style={{ maxWidth: 860, textAlign: "center", fontSize: L.caption, lineHeight: 1.12, color: "#fff", ...stroke,
            transform: `scale(${interpolate(frame - (p.voStart + block[0].s), [0, 4], [0.9, 1], clamp)})` }}>
            {block.map((w) => <span key={w.i} style={{ color: frame >= p.voStart + w.s && frame < p.voStart + w.e + 3 ? L.akzent : "#fff" }}>{w.text.replace(/[,.]$/, "")} </span>)}
          </p>
        </div>
      ) : null}
      {/* CTA */}
      <Sequence from={cta.von + 3}>
        <Cta text={p.cta.text} zusatz={p.cta.zusatz} look={p.look} akzent={L.akzent} />
      </Sequence>
      <div style={{ position: "absolute", left: 70, top: 160, fontSize: 26, color: "#fff", background: "rgba(0,0,0,.62)", padding: "6px 14px", borderRadius: 12 }}>KI-Stimme</div>
    </AbsoluteFill>
  );
};

const Headline: React.FC<{ text: Text; top: number; look: string; akzent: string; size: number; len: number }> = ({ text, top, look, akzent, size, len }) => {
  const f = useCurrentFrame();
  const betont = new Set((text.betonung || []).map((x) => x.toLowerCase()));
  const aus = interpolate(f, [len - 6, len], [1, 0], clamp);
  const style = look === "gelb" ? { WebkitTextStroke: "14px #000", paintOrder: "stroke fill" } : { background: "rgba(8,12,22,.78)", padding: "10px 26px 14px", borderRadius: 28 };
  return (
    <div style={{ position: "absolute", left: 60, right: 140, top, display: "flex", justifyContent: "center", opacity: aus }}>
      <div style={{ maxWidth: 860, textAlign: "center", fontSize: size, lineHeight: 1.04, color: "#fff", ...style }}>
        {text.inhalt.split(/\s+/).map((w, i) => {
          const t = interpolate(f, [i * 2, i * 2 + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
          return <span key={i} style={{ display: "inline-block", marginRight: "0.25em", color: betont.has(w.toLowerCase()) ? akzent : "#fff", transform: `translateY(${(1 - t) * 80}%) rotate(${(1 - t) * -4}deg)`, opacity: Math.min(1, t * 1.5) }}>{w}</span>;
        })}
      </div>
    </div>
  );
};

const Cta: React.FC<{ text: string; zusatz?: string; look: string; akzent: string }> = ({ text, zusatz, look, akzent }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, 13], [0.6, 1], { ...clamp, easing: Easing.out(Easing.back(1.2)) });
  const style = look === "gelb" ? { WebkitTextStroke: "14px #000", paintOrder: "stroke fill" } : { background: "rgba(8,12,22,.8)", padding: "12px 28px 16px", borderRadius: 30 };
  const dash = interpolate(f, [12, 26], [260, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 60, right: 140, top: 1080, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ color: akzent, fontSize: 76, lineHeight: 1.05, textAlign: "center", maxWidth: 720, transform: `scale(${s})`, opacity: Math.min(1, f / 6), ...style }}>{text}</div>
      {zusatz ? <div style={{ color: "#fff", fontSize: 44, marginTop: 12, background: "rgba(0,0,0,.55)", padding: "6px 18px", borderRadius: 16, opacity: interpolate(f, [9, 18], [0, 1], clamp) }}>{zusatz}</div> : null}
      <svg width={150} height={150} viewBox="0 0 200 200" style={{ marginRight: 400, marginTop: 4 }}>
        <path d="M170 20 C 150 90, 110 130, 40 160" fill="none" stroke={akzent} strokeWidth={14} strokeLinecap="round" strokeDasharray={260} strokeDashoffset={dash} />
        <path d="M40 160 L 70 118 M40 160 L 92 170" fill="none" stroke={akzent} strokeWidth={14} strokeLinecap="round" strokeDasharray={260} strokeDashoffset={dash} />
      </svg>
    </div>
  );
};
