"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { label: "Today",       href: "/#today" },
  { label: "Archive",     href: "/#archive" },
  { label: "What is AI?", href: "/what-is-ai" },
  { label: "About",       href: "/#about" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  const mobileMenu = (
    <div className={`nav-mobile-menu${open ? " open" : ""}`} role="dialog" aria-modal="true">
      <button className="nav-mobile-close" onClick={close} aria-label="Close menu">✕</button>
      <a href="/" className="nav-mobile-brand" onClick={close}>Article</a>
      {navLinks.map((link) => (
        <a key={link.label} href={link.href} className="nav-mobile-link" onClick={close}>
          {link.label}
        </a>
      ))}
      <Button variant="secondary" href="#signup" onClick={close}>Subscribe free</Button>
    </div>
  );

  return (
    <>
      <header className="navbar-header">
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <a
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: "-.02em",
              color: "#031926",
              textDecoration: "none",
            }}
          >
            Article
          </a>
          <span
            className="navbar-tagline"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "#468189",
            }}
          >
            AI / in plain english
          </span>
        </div>

        <nav className="navbar-links">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar-right">
          <Button variant="secondary" href="#signup">Subscribe free</Button>
          <button
            className={`navbar-hamburger${open ? " open" : ""}`}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Portal renders directly to document.body — bypasses page-reveal stacking context */}
      {mounted && createPortal(mobileMenu, document.body)}
    </>
  );
}
