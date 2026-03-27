export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="60" cy="60" r="54" fill="none" stroke="#003366" strokeWidth="6" />
      <path
        d="M 24 60 A 36 36 0 1 1 96 60"
        fill="none"
        stroke="#4a90e2"
        strokeWidth="8"
        strokeLinecap="round"
        className="hero-arc-stroke"
      />
    </svg>
  );
}
