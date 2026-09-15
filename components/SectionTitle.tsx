import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

type Props = { icon: IconName; children: ReactNode; as?: "h1" | "h2" | "h3"; className?: string };

/** リボン風の飾りつき見出し。 */
export function SectionTitle({ icon, children, as: Tag = "h2", className = "" }: Props) {
  return (
    <Tag className={`heading ${Tag === "h1" ? "text-2xl" : Tag === "h2" ? "text-xl" : "text-base"} ${className}`}>
      <span className="heading-mark">
        <Icon name={icon} size={Tag === "h3" ? 14 : 18} />
      </span>
      {children}
    </Tag>
  );
}
