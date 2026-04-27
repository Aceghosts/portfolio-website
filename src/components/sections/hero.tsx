"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

function BehanceIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
    </svg>
  );
}

const socials = [
  { icon: Linkedin, href: "https://www.linkedin.com/in/abbas-mustafa-b0a06a1a9/", label: "LinkedIn" },
  { icon: Instagram, href: "https://www.instagram.com/abbasmustafa__/", label: "Instagram" },
  { icon: BehanceIcon, href: "https://www.behance.net/abbasmustafa", label: "Behance" },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);

  return (
    <section ref={ref} className="relative min-h-screen bg-[#080808] overflow-hidden">

      {/* ── Right side: Abbas photo ── */}
      <motion.div
        style={{ y: imageY }}
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
      >
        {/* Red glow behind photo */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: "radial-gradient(ellipse at 55% 40%, rgba(220,28,28,0.2) 0%, transparent 60%)",
          }}
        />
        <Image
          src="/hero.png"
          alt="Abbas Mustafa"
          fill
          priority
          className="object-cover object-center"
          sizes="50vw"
        />
        {/* Blend left edge into black */}
        <div
          className="absolute inset-0 z-20"
          style={{
            background: "linear-gradient(to right, #080808 0%, rgba(8,8,8,0.5) 25%, transparent 55%)",
          }}
        />
        {/* Blend bottom */}
        <div
          className="absolute inset-0 z-20"
          style={{ background: "linear-gradient(to top, #080808 0%, transparent 35%)" }}
        />
      </motion.div>

      {/* ── Vertical social sidebar ── */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 1.4 }}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-5"
      >
        <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/15" />
        {socials.map(({ icon: Icon, href, label }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
            className="text-white/25 hover:text-brand transition-colors duration-300">
            <Icon size={14} />
          </a>
        ))}
        <div className="w-px h-12 bg-gradient-to-t from-transparent to-white/15" />
      </motion.div>

      {/* ── Left text content ── */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-30 min-h-screen flex flex-col justify-center px-8 md:px-14 w-full md:w-[52%]"
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-3 mb-8 mt-24"
        >
          <span className="w-6 h-px bg-brand" />
          <span className="font-body text-[10px] font-semibold tracking-widest uppercase text-brand">
            Portfolio of
          </span>
        </motion.div>

        {/* ABBAS */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="font-display leading-[0.88] text-white"
            style={{ fontSize: "clamp(2.6rem, 7.5vw, 7.5rem)" }}
          >
            ABBAS
          </motion.h1>
        </div>

        {/* MUSTAFA */}
        <div className="overflow-hidden mb-6">
          <motion.h1
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, delay: 0.54, ease: [0.16, 1, 0.3, 1] }}
            className="font-display leading-[0.88] text-brand"
            style={{ fontSize: "clamp(2.6rem, 7.5vw, 7.5rem)" }}
          >
            MUSTAFA
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.72 }}
          className="font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-white/35 mb-5"
        >
          AI Content Producer&nbsp;·&nbsp;Motion Graphics&nbsp;·&nbsp;Editor
        </motion.p>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.84 }}
          className="font-body text-sm text-white/35 leading-relaxed max-w-xs mb-10"
        >
          I transform ideas into engaging visual stories through AI, motion and editing.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.96 }}
          className="mb-16"
        >
          <a
            href="#projects"
            className="inline-flex items-center gap-3 px-6 py-3 border border-white/20 hover:border-brand text-white font-body text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 group"
          >
            View Work
            <motion.span
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              ↓
            </motion.span>
          </a>
        </motion.div>
      </motion.div>

      {/* Scan line */}
      <motion.div
        animate={{ top: ["-2%", "102%"] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear", repeatDelay: 8 }}
        className="absolute left-0 w-full h-px bg-gradient-to-r from-transparent via-brand/15 to-transparent z-30 pointer-events-none"
        style={{ position: "absolute" }}
      />
    </section>
  );
}
