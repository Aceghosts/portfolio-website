"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
  { name: "AI Content Creation", level: 95, category: "AI" },
  { name: "Motion Graphics", level: 92, category: "Motion" },
  { name: "Video Editing", level: 96, category: "Post" },
  { name: "Scriptwriting / Copywriting", level: 88, category: "Creative" },
  { name: "Adobe After Effects", level: 90, category: "Motion" },
  { name: "Adobe Premiere Pro", level: 94, category: "Post" },
  { name: "Adobe Photoshop", level: 85, category: "Design" },
];

function SkillRow({ name, level, category, index }: { name: string; level: number; category: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group flex items-center gap-6 py-5 border-b border-white/[0.05] hover:border-brand/30 transition-colors duration-300"
    >
      {/* Index */}
      <span className="font-body text-xs text-white/20 w-6 shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Name */}
      <div className="flex-1">
        <p className="font-body text-sm md:text-base font-medium text-white/70 group-hover:text-white transition-colors duration-300">
          {name}
        </p>
        <p className="font-body text-[10px] tracking-widest uppercase text-white/25 mt-0.5">
          {category}
        </p>
      </div>

      {/* Bar */}
      <div className="w-32 md:w-56 h-px bg-white/10 relative overflow-visible">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-y-0 left-0 bg-brand origin-left"
          style={{ width: `${level}%`, height: "2px", top: "-1px" }}
        />
      </div>

      {/* Percentage */}
      <span className="font-display text-xl tracking-widest text-brand w-12 text-right shrink-0">
        {level}
      </span>
    </motion.div>
  );
}

export function Skills() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-32 relative overflow-hidden" ref={ref}>
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(220,28,28,0.4) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-16"
        >
          <span className="font-body text-xs tracking-widest uppercase text-brand">02</span>
          <span className="w-12 h-px bg-brand" />
          <span className="font-body text-xs tracking-widest uppercase text-white/40">Skills</span>
        </motion.div>

        {/* Full-width heading */}
        <div className="mb-14">
          {[
            { word: "WHAT I DO", color: "text-white" },
            { word: "BEST", color: "text-brand" },
          ].map(({ word, color }, i) => (
            <div key={word} style={{ overflow: "hidden" }}>
              <motion.h2
                initial={{ y: "100%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`font-display leading-[0.9] tracking-wider ${color}`}
                style={{ fontSize: "clamp(2.8rem, 6.5vw, 6.5rem)" }}
              >
                {word}
              </motion.h2>
            </div>
          ))}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="font-body text-white/35 text-sm leading-relaxed mt-5 max-w-sm"
          >
            A blend of technical precision and creative vision — built over 5 years of hands-on production work.
          </motion.p>
        </div>

        {/* Skill rows — full width */}
        <div>
          {skills.map((skill, i) => (
            <SkillRow key={skill.name} {...skill} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
