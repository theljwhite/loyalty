interface SpinnerProps {
  size: number;
  color?: string;
}

export const SpinnerOne = ({ size, color }: SpinnerProps): JSX.Element => (
  <div className="flex items-center justify-center text-primary-1">
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#fc6767" />
        </filter>
      </defs>
      <circle
        className="spinner"
        style={{
          fill: "transparent",
          stroke: color ?? "currentColor",
          strokeWidth: "7px",
        }}
        cx="50"
        cy="50"
        r="45"
      />
    </svg>
  </div>
);
