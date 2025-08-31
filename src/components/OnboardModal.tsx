import React, { useEffect, useState } from "react";

const KEY = "onboard-v2";

export function OnboardModal({ palette }: { palette: any }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(KEY);
      if (!seen) setOpen(true);
    } catch {
      // ignore
    }
  }, []);

  function close() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 560,
          width: "100%",
          background: palette.card,
          color: palette.text,
          border: `1px solid ${palette.border}`,
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Pokémon Stat Draft</h2>
          <button
            onClick={close}
            style={{
              border: `1px solid ${palette.border}`,
              background: "transparent",
              color: palette.text,
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        {/* English text */}
        <p style={{ opacity: 0.85, marginTop: 8 }}>
          A small indie project with multiple modes. You get 6 random Pokémon and must
          choose exactly <b>one</b> stat from each. Each stat (HP/Atk/Def/SpA/SpD/Spe)
          can only be used <b>once in total</b>. Depending on the mode, your goal changes:
        </p>
        <ul style={{ marginTop: 6 }}>
          <li><b>Max Score</b>: Maximize the sum of your chosen stats.</li>
          <li><b>Minimal Stat</b>: Minimize the total instead.</li>
          <li><b>Blind Draft</b>: You only see one Pokémon at a time – choose blindly!</li>
        </ul>
        <p style={{ opacity: 0.8, marginTop: 6 }}>
          Tip: After finishing a round, you can review the optimal combination for that deal.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button
            onClick={close}
            style={{
              border: `1px solid ${palette.border}`,
              background: palette.soft,
              color: palette.text,
              borderRadius: 8,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Let’s go
          </button>
        </div>
      </div>
    </div>
  );
}
