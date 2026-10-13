import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { content } from "@/content/experience";
import { particleBus } from "@/components/ParticleField";

type Phase = "idle" | "unsealing" | "reading";

const W = 348;
const H = 214;

interface Props {
  reduced: boolean;
  onSeal: () => void;
  sfx: (n: "paper" | "seal" | "chime") => void;
  ready: boolean;
}

function Words({ text, runKey, complete }: { text: string; runKey: number; complete: boolean }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <motion.span
          key={`${runKey}-${i}`}
          className="inline-block"
          initial={{ opacity: 0, y: 7, rotate: -0.6 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: complete ? 0 : i * 0.045, duration: complete ? 0.18 : 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </>
  );
}

export default function LetterDesk({ reduced, onSeal, sfx, ready }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [runKey, setRunKey] = useState(0);
  const [complete, setComplete] = useState(false);
  const timers = useRef<number[]>([]);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const envelopeRef = useRef<HTMLButtonElement | null>(null);
  const openedOnce = useRef(false);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const openEnvelope = useCallback(() => {
    if (phase !== "idle" || openedOnce.current) return;
    openedOnce.current = true;
    sfx("paper");
    setPhase("unsealing");

    if (reduced) {
      timers.current.push(window.setTimeout(() => setPhase("reading"), 420));
      return;
    }
    timers.current.push(window.setTimeout(() => sfx("seal"), 240));
    timers.current.push(window.setTimeout(() => setPhase("reading"), 1750));
  }, [phase, reduced, sfx]);

  const closeLetter = useCallback(() => {
    setPhase("idle");
    setComplete(false);
    openedOnce.current = false;
    clear();
    window.setTimeout(() => envelopeRef.current?.focus(), 60);
  }, []);

  useEffect(() => {
    if (phase !== "reading") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLetter();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 120);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [phase, closeLetter]);

  const opening = phase === "unsealing" || phase === "reading";
  const fullText = `${content.letter.salutation} ${content.recipientName || ""}\n\n${content.letter.paragraphs.join(
    "\n\n",
  )}\n\n${content.letter.signoff} ${content.letter.signature}`;

  return (
    <>
      {/* ---------------------------------------------------- envelope */}
      <div className="relative flex flex-col items-center" style={{ width: W }}>
        <div className="persp relative" style={{ width: W, height: H }}>
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: -14,
              width: W * 0.98,
              height: 34,
              background: "radial-gradient(50% 50% at 50% 50%, rgba(25,21,27,0.5), transparent 72%)",
              filter: "blur(7px)",
            }}
          />

          <motion.div
            className="preserve3d relative"
            style={{ width: W, height: H }}
            initial={false}
            animate={
              opening
                ? { rotateX: 4, y: -6, scale: 1.02 }
                : ready
                  ? { rotateX: 0, y: 0, scale: 1 }
                  : { rotateX: 0, y: 0, scale: 1 }
            }
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* back panel */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(168deg,#fbf3e9,#eaddcb)",
                boxShadow: "0 30px 54px -34px rgba(25,21,27,0.85)",
                border: "1px solid rgba(84,40,59,0.14)",
              }}
            />

            {/* the sheet inside */}
            <motion.div
              aria-hidden
              className="absolute"
              style={{ left: 16, right: 16, top: 18, height: H - 46, background: "linear-gradient(180deg,#fffdf8,#f7efe4)" }}
              initial={false}
              animate={{ y: opening ? -(H - 10) : 0, opacity: opening ? 1 : 0 }}
              transition={{ duration: 0.8, delay: opening && !reduced ? 0.85 : 0, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="space-y-3 px-6 pt-6">
                {[86, 74, 92, 66].map((w, i) => (
                  <div key={i} style={{ width: `${w}%`, height: 5, background: "rgba(84,40,59,0.16)" }} />
                ))}
              </div>
            </motion.div>

            {/* front panel */}
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                height: 138,
                background: "linear-gradient(174deg,#fff9f1,#efe2d1)",
                clipPath: "polygon(0 0, 50% 40%, 100% 0, 100% 100%, 0 100%)",
                border: "1px solid rgba(84,40,59,0.12)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0"
              style={{
                height: 138,
                background:
                  "linear-gradient(to bottom right, transparent 49.6%, rgba(84,40,59,0.16) 49.9%, transparent 50.3%), linear-gradient(to bottom left, transparent 49.6%, rgba(84,40,59,0.16) 49.9%, transparent 50.3%)",
                clipPath: "polygon(0 0, 50% 40%, 100% 0, 100% 100%, 0 100%)",
              }}
            />

            {/* flap */}
            <motion.div
              className="absolute inset-x-0 top-0"
              style={{
                height: 152,
                transformOrigin: "top center",
                transformStyle: "preserve-3d",
                background: "linear-gradient(186deg,#fff9f1,#eee0cd)",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                filter: "drop-shadow(0 6px 8px rgba(25,21,27,0.22))",
              }}
              initial={false}
              animate={{ rotateX: opening ? -168 : 0 }}
              transition={{ duration: reduced ? 0.35 : 0.9, delay: opening && !reduced ? 0.34 : 0, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* wax seal */}
            <motion.div
              className="absolute"
              style={{ left: W / 2 - 27, top: 124, width: 54, height: 54 }}
              initial={false}
              animate={opening ? { scale: 0.2, rotate: 46, opacity: 0, y: -12 } : { scale: 1, rotate: 0, opacity: 1, y: 0 }}
              transition={{ duration: opening ? 0.42 : 0.4, ease: [0.65, 0.02, 0.28, 1] }}
            >
              <svg viewBox="0 0 54 54" className="h-full w-full" aria-hidden>
                <defs>
                  <radialGradient id="waxg" cx="36%" cy="30%" r="72%">
                    <stop offset="0%" stopColor="#9c4a63" />
                    <stop offset="55%" stopColor="#6d2f47" />
                    <stop offset="100%" stopColor="#4a1f32" />
                  </radialGradient>
                </defs>
                <path
                  d="M27 3 l7 5 l9 -1 l3 8 l7 6 l-3 8 l1 9 l-8 4 l-5 7 l-9 -2 l-8 4 l-6 -7 l-9 -3 l-1 -9 l-6 -6 l4 -7 l-1 -9 l8 -4 Z"
                  fill="url(#waxg)"
                />
                <circle cx="27" cy="27" r="14" fill="none" stroke="rgba(255,214,196,0.3)" strokeWidth="1.4" />
                <path d="M27 21 c3 -5 10 -3 10 3 c0 6 -7 9 -10 12 c-3 -3 -10 -6 -10 -12 c0 -6 7 -8 10 -3 Z" fill="rgba(255,214,196,0.42)" />
                <ellipse cx="20" cy="17" rx="6" ry="4" fill="rgba(255,236,224,0.3)" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* the trigger — the whole envelope is a button while closed */}
        {phase === "idle" && (
          <button
            ref={envelopeRef}
            type="button"
            onClick={openEnvelope}
            className="absolute inset-0 cursor-pointer"
            style={{ background: "transparent", border: 0 }}
            aria-label={content.letter.cta}
          />
        )}
      </div>

      {/* ---------------------------------------------------- reading view */}
      {createPortal(
        <AnimatePresence>
        {phase === "reading" && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              aria-label="Close the letter"
              onClick={closeLetter}
              className="absolute inset-0 cursor-default"
              style={{ background: "rgba(25,21,27,0.5)", backdropFilter: "blur(4px)", border: 0 }}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Your letter"
              className="letter-sheet relative flex max-h-[88svh] w-full max-w-[44rem] flex-col"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 46, scale: 0.96, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "50% 40%" }}
            >
              <div className="flex items-center justify-between gap-4 border-b border-[rgba(84,40,59,0.16)] px-5 py-4 sm:px-9">
                <span className="label text-[0.6rem] text-[#9a7a60]">{content.letter.eyebrow}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn--ghost !px-3 !py-2 !text-[0.6rem]"
                    onClick={() => {
                      setRunKey((k) => k + 1);
                      setComplete(false);
                    }}
                  >
                    {content.letter.replayCta}
                  </button>
                  <button ref={closeRef} type="button" className="btn btn--ghost !px-3 !py-2 !text-[0.6rem]" onClick={closeLetter}>
                    {content.letter.closeCta}
                  </button>
                </div>
              </div>

              <div className="letter-scroll px-5 py-6 sm:px-12 sm:py-9" style={{ maxHeight: "66svh" }}>
                <p className="sr-only">{fullText}</p>

                <div aria-hidden="true" className="letter-body">
                  <p className="mb-6" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", lineHeight: 1.3 }}>
                    {content.letter.salutation}{" "}
                    <span style={{ fontStyle: "italic" }}>{content.recipientName || "you"}</span>
                  </p>
                  {content.letter.paragraphs.map((p, i) => (
                    <p key={i} className="mb-6 last:mb-0">
                      <Words key={runKey} text={p} runKey={runKey} complete={complete} />
                    </p>
                  ))}
                  <p className="mt-8 mb-0" style={{ fontSize: "clamp(1.4rem,2.6vw,1.8rem)" }}>
                    {content.letter.signoff}
                  </p>
                  <p className="mt-1 mb-0" style={{ opacity: 0.75 }}>
                    {content.letter.signature}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(84,40,59,0.16)] px-5 py-4 sm:px-9">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setComplete(true)}
                  disabled={complete}
                >
                  {content.letter.revealCta}
                </button>

                <button
                  type="button"
                  className="group flex items-center gap-3 border-0 bg-transparent p-1 cursor-pointer"
                  onClick={() => {
                    sfx("chime");
                    particleBus.emit("seal", 0.5, 0.45);
                    setPhase("idle");
                    onSeal();
                  }}
                  aria-label={content.letter.sealLabel}
                >
                  <span className="label text-[0.58rem] text-[#9a7a60] transition-colors group-hover:text-[#54283b]">
                    {content.letter.sealLabel}
                  </span>
                  <motion.span
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    className="grid h-11 w-11 place-items-center rounded-full"
                    style={{
                      background: "radial-gradient(circle at 34% 28%, #9c4a63, #54283B 70%)",
                      boxShadow: "0 10px 22px -14px rgba(25,21,27,0.9), inset 0 1px 2px rgba(255,220,206,0.4)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                      <path
                        d="M12 20 C 6 15.5 3 12.6 3 9.2 C3 6.6 5 4.7 7.4 4.7 C9.2 4.7 10.9 5.8 12 7.4 C13.1 5.8 14.8 4.7 16.6 4.7 C19 4.7 21 6.6 21 9.2 C21 12.6 18 15.5 12 20 Z"
                        fill="rgba(255,232,224,0.9)"
                      />
                    </svg>
                  </motion.span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
