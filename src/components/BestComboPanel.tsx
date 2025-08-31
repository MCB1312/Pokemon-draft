import { STATS, STAT_LABEL } from "../types";
import type { StatKey } from "../types";

export function BestComboPanel({
  byStat,
  totalValue,
  palette,
  title = "Optimal combo",
}: {
  byStat: Record<StatKey, { monId: number; name: string; sprite: string | null; value: number }>;
  totalValue: number;
  palette: any;
  title?: string;
}) {
  return (
    <div
      style={{
        marginTop: 12,
        border: `1px solid ${palette.border}`,
        borderRadius: 12,
        padding: 12,
        background: palette.card,
      }}
    >
     <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
  <div style={{ fontWeight: 700 }}>{title}</div>
  <div style={{ opacity: 0.8 }}>— {Number.isFinite(totalValue) ? totalValue : 0} pts</div>
</div>

      <div style={{ display: "grid", gap: 8 }}>
        {STATS.map((s) => {
          const info = byStat[s];
          if (!info) return null;
          return (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: `1px dashed ${palette.border}`,
                borderRadius: 10,
                padding: "8px 10px",
                background: palette.soft,
              }}
            >
              <span
                style={{
                  minWidth: 40,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 999,
                  border: `1px solid ${palette.border}`,
                  background: palette.card,
                }}
              >
                {STAT_LABEL[s]}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    overflow: "hidden",
                    border: `1px solid ${palette.border}`,
                    display: "grid",
                    placeItems: "center",
                    background: palette.card,
                  }}
                >
                  {info.sprite ? (
                    <img
                      src={info.sprite}
                      alt={info.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <div style={{ fontSize: 10, color: palette.sub }}>?</div>
                  )}
                </div>
                <span style={{ fontWeight: 600 }}>{capitalize(info.name)}</span>
              </div>
              <div style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
                {info.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
