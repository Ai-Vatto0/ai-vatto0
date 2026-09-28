import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { ScooterViral, scooterViralMeta } from "./scooter/ScooterViral";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <Composition component={ScooterViral} {...scooterViralMeta} />
    </>
  );
};
