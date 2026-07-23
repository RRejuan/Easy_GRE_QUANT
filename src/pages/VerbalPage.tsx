import { groupSkillsByAreaAndTopic, skillsWithContentInSection } from "../lib/content";
import { skillMasteryPercent } from "../lib/mastery";
import { SkillAreaList } from "../components/SkillAreaList";

export function VerbalPage() {
  const groups = groupSkillsByAreaAndTopic(skillsWithContentInSection("Verbal"));

  return (
    <div className="skill-list-page">
      <h1>Verbal Reasoning</h1>
      <p className="skill-list-hint">
        Practice the three GRE verbal question types — Text Completion,
        Sentence Equivalence, and Reading Comprehension. Pick an area to expand
        its skills.
      </p>
      {groups.length === 0 ? (
        <p>Verbal practice is coming soon.</p>
      ) : (
        <SkillAreaList groups={groups} masteryForSkill={skillMasteryPercent} />
      )}
    </div>
  );
}
