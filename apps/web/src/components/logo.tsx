/**
 * The onfable mark: the "fable spark" — an 8-point asterisk built from
 * 4 crossed strokes. The ✳ of "once upon a time", doubling as the
 * terminal's wildcard. Single source of truth for the brand mark;
 * app/icon.svg and public/logo.svg mirror these paths.
 */
export function Mark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="16" y1="5" x2="16" y2="27" />
      <line x1="5" y1="16" x2="27" y2="16" />
      <line x1="8.2" y1="8.2" x2="23.8" y2="23.8" />
      <line x1="23.8" y1="8.2" x2="8.2" y2="23.8" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark className="h-5 w-5" />
      <span className="text-lg font-medium tracking-tight">onfable</span>
    </span>
  );
}
