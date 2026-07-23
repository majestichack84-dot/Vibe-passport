"use client";

import { MOODS } from "@/lib/moods";
import { MoodKey } from "@/lib/types";

export default function MoodPicker({
  value,
  onChange,
}: {
  value: MoodKey | null;
  onChange: (mood: MoodKey) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {MOODS.map((mood) => {
        const selected = value === mood.key;
        return (
          <button
            key={mood.key}
            type="button"
            onClick={() => onChange(mood.key)}
            className="flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition"
            style={{
              borderColor: selected ? mood.color : "#3A2856",
              backgroundColor: selected ? `${mood.color}22` : "#1F1330",
            }}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span
              className="text-[11px] font-medium"
              style={{ color: selected ? mood.color : "#A996C2" }}
            >
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
