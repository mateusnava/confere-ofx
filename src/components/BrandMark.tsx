import type { SVGProps } from "react";

const TEAL = "#0F6B5C";

type BrandMarkProps = {
  className?: string;
  /** When true, renders only the inner shield (no rounded square background). */
  iconOnly?: boolean;
} & SVGProps<SVGSVGElement>;

export function BrandMark({
  className = "h-8 w-8",
  iconOnly = false,
  ...props
}: BrandMarkProps) {
  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
        {...props}
      >
        <path
          d="M12 2.5L19 6v5.2c0 4.6-3.1 8.9-7 10.3-3.9-1.4-7-5.7-7-10.3V6l7-3.5z"
          fill="currentColor"
        />
        <path
          d="M8.5 11.5l2.2 2.2 4.8-4.8"
          stroke={TEAL}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <rect width="100" height="100" rx="20" fill={TEAL} />
      <path
        d="M50 24L72 34V52C72 66.5 50 76 50 76C50 76 28 66.5 28 52V34L50 24Z"
        fill="white"
      />
      <path
        d="M38 52L46.5 60.5L62 45"
        stroke={TEAL}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
