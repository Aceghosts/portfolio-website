"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Instagram, Linkedin } from "lucide-react";

const WHATSAPP = "https://wa.me/923368278796";
const PHONE = "+92 336 8278796";

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function BehanceIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
    </svg>
  );
}

export function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-32 relative overflow-hidden" ref={ref}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-10"
        style={{ background: "radial-gradient(ellipse, rgba(220,28,28,0.5) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-14 relative">
        {/* Label */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-4 mb-16"
        >
          <span className="font-body text-xs tracking-widest uppercase text-brand">05</span>
          <span className="w-12 h-px bg-brand" />
          <span className="font-body text-xs tracking-widest uppercase text-white/40">Contact</span>
        </motion.div>

        {/* Heading */}
        <div className="mb-16">
          {[
            { word: "LET'S WORK", color: "text-white" },
            { word: "TOGETHER",   color: "text-brand" },
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

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — info */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="space-y-8"
          >
            <p className="font-body text-white/40 text-base leading-relaxed max-w-sm">
              Have a project in mind? Let&apos;s make something cinematic together.
              Click below to chat with me directly on WhatsApp — I reply fast.
            </p>

            <div className="space-y-2">
              <p className="font-body text-[10px] tracking-widest uppercase text-white/25">Phone / WhatsApp</p>
              <a
                href={`tel:${PHONE.replace(/\s/g, "")}`}
                className="flex items-center gap-3 font-body text-white/60 hover:text-white transition-colors duration-300"
              >
                <Phone size={13} className="text-brand" />
                {PHONE}
              </a>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-4">
              {[
                { icon: Linkedin,    href: "https://www.linkedin.com/in/abbas-mustafa-b0a06a1a9/", label: "LinkedIn" },
                { icon: Instagram,   href: "https://www.instagram.com/abbasmustafa__/",            label: "Instagram" },
                { icon: BehanceIcon, href: "https://www.behance.net/abbasmustafa",                 label: "Behance" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-white/25 hover:text-brand transition-colors duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right — WhatsApp CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col items-start gap-6"
          >
            {/* Big WhatsApp button */}
            <motion.a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group flex items-center gap-4 px-8 py-5 bg-[#25D366] hover:bg-[#1ebe5d] text-black font-body text-sm font-bold tracking-widest uppercase transition-colors duration-300 w-full justify-center"
            >
              <WhatsAppIcon size={20} />
              Chat on WhatsApp
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.a>

            {/* Secondary: outline style */}
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 font-body text-xs tracking-widest uppercase text-white/30 hover:text-[#25D366] transition-colors duration-300"
            >
              <WhatsAppIcon size={12} />
              Or tap to open WhatsApp directly
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
