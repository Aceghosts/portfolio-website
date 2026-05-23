"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const services = [
  {
    num: "01",
    title: "AI Content Creation",
    desc: "Leveraging cutting-edge AI tools to produce compelling visual narratives, from concept to final render — faster than traditional pipelines without sacrificing quality.",
  },
  {
    num: "02",
    title: "Motion Graphics",
    desc: "Cinematic title sequences, animated infographics, and brand motion pieces crafted in After Effects. Every frame intentional.",
  },
  {
    num: "03",
    title: "Video Editing",
    desc: "Multi-format editing with precision colour grading, sound design, and pacing that turns raw footage into a story worth watching.",
  },
  {
    num: "04",
    title: "Script Writing",
    desc: "Clear, punchy, on-brand scripts that give your video a spine. From 30-second ads to long-form documentary narration.",
  },
  {
    num: "05",
    title: "Brand Videos / Ads",
    desc: "High-converting ad creatives and brand films that communicate your identity in seconds and leave an impression that lasts.",
  },
  {
    num: "06",
    title: "Social Media Content",
    desc: "Platform-native short-form content optimised for Reels, TikTok, and YouTube Shorts — scroll-stopping by design.",
  },
];

export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section id="services" className="py-32 relative overflow-hidden" ref={ref}>
      <div
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-10"
        style={{
          background: "radial-gradient(circle, rgba(220,28,28,0.5) 0%, transparent 70%)",
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
          <span className="font-body text-xs tracking-widest uppercase text-brand">03</span>
          <span className="w-12 h-px bg-brand" />
          <span className="font-body text-xs tracking-widest uppercase text-white/40">Services</span>
        </motion.div>

        {/* Full-width heading */}
        <div className="mb-14">
          <motion.h2
            initial={{ y: 40, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display leading-[0.9] tracking-wider text-white"
            style={{ fontSize: "clamp(2.8rem, 6.5vw, 6.5rem)" }}
          >
            WHAT I OFFER
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="font-body text-white/35 text-sm mt-5 max-w-sm"
          >
            End-to-end production for brands, creators, and agencies who refuse to settle for average.
          </motion.p>
        </div>

        {/* Service list — full width */}
        <div className="border-t border-white/[0.06]">
            {services.map((service, i) => (
              <motion.div
                key={service.num}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="group border-b border-white/[0.06] py-7 cursor-default"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-5">
                    <span className="font-body text-xs text-brand mt-1 shrink-0">{service.num}</span>
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl tracking-widest text-white group-hover:text-brand transition-colors duration-300">
                        {service.title}
                      </h3>
                      <motion.p
                        initial={false}
                        animate={{
                          height: hovered === i ? "auto" : 0,
                          opacity: hovered === i ? 1 : 0,
                        }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="font-body text-sm text-white/40 leading-relaxed overflow-hidden mt-0"
                        style={{ marginTop: hovered === i ? "0.5rem" : 0 }}
                      >
                        {service.desc}
                      </motion.p>
                    </div>
                  </div>
                  <motion.span
                    animate={{ rotate: hovered === i ? 45 : 0, color: hovered === i ? "#DC1C1C" : "rgba(255,255,255,0.2)" }}
                    transition={{ duration: 0.25 }}
                    className="text-xl mt-1 shrink-0"
                  >
                    +
                  </motion.span>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
