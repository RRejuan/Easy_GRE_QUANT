/** A numeric field that may be a literal number or a `{{expr}}` template string resolved against a question's variables. */
export type ChartValue = number | string;

export interface BarChartDatum {
  label: string;
  value: ChartValue;
}

export interface BarChart {
  kind: "bar";
  title?: string;
  yLabel?: string;
  data: BarChartDatum[];
}

export interface PieChartDatum {
  label: string;
  /** Percent of the whole (0-100). Slices are drawn in array order, clockwise from the top. */
  value: ChartValue;
  /** When true, the slice is drawn at its correct proportional size but its percent is shown as "?" in the legend -- for questions that ask the student to compute a missing/remainder percentage rather than just read it off. */
  hideValue?: boolean;
}

export interface PieChart {
  kind: "pie";
  title?: string;
  data: PieChartDatum[];
}

export interface LineChartPoint {
  x: string;
  y: ChartValue;
}

export interface LineChart {
  kind: "line";
  title?: string;
  yLabel?: string;
  points: LineChartPoint[];
}

export type Chart = BarChart | PieChart | LineChart;
