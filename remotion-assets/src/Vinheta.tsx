import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type VinhetaProps = {
  titulo: string;
  subtitulo: string;
  tag: string;
  corFundo: string;
  corAcento: string;
  corTexto: string;
};

export const vinhetaDefaults: VinhetaProps = {
  titulo: "Seu Reel começa aqui",
  subtitulo: "Vinheta de marca gerada com Remotion",
  tag: "@seuperfil",
  corFundo: "#0B0F14",
  corAcento: "#C8FF3D",
  corTexto: "#F5F7FA",
};

// Vinheta vertical (1080x1920) para abrir ou fechar um Reel.
// Toda animação é determinística: só useCurrentFrame + interpolate.
export const Vinheta: React.FC<VinhetaProps> = ({
  titulo,
  subtitulo,
  tag,
  corFundo,
  corAcento,
  corTexto,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const saida = durationInFrames - 0.5 * fps;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: corFundo,
        fontFamily:
          "Inter, 'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif",
        color: corTexto,
        // Fade geral de saída para emendar limpo no HyperFrames.
        opacity: interpolate(frame, [saida, durationInFrames], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
      }}
    >
      {/* Barra de acento: cresce da esquerda para a direita. */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 760,
          height: 18,
          width: 920,
          backgroundColor: corAcento,
          transformOrigin: "left center",
          scale: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }) + " 1",
        }}
      />

      {/* Título: sobe e aparece logo depois da barra. */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 820,
          fontSize: 112,
          lineHeight: 1.02,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          opacity: interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate:
            "0px " +
            interpolate(frame, [0.3 * fps, 1.1 * fps], [60, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }) +
            "px",
        }}
      >
        {titulo}
      </div>

      {/* Subtítulo: entra um pouco depois. */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: 1120,
          fontSize: 48,
          lineHeight: 1.25,
          fontWeight: 500,
          color: corAcento,
          opacity: interpolate(frame, [0.9 * fps, 1.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate:
            "0px " +
            interpolate(frame, [0.9 * fps, 1.5 * fps], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }) +
            "px",
        }}
      >
        {subtitulo}
      </div>

      {/* Tag do perfil no rodapé, dentro da área segura. */}
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 140,
          fontSize: 40,
          fontWeight: 600,
          opacity: interpolate(frame, [1.4 * fps, 1.9 * fps], [0, 0.85], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {tag}
      </div>
    </AbsoluteFill>
  );
};
