import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { content, STAR_IDS } from "@/content/experience";
import {
  SCENE_ORDER,
  useExperience,
  useExperienceDispatch,
  type Scene,
} from "@/app/ExperienceState";
import { useIsCompact, useReducedMotion } from "@/hooks/useReducedMotion";
import { useAudioEngine } from "@/hooks/useAudioState";
import { audio } from "@/hooks/useAudio";
import ParticleField, { particleBus, type ParticleMode } from "@/components/ParticleField";
import GiftBox from "@/components/GiftBox";
import BirthdayCake from "@/components/BirthdayCake";
import Keepsakes from "@/components/Keepsakes";
import LetterDesk from "@/components/LetterDesk";
import FinaleConstellation from "@/components/FinaleConstellation";
import roomUrl from "@/assets/room.jpg";
import eveningUrl from "@/assets/evening.jpg";
import skyUrl from "@/assets/sky.jpg";

/* ------------------------------------------------------------------ icons */
const IconSound = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M5 9.5h3.2L12.5 6v12L8.2 14.5H5z" strokeLinejoin="round" />
    {on ? (
      <>
        <path d="M15.6 9.2a4 4 0 0 1 0 5.6" strokeLinecap="round" />
        <path d="M18 7a7.4 7.4 0 0 1 0 10" strokeLinecap="round" />
      </>
    ) : (
      <path d="M16 9.8l4.4 4.4M20.4 9.8L16 14.2" strokeLinecap="round" />
    )}
  </svg>
);

const IconRestart = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.4-5.5" strokeLinecap="round" />
    <path d="M19.8 4.6v4.2h-4.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMotion = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <circle cx="12" cy="12" r="7.5" />
    {on ? (
      <path d="M12 4.5a7.5 7.5 0 0 0 0 15z" fill="currentColor" stroke="none" />
    ) : (
      <path d="M6.4 6.4l11.2 11.2" strokeLinecap="round" />
    )}
  </svg>
);

const IconStar = ({ size = 26 }: { size?: number }) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
    <path
      d="M16 1.5c1.4 7.6 5.5 11.7 13.1 13.1-7.6 1.4-11.7 5.5-13.1 13.1C14.6 20.1 10.5 16 2.9 14.6 10.5 13.2 14.6 9.1 16 1.5Z"
      fill="url(#starFill)"
    />
    <defs>
      <radialGradient id="starFill" cx="50%" cy="45%" r="55%">
        <stop offset="0%" stopColor="#fffdf6" />
        <stop offset="55%" stopColor="#ffe1a8" />
        <stop offset="100%" stopColor="rgba(216,181,121,0.25)" />
      </radialGradient>
    </defs>
  </svg>
);

/* ------------------------------------------------------------------ helpers */
const PLATE: Record<Scene, { room: number; evening: number; sky: number }> = {
  arrival: { room: 1, evening: 0, sky: 0 },
  cake: { room: 1, evening: 0.2, sky: 0 },
  keepsakes: { room: 0.3, evening: 1, sky: 0 },
  letter: { room: 0, evening: 1, sky: 0.16 },
  finale: { room: 0, evening: 0.1, sky: 1 },
};

const STAR_SPOTS: Record<string, { scenes: Scene[]; desktop: CSSProperties; mobile: CSSProperties }> = {
  "star-one": {
    scenes: ["arrival", "cake"],
    desktop: { top: "17%", left: "24%" },
    mobile: { top: "13%", left: "12%" },
  },
  "star-two": {
    scenes: ["cake", "keepsakes"],
    desktop: { top: "72%", left: "87%" },
    mobile: { top: "55%", left: "90%" },
  },
  "star-three": {
    scenes: ["keepsakes", "letter"],
    desktop: { top: "27%", left: "48%" },
    mobile: { top: "53%", left: "50%" },
  },
};

export default function ExperienceShell() {
  const s = useExperience();
  const d = useExperienceDispatch();
  const reducedByMedia = useReducedMotion();
  const reduced = reducedByMedia || s.reduced;
  const compact = useIsCompact();
  const { supported, running, start, stop, sfx } = useAudioEngine();

  const [confirmReset, setConfirmReset] = useState(false);
  const [bonusDismissed, setBonusDismissed] = useState(false);
  const [deskHint, setDeskHint] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [micState, setMicState] = useState<"idle" | "listening" | "denied">("idle");

  const micRef = useRef<{ ctx: AudioContext; stream: MediaStream } | null>(null);
  const rafRef = useRef(0);
  const confirmTimer = useRef(0);

  /* ---------------------------------------------------------- reduced motion */
  useEffect(() => {
    d({ type: "SET_REDUCED", on: reduced });
  }, [reduced, d]);

  /* ---------------------------------------------------------- scene settles */
  useEffect(() => {
    if (!s.giftOpened || s.scene !== "arrival") return;
    const t = window.setTimeout(() => d({ type: "GIFT_SETTLED" }), 1550);
    return () => window.clearTimeout(t);
  }, [s.giftOpened, s.scene, d]);

  useEffect(() => {
    if (!s.candlesOut || s.scene !== "cake") return;
    const t = window.setTimeout(() => d({ type: "CANDLES_SETTLED" }), 1950);
    return () => window.clearTimeout(t);
  }, [s.candlesOut, s.scene, d]);

  useEffect(() => {
    if (s.scene !== "keepsakes") {
      setDeskHint(false);
      return;
    }
    const t = window.setTimeout(() => setDeskHint(true), 15000);
    return () => window.clearTimeout(t);
  }, [s.scene]);

  /* ---------------------------------------------------------- audio */
  useEffect(() => {
    if (s.musicOn && !running) start();
    else if (!s.musicOn && running) stop();
  }, [s.musicOn, running, start, stop]);

  useEffect(() => {
    audio.setMuted(s.muted);
  }, [s.muted]);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      micRef.current?.stream.getTracks().forEach((t) => t.stop());
      void micRef.current?.ctx.close();
      window.clearTimeout(confirmTimer.current);
    },
    [],
  );

  const blowOut = useCallback(() => {
    if (s.candlesOut) return;
    sfx("snuff");
    d({ type: "BLOW_CANDLES" });
  }, [s.candlesOut, sfx, d]);

  const stopMic = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    micRef.current?.stream.getTracks().forEach((t) => t.stop());
    void micRef.current?.ctx.close();
    micRef.current = null;
    setMicState("idle");
  }, []);

  const listenForBlow = useCallback(async () => {
    if (micRef.current || s.candlesOut) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false },
      });
      const Ctor: typeof AudioContext =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      micRef.current = { ctx, stream };
      setMicState("listening");
      d({ type: "MIC_RESULT", ok: true });

      const buf = new Uint8Array(analyser.frequencyBinCount);
      let above = 0;
      const tick = () => {
        if (!micRef.current) return;
        analyser.getByteFrequencyData(buf);
        let sum = 0;
        for (let i = 1; i < 12; i++) sum += buf[i];
        const level = sum / 11;
        above = level > 88 ? above + 1 : Math.max(0, above - 1);
        if (above > 5) {
          blowOut();
          stopMic();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setMicState("denied");
      d({ type: "MIC_RESULT", ok: false });
    }
  }, [s.candlesOut, blowOut, stopMic, d]);

  /* ---------------------------------------------------------- derived */
  const dark = s.scene === "keepsakes" || s.scene === "letter" || s.scene === "finale";
  const plate = PLATE[s.scene];
  const openGift = () => {
    if (s.busy || s.giftOpened) return;
    sfx("sparkle");
    particleBus.emit("gift", 0.6, 0.52);
    d({ type: "OPEN_GIFT" });
  };

  const stageVars = {
    "--text": dark ? "#f7f0e8" : "#30202f",
    "--text-soft": dark ? "rgba(247,240,232,0.74)" : "rgba(48,32,47,0.68)",
    "--hairline": dark ? "rgba(247,240,232,0.26)" : "rgba(48,32,47,0.22)",
    "--focus": dark ? "#d8b579" : "#54283b",
    "--stage-bg": dark ? (s.scene === "finale" ? "#19151B" : "#241a26") : "#F7F0E8",
    color: dark ? "#f7f0e8" : "#30202f",
  } as unknown as CSSProperties;

  const focal = (left: string, top: string, scale: number): CSSProperties => ({
    left,
    top,
    transform: `translate(-50%,-50%) scale(${scale})`,
  });

  const sceneFocal: CSSProperties =
    s.scene === "arrival"
      ? compact
        ? focal("50%", "34%", 0.84)
        : focal("61%", "47%", 1)
      : s.scene === "cake"
        ? compact
          ? focal("50%", "33%", 1)
          : focal("62%", "46%", 1)
        : s.scene === "letter"
          ? compact
            ? focal("50%", "30%", 1)
            : focal("66%", "45%", 1)
          : { left: "50%", top: "50%", transform: "translate(-50%,-50%)" };

  const foundCount = s.discovered.length;
  const focusedItem = focused ? content.discoveries.find((x) => x.id === focused) : undefined;

  /* ---------------------------------------------------------- rail */
  const railInner = () => {
    switch (s.scene) {
      case "arrival":
        return (
          <>
            <span className="label text-[0.62rem] opacity-70">{content.occasion.eyebrow}</span>
            <h1 className="display mt-4 mb-0" style={{ fontSize: "clamp(1.8rem,3.4vw,2.9rem)" }}>
              {content.intro.headline}
            </h1>
            <p className="body-copy mt-4 mb-0">{content.intro.supporting}</p>
            <div className="rule my-6" />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <button type="button" className="btn" onClick={openGift} disabled={s.busy || s.giftOpened}>
                {s.giftOpened ? content.gift.openedLabel : content.intro.cta}
              </button>
              <span className="hint">
                <span className="hint__dot" />
                {content.intro.hint}
              </span>
            </div>
          </>
        );

      case "cake":
        return (
          <>
            <span className="label text-[0.62rem] opacity-70">{content.cake.eyebrow}</span>
            <h2 className="display mt-4 mb-0" style={{ fontSize: "clamp(1.9rem,3.6vw,3.1rem)" }}>
              {content.cake.headline}
            </h2>
            {!s.candlesOut ? (
              <>
                <p className="body-copy mt-4 mb-0">{content.cake.supporting}</p>
                <div className="rule my-6" />
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <button
                    type="button"
                    className="btn"
                    onClick={blowOut}
                    disabled={s.busy}
                  >
                    {content.cake.cta}
                  </button>
                  {micState === "listening" ? (
                    <span className="hint" style={{ color: "var(--accent)" }}>
                      <span className="hint__dot" />
                      {content.ui.listening}
                    </span>
                  ) : micState === "denied" ? (
                    <span className="hint">{content.cake.micFailed}</span>
                  ) : (
                    <button type="button" className="btn btn--ghost" onClick={listenForBlow}>
                      {content.cake.micCta}
                    </button>
                  )}
                </div>
                <p className="mt-3 mb-0" style={{ fontSize: "0.76rem", lineHeight: 1.6, color: "var(--text-soft)", maxWidth: "38ch" }}>
                  {content.cake.micHint}
                </p>
              </>
            ) : (
              <motion.p
                className="body-copy mt-5 mb-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5 }}
              >
                {content.cake.outLine}
              </motion.p>
            )}
          </>
        );

      case "keepsakes":
        return (
          <>
            <span className="label text-[0.62rem] opacity-70">{content.keepsakes.eyebrow}</span>
            <h2 className="display mt-4 mb-0" style={{ fontSize: "clamp(1.8rem,3.4vw,2.9rem)" }}>
              {content.keepsakes.headline}
            </h2>

            {compact && focusedItem && foundCount < 4 ? (
              <motion.div
                key={focusedItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 px-4 py-3"
                style={{
                  background: "linear-gradient(176deg,rgba(255,249,241,0.97),rgba(240,229,216,0.95))",
                  border: "1px solid rgba(84,40,59,0.16)",
                  boxShadow: "0 26px 44px -32px rgba(25,21,27,0.9)",
                }}
              >
                <span className="label block text-[0.56rem]" style={{ color: "#8a6a52" }}>
                  {focusedItem.title}
                </span>
                <p
                  className="mb-0"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.04rem",
                    lineHeight: 1.5,
                    color: "#3a2536",
                    marginTop: "0.4rem",
                  }}
                >
                  {focusedItem.message}
                </p>
              </motion.div>
            ) : (
              <p className="body-copy mt-4 mb-0">
                {foundCount === 4 ? content.keepsakes.allDone : content.keepsakes.supporting}
              </p>
            )}

            <div className="rule my-5" />
            <div className="flex items-center gap-3" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: i < foundCount ? 1 : 0.28, scale: i < foundCount ? 1 : 0.82 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  style={{
                    display: "block",
                    width: 26,
                    height: 2,
                    background: i < foundCount ? "var(--accent)" : "var(--text)",
                  }}
                />
              ))}
              <span className="label tabular ml-1 text-[0.6rem] opacity-70">{foundCount} / 4</span>
            </div>

            <AnimatePresence>
              {foundCount === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4"
                >
                  <button type="button" className="btn" onClick={() => d({ type: "TO_LETTER" })}>
                    {content.keepsakes.followCta}
                  </button>
                </motion.div>
              )}
              {foundCount < 4 && deskHint && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.65 }}
                  onClick={() => d({ type: "TO_LETTER" })}
                  className="btn btn--ghost mt-4"
                >
                  {content.keepsakes.skipCta}
                </motion.button>
              )}
            </AnimatePresence>
          </>
        );

      case "letter":
        return (
          <>
            <span className="label text-[0.62rem] opacity-70">{content.letter.eyebrow}</span>
            <h2 className="display mt-4 mb-0" style={{ fontSize: "clamp(1.8rem,3.4vw,2.9rem)" }}>
              {content.letter.headline}
            </h2>
            <p className="body-copy mt-4 mb-0">{content.letter.supporting}</p>
            <div className="rule my-6" />
            <span className="hint">
              <span className="hint__dot" />
              {content.letter.cta}
            </span>
          </>
        );

      default:
        return null;
    }
  };

  /* ---------------------------------------------------------- render */
  return (
    <div className={`stage ${dark ? "on-dark" : ""}`} style={stageVars}>
      {/* ---------------- environment plates ---------------- */}
      <div className="stage__layer" style={{ zIndex: 0 }}>
        <div className="stage__plate" style={{ backgroundImage: `url(${roomUrl})`, opacity: plate.room }} />
        <div className="stage__plate" style={{ backgroundImage: `url(${eveningUrl})`, opacity: plate.evening }} />
        <div className="stage__plate" style={{ backgroundImage: `url(${skyUrl})`, opacity: plate.sky }} />
      </div>
      <motion.div
        className="stage__layer stage__vignette"
        style={{ zIndex: 1 }}
        animate={{ opacity: dark ? 0.5 : 0.8 }}
        transition={{ duration: 1.5, ease: [0.65, 0.02, 0.28, 1] }}
      />
      <motion.div
        className="stage__layer"
        style={{
          zIndex: 2,
          background:
            "linear-gradient(102deg, rgba(25,21,27,0.88) 0%, rgba(25,21,27,0.3) 44%, rgba(25,21,27,0.06) 70%, rgba(25,21,27,0.44) 100%)",
        }}
        animate={{ opacity: dark ? 1 : 0 }}
        transition={{ duration: 1.5, ease: [0.65, 0.02, 0.28, 1] }}
      />
      <motion.div
        className="stage__layer"
        style={{
          zIndex: 2,
          background:
            "linear-gradient(102deg, rgba(255,249,241,0.5) 0%, rgba(255,249,241,0.12) 48%, rgba(233,213,187,0.28) 100%)",
        }}
        animate={{ opacity: dark ? 0 : 1 }}
        transition={{ duration: 1.5, ease: [0.65, 0.02, 0.28, 1] }}
      />
      <div className="stage__layer stage__grain" style={{ zIndex: 7 }} />

      <ParticleField mode={s.scene as ParticleMode} reduced={reduced} />

      {/* ---------------- hidden stars ---------------- */}
      {STAR_IDS.map((id) => {
        const spot = STAR_SPOTS[id];
        if (!spot.scenes.includes(s.scene) || s.stars.includes(id)) return null;
        return (
          <motion.button
            key={id}
            type="button"
            aria-label={content.ui.hiddenStar}
            className="absolute z-30 grid place-items-center border-0 bg-transparent p-0"
            style={{ ...(compact ? spot.mobile : spot.desktop), width: 44, height: 44, cursor: "pointer" }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1, rotate: reduced ? 0 : [0, 8, -6, 0] }}
            transition={{
              opacity: { duration: 1.4, delay: 1.1 },
              scale: { duration: 0.9, delay: 1.1, type: "spring", stiffness: 200, damping: 18 },
              rotate: { duration: 14, repeat: Infinity, ease: "easeInOut" },
            }}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              const r = (compact ? spot.mobile : spot.desktop) as Record<string, string>;
              sfx("star");
              particleBus.emit("star", (parseFloat(r.left) || 50) / 100, (parseFloat(r.top) || 50) / 100);
              d({ type: "COLLECT_STAR", id });
            }}
          >
            <IconStar />
          </motion.button>
        );
      })}

      {/* ---------------- focal objects ---------------- */}
      <div className="stage__layer z-[18]" style={{ pointerEvents: "none" }}>
        <AnimatePresence>
          {s.scene === "arrival" && (
            <motion.div
              key="arrival"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.85 } }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute" style={{ ...sceneFocal, pointerEvents: "auto" }}>
                <GiftBox
                  opened={s.giftOpened}
                  busy={s.busy}
                  reduced={reduced}
                  interactive={!s.giftOpened}
                  onOpen={openGift}
                />
              </div>
            </motion.div>
          )}

          {s.scene === "cake" && (
            <motion.div
              key="cake"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.85 } }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute" style={{ ...sceneFocal, pointerEvents: "auto" }}>
                <motion.div
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: 44, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: reduced ? 0.5 : 1.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div
                    style={{
                      width: compact ? "min(74vw, 300px)" : "min(26vw, 330px)",
                      aspectRatio: "420 / 470",
                    }}
                  >
                    <BirthdayCake out={s.candlesOut} reduced={reduced} />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {s.scene === "letter" && (
            <motion.div
              key="letter"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="absolute" style={{ ...sceneFocal, pointerEvents: "auto" }}>
                <motion.div
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.92, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: reduced ? 0.5 : 1.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div style={{ transform: compact ? "scale(0.82)" : "scale(1)", transformOrigin: "50% 50%" }}>
                    <LetterDesk
                      reduced={reduced}
                      ready={foundCount >= 2}
                      sfx={sfx}
                      onSeal={() => {
                        d({ type: "BEGIN_FINALE" });
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------------- keepsakes layer ---------------- */}
      <AnimatePresence>
        {s.scene === "keepsakes" && (
          <motion.div
            key="keepsakes"
            className="absolute inset-0"
            style={{ zIndex: 20 }}
            initial={{ opacity: 0, filter: "blur(12px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(12px)", transition: { duration: 0.85 } }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <Keepsakes
              discovered={s.discovered}
              onDiscover={(id) => {
                const found = content.discoveries.find((x) => x.id === id);
                sfx("paper");
                setFocused(id);
                d({ type: "DISCOVER", id, message: found ? found.message : "" });
              }}
              reduced={reduced}
              compact={compact}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- finale layer ---------------- */}
      <AnimatePresence>
        {s.scene === "finale" && (
          <motion.div
            key="finale"
            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
            style={{ padding: "5rem 0 6.5rem", zIndex: 20 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <FinaleConstellation
              step={s.constellation}
              complete={s.constellationComplete}
              reduced={reduced}
              onAdvance={() => {
                sfx("star");
                const p = [
                  [36, 20],
                  [22, 22],
                  [12, 34],
                  [14, 50],
                  [28, 66],
                  [50, 84],
                  [72, 66],
                  [86, 50],
                  [88, 34],
                  [78, 22],
                  [64, 20],
                  [50, 34],
                ];
                const pt = p[Math.min(s.constellation, p.length - 1)];
                particleBus.emit("star", pt[0] / 100, (pt[1] + 8) / 116);
                d({ type: "ADVANCE_CONSTELLATION" });
              }}
              onTrace={() => {
                sfx("chime");
                d({ type: "TRACE_CONSTELLATION" });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- editorial rail ---------------- */}
      <AnimatePresence mode="wait">
        {s.scene !== "finale" && (
          <motion.div
            key={s.scene}
            className="rail"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14, transition: { duration: 0.4 } }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 h-px w-16" style={{ background: "var(--accent)" }} />
            {railInner()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- HUD ---------------- */}
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between gap-4 p-4 sm:p-6"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <div className="pointer-events-auto">
          <div className="flex items-baseline gap-3">
            <span className="label text-[0.6rem]" style={{ color: "var(--text)" }}>
              A Little World
            </span>
            {content.recipientName && (
              <span className="label text-[0.6rem] opacity-60" style={{ color: "var(--text)" }}>
                for {content.recipientName}
              </span>
            )}
          </div>

          {/* progress — five marks, never a step counter */}
          <ol className="mt-3 flex list-none items-center gap-0 p-0" aria-label="Your progress through the experience">
            {SCENE_ORDER.map((sc, i) => {
              const idx = SCENE_ORDER.indexOf(s.scene);
              const reached = i <= idx;
              const clickable = i < idx && !s.busy;
              return (
                <li key={sc} className="flex items-center">
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => clickable && d({ type: "GOTO", scene: sc })}
                    aria-current={i === idx ? "step" : undefined}
                    aria-label={`Go to ${sc}`}
                    className="pointer-events-auto grid h-6 w-6 place-items-center border-0 bg-transparent p-0"
                    style={{ cursor: clickable ? "pointer" : "default", opacity: clickable ? 1 : 1 }}
                  >
                    <motion.span
                      animate={{
                        scale: i === idx ? 1 : 0.62,
                        opacity: reached ? 1 : 0.32,
                      }}
                      transition={{ type: "spring", stiffness: 280, damping: 26 }}
                      style={{
                        display: "block",
                        width: i === idx ? 9 : 6,
                        height: i === idx ? 9 : 6,
                        borderRadius: 999,
                        background: i === idx ? "var(--accent)" : "var(--text)",
                        boxShadow: i === idx ? "0 0 0 4px rgba(216,181,121,0.22)" : "none",
                      }}
                    />
                  </button>
                  {i < SCENE_ORDER.length - 1 && (
                    <span
                      aria-hidden
                      style={{
                        display: "block",
                        width: 34,
                        height: 1,
                        background: "var(--hairline)",
                        marginRight: 2,
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            className="chip"
            aria-pressed={s.musicOn}
            aria-label={s.musicOn ? content.ui.musicOn : content.ui.musicOff}
            title={supported === false ? "Audio unavailable" : s.musicOn ? content.ui.musicOn : content.ui.musicOff}
            onClick={() => d({ type: "SET_MUSIC", on: !s.musicOn })}
          >
            <IconSound on={s.musicOn} />
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={s.muted}
            aria-label={s.muted ? content.ui.unmute : content.ui.mute}
            onClick={() => d({ type: "SET_MUTED", on: !s.muted })}
          >
            <IconSound on={!s.muted} />
          </button>
          <button
            type="button"
            className="chip"
            aria-pressed={reduced}
            aria-label={reduced ? "Turn motion back on" : "Reduce motion"}
            onClick={() => d({ type: "SET_REDUCED", on: !reduced })}
          >
            <IconMotion on={reduced} />
          </button>
          <div className="relative">
            <button
              type="button"
              className="chip"
              aria-label={confirmReset ? content.ui.confirmRestart : "Restart the experience"}
              onClick={() => {
                if (confirmReset) {
                  setConfirmReset(false);
                  window.clearTimeout(confirmTimer.current);
                  stopMic();
                  d({ type: "RESET" });
                } else {
                  setConfirmReset(true);
                  window.clearTimeout(confirmTimer.current);
                  confirmTimer.current = window.setTimeout(() => setConfirmReset(false), 4000);
                }
              }}
            >
              <IconRestart />
            </button>
            <AnimatePresence>
              {confirmReset && (
                <motion.span
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="label absolute right-0 top-[calc(100%+8px)] whitespace-nowrap rounded-sm px-3 py-2 text-[0.55rem]"
                  style={{
                    background: "rgba(255,249,241,0.95)",
                    color: "#30202f",
                    boxShadow: "0 16px 30px -22px rgba(25,21,27,0.9)",
                  }}
                >
                  {content.ui.confirmRestart}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ---------------- bonus message ---------------- */}
      <AnimatePresence>
        {s.stars.length === 3 && !bonusDismissed && (
          <motion.aside
            className="fixed right-4 z-40 w-[19rem] max-w-[calc(100vw-2rem)] sm:right-6"
            style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom,0px))" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            aria-label={content.bonus.title}
          >
            <div
              className="relative px-6 py-5"
              style={{
                background: "linear-gradient(176deg,rgba(255,249,241,0.98),rgba(240,229,216,0.97))",
                color: "#30202f",
                border: "1px solid rgba(216,181,121,0.6)",
                boxShadow: "0 34px 60px -40px rgba(25,21,27,0.95)",
              }}
            >
              <span className="label block text-[0.58rem] text-[#8a6a52]">{content.bonus.title}</span>
              <p
                className="mt-2 mb-0"
                style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", lineHeight: 1.55, color: "#3a2536" }}
              >
                {content.bonus.message}
              </p>
              <button
                type="button"
                className="btn btn--ghost mt-3 !px-0"
                onClick={() => setBonusDismissed(true)}
              >
                Close
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ---------------- finale replay ---------------- */}
      <AnimatePresence>
        {s.scene === "finale" && s.constellationComplete && (
          <motion.div
            className="fixed inset-x-0 z-40 flex justify-center px-4"
            style={{ bottom: "calc(1.4rem + env(safe-area-inset-bottom,0px))" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
          >
            <button
              type="button"
              className="btn"
              onClick={() => {
                stopMic();
                d({ type: "RESET" });
              }}
            >
              {content.finale.replay}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- live region ---------------- */}
      <div aria-live="polite" className="sr-only">
        {s.announce}
      </div>
    </div>
  );
}
