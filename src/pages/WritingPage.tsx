import { Link } from "react-router-dom";

const PROMPTS = [
  "As people rely more on technology to solve problems, their ability to think for themselves will deteriorate. Write a response in which you discuss the extent to which you agree or disagree, and explain your reasoning.",
  "Governments should focus their spending on the arts as heavily as on public infrastructure. Discuss the extent to which you agree or disagree, and support your position with reasons and examples.",
  "The best way to teach is to praise positive actions and ignore negative ones. Discuss the extent to which you agree or disagree, addressing the most compelling objections to your view.",
  "A nation should require all its students to study the same national curriculum until they enter college. Write a response discussing your position and the reasoning behind it.",
  "Claim: Universities should require every student to take courses outside their major. Reason: Broad exposure produces more creative thinkers. Discuss the extent to which you agree with the claim and the reason on which it is based.",
  "The surest indicator of a great nation is the achievements of its leaders rather than those of its ordinary citizens. Discuss the extent to which you agree or disagree.",
  "People's behavior is largely determined by forces not of their own making. Write a response in which you take a position, developing it with specific reasons and examples.",
  "Competition for high grades seriously limits the quality of learning at all levels of education. Discuss the extent to which you agree or disagree, and explain your reasoning."
];

export function WritingPage() {
  return (
    <div className="skill-page writing-page">
      <Link to="/">&larr; Back to dashboard</Link>
      <h1>Analytical Writing</h1>

      <p>
        The GRE Analytical Writing measure is a single <strong>Analyze an
        Issue</strong> task. You are given a statement on a topic of general
        interest along with specific instructions, and you have{" "}
        <strong>30 minutes</strong> to plan and write a reasoned, well-supported
        response. There is no "correct" opinion — you are judged on how well you
        think and write, not on which side you take.
      </p>

      <h2>How it is scored</h2>
      <p>
        Essays receive a score from <strong>0 to 6 in half-point increments</strong>,
        assigned holistically by a trained rater together with a computer
        scoring system. A high-scoring essay:
      </p>
      <ul>
        <li>takes a clear position that directly answers the specific instructions;</li>
        <li>develops that position with well-chosen reasons and concrete examples;</li>
        <li>anticipates and addresses the strongest objections or complications;</li>
        <li>is organized logically, so each paragraph advances the argument;</li>
        <li>shows control of standard written English (grammar, variety, precision).</li>
      </ul>

      <h2>A structure that works</h2>
      <ol>
        <li><strong>Introduction:</strong> restate the issue in your own words and state your thesis (your position) plainly.</li>
        <li><strong>Body paragraphs (2–3):</strong> one reason each, each anchored by a specific example — historical, scientific, literary, or from experience.</li>
        <li><strong>Counterargument:</strong> concede a reasonable objection, then explain why your position still holds. This is what separates a 5 from a 4.</li>
        <li><strong>Conclusion:</strong> tie the reasons together; don't just repeat the intro.</li>
      </ol>

      <h2>Tips</h2>
      <ul>
        <li>Read the instructions carefully — "agree or disagree," "discuss the claim and the reason," and "address the most compelling objections" each ask for something different.</li>
        <li>Spend the first ~5 minutes planning, ~20 writing, ~5 reviewing.</li>
        <li>Prefer one developed example over three shallow ones. Specificity is persuasive.</li>
        <li>Complexity scores well: acknowledge that the issue depends on circumstances rather than treating it as all-or-nothing.</li>
      </ul>

      <h2>Practice prompts</h2>
      <p className="writing-hint">
        Essay auto-grading isn't built into the app yet. Pick a prompt, set a
        30-minute timer, write your response in a document, then score yourself
        against the rubric above.
      </p>
      <ol className="writing-prompts">
        {PROMPTS.map((prompt, i) => (
          <li key={i}>{prompt}</li>
        ))}
      </ol>
    </div>
  );
}
