import React from "react";
import { STATS, STAT_LABEL } from "../types";
import type { Mon, StatKey } from "../types";


export function PokemonCard({
  mon,
  chosen,
  onPick,
  used,
  revealAll,
  palette,
}: {
  mon: Mon;
  chosen: StatKey | null;
  onPick: (s: StatKey) => void;
  used: Set<StatKey>;
  revealAll: boolean;
  palette: any;
}) {
  return (
    <div
      style={{
        border: `1px solid ${palette.border}`,
        borderRadius: 16,
        padding: 12,
        background: palette.card,
        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            overflow: "hidden",
            border: `1px solid ${palette.border}`,
            display: "grid",
            placeItems: "center",
            background: palette.soft,
          }}
        >
          {mon.sprite ? (
            <img
              src={mon.sprite}
              alt={mon.name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <div style={{ color: palette.sub, fontWeight: 700 }}>?</div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: palette.text }}>
            {capitalize(mon.name)}
          </div>
          <div style={{ fontSize: 12, color: palette.sub }}>#{mon.id}</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {STATS.map((s) => {
          const picked = chosen === s;
          const alreadyUsedElsewhere = used.has(s) && !picked;
          const showNumber = revealAll || picked; // delayed reveal
          return (
            <button
              key={s}
              onClick={() => onPick(s)}
              aria-pressed={picked}
              title={alreadyUsedElsewhere ? "This stat is already used" : STAT_LABEL[s]}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                marginTop: 8,
                borderRadius: 12,
                border: `1px solid ${picked ? palette.primary : palette.border}`,
                background: palette.soft,
                color: palette.text,
                boxShadow: picked ? `inset 0 0 0 2px ${palette.primary}` : undefined,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  minWidth: 36,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 999,
                  border: `1px solid ${palette.border}`,
                  background: palette.soft,
                }}
              >
                {STAT_LABEL[s]}
              </span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>
                {showNumber ? mon.stats[s] : "??"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
