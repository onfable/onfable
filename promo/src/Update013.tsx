import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const MONO = "ui-monospace, 'DejaVu Sans Mono', 'Cascadia Code', Menlo, monospace";
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const WHITE = "#f0f0f5";
const MUTED = "#a1a1aa";
const DIM = "#52525b";
const GREEN = "#6ed39a";
const CARD = "#0a0a0b";
const EDGE = "#1c1c1f";

const Mark: React.FC<{ size: number; progress?: number }> = ({ size, progress = 1 }) => {
  const dash = 32;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={WHITE}
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      {[
        [16, 5, 16, 27],
        [5, 16, 27, 16],
        [8.2, 8.2, 23.8, 23.8],
        [23.8, 8.2, 8.2, 23.8],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          strokeDasharray={dash}
          strokeDashoffset={dash * (1 - Math.min(1, Math.max(0, progress * 4 - i)))}
        />
      ))}
    </svg>
  );
};

/** Typewriter that reveals `text` starting at `from`, `cps` chars per frame. */
const useTyped = (text: string, from: number, cps = 1.2): string => {
  const frame = useCurrentFrame();
  const chars = Math.max(0, Math.floor((frame - from) * cps));
  return text.slice(0, chars);
};

const Caret: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <span style={{ opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0 }}>▋</span>
  );
};

// ───────────────────────── Scene 1: the hook ─────────────────────────
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line1 = useTyped("your terminal", 8, 0.8);
  const line2 = useTyped("can now send money.", 30, 0.8);
  const markIn = spring({ frame, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill
      style={{
        background: "#000",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 48,
      }}
    >
      <div style={{ transform: `scale(${markIn})` }}>
        <Mark size={110} progress={frame / 25} />
      </div>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 110,
          color: WHITE,
          letterSpacing: -3,
          textAlign: "center",
          lineHeight: 1.15,
          minHeight: 260,
        }}
      >
        {line1}
        <br />
        <span style={{ color: MUTED }}>{line2}</span>
        {frame > 30 && frame < 110 ? <Caret /> : null}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────── Scene 2: the terminal demo ─────────────────────
interface Line {
  at: number;
  text: string;
  color: string;
  bold?: boolean;
  typed?: boolean;
}

const LINES: Line[] = [
  { at: 0, text: "$ onfable mcp add base", color: WHITE, typed: true },
  { at: 35, text: "  ✓ Authorized — agentic wallet connected (spending limits on)", color: GREEN },
  { at: 55, text: "", color: WHITE },
  { at: 60, text: "$ onfable", color: WHITE, typed: true },
  { at: 80, text: "› send 5 USDC to vitalik.base.eth", color: WHITE, typed: true },
  { at: 135, text: "", color: WHITE },
  { at: 140, text: "  ⚒ base__send: { token: \"USDC\", amount: 5, to: \"vitalik.base.eth\" }", color: DIM },
  { at: 165, text: "    ● Allow? — Yes ✓", color: GREEN },
  { at: 195, text: "", color: WHITE },
  { at: 200, text: "Sent. 5 USDC → vitalik.base.eth, confirmed on Base.", color: WHITE, typed: true },
  { at: 255, text: "  ⚒ memory_save: user sends USDC on Base", color: DIM },
];

const Terminal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 1480,
          borderRadius: 20,
          border: `1px solid ${EDGE}`,
          background: CARD,
          overflow: "hidden",
          transform: `translateY(${(1 - enter) * 60}px)`,
          opacity: enter,
          boxShadow: "0 0 120px rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "18px 24px",
            borderBottom: `1px solid ${EDGE}`,
            background: "#18181b",
          }}
        >
          {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => (
            <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
          ))}
          <div style={{ flex: 1, textAlign: "center", color: DIM, fontFamily: MONO, fontSize: 22 }}>
            onfable — base
          </div>
        </div>
        <div style={{ padding: 40, minHeight: 560 }}>
          {LINES.filter((l) => frame >= l.at).map((l, i) => {
            const text = l.typed
              ? l.text.slice(0, Math.max(0, Math.floor((frame - l.at) * 1.1)))
              : l.text;
            return (
              <div
                key={i}
                style={{
                  fontFamily: MONO,
                  fontSize: 30,
                  lineHeight: 1.65,
                  color: l.color,
                  fontWeight: l.bold ? 700 : 400,
                  whiteSpace: "pre-wrap",
                  minHeight: 50,
                }}
              >
                {text}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────── Scene 3: security model ─────────────────────
const SECURITY = [
  "no private keys ever touch the agent",
  "agentic wallet with spending limits",
  "every action needs your approval",
];

const Security: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        background: "#000",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 40,
      }}
    >
      <div style={{ fontFamily: SANS, fontSize: 44, color: DIM, letterSpacing: 6, textTransform: "uppercase" }}>
        because money
      </div>
      {SECURITY.map((s, i) => {
        const p = spring({ frame: frame - 12 - i * 14, fps, config: { damping: 15 } });
        return (
          <div
            key={s}
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 60,
              color: WHITE,
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px)`,
              display: "flex",
              alignItems: "center",
              gap: 24,
            }}
          >
            <span style={{ color: GREEN }}>✓</span> {s}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ───────────────────── Scene 4: outro ─────────────────────
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = spring({ frame, fps, config: { damping: 14 } });
  const pillP = spring({ frame: frame - 25, fps, config: { damping: 15 } });
  return (
    <AbsoluteFill
      style={{
        background: "#000",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 44,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28, transform: `scale(${inP})` }}>
        <Mark size={96} />
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 120, color: WHITE, letterSpacing: -4 }}>
          onfable <span style={{ color: MUTED, fontSize: 70 }}>0.1.3</span>
        </div>
      </div>
      <div style={{ fontFamily: SANS, fontSize: 46, color: MUTED }}>
        MCP support · Base built in · any model
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 38,
          color: WHITE,
          background: CARD,
          border: `1px solid ${EDGE}`,
          borderRadius: 14,
          padding: "22px 44px",
          opacity: pillP,
          transform: `translateY(${(1 - pillP) * 24}px)`,
        }}
      >
        <span style={{ color: DIM }}>$ </span>curl -fsSL onfable.xyz/install.sh | sh
      </div>
      <div style={{ fontFamily: SANS, fontSize: 36, color: DIM }}>
        onfable.xyz · the fable writes itself ✳
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────── timeline ─────────────────────
export const Update013: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [700, 720], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeOut }}>
      <Audio src={staticFile("soundtrack.wav")} />
      <Sequence from={0} durationInFrames={130}>
        <Hook />
      </Sequence>
      <Sequence from={130} durationInFrames={320}>
        <Terminal />
      </Sequence>
      <Sequence from={450} durationInFrames={120}>
        <Security />
      </Sequence>
      <Sequence from={570} durationInFrames={150}>
        <Outro />
      </Sequence>
    </AbsoluteFill>
  );
};
