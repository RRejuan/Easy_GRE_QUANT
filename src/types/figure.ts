export interface FigurePoint {
  x: number;
  y: number;
}

export type FigureElement =
  | { kind: "line"; from: FigurePoint; to: FigurePoint; dashed?: boolean }
  | { kind: "polygon"; points: FigurePoint[] }
  | { kind: "circle"; center: FigurePoint; radius: number }
  | { kind: "label"; at: FigurePoint; text: string }
  | { kind: "rightAngleMarker"; at: FigurePoint; rotation?: number };

export interface Figure {
  viewBox: string;
  elements: FigureElement[];
}
