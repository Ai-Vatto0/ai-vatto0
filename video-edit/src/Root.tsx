import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { ScooterViral, scooterViralMeta } from "./scooter/ScooterViral";
import { SpecVideo, SpecProps } from "./SpecVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition component={ScooterViral} {...scooterViralMeta} />
      {/* Engine-Vergleich: liest props.json aus video-cutter/tools/remotion-props.mjs */}
      <Composition
        id="SpecVideo"
        component={SpecVideo as unknown as React.FC<Record<string, unknown>>}
        fps={30}
        width={1080}
        height={1920}
        durationInFrames={900}
        defaultProps={{} as Record<string, unknown>}
        calculateMetadata={({ props }) => ({ durationInFrames: (props as unknown as SpecProps).gesamt || 900 })}
      />
    </>
  );
};
