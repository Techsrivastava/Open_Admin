import React from "react";

interface OpenDoorLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export const OpenDoorLogo: React.FC<OpenDoorLogoProps> = ({ 
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
      {/* Open Door Logo Icon - Door with mountain view */}
      <div className="relative">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          
          {/* Background glow */}
          <circle cx="24" cy="24" r="22" fill="url(#doorGradient)" opacity="0.1" />
          
          {/* Door frame */}
          <rect
            x="10"
            y="8"
            width="28"
            height="32"
            rx="2"
            fill="url(#doorGradient)"
            opacity="0.9"
          />
          
          {/* Open door showing mountains inside */}
          <path
            d="M 14 10 L 14 38 L 24 38 L 24 10 Z"
            fill="#1e40af"
            opacity="0.3"
          />
          
          {/* Mountain view inside the door */}
          <path
            d="M 16 28 L 19 20 L 22 28 Z"
            fill="url(#mountainGradient)"
          />
          <path
            d="M 19 28 L 22 18 L 25 28 Z"
            fill="url(#mountainGradient)"
            opacity="0.8"
          />
          
          {/* Door handle */}
          <circle
            cx="30"
            cy="24"
            r="1.5"
            fill="#60a5fa"
          />
          
          {/* Door opening line */}
          <line
            x1="24"
            y1="10"
            x2="24"
            y2="38"
            stroke="#60a5fa"
            strokeWidth="1"
            opacity="0.6"
          />
          
          {/* Sunburst/light rays coming through door */}
          <line x1="20" y1="15" x2="21" y2="13" stroke="#60a5fa" strokeWidth="0.5" opacity="0.7" />
          <line x1="18" y1="17" x2="17" y2="15" stroke="#60a5fa" strokeWidth="0.5" opacity="0.7" />
          <line x1="22" y1="17" x2="23" y2="15" stroke="#60a5fa" strokeWidth="0.5" opacity="0.7" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent ${text}`}>
            Open Door
          </span>
          <span className="text-xs text-muted-foreground font-medium">Admin</span>
        </div>
      )}
    </div>
  );
};
