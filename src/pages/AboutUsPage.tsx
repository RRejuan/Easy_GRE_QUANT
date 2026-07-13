import { Link } from "react-router-dom";

export function AboutUsPage() {
  return (
    <div className="skill-page about-gre-page">
      <h1>About Us</h1>

      <h2>Why this exists</h2>
      <p>
        I built the first version of this app for my wife.
      </p>
      <p>
        She was studying for the GRE, working through practice sets that felt
        like an enormous, undifferentiated pile of questions — some too easy,
        some she'd already mastered, some testing something she'd never
        actually been taught, with no real sense of which specific skill
        needed the work. I have a PhD in mathematics and I teach college math
        for a living, so I did what I do with my own students: broke the
        material down into the actual, individual skills being tested, and
        built a way to practice each one specifically until it was solid.
      </p>
      <p>
        That became the idea behind everything here.
      </p>

      <h2>Our philosophy</h2>
      <p>
        The GRE Quant section doesn't reward doing more math — it rewards
        getting the right answer, reliably, inside a strict time limit.
        Those are not the same skill. A large number of GRE Quant questions
        can be answered correctly without grinding through a full textbook
        derivation: by backsolving from the answer choices, plugging in
        convenient numbers, eliminating what can't be right, or simply using
        number sense. That isn't cheating the test — it's understanding it.
        So every question here that has a genuine shortcut ships with two
        solutions: the standard one, so you actually understand the
        underlying math, and the shortcut, so you know the faster path a
        strong test-taker would actually use on test day.
      </p>
      <p>
        Everything else follows from that same idea. Skills are tracked
        individually, so you always know exactly what's weak instead of
        guessing. Practice is recommended from your own mastery map instead
        of a fixed, one-size-fits-all sequence. And the{" "}
        <Link to="/mock-test">Mock Test</Link> is built to mirror the real
        GRE's section-level adaptivity as closely as possible, so a score
        estimate here actually means something — because the goal was never
        "more practice." It's the best score you're capable of, and getting
        there as efficiently as your time allows.
      </p>
      <p>
        This is a free, ad-free, self-study tool. It started as something
        built for one person studying for one test. If it helps you too,
        that's the whole point.
      </p>

      <h2>Contact</h2>
      <p>
        Every question on this site is written and reviewed by hand — if you
        spot an error, an unclear explanation, or have a suggestion, the
        fastest way to reach me is to{" "}
        <a
          href="https://github.com/RRejuan/Easy_GRE_QUANT/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          open an issue on GitHub
        </a>
        . I read every one.
      </p>
    </div>
  );
}
