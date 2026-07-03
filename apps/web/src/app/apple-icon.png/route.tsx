import { ImageResponse } from "next/og";

/** iOS ignores alpha on apple-touch-icon and applies its own rounding, so this
 * stays a fully opaque square — no transparency, no pre-rounded corners. */
export async function GET() {
  const size = 180;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #818cf8, #6366f1)",
        }}
      >
        <div
          style={{
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: size * 0.42,
            color: "#0e1116",
          }}
        >
          ~/
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
