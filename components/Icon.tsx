import type { SVGProps } from "react";

export type IconName = "heart" | "star" | "ribbon" | "mail" | "phone" | "sprout" | "moon" | "sun";

const PATHS: Record<IconName, string> = {
  heart: "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.4 1 4.6 2.6C12.2 6 13.6 5 15.6 5 19 5 21.1 8.4 19.6 11.8 17.5 16.4 12 21 12 21z",
  star: "M12 2.5l2.7 6 6.3.6-4.8 4.3 1.5 6.4L12 16.6l-5.7 3.2 1.5-6.4L3 9.1l6.3-.6z",
  ribbon: "M12 12L5 7c-1.5-1-3 .2-3 2v6c0 1.8 1.5 3 3 2l7-5zm0 0l7-5c1.5-1 3 .2 3 2v6c0 1.8-1.5 3-3 2l-7-5zm0 0a2.2 2.2 0 1 1 0 .01z",
  mail: "M3 7.5C3 6.1 4.1 5 5.5 5h13C19.9 5 21 6.1 21 7.5v9c0 1.4-1.1 2.5-2.5 2.5h-13C4.1 19 3 17.9 3 16.5v-9zm2.2.6L12 13l6.8-4.9V7.5H5.2v.6z",
  phone: "M7.6 3.5c.6-.6 1.6-.5 2.1.2l1.7 2.3c.4.6.4 1.4-.1 2L10 9.4c1 2 2.6 3.6 4.6 4.6l1.4-1.3c.6-.5 1.4-.5 2-.1l2.3 1.7c.7.5.8 1.5.2 2.1l-1.5 1.5c-1 1-2.5 1.3-3.8.7C10.5 16.5 7.5 13.5 5.4 8.8c-.6-1.3-.3-2.8.7-3.8l1.5-1.5z",
  sprout: "M12 21v-7m0 0c0-4-3-7-8-7 0 4 3 7 8 7zm0 0c0-4 3-7 8-7 0 4-3 7-8 7z",
  moon: "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z",
  sun: "M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0-5v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10l2.1 2.1m0-14.2l-2.1 2.1m-10 10l-2.1 2.1",
};

const STROKED: ReadonlySet<IconName> = new Set(["sprout", "sun"]);

type Props = { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">;

/** 小さな飾りアイコン。妹のセリフには絵文字を使わない約束なので、UI 側は SVG で飾る。 */
export function Icon({ name, size = 16, ...rest }: Props) {
  const stroked = STROKED.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={stroked ? "none" : "currentColor"}
      stroke={stroked ? "currentColor" : "none"}
      strokeWidth={stroked ? 2.2 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
