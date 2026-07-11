export function MasteryBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <span className="mastery-bar">
      <span className="mastery-bar-track">
        <span className="mastery-bar-fill" style={{ width: `${clamped}%` }} />
      </span>
      <span className="mastery-bar-label">({clamped}%)</span>
    </span>
  );
}
