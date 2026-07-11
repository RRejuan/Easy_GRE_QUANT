import type { Figure, FigureElement } from "../types";
import { resolveTemplateSegments } from "../lib/variables";

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
