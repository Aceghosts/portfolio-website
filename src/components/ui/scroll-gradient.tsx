"use client";

import { useScroll, useTransform, motion } from "framer-motion";

export function ScrollGradient() {
  const { scrollYProgress } = useScroll();

  // Orb 1 — starts top-left, drifts toward center-right as you scroll
  const orb1X = useTransform(scrollYProgress, [0, 1], ["-15%", "65%"]);
  const orb1Y = useTransform(scrollYProgress, [0, 1], ["-10%", "70%"]);
  const orb1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.22, 0.35, 0.28, 0.15]);
  const orb1Scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.3, 0.9]);

  // Orb 2 — starts bottom-right, drifts toward top-left
  const orb2X = useTransform(scrollYProgress, [0, 1], ["70%", "10%"]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], ["75%", "15%"]);
  const orb2Opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.12, 0.25, 0.3, 0.1]);
  const orb2Scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 1.1]);

  // Orb 3 — subtle center pulse that grows mid-scroll
  const orb3Opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 0.12, 0.15, 0]);
  const orb3Scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1.4, 0.6]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Orb 1 — primary moving glow */}
      <motion.div
        style={{ left: orb1X, top: orb1Y, opacity: orb1Opacity, scale: orb1Scale }}
        className="absolute w-[700px] h-[700px] rounded-full"
        initial={false}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(220,28,28,0.5) 0%, rgba(220,28,28,0.15) 40%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Orb 2 — secondary counter-drift */}
      <motion.div
        style={{ left: orb2X, top: orb2Y, opacity: orb2Opacity, scale: orb2Scale }}
        className="absolute w-[500px] h-[500px] rounded-full"
        initial={false}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(180,20,20,0.4) 0%, rgba(220,28,28,0.1) 50%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Orb 3 — center bloom on mid-scroll */}
      <motion.div
        style={{
          left: "50%",
          top: "50%",
          x: "-50%",
          y: "-50%",
          opacity: orb3Opacity,
          scale: orb3Scale,
        }}
        className="absolute w-[900px] h-[400px]"
        initial={false}
      >
        <div
          className="w-full h-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(220,28,28,0.12) 0%, transparent 70%)",
          }}
        />
      </motion.div>
    </div>
  );
}
