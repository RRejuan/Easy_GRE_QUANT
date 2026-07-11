import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * Renders text containing \(...\) delimited inline math, e.g.
 * "The area is \(\pi r^2\)." Uses \( \) rather than $ $ because question
 * text routinely contains literal dollar amounts (e.g. "$40"), which would
 * otherwise be misread as math delimiters.
 */
export function MathText({ text }: { text: string }) {
  const parts = text.split(/(\\\([\s\S]*?\\\))/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("\\(") && part.endsWith("\\)")) {
          return <InlineMath key={index} math={part.slice(2, -2)} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}
