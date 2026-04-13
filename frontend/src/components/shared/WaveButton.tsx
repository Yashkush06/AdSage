import React from "react";

interface WaveButtonProps {
  label: string;
  hoverLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  id?: string;
  variant?: "default" | "light";
}

const CSS = `
  .ag-btn-wrapper {
    display: inline-block;
  }
  .ag-btn-wrapper.ag-btn-full {
    display: block;
    width: 100%;
  }
  .ag-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: #fff;
    background: linear-gradient(45deg, #FF0032, #7B00FF, #00F0FF);
    padding: 12px 28px;
    border-radius: 10px;
    font-size: 0.75em;
    font-family: inherit;
    font-weight: 900;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    transition: 0.3s;
    overflow: visible;
    z-index: 0;
  }
  .ag-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .ag-btn span {
    position: relative;
    z-index: 1;
  }
  .ag-btn::before {
    content: "";
    position: absolute;
    inset: 2px;
    background: #0A0A0C;
    border-radius: 8px;
    transition: opacity 0.5s;
    z-index: 0;
  }
  .ag-btn:hover::before,
  .ag-btn:focus-visible::before {
    opacity: 0.65;
  }
  .ag-btn::after {
    content: "";
    position: absolute;
    inset: 0px;
    background: linear-gradient(45deg, #FF0032, #7B00FF, #00F0FF);
    border-radius: 9px;
    transition: opacity 0.5s;
    opacity: 0;
    filter: blur(20px);
    z-index: -1;
  }
  .ag-btn:hover::after,
  .ag-btn:focus-visible::after {
    opacity: 1;
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

export function WaveButton({
  label,
  onClick,
  disabled,
  type = "button",
  className = "",
  id,
}: WaveButtonProps) {
  injectStyles();
  const isFullWidth = className.includes("w-full");
  const wrapperClass = `ag-btn-wrapper${isFullWidth ? " ag-btn-full" : ""} ${className}`.trim();

  return (
    <div className={wrapperClass}>
      <button
        id={id}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="ag-btn"
      >
        <span>{label}</span>
      </button>
    </div>
  );
}
