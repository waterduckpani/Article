import { ReactNode, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "gold" | "dark";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: "sm" | "md";
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit";
  onClick?: () => void;
}

export function Button({
  children,
  href,
  variant = "primary",
  size,
  className = "",
  style,
  type = "button",
  onClick,
}: ButtonProps) {
  const cls = `btn btn-${variant}${size === "sm" ? " btn-sm" : ""} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={cls} style={style}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={cls} style={style} onClick={onClick}>
      {children}
    </button>
  );
}
