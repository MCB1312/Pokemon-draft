import { useEffect, useMemo, useState } from "react";
import { GenToggles } from "./components/GenToggles";
import { PokemonCard } from "./components/PokemonCard";
import { UsedStatsBar } from "./components/UsedStatsBar";
import { BestComboPanel } from "./components/BestComboPanel";
import { OnboardModal } from "./components/OnboardModal";
import { idsFromEnabledGens, useGame } from "./hooks/useGame";
import { MODE_LABEL } from "./types";
import type { GameMode } from "./types";

export default function App() {
  // dark mode palette
  const [isDark, setIsDark] = useState(
    typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const palette = isDark
    ? {
        bg: "#0b0f1a",
        text: "#e6eaf2",
        sub: "#a7b0c3",
        card: "#111827",
        border: "#1f2937",
        soft: "#0f172a",
        primary: "#10b981",
        danger: "#ef4444",
      }
    : {
        bg: "#ffffff",
        text: "#1b1f27",
        sub: "#495464",
        card: "#ffffff",
        border: "#e5e7eb",
        soft: "#f8fafc",
        primary: "#111827",
        danger: "#b00020",
      };

  // game mode
  const [mode, setMode] = useState<GameMode>("normal");

  // gen toggles
  const [enabledGens, setEnabledGens] = useState<Record<number, boolean>>(
    () => ({ 0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true })
  );
  const allowedIds = useMemo(() => idsFromEnabledGens(enabledGens), [enabledGens]);

  // game logic
  const {
    team,
    choices,
    usedStats,
    loading,
    error,
    best,
    hint,
    score,
    optimalResult,
    allChosen,
    dealTeam,
    pickStat,
    resetChoices,
    blindIndex,
  } = useGame(allowedIds, mode);

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 16,
        background: palette.bg,
        color: palette.text,
        fontFamily:
          "ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial",
      }}
    >
      {/* one-time onboarding modal */}
      <OnboardModal palette={palette} />

      <header style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Pokémon Stat Draft</h1>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={dealTeam}
              disabled={loading}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: `1px solid ${palette.primary}`,
                background: palette.primary,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {loading ? "Dealing…" : team ? "Deal New Team" : "Deal Team"}
            </button>

            <button
              onClick={resetChoices}
              disabled={!team}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: `1px solid ${palette.border}`,
                background: "transparent",
                color: palette.text,
                cursor: "pointer",
              }}
            >
              Reset Picks
            </button>

            {/* mode switcher */}
            <label style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0.9 }}>
              Mode:
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as GameMode)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: `1px solid ${palette.border}`,
                  background: palette.card,
                  color: palette.text,
                }}
              >
                <option value="normal">{MODE_LABEL.normal}</option>
                <option value="minimal">{MODE_LABEL.minimal}</option>
                <option value="blind">{MODE_LABEL.blind}</option>
              </select>
            </label>
          </div>

          <GenToggles
            enabledGens={enabledGens}
            onToggle={(i, v) => setEnabledGens((prev) => ({ ...prev, [i]: v }))}
            palette={palette}
          />
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "baseline", flexWrap: "wrap" }}>
          <span>
            Score: <strong style={{ color: palette.text }}>{score}</strong>
          </span>

          {(mode !== "blind" || allChosen) && (
            <span>
              {mode === "minimal" ? "Min This Deal" : "Max This Deal"}:{" "}
              <strong style={{ color: palette.text }}>
                {optimalResult ? optimalResult.value : 0}
              </strong>
            </span>
          )}

          <span>
            Best Ever: <strong style={{ color: palette.text }}>{best}</strong>
          </span>
        </div>

        {allChosen && <UsedStatsBar used={usedStats} palette={palette} />}
        {hint && <p style={{ marginTop: 4, color: palette.sub }}>⚠️ {hint}</p>}
        {error && <p style={{ color: palette.danger }}>⚠️ {error}</p>}
      </header>

      {!team && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            border: `1px dashed ${palette.border}`,
            borderRadius: 12,
            marginTop: 10,
            background: palette.soft,
            color: palette.sub,
          }}
        >
          Click “Deal Team” to start.
        </div>
      )}

      <main
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          marginTop: 12,
        }}
      >
        {team && mode === "blind" && !allChosen ? (
          <>
            <div style={{ opacity: 0.7, marginBottom: 4 }}>Card {blindIndex + 1} / 6</div>
            <PokemonCard
              key={team[blindIndex].id}
              mon={team[blindIndex]}
              chosen={choices[blindIndex]}
              onPick={(s) => pickStat(blindIndex, s)}
              used={usedStats}
              revealAll={false} // only picked stat shows number
              palette={palette}
              bestByStat={undefined}
            />
          </>
        ) : (
          team?.map((m, i) => (
            <PokemonCard
              key={m.id}
              mon={m}
              chosen={choices[i]}
              onPick={(s) => pickStat(i, s)}
              used={usedStats}
              revealAll={allChosen} // reveal all after finishing
              palette={palette}
              bestByStat={optimalResult?.byStat}
            />
          ))
        )}
      </main>

      {/* Best combo panel after a round */}
{allChosen && optimalResult?.byStat && (
  <BestComboPanel
    byStat={optimalResult.byStat}
    totalValue={Number.isFinite(optimalResult.value) ? optimalResult.value : 0}
    palette={palette}
  />
)}



      <footer
        style={{
          marginTop: 16,
          paddingTop: 8,
          borderTop: `1px solid ${palette.border}`,
          color: palette.sub,
        }}
      >
        {allChosen ? (
          <div>
            ✅ Runde fertig. Deine Summe:{" "}
            <strong style={{ color: palette.text }}>{score}</strong>
          </div>
        ) : team ? (
          <div>Pick one stat on each card. Each stat can be used once.</div>
        ) : null}
      </footer>
    </div>
  );
}
