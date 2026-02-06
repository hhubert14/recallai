"use client";

interface ProcessFlowSVGProps {
  className?: string;
}

export function ProcessFlowSVG({ className = "" }: ProcessFlowSVGProps) {
  return (
    <svg
      viewBox="0 0 800 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Connection lines between steps */}
      <g className="stroke-muted-foreground/30" strokeWidth="2" strokeDasharray="8 4">
        {/* Line from step 1 to step 2 */}
        <path
          d="M180 50 L320 50"
          className="animate-draw-line"
          style={{
            strokeDasharray: 140,
            strokeDashoffset: 140,
            animationDelay: "500ms",
          }}
        />
        {/* Line from step 2 to step 3 */}
        <path
          d="M480 50 L620 50"
          className="animate-draw-line"
          style={{
            strokeDasharray: 140,
            strokeDashoffset: 140,
            animationDelay: "1000ms",
          }}
        />
      </g>

      {/* Animated dots traveling along the lines */}
      <g className="fill-foreground/40">
        <circle r="4">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            begin="1s"
            path="M180 50 L320 50"
          />
        </circle>
        <circle r="4">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            begin="2s"
            path="M480 50 L620 50"
          />
        </circle>
      </g>

      {/* Step circles */}
      <g>
        {/* Step 1 circle */}
        <circle cx="100" cy="50" r="45" className="fill-muted/50 stroke-border" strokeWidth="1" />
        <circle cx="100" cy="50" r="35" className="fill-background stroke-foreground/20" strokeWidth="1" />

        {/* Step 2 circle */}
        <circle cx="400" cy="50" r="45" className="fill-muted/50 stroke-border" strokeWidth="1" />
        <circle cx="400" cy="50" r="35" className="fill-background stroke-foreground/20" strokeWidth="1" />

        {/* Step 3 circle */}
        <circle cx="700" cy="50" r="45" className="fill-muted/50 stroke-border" strokeWidth="1" />
        <circle cx="700" cy="50" r="35" className="fill-background stroke-foreground/20" strokeWidth="1" />
      </g>

      {/* Step numbers */}
      <g className="fill-foreground" fontSize="20" fontWeight="600" textAnchor="middle" dominantBaseline="central">
        <text x="100" y="50">1</text>
        <text x="400" y="50">2</text>
        <text x="700" y="50">3</text>
      </g>
    </svg>
  );
}
