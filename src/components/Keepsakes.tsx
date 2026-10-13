import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { content } from "@/content/experience";

/* ------------------------------------------------------------------ cell */
interface CellProps {
  id: string;
  discovered: boolean;
  onDiscover: (id: string) => void;
  grid: CSSProperties;
  scale?: number;
  blur?: number;
  tagPos: "below" | "above";
  maxW: number | string;
  compact: boolean;
  children: ReactNode;
}

function Cell({ id, discovered, onDiscover, grid, scale = 1, blur = 0, tagPos, maxW, compact, children }: CellProps) {
  const item = content.discoveries.find((d) => d.id === id)!;

  return (
    <div className="relative flex items-center justify-center" style={grid}>
      <div
        className="flex flex-col items-center"
        style={{
          transform: `scale(${scale})`,
          filter: blur && !discovered ? `blur(${blur}px)` : "blur(0px)",
          transition: "filter 700ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <button
          type="button"
          onClick={() => onDiscover(id)}
          aria-expanded={discovered}
          aria-label={`${item.label} — ${discovered ? "opened" : "take a closer look"}`}
          className="group relative block cursor-pointer border-0 bg-transparent p-0"
          style={{ width: maxW, textAlign: "left" }}
        >
          <motion.span
            className="block"
            whileHover={{ y: -6, scale: 1.03 }}
            whileTap={{ scale: 0.965 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            style={{ display: "block", transformOrigin: "50% 85%" }}
          >
            {children}
          </motion.span>

          {/* affordance */}
          <AnimatePresence>
            {!discovered && (
              <motion.span
                className="hint pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <span className="hint__dot" />
                {content.keepsakes.hint}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

{/* the message, printed on a small tag next to the object (desktop) */}
<AnimatePresence>
  {discovered && !compact && id !== "note" && (
    <motion.div
      className={compact ? "relative z-20 mt-4 w-[min(46vw,15rem)]" : "absolute left-1/2 z-20 w-[13rem]"}
      style={
        compact
          ? undefined
          : tagPos === "below"
            ? { top: "calc(100% + 0.9rem)" }
            : { bottom: "calc(100% + 0.9rem)" }
      }
      initial={{ opacity: 0, y: tagPos === "below" ? -10 : 10, rotate: -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: -0.7 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`relative px-4 py-3.5 text-center sm:px-5 sm:py-4 ${compact ? "" : "-translate-x-1/2"}`}
        style={{
          background: "linear-gradient(178deg,rgba(255,249,241,0.97),rgba(240,229,216,0.95))",
          boxShadow: "0 22px 40px -28px rgba(25,21,27,0.85)",
          border: "1px solid rgba(84,40,59,0.16)",
        }}
      >
        <span className="label block text-[0.6rem] text-[#8a6a52]">{item.title}</span>
        <p
          className="mt-2 mb-0"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.02rem,1.5vw,1.2rem)",
            lineHeight: 1.5,
            color: "#3a2536",
          }}
        >
          {item.message}
        </p>
        <span
          aria-hidden
          className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45"
          style={{ background: "rgba(240,229,216,0.95)", borderLeft: "1px solid rgba(84,40,59,0.16)", borderTop: "1px solid rgba(84,40,59,0.16)" }}
        />
      </div>
    </motion.div>
  )}
</AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ mirror */
function Mirror({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 200 280" className="w-full h-auto" role="img" aria-label="A small gold hand mirror">
      <defs>
        <linearGradient id="mkGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8f6f3f" />
          <stop offset="28%" stopColor="#e6cd9c" />
          <stop offset="52%" stopColor="#fff4de" />
          <stop offset="76%" stopColor="#c9a468" />
          <stop offset="100%" stopColor="#7d5f34" />
        </linearGradient>
        <linearGradient id="mkGlass" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#fdf6ee" />
          <stop offset="38%" stopColor="#e7dcd6" />
          <stop offset="62%" stopColor="#cbb9bd" />
          <stop offset="100%" stopColor="#efe4dc" />
        </linearGradient>
        <clipPath id="mkClip">
          <ellipse cx="100" cy="106" rx="61" ry="77" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="264" rx="52" ry="10" fill="rgba(25,21,27,0.3)" />
      <rect x="90" y="168" width="20" height="94" rx="10" fill="url(#mkGold)" />
      <rect x="95" y="172" width="5" height="86" rx="2.5" fill="rgba(255,244,222,0.5)" />
      <path d="M78 156 h44 l-6 26 h-32 Z" fill="url(#mkGold)" />
      <ellipse cx="100" cy="106" rx="74" ry="90" fill="url(#mkGold)" />
      <ellipse cx="100" cy="106" rx="66" ry="82" fill="#7d5f34" opacity="0.55" />
      <ellipse cx="100" cy="106" rx="61" ry="77" fill="url(#mkGlass)" />

      <g clipPath="url(#mkClip)">
        <motion.rect
          x="-70"
          y="0"
          width="58"
          height="230"
          fill="rgba(255,255,255,0.72)"
          transform="rotate(18 100 106)"
          initial={false}
          animate={{ x: open ? 210 : -70 }}
          transition={{ duration: 1.05, ease: [0.65, 0.02, 0.28, 1] }}
        />
        <ellipse cx="72" cy="76" rx="30" ry="42" fill="rgba(255,255,255,0.42)" />
        <path d="M40 150 q60 -30 120 6" fill="none" stroke="rgba(107,86,96,0.28)" strokeWidth="7" />
      </g>
      <ellipse cx="100" cy="106" rx="61" ry="77" fill="none" stroke="rgba(255,244,222,0.75)" strokeWidth="2" />
      <ellipse cx="100" cy="24" rx="10" ry="8" fill="url(#mkGold)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ rose */
function Rose({ open, reduced }: { open: boolean; reduced: boolean }) {
  return (
    <svg viewBox="0 0 200 300" className="w-full h-auto" role="img" aria-label="A preserved rose">
      <defs>
        <linearGradient id="rsPetal" x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#e8b4bd" />
          <stop offset="45%" stopColor="#c9808f" />
          <stop offset="100%" stopColor="#8e4659" />
        </linearGradient>
        <linearGradient id="rsPetal2" x1="0.8" y1="0" x2="0.1" y2="1">
          <stop offset="0%" stopColor="#f2ced3" />
          <stop offset="60%" stopColor="#d9a0a9" />
          <stop offset="100%" stopColor="#a4576a" />
        </linearGradient>
        <linearGradient id="rsStem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4e5c42" />
          <stop offset="45%" stopColor="#7d8c66" />
          <stop offset="100%" stopColor="#3f4b36" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="288" rx="46" ry="9" fill="rgba(25,21,27,0.28)" />
      <motion.g
        animate={reduced ? {} : { rotate: [0, 1.6, -1.2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      >
        <path d="M100 288 C 96 230 104 196 100 152" stroke="url(#rsStem)" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M100 236 C 76 232 62 216 58 198 C 82 198 96 214 100 236 Z" fill="#6d7c58" />
        <path d="M101 214 C 124 208 138 192 142 174 C 119 176 105 192 101 214 Z" fill="#5d6b4b" />
        <path d="M96 176 l-6 16 l8 -4 Z" fill="#4e5c42" />

        {/* bloom */}
        <ellipse cx="100" cy="118" rx="58" ry="50" fill="url(#rsPetal)" />
        <path d="M46 124 C 44 84 74 58 104 62 C 132 66 152 92 148 124 C 140 100 118 86 96 92 C 74 98 56 108 46 124 Z" fill="url(#rsPetal2)" />
        <path d="M56 140 C 66 112 92 98 116 104 C 138 110 150 128 148 146 C 136 126 116 116 96 120 C 78 124 64 130 56 140 Z" fill="#b96f83" opacity="0.9" />
        <path d="M74 100 C 84 78 108 70 126 80 C 142 90 146 110 138 126 C 132 106 116 94 98 94 C 88 94 80 96 74 100 Z" fill="url(#rsPetal2)" />
        <ellipse cx="102" cy="112" rx="22" ry="19" fill="#7e3a4d" opacity="0.85" />
        <ellipse cx="97" cy="106" rx="9" ry="7" fill="rgba(240,200,206,0.7)" />

        {/* petals that let go */}
        <motion.path
          d="M146 138 C 164 134 176 146 172 162 C 166 180 146 182 138 168 C 132 156 136 142 146 138 Z"
          fill="url(#rsPetal2)"
          initial={false}
          animate={open ? { x: 46, y: 78, rotate: 128, opacity: [1, 1, 0.85] } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: open ? 3.6 : 0.5, ease: [0.16, 1, 0.3, 1], delay: open ? 0.25 : 0 }}
        />
        <motion.path
          d="M54 146 C 38 146 30 160 38 172 C 48 188 68 184 72 170 C 76 156 66 146 54 146 Z"
          fill="url(#rsPetal)"
          initial={false}
          animate={open ? { x: -54, y: 96, rotate: -142, opacity: [1, 1, 0.8] } : { x: 0, y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: open ? 4.2 : 0.5, ease: [0.16, 1, 0.3, 1], delay: open ? 0.55 : 0 }}
        />
      </motion.g>
    </svg>
  );
}

/* ------------------------------------------------------------------ locket */
function Locket({ open, reduced }: { open: boolean; reduced: boolean }) {
  return (
    <svg viewBox="0 0 200 260" className="w-full h-auto" role="img" aria-label="A small glowing keepsake locket">
      <defs>
        <linearGradient id="lkGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8f6f3f" />
          <stop offset="30%" stopColor="#f0dcae" />
          <stop offset="55%" stopColor="#fff6e4" />
          <stop offset="100%" stopColor="#8a6a3c" />
        </linearGradient>
        <radialGradient id="lkCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffdf4" />
          <stop offset="35%" stopColor="#ffe6b4" />
          <stop offset="72%" stopColor="rgba(216,181,121,0.55)" />
          <stop offset="100%" stopColor="rgba(216,181,121,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="246" rx="44" ry="9" fill="rgba(25,21,27,0.28)" />
      <path d="M100 34 C 78 34 66 52 66 72" fill="none" stroke="url(#lkGold)" strokeWidth="5" strokeLinecap="round" />
      <path d="M100 34 C 122 34 134 52 134 72" fill="none" stroke="url(#lkGold)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="30" r="9" fill="none" stroke="url(#lkGold)" strokeWidth="5" />

      <motion.g
        animate={reduced ? {} : { scale: [1, 1.045, 1] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 55%" }}
      >
        <motion.circle
          cx="100"
          cy="150"
          r="76"
          fill="url(#lkCore)"
          initial={false}
          animate={{ opacity: open ? 1 : 0.5, scale: open ? 1.25 : 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
        />
        <circle cx="100" cy="150" r="54" fill="url(#lkGold)" />
        <circle cx="100" cy="150" r="45" fill="#2f2430" />
        <motion.circle
          cx="100"
          cy="150"
          r="38"
          fill="url(#lkCore)"
          initial={false}
          animate={{ opacity: open ? 1 : 0.7 }}
          transition={{ duration: 0.8 }}
        />
        <path d="M78 150 q22 -26 44 0 q-22 26 -44 0 Z" fill="rgba(255,253,244,0.86)" />
        <circle cx="100" cy="150" r="6" fill="#fffdf4" />
        <circle cx="100" cy="150" r="45" fill="none" stroke="rgba(255,246,228,0.6)" strokeWidth="2" />
      </motion.g>
    </svg>
  );
}

/* ------------------------------------------------------------------ folded note */
function FoldedNote({ open, compact }: { open: boolean; compact: boolean }) {
  const H_CLOSED = compact ? 60 : 118;
  const H_OPEN = compact ? 128 : 236;
  return (
    <div className="relative" style={{ width: "100%", perspective: 1000 }}>
      {/* hinge clearance for the flap when open */}
      <div style={{ height: 0, transition: "height 620ms cubic-bezier(0.16,1,0.3,1)" }} />
      <div className="relative" style={{ width: "100%" }}>
        {/* the sheet beneath */}
        <motion.div
          className="relative overflow-hidden"
          initial={false}
          animate={{ height: open ? H_OPEN : H_CLOSED }}
          transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: "linear-gradient(176deg,#fff9f1,#f1e4d4)",
            boxShadow: "0 26px 44px -30px rgba(25,21,27,0.8)",
            border: "1px solid rgba(84,40,59,0.14)",
          }}
        >
          <motion.div
            initial={false}
            animate={{ opacity: open ? 1 : 0, y: open ? 0 : 8 }}
            transition={{ duration: 0.6, delay: open ? 0.3 : 0, ease: [0.16, 1, 0.3, 1] }}
            className={compact ? "px-3 pt-3 pb-3" : "px-5 pt-6 pb-5"}
            style={{ minHeight: H_OPEN }}
          >
            <span className="label block text-[0.58rem] text-[#9a7a60]">
              {content.discoveries.find((d) => d.id === "note")!.label}
            </span>
            <p
              className="mb-0"
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: compact ? "1.05rem" : "clamp(1.1rem,1.6vw,1.32rem)",
                lineHeight: compact ? 1.35 : 1.62,
                marginTop: compact ? "0.35rem" : "0.75rem",
                color: "#3a2536",
              }}
            >
              {content.discoveries.find((d) => d.id === "note")!.message}
            </p>
          </motion.div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0"
            style={{ top: H_CLOSED, height: 1, background: "rgba(84,40,59,0.2)" }}
          />
        </motion.div>

        {/* the flap, hinged on the crease line */}
        <motion.div
          className="absolute inset-x-0 top-0"
          initial={false}
          animate={{ rotateX: open ? -176 : 0 }}
          transition={
            open
              ? { duration: 0.86, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.6, ease: [0.65, 0.02, 0.28, 1] }
          }
          style={{
            height: H_CLOSED,
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            background: "linear-gradient(184deg,#fff9f1,#eee0cf)",
            border: "1px solid rgba(84,40,59,0.14)",
            boxShadow: "inset 0 -14px 22px -18px rgba(84,40,59,0.55)",
            zIndex: 2,
          }}
        >
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4">
            <svg viewBox="0 0 60 24" className="h-5 w-16 opacity-70" aria-hidden>
              <path d="M2 12 h56 M46 4 l12 8 l-12 8" fill="none" stroke="#8a6a52" strokeWidth="1.4" />
            </svg>
            <span className="label text-[0.56rem] text-[#8a6a52]">{content.discoveries.find((d) => d.id === "note")!.label}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ grid */
interface Props {
  discovered: string[];
  onDiscover: (id: string) => void;
  reduced: boolean;
  compact: boolean;
}

export default function Keepsakes({ discovered, onDiscover, reduced, compact }: Props) {
  const has = (id: string) => discovered.includes(id);

  const root: CSSProperties = compact
    ? {
        position: "absolute",
        left: 0,
        right: 0,
        top: "5rem",
        bottom: "calc(46vh + 1.25rem)",
      }
    : { position: "absolute", inset: 0 };

  const grid: CSSProperties = compact
    ? {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
        gridTemplateRows: "repeat(2, minmax(0,1fr))",
        columnGap: "0.35rem",
        rowGap: "0.4rem",
        padding: "0 0.6rem",
        alignItems: "start",
        justifyItems: "center",
        height: "100%",
      }
    : {
        display: "grid",
        gridTemplateColumns: "repeat(12, minmax(0,1fr))",
        gridTemplateRows: "repeat(2, minmax(0,1fr))",
        columnGap: "1rem",
        padding: "clamp(7.5rem,16vh,11rem) clamp(1rem,5vw,5rem) clamp(9rem,24vh,14rem)",
        alignItems: "center",
      };

  const cell = (id: string): CSSProperties =>
    compact
      ? {}
      : id === "mirror"
        ? { gridColumn: "2 / 5", gridRow: "1", alignSelf: "center", transform: "translateY(-4%)" }
        : id === "rose"
          ? { gridColumn: "8 / 11", gridRow: "1", alignSelf: "end" }
          : id === "note"
            ? { gridColumn: "6 / 9", gridRow: "2", alignSelf: "start" }
            : { gridColumn: "10 / 13", gridRow: "2", alignSelf: "center", transform: "translateY(-8%)" };

  return (
    <div className="z-20" style={root}>
      <div style={grid}>
      <Cell
        id="mirror"
        compact={compact}
        discovered={has("mirror")}
        onDiscover={onDiscover}
        grid={cell("mirror")}
        scale={compact ? 1 : 0.92}
        blur={0}
        tagPos="below"
        maxW={compact ? "min(116px, 14vh)" : 172}
      >
        <Mirror open={has("mirror")} />
      </Cell>

      <Cell
        id="rose"
        compact={compact}
        discovered={has("rose")}
        onDiscover={onDiscover}
        grid={cell("rose")}
        scale={compact ? 1 : 0.86}
        blur={compact ? 0 : 0.6}
        tagPos={compact ? "below" : "above"}
        maxW={compact ? "min(110px, 13vh)" : 162}
      >
        <Rose open={has("rose")} reduced={reduced} />
      </Cell>

      <Cell
        id="note"
        compact={compact}
        discovered={has("note")}
        onDiscover={onDiscover}
        grid={cell("note")}
        scale={1}
        tagPos="below"
        maxW={compact ? "min(176px, 46vw)" : 218}
      >
        <FoldedNote open={has("note")} compact={compact} />
      </Cell>

      <Cell
        id="keepsake"
        compact={compact}
        discovered={has("keepsake")}
        onDiscover={onDiscover}
        grid={cell("keepsake")}
        scale={compact ? 1 : 0.8}
        blur={compact ? 0 : 0.5}
        tagPos="below"
        maxW={compact ? "min(130px, 15vh)" : 160}
      >
        <Locket open={has("keepsake")} reduced={reduced} />
      </Cell>
      </div>
    </div>
  );
}
