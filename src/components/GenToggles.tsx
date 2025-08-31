import { GENS } from "../types";

export function GenToggles({
  enabledGens,
  onToggle,
  palette,
}: {
  enabledGens: Record<number, boolean>;
  onToggle: (i: number, v: boolean) => void;
  palette: any;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: 8,
        borderRadius: 12,
        border: `1px solid ${palette.border}`,
        flexWrap: "wrap",
        alignItems: "center",
        background: palette.soft,
      }}
    >
      {GENS.map((g, i) => (
        <label key={g.label} style={{ display: "flex", gap: 6, alignItems: "center", color: palette.sub }}>
          <input
            type="checkbox"
            checked={!!enabledGens[i]}
            onChange={(e) => onToggle(i, e.target.checked)}
          />
          <span>{g.label}</span>
        </label>
      ))}
    </div>
  );
}
