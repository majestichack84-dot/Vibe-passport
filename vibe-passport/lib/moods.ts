import { Mood, MoodKey } from "./types";

export const MOODS: Mood[] = [
  { key: "chill", label: "Chill", emoji: "😌", color: "#8FD3C7" },
  { key: "hyped", label: "Hyped", emoji: "⚡", color: "#FFD166" },
  { key: "lonely", label: "Lonely", emoji: "🌙", color: "#7C93C9" },
  { key: "grateful", label: "Grateful", emoji: "🙏", color: "#B185F5" },
  { key: "adventurous", label: "Adventurous", emoji: "🧭", color: "#FF9B6A" },
  { key: "nostalgic", label: "Nostalgic", emoji: "📻", color: "#E38FB5" },
  { key: "lovestruck", label: "Lovestruck", emoji: "💜", color: "#C77DFF" },
  { key: "wild", label: "Wild", emoji: "🔥", color: "#FF6B6B" },
];

export function getMood(key: MoodKey): Mood {
  return MOODS.find((m) => m.key === key) ?? MOODS[0];
}
