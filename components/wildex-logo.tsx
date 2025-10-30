import React from "react";

interface WildexLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export const WildexLogo: React.FC<WildexLogoProps> = ({ 
  size = "md", 
  className = "",
  showText = true 
}) => {
  const sizeMap = {
    sm: { icon: 24, text: "text-xl" },
    md: { icon: 32, text: "text-2xl" },
    lg: { icon: 48, text: "text-4xl" }
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Wildex Logo Icon - Mountain with Wild theme */}
      <div className="relative">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mountain/Wild terrain gradient background */}
          <defs>
            <linearGradient id="wildexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="wildexAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle cx="24" cy="24" r="22" fill="url(#wildexGradient)" opacity="0.1" />
          
          {/* Mountain peaks */}
          <path
            d="M 8 32 L 18 14 L 24 22 L 30 12 L 40 32 Z"
            fill="url(#wildexGradient)"
            stroke="url(#wildexAccent)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          
          {/* Accent peak */}
          <path
            d="M 18 32 L 24 20 L 30 32 Z"
            fill="url(#wildexAccent)"
            opacity="0.7"
          />
          
          {/* Wild leaf/compass accent */}
          <path
            d="M 24 8 L 26 16 L 24 18 L 22 16 Z"
            fill="url(#wildexAccent)"
          />
          
          {/* Bottom terrain line */}
          <line
            x1="8"
            y1="32"
            x2="40"
            y2="32"
            stroke="url(#wildexGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent ${text}`}>
            Wildex
          </span>
          <span className="text-xs text-muted-foreground font-medium">Admin</span>
        </div>
      )}
    </div>
  );
};
