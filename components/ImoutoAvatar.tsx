import Image from "next/image";
import type { ImoutoMode } from "@/lib/types";
import { MODE_IMAGE, MODE_LABEL } from "@/lib/lines";
import { Icon } from "./Icon";

type Props = { mode: ImoutoMode; size?: number; className?: string; priority?: boolean; sparkles?: boolean };

/** なうの立ち絵。きぶんから決まるモードで3枚を出し分ける。画像最適化はCPUを使うので無効。 */
export function ImoutoAvatar({ mode, size = 240, className = "", priority = false, sparkles = false }: Props) {
  return (
    <span className={`avatar-frame ${className}`} style={{ width: size, height: size }}>
      <Image src={MODE_IMAGE[mode]} alt={`なう（${MODE_LABEL[mode]}）`} width={size} height={size} priority={priority} unoptimized className="avatar-img" />
      {sparkles && (
        <>
          <Icon name="star" size={22} className="sparkle" style={{ top: -14, right: -6 }} />
          <Icon name="heart" size={16} className="sparkle sparkle-pink" style={{ top: 28, left: -18, animationDelay: "0.8s" }} />
          <Icon name="star" size={14} className="sparkle sparkle-mint" style={{ bottom: 10, right: -16, animationDelay: "1.5s" }} />
        </>
      )}
    </span>
  );
}
