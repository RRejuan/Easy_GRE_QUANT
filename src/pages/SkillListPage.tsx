import { groupSkillsByAreaAndTopic, skillsWithContentInSection } from "../lib/content";
import { skillMasteryPercent } from "../lib/mastery";
import { SkillAreaList } from "../components/SkillAreaList";

export function SkillListPage() {
  const groups = groupSkillsByAreaAndTopic(skillsWithContentInSection("Quant"));

  return (
    <div className="skill-list-page">
      <h1>Quant Skills</h1>
      <p className="skill-list-hint">
        Pick an area to expand its topics and skills.
      </p>
      <SkillAreaList groups={groups} masteryForSkill={skillMasteryPercent} />
    </div>
  );
}
