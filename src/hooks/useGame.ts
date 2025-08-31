import { useEffect, useMemo, useState } from "react";
import { fetchMon } from "../api/poke";
import { GENS, STATS, STAT_LABEL } from "../types";
import type { Mon, StatKey, GameMode } from "../types";
import { useLocalStorage } from "./useLocalStorage";
import { permutations } from "../utils/permutations";

// helper to build id pool from enabled gens
export function idsFromEnabledGens(enabledGens: Record<number, boolean>) {
  const ids: number[] = [];
  GENS.forEach((g, i) => {
    if (!enabledGens[i]) return;
    for (let x = g.start; x <= g.end; x++) ids.push(x);
  });
  return ids;
}

export function useGame(allowedIds: number[], mode: GameMode) {
  const [team, setTeam] = useState<Mon[] | null>(null);
  const [choices, setChoices] = useState<(StatKey | null)[]>(Array(6).fill(null));
  const usedStats = useMemo(() => new Set(choices.filter(Boolean) as StatKey[]), [choices]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [best, setBest] = useLocalStorage<number>("best-score", 0);
  const [hint, setHint] = useState<string | null>(null);
  const [blindIndex, setBlindIndex] = useState(0); // which card is visible in blind mode

  // current total
  const score = useMemo(() => {
    if (!team) return 0;
    return choices.reduce((sum, c, i) => (c ? sum + (team[i]?.stats[c] ?? 0) : sum), 0);
  }, [choices, team]);

  // track best-ever locally
  useEffect(() => {
    if (score > best) setBest(score);
  }, [score, best, setBest]);

  // optimal for this deal (max or min depending on mode) + mapping stat -> mon info
  const optimalResult = useMemo(() => {
    if (!team) return null;
    let bestSum = mode === "minimal" ? Number.POSITIVE_INFINITY : -1;
    let bestAssign: StatKey[] = STATS;

    for (const perm of permutations(STATS)) {
      let s = 0;
      for (let i = 0; i < 6; i++) s += team[i].stats[perm[i]];
      const better = mode === "minimal" ? s < bestSum : s > bestSum;
      if (better) {
        bestSum = s;
        bestAssign = perm as StatKey[];
      }
    }

    // Build byStat map: for each stat, which mon (from index i) uses it in the optimal assignment
    const byStat: Record<
      StatKey,
      { monId: number; name: string; sprite: string | null; value: number }
    > = {} as any;

    for (let i = 0; i < 6; i++) {
      const stat = bestAssign[i];
      const mon = team[i];
      byStat[stat] = {
        monId: mon.id,
        name: mon.name,
        sprite: mon.sprite,
        value: mon.stats[stat],
      };
    }

    return { value: bestSum, assign: bestAssign, byStat };
  }, [team, mode]);

  async function dealTeam() {
    setError(null);
    setHint(null);
    setLoading(true);
    setTeam(null);
    setChoices(Array(6).fill(null));
    setBlindIndex(0); // reset blind progress
    try {
      if (allowedIds.length < 6)
        throw new Error("Select at least 6 available Pokémon (gen toggles)");
      const chosen: number[] = [];
      while (chosen.length < 6) {
        const id = allowedIds[Math.floor(Math.random() * allowedIds.length)];
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
    if (mode === "blind") {
      setBlindIndex((i) => Math.min(i + 1, 5));
    }
  }

  function resetChoices() {
    setChoices(Array(6).fill(null));
    setHint(null);
    setBlindIndex(0);
  }

  const allChosen = choices.every(Boolean);

  return {
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
  };
}
