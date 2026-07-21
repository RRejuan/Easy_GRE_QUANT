import { Link } from "react-router-dom";
import type { SkillGroup } from "../lib/content";
import { MasteryBar } from "./MasteryBar";

/**
 * Renders the four content areas as collapsible sections (native <details>),
 * each summary showing the area's name, skill count, and overall mastery.
 * Collapsed by default so the full ~50-skill list doesn't overwhelm the page;
 * the area mastery bars still give an at-a-glance overview while collapsed.
 */
export function SkillAreaList({
  groups,
  masteryForSkill,
  defaultOpen = false,
}: {
  groups: SkillGroup[];
  masteryForSkill: (skillId: string) => number;
  defaultOpen?: boolean;
}) {
  return (
    <div className="skill-area-list">
      {groups.map((group) => {
        const areaSkills = group.topics.flatMap((t) => t.skills);
        const areaMastery =
          areaSkills.length === 0
            ? 0
            : Math.round(
                areaSkills.reduce((sum, s) => sum + masteryForSkill(s.id), 0) /
                  areaSkills.length,
              );

        return (
          <details key={group.area} className="skill-area" open={defaultOpen}>
            <summary className="skill-area-summary">
              <span className="skill-area-chevron" aria-hidden="true">
                ▸
              </span>
              <span className="skill-area-name">{group.area}</span>
              <span className="skill-area-count">
                {areaSkills.length} skill{areaSkills.length === 1 ? "" : "s"}
              </span>
              <MasteryBar percent={areaMastery} />
            </summary>
            <div className="skill-area-body">
              {group.topics.map((topicGroup) => (
                <div key={topicGroup.topic} className="skill-topic">
                  <h3>{topicGroup.topic}</h3>
                  <ul>
                    {topicGroup.skills.map((skill) => (
                      <li key={skill.id}>
                        <Link to={`/skill/${skill.id}`}>{skill.name}</Link>{" "}
                        <MasteryBar percent={masteryForSkill(skill.id)} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
