import React from "react";
import styled from "styled-components";

interface GlowCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** AdSage glow accent — "red" (default), "teal", "purple", "orange" */
  accent?: "red" | "teal" | "purple" | "orange";
  /**
   * Pass true when the children already supply their own padding
   * (e.g. MetricsCards wraps content in p-6).
   * Defaults to false — Inner adds p-4 automatically.
   */
  noPadding?: boolean;
}

const ACCENTS = {
  red:    { from: "#FF0032", to: "#7B00FF", glow: "rgba(255,0,50,0.25)" },
  teal:   { from: "#00F0FF", to: "#7B00FF", glow: "rgba(0,240,255,0.25)" },
  purple: { from: "#7B00FF", to: "#FF0032", glow: "rgba(123,0,255,0.25)" },
  orange: { from: "#FF0032", to: "#ff4500", glow: "rgba(255,69,0,0.25)"  },
};

interface StyledProps {
  $from: string;
  $to: string;
  $glow: string;
}

const Outer = styled.div<StyledProps>`
  background-image: linear-gradient(163deg, ${({ $from }) => $from} 0%, ${({ $to }) => $to} 100%);
  border-radius: 20px;
  transition: box-shadow 0.3s, all 0.3s;
  height: 100%;

  &:hover {
    box-shadow: 0px 0px 30px 1px ${({ $glow }) => $glow};
  }
`;

const Inner = styled.div<{ $noPadding: boolean }>`
  background-color: #0e0e10;
  border-radius: 18px;
  transition: transform 0.2s, border-radius 0.2s;
  height: 100%;
  overflow: hidden;
  padding: ${({ $noPadding }) => ($noPadding ? "0" : "16px")};

  ${Outer}:hover & {
    transform: scale(0.985);
    border-radius: 20px;
  }
`;

export function GlowCard({
  children,
  className = "",
  onClick,
  accent = "red",
  noPadding = false,
}: GlowCardProps) {
  const { from, to, glow } = ACCENTS[accent];
  return (
    <Outer $from={from} $to={to} $glow={glow} className={className} onClick={onClick}>
      <Inner $noPadding={noPadding}>{children}</Inner>
    </Outer>
  );
}
