import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const W = 250;
const H = 168;
const D = 176;
const LH = 40;
const LW = W + 20;
const LD = D + 20;

const face = (w: number, h: number, transform: string): CSSProperties => ({
  position: "absolute",
  left: "50%",
  top: "50%",
  width: w,
  height: h,
  marginLeft: -w / 2,
  marginTop: -h / 2,
  transform,
  backfaceVisibility: "hidden",
});

const VELVET_FRONT = "linear-gradient(158deg,#7a3d54 0%,#5f2e43 34%,#54283B 66%,#411e2f 100%)";
const VELVET_SIDE = "linear-gradient(158deg,#5b2b40 0%,#43203044 40%,#351a28 100%)";
const VELVET_RIGHT = "linear-gradient(158deg,#6a344a 0%,#54283B 55%,#3d1d2d 100%)";
const VELVET_TOP = "linear-gradient(120deg,#7f4257 0%,#60304a 50%,#4b2438 100%)";
const SATIN_V = "linear-gradient(90deg,#b99b73 0%,#e9d5bb 22%,#fff9f1 46%,#e2cba6 68%,#a98a63 100%)";
const SATIN_H = "linear-gradient(180deg,#b99b73 0%,#e9d5bb 24%,#fff9f1 50%,#e2cba6 72%,#a98a63 100%)";

interface Props {
  opened: boolean;
  busy: boolean;
  reduced: boolean;
  interactive: boolean;
  onOpen: () => void;
}

export default function GiftBox({ opened, busy, reduced, interactive, onOpen }: Props) {
  const areaRef = useRef<HTMLDivElement | null>(null);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const sx = useSpring(tx, { stiffness: 130, damping: 20, mass: 0.9 });
  const sy = useSpring(ty, { stiffness: 130, damping: 20, mass: 0.9 });

  // resting three-quarter view: we always see the front, the left side and the lid top
  const rotY = useTransform(sx, [-1, 1], [7, 29]);
  const rotX = useTransform(sy, [-1, 1], [-21, -3]);
  const lift = useTransform(sy, [-1, 1], [8, -8]);

  useEffect(() => {
    const el = areaRef.current;
    if (!el || reduced) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        tx.set(Math.max(-1, Math.min(1, nx)));
        ty.set(Math.max(-1, Math.min(1, ny)));
      });
    };
    const onLeave = () => {
      tx.set(0);
      ty.set(0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      tx.set(0);
      ty.set(0);
    };
  }, [reduced, tx, ty]);

  const bodyFaces = (
    <>
      <div style={face(W, H, `translateZ(${D / 2}px)`)} className="shadow-[inset_0_2px_18px_rgba(255,249,241,0.14)]">
        <div className="absolute inset-0" style={{ background: VELVET_FRONT }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(105deg,rgba(255,249,241,0.16),transparent 42%)" }} />
        {/* vertical satin band */}
        <div className="absolute top-0 bottom-0" style={{ left: W / 2 - 19, width: 38, background: SATIN_V }} />
        {/* horizontal satin band */}
        <div className="absolute left-0 right-0" style={{ top: H / 2 - 17, height: 34, background: SATIN_H, mixBlendMode: "normal", opacity: 0.96 }} />
        <div className="absolute left-0 right-0" style={{ top: H / 2 - 17, height: 34, background: "linear-gradient(180deg,rgba(25,21,27,0.22),transparent 60%)" }} />
      </div>
      <div style={face(D, H, `rotateY(-90deg) translateZ(${W / 2}px)`)} className="overflow-hidden">
        <div className="absolute inset-0" style={{ background: VELVET_SIDE }} />
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2" style={{ width: 34, background: "linear-gradient(90deg,#8e7452,#cdb694 45%,#8e7452)", opacity: 0.85 }} />
      </div>
      <div style={face(D, H, `rotateY(90deg) translateZ(${W / 2}px)`)} className="overflow-hidden">
        <div className="absolute inset-0" style={{ background: VELVET_RIGHT }} />
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2" style={{ width: 34, background: "linear-gradient(90deg,#a98a63,#f2e4cf 45%,#a98a63)", opacity: 0.9 }} />
      </div>
      <div style={face(W, H, `rotateY(180deg) translateZ(${D / 2}px)`)}>
        <div className="absolute inset-0" style={{ background: "#3b1c2b" }} />
      </div>
      <div style={face(W, D, `rotateX(90deg) translateZ(${H / 2}px)`)} className="overflow-hidden">
        <div className="absolute inset-0" style={{ background: VELVET_TOP }} />
        {/* warm light waiting inside */}
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(216,181,121,0.85), rgba(216,181,121,0.1) 70%, transparent 100%)" }}
        />
      </div>
    </>
  );

  return (
    <div ref={areaRef} className="relative" style={{ width: W, height: H + 60 }}>
      {/* contact shadow */}
      <motion.div
        aria-hidden
        className="absolute rounded-[50%]"
        style={{
          bottom: 8,
          left: "50%",
          marginLeft: -(W * 1.15) / 2,
          width: W * 1.15,
          height: 46,
          background: "radial-gradient(50% 50% at 50% 50%, rgba(25,21,27,0.5), rgba(25,21,27,0) 72%)",
          filter: "blur(6px)",
        }}
        animate={{ scaleX: opened ? 0.7 : 1, opacity: opened ? 0.35 : 0.75 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.div
        className="persp absolute left-0 right-0"
        style={{ top: 24, height: H }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 34 }}
        animate={
          opened
            ? { opacity: 0.42, scale: 0.8, y: 54, filter: "blur(3px)" }
            : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
        }
        transition={{ duration: reduced ? 0.3 : 1.15, ease: [0.16, 1, 0.3, 1], delay: opened ? 0.35 : 0.25 }}
      >
        <motion.div
          animate={reduced ? {} : { y: [0, -5, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: W, height: H, margin: "0 auto" }}
        >
        <motion.div
          className="preserve3d relative"
          style={{ width: W, height: H, rotateX: rotX, rotateY: rotY, y: lift }}
        >
          {bodyFaces}

          {/* ---- inner light escaping the opened box ---- */}
          <motion.div
            aria-hidden
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: W * 1.9,
              height: W * 1.9,
              marginLeft: -(W * 1.9) / 2,
              marginTop: -(W * 1.9) / 2,
              background: "radial-gradient(closest-side, rgba(255,236,196,0.9), rgba(216,181,121,0.35) 42%, transparent 72%)",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={opened ? { opacity: [0, 0.95, 0.5], scale: [0.3, 1.15, 1] } : { opacity: 0, scale: 0.3 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* ---- lid ---- */}
          <motion.div
            className="preserve3d absolute"
            style={{
              width: LW,
              height: LH,
              left: "50%",
              top: "50%",
              marginLeft: -LW / 2,
              marginTop: -LH / 2 - H / 2,
            }}
            initial={false}
            animate={opened ? { y: -230, x: 96, z: 40, rotateZ: -16, rotateX: 26 } : { y: 0, x: 0, z: 0, rotateZ: 0, rotateX: 0 }}
            transition={
              reduced
                ? { duration: 0.35 }
                : { type: "spring", stiffness: 150, damping: 21, mass: 1.35, delay: opened ? 0.08 : 0 }
            }
          >
            <div style={face(LW, LH, `translateZ(${LD / 2}px)`)} className="overflow-hidden">
              <div className="absolute inset-0" style={{ background: "linear-gradient(170deg,#8a455e,#5c2c42 60%,#4a2335)" }} />
              <div className="absolute top-0 bottom-0" style={{ left: LW / 2 - 20, width: 40, background: SATIN_V }} />
              <div className="absolute inset-x-0 top-0 h-[6px]" style={{ background: "linear-gradient(180deg,rgba(255,249,241,0.5),transparent)" }} />
            </div>
            <div style={face(LD, LH, `rotateY(-90deg) translateZ(${LW / 2}px)`)} className="overflow-hidden">
              <div className="absolute inset-0" style={{ background: "linear-gradient(170deg,#6b3448,#3f1f2f)" }} />
            </div>
            <div style={face(LD, LH, `rotateY(90deg) translateZ(${LW / 2}px)`)} className="overflow-hidden">
              <div className="absolute inset-0" style={{ background: "linear-gradient(170deg,#7c3d55,#4a2335)" }} />
            </div>
            <div style={face(LW, LD, `rotateX(90deg) translateZ(${LH / 2}px)`)} className="overflow-hidden">
              <div className="absolute inset-0" style={{ background: VELVET_TOP }} />
              <div className="absolute top-0 bottom-0" style={{ left: LW / 2 - 20, width: 40, background: SATIN_H, backgroundSize: "100% 100%" }} />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(118deg, rgba(255,249,241,0.3), transparent 46%)" }}
              />
            </div>

            {/* ---- bow, lying on the lid's top plane ---- */}
            <svg
              viewBox="0 0 200 130"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 168,
                height: 110,
                marginLeft: -84,
                marginTop: -55,
                transform: `rotateX(90deg) translateZ(${LH / 2 + 5}px)`,
                filter: "drop-shadow(0 6px 8px rgba(25,21,27,0.35))",
              }}
              aria-hidden
            >
              <defs>
                <linearGradient id="bowSatin" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#b99b73" />
                  <stop offset="30%" stopColor="#fff9f1" />
                  <stop offset="58%" stopColor="#e9d5bb" />
                  <stop offset="100%" stopColor="#a4855e" />
                </linearGradient>
                <linearGradient id="bowSatin2" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9ab80" />
                  <stop offset="42%" stopColor="#fff9f1" />
                  <stop offset="100%" stopColor="#96794f" />
                </linearGradient>
              </defs>
              {/* tails */}
              <path d="M96 66 C74 84 58 104 44 124 C64 120 84 106 100 84 Z" fill="url(#bowSatin2)" opacity="0.95" />
              <path d="M106 66 C130 84 146 104 160 124 C140 120 118 106 102 84 Z" fill="url(#bowSatin)" opacity="0.95" />
              {/* left loop */}
              <path
                d="M100 66 C68 66 30 52 26 32 C22 12 52 4 74 22 C92 36 98 52 100 66 Z"
                fill="url(#bowSatin2)"
                stroke="rgba(148,120,80,0.5)"
                strokeWidth="0.8"
              />
              {/* right loop */}
              <path
                d="M100 66 C132 66 170 52 174 32 C178 12 148 4 126 22 C108 36 102 52 100 66 Z"
                fill="url(#bowSatin)"
                stroke="rgba(148,120,80,0.5)"
                strokeWidth="0.8"
              />
              {/* knot */}
              <ellipse cx="100" cy="64" rx="17" ry="14" fill="url(#bowSatin)" stroke="rgba(148,120,80,0.55)" strokeWidth="0.8" />
              <ellipse cx="96" cy="60" rx="7" ry="5" fill="rgba(255,249,241,0.75)" />
            </svg>
          </motion.div>
        </motion.div>
        </motion.div>
      </motion.div>

      {/* open hit area */}
      {!opened && (
        <button
          type="button"
          onClick={onOpen}
          disabled={busy || !interactive}
          aria-label="Open the gift"
          className="absolute cursor-pointer rounded-full"
          style={{
            left: "50%",
            top: 46,
            transform: "translateX(-50%)",
            width: W * 0.94,
            height: H,
            background: "transparent",
            border: 0,
          }}
        />
      )}
    </div>
  );
}
