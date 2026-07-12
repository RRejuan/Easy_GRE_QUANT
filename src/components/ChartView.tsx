import type { Chart, ChartValue } from "../types";
import { evalFormula, resolveTemplateSegments } from "../lib/variables";

const SLICE_COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--variable)",
  "var(--chart-slice-4)",
  "var(--chart-slice-5)",
  "var(--chart-slice-6)",
];

interface ResolvedValue {
  value: number;
  isVariable: boolean;
}

function resolveValue(raw: ChartValue, values: Record<string, number>): ResolvedValue {
  if (typeof raw === "number") return { value: raw, isVariable: false };
  try {
    return { value: evalFormula(raw, values), isVariable: true };
  } catch {
    return { value: 0, isVariable: true };
  }
}

function ValueLabel({
  resolved,
  ...rest
}: { resolved: ResolvedValue } & React.SVGProps<SVGTextElement>) {
  return (
    <text {...rest}>
      <tspan className={resolved.isVariable ? "variable-value" : undefined}>{resolved.value}</tspan>
    </text>
  );
}

function CategoryLabel({
  text,
  vars,
  ...rest
}: { text: string; vars: Record<string, number> } & React.SVGProps<SVGTextElement>) {
  return (
    <text {...rest}>
      {resolveTemplateSegments(text, vars).map((segment, i) => (
        <tspan key={i} className={segment.isVariable ? "variable-value" : undefined}>
          {segment.text}
        </tspan>
      ))}
    </text>
  );
}

const WIDTH = 520;
const CHART_HEIGHT = 160;
const BASELINE = 190;
const LEFT_MARGIN = 40;

function BarChartView({
  chart,
  values,
}: {
  chart: Extract<Chart, { kind: "bar" }>;
  values: Record<string, number>;
}) {
  const resolved = chart.data.map((d) => ({ label: d.label, ...resolveValue(d.value, values) }));
  const maxValue = Math.max(...resolved.map((d) => d.value), 1);
  const n = resolved.length;
  const gap = 24;
  const barWidth = Math.min(72, (WIDTH - LEFT_MARGIN - 20 - gap * (n - 1)) / n);

  return (
    <svg className="data-chart" viewBox={`0 0 ${WIDTH} 220`} role="img" aria-label={chart.title ?? "Bar chart"}>
      {chart.title && (
        <text x={WIDTH / 2} y={16} textAnchor="middle" className="chart-title">
          {chart.title}
        </text>
      )}
      <line x1={LEFT_MARGIN} y1={BASELINE} x2={WIDTH - 10} y2={BASELINE} className="chart-baseline" />
      {resolved.map((d, i) => {
        const x = LEFT_MARGIN + 10 + i * (barWidth + gap);
        const barHeight = (d.value / maxValue) * CHART_HEIGHT;
        const y = BASELINE - barHeight;
        return (
          <g key={i}>
            <title>{`${d.label}: ${d.value}`}</title>
            <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 2)} rx={3} className="chart-bar" />
            <ValueLabel resolved={d} x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="chart-value-label" />
            <CategoryLabel
              text={d.label}
              vars={values}
              x={x + barWidth / 2}
              y={BASELINE + 18}
              textAnchor="middle"
              className="chart-axis-label"
            />
          </g>
        );
      })}
    </svg>
  );
}

function PieChartView({
  chart,
  values,
}: {
  chart: Extract<Chart, { kind: "pie" }>;
  values: Record<string, number>;
}) {
  const resolved = chart.data.map((d) => ({
    label: d.label,
    hideValue: d.hideValue ?? false,
    ...resolveValue(d.value, values),
  }));
  const total = resolved.reduce((sum, d) => sum + d.value, 0) || 1;
  const cx = 100;
  const cy = 105;
  const r = 80;

  let cumulativeAngle = -90;
  const slices = resolved.map((d, i) => {
    const sweep = (d.value / total) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sweep;
    cumulativeAngle = endAngle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = sweep > 180 ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { ...d, path, color: SLICE_COLORS[i % SLICE_COLORS.length] };
  });

  return (
    <svg className="data-chart data-chart-pie" viewBox="0 0 440 220" role="img" aria-label={chart.title ?? "Pie chart"}>
      {chart.title && (
        <text x={100} y={16} textAnchor="middle" className="chart-title">
          {chart.title}
        </text>
      )}
      {slices.map((slice, i) => (
        <path key={i} d={slice.path} fill={slice.color} stroke="var(--bg-card)" strokeWidth={1}>
          <title>{`${slice.label}: ${slice.value}%`}</title>
        </path>
      ))}
      <g transform="translate(200, 40)">
        {slices.map((slice, i) => (
          <g key={i} transform={`translate(0, ${i * 24})`}>
            <rect x={0} y={0} width={12} height={12} fill={slice.color} rx={2} />
            <text x={18} y={10} className="chart-axis-label chart-legend-label">
              {slice.label} —{" "}
              {slice.hideValue ? (
                "?"
              ) : (
                <>
                  <tspan className={slice.isVariable ? "variable-value" : undefined}>{slice.value}</tspan>%
                </>
              )}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function LineChartView({
  chart,
  values,
}: {
  chart: Extract<Chart, { kind: "line" }>;
  values: Record<string, number>;
}) {
  const resolved = chart.points.map((p) => ({ label: p.x, ...resolveValue(p.y, values) }));
  const maxValue = Math.max(...resolved.map((p) => p.value), 1);
  const minValue = Math.min(...resolved.map((p) => p.value), 0);
  const range = maxValue - minValue || 1;
  const n = resolved.length;
  const plotWidth = WIDTH - LEFT_MARGIN - 20;
  const stepX = n > 1 ? plotWidth / (n - 1) : 0;

  const coords = resolved.map((p, i) => {
    const plotX = LEFT_MARGIN + 10 + i * stepX;
    const plotY = BASELINE - ((p.value - minValue) / range) * CHART_HEIGHT;
    return { ...p, plotX, plotY };
  });
  const polylinePoints = coords.map((c) => `${c.plotX},${c.plotY}`).join(" ");

  return (
    <svg className="data-chart" viewBox={`0 0 ${WIDTH} 220`} role="img" aria-label={chart.title ?? "Line graph"}>
      {chart.title && (
        <text x={WIDTH / 2} y={16} textAnchor="middle" className="chart-title">
          {chart.title}
        </text>
      )}
      <line x1={LEFT_MARGIN} y1={BASELINE} x2={WIDTH - 10} y2={BASELINE} className="chart-baseline" />
      <polyline points={polylinePoints} className="chart-line" />
      {coords.map((c, i) => (
        <g key={i}>
          <title>{`${c.label}: ${c.value}`}</title>
          <circle cx={c.plotX} cy={c.plotY} r={4} className="chart-point" />
          <ValueLabel resolved={c} x={c.plotX} y={c.plotY - 10} textAnchor="middle" className="chart-value-label" />
          <CategoryLabel
            text={c.label}
            vars={values}
            x={c.plotX}
            y={BASELINE + 18}
            textAnchor="middle"
            className="chart-axis-label"
          />
        </g>
      ))}
    </svg>
  );
}

function TableChartView({
  chart,
  values,
}: {
  chart: Extract<Chart, { kind: "table" }>;
  values: Record<string, number>;
}) {
  const resolved = chart.data.map((d) => ({ label: d.label, ...resolveValue(d.value, values) }));
  return (
    <div className="table-wrap">
      {chart.title && <p className="chart-title chart-title-html">{chart.title}</p>}
      <table>
        <thead>
          <tr>
            <th>{chart.columns[0]}</th>
            <th>{chart.columns[1]}</th>
          </tr>
        </thead>
        <tbody>
          {resolved.map((row, i) => (
            <tr key={i}>
              <td>{row.label}</td>
              <td className={row.isVariable ? "variable-value" : undefined}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartView({ chart, values = {} }: { chart: Chart; values?: Record<string, number> }) {
  return (
    <div className="chart-wrap">
      {chart.kind === "bar" && <BarChartView chart={chart} values={values} />}
      {chart.kind === "pie" && <PieChartView chart={chart} values={values} />}
      {chart.kind === "line" && <LineChartView chart={chart} values={values} />}
      {chart.kind === "table" && <TableChartView chart={chart} values={values} />}
    </div>
  );
}
