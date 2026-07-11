import { Link } from "react-router-dom";
import { groupSkillsByAreaAndTopic, skillsWithContent } from "../lib/content";
import { storageAdapter } from "../lib/storage";
import { computeMastery } from "../lib/mastery";
import { recommendNextSkill } from "../lib/recommend";
import { AreaMasteryChart } from "../components/AreaMasteryChart";
import { MasteryBar } from "../components/MasteryBar";

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

  const areaOrder = ["Arithmetic", "Algebra", "Geometry", "Data Analysis"];
  const areaMastery = areaOrder.map((area) => {
    const areaSkills = skills.filter((s) => s.area === area);
    const mastery =
      areaSkills.length === 0
        ? 0
        : Math.round(
            areaSkills.reduce((sum, s) => sum + (masteryBySkill.get(s.id) ?? 0), 0) /
              areaSkills.length,
          );
    return { area, mastery };
  });

  const recommended = recommendNextSkill();
  const groups = groupSkillsByAreaAndTopic(skills);

  return (
    <div className="skill-page dashboard-page">
      <h1>Dashboard</h1>

      <div className="mock-test-cta">
        <p>
          New here, or want a fresh read on where you stand? Take a quick
          spread of questions across every skill available so far.
        </p>
        <Link to="/diagnostic" className="cta-button">
          Let's start with a mock test
        </Link>
      </div>

      <AreaMasteryChart data={areaMastery} />

      <p>
        Overall mastery: {overallMastery}% across {skills.length} skills (
        {attempted.length} attempted).
      </p>

      {recommended && (
        <p>
          Recommended next: <Link to={`/skill/${recommended.id}`}>{recommended.name}</Link>
        </p>
      )}

      {groups.map((group) => (
        <section key={group.area}>
          <h2>{group.area}</h2>
          {group.topics.map((topicGroup) => (
            <div key={topicGroup.topic}>
              <h3>{topicGroup.topic}</h3>
              <ul>
                {topicGroup.skills.map((skill) => (
                  <li key={skill.id}>
                    <Link to={`/skill/${skill.id}`}>{skill.name}</Link>{" "}
                    <MasteryBar percent={masteryBySkill.get(skill.id) ?? 0} />
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
