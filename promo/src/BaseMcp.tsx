import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const MONO = "ui-monospace, 'DejaVu Sans Mono', Menlo, monospace";
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const WHITE = "#f0f0f5";
const MUTED = "#a1a1aa";
const DIM = "#52525b";
const BASE_BLUE = "#0052ff";
const BASE_BLUE_LIGHT = "#3d7bff";

// 7-row pixel grids, image-style blocky letters
const LETTERS: Record<string, string[]> = {
  M: ["X.....X", "XX...XX", "X.X.X.X", "X..X..X", "X.....X", "X.....X", "X.....X"],
  C: [".XXXXX", "X.....", "X.....", "X.....", "X.....", "X.....", ".XXXXX"],
  P: ["XXXXX.", "X....X", "X....X", "XXXXX.", "X.....", "X.....", "X....."],
};

const CELL = 34;
const GAP = 10;

/** Deterministic pseudo-random per cell so the assemble order is stable. */
const hash = (x: number, y: number) => {
  const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

const PixelWord: React.FC<{ word: string; appearFrom: number; appearSpan: number }> = ({
  word,
  appearFrom,
  appearSpan,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let xOffset = 0;
  const cells: React.ReactNode[] = [];
  for (const ch of word) {
    const grid = LETTERS[ch];
    const width = grid[0].length;
    grid.forEach((row, y) => {
      row.split("").forEach((c, x) => {
        if (c !== "X") return;
        const r = hash(x + xOffset, y);
        const start = appearFrom + r * appearSpan;
        const p = spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 200 } });
        const blue = r > 0.55 ? BASE_BLUE : BASE_BLUE_LIGHT;
        cells.push(
          <div
            key={`${xOffset + x}-${y}`}
            style={{
              position: "absolute",
              left: (xOffset + x) * (CELL + GAP),
              top: y * (CELL + GAP),
              width: CELL,
              height: CELL,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${BASE_BLUE_LIGHT}, ${blue})`,
              boxShadow: `0 0 24px ${BASE_BLUE}55`,
              transform: `scale(${p})`,
            }}
          />,
        );
      });
    });
    xOffset += width + 2; // letter spacing in cells
  }
  const totalW = (xOffset - 2) * (CELL + GAP) - GAP;
  const totalH = 7 * (CELL + GAP) - GAP;
  return <div style={{ position: "relative", width: totalW, height: totalH }}>{cells}</div>;
};

const Mark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={WHITE} strokeWidth={2.5} strokeLinecap="round">
    <line x1="16" y1="5" x2="16" y2="27" />
    <line x1="5" y1="16" x2="27" y2="16" />
    <line x1="8.2" y1="8.2" x2="23.8" y2="23.8" />
    <line x1="23.8" y1="8.2" x2="8.2" y2="23.8" />
  </svg>
);

export const BaseMcp: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowIn = spring({ frame, fps, config: { damping: 15 } });
  // headline: "Base MCP is now inside onfable"
  const headlineP = spring({ frame: frame - 150, fps, config: { damping: 14 } });
  const cmd = "$ onfable mcp add base";
  const typed = cmd.slice(0, Math.max(0, Math.floor((frame - 185) * 1.1)));
  const urlP = spring({ frame: frame - 235, fps, config: { damping: 15 } });
  const fadeOut = interpolate(frame, [285, 300], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 120%, #0a1030 0%, #02030a 55%, #000 100%)",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      <Audio src={staticFile("basemcp.wav")} />
      <div
        style={{
          width: 1380,
          borderRadius: 26,
          border: `1px solid ${BASE_BLUE}33`,
          background: "#0a0a0eee",
          boxShadow: `0 0 140px ${BASE_BLUE}26`,
          overflow: "hidden",
          transform: `translateY(${(1 - windowIn) * 50}px) scale(${0.96 + windowIn * 0.04})`,
          opacity: windowIn,
        }}
      >
        {/* title bar like the reference: dots + "■ base" centered */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", padding: "26px 30px 6px" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: "#1d1d24" }} />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              textAlign: "center",
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 34,
              color: WHITE,
            }}
          >
            ■ base
          </div>
        </div>

        {/* pixel MCP assembling */}
        <div style={{ display: "flex", justifyContent: "center", padding: "54px 0 30px" }}>
          <PixelWord word="MCP" appearFrom={20} appearSpan={90} />
        </div>

        {/* headline + command + url */}
        <div style={{ textAlign: "center", paddingBottom: 56 }}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 52,
              color: WHITE,
              letterSpacing: -1,
              opacity: headlineP,
              transform: `translateY(${(1 - headlineP) * 24}px)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
            }}
          >
            now inside <Mark size={46} /> <span style={{ fontWeight: 600 }}>onfable</span>
          </div>
          <div
            style={{
              marginTop: 30,
              fontFamily: MONO,
              fontSize: 36,
              color: typed.length > 0 ? WHITE : "transparent",
              minHeight: 50,
            }}
          >
            <span style={{ color: DIM }}>{typed.startsWith("$") ? "" : ""}</span>
            {typed}
            {frame > 185 && frame < 235 ? <span style={{ opacity: Math.floor(frame / 12) % 2 ? 0 : 1 }}>▋</span> : null}
          </div>
          <div style={{ marginTop: 20, fontFamily: SANS, fontSize: 30, color: MUTED, opacity: urlP }}>
            onfable.xyz · approval-gated · no private keys
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
