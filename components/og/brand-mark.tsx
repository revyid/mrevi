export function BrandMark({ size, padding = 0 }: { size: number; padding?: number }) {
  const inner = Math.max(size - padding * 2, 1);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        borderRadius: Math.round(size * 0.22),
        padding,
      }}
    >
      <div
        style={{
          fontSize: Math.round(inner * 0.62),
          fontWeight: 900,
          fontFamily: "Poppins",
          color: "#fafafa",
          lineHeight: 1,
        }}
      >
        R
      </div>
    </div>
  );
}
