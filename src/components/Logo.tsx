export function Logo() {
  return (
    <span className="logo">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="var(--primary)" />
        <path
          d="M8 19 L12 9 L14 15 L16 9 L20 19"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="logo-wordmark">GRE QuantLab</span>
    </span>
  );
}
