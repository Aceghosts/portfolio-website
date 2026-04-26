"use client";

import { motion } from "framer-motion";
import { Instagram, Linkedin, Mail } from "lucide-react";

function BehanceIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988H0V5.021h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zM3 11h3.584c2.508 0 2.906-3-.312-3H3v3zm3.391 3H3v3.016h3.341c3.055 0 2.868-3.016.05-3.016z"/>
    </svg>
  );
}

const links = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Services", href: "#services" },
  { label: "Work", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05]">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10 mb-12">
          <div>
            <a href="#" className="font-display text-4xl tracking-wider">
              <span className="text-brand">AI</span>
              <span className="text-white">bbas</span>
            </a>
            <p className="font-body text-xs tracking-widest uppercase text-white/25 mt-2">
              From Raw Ideas to Rendered Perfection
            </p>
          </div>

          <nav>
            <ul className="flex flex-wrap gap-6">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-body text-xs tracking-widest uppercase text-white/30 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            {[
              { icon: Linkedin, href: "https://www.linkedin.com/in/abbas-mustafa-b0a06a1a9/", label: "LinkedIn" },
              { icon: Instagram, href: "https://www.instagram.com/abbasmustafa__/", label: "Instagram" },
              { icon: BehanceIcon, href: "https://www.behance.net/abbasmustafa", label: "Behance" },
              { icon: Mail, href: "mailto:abbas5253godhra@gmail.com", label: "Email" },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 border border-white/[0.07] flex items-center justify-center text-white/25 hover:text-brand hover:border-brand/40 transition-all duration-300"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.05] mb-8" />

        {/* Bottom row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="font-body text-xs text-white/20">
            © {new Date().getFullYear()} Abbas Mustafa. All rights reserved.
          </p>
          <p className="font-body text-xs text-white/20">
            AI Content Producer · Motion Graphics · Editor
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
