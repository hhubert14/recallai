"use client";

interface AITutorIllustrationProps {
  className?: string;
}

export function AITutorIllustration({ className = "" }: AITutorIllustrationProps) {
  return (
    <svg
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* User avatar */}
      <g transform="translate(30, 100)">
        <circle cx="25" cy="25" r="25" className="fill-foreground/10 stroke-foreground/20" strokeWidth="1" />
        <circle cx="25" cy="20" r="10" className="fill-foreground/20" />
        <ellipse cx="25" cy="40" rx="15" ry="10" className="fill-foreground/20" />
      </g>

      {/* User speech bubble */}
      <g transform="translate(70, 80)">
        <path
          d="M0 20 L10 15 L10 25 Z"
          className="fill-foreground/5"
        />
        <rect x="10" y="0" width="90" height="40" rx="8" className="fill-foreground/5 stroke-foreground/15" strokeWidth="1" />
        {/* Text lines */}
        <rect x="18" y="12" width="60" height="5" rx="1" className="fill-foreground/15" />
        <rect x="18" y="22" width="45" height="5" rx="1" className="fill-foreground/15" />
      </g>

      {/* AI tutor avatar (brain with sparkles) */}
      <g transform="translate(220, 40)">
        <circle cx="30" cy="30" r="30" className="fill-foreground/10 stroke-foreground/20" strokeWidth="1" />
        {/* Brain shape simplified */}
        <path
          d="M20 35 Q15 30 18 24 Q16 18 22 16 Q24 12 30 12 Q36 12 38 16 Q44 18 42 24 Q45 30 40 35 Q38 40 30 40 Q22 40 20 35"
          className="fill-foreground/20 stroke-foreground/30"
          strokeWidth="1"
        />
        {/* Brain detail lines */}
        <path d="M30 18 Q28 25 30 32" className="stroke-foreground/20" strokeWidth="1" fill="none" />
        <path d="M24 22 Q30 24 36 22" className="stroke-foreground/20" strokeWidth="1" fill="none" />

        {/* Sparkles around AI */}
        <path d="M55 15 L57 20 L62 18 L58 22 L63 25 L57 24 L55 30 L53 24 L47 25 L52 22 L48 18 L53 20 Z" className="fill-foreground/30" />
        <path d="M5 50 L6 53 L9 52 L7 54 L10 56 L6 55 L5 58 L4 55 L0 56 L3 54 L1 52 L4 53 Z" className="fill-foreground/20" />
      </g>

      {/* AI response bubble */}
      <g transform="translate(130, 100)">
        <rect x="0" y="0" width="130" height="80" rx="8" className="fill-foreground/5 stroke-foreground/15" strokeWidth="1" />
        <path
          d="M130 25 L140 30 L130 35 Z"
          className="fill-foreground/5"
        />

        {/* Response text lines */}
        <rect x="10" y="12" width="100" height="5" rx="1" className="fill-foreground/15" />
        <rect x="10" y="22" width="85" height="5" rx="1" className="fill-foreground/15" />
        <rect x="10" y="32" width="95" height="5" rx="1" className="fill-foreground/15" />

        {/* Lightbulb icon */}
        <g transform="translate(10, 45)">
          <circle cx="10" cy="10" r="8" className="fill-foreground/10 stroke-foreground/25" strokeWidth="1" />
          <path d="M7 18 L13 18 M8 20 L12 20" className="stroke-foreground/20" strokeWidth="1" />
          {/* Light rays */}
          <path d="M10 0 L10 -3 M3 3 L1 1 M17 3 L19 1 M0 10 L-3 10 M20 10 L23 10" className="stroke-foreground/15" strokeWidth="1" />
        </g>

        {/* Checkmark/understanding indicator */}
        <g transform="translate(95, 50)">
          <circle cx="12" cy="12" r="10" className="fill-foreground/10" />
          <path d="M7 12 L10 15 L17 8" className="stroke-foreground/30" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Connection dots showing back and forth */}
      <circle cx="165" cy="85" r="2" className="fill-foreground/20" />
      <circle cx="175" cy="90" r="2" className="fill-foreground/20" />
      <circle cx="185" cy="85" r="2" className="fill-foreground/20" />

      {/* Decorative learning elements */}
      <g transform="translate(20, 30)">
        {/* Book icon */}
        <rect x="0" y="0" width="25" height="20" rx="2" className="fill-foreground/5 stroke-foreground/15" strokeWidth="1" />
        <line x1="12.5" y1="2" x2="12.5" y2="18" className="stroke-foreground/15" strokeWidth="1" />
      </g>

      {/* Decorative circles */}
      <circle cx="280" cy="180" r="3" className="fill-foreground/10" />
      <circle cx="15" cy="170" r="2" className="fill-foreground/10" />
    </svg>
  );
}
