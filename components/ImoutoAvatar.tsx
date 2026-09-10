import Image from "next/image";
import type { ImoutoMode } from "@/lib/types";
import { MODE_IMAGE, MODE_LABEL } from "@/lib/lines";

type Props = { mode: ImoutoMode; size?: number; className?: string; priority?: boolean };

/** なうの立ち絵。きぶんから決まるモードで3枚を出し分ける。画像最適化はCPUを使うので無効。 */
export function ImoutoAvatar({ mode, size = 240, className = "", priority = false }: Props) {
  return (
    <Image
      src={MODE_IMAGE[mode]}
      alt={`なう（${MODE_LABEL[mode]}）`}
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={`rounded-[2rem] border-4 border-paper shadow-[var(--shadow)] object-cover ${className}`}
    />
  );
}
