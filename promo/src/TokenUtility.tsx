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

const MONO = "ui-monospace, 'DejaVu Sans Mono', Menlo, monospace";
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const WHITE = "#f5f5f7";
const MUTED = "#a1a1aa";
const DIM = "#52525b";
const GREEN = "#6ed39a";
const CARD = "#0a0a0b";
const EDGE = "#1c1c1f";

const Mark: React.FC<{ size: number; color?: string }> = ({ size, color = WHITE }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round">
    <line x1="16" y1="5" x2="16" y2="27" />
    <line x1="5" y1="16" x2="27" y2="16" />
    <line x1="8.2" y1="8.2" x2="23.8" y2="23.8" />
    <line x1="23.8" y1="8.2" x2="8.2" y2="23.8" />
  </svg>
);

/** Slamming stamp, rotated, springs in with overshoot — the "dramatic". */
const Stamp: React.FC<{ text: string; tone: "live" | "soon"; at: number }> = ({ text, tone, at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 220 } });
  const live = tone === "live";
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 70,
        transform: `rotate(-9deg) scale(${interpolate(p, [0, 1], [3.2, 1])})`,
        opacity: p,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 54,
        letterSpacing: 4,
        padding: "10px 28px",
        borderRadius: 12,
        color: live ? "#000" : WHITE,
        background: live ? GREEN : "transparent",
        border: live ? "none" : `4px solid ${WHITE}`,
      }}
    >
      {text}
    </div>
  );
};

const Punch: React.FC<{ children: React.ReactNode; at?: number }> = ({ children, at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 180 } });
  return (
    <div style={{ transform: `scale(${interpolate(p, [0, 1], [1.6, 1])})`, opacity: p }}>
      {children}
    </div>
  );
};

const Slide: React.FC<{ children: React.ReactNode; at?: number }> = ({ children, at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - at, fps, config: { damping: 14 } });
  return (
    <div style={{ transform: `translateY(${(1 - p) * 40}px)`, opacity: p }}>{children}</div>
  );
};

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 36 }) => (
  <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", flexDirection: "column", gap, padding: 80, textAlign: "center" }}>
    {children}
  </AbsoluteFill>
);

const H = ({ children, size = 92 }: { children: React.ReactNode; size?: number }) => (
  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: size, color: WHITE, letterSpacing: -2, lineHeight: 1.1 }}>{children}</div>
);
const Sub = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: SANS, fontSize: 38, color: MUTED, lineHeight: 1.4 }}>{children}</div>
);

// ── Scene 1: the question everyone asked ────────────────────────────────
const Question: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Center>
      <Punch>
        <div style={{ fontFamily: SANS, fontSize: 40, color: DIM }}>everyone keeps asking:</div>
      </Punch>
      <Punch at={12}>
        <H size={110}>&ldquo;what does <span style={{ color: GREEN }}>$ONFABLE</span><br />actually do?&rdquo;</H>
      </Punch>
      <Slide at={40}>
        <Sub>fair question. here&rsquo;s the answer ↓</Sub>
      </Slide>
      {frame > 70 ? null : null}
    </Center>
  );
};

// ── Scene 2: LIVE — it lives in the agent ──────────────────────────────
const InAgent: React.FC = () => (
  <Center gap={28}>
    <Stamp text="LIVE" tone="live" at={6} />
    <Punch>
      <H>it lives inside<br />the agent</H>
    </Punch>
    <Slide at={14}>
      <div style={{ fontFamily: MONO, fontSize: 34, textAlign: "left", background: CARD, border: `1px solid ${EDGE}`, borderRadius: 16, padding: "30px 40px", lineHeight: 1.8 }}>
        <div style={{ color: WHITE }}>› send 100 $ONFABLE to alice.base.eth</div>
        <div style={{ color: DIM }}>  ⚒ base__send …</div>
        <div style={{ color: GREEN }}>  ✓ approved — confirmed on Base</div>
      </div>
    </Slide>
    <Slide at={26}>
      <Sub>onfable ships Base MCP — your agent holds it,<br />sends it, swaps it. today.</Sub>
    </Slide>
  </Center>
);

// ── Scene 3: LIVE — onchain identity ───────────────────────────────────
const Identity: React.FC = () => (
  <Center>
    <Stamp text="LIVE" tone="live" at={6} />
    <Punch>
      <H>the agent&rsquo;s<br />onchain identity</H>
    </Punch>
    <Slide at={16}>
      <Sub>launched on Virtuals Protocol · verified on Base<br />1,000,000,000 supply · one official contract</Sub>
    </Slide>
  </Center>
);

// ── Scene 4: ROLLING OUT — bounties ────────────────────────────────────
const Bounties: React.FC = () => (
  <Center>
    <Stamp text="SOON" tone="soon" at={6} />
    <Punch>
      <H>ship code,<br />earn <span style={{ color: GREEN }}>$ONFABLE</span></H>
    </Punch>
    <Slide at={16}>
      <Sub>contributor bounties on the open-source repo —<br />the token pays the people who build the fable</Sub>
    </Slide>
  </Center>
);

// ── Scene 5: PLANNED — govern + unlock ─────────────────────────────────
const Future: React.FC = () => (
  <Center>
    <Stamp text="SOON" tone="soon" at={6} />
    <Punch>
      <H>vote the roadmap.<br />unlock hosted agents.</H>
    </Punch>
    <Slide at={16}>
      <Sub>token-weighted governance · cloud agents that run<br />while you sleep, gated with $ONFABLE</Sub>
    </Slide>
  </Center>
);

// ── Scene 6: outro ──────────────────────────────────────────────────────
const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 12 } });
  const pill = spring({ frame: frame - 24, fps, config: { damping: 15 } });
  return (
    <Center gap={30}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, transform: `scale(${p})` }}>
        <Mark size={92} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 110, color: GREEN, letterSpacing: -3 }}>$ONFABLE</div>
      </div>
      <Sub>utility first — on the network the agent already speaks</Sub>
      <div style={{ opacity: pill, transform: `translateY(${(1 - pill) * 20}px)`, fontFamily: MONO, fontSize: 30, color: MUTED, background: CARD, border: `1px solid ${EDGE}`, borderRadius: 12, padding: "16px 32px" }}>
        0xeC76…dc5D · verify before you ape
      </div>
      <div style={{ fontFamily: SANS, fontSize: 34, color: DIM }}>
        onfable.xyz/#token · the fable writes itself ✳
      </div>
    </Center>
  );
};

export const TokenUtility: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [615, 630], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#000", opacity: fadeOut }}>
      <Audio src={staticFile("utility.wav")} />
      <Sequence from={0} durationInFrames={90}><Question /></Sequence>
      <Sequence from={90} durationInFrames={120}><InAgent /></Sequence>
      <Sequence from={210} durationInFrames={90}><Identity /></Sequence>
      <Sequence from={300} durationInFrames={90}><Bounties /></Sequence>
      <Sequence from={390} durationInFrames={90}><Future /></Sequence>
      <Sequence from={480} durationInFrames={150}><Outro /></Sequence>
    </AbsoluteFill>
  );
};
