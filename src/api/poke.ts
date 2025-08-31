import { Mon, StatKey } from "../types";

export async function fetchMon(id: number): Promise<Mon> {
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
