import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import manifest from "./manifest.json";

// Echtes Material, nur Schnitt/Zoom/Text – der Roller selbst wird nicht verändert.
// Safe Zone 1080×1920: oben 150, rechts 140, unten 400, links 60 px.

const BEAT = manifest.beat; // Frames pro Beat (144 BPM)
const COLORS = { Y: "#FFD400", C: "#2EE6FF", P: "#FF4FB3", W: "#FFFFFF" } as const;
type Col = keyof typeof COLORS;
type Word = [string, Col];

const useFonts = () => {
  const [handle] = useState(() => delayRender("Schriften laden"));
  useEffect(() => {
    const fonts = [
      new FontFace("Marker", `url(${staticFile("fonts/PermanentMarker.ttf")})`),
      new FontFace("Poppins", `url(${staticFile("fonts/Poppins-Bold.ttf")})`),
    ];
    Promise.all(fonts.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);
};

// Clip mit sanftem „Einrasten": startet leicht vergrößert und setzt sich per Spring.
const Clip: React.FC<{ file: string }> = ({ file }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const settle = spring({ frame, fps, config: { damping: 200, mass: 0.8 }, durationInFrames: 14 });
  const scale = interpolate(settle, [0, 1], [1.05, 1]);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})` }}>
      <OffthreadVideo src={staticFile(file)} muted style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};

// Graffiti-Text: Wort für Wort mit Spring-Pop, leicht schräg, auf den Beat pulsierend.
const Graffiti: React.FC<{
  lines: Word[][];
  y: number;
  size?: number;
  dur: number;
  stagger?: number;
  rot?: number;
}> = ({ lines, y, size = 130, dur, stagger = 4, rot = -3 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(frame, [dur - 5, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = 1 + 0.025 * Math.max(0, 1 - (frame % BEAT) / 5);
  let idx = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 140,
        top: y,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `rotate(${rot}deg) scale(${pulse})`,
        opacity: out,
      }}
    >
      {lines.map((line, li) => (
        <div key={li} style={{ display: "flex", gap: size * 0.28, lineHeight: 1.08 }}>
          {line.map(([t, c]) => {
            const i = idx++;
            const s = spring({ frame: frame - i * stagger, fps, config: { damping: 9, stiffness: 180, mass: 0.6 } });
            return (
              <span
                key={t + i}
                style={{
                  fontFamily: "Marker",
                  fontSize: size,
                  color: COLORS[c],
                  WebkitTextStroke: `${Math.round(size / 11)}px #000`,
                  paintOrder: "stroke fill",
                  textShadow: "7px 9px 0 rgba(0,0,0,0.55)",
                  display: "inline-block",
                  transform: `scale(${s}) translateY(${(1 - s) * 40}px)`,
                  opacity: Math.min(1, s * 2),
                }}
              >
                {t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Kleiner Kicker über dem Hook („POV:")
const Kicker: React.FC<{ text: string; y: number }> = ({ text, y }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: 60,
        right: 140,
        textAlign: "center",
        fontFamily: "Poppins",
        fontSize: 64,
        color: "#fff",
        WebkitTextStroke: "8px #000",
        paintOrder: "stroke fill",
        opacity: o,
        letterSpacing: 4,
      }}
    >
      {text}
    </div>
  );
};

// Hüpfender Pfeil nach unten links – dorthin, wo TikTok den Produkt-Link zeigt.
const Arrow: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inS = spring({ frame, fps, config: { damping: 12 } });
  const bounce = Math.sin((frame / BEAT) * Math.PI) * 18;
  return (
    <svg
      width={220}
      height={220}
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        left: 70,
        top: 1330 + bounce,
        transform: `scale(${inS}) rotate(20deg)`,
        filter: "drop-shadow(6px 8px 0 rgba(0,0,0,0.55))",
      }}
    >
      <path
        d="M50 8 L50 70 M22 46 L50 78 L78 46"
        stroke="#000"
        strokeWidth={20}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M50 8 L50 70 M22 46 L50 78 L78 46"
        stroke="#FFD400"
        strokeWidth={11}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

const at = (beats: number) => Math.round(beats * BEAT);

export const ScooterViral: React.FC = () => {
  useFonts();
  const shots = manifest.shots;
  const s = (i: number) => shots[i];
  const endStart = s(7).from_;
  const T = (b0: number, b1: number) => ({ from: at(b0), durationInFrames: at(b1) - at(b0) });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {shots.map((sh) => (
        <Sequence key={sh.file} from={sh.from_} durationInFrames={sh.dur} premountFor={30}>
          <Clip file={sh.file} />
        </Sequence>
      ))}

      {/* HOOK 0–6 Beats */}
      <Sequence {...T(0, 6)}>
        <Kicker text="POV:" y={250} />
      </Sequence>
      <Sequence {...T(0.5, 6)}>
        <Graffiti
          dur={at(6) - at(0.5)}
          y={330}
          size={120}
          stagger={at(1)}
          lines={[[["DEIN", "W"], ["WEG", "W"]], [["AB", "Y"], ["MORGEN", "Y"]]]}
        />
      </Sequence>

      {/* Features */}
      <Sequence {...T(12.3, 18)}>
        <Graffiti dur={at(18) - at(12.3)} y={260} size={100} lines={[[["DUALES", "P"]], [["BREMSSYSTEM", "W"]]]} />
      </Sequence>
      <Sequence {...T(18.3, 24)}>
        <Graffiti dur={at(24) - at(18.3)} y={260} size={140} lines={[[["FEDERUNG", "Y"]], [["VORNE", "C"]]]} />
      </Sequence>
      <Sequence {...T(24.3, 30)}>
        <Graffiti dur={at(30) - at(24.3)} y={1250} size={115} lines={[[["LED-DISPLAY", "C"]]]} />
      </Sequence>
      <Sequence {...T(30.3, 36)}>
        <Graffiti dur={at(36) - at(30.3)} y={260} size={140} lines={[[["20", "Y"], ["KM/H", "Y"]], [["MIT", "W"], ["ABE", "C"]]]} />
      </Sequence>
      <Sequence {...T(36.3, 42)}>
        <Graffiti dur={at(42) - at(36.3)} y={260} size={140} lines={[[["350", "Y"], ["WATT", "Y"]], [["MOTOR", "W"]]]} />
      </Sequence>

      {/* CTA */}
      <Sequence from={endStart + 4} durationInFrames={manifest.total - endStart - 4}>
        <Graffiti
          dur={manifest.total - endStart + 20}
          y={330}
          size={105}
          rot={-2}
          stagger={6}
          lines={[[["JETZT", "W"], ["IM", "W"]], [["TIKTOK", "Y"], ["SHOP.", "Y"]]]}
        />
      </Sequence>
      <Sequence from={endStart + at(2)} durationInFrames={manifest.total - endStart - at(2)}>
        <Arrow />
      </Sequence>
    </AbsoluteFill>
  );
};

export const scooterViralMeta = {
  id: "ScooterViral",
  fps: manifest.fps,
  durationInFrames: manifest.total,
  width: 1080,
  height: 1920,
};

