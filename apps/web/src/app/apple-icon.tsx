import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000",
          borderRadius: 40,
        }}
      >
        <svg
          width="110"
          height="110"
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
      </div>
    ),
    { ...size },
  );
}
