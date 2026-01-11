"use client";

interface AISummaryIllustrationProps {
  className?: string;
}

export function AISummaryIllustration({ className = "" }: AISummaryIllustrationProps) {
  return (
    <svg
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Video input representation */}
      <g transform="translate(20, 40)">
        <rect x="0" y="0" width="80" height="50" rx="4" className="fill-foreground/10 stroke-foreground/20" strokeWidth="1" />
        {/* Play button */}
        <path d="M35 20 L50 25 L35 30 Z" className="fill-foreground/40" />
        {/* Video lines */}
        <line x1="8" y1="38" x2="72" y2="38" className="stroke-foreground/20" strokeWidth="2" />
        <line x1="8" y1="44" x2="50" y2="44" className="stroke-foreground/20" strokeWidth="2" />
      </g>

      {/* Arrow/transformation */}
      <g transform="translate(110, 55)">
        <path
          d="M0 10 L30 10"
          className="stroke-foreground/30"
          strokeWidth="2"
          strokeDasharray="4 2"
        />
        {/* Sparkle/AI indicator */}
        <circle cx="15" cy="10" r="8" className="fill-foreground/10 stroke-foreground/20" strokeWidth="1" />
        <text x="15" y="14" className="fill-foreground/40" fontSize="10" textAnchor="middle">AI</text>
      </g>

      {/* Summary output */}
      <g transform="translate(150, 20)">
        <rect x="0" y="0" width="120" height="160" rx="6" className="fill-foreground/5 stroke-foreground/20" strokeWidth="1" />

        {/* Header */}
        <rect x="8" y="8" width="60" height="10" rx="2" className="fill-foreground/20" />

        {/* Summary lines */}
        <rect x="8" y="26" width="100" height="6" rx="1" className="fill-foreground/10" />
        <rect x="8" y="36" width="90" height="6" rx="1" className="fill-foreground/10" />
        <rect x="8" y="46" width="95" height="6" rx="1" className="fill-foreground/10" />

        {/* Key points section */}
        <rect x="8" y="62" width="40" height="8" rx="1" className="fill-foreground/15" />

        {/* Bullet points */}
        <circle cx="14" cy="80" r="2" className="fill-foreground/30" />
        <rect x="22" y="77" width="80" height="6" rx="1" className="fill-foreground/10" />

        <circle cx="14" cy="94" r="2" className="fill-foreground/30" />
        <rect x="22" y="91" width="70" height="6" rx="1" className="fill-foreground/10" />

        <circle cx="14" cy="108" r="2" className="fill-foreground/30" />
        <rect x="22" y="105" width="75" height="6" rx="1" className="fill-foreground/10" />

        <circle cx="14" cy="122" r="2" className="fill-foreground/30" />
        <rect x="22" y="119" width="65" height="6" rx="1" className="fill-foreground/10" />

        {/* Timestamp/metadata */}
        <rect x="8" y="140" width="50" height="6" rx="1" className="fill-foreground/5" />
      </g>

      {/* Decorative elements */}
      <circle cx="45" cy="120" r="3" className="fill-foreground/10" />
      <circle cx="130" cy="150" r="2" className="fill-foreground/10" />
    </svg>
  );
}
