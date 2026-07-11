import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/** Renders text containing $...$ delimited inline math, e.g. "The area is $\\pi r^2$." */
export function MathText({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          return <InlineMath key={index} math={part.slice(1, -1)} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
