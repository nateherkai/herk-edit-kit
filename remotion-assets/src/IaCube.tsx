import { ThreeCanvas } from "@remotion/three";
import { useMemo } from "react";
import { BoxGeometry, EdgesGeometry } from "three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export type IaCubeProps = { cor: string; corFace: string; segundosPorFace: number };
export const iaCubeDefaults: IaCubeProps = { cor: "#35E0FF", corFace: "#2A2552", segundosPorFace: 1.5 };

// Cubo 3D de vidro escuro com arestas ciano. Gira 90° a cada `segundosPorFace`,
// com overshoot leve, para o HyperFrames trocar o rótulo HTML a cada virada.
export const IaCube: React.FC<IaCubeProps> = ({ cor, corFace, segundosPorFace }) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const passo = Math.floor(t / segundosPorFace);
  const dentro = (t - passo * segundosPorFace) / segundosPorFace;
  const giro = interpolate(dentro, [0, 0.45], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
  });
  const anguloY = (passo + giro) * (Math.PI / 2);
  const entrada = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const saida = interpolate(frame, [durationInFrames - 0.5 * fps, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const escala = entrada;
  const arestas = useMemo(() => new EdgesGeometry(new BoxGeometry(3.02, 3.02, 3.02)), []);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
        style={{ background: "transparent" }}
        camera={{ fov: 35, position: [0, 2.2, 9] }}
      >
        <ambientLight intensity={1.6} />
        <directionalLight position={[4, 6, 5]} intensity={3.2} color={cor} />
        <directionalLight position={[-5, -2, 3]} intensity={1.6} color="#FF3D8A" />
        <pointLight position={[0, 4, 4]} intensity={40} color="#FFFFFF" />
        <group scale={[escala, escala, escala]} rotation={[0.42, anguloY, 0]} position={[0, 0.3 + 0.08 * Math.sin(t * 2.1), 0]}>
          <mesh>
            <boxGeometry args={[3, 3, 3]} />
            <meshStandardMaterial color={corFace} emissive="#0E2A3A" emissiveIntensity={0.9} metalness={0.35} roughness={0.3} transparent opacity={0.94 * saida} />
          </mesh>
          <lineSegments geometry={arestas}>
            <lineBasicMaterial color={cor} transparent opacity={saida} />
          </lineSegments>
          <mesh>
            <boxGeometry args={[3.06, 3.06, 3.06]} />
            <meshBasicMaterial wireframe color={cor} transparent opacity={0.9 * saida} />
          </mesh>
          <mesh>
            <boxGeometry args={[3.3, 3.3, 3.3]} />
            <meshBasicMaterial wireframe color={cor} transparent opacity={0.18 * saida} />
          </mesh>
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
