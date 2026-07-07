// RegisterVerifyCard.jsx
// Requires: react, framer-motion, and Tailwind CSS configured in your project.
//   npm i framer-motion
//
// A self-contained "Register & Verify" card micro-interaction.
// It auto-plays a demo loop and also restarts on click of the button.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Config + helpers                                                   */
/* ------------------------------------------------------------------ */

const FIELD_COUNT = 4;
const EASE = [0.16, 1, 0.3, 1];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const outerCardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const innerCardVariants = {
  hidden: { scale: 0.96, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: EASE, delay: 0.12 },
  },
};

const fieldVariants = {
  idle: {
    borderColor: "#E5E7EB",
    boxShadow: "0 0 0 0 rgba(15,98,254,0)",
  },
  glow: {
    borderColor: "#0F62FE",
    boxShadow: "0 0 0 3px rgba(15,98,254,0.18)",
    transition: { duration: 0.25 },
  },
  done: {
    borderColor: "#E5E7EB",
    boxShadow: "0 0 0 0 rgba(15,98,254,0)",
    transition: { duration: 0.3 },
  },
};

// swap transition for the button label states
const labelVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22 } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

const pulseVariants = {
  initial: { opacity: 0.4, scale: 0.98 },
  animate: {
    opacity: 0,
    scale: 1.04,
    transition: { duration: 1.1, ease: "easeOut" },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RegisterVerifyCard() {
  const [filled, setFilled] = useState(0); // number of completed fields
  const [active, setActive] = useState(-1); // index of the field currently glowing
  const [status, setStatus] = useState("idle"); // "idle" | "verifying" | "verified"

  // A run id lets us cancel any in-flight sequence (unmount or restart on click).
  const runId = useRef(0);

  const start = useCallback(() => {
    const id = ++runId.current;
    const alive = () => runId.current === id;

    (async () => {
      // 1. reset
      setStatus("idle");
      setActive(-1);
      setFilled(0);
      await sleep(500);
      if (!alive()) return;

      // 2. fill each field — glow first, then complete
      for (let i = 0; i < FIELD_COUNT; i++) {
        setActive(i);
        await sleep(280);
        if (!alive()) return;
        setFilled(i + 1);
        await sleep(200);
        if (!alive()) return;
      }
      setActive(-1);
      await sleep(280);
      if (!alive()) return;

      // 3. verifying (loading dots)
      setStatus("verifying");
      await sleep(1500);
      if (!alive()) return;

      // 4. verified (blue gradient + check + success pulse)
      setStatus("verified");
      await sleep(2000);
      if (!alive()) return;

      // 5. loop
      start();
    })();
  }, []);

  // Kick off the demo loop; cancel on unmount.
  useEffect(() => {
    start();
    return () => {
      runId.current++;
    };
  }, [start]);

  const verified = status === "verified";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F7F8FB] p-6">
      {/* Outer card — fades in and moves up */}
      <motion.div
        variants={outerCardVariants}
        initial="hidden"
        animate="show"
        className="relative w-full max-w-[380px] rounded-[24px] border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_50px_-12px_rgba(15,23,42,0.12)]"
      >
        {/* Soft success pulse around the form */}
        <AnimatePresence>
          {verified && (
            <motion.span
              key="success-pulse"
              aria-hidden
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 rounded-[24px] ring-4 ring-[#0F62FE]"
            />
          )}
        </AnimatePresence>

        {/* Inner form card — scales from 0.96 to 1 */}
        <motion.div
          variants={innerCardVariants}
          initial="hidden"
          animate="show"
          className="rounded-[18px] border border-[#EDEEF2] bg-[#FCFCFE] p-5"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[15px] font-semibold text-[#24262F]">
              Create account
            </span>
            <motion.span
              className="flex h-5 w-5 items-center justify-center rounded-[6px]"
              animate={{ backgroundColor: verified ? "#0F62FE" : "#EDEEF2" }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence>
                {verified && (
                  <motion.svg
                    key="header-check"
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  >
                    <path d="M5 12l5 5 9-11" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.span>
          </div>

          {/* Four placeholder input blocks */}
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: FIELD_COUNT }).map((_, i) => {
              const isActive = active === i;
              const isFilled = filled > i;
              const state = isActive ? "glow" : isFilled ? "done" : "idle";
              return (
                <motion.div
                  key={i}
                  variants={fieldVariants}
                  animate={state}
                  className="relative h-9 overflow-hidden rounded-[10px] border bg-white"
                >
                  {/* fill sweep */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 origin-left bg-[#EAECF3]"
                    initial={false}
                    animate={{ scaleX: isFilled ? 1 : 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                  {/* "typed" line */}
                  <motion.span
                    aria-hidden
                    className="absolute left-2 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-[#C9CCD6]"
                    initial={false}
                    animate={{
                      width: isFilled ? "60%" : "0%",
                      opacity: isFilled ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Verify button */}
          <motion.button
            type="button"
            onClick={start}
            whileTap={{ scale: 0.97 }}
            className="relative mt-5 flex h-11 w-full items-center justify-center overflow-hidden rounded-[14px] bg-[#25252D] text-[13px] font-bold tracking-wide text-white"
          >
            {/* Blue gradient overlay — fades in on verified */}
            <motion.span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-[#0F62FE] to-[#4C8DFF]"
              initial={false}
              animate={{ opacity: verified ? 1 : 0 }}
              transition={{ duration: 0.35 }}
            />

            <span className="relative z-10 flex items-center justify-center gap-2">
              <AnimatePresence mode="wait" initial={false}>
                {status === "idle" && (
                  <motion.span
                    key="idle"
                    variants={labelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    VERIFY
                  </motion.span>
                )}

                {status === "verifying" && (
                  <motion.span
                    key="verifying"
                    variants={labelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex items-center gap-1"
                  >
                    VERIFYING
                    <LoadingDots />
                  </motion.span>
                )}

                {status === "verified" && (
                  <motion.span
                    key="verified"
                    variants={labelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex items-center gap-1.5"
                  >
                    <CheckIcon />
                    VERIFIED
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.button>
        </motion.div>

        {/* Sub-copy (optional — matches the wireframe context) */}
        <div className="mt-5 px-1">
          <h3 className="text-[17px] font-extrabold tracking-tight text-[#24262F]">
            Register &amp; Verify
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#8B8E99]">
            Sign up in minutes with a secure, fully-regulated onboarding process.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-[3px]">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-[3px] w-[3px] rounded-full bg-white"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

function CheckIcon() {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
    >
      <path d="M5 12l5 5 9-11" />
    </motion.svg>
  );
}
