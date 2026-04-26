"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "bg-[#080808]/90 backdrop-blur-md border-b border-white/5 py-4" : "py-6"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-3 items-center">
        {/* Logo — left */}
        <a href="#" className="font-display text-2xl tracking-wider">
          <span className="text-brand">AI</span>
          <span className="text-white">bbas</span>
        </a>

        {/* Nav links — center */}
        <ul className="hidden md:flex items-center justify-center gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-body text-[11px] font-medium tracking-widest uppercase text-white/40 hover:text-white transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-brand group-hover:w-full transition-all duration-300" />
              </a>
            </li>
          ))}
        </ul>

        {/* CTA — right */}
        <div className="flex justify-end">
          <a
            href="#contact"
            className="hidden md:flex items-center gap-2 px-5 py-2 border border-white/20 hover:border-brand text-white/70 hover:text-white font-body text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 group"
          >
            Hire Me
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </a>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col gap-1.5 p-1"
            aria-label="Menu"
          >
            <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 8 : 0 }} className="block w-6 h-px bg-white origin-center" />
            <motion.span animate={{ opacity: open ? 0 : 1 }} className="block w-6 h-px bg-white" />
            <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -8 : 0 }} className="block w-6 h-px bg-white origin-center" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-[#080808] border-t border-white/5"
          >
            <ul className="flex flex-col px-6 py-6 gap-5">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-body text-sm tracking-widest uppercase text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#contact" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 px-5 py-2.5 border border-brand text-brand font-body text-xs tracking-widest uppercase">
                  Hire Me →
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
