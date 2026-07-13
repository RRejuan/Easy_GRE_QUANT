import { Link } from "react-router-dom";

export function AboutGrePage() {
  return (
    <div className="skill-page about-gre-page">
      <h1>All About GRE</h1>
      <p>
        A plain-language guide to the GRE General Test as of 2026: what it
        is, how to register, what to expect on test day, and how scoring
        actually works. This page is written to be understandable whether
        you've never heard of the GRE before or you're deep into prep.
      </p>

      <h2>What is the GRE?</h2>
      <p>
        The GRE (Graduate Record Examinations) General Test is a
        standardized test used by graduate schools and business schools
        around the world as one factor in admissions decisions. It measures
        three things: Verbal Reasoning, Quantitative Reasoning, and
        Analytical Writing. It is not tied to any specific field of study —
        separate GRE Subject Tests exist for that, and are far less commonly
        required.
      </p>

      <h2>Format &amp; timing (2026)</h2>
      <p>
        In September 2023, ETS shortened the GRE substantially. The current
        test takes about <strong>1 hour 58 minutes</strong> total, with no
        unscored "experimental" section and much faster score reporting than
        the old format.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Section</th>
              <th>Content</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Analytical Writing</td>
              <td>1 task: "Analyze an Issue" essay</td>
              <td>30 minutes</td>
            </tr>
            <tr>
              <td>Verbal Reasoning</td>
              <td>2 sections, 27 questions total</td>
              <td>~41 minutes total</td>
            </tr>
            <tr>
              <td>Quantitative Reasoning</td>
              <td>
                Section 1: 12 questions
                <br />
                Section 2: 15 questions
              </td>
              <td>
                21 minutes
                <br />
                26 minutes
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The "Analyze an Argument" essay task was removed in 2023 — Analytical
        Writing is now just the one Issue task. Verbal and Quant sections may
        appear in either order, and can vary in exact timing slightly by
        test administration; the numbers above are the standard current
        format.
      </p>

      <h2>How section-level adaptivity works</h2>
      <p>
        The GRE is <em>section-adaptive</em>, not question-by-question
        adaptive. Within Quant (and separately within Verbal), your first
        section is always calibrated to medium difficulty. How well you do
        on it determines whether your second section is drawn from an easy,
        medium, or hard pool of questions:
      </p>
      <ul>
        <li>Do well on section 1 → section 2 is <strong>hard</strong>, unlocking the full 130–170 scoring range.</li>
        <li>Do okay → section 2 is <strong>medium</strong>, capping your ceiling somewhat lower.</li>
        <li>Struggle → section 2 is <strong>easy</strong>, capping your ceiling considerably lower.</li>
      </ul>
      <p>
        This is exactly why this app's own{" "}
        <Link to="/mock-test">Mock Test</Link> mirrors that structure: your
        Quant Section 1 performance determines which difficulty tier of
        Section 2 you get, just like the real test.
      </p>

      <h2>How to register</h2>
      <ol>
        <li>
          Create an account at{" "}
          <strong>ets.org/gre</strong> (the name on the account must exactly
          match the ID you'll bring on test day).
        </li>
        <li>Choose the GRE General Test and select a test date and location.</li>
        <li>Pick a delivery option: an in-person test center, or at-home testing.</li>
        <li>Pay the registration fee online to confirm your seat.</li>
      </ol>
      <p>
        Test centers and at-home appointment slots fill up, especially near
        application deadlines — register several weeks ahead if you can.
        Rescheduling and cancellation are both possible for a fee up to a
        few days before your appointment; exact current fees and deadlines
        are shown in your ETS account when you manage your registration.
      </p>

      <h3>Test center vs. at-home testing</h3>
      <p>
        You can take the GRE either at an authorized test center or at home
        via remote proctoring (webcam + ID check, in a quiet private room
        free of other people, papers, or a second monitor). Both options
        cost the same, use the identical test content and timing, and follow
        the identical scoring timeline — pick whichever is more convenient
        and reliable for your setup (a stable internet connection matters a
        lot for at-home testing).
      </p>

      <h2>Cost</h2>
      <p>
        The standard GRE General Test fee is <strong>$220 USD</strong> in
        most countries. A few countries have different pricing set by ETS —
        notably China ($231.30) and India (₹22,500). Fees are set by ETS and
        can change, so treat these as a current ballpark and confirm the
        exact number for your country when you register.
      </p>

      <h2>What to prepare</h2>
      <ul>
        <li>
          <strong>Quantitative Reasoning</strong>: arithmetic, algebra,
          geometry, and data analysis — exactly the four areas this app is
          organized around. An on-screen 4-function calculator (with square
          root) is provided during the Quant sections; you cannot bring your
          own.
        </li>
        <li>
          <strong>Verbal Reasoning</strong>: reading comprehension, text
          completion, and sentence equivalence — mostly a test of how
          precisely you can reason about what a passage or sentence
          actually says, plus vocabulary in context.
        </li>
        <li>
          <strong>Analytical Writing</strong>: one 30-minute essay analyzing
          an issue and building a persuasive, well-organized argument about
          it.
        </li>
      </ul>
      <p>
        Bring a valid, unexpired, government-issued photo ID that exactly
        matches the name on your ETS account. Arrive early for test-center
        appointments; for at-home testing, complete the equipment check well
        before your start time.
      </p>

      <h2>Scoring &amp; evaluation</h2>
      <ul>
        <li>Verbal Reasoning: 130–170, in 1-point increments.</li>
        <li>Quantitative Reasoning: 130–170, in 1-point increments.</li>
        <li>Analytical Writing: 0–6, in half-point increments, scored by a mix of trained human raters and an automated essay-scoring engine.</li>
      </ul>
      <p>
        You'll see your unofficial Verbal and Quant scores immediately after
        finishing the test — but not your Analytical Writing score, since
        essay scoring takes longer. Official scores (including AWA) show up
        in your ETS account, with an email notification, about{" "}
        <strong>8–10 days</strong> after your test date. GRE scores remain
        valid and reportable to schools for <strong>5 years</strong> from
        your test date. ETS's ScoreSelect feature lets you choose which
        test date's scores to send to each school, so a weaker attempt
        doesn't have to follow you around.
      </p>

      <h2>Approximately how many correct answers gives what score?</h2>
      <p>
        ETS does not publish an official raw-score-to-scaled-score table —
        the conversion is proprietary and depends on which difficulty tier
        your second section drew from. That said, test-prep data collected
        over many administrations gives a reasonably reliable approximate
        picture for Quant (27 questions total across both sections):
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Section 2 difficulty</th>
              <th>Roughly this many correct (of 27)</th>
              <th>Approximate scaled score</th>
            </tr>
          </thead>
          <tbody>
            <tr><td rowSpan={2}>Hard (best case)</td><td>24–27</td><td>165–170</td></tr>
            <tr><td>18–23</td><td>155–164</td></tr>
            <tr><td rowSpan={2}>Medium</td><td>20–27</td><td>150–158</td></tr>
            <tr><td>12–19</td><td>140–149</td></tr>
            <tr><td rowSpan={2}>Easy (weakest case)</td><td>20–27</td><td>141–151</td></tr>
            <tr><td>&lt;20</td><td>130–140</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        The headline takeaway: <strong>hitting the hard second section
        matters more than anything else</strong> for reaching a high Quant
        score, because the easy and medium tiers cap your ceiling regardless
        of how many of their (easier) questions you get right. Answering at
        least 8 of the 12 Section 1 questions correctly gives you a real
        shot at the hard tier. This is an approximation, not an ETS-verified
        table — treat it as directional, the same way this app's own{" "}
        <Link to="/mock-test">Mock Test</Link> score estimate is directional
        rather than official.
      </p>
    </div>
  );
}
