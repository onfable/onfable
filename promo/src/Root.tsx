import { Composition } from "remotion";
import { Update013 } from "./Update013";

export const Root: React.FC = () => {
  return (
    <Composition
      id="Update013"
      component={Update013}
      durationInFrames={720}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
