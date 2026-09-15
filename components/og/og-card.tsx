import { BrandMark } from "@/components/og/brand-mark";

const DOT_GRID: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
};

export function OgCard({
  title,
  subtitle,
  footer,
}: {
  title: string;
  subtitle?: string;
  footer?: string;
}) {
  const titleSize = title.length > 42 ? 68 : title.length > 24 ? 80 : 96;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        color: "#fafafa",
        padding: 72,
        fontFamily: "Poppins",
      }}
    >
      <div style={DOT_GRID} />

      <div style={{ display: "flex", alignItems: "center", gap: 20, position: "relative", zIndex: 1 }}>
        <BrandMark size={56} />
        <div style={{ fontSize: 26, fontWeight: 500, color: "#f46c38", letterSpacing: 1 }}>
          revy.my.id
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flex: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ fontSize: titleSize, fontWeight: 900, lineHeight: 1.12, maxWidth: 980 }}>
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              fontSize: 30,
              fontWeight: 500,
              color: "#a1a1aa",
              marginTop: 24,
              lineHeight: 1.45,
              maxWidth: 900,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {footer ? (
        <div style={{ fontSize: 22, fontWeight: 500, color: "#71717a", position: "relative", zIndex: 1 }}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}
