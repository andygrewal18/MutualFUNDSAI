import { useEffect, useState } from "react";

type Props = {
  score: number;
  size?: number;
};

const InvestmentScoreRing = ({ score, size = 56 }: Props) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = () => {
    if (score >= 85) return "hsl(var(--score-excellent))";
    if (score >= 70) return "hsl(var(--score-good))";
    if (score >= 55) return "hsl(var(--score-average))";
    if (score >= 40) return "hsl(var(--score-poor))";
    return "hsl(var(--score-bad))";
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-ring"
        />
      </svg>
      <span className="absolute text-xs font-bold font-mono" style={{ color: getColor() }}>
        {score}
      </span>
    </div>
  );
};

export default InvestmentScoreRing;
