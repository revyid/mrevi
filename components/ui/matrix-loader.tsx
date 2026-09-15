/**
 * MatrixLoader — 5×5 dot-matrix pulse animation.
 * Uses Tailwind CSS custom keyframes defined in globals.css (dmx-pulse).
 * Falls back to inline style for standalone pages that don't load globals.css.
 */

interface MatrixLoaderProps {
  /** Visual size of each dot in pixels. Default 6. */
  dotSize?: number;
  /** Gap between dots in pixels. Default 3. */
  gap?: number;
  /** Base color of the dots. Default "currentColor". */
  color?: string;
  className?: string;
}

// Delays mirror the diagonal wave pattern used in not-found.tsx
const DELAYS = [
  0, 0.07, 0.14, 0.21, 0.28,
  0.56, 0.49, 0.42, 0.35, 0.28,
  0.56, 0.63, 0.70, 0.77, 0.84,
  1.12, 1.05, 0.98, 0.91, 0.84,
  1.12, 1.19, 1.26, 1.33, 1.40,
];

export function MatrixLoader({
  dotSize = 6,
  gap = 3,
  color = "currentColor",
  className = "",
}: MatrixLoaderProps) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(5, ${dotSize}px)`,
        gap: `${gap}px`,
      }}
    >
      {DELAYS.map((delay, i) => (
        <span
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: color,
            animation: `dmx-pulse 1.1s ease-in-out ${delay}s infinite`,
            opacity: 0.08,
          }}
        />
      ))}
    </div>
  );
}
