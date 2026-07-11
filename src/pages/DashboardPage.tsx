import { Link } from "react-router-dom";
import { groupSkillsByAreaAndTopic, skillsWithContent } from "../lib/content";
import { storageAdapter } from "../lib/storage";
import { computeMastery } from "../lib/mastery";
import { recommendNextSkill } from "../lib/recommend";

export function DashboardPage() {
  const skills = skillsWithContent();
  const masteryBySkill = new Map(
    skills.map((skill) => {
      const state = storageAdapter.getSkillMastery(skill.id);
      return [skill.id, state ? computeMastery(state) : 0];
    }),
  );

  const attempted = [...masteryBySkill.values()].filter((m) => m > 0);
  const overallMastery =
    skills.length === 0
      ? 0
      : Math.round(
          [...masteryBySkill.values()].reduce((a, b) => a + b, 0) /
            skills.length,
        );

  const recommended = recommendNextSkill();
  const groups = groupSkillsByAreaAndTopic(skills);

  return (
    <div className="skill-page">
      <Link to="/">&larr; Back to skill list</Link>
      <h1>Dashboard</h1>

      <p>
        Overall mastery: {overallMastery}% across {skills.length} skills (
        {attempted.length} attempted).
      </p>

      {recommended && (
        <p>
          Recommended next: <Link to={`/skill/${recommended.id}`}>{recommended.name}</Link>
        </p>
      )}

      <p>
        Haven't taken it yet? <Link to="/diagnostic">Start the diagnostic</Link>.
      </p>

      {groups.map((group) => (
        <section key={group.area}>
          <h2>{group.area}</h2>
          {group.topics.map((topicGroup) => (
            <div key={topicGroup.topic}>
              <h3>{topicGroup.topic}</h3>
              <ul>
                {topicGroup.skills.map((skill) => (
                  <li key={skill.id}>
                    <Link to={`/skill/${skill.id}`}>{skill.name}</Link>
                    {" — "}
                    {masteryBySkill.get(skill.id) ?? 0}%
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
