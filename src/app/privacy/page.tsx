import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://articlenews.co";
const CONTACT_EMAIL = "hello@articlenews.co";
const LAST_UPDATED = "14 June 2026";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Article collects, uses, and protects your personal data. Plain English, no legalese.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: "-.02em",
          color: "#031926",
          margin: "0 0 16px",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 16,
          lineHeight: 1.75,
          color: "#2a4348",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 16px" }}>{children}</p>;
}

function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul style={{ margin: "0 0 16px", paddingLeft: 24 }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 8 }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ background: "#F4E9CD", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ background: "#031926", position: "relative", overflow: "hidden" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -40,
              right: -20,
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 340,
              lineHeight: 0.85,
              color: "rgba(70,129,137,.07)",
              userSelect: "none",
              pointerEvents: "none",
              letterSpacing: "-.05em",
            }}
          >
            P
          </div>

          <div
            className="page-hero-header"
            style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}
          >
            <a
              href="/"
              className="nav-link"
              style={{
                display: "inline-block",
                marginBottom: 48,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#468189",
              }}
            >
              ← Home
            </a>

            <div
              style={{
                background: "#E0A53F",
                color: "#031926",
                padding: "6px 16px",
                borderRadius: 40,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                display: "inline-block",
                marginBottom: 20,
              }}
            >
              Legal
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: 1.04,
                letterSpacing: "-.03em",
                color: "#F4E9CD",
                margin: "0 0 20px",
              }}
            >
              Privacy Policy
            </h1>

            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "#77ACA2",
                margin: 0,
              }}
            >
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "64px 24px 96px",
          }}
        >
          <Section title="The short version">
            <P>
              We collect your email address when you subscribe to the newsletter. We use it to send you
              Article — nothing else. We don&apos;t sell it. We don&apos;t share it with advertisers.
              You can unsubscribe any time with one click.
            </P>
            <P>
              We also use Vercel Analytics — a privacy-first, cookieless analytics tool — to understand
              how people find and read Article. It does not track you across the web or set cookies on
              your device.
            </P>
          </Section>

          <Section title="Who we are">
            <P>
              Article is a daily AI newsletter published at{" "}
              <a href={SITE_URL} style={{ color: "#468189" }}>
                articlenews.co
              </a>
              . For any privacy questions, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#468189" }}>
                {CONTACT_EMAIL}
              </a>
              .
            </P>
          </Section>

          <Section title="What data we collect and why">
            <P>
              <strong style={{ color: "#031926" }}>Email address</strong>
              <br />
              When you subscribe, we collect your email address. We use it solely to send you the daily
              Article newsletter. The legal basis for processing this data is your explicit consent,
              which you give by ticking the consent checkbox and submitting the form.
            </P>
            <P>
              <strong style={{ color: "#031926" }}>Analytics data</strong>
              <br />
              We use Vercel Web Analytics, which is cookieless and does not set any tracking cookies on
              your browser. It collects anonymised data about page visits (such as which pages are viewed
              and approximate geographic region) using a privacy-preserving hash rather than persistent
              identifiers. No personal data is stored by this system. The legal basis is our legitimate
              interest in understanding how our content performs so we can improve it.
            </P>
            <P>
              <strong style={{ color: "#031926" }}>Performance data</strong>
              <br />
              We use Vercel Speed Insights to monitor how quickly pages load. This collects anonymised
              technical metrics (e.g. page load time, browser type). No personal data is stored.
            </P>
          </Section>

          <Section title="Who we share your data with">
            <P>We do not sell or rent your personal data. We share it only with:</P>
            <UL
              items={[
                <>
                  <strong style={{ color: "#031926" }}>Vercel Inc.</strong> — our hosting provider,
                  based in the United States. They host our website and process analytics data. Vercel
                  is certified under the EU–US Data Privacy Framework.
                </>,
                <>
                  <strong style={{ color: "#031926" }}>Supabase Inc.</strong> — our database provider,
                  based in the United States. They securely store subscriber email addresses. Supabase
                  is GDPR-compliant and processes data under a Data Processing Agreement.
                </>,
              ]}
            />
            <P>
              Both providers act as data processors under our instructions. They are not permitted to
              use your data for their own purposes.
            </P>
          </Section>

          <Section title="How long we keep your data">
            <P>
              We keep your email address for as long as you remain a subscriber. If you unsubscribe, we
              will delete your email address from our mailing list within 30 days. You can also request
              deletion at any time by emailing{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#468189" }}>
                {CONTACT_EMAIL}
              </a>
              .
            </P>
          </Section>

          <Section title="Cookies">
            <P>
              Article does not use advertising cookies, social media tracking cookies, or third-party
              analytics cookies. Vercel Analytics is cookieless by design.
            </P>
            <P>
              Some essential cookies may be set automatically by your browser or our infrastructure
              (for example, to maintain a secure connection or remember your preferences during a
              session). These are strictly necessary for the site to function and do not require consent.
            </P>
          </Section>

          <Section title="Your rights">
            <P>
              Under UK GDPR and EU GDPR, you have the right to:
            </P>
            <UL
              items={[
                <><strong style={{ color: "#031926" }}>Access</strong> — request a copy of the personal data we hold about you.</>,
                <><strong style={{ color: "#031926" }}>Rectification</strong> — ask us to correct inaccurate data.</>,
                <><strong style={{ color: "#031926" }}>Erasure</strong> — ask us to delete your data (&quot;right to be forgotten&quot;).</>,
                <><strong style={{ color: "#031926" }}>Restriction</strong> — ask us to limit how we use your data.</>,
                <><strong style={{ color: "#031926" }}>Portability</strong> — receive your data in a machine-readable format.</>,
                <><strong style={{ color: "#031926" }}>Objection</strong> — object to processing based on legitimate interests.</>,
                <><strong style={{ color: "#031926" }}>Withdraw consent</strong> — unsubscribe at any time via the link in any email, or by contacting us directly.</>,
              ]}
            />
            <P>
              To exercise any of these rights, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#468189" }}>
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days.
            </P>
            <P>
              If you are unhappy with how we handle your data, you have the right to lodge a complaint
              with the Information Commissioner&apos;s Office (ICO) at{" "}
              <a href="https://ico.org.uk" style={{ color: "#468189" }}>
                ico.org.uk
              </a>{" "}
              (if you are in the UK) or your national data protection authority (if you are in the EU).
            </P>
          </Section>

          <Section title="International transfers">
            <P>
              Our service providers (Vercel, Supabase) are based in the United States. When your data
              is transferred outside the UK or EEA, we ensure appropriate safeguards are in place,
              including standard contractual clauses or certification under the EU–US Data Privacy
              Framework.
            </P>
          </Section>

          <Section title="Changes to this policy">
            <P>
              If we make material changes to this Privacy Policy, we will update the &quot;last
              updated&quot; date at the top and, where appropriate, notify subscribers by email. We
              encourage you to review this page periodically.
            </P>
          </Section>

          <Section title="Contact">
            <P>
              Questions, requests, or concerns:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#468189" }}>
                {CONTACT_EMAIL}
              </a>
            </P>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
