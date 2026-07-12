import type { Figure, FigureElement, FigurePoint } from "../types";
import { resolveTemplateSegments } from "../lib/variables";

function polarToCartesian(center: FigurePoint, radius: number, angleDeg: number): FigurePoint {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: center.x + radius * Math.cos(angleRad),
    y: center.y + radius * Math.sin(angleRad),
  };
}

function sectorPath(
  center: FigurePoint,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(center, radius, startAngle);
  const end = polarToCartesian(center, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    `M ${center.x} ${center.y}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function tickMarkOffsets(from: FigurePoint, to: FigurePoint, count: 1 | 2 | 3) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const tickHalfLen = 6;
  const spacing = 4;
  const centerOffsets = count === 1 ? [0] : count === 2 ? [-spacing / 2, spacing / 2] : [-spacing, 0, spacing];
  return centerOffsets.map((offset) => {
    const cx = midX + ux * offset;
    const cy = midY + uy * offset;
    return {
      x1: cx - px * tickHalfLen,
      y1: cy - py * tickHalfLen,
      x2: cx + px * tickHalfLen,
      y2: cy + py * tickHalfLen,
    };
  });
}

function renderElement(
  element: FigureElement,
  index: number,
  values: Record<string, number>,
) {
  switch (element.kind) {
    case "line":
      return (
        <line
          key={index}
          x1={element.from.x}
          y1={element.from.y}
          x2={element.to.x}
          y2={element.to.y}
          strokeWidth={1.5}
          strokeDasharray={element.dashed ? "4 3" : undefined}
        />
      );
    case "polygon":
      return (
        <polygon
          key={index}
          points={element.points.map((p) => `${p.x},${p.y}`).join(" ")}
          strokeWidth={1.5}
        />
      );
    case "circle":
      return (
        <circle
          key={index}
          cx={element.center.x}
          cy={element.center.y}
          r={element.radius}
          strokeWidth={1.5}
        />
      );
    case "label":
      return (
        <text key={index} x={element.at.x} y={element.at.y}>
          {resolveTemplateSegments(element.text, values).map((segment, segIndex) => (
            <tspan
              key={segIndex}
              className={segment.isVariable ? "variable-value" : undefined}
            >
              {segment.text}
            </tspan>
          ))}
        </text>
      );
    case "rightAngleMarker": {
      const size = 8;
      const rotation = element.rotation ?? 0;
      return (
        <rect
          key={index}
          x={element.at.x}
          y={element.at.y - size}
          width={size}
          height={size}
          strokeWidth={1}
          transform={`rotate(${rotation} ${element.at.x} ${element.at.y})`}
        />
      );
    }
    case "arc":
      return (
        <path
          key={index}
          d={sectorPath(element.center, element.radius, element.startAngle, element.endAngle)}
          strokeWidth={1.5}
        />
      );
    case "tickMark":
      return (
        <g key={index}>
          {tickMarkOffsets(element.from, element.to, element.count ?? 1).map((tick, tickIndex) => (
            <line
              key={tickIndex}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              strokeWidth={1.5}
            />
          ))}
        </g>
      );
  }
}

export function FigureView({
  figure,
  values = {},
}: {
  figure: Figure;
  values?: Record<string, number>;
}) {
  return (
    <div className="figure-wrap">
      <svg viewBox={figure.viewBox} xmlns="http://www.w3.org/2000/svg">
        {figure.elements.map((element, index) => renderElement(element, index, values))}
      </svg>
    </div>
  );
}
