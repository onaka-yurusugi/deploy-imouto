import type { Mood } from "@/lib/types";
import type { TimeOfDay } from "@/lib/time";

type Props = { mood: Mood; time: TimeOfDay; size?: number; className?: string };

const HAIR = "#8a5a6b";
const HAIR_LIGHT = "#a8788a";
const SKIN = "#ffe9dc";
const BLUSH = "#ffb3c6";
const IRIS = "#e0518f";

const OUTFIT: Record<TimeOfDay, { base: string; accent: string; label: string }> = {
  morning: { base: "#ffffff", accent: "#ff6fa5", label: "制服" },
  day: { base: "#5fcfc0", accent: "#ffffff", label: "部屋着" },
  evening: { base: "#5fcfc0", accent: "#ffffff", label: "部屋着" },
  night: { base: "#c9b6ff", accent: "#ffe08a", label: "パジャマ" },
};

function Eyes({ mood }: { mood: Mood }) {
  if (mood === "nikoniko") {
    return (
      <g stroke={HAIR} strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M68 96 q10 -10 20 0" />
        <path d="M112 96 q10 -10 20 0" />
      </g>
    );
  }
  if (mood === "nemui") {
    return (
      <g>
        <rect x="66" y="92" width="24" height="7" rx="3.5" fill={HAIR} />
        <rect x="110" y="92" width="24" height="7" rx="3.5" fill={HAIR} />
      </g>
    );
  }
  const dx = mood === "sune" ? 5 : 0;
  return (
    <g className="blink">
      <ellipse cx="78" cy="96" rx="11" ry="14" fill="#fff" />
      <ellipse cx="122" cy="96" rx="11" ry="14" fill="#fff" />
      <ellipse cx={78 + dx} cy="98" rx="7" ry="10" fill={IRIS} />
      <ellipse cx={122 + dx} cy="98" rx="7" ry="10" fill={IRIS} />
      <circle cx={81 + dx} cy="93" r="2.5" fill="#fff" />
      <circle cx={125 + dx} cy="93" r="2.5" fill="#fff" />
      {mood === "wakuwaku" && (
        <g fill="#fff">
          <path d="M75 100 l2 4 4 1 -4 1 -2 4 -2 -4 -4 -1 4 -1z" />
          <path d="M119 100 l2 4 4 1 -4 1 -2 4 -2 -4 -4 -1 4 -1z" />
        </g>
      )}
      {mood === "sabishii" && <ellipse cx="66" cy="112" rx="3" ry="5" fill="#9fd8ff" />}
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case "genki":
    case "wakuwaku":
      return <path d="M88 118 q12 14 24 0 z" fill="#e0518f" />;
    case "nikoniko":
      return <path d="M90 118 q10 8 20 0" stroke="#e0518f" strokeWidth="3" fill="none" strokeLinecap="round" />;
    case "nemui":
      return <ellipse cx="100" cy="120" rx="4" ry="5" fill="#e0518f" />;
    case "sabishii":
      return <path d="M92 122 q8 -6 16 0" stroke="#e0518f" strokeWidth="3" fill="none" strokeLinecap="round" />;
    case "sune":
      return <path d="M94 120 q6 -3 12 0" stroke="#e0518f" strokeWidth="3" fill="none" strokeLinecap="round" />;
  }
}

/** なうの立ち絵。きぶんで表情、時間帯で服が変わる。 */
export function ImoutoAvatar({ mood, time, size = 240, className = "" }: Props) {
  const outfit = OUTFIT[time];
  return (
    <svg
      viewBox="0 0 200 230"
      width={size}
      height={(size * 230) / 200}
      className={className}
      role="img"
      aria-label={`なう（${outfit.label}）`}
    >
      {/* ツインテール（後ろ） */}
      <path d="M42 90 q-22 40 -8 100 q14 -10 26 -4 q-10 -50 -2 -96z" fill={HAIR} />
      <path d="M158 90 q22 40 8 100 q-14 -10 -26 -4 q10 -50 2 -96z" fill={HAIR} />
      {/* 体 */}
      <path d="M62 150 q38 -18 76 0 l10 70 h-96z" fill={outfit.base} />
      {time === "morning" && (
        <>
          <path d="M78 150 l22 26 22 -26 q-22 -8 -44 0z" fill={outfit.accent} />
          <path d="M96 176 l4 -8 4 8 -4 14z" fill="#e0518f" />
        </>
      )}
      {(time === "day" || time === "evening") && <path d="M84 158 q16 10 32 0 v8 q-16 8 -32 0z" fill={outfit.accent} />}
      {time === "night" && (
        <g fill={outfit.accent}>
          <path d="M84 176 a6 6 0 1 0 6 8 a5 5 0 1 1 -6 -8z" />
          <circle cx="116" cy="200" r="2.5" />
          <circle cx="76" cy="205" r="2" />
          <circle cx="122" cy="178" r="2" />
        </g>
      )}
      {/* 首と顔 */}
      <rect x="90" y="138" width="20" height="18" fill={SKIN} />
      <ellipse cx="100" cy="100" rx="52" ry="50" fill={SKIN} />
      {/* 前髪 */}
      <path d="M48 96 q4 -58 52 -56 q48 -2 52 56 q-12 -22 -26 -12 q-8 -20 -26 -14 q-18 -6 -26 14 q-14 -10 -26 12z" fill={HAIR} />
      <path d="M74 52 q10 -8 22 -4" stroke={HAIR_LIGHT} strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* リボン */}
      <g fill="#ff6fa5">
        <path d="M150 62 l-16 8 16 8 q6 -8 0 -16z" />
        <path d="M150 62 l16 -6 -4 22 -12 -8z" />
        <circle cx="150" cy="70" r="4" fill="#e0518f" />
      </g>
      {/* ほっぺ */}
      <ellipse cx="62" cy="114" rx="9" ry="5" fill={BLUSH} opacity="0.8" />
      <ellipse cx="138" cy="114" rx="9" ry="5" fill={BLUSH} opacity="0.8" />
      <Eyes mood={mood} />
      <Mouth mood={mood} />
      {mood === "nemui" && (
        <text x="150" y="40" fontSize="18" fontWeight="700" fill="#b8a9cf">
          zzz
        </text>
      )}
      {mood === "sune" && <path d="M134 78 q6 -6 12 0" stroke={HAIR} strokeWidth="3" fill="none" strokeLinecap="round" />}
    </svg>
  );
}
