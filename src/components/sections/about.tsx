"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-16 md:py-24 relative overflow-hidden" ref={ref}>
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, rgba(220,28,28,0.3) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-14">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-10 md:mb-14"
        >
          <span className="font-body text-xs tracking-widest uppercase text-brand">01</span>
          <span className="w-10 h-px bg-brand" />
          <span className="font-body text-xs tracking-widest uppercase text-white/40">About</span>
        </motion.div>

        {/* Heading */}
        <div className="mb-10 md:mb-14">
          {[
            { word: "THE STORY", color: "text-white" },
            { word: "BEHIND", color: "text-brand" },
            { word: "THE WORK", color: "text-white/20" },
          ].map(({ word, color }, i) => (
            <div key={word} style={{ overflow: "hidden" }}>
              <motion.h2
                initial={{ y: "100%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`font-display leading-[0.9] tracking-wider ${color}`}
                style={{ fontSize: "clamp(2.2rem, 6.5vw, 6.5rem)" }}
              >
                {word}
              </motion.h2>
            </div>
          ))}
        </div>

        {/* Bio + details */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="space-y-4"
          >
            <p className="font-body text-white/55 text-sm md:text-base leading-relaxed">
              I&apos;ve spent the last{" "}
              <span className="text-white font-semibold">5 years</span> evolving from a traditional
              editor into an{" "}
              <span className="text-brand font-semibold">AI production specialist</span>, supported
              by a degree in Media Science. This foundation lets me use AI as a high-level
              storytelling tool — not a shortcut.
            </p>
            <p className="font-body text-white/55 text-sm md:text-base leading-relaxed">
              I focus on turning raw concepts into{" "}
              <span className="text-white font-semibold">polished, cinematic content</span> that
              resonates. If you need someone who understands both the &lsquo;why&rsquo; and the
              &lsquo;how&rsquo; of modern video, I&apos;m your guy.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="space-y-4 mt-2 lg:mt-0"
          >
            {[
              { color: "bg-brand", text: "BSc Media Science · Karachi, Pakistan" },
              { color: "bg-green-400 animate-pulse", text: "Available for Freelance" },
              { color: "bg-white/20", text: "abbas5253godhra@gmail.com" },
            ].map(({ color, text }) => (
              <div key={text} className="flex items-start gap-3">
                <span className={`w-2 h-2 mt-1 shrink-0 ${color}`} />
                <span className="font-body text-xs tracking-wider uppercase text-white/40 leading-relaxed">
                  {text}
                </span>
              </div>
            ))}

            <div className="pt-3">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 font-body text-sm font-semibold tracking-widest uppercase text-brand hover:text-white transition-colors duration-300 group"
              >
                Let&apos;s Work Together
                <span className="w-8 h-px bg-brand group-hover:w-14 transition-all duration-300" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats — stacked on mobile, row on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-14 md:mt-16 border-t border-white/[0.06] pt-10 md:pt-12"
        >
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            {[
              { value: "5+",  label: "Years\nExperience" },
              { value: "20+", label: "Projects\nCompleted" },
              { value: "15+", label: "Happy\nClients" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center px-2">
                <p
                  className="font-display tracking-wider text-brand mb-2 leading-none"
                  style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
                >
                  {value}
                </p>
                <p className="font-body text-[9px] md:text-[10px] tracking-widest uppercase text-white/30 whitespace-pre-line leading-relaxed">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
