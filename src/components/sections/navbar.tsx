"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
  { label: "About",    href: "#about" },
  { label: "Work",     href: "#projects" },
  { label: "Services", href: "#services" },
  { label: "Contact",  href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function closeMenu(href: string) {
    setOpen(false);
    // Small delay so the menu closes before scroll jumps
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 300);
  }

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-[#080808]/90 backdrop-blur-md border-b border-white/5 py-4"
            : "py-6 bg-[#080808]/40 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
        )}
      >
        <nav className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-3 items-center">
          {/* Logo */}
          <a href="#" className="font-display text-2xl tracking-wider z-50 relative">
            <span className="text-brand">AI</span>
            <span className="text-white">bbas</span>
          </a>

          {/* Desktop links */}
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

          {/* Desktop CTA + Mobile toggle */}
          <div className="flex justify-end items-center">
            <a
              href="#contact"
              className="hidden md:flex items-center gap-2 px-5 py-2 border border-white/20 hover:border-brand text-white/70 hover:text-white font-body text-[11px] font-semibold tracking-widest uppercase transition-all duration-300 group"
            >
              Hire Me
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>

            {/* Hamburger — bigger tap target */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden relative z-50 flex flex-col justify-center items-center w-10 h-10 gap-1.5"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <motion.span
                animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }}
                transition={{ duration: 0.25 }}
                className="block w-6 h-0.5 bg-white origin-center"
              />
              <motion.span
                animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
                transition={{ duration: 0.2 }}
                className="block w-6 h-0.5 bg-white"
              />
              <motion.span
                animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }}
                transition={{ duration: 0.25 }}
                className="block w-6 h-0.5 bg-white origin-center"
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[#080808] flex flex-col justify-center px-8 md:hidden"
          >
            {/* Red glow */}
            <div
              className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(220,28,28,0.12) 0%, transparent 70%)" }}
            />

            <ul className="flex flex-col gap-8">
              {links.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                >
                  <button
                    onClick={() => closeMenu(link.href)}
                    className="font-display text-4xl tracking-wider text-white/60 hover:text-white active:text-brand transition-colors duration-200 text-left w-full"
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <button
                onClick={() => closeMenu("#contact")}
                className="inline-flex items-center gap-2 px-6 py-3 border border-brand text-brand font-body text-xs font-semibold tracking-widest uppercase"
              >
                Hire Me →
              </button>
            </motion.div>

            {/* Bottom number */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="absolute bottom-10 left-8 font-body text-xs tracking-widest text-white/20"
            >
              +92 336 8278796
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
