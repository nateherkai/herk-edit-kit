import { Composition } from "remotion";
import { Vinheta, vinhetaDefaults } from "./Vinheta";
import { NeuralCore, neuralCoreDefaults } from "./NeuralCore";
import { IaCube, iaCubeDefaults } from "./IaCube";
import { ToonKnot, toonKnotDefaults } from "./ToonKnot";

// Reel vertical padrão: 1080x1920, 30 fps.
// Render MP4:  npx remotion render Vinheta out/vinheta.mp4
// Render WebM com alpha (overlay pro HyperFrames):
//   npx remotion render NeuralCore out/neural-core.webm --codec=vp9 --image-format=png --pixel-format=yuva420p
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Vinheta"
        component={Vinheta}
        durationInFrames={4 * 30}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={vinhetaDefaults}
      />
      <Composition
        id="NeuralCore"
        component={NeuralCore}
        durationInFrames={6 * 30}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={neuralCoreDefaults}
      />
      <Composition
        id="IaCube"
        component={IaCube}
        durationInFrames={10 * 30}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={iaCubeDefaults}
      />
      <Composition
        id="ToonKnot"
        component={ToonKnot}
        durationInFrames={7 * 30}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={toonKnotDefaults}
      />
    </>
  );
};
