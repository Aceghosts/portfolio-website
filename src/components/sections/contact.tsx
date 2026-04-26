"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Mail, Send, CheckCircle, Instagram, Linkedin } from "lucide-react";

function BehanceIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/>
    </svg>
  );
}

const inputClass =
  "w-full bg-transparent border-b border-white/10 focus:border-brand py-3 text-white placeholder-white/20 font-body text-sm outline-none transition-colors duration-300";

export function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", service: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section id="contact" className="py-32 relative overflow-hidden" ref={ref}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none opacity-10"
        style={{
          background: "radial-gradient(ellipse, rgba(220,28,28,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-16 relative">
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

        {/* Full-width heading */}
        <div className="mb-14">
          {[
            { word: "LET'S WORK", color: "text-white" },
            { word: "TOGETHER", color: "text-brand" },
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

        <div className="grid lg:grid-cols-2 gap-20">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-10 space-y-4"
            >
              <p className="font-body text-white/40 text-sm leading-relaxed max-w-xs">
                Have a project in mind? Let&apos;s make something cinematic together. Drop a message and I&apos;ll get back within 24 hours.
              </p>

              <a
                href="mailto:abbas5253godhra@gmail.com"
                className="flex items-center gap-3 font-body text-sm text-white/50 hover:text-brand transition-colors duration-300 group"
              >
                <Mail size={14} />
                abbas5253godhra@gmail.com
              </a>

              <div className="flex items-center gap-4 pt-4">
                {[
                  { icon: Linkedin, href: "https://www.linkedin.com/in/abbas-mustafa-b0a06a1a9/", label: "LinkedIn" },
                  { icon: Instagram, href: "https://www.instagram.com/abbasmustafa__/", label: "Instagram" },
                  { icon: BehanceIcon, href: "https://www.behance.net/abbasmustafa", label: "Behance" },
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
          </div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-5 py-20 text-center"
              >
                <CheckCircle className="text-brand" size={44} />
                <h3 className="font-display text-3xl tracking-widest text-white">MESSAGE SENT</h3>
                <p className="font-body text-white/40 text-sm">
                  I&apos;ll get back to you at <span className="text-white">{form.email}</span> within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <label className="font-body text-[10px] tracking-widest uppercase text-white/30 block mb-2">
                      Your Name
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Abbas Mustafa"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="font-body text-[10px] tracking-widest uppercase text-white/30 block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-body text-[10px] tracking-widest uppercase text-white/30 block mb-2">
                    Service Needed
                  </label>
                  <select
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    <option value="" className="bg-[#080808]">Select a service...</option>
                    <option value="ai" className="bg-[#080808]">AI Content Creation</option>
                    <option value="motion" className="bg-[#080808]">Motion Graphics</option>
                    <option value="editing" className="bg-[#080808]">Video Editing</option>
                    <option value="script" className="bg-[#080808]">Script Writing</option>
                    <option value="brand" className="bg-[#080808]">Brand Videos / Ads</option>
                    <option value="social" className="bg-[#080808]">Social Media Content</option>
                  </select>
                </div>

                <div>
                  <label className="font-body text-[10px] tracking-widest uppercase text-white/30 block mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell me about your project..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  className="group flex items-center gap-3 font-body text-sm font-semibold tracking-widest uppercase text-white border border-white/10 hover:border-brand hover:text-brand px-6 py-4 transition-all duration-300"
                >
                  <Send size={14} />
                  Send Message
                  <span className="w-6 h-px bg-white/20 group-hover:bg-brand group-hover:w-12 transition-all duration-300" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
