"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Play, X } from "lucide-react";

type Orientation = "landscape" | "portrait";

type Project = {
  num: string;
  title: string;
  tags: string[];
  headline: string;
  desc: string;
  youtubeId: string;
  orientation: Orientation;
};

const projects: Project[] = [
  {
    num: "01",
    title: "Capri Deo Men",
    tags: ["AI DVC", "Brand Film"],
    headline: "Every frame. Every beat. Pure AI.",
    desc: "A complete DVC produced without a single camera — every visual, every frame and even the jingle was generated using AI tools from scratch.",
    youtubeId: "K1Lq9BuCtPQ",
    orientation: "landscape",
  },
  {
    num: "02",
    title: "PSO MD Farewell",
    tags: ["AI Tribute Film", "Corporate"],
    headline: "One photo. One legacy. One cinematic farewell.",
    desc: "When PSO's MD retired, we turned a single photograph into a full tribute video that moved an entire boardroom.",
    youtubeId: "QMEF1p7SC0w",
    orientation: "landscape",
  },
  {
    num: "03",
    title: "Hype AI Asset",
    tags: ["Product Video", "AI Content"],
    headline: "15 seconds of pure product obsession.",
    desc: "A short-form product video built to stop the scroll — every frame crafted to highlight the beauty of the product, nothing wasted.",
    youtubeId: "riG3K2Flsu0",
    orientation: "portrait",
  },
  {
    num: "04",
    title: "Itel Nigeria DVC",
    tags: ["AI DVC", "International Brand"],
    headline: "Full AI production before AI was mainstream.",
    desc: "A complete DVC for Itel Nigeria — from storyboard to last frame, built entirely with AI at a time when the industry hadn't caught up yet.",
    youtubeId: "PekyYtp7OD8",
    orientation: "landscape",
  },
  {
    num: "05",
    title: "Krone Fresh Start",
    tags: ["Perfume Teaser", "Social Media"],
    headline: "A fragrance deserves a cinematic entrance.",
    desc: "A teaser post for Krone's perfume launch — moody, premium and built frame by frame using Kling and Nano Banana.",
    youtubeId: "SX1Cxiu7-Lg",
    orientation: "portrait",
  },
  {
    num: "06",
    title: "Krone Body Wash Teaser",
    tags: ["Product Teaser", "AI Content"],
    headline: "2026 AI. Premium results.",
    desc: "A body wash teaser built with the most advanced AI tools available today — GPT Image 2 and Nano Banana Pro doing the heavy lifting.",
    youtubeId: "KgAnlUt_wDg",
    orientation: "portrait",
  },
  {
    num: "07",
    title: "PSO Deo MAX",
    tags: ["Social Media Content", "Brand"],
    headline: "Minimum effort. Maximum impact.",
    desc: "A social media post that proves AI doesn't need to be complex to be powerful — built with Kling and Nano Banana, finished in After Effects.",
    youtubeId: "k9eFJdb0Seg",
    orientation: "portrait",
  },
  {
    num: "08",
    title: "PSO Journey",
    tags: ["Brand Film", "Corporate"],
    headline: "3 days. 1 story. Played 3 times in the boardroom.",
    desc: "From storyboard to final cut in 72 hours — frames, audio, jingle and transitions all AI-assisted. The client loved it so much they played it three times back to back.",
    youtubeId: "QQenfVkfMt4",
    orientation: "landscape",
  },
];

/* ── Thumbnail with maxres → hq fallback ── */
function Thumb({ videoId, title }: { videoId: string; title: string }) {
  const [src, setSrc] = useState(
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={title}
      loading="lazy"
      onError={() =>
        setSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
      }
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
    />
  );
}

/* ── Lightbox ── */
function Lightbox({
  videoId,
  orientation,
  onClose,
}: {
  videoId: string;
  orientation: Orientation;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const portrait = orientation === "portrait";

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

      {/* Video — portrait for Shorts, landscape for full videos */}
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.88, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 ${
          portrait ? "w-[min(90vw,380px)]" : "w-[min(92vw,960px)]"
        }`}
        style={{ aspectRatio: portrait ? "9/16" : "16/9" }}
      >
        {/* Red glow */}
        <div
          className="absolute -inset-8 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(220,28,28,0.12) 0%, transparent 70%)",
          }}
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

/* ── ProjectCard ── */
function ProjectCard({
  project,
  index,
  onPlay,
}: {
  project: Project;
  index: number;
  onPlay: () => void;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 2) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col overflow-hidden border border-white/[0.06] hover:border-brand/50 transition-colors duration-500 bg-[#0a0a0a]"
    >
      {/* Thumbnail — clickable to play */}
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play ${project.title}`}
        className="relative aspect-video overflow-hidden bg-[#0f0f0f] cursor-pointer text-left"
      >
        <Thumb videoId={project.youtubeId} title={project.title} />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
        {/* Red glow on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(220,28,28,0.15) 0%, transparent 70%)",
          }}
        />
        {/* Number badge */}
        <span className="absolute top-4 left-4 font-body text-xs text-white/70">
          {project.num}
        </span>
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
      </button>

      {/* Info */}
      <div className="p-7 md:p-8 flex flex-col flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 border border-brand/30 text-brand font-body text-[10px] tracking-widest uppercase"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-display text-3xl md:text-4xl tracking-wider text-white mb-3 group-hover:text-brand transition-colors duration-300">
          {project.title}
        </h3>

        <p className="font-body text-sm italic text-white/60 mb-4">
          {project.headline}
        </p>

        <p className="font-body text-sm text-white/40 leading-relaxed mb-7">
          {project.desc}
        </p>

        {/* Action */}
        <button
          onClick={onPlay}
          className="mt-auto flex items-center gap-2 font-body text-xs font-semibold tracking-widest uppercase text-white/50 hover:text-white transition-colors duration-300 group/btn self-start"
        >
          <span className="w-7 h-7 rounded-full border border-white/20 group-hover/btn:border-brand flex items-center justify-center transition-colors duration-300">
            <Play size={10} className="ml-0.5" />
          </span>
          Watch Video
        </button>
      </div>
    </motion.div>
  );
}

/* ── Projects section ── */
export function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeVideo, setActiveVideo] = useState<{
    id: string;
    orientation: Orientation;
  } | null>(null);

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
            { word: "VAULT", color: "text-brand" },
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

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.num}
              project={p}
              index={i}
              onPlay={() =>
                setActiveVideo({ id: p.youtubeId, orientation: p.orientation })
              }
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeVideo && (
          <Lightbox
            videoId={activeVideo.id}
            orientation={activeVideo.orientation}
            onClose={() => setActiveVideo(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
