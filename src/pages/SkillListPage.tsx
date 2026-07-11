import { Link } from "react-router-dom";
import { groupSkillsByAreaAndTopic, skillsWithContent } from "../lib/content";
import { storageAdapter } from "../lib/storage";
import { computeMastery } from "../lib/mastery";

export function SkillListPage() {
  const groups = groupSkillsByAreaAndTopic(skillsWithContent());

  return (
    <div className="skill-list-page">
      <h1>GRE Quant — Skills</h1>
      {groups.map((group) => (
        <section key={group.area}>
          <h2>{group.area}</h2>
          {group.topics.map((topicGroup) => (
            <div key={topicGroup.topic}>
              <h3>{topicGroup.topic}</h3>
              <ul>
                {topicGroup.skills.map((skill) => {
                  const mastery = storageAdapter.getSkillMastery(skill.id);
                  return (
                    <li key={skill.id}>
                      <Link to={`/skill/${skill.id}`}>{skill.name}</Link>
                      {" — mastery: "}
                      {mastery ? computeMastery(mastery) : 0}%
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
