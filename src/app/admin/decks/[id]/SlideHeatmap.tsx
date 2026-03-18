"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface SlideStats {
  slideIndex: number;
  avgDurationSeconds: number;
  viewerCount: number;
}

interface Props {
  slideStats: SlideStats[];
}

export function SlideHeatmap({ slideStats }: Props) {
  if (slideStats.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No viewing data yet.</p>;
  }

  const max = Math.max(...slideStats.map((s) => s.avgDurationSeconds), 1);

  const data = slideStats.map((s) => ({
    name: `S${s.slideIndex}`,
    seconds: Math.round(s.avgDurationSeconds),
    viewers: s.viewerCount,
    intensity: s.avgDurationSeconds / max, // 0–1
  }));

  function getColor(intensity: number): string {
    // Low engagement: light gray → high engagement: brand accent
    const r = Math.round(233 * (1 - intensity) + 233 * intensity);
    const g = Math.round(233 * (1 - intensity) + 69 * intensity);
    const b = Math.round(233 * (1 - intensity) + 96 * intensity);
    // Map 0→#E9E9E9 to 1→#E94560 (brand accent)
    const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
    return `rgb(${lerp(233, 233, intensity)}, ${lerp(233, 69, intensity)}, ${lerp(233, 96, intensity)})`;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        Average seconds spent per slide — darker = more time
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9CA3AF" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}s`}
          />
          <Tooltip
            formatter={(value, name, props) => [
              `${value}s avg · ${props.payload.viewers} viewer${props.payload.viewers !== 1 ? "s" : ""}`,
              "Time on slide",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="seconds" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getColor(entry.intensity)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
