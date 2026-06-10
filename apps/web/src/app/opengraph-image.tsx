import { ImageResponse } from "next/og";

export const alt = "onfable — the open-source AI agent that lives in your terminal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          color: "#fff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg
            width="96"
            height="96"
            viewBox="0 0 32 32"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="16" y1="5" x2="16" y2="27" />
            <line x1="5" y1="16" x2="27" y2="16" />
            <line x1="8.2" y1="8.2" x2="23.8" y2="23.8" />
            <line x1="23.8" y1="8.2" x2="8.2" y2="23.8" />
          </svg>
          <div style={{ fontSize: 96, fontWeight: 500, letterSpacing: -3 }}>
            onfable
          </div>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 34,
            color: "#a1a1aa",
            textAlign: "center",
          }}
        >
          Your machine. Your agent. Your story.
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            padding: "16px 28px",
            border: "1px solid #27272a",
            borderRadius: 12,
            background: "#0a0a0b",
            fontSize: 26,
            color: "#e4e4e7",
            fontFamily: "monospace",
          }}
        >
          curl -fsSL onfable.xyz/install.sh | sh
        </div>
      </div>
    ),
    { ...size },
  );
}
