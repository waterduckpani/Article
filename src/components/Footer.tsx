const links = ["Today", "Vault", "What is AI?", "About"];

export function Footer() {
  return (
    <footer
      className="footer-inner"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 20,
        background: "#F4E9CD",
        borderTop: "1px solid rgba(3,25,38,.12)",
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
        {links.map((link) => (
          <a key={link} href="#" className="footer-link">
            {link}
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
    </footer>
  );
}
