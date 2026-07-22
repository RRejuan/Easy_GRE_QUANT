import { useState } from "react";
import type { VocabWord } from "../../types";

type StoryPart =
  | { type: "text"; text: string }
  | { type: "term"; id: string; display: string };

/** Splits a story on [[wordId|display]] tokens (display optional). */
function parseStory(story: string, byId: Map<string, VocabWord>): StoryPart[] {
  const parts: StoryPart[] = [];
  const tokenRe = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tokenRe.exec(story)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: story.slice(lastIndex, match.index) });
    }
    const id = match[1].trim();
    const display = (match[2] ?? byId.get(id)?.word ?? id).trim();
    parts.push({ type: "term", id, display });
    lastIndex = tokenRe.lastIndex;
  }
  if (lastIndex < story.length) {
    parts.push({ type: "text", text: story.slice(lastIndex) });
  }
  return parts;
}

/** Renders a lesson story with each target word highlighted; tapping one
 * reveals its definition below the passage. */
export function VocabStory({
  story,
  words,
}: {
  story: string;
  words: VocabWord[];
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const byId = new Map(words.map((w) => [w.id, w]));
  const parts = parseStory(story, byId);
  const active = activeId ? byId.get(activeId) : undefined;

  return (
    <div className="vocab-story">
      <p className="vocab-story-text">
        {parts.map((part, i) =>
          part.type === "text" ? (
            <span key={i}>{part.text}</span>
          ) : (
            <button
              key={i}
              type="button"
              className={`vocab-term${activeId === part.id ? " vocab-term-active" : ""}`}
              onClick={() =>
                setActiveId((cur) => (cur === part.id ? null : part.id))
              }
            >
              {part.display}
            </button>
          ),
        )}
      </p>
      {active && (
        <p className="vocab-term-pop">
          <strong>{active.word}</strong> <em>{active.partOfSpeech}</em> —{" "}
          {active.definition}
        </p>
      )}
    </div>
  );
}
