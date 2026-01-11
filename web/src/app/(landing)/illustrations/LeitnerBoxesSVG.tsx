"use client";

interface LeitnerBoxesSVGProps {
  className?: string;
}

export function LeitnerBoxesSVG({ className = "" }: LeitnerBoxesSVGProps) {
  return (
    <svg
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Box containers */}
      <g className="stroke-foreground/20" strokeWidth="1">
        {/* Box 1 (smallest interval) */}
        <rect x="20" y="140" width="40" height="50" rx="4" className="fill-foreground/5" />
        <text x="40" y="165" className="fill-foreground/40" fontSize="8" textAnchor="middle">1d</text>

        {/* Box 2 */}
        <rect x="70" y="130" width="40" height="60" rx="4" className="fill-foreground/5" />
        <text x="90" y="165" className="fill-foreground/40" fontSize="8" textAnchor="middle">3d</text>

        {/* Box 3 */}
        <rect x="120" y="120" width="40" height="70" rx="4" className="fill-foreground/5" />
        <text x="140" y="165" className="fill-foreground/40" fontSize="8" textAnchor="middle">7d</text>

        {/* Box 4 */}
        <rect x="170" y="110" width="40" height="80" rx="4" className="fill-foreground/5" />
        <text x="190" y="165" className="fill-foreground/40" fontSize="8" textAnchor="middle">14d</text>

        {/* Box 5 (longest interval - mastered) */}
        <rect x="220" y="100" width="40" height="90" rx="4" className="fill-foreground/5" />
        <text x="240" y="165" className="fill-foreground/40" fontSize="8" textAnchor="middle">30d</text>
      </g>

      {/* Cards in boxes */}
      <g>
        {/* Cards in Box 1 */}
        <rect x="25" y="145" width="30" height="20" rx="2" className="fill-foreground/20 stroke-foreground/30" strokeWidth="0.5" />
        <rect x="27" y="167" width="30" height="20" rx="2" className="fill-foreground/15 stroke-foreground/25" strokeWidth="0.5" />

        {/* Cards in Box 2 */}
        <rect x="75" y="135" width="30" height="20" rx="2" className="fill-foreground/20 stroke-foreground/30" strokeWidth="0.5" />

        {/* Cards in Box 3 */}
        <rect x="125" y="125" width="30" height="20" rx="2" className="fill-foreground/20 stroke-foreground/30" strokeWidth="0.5" />
        <rect x="127" y="147" width="30" height="20" rx="2" className="fill-foreground/15 stroke-foreground/25" strokeWidth="0.5" />

        {/* Cards in Box 4 */}
        <rect x="175" y="115" width="30" height="20" rx="2" className="fill-foreground/20 stroke-foreground/30" strokeWidth="0.5" />

        {/* Cards in Box 5 (mastered) */}
        <rect x="225" y="105" width="30" height="20" rx="2" className="fill-foreground/20 stroke-foreground/30" strokeWidth="0.5" />
        <rect x="227" y="127" width="30" height="20" rx="2" className="fill-foreground/15 stroke-foreground/25" strokeWidth="0.5" />
        <rect x="229" y="149" width="30" height="20" rx="2" className="fill-foreground/10 stroke-foreground/20" strokeWidth="0.5" />
      </g>

      {/* Animated card moving between boxes */}
      <rect width="30" height="20" rx="2" className="fill-foreground/30 stroke-foreground/40" strokeWidth="0.5">
        <animateMotion
          dur="4s"
          repeatCount="indefinite"
          path="M40 60 Q100 40 140 60 Q180 80 240 60"
        />
      </rect>

      {/* Arrow showing progression */}
      <path
        d="M60 85 L220 85"
        className="stroke-foreground/20"
        strokeWidth="1"
        strokeDasharray="4 2"
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0 0 L6 3 L0 6 Z" className="fill-foreground/20" />
        </marker>
      </defs>

      {/* Label */}
      <text x="140" y="75" className="fill-foreground/30" fontSize="9" textAnchor="middle" fontWeight="500">
        Mastery Progress
      </text>
    </svg>
  );
}
