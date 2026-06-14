import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://articlenews.co";
const CONTACT_EMAIL = "hello@articlenews.co";
const LAST_UPDATED = "14 June 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Article — the free daily AI newsletter at articlenews.co.",
  alternates: { canonical: `${SITE_URL}/terms` },
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
      <div style={{ fontSize: 16, lineHeight: 1.75, color: "#2a4348" }}>
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 16px" }}>{children}</p>;
}

export default function TermsPage() {
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
            T
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
              Terms of Service
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
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 96px" }}>
          <Section title="Overview">
            <P>
              Article (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website at{" "}
              <a href={SITE_URL} style={{ color: "#468189" }}>
                articlenews.co
              </a>{" "}
              and the associated daily newsletter. By accessing our website or subscribing to our
              newsletter, you agree to these Terms of Service. If you do not agree, please do not use
              our services.
            </P>
          </Section>

          <Section title="What Article is">
            <P>
              Article is a free daily newsletter that summarises AI news in plain English. The content
              we publish represents our editorial interpretation of publicly available information. It
              is intended for general informational purposes only and does not constitute professional,
              legal, financial, or technical advice.
            </P>
          </Section>

          <Section title="Your subscription">
            <P>
              Subscribing to Article is free. By subscribing, you consent to receive daily emails from
              us. You can unsubscribe at any time using the link in any email we send, or by emailing{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#468189" }}>
                {CONTACT_EMAIL}
              </a>
              .
            </P>
            <P>
              We comply with the UK&apos;s Privacy and Electronic Communications Regulations (PECR) and
              the CAN-SPAM Act. Every email we send will include a clear unsubscribe mechanism. We will
              not send you unsolicited marketing from third parties.
            </P>
          </Section>

          <Section title="Acceptable use">
            <P>You agree not to:</P>
            <ul style={{ margin: "0 0 16px", paddingLeft: 24 }}>
              {[
                "Reproduce, republish, or distribute Article content for commercial purposes without our written permission.",
                "Scrape, crawl, or automate access to our website in a way that damages or degrades its performance.",
                "Use our services to send spam, phishing, or other unsolicited communications.",
                "Impersonate Article or suggest endorsement by Article without our written consent.",
                "Attempt to gain unauthorised access to any part of our systems.",
              ].map((item, i) => (
                <li key={i} style={{ marginBottom: 8, lineHeight: 1.65 }}>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Intellectual property">
            <P>
              All content published on articlenews.co — including articles, summaries, editorial copy,
              design, and branding — is owned by Article or licensed to us. You may share links to
              our content and quote brief excerpts for non-commercial purposes, provided you attribute
              Article and link back to the original.
            </P>
            <P>
              The source articles we summarise remain the property of their respective publishers. We
              link to original sources in every story we cover.
            </P>
          </Section>

          <Section title="Accuracy and disclaimers">
            <P>
              We work hard to be accurate, but AI is a fast-moving field and we are not infallible.
              Article content is provided &quot;as is&quot; without warranties of any kind, express or
              implied. We make no guarantee that the information we publish is complete, current, or
              error-free.
            </P>
            <P>
              Nothing in Article constitutes investment, financial, legal, or professional advice. Always
              verify important information with primary sources before acting on it.
            </P>
          </Section>

          <Section title="Limitation of liability">
            <P>
              To the fullest extent permitted by applicable law, Article shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of our
              website or newsletter — including but not limited to loss of data, loss of profits, or
              business interruption — even if we have been advised of the possibility of such damages.
            </P>
            <P>
              Our total liability to you for any claim arising from these terms or your use of Article
              shall not exceed the amount you have paid us in the twelve months preceding the claim.
              (Since Article is free, this means our maximum liability is £0 / $0.)
            </P>
          </Section>

          <Section title="External links">
            <P>
              Our articles link to third-party websites. We are not responsible for the content,
              accuracy, or privacy practices of those websites. A link does not imply endorsement.
            </P>
          </Section>

          <Section title="Changes to these terms">
            <P>
              We may update these Terms from time to time. When we do, we will update the &quot;last
              updated&quot; date above. If changes are material, we will notify subscribers by email.
              Continued use of Article after changes take effect constitutes your acceptance of the
              revised terms.
            </P>
          </Section>

          <Section title="Governing law">
            <P>
              These Terms are governed by the laws of England and Wales. Any disputes will be subject
              to the exclusive jurisdiction of the courts of England and Wales.
            </P>
          </Section>

          <Section title="Contact">
            <P>
              Questions about these Terms:{" "}
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
