import { Button } from "@/components/ui/Button";

const navLinks = ["Today", "Archive", "What is AI?", "About"];

export function Navbar() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 56px",
        borderBottom: "2px solid #031926",
        background: "#F4E9CD",
      }}
    >
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

      <nav style={{ display: "flex", gap: 30, fontSize: 15, fontWeight: 600 }}>
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(/[^a-z]/g, "")}`}
            className="nav-link"
          >
            {link}
          </a>
        ))}
      </nav>

      <Button variant="secondary" href="#signup">
        Subscribe free
      </Button>
    </header>
  );
}
