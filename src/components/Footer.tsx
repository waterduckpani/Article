const navLinks = [
  { label: "Today", href: "/" },
  { label: "Vault", href: "/vault" },
  { label: "What is AI?", href: "/what-is-ai" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function Footer() {
  return (
    <footer
      style={{
        background: "#F4E9CD",
        borderTop: "1px solid rgba(3,25,38,.12)",
      }}
    >
      <div
        className="footer-inner"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: "-.02em",
            color: "#031926",
          }}
        >
          Article
        </div>

        <nav style={{ display: "flex", gap: 28, fontSize: 14, fontWeight: 600 }}>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="footer-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "#77ACA2",
          }}
        >
          Set in Bricolage Grotesque · Est. 2026
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 24,
          padding: "16px 24px",
          borderTop: "1px solid rgba(3,25,38,.06)",
        }}
      >
        {legalLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: ".08em",
              color: "#77ACA2",
              textDecoration: "none",
            }}
          >
            {link.label}
          </a>
        ))}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#9DBEBB",
            opacity: 0.7,
          }}
        >
          © {new Date().getFullYear()} Article. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
