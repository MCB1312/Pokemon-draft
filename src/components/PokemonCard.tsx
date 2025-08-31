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
  bestByStat,
}: {
  mon: Mon;
  chosen: StatKey | null;
  onPick: (s: StatKey) => void;
  used: Set<StatKey>;
  revealAll: boolean;
  palette: any;
  bestByStat?: Record<
    StatKey,
    { monId: number; name: string; sprite: string | null; value: number }
  >;
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
          const alreadyUsed = used.has(s); // global verwendet?
          const showNumber = revealAll || picked; // delayed reveal
          const isOptimalHere =
            revealAll && bestByStat && bestByStat[s]?.monId === mon.id;

          const showBar = alreadyUsed;
          const barColor = picked ? palette.primary : palette.danger;

          return (
            <button
              key={s}
              onClick={() => onPick(s)}
              aria-pressed={picked}
              title={
                alreadyUsed && !picked
                  ? "This stat is already used"
                  : STAT_LABEL[s]
              }
              style={{
                position: "relative",      // ⟵ wichtig
                overflow: "hidden",        // ⟵ rundungen clippen den Balken
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px 10px 20px", // ⟵ etwas mehr links
                marginTop: 8,
                minHeight: 44,             // ⟵ genug Höhe, damit Balken sichtbar wirkt
                borderRadius: 12,
                border: `1px solid ${picked ? palette.primary : palette.border}`,
                background: palette.soft,
                color: palette.text,
                boxShadow: picked ? `inset 0 0 0 2px ${palette.primary}` : undefined,
                cursor: "pointer",
                opacity: alreadyUsed && !picked ? 0.95 : 1,
              }}
            >
              {showBar && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: 12,            // ⟵ breiter Balken
                    background: barColor,
                    zIndex: 1,            // ⟵ unter Inhalt, aber über Background
                    pointerEvents: "none",
                  }}
                />
              )}

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
                  position: "relative",
                  zIndex: 2,             // ⟵ über dem Balken
                }}
              >
                {STAT_LABEL[s]}
              </span>

              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 700,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {showNumber ? mon.stats[s] : "??"}
              </span>

              {isOptimalHere && (
                <span
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 999,
                    border: `1px solid ${palette.border}`,
                    background: palette.card,
                    opacity: 0.9,
                    zIndex: 3,
                  }}
                  title="Part of optimal combo"
                >
                  ✓ OPT
                </span>
              )}
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
