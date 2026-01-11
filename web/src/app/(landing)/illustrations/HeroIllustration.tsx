"use client";

interface HeroIllustrationProps {
  className?: string;
}

export function HeroIllustration({ className = "" }: HeroIllustrationProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} animate-float`}
    >
      {/* Background circle */}
      <circle
        cx="200"
        cy="200"
        r="150"
        className="stroke-muted-foreground/10"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {/* Outer orbital ring */}
      <circle
        cx="200"
        cy="200"
        r="120"
        className="stroke-muted-foreground/20"
        strokeWidth="1"
      />

      {/* Neural network lines */}
      <g className="stroke-muted-foreground/30" strokeWidth="1">
        {/* Connection lines from video to brain */}
        <path d="M80 200 Q140 180 160 200" className="animate-draw-line" style={{ strokeDasharray: 100, strokeDashoffset: 100 }} />
        <path d="M80 200 Q140 220 160 200" className="animate-draw-line" style={{ strokeDasharray: 100, strokeDashoffset: 100, animationDelay: "200ms" }} />

        {/* Internal brain connections */}
        <path d="M200 140 Q220 170 200 200" className="animate-draw-line" style={{ strokeDasharray: 80, strokeDashoffset: 80, animationDelay: "400ms" }} />
        <path d="M200 200 Q180 230 200 260" className="animate-draw-line" style={{ strokeDasharray: 80, strokeDashoffset: 80, animationDelay: "500ms" }} />
        <path d="M200 200 Q230 200 260 180" className="animate-draw-line" style={{ strokeDasharray: 80, strokeDashoffset: 80, animationDelay: "600ms" }} />
        <path d="M200 200 Q230 200 260 220" className="animate-draw-line" style={{ strokeDasharray: 80, strokeDashoffset: 80, animationDelay: "700ms" }} />

        {/* Output connections */}
        <path d="M240 200 Q280 180 320 180" className="animate-draw-line" style={{ strokeDasharray: 100, strokeDashoffset: 100, animationDelay: "800ms" }} />
        <path d="M240 200 Q280 200 320 200" className="animate-draw-line" style={{ strokeDasharray: 100, strokeDashoffset: 100, animationDelay: "900ms" }} />
        <path d="M240 200 Q280 220 320 220" className="animate-draw-line" style={{ strokeDasharray: 100, strokeDashoffset: 100, animationDelay: "1000ms" }} />
      </g>

      {/* Video/Play icon (input) */}
      <g transform="translate(50, 170)">
        <rect
          x="0"
          y="0"
          width="60"
          height="60"
          rx="8"
          className="fill-muted-foreground/10 stroke-muted-foreground/30"
          strokeWidth="1"
        />
        <path
          d="M24 18 L44 30 L24 42 Z"
          className="fill-foreground/60"
        />
      </g>

      {/* Central brain node */}
      <g transform="translate(160, 160)">
        <circle cx="40" cy="40" r="40" className="fill-foreground/5 stroke-foreground/20" strokeWidth="2" />
        <circle cx="40" cy="40" r="30" className="fill-foreground/10" />
        {/* Brain symbol */}
        <path
          d="M30 40 Q25 30 35 25 Q45 22 50 30 Q55 25 55 35 Q60 40 55 48 Q50 55 40 55 Q30 55 25 48 Q20 40 30 40"
          className="fill-none stroke-foreground/50"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Neural nodes */}
      <g>
        {/* Input side nodes */}
        <circle cx="130" cy="170" r="6" className="fill-muted-foreground/30" />
        <circle cx="130" cy="230" r="6" className="fill-muted-foreground/30" />

        {/* Processing nodes */}
        <circle cx="200" cy="140" r="5" className="fill-foreground/40" />
        <circle cx="200" cy="260" r="5" className="fill-foreground/40" />
        <circle cx="260" cy="180" r="5" className="fill-foreground/40" />
        <circle cx="260" cy="220" r="5" className="fill-foreground/40" />

        {/* Output nodes (knowledge) */}
        <circle cx="320" cy="180" r="8" className="fill-foreground/20 stroke-foreground/40" strokeWidth="1" />
        <circle cx="320" cy="200" r="8" className="fill-foreground/20 stroke-foreground/40" strokeWidth="1" />
        <circle cx="320" cy="220" r="8" className="fill-foreground/20 stroke-foreground/40" strokeWidth="1" />
      </g>

      {/* Output labels - Question marks becoming checkmarks */}
      <g className="fill-foreground/60" fontSize="10" fontWeight="500">
        <text x="317" y="184">Q</text>
        <text x="317" y="204">Q</text>
        <text x="317" y="224">Q</text>
      </g>

      {/* Decorative dots */}
      <g className="fill-muted-foreground/20">
        <circle cx="100" cy="120" r="2" />
        <circle cx="300" cy="120" r="2" />
        <circle cx="100" cy="280" r="2" />
        <circle cx="300" cy="280" r="2" />
        <circle cx="150" cy="100" r="1.5" />
        <circle cx="250" cy="100" r="1.5" />
        <circle cx="150" cy="300" r="1.5" />
        <circle cx="250" cy="300" r="1.5" />
      </g>
    </svg>
  );
}
