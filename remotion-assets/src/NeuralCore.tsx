import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type NeuralCoreProps = { cor: string; corInterna: string };
export const neuralCoreDefaults: NeuralCoreProps = { cor: "#35E0FF", corInterna: "#FF3D8A" };

// Núcleo 3D em wireframe (icosaedro + esfera interna + anel) para sobrepor à gravação.
// Fundo transparente; renderizar em WebM VP9 com alpha. Animação 100% determinística.
export const NeuralCore: React.FC<NeuralCoreProps> = ({ cor, corInterna }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const entrada = interpolate(frame, [0, 0.8 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const saida = interpolate(frame, [durationInFrames - 0.5 * fps, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const escala = entrada * (0.9 + 0.1 * saida);
  const pulso = 1 + 0.06 * Math.sin(t * 4.2);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        style={{ background: "transparent" }}
        camera={{ fov: 40, position: [0, 0, 9] }}
      >
        <ambientLight intensity={0.6} />
        <group scale={[escala, escala, escala]} rotation={[0.35 * Math.sin(t * 0.7), t * 0.9, 0.15]}>
          <mesh>
            <icosahedronGeometry args={[2.6, 1]} />
            <meshBasicMaterial wireframe color={cor} transparent opacity={0.95 * saida} />
          </mesh>
          <mesh rotation={[t * 0.6, -t * 1.3, 0]} scale={[pulso, pulso, pulso]}>
            <sphereGeometry args={[1.25, 12, 10]} />
            <meshBasicMaterial wireframe color={corInterna} transparent opacity={0.8 * saida} />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0, t * 0.5]}>
            <torusGeometry args={[3.4, 0.03, 8, 96]} />
            <meshBasicMaterial color={cor} transparent opacity={0.7 * saida} />
          </mesh>
          <mesh rotation={[Math.PI / 1.7, t * 0.4, 0]}>
            <torusGeometry args={[3.9, 0.02, 8, 96]} />
            <meshBasicMaterial color={cor} transparent opacity={0.4 * saida} />
          </mesh>
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
