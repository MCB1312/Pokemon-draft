import { STATS, STAT_LABEL } from "../types";
import type { StatKey } from "../types";


export function UsedStatsBar({ used, palette }: { used: Set<StatKey>; palette: any }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
      {STATS.map((s) => (
        <span
          key={s}
          style={{
            border: `1px solid ${palette.border}`,
            padding: "4px 8px",
            borderRadius: 999,
            fontSize: 13,
            background: palette.soft,
            color: palette.text,
            opacity: used.has(s) ? 1 : 0.5,
          }}
        >
          {STAT_LABEL[s]}
        </span>
      ))}
    </div>
  );
}
