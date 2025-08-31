export function permutations<T>(arr: T[]): T[][] {
  const out: T[][] = [];
  const used = Array(arr.length).fill(false);
  const cur: T[] = [];
  (function bt() {
    if (cur.length === arr.length) {
      out.push([...cur]); return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue;
      used[i] = true; cur.push(arr[i]);
      bt(); cur.pop(); used[i] = false;
    }
  })();
  return out;
}
