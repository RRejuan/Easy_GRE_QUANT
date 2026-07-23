import { Link } from "react-router-dom";
import {
  groupSkillsByAreaAndTopic,
  skillsWithContentInSection,
} from "../lib/content";
import { resetProgress } from "../lib/storage";
import { skillMasteryPercent } from "../lib/mastery";
import { recommendNextSkill } from "../lib/recommend";
import { SkillAreaList } from "../components/SkillAreaList";
import { MasteryBar } from "../components/MasteryBar";

function averageMastery(skillIds: string[]): number {
  if (skillIds.length === 0) return 0;
  const total = skillIds.reduce((sum, id) => sum + skillMasteryPercent(id), 0);
  return Math.round(total / skillIds.length);
}

export function DashboardPage() {
  const quantSkills = skillsWithContentInSection("Quant");
  const verbalSkills = skillsWithContentInSection("Verbal");

  const quantMastery = averageMastery(quantSkills.map((s) => s.id));
  const verbalMastery = averageMastery(verbalSkills.map((s) => s.id));
  const attempted = quantSkills.filter((s) => skillMasteryPercent(s.id) > 0).length;

  const recommended = recommendNextSkill();
  const quantGroups = groupSkillsByAreaAndTopic(quantSkills);
  const verbalGroups = groupSkillsByAreaAndTopic(verbalSkills);

  function handleResetProgress() {
    const confirmed = window.confirm(
      "Reset all your progress? This clears every skill's mastery and attempt history and cannot be undone.",
    );
    if (!confirmed) return;
    resetProgress();
    window.location.reload();
  }

  return (
    <div className="skill-page dashboard-page">
      <h1>Dashboard</h1>
      <p className="dash-intro">
        The GRE has three measures. Track your progress in each below.
      </p>

      <details className="dash-section" open>
        <summary className="dash-section-summary">
          <span className="dash-section-chevron" aria-hidden="true">▸</span>
          <span className="dash-section-title">Quantitative Reasoning</span>
          <MasteryBar percent={quantMastery} />
        </summary>
        <div className="dash-section-body">
          <div className="mock-test-cta">
            <p>
              Take a quick diagnostic spanning all four areas to seed your
              mastery map, or jump into a full, timed, section-adaptive mock
              test matching the real GRE Quant format.
            </p>
            <div className="cta-button-row">
              <Link to="/diagnostic" className="cta-button">
                Start the diagnostic
              </Link>
              <Link to="/mock-test" className="cta-button">
                Take a full mock test
              </Link>
            </div>
          </div>
          <p>
            {quantMastery}% average across {quantSkills.length} skills (
            {attempted} attempted).
          </p>
          {recommended && (
            <p>
              Recommended next:{" "}
              <Link to={`/skill/${recommended.id}`}>{recommended.name}</Link>
            </p>
          )}
          <SkillAreaList
            groups={quantGroups}
            masteryForSkill={skillMasteryPercent}
          />
        </div>
      </details>

      <details className="dash-section">
        <summary className="dash-section-summary">
          <span className="dash-section-chevron" aria-hidden="true">▸</span>
          <span className="dash-section-title">Verbal Reasoning</span>
          <MasteryBar percent={verbalMastery} />
        </summary>
        <div className="dash-section-body">
          <p>
            Practice the three verbal question types, or build the vocabulary
            that Text Completion and Sentence Equivalence lean on.
          </p>
          <div className="cta-button-row">
            <Link to="/verbal" className="cta-button">
              Verbal practice
            </Link>
            <Link to="/vocab" className="cta-button">
              Vocabulary
            </Link>
          </div>
          {verbalGroups.length > 0 && (
            <SkillAreaList
              groups={verbalGroups}
              masteryForSkill={skillMasteryPercent}
            />
          )}
        </div>
      </details>

      <details className="dash-section">
        <summary className="dash-section-summary">
          <span className="dash-section-chevron" aria-hidden="true">▸</span>
          <span className="dash-section-title">Analytical Writing</span>
        </summary>
        <div className="dash-section-body">
          <p>
            The GRE's one essay task asks you to analyze an issue in 30 minutes.
            Read the task, study the scoring, and practice with real-style
            prompts.
          </p>
          <div className="cta-button-row">
            <Link to="/writing" className="cta-button">
              Analytical Writing
            </Link>
          </div>
        </div>
      </details>

      <div className="danger-zone">
        <button type="button" className="reset-progress-button" onClick={handleResetProgress}>
          Reset progress
        </button>
        <p className="danger-zone-hint">
          Clears your mastery and attempt history. For signed-in accounts this
          also clears your synced cloud progress.
        </p>
      </div>
    </div>
  );
}
