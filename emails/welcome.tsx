import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { greetingName } from "@/lib/personalize";

const ink = "#031926";
const paper = "#F4E9CD";
const gold = "#E0A53F";
const mist = "#9DBEBB";

interface WelcomeEmailProps {
  firstName?: string | null;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps = {}) {
  return (
    <Html lang="en">
      <Head>
        <Font
          fontFamily="Hanken Grotesk"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/hankengrotesque/v8/ieVq2YRII2GMowr7uBi-V6KKXZpqh.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Hanken Grotesk"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: "https://fonts.gstatic.com/s/hankengrotesque/v8/ieVq2YRII2GMowr7uBi-V6KKXZpqh.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      <Preview>Welcome to Article — your daily AI briefing starts now.</Preview>
      <Body style={body}>
        {/* Header */}
        <Section style={header}>
          <Text style={wordmark}>ARTICLE</Text>
        </Section>

        {/* Main card */}
        <Container style={card}>
          <Text style={eyebrow}>Welcome aboard ✦</Text>

          <Heading style={h1}>
            You&apos;re in. Your first edition lands tomorrow morning.
          </Heading>

          <Text style={greeting_text}>Hi {greetingName(firstName)},</Text>

          <Text style={body_text}>
            Every weekday we cut through the noise and deliver the five AI
            stories that actually matter — explained in plain English, in about
            five minutes.
          </Text>

          <Text style={body_text}>
            No jargon. No hype. No padding. Just clear, honest coverage of
            what&apos;s happening in artificial intelligence and why it matters
            to you.
          </Text>

          <Section style={{ textAlign: "center", margin: "40px 0" }}>
            <Button href="https://articlenews.co" style={cta_button}>
              Read today&apos;s edition
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer_text}>
            While you wait, catch up on the archive — every story we&apos;ve
            ever published is{" "}
            <a href="https://articlenews.co/archive" style={link}>
              free to read
            </a>
            .
          </Text>
        </Container>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footer_meta}>
            You&apos;re receiving this because you signed up at{" "}
            <a href="https://articlenews.co" style={link_muted}>
              articlenews.co
            </a>
            .{" "}
            <a href="https://articlenews.co/privacy" style={link_muted}>
              Privacy Policy
            </a>
            .
          </Text>
          <Text style={footer_meta}>
            Article · hello@articlenews.co
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: ink,
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "40px 16px",
};

const header: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 32,
};

const wordmark: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.28em",
  color: mist,
  margin: 0,
};

const card: React.CSSProperties = {
  backgroundColor: paper,
  borderRadius: 12,
  padding: "48px 48px 40px",
  maxWidth: 560,
  margin: "0 auto",
};

const eyebrow: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 12,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: gold,
  margin: "0 0 20px",
};

const h1: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 30,
  lineHeight: 1.1,
  letterSpacing: "-0.025em",
  color: ink,
  margin: "0 0 24px",
};

const greeting_text: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 700,
  fontSize: 16,
  lineHeight: 1.65,
  color: ink,
  margin: "0 0 16px",
};

const body_text: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontSize: 16,
  lineHeight: 1.65,
  color: "#2a4348",
  margin: "0 0 16px",
};

const cta_button: React.CSSProperties = {
  backgroundColor: ink,
  color: paper,
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 16,
  borderRadius: 40,
  padding: "16px 32px",
  textDecoration: "none",
  display: "inline-block",
};

const divider: React.CSSProperties = {
  borderColor: "rgba(3,25,38,0.12)",
  margin: "32px 0",
};

const footer_text: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#2a4348",
  margin: 0,
};

const link: React.CSSProperties = {
  color: "#468189",
  textDecoration: "underline",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  marginTop: 32,
  maxWidth: 560,
  margin: "32px auto 0",
};

const footer_meta: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontSize: 12,
  color: "rgba(157,190,187,0.7)",
  margin: "4px 0",
};

const link_muted: React.CSSProperties = {
  color: mist,
  textDecoration: "underline",
};
