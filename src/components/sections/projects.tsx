"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Play, ArrowUpRight } from "lucide-react";
import Image from "next/image";

const projects = [
  {
    num: "01",
    title: "AI Porsche DVC",
    category: "AI Director & Post-Production",
    tag: "2025",
    desc: "A full-scale cinematic for Porsche — conceived, directed, and delivered in 72 hours using an end-to-end AI pipeline. Narrative via ChatGPT, visuals via Kling AI, Runway & Minimax, finished in After Effects.",
    thumbnail: "/thumbnail.jpg",
    link: "https://www.behance.net/gallery/230074723/Ai-Porsche-Ad",
    tools: ["ChatGPT", "Kling AI", "Runway", "Minimax", "After Effects"],
    featured: true,
  },
  { num: "02", title: "Coming Soon", category: "Motion Graphics",        tag: "2025", desc: "", thumbnail: null, link: null, tools: [], featured: false },
  { num: "03", title: "Coming Soon", category: "Brand Video",            tag: "2025", desc: "", thumbnail: null, link: null, tools: [], featured: false },
  { num: "04", title: "Coming Soon", category: "Video Editing",          tag: "2025", desc: "", thumbnail: null, link: null, tools: [], featured: false },
  { num: "05", title: "Coming Soon", category: "Social Media Content",   tag: "2025", desc: "", thumbnail: null, link: null, tools: [], featured: false },
  { num: "06", title: "Coming Soon", category: "Scriptwriting",          tag: "2025", desc: "", thumbnail: null, link: null, tools: [], featured: false },
];

function FeaturedCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      ref={ref}
      href={project.link!}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group col-span-full relative overflow-hidden border border-white/[0.06] hover:border-brand/50 transition-colors duration-500 cursor-pointer block"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Thumbnail */}
        <div className="relative aspect-video md:aspect-auto md:min-h-[380px] overflow-hidden bg-[#0f0f0f]">
          <Image
            src={project.thumbnail!}
            alt={project.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
            sizes="50vw"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
          {/* Red glow on hover */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, rgba(220,28,28,0.15) 0%, transparent 70%)" }}
          />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: hovered ? 1.1 : 1, opacity: hovered ? 1 : 0.6 }}
              transition={{ duration: 0.3 }}
              className="w-16 h-16 rounded-full border border-white/30 bg-black/40 backdrop-blur-sm flex items-center justify-center"
            >
              <Play size={20} className="text-white ml-1" />
            </motion.div>
          </div>
        </div>

        {/* Info */}
        <div className="p-8 md:p-10 flex flex-col justify-between bg-[#0a0a0a]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="font-body text-xs text-brand">{project.num}</span>
                <span className="px-2 py-0.5 border border-brand/30 text-brand font-body text-[10px] tracking-widest uppercase">
                  Featured
                </span>
              </div>
              <span className="font-body text-xs text-white/20">{project.tag}</span>
            </div>

            <p className="font-body text-[10px] tracking-widest uppercase text-brand mb-3">
              {project.category}
            </p>
            <h3 className="font-display text-4xl md:text-5xl tracking-wider text-white mb-5 group-hover:text-brand transition-colors duration-300">
              {project.title}
            </h3>
            <p className="font-body text-sm text-white/40 leading-relaxed mb-8">
              {project.desc}
            </p>

            {/* Tools */}
            <div className="flex flex-wrap gap-2">
              {project.tools.map((tool) => (
                <span key={tool} className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] font-body text-[10px] tracking-widest uppercase text-white/35">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 font-body text-xs font-semibold tracking-widest uppercase text-brand group-hover:text-white transition-colors duration-300">
            View on Behance
            <motion.div animate={{ x: hovered ? 4 : 0, y: hovered ? -4 : 0 }} transition={{ duration: 0.2 }}>
              <ArrowUpRight size={14} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

function PlaceholderCard({ project, index }: { project: typeof projects[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden border border-white/[0.06] hover:border-brand/30 transition-colors duration-500 cursor-default"
    >
      <div className="aspect-video relative bg-[#0c0c0c] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(220,28,28,1) 1px, transparent 1px), linear-gradient(90deg, rgba(220,28,28,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <motion.div
            animate={{ scale: hovered ? 1.08 : 1, backgroundColor: hovered ? "rgba(220,28,28,0.12)" : "rgba(220,28,28,0.05)" }}
            transition={{ duration: 0.3 }}
            className="w-12 h-12 rounded-full border border-brand/20 flex items-center justify-center"
          >
            <Play size={14} className="text-brand/50 ml-0.5" />
          </motion.div>
          <span className="font-body text-[10px] tracking-widest uppercase text-white/15">
            Coming Soon
          </span>
        </div>
      </div>
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="font-body text-[10px] tracking-widests uppercase text-brand/60 mb-1">{project.category}</p>
          <p className="font-display text-lg tracking-wider text-white/25">{project.title}</p>
        </div>
        <span className="font-body text-xs text-white/15">{project.num}</span>
      </div>
    </motion.div>
  );
}

export function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="py-32 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 md:px-14">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-4"
        >
          <span className="font-body text-xs tracking-widest uppercase text-brand">04</span>
          <span className="w-12 h-px bg-brand" />
          <span className="font-body text-xs tracking-widest uppercase text-white/40">Work</span>
        </motion.div>

        {/* Heading */}
        <div className="mb-14">
          {[
            { word: "SELECTED", color: "text-white" },
            { word: "PROJECTS", color: "text-brand" },
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
        </div>

        {/* Featured project — full width */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          {featured.map((p, i) => (
            <FeaturedCard key={p.num} project={p} index={i} />
          ))}
        </div>

        {/* Placeholder grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((p, i) => (
            <PlaceholderCard key={p.num} project={p} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
