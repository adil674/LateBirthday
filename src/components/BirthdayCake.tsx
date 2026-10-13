import { motion } from "framer-motion";

const CANDLES = [148, 178, 208, 238, 268];

interface Props {
  out: boolean;
  reduced: boolean;
}

export default function BirthdayCake({ out, reduced }: Props) {
  return (
    <svg
      viewBox="0 0 420 470"
      className="w-full h-full"
      role="img"
      aria-label="A two-tier birthday cake on a cake stand with five lit candles"
    >
      <defs>
        <linearGradient id="frost" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff9f1" />
          <stop offset="46%" stopColor="#f6e8da" />
          <stop offset="100%" stopColor="#e3c8bf" />
        </linearGradient>
        <linearGradient id="frost2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff9f1" />
          <stop offset="52%" stopColor="#f3e2d6" />
          <stop offset="100%" stopColor="#dcbcb6" />
        </linearGradient>
        <linearGradient id="stand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9a938c" />
          <stop offset="26%" stopColor="#f2ece5" />
          <stop offset="55%" stopColor="#c9c0b6" />
          <stop offset="100%" stopColor="#8b8279" />
        </linearGradient>
        <radialGradient id="candleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,214,140,0.95)" />
          <stop offset="42%" stopColor="rgba(240,176,96,0.34)" />
          <stop offset="100%" stopColor="rgba(240,176,96,0)" />
        </radialGradient>
        <linearGradient id="flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff9a3c" />
          <stop offset="45%" stopColor="#ffcf7d" />
          <stop offset="100%" stopColor="#fff6dd" />
        </linearGradient>
        <linearGradient id="wax" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9748a" />
          <stop offset="40%" stopColor="#fff9f1" />
          <stop offset="100%" stopColor="#b4647a" />
        </linearGradient>
        <filter id="smokeBlur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* warm pool the candles throw onto the room */}
      <motion.ellipse
        cx="208"
        cy="110"
        rx="196"
        ry="150"
        fill="url(#candleGlow)"
        initial={false}
        animate={{ opacity: out ? 0 : 0.9 }}
        transition={{ duration: 1.1, ease: [0.65, 0.02, 0.28, 1] }}
      />

      {/* ---- cake stand ---- */}
      <ellipse cx="210" cy="440" rx="70" ry="13" fill="rgba(25,21,27,0.35)" />
      <path d="M186 372 C192 396 190 414 178 430 L242 430 C230 414 228 396 234 372 Z" fill="url(#stand)" opacity="0.95" />
      <ellipse cx="210" cy="430" rx="60" ry="12" fill="url(#stand)" />
      <ellipse cx="210" cy="372" rx="156" ry="18" fill="url(#stand)" />
      <ellipse cx="210" cy="368" rx="156" ry="18" fill="#efe6dc" />

      {/* ---- bottom tier ---- */}
      <path d="M84 268 h252 v92 a10 10 0 0 1 -10 10 h-232 a10 10 0 0 1 -10 -10 Z" fill="url(#frost2)" />
      <path d="M84 268 h252 v10 h-252 Z" fill="rgba(255,255,255,0.55)" />
      {/* piped border, bottom tier */}
      {Array.from({ length: 21 }).map((_, i) => (
        <circle key={`b${i}`} cx={92 + i * 12} cy={366} r="7" fill="#fbf1e6" stroke="rgba(184,150,138,0.45)" strokeWidth="0.7" />
      ))}
      <path d="M84 268 C130 288 290 288 336 268" fill="none" stroke="rgba(184,150,138,0.35)" strokeWidth="2" />

      {/* ---- top tier ---- */}
      <path d="M136 186 h148 v76 a8 8 0 0 1 -8 8 h-132 a8 8 0 0 1 -8 -8 Z" fill="url(#frost)" />
      <path d="M136 186 h148 v9 h-148 Z" fill="rgba(255,255,255,0.6)" />
      {Array.from({ length: 13 }).map((_, i) => (
        <circle key={`t${i}`} cx={144 + i * 11.4} cy={266} r="6" fill="#fff9f1" stroke="rgba(184,150,138,0.45)" strokeWidth="0.7" />
      ))}

      {/* berries + gold leaf */}
      <g>
        <circle cx="164" cy="240" r="9" fill="#7d3348" />
        <circle cx="161" cy="237" r="3" fill="rgba(255,249,241,0.6)" />
        <circle cx="188" cy="248" r="7.5" fill="#b96f83" />
        <circle cx="252" cy="242" r="8.5" fill="#7d3348" />
        <circle cx="249" cy="239" r="2.6" fill="rgba(255,249,241,0.55)" />
        <circle cx="126" cy="330" r="8" fill="#b96f83" />
        <circle cx="296" cy="334" r="8.5" fill="#7d3348" />
        <circle cx="272" cy="338" r="6.5" fill="#b96f83" />
        <path d="M210 236 q10 -8 20 0 q-10 8 -20 0 Z" fill="#d8b579" opacity="0.85" />
        <path d="M104 322 q9 -7 18 0 q-9 7 -18 0 Z" fill="#d8b579" opacity="0.8" />
        <path d="M318 326 q9 -7 18 0 q-9 7 -18 0 Z" fill="#d8b579" opacity="0.8" />
      </g>

      {/* ---- candles ---- */}
      {CANDLES.map((x) => (
        <g key={x}>
          <rect x={x - 4.5} y="134" width="9" height="54" rx="3" fill="url(#wax)" />
          <rect x={x - 4.5} y="134" width="9" height="54" rx="3" fill="none" stroke="rgba(120,70,84,0.35)" strokeWidth="0.6" />
          <rect x={x - 1.2} y="126" width="2.4" height="10" rx="1.2" fill="#4a3a34" />
        </g>
      ))}

      {/* ---- flames ---- */}
      {CANDLES.map((x, i) => (
        <motion.g
          key={`f${x}`}
          initial={false}
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
          animate={
            out
              ? { scaleY: [1, 0.4, 0], scaleX: [1, 1.4, 0.2], opacity: 0 }
              : reduced
                ? { scaleY: 1, scaleX: 1, opacity: 1 }
                : { scaleY: [1, 1.14, 0.93, 1.07, 1], scaleX: [1, 0.95, 1.05, 0.98, 1], opacity: [1, 0.92, 1, 0.96, 1] }
          }
          transition={
            out
              ? { duration: 0.5, delay: i * 0.11, ease: "easeIn" }
              : { duration: 1.5 + i * 0.23, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <ellipse cx={x} cy="126" rx="14" ry="20" fill="rgba(255,178,84,0.5)" filter="url(#softGlow)" />
          <path
            d={`M${x} 130 C ${x - 7} 121 ${x - 6.5} 110 ${x} 100 C ${x + 6.5} 110 ${x + 7} 121 ${x} 130 Z`}
            fill="url(#flame)"
          />
          <ellipse cx={x} cy="124" rx="2.4" ry="4.5" fill="#fffdf6" opacity="0.9" />
        </motion.g>
      ))}

      {/* ---- smoke after the blow-out ---- */}
      {out &&
        CANDLES.map((x, i) => (
          <motion.g key={`s${x}`} filter="url(#smokeBlur)" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 2.4, delay: 0.35 + i * 0.12, ease: "easeOut" }}>
            <motion.ellipse
              cx={x}
              cy="126"
              rx="5"
              ry="7"
              fill="rgba(120,110,116,0.9)"
              initial={{ cy: 126, rx: 5, ry: 7 }}
              animate={{ cy: [126, 92, 54], rx: [5, 10, 16], ry: [7, 13, 21] }}
              transition={{ duration: 2.6, delay: 0.3 + i * 0.12, ease: "easeOut" }}
            />
            <motion.ellipse
              cx={x + 6}
              cy="126"
              rx="3"
              ry="4"
              fill="rgba(150,140,146,0.7)"
              initial={{ cy: 126 }}
              animate={{ cy: [126, 84], opacity: [0.7, 0] }}
              transition={{ duration: 2.2, delay: 0.6 + i * 0.1, ease: "easeOut" }}
            />
          </motion.g>
        ))}
    </svg>
  );
}
