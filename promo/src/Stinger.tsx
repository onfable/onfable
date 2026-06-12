import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const WHITE = "#f5f5f7";

/** Deterministic noise: band b at time-step s. */
const noise = (b: number, s: number) => {
  const v = Math.sin(b * 374.1 + s * 668.265) * 43758.5453;
  return (v - Math.floor(v)) * 2 - 1; // -1..1
};

const Mark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={WHITE} strokeWidth={2.6} strokeLinecap="round">
    <line x1="16" y1="5" x2="16" y2="27" />
    <line x1="5" y1="16" x2="27" y2="16" />
    <line x1="8.2" y1="8.2" x2="23.8" y2="23.8" />
    <line x1="23.8" y1="8.2" x2="8.2" y2="23.8" />
  </svg>
);

const Wordmark: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
    <Mark size={86} />
    <div style={{ fontSize: 120, letterSpacing: -3, color: WHITE }}>
      <span style={{ fontFamily: SANS, fontWeight: 500 }}>on</span>
      <span style={{ fontFamily: SERIF, fontStyle: "italic" }}>fable</span>
    </div>
  </div>
);

/** The full-frame scene that gets sliced. `which` switches mark/wordmark. */
const Scene: React.FC<{ which: "mark" | "word" }> = ({ which }) => (
  <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
    {which === "mark" ? <Mark size={520} /> : <Wordmark />}
  </AbsoluteFill>
);

const SIZE = 1080;
const BANDS = 12;

export const Stinger: React.FC = () => {
  const frame = useCurrentFrame();

  // Glitch intensity: 0 at start/end, two pulses like the reference
  const intensity = interpolate(
    frame,
    [0, 14, 22, 38, 50, 64, 74, 86, 105],
    [0, 0, 1, 1, 0.25, 1, 0.35, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // Which scene shows: wordmark → mark (during heavy glitch) → wordmark
  const which: "mark" | "word" = frame > 20 && frame < 62 ? "mark" : "word";
  const step = Math.floor(frame / 3); // re-roll offsets every 3 frames

  const bandH = SIZE / BANDS;
  const slices = Array.from({ length: BANDS }, (_, b) => {
    const dx = noise(b, step) * 260 * intensity * (Math.abs(noise(b + 50, step)) > 0.35 ? 1 : 0);
    return (
      <div
        key={b}
        style={{
          position: "absolute",
          top: b * bandH,
          left: 0,
          width: SIZE,
          height: bandH + 1,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -b * bandH,
            left: 0,
            width: SIZE,
            height: SIZE,
            transform: `translateX(${dx}px)`,
          }}
        >
          <Scene which={which} />
        </div>
      </div>
    );
  });

  // Sweeping solid bars (the pale strips in the reference → monochrome here)
  const bars = Array.from({ length: 6 }, (_, i) => {
    const seed = Math.abs(noise(i + 99, step));
    const visible = intensity > 0.3 && seed > 0.45;
    const y = Math.floor(Math.abs(noise(i + 7, step)) * BANDS) * bandH;
    const w = (0.35 + seed * 0.65) * SIZE;
    const fromLeft = noise(i + 31, step) > 0;
    return visible ? (
      <div
        key={i}
        style={{
          position: "absolute",
          top: y,
          left: fromLeft ? 0 : undefined,
          right: fromLeft ? undefined : 0,
          width: w,
          height: bandH * (seed > 0.8 ? 2 : 1),
          background: `rgba(255,255,255,${0.06 + seed * 0.12})`,
        }}
      />
    ) : null;
  });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Audio src={staticFile("stinger.wav")} />
      {slices}
      {bars}
    </AbsoluteFill>
  );
};
