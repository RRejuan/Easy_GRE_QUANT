export interface DISet {
  id: string;
  title: string;
  /** Shared prompt describing the figure/table (may contain LaTeX and Markdown). */
  contextMarkdown: string;
  imageUrl?: string;
}
