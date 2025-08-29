import React, { useEffect, useMemo, useState } from "react";

/**
 * Pokémon Stat Draft — All-in-one build
 * - Dark mode palette
 * - Max This Deal (optimal assignment)
 * - Generation toggles (Gen 1–9)
 * - Duplicate-stat rule enforcement
 * - Delayed reveal (show all numbers only after all six picks)
 */

type StatKey =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

interface Mon {
  id: number;
  name: string;
  sprite: string | null;
  stats: Record<StatKey, number>;
}

const STATS: StatKey[] = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

const STAT_LABEL: Record<StatKey, string> = {
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "Spe",
};

// National Dex ranges per gen (matches PokéAPI order)
const GENS = [
  { label: "Gen 1", start: 1, end: 151 },
  { label: "Gen 2", start: 152, end: 251 },
  { label: "Gen 3", start: 252, end: 386 },
  { label: "Gen 4", start: 387, end: 493 },
  { label: "Gen 5", start: 494, end: 649 },
  { label: "Gen 6", start: 650, end: 721 },
  { label: "Gen 7", start: 722, end: 809 },
  { label: "Gen 8", start: 810, end: 905 },
  { label: "Gen 9", start: 906, end: 1025 },
] as const;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 6! = 720 permutations, trivial to brute-force in browser
function permutations<T>(arr: T[]): T[][] {
  const out: T[][] = [];
  const used = Array(arr.length).fill(false);
  const cur: T[] = [];
  function bt() {
    if (cur.length === arr.length) {
      out.push([...cur]);
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      cur.push(arr[i]);
      bt();
      cur.pop();
      used[i] = false;
    }
  }
  bt();
  return out;
}

async function fetchMon(id: number): Promise<Mon> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon ${id}`);
  const p = await res.json();
  const stats = Object.fromEntries(
    (p.stats as any[]).map((s) => [s.stat.name as StatKey, s.base_stat as number])
  ) as Record<StatKey, number>;
  const sprite =
    p.sprites?.other?.["official-artwork"]?.front_default ?? p.sprites?.front_default ?? null;
  return { id: p.id, name: p.name, sprite, stats };
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
}

export default function App() {
  // Dark mode detection
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
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
      } as const;

  // State
  const [team, setTeam] = useState<Mon[] | null>(null);
  const [choices, setChoices] = useState<(StatKey | null)[]>(Array(6).fill(null));
  const usedStats = useMemo(() => new Set(choices.filter(Boolean) as StatKey[]), [choices]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [best, setBest] = useLocalStorage<number>("best-score", 0);
  const [hint, setHint] = useState<string | null>(null);

  // Gen toggles
  const [enabledGens, setEnabledGens] = useState<Record<number, boolean>>(() => {
    const obj: Record<number, boolean> = {};
    GENS.forEach((_, i) => (obj[i] = true));
    return obj;
  });
  const allowedIds = useMemo(() => {
    const ids: number[] = [];
    GENS.forEach((g, i) => {
      if (!enabledGens[i]) return;
      for (let x = g.start; x <= g.end; x++) ids.push(x);
    });
    return ids;
  }, [enabledGens]);

  // Score
  const score = useMemo(() => {
    if (!team) return 0;
    return choices.reduce((sum, c, i) => (c ? sum + (team[i]?.stats[c] ?? 0) : sum), 0);
  }, [choices, team]);

  useEffect(() => {
    if (score > best) setBest(score);
  }, [score, best, setBest]);

  // Max possible score for this deal
  const maxResult = useMemo(() => {
    if (!team) return null;
    let bestSum = -1;
    let bestAssign: StatKey[] = STATS;
    for (const perm of permutations(STATS)) {
      let s = 0;
      for (let i = 0; i < 6; i++) s += team[i].stats[perm[i]];
      if (s > bestSum) {
        bestSum = s;
        bestAssign = perm as StatKey[];
      }
    }
    return { value: bestSum, assign: bestAssign };
  }, [team]);

  async function dealTeam() {
    setError(null);
    setHint(null);
    setLoading(true);
    setTeam(null);
    setChoices(Array(6).fill(null));
    try {
      if (allowedIds.length < 6) throw new Error("Select at least 6 available Pokémon (gen toggles)");
      const chosen: number[] = [];
      while (chosen.length < 6) {
        const id = allowedIds[randInt(0, allowedIds.length - 1)];
        if (!chosen.includes(id)) chosen.push(id);
      }
      const mons = await Promise.all(chosen.map(fetchMon));
      setTeam(mons);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load Pokémon.");
    } finally {
      setLoading(false);
    }
  }

  // Before all six are chosen: block duplicates (with a small hint), but don't reveal other numbers
  function pickStat(index: number, stat: StatKey) {
    const alreadyUsedElsewhere = usedStats.has(stat) && choices[index] !== stat;
    if (alreadyUsedElsewhere) {
      setHint(`${STAT_LABEL[stat]} is already used`);
      setTimeout(() => setHint(null), 1200);
      return;
    }
    setChoices((prev) => {
      const next = [...prev];
      next[index] = stat;
      return next;
    });
  }

  function resetChoices() {
    setChoices(Array(6).fill(null));
    setHint(null);
  }

  const allChosen = choices.every(Boolean);

  return (
    <div style={{ ...styles.page, background: palette.bg, color: palette.text }}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>Pokémon Stat Draft</h1>

        <div style={styles.controls}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={dealTeam}
              style={{ ...styles.primaryBtn, background: palette.primary, borderColor: palette.primary }}
              disabled={loading}
            >
              {loading ? "Dealing…" : team ? "Deal New Team" : "Deal Team"}
            </button>
            <button
              onClick={resetChoices}
              style={{ ...styles.ghostBtn, color: palette.text, borderColor: palette.border }}
              disabled={!team}
            >
              Reset Picks
            </button>
          </div>

          {/* Gen toggles */}
          <div style={{ ...styles.genWrap, borderColor: palette.border, background: palette.soft }}>
            {GENS.map((g, i) => (
              <label key={g.label} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={!!enabledGens[i]}
                  onChange={(e) => setEnabledGens((prev) => ({ ...prev, [i]: e.target.checked }))}
                />
                <span style={{ color: palette.sub }}>{g.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.scoreRow}>
          <span>Score: <strong style={{ color: palette.text }}>{score}</strong></span>
          <span>Max This Deal: <strong style={{ color: palette.text }}>{maxResult ? maxResult.value : 0}</strong></span>
          <span>Best Ever: <strong style={{ color: palette.text }}>{best}</strong></span>
        </div>

        {/* After finishing, show which stats are used (visual pills) */}
        {allChosen && <UsedStatsBar used={usedStats} palette={palette} />}

        {hint && <p style={{ ...styles.hint, color: palette.sub }}>⚠️ {hint}</p>}
        {error && <p style={{ ...styles.error, color: palette.danger }}>⚠️ {error}</p>}
      </header>

      {!team && !loading && (
        <div style={{ ...styles.empty, borderColor: palette.border, background: palette.soft, color: palette.sub }}>
          Click “Deal Team” to start.
        </div>
      )}

      <main style={styles.grid}>
        {team?.map((m, i) => (
          <PokemonCard
            key={m.id}
            mon={m}
            chosen={choices[i]}
            onPick={(s) => pickStat(i, s)}
            used={usedStats}
            revealAll={allChosen} // hide other numbers until all six chosen
            palette={palette}
          />
        ))}
      </main>

      <footer style={{ ...styles.footer, borderColor: palette.border, color: palette.sub }}>
        {allChosen ? (
          <div>✅ All six chosen. Your total: <strong style={{ color: palette.text }}>{score}</strong></div>
        ) : team ? (
          <div>Pick one stat on each card. Each stat can be used once.</div>
        ) : null}
      </footer>
    </div>
  );
}

function PokemonCard({
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
    <div style={{ ...styles.card, borderColor: palette.border, background: palette.card }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ ...styles.avatarWrap, borderColor: palette.border, background: palette.soft }}>
          {mon.sprite ? <img src={mon.sprite} alt={mon.name} style={styles.avatar} /> : (
            <div style={{ ...styles.avatarFallback, color: palette.sub }}>?</div>
          )}
        </div>
        <div>
          <div style={{ ...styles.title, color: palette.text }}>{capitalize(mon.name)}</div>
          <div style={{ ...styles.subtitle, color: palette.sub }}>#{mon.id}</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {STATS.map((s) => {
          const picked = chosen === s;
          const alreadyUsedElsewhere = used.has(s) && !picked;
          const showNumber = revealAll || picked; // <-- core of delayed reveal
          const baseBtn = {
            ...styles.statBtn,
            borderColor: palette.border,
            background: palette.soft,
            color: palette.text,
          } as React.CSSProperties;
          return (
            <button
              key={s}
              onClick={() => onPick(s)}
              aria-pressed={picked}
              title={alreadyUsedElsewhere ? "This stat is already used" : STAT_LABEL[s]}
              style={{
                ...baseBtn,
                ...(picked ? { boxShadow: `inset 0 0 0 2px ${palette.primary}`, borderColor: palette.primary } : {}),
              }}
            >
              <span
                style={{
                  ...styles.badge,
                  borderColor: palette.border,
                  background: isLight(palette.soft) ? "#f5f5f5" : "#0b1220",
                  color: palette.text,
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

function UsedStatsBar({ used, palette }: { used: Set<StatKey>; palette: any }) {
  return (
    <div style={styles.usedBar}>
      {STATS.map((s) => (
        <span
          key={s}
          style={{
            ...styles.usedPill,
            borderColor: palette.border,
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

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isLight(hex: string) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex);
  if (!m) return false;
  const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 180;
}

// styles
const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 16,
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial",
  },
  header: { display: "grid", gap: 8, marginBottom: 12 },
  controls: { display: "grid", gap: 8, gridTemplateColumns: "1fr" },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid",
    color: "#fff",
    cursor: "pointer",
  },
  ghostBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid",
    background: "transparent",
    cursor: "pointer",
  },
  genWrap: {
    display: "flex",
    gap: 12,
    padding: 8,
    borderRadius: 12,
    border: "1px solid",
    flexWrap: "wrap",
    alignItems: "center",
  },
  scoreRow: { display: "flex", gap: 16, alignItems: "baseline", flexWrap: "wrap" },
  usedBar: { display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" },
  usedPill: {
    border: "1px solid",
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 13,
  },
  error: {},
  hint: { marginTop: 4 },
  empty: {
    textAlign: "center",
    padding: 40,
    border: "1px dashed",
    borderRadius: 12,
    marginTop: 10,
  },
  grid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    marginTop: 12,
  },
  card: {
    border: "1px solid",
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid",
    display: "grid",
    placeItems: "center",
  },
  avatar: { width: "100%", height: "100%", objectFit: "contain" },
  avatarFallback: { fontWeight: 700 },
  title: { fontSize: 18, fontWeight: 700 },
  subtitle: { fontSize: 12 },
  statBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid",
    cursor: "pointer",
    marginTop: 8,
  },
  badge: {
    display: "inline-block",
    minWidth: 36,
    textAlign: "center",
    fontSize: 12,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 999,
    border: "1px solid",
  },
  footer: { marginTop: 16, paddingTop: 8, borderTop: "1px solid" },
};
