import React from "react";
import styled from "styled-components";

interface WaveButtonProps {
  label: string;
  hoverLabel?: string;           // kept for API compat, not used in this design
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  id?: string;
  variant?: "default" | "light"; // kept for API compat, not used in this design
}

const StyledWrapper = styled.div<{ $fullWidth?: boolean }>`
  display: ${({ $fullWidth }) => ($fullWidth ? "block" : "inline-block")};
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};

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
  }

  .ag-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ag-btn span {
    position: relative;
    z-index: 1;
  }

  /* Dark inner panel */
  .ag-btn::before {
    content: "";
    position: absolute;
    inset: 2px;
    background: #0A0A0C;
    border-radius: 8px;
    transition: 0.5s;
  }

  .ag-btn:hover::before,
  .ag-btn:focus-visible::before {
    opacity: 0.65;
  }

  /* Glow bloom on hover */
  .ag-btn::after {
    content: "";
    position: absolute;
    inset: 0px;
    background: linear-gradient(45deg, #FF0032, #7B00FF, #00F0FF);
    border-radius: 9px;
    transition: 0.5s;
    opacity: 0;
    filter: blur(20px);
    z-index: -1;
  }

  .ag-btn:hover::after,
  .ag-btn:focus-visible::after {
    opacity: 1;
  }
`;

export function WaveButton({
  label,
  onClick,
  disabled,
  type = "button",
  className = "",
  id,
}: WaveButtonProps) {
  const isFullWidth = className.includes("w-full");

  return (
    <StyledWrapper $fullWidth={isFullWidth} className={className}>
      <button
        id={id}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="ag-btn"
      >
        <span>{label}</span>
      </button>
    </StyledWrapper>
  );
}
