export interface AreaMasteryDatum {
  area: string;
  mastery: number;
}

const WIDTH = 520;
const CHART_HEIGHT = 160;
const BASELINE = 180;
const BAR_WIDTH = 72;
const GAP = 36;

export function AreaMasteryChart({ data }: { data: AreaMasteryDatum[] }) {
  return (
    <svg
      className="area-mastery-chart"
      viewBox={`0 0 ${WIDTH} 210`}
      role="img"
      aria-label="Mastery percentage by content area"
    >
      <line
        x1={30}
        y1={BASELINE}
        x2={WIDTH - 10}
        y2={BASELINE}
        className="chart-baseline"
      />
      {data.map((d, i) => {
        const x = 40 + i * (BAR_WIDTH + GAP);
        const barHeight = (Math.max(0, Math.min(100, d.mastery)) / 100) * CHART_HEIGHT;
        const y = BASELINE - barHeight;
        return (
          <g key={d.area}>
            <title>{`${d.area}: ${d.mastery}%`}</title>
            <rect
              x={x}
              y={y}
              width={BAR_WIDTH}
              height={Math.max(barHeight, 2)}
              rx={4}
              className="chart-bar"
            />
            <text x={x + BAR_WIDTH / 2} y={y - 8} textAnchor="middle" className="chart-value-label">
              {d.mastery}%
            </text>
            <text
              x={x + BAR_WIDTH / 2}
              y={BASELINE + 20}
              textAnchor="middle"
              className="chart-axis-label"
            >
              {d.area}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
