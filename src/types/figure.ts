export interface FigurePoint {
  x: number;
  y: number;
}

export type FigureElement =
  | { kind: "line"; from: FigurePoint; to: FigurePoint; dashed?: boolean }
  | { kind: "polygon"; points: FigurePoint[] }
  | { kind: "circle"; center: FigurePoint; radius: number }
  | { kind: "label"; at: FigurePoint; text: string }
  | { kind: "rightAngleMarker"; at: FigurePoint; rotation?: number }
  /** A filled circular sector (pie-slice), for circle/arc/sector geometry problems. Angles in degrees, measured clockwise from due east (3 o'clock), matching screen-space SVG y-down convention. */
  | {
      kind: "arc";
      center: FigurePoint;
      radius: number;
      startAngle: number;
      endAngle: number;
    }
  /** A short perpendicular tick mark on a segment's midpoint, used to show congruent sides. `count` (1-3) draws that many parallel ticks. */
  | { kind: "tickMark"; from: FigurePoint; to: FigurePoint; count?: 1 | 2 | 3 };

export interface Figure {
  viewBox: string;
  elements: FigureElement[];
}
