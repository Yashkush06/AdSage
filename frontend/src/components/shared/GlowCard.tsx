import React from "react";

interface GlowCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  accent?: "red" | "teal" | "purple" | "orange";
  noPadding?: boolean;
}

const ACCENTS = {
  red:    { from: "#FF0032", to: "#7B00FF", glow: "rgba(255,0,50,0.25)" },
  teal:   { from: "#00F0FF", to: "#7B00FF", glow: "rgba(0,240,255,0.25)" },
  purple: { from: "#7B00FF", to: "#FF0032", glow: "rgba(123,0,255,0.25)" },
  orange: { from: "#FF0032", to: "#ff4500", glow: "rgba(255,69,0,0.25)"  },
};

const CSS = `
  .ag-glow-card {
    border-radius: 20px;
    transition: box-shadow 0.3s, all 0.3s;
    height: 100%;
  }
  .ag-glow-inner {
    background-color: #0e0e10;
    border-radius: 18px;
    transition: transform 0.2s, border-radius 0.2s;
    height: 100%;
    overflow: hidden;
  }
  .ag-glow-card:hover .ag-glow-inner {
    transform: scale(0.985);
    border-radius: 20px;
  }
`;

let injected = false;
function injectStyles() {
  if (injected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  injected = true;
}

export function GlowCard({
  children,
  className = "",
  onClick,
  accent = "red",
  noPadding = false,
}: GlowCardProps) {
  injectStyles();
  const { from, to, glow } = ACCENTS[accent];
  
  const outerStyle = {
    backgroundImage: `linear-gradient(163deg, ${from} 0%, ${to} 100%)`,
  };
  
  const innerStyle = {
    padding: noPadding ? "0" : "16px",
  };
  
  return (
    <div 
      className={`ag-glow-card ${className}`} 
      style={outerStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0px 0px 30px 1px ${glow}`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }}
    >
      <div className="ag-glow-inner" style={innerStyle}>
        {children}
      </div>
    </div>
  );
}
