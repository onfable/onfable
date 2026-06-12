import { Composition } from "remotion";
import { BaseMcp } from "./BaseMcp";
import { Stinger } from "./Stinger";
import { Update013 } from "./Update013";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Update013"
        component={Update013}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="BaseMcp"
        component={BaseMcp}
        durationInFrames={300}
        fps={30}
        width={1600}
        height={900}
      />
      <Composition
        id="Stinger"
        component={Stinger}
        durationInFrames={105}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
