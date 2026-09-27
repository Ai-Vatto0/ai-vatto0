import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

// Funktionstest: 9:16-Ausgabe mit animiertem Hook innerhalb der TikTok-Safe-Zone.
// TikTok-UI verdeckt ungefähr oben 150 px, rechts 140 px, unten 420 px (bei 1080×1920).
const SAFE = { top: 150, right: 140, bottom: 420, left: 60 };

export const MyComposition = () => {
  return (
    <Composition
      id="SmokeTest"
      component={SmokeTest}
      durationInFrames={90}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};

export const SmokeTest: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.2, 0.8, 0.2, 1),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#111" }}>
      <div
        style={{
          position: "absolute",
          display: "flex",
          top: SAFE.top,
          right: SAFE.right,
          bottom: SAFE.bottom,
          left: SAFE.left,
          border: "4px dashed rgba(255,255,255,0.25)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 900,
            fontSize: 110,
            lineHeight: 1.05,
            color: "white",
            textAlign: "center",
            opacity: progress,
            transform: `translateY(${(1 - progress) * 60}px) scale(${0.9 + progress * 0.1})`,
          }}
        >
          Remotion
          <br />
          läuft.
        </div>
      </div>
    </AbsoluteFill>
  );
};
