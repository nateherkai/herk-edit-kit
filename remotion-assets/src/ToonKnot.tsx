import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type ToonKnotProps = { cor: string; corContorno: string };
export const toonKnotDefaults: ToonKnotProps = { cor: "#FF2E88", corContorno: "#0E0E10" };

// Nó toroidal estilo adesivo: material toon de 2 tons + contorno preto (casco invertido).
// Fundo transparente; renderizar em WebM VP9 com alpha. 100% determinístico.
export const ToonKnot: React.FC<ToonKnotProps> = ({ cor, corContorno }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const entrada = interpolate(frame, [0, 0.6 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const saida = interpolate(frame, [durationInFrames - 0.4 * fps, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const esc = entrada * saida;
  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        style={{ background: "transparent" }}
        camera={{ fov: 38, position: [0, 0, 15.5] }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 6, 6]} intensity={2.4} color="#ffffff" />
        <group scale={[esc, esc, esc]} rotation={[t * 0.8, t * 1.1, 0.3 * Math.sin(t * 1.3)]}>
          <mesh>
            <torusKnotGeometry args={[2.2, 0.78, 160, 24, 2, 3]} />
            <meshToonMaterial color={cor} />
          </mesh>
          <mesh>
            <torusKnotGeometry args={[2.2, 0.9, 160, 24, 2, 3]} />
            <meshBasicMaterial color={corContorno} side={1} />
          </mesh>
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
