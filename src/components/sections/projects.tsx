"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Play, ArrowUpRight, X } from "lucide-react";
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
    youtubeId: "d9J7y7pA9lQ",
    tools: ["ChatGPT", "Kling AI", "Runway", "Minimax", "After Effects"],
    objectPosition: "center center",
    featured: true,
  },
  {
    num: "02",
    title: "Rolex: Redefined in 3D",
    category: "3D Design & Motion",
    tag: "2025",
    desc: "A personal exploration of luxury product design. Created using Blender and After Effects, this 3D Rolex ad showcases a minimalist approach to lighting and motion, focusing on the weightless elegance of a timeless brand.",
    thumbnail: "/rolex.jpg",
    objectPosition: "center 20%",
    link: "https://www.behance.net/gallery/222171361/Rolex-Concept-Ad",
    youtubeId: null,
    tools: ["Blender", "After Effects"],
    featured: true,
  },
];

/* ── Lightbox ── */
function Lightbox({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      key="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/92 backdrop-blur-md" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-10 h-10 flex items-center justify-center border border-white/20 text-white/50 hover:text-white hover:border-brand transition-all duration-200"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      {/* Video — portrait for Shorts */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-[min(90vw,380px)]"
        style={{ aspectRatio: "9/16" }}
      >
        {/* Red glow */}
        <div
          className="absolute -inset-8 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(220,28,28,0.12) 0%, transparent 70%)" }}
        />
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          className="w-full h-full border border-white/[0.08]"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title="Project video"
        />
      </motion.div>
    </motion.div>
  );
}

/* ── FeaturedCard ── */
function FeaturedCard({
  project,
  index,
  onPlay,
}: {
  project: typeof projects[0];
  index: number;
  onPlay?: () => void;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (project.youtubeId && onPlay) {
      e.preventDefault();
      onPlay();
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group col-span-full relative overflow-hidden border border-white/[0.06] hover:border-brand/50 transition-colors duration-500"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Thumbnail — clickable to play */}
        <div
          className="relative aspect-video md:aspect-auto md:min-h-[380px] overflow-hidden bg-[#0f0f0f] cursor-pointer"
          onClick={handleCardClick}
        >
          <Image
            src={project.thumbnail!}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            style={{ objectPosition: project.objectPosition ?? "center center" }}
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

          {/* Actions */}
          <div className="flex items-center gap-6 mt-8">
            {project.youtubeId && onPlay && (
              <button
                onClick={onPlay}
                className="flex items-center gap-2 font-body text-xs font-semibold tracking-widest uppercase text-white/50 hover:text-white transition-colors duration-300 group/btn"
              >
                <span className="w-7 h-7 rounded-full border border-white/20 group-hover/btn:border-brand flex items-center justify-center transition-colors duration-300">
                  <Play size={10} className="ml-0.5" />
                </span>
                Watch Video
              </button>
            )}
            <a
              href={project.link!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-body text-xs font-semibold tracking-widest uppercase text-brand hover:text-white transition-colors duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              View on Behance
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Projects section ── */
export function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const featured = projects.filter((p) => p.featured);

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
            { word: "CREATIVE", color: "text-white" },
            { word: "VAULT",    color: "text-brand" },
          ].map(({ word, color }, i) => (
            <motion.h2
              key={word}
              initial={{ y: 40, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={`font-display leading-[0.9] tracking-wider ${color}`}
              style={{ fontSize: "clamp(2.8rem, 6.5vw, 6.5rem)" }}
            >
              {word}
            </motion.h2>
          ))}
        </div>

        {/* Featured projects */}
        <div className="grid grid-cols-1 gap-4">
          {featured.map((p, i) => (
            <FeaturedCard
              key={p.num}
              project={p}
              index={i}
              onPlay={p.youtubeId ? () => setActiveVideo(p.youtubeId) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeVideo && (
          <Lightbox videoId={activeVideo} onClose={() => setActiveVideo(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
