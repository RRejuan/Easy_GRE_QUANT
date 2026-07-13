export function Logo() {
  return (
    <span className="logo">
      <svg width="28" height="28" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="44" cy="42" r="28" fill="none" stroke="var(--text-h)" strokeWidth="9" />
        <line x1="52" y1="58" x2="66" y2="78" stroke="var(--text-h)" strokeWidth="9" strokeLinecap="round" />
        <circle cx="66" cy="78" r="8" fill="var(--primary)" />
      </svg>
      <span className="logo-wordmark">GRE QuantLab</span>
    </span>
  );
}
