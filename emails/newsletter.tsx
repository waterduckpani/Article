import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

const ink = "#031926";
const paper = "#F4E9CD";
const gold = "#E0A53F";
const mist = "#9DBEBB";
const teal = "#468189";

export interface NewsletterArticle {
  id: string;
  slug: string | null;
  plain_title: string;
  plain_summary: string;
  category: string;
  published_at: string;
}

interface NewsletterEmailProps {
  articles: NewsletterArticle[];
  date: string;
}

function articleUrl(article: NewsletterArticle): string {
  const base = "https://articlenews.co";
  return article.slug
    ? `${base}/articles/${article.slug}`
    : `${base}/articles/${article.id}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsletterEmail({ articles, date }: NewsletterEmailProps) {
  const top = articles[0];
  const rest = articles.slice(1, 6);
  const previewText = top
    ? `${top.plain_title} — plus ${rest.length} more stories`
    : "Your daily AI briefing from Article";

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
      <Preview>{previewText}</Preview>
      <Body style={body}>
        {/* Header bar */}
        <Section style={header}>
          <Container style={{ maxWidth: 600, margin: "0 auto" }}>
            <Row>
              <Column style={{ verticalAlign: "middle" }}>
                <Text style={wordmark}>ARTICLE</Text>
              </Column>
              <Column style={{ verticalAlign: "middle", textAlign: "right" }}>
                <Text style={date_label}>{date || formatDate(new Date().toISOString())}</Text>
              </Column>
            </Row>
          </Container>
        </Section>

        <Container style={wrapper}>
          {/* Hero story */}
          {top && (
            <Section style={hero_section}>
              <Text style={eyebrow}>{top.category}</Text>
              <Heading style={hero_title}>{top.plain_title}</Heading>
              <Text style={hero_summary}>{top.plain_summary}</Text>
              <Button href={articleUrl(top)} style={cta_button}>
                Read the full story →
              </Button>
            </Section>
          )}

          <Hr style={divider} />

          {/* More stories */}
          {rest.length > 0 && (
            <Section style={{ padding: "0 0 8px" }}>
              <Text style={section_label}>Also today</Text>
              {rest.map((article, i) => (
                <Section key={article.id} style={story_row}>
                  <Text style={story_num}>{String(i + 2).padStart(2, "0")}</Text>
                  <Text style={story_category}>{article.category}</Text>
                  <a href={articleUrl(article)} style={story_link_wrap}>
                    <Text style={story_title}>{article.plain_title}</Text>
                  </a>
                  <Text style={story_summary}>{article.plain_summary}</Text>
                  {i < rest.length - 1 && <Hr style={story_divider} />}
                </Section>
              ))}
            </Section>
          )}

          <Hr style={divider} />

          {/* CTA to archive */}
          <Section style={{ textAlign: "center", padding: "24px 0 32px" }}>
            <Text style={archive_copy}>
              Every story we&apos;ve ever published is free to read.
            </Text>
            <Button href="https://articlenews.co/archive" style={cta_button_outline}>
              Browse the archive
            </Button>
          </Section>
        </Container>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footer_meta}>
            You&apos;re receiving this because you subscribed at{" "}
            <a href="https://articlenews.co" style={link_muted}>
              articlenews.co
            </a>
            .
          </Text>
          <Text style={footer_meta}>
            <a href="https://articlenews.co/privacy" style={link_muted}>
              Privacy Policy
            </a>
            {" · "}
            Article · hello@articlenews.co
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

NewsletterEmail.PreviewProps = {
  date: "Saturday, 14 June 2025",
  articles: [
    {
      id: "1",
      slug: "openai-launches-gpt-5",
      plain_title: "OpenAI launches GPT-5 with real-time reasoning",
      plain_summary:
        "The new model benchmarks above human experts on most professional tests and is available to all ChatGPT users starting today. Here's what changed and why it matters.",
      category: "The Big Story",
      published_at: new Date().toISOString(),
    },
    {
      id: "2",
      slug: "google-deepmind-weather",
      plain_title: "Google DeepMind's weather model beats every traditional forecast",
      plain_summary:
        "GenCast outperforms the European Centre for Medium-Range Weather Forecasts model on 97% of test cases, and runs in under a minute.",
      category: "Research",
      published_at: new Date().toISOString(),
    },
    {
      id: "3",
      slug: "eu-ai-act-compliance",
      plain_title: "EU AI Act compliance deadlines are now in effect for high-risk systems",
      plain_summary:
        "Companies operating high-risk AI systems in Europe must now meet mandatory transparency and audit requirements — or face fines of up to 3% of global revenue.",
      category: "Policy",
      published_at: new Date().toISOString(),
    },
  ],
} satisfies NewsletterEmailProps;

/* ── Styles ── */

const body: React.CSSProperties = {
  backgroundColor: "#e8dfcc",
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "24px 16px 48px",
};

const header: React.CSSProperties = {
  backgroundColor: ink,
  padding: "18px 24px",
  marginBottom: 0,
};

const wordmark: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 13,
  letterSpacing: "0.28em",
  color: mist,
  margin: 0,
};

const date_label: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontSize: 12,
  color: "rgba(157,190,187,0.6)",
  margin: 0,
};

const wrapper: React.CSSProperties = {
  backgroundColor: paper,
  borderRadius: "0 0 12px 12px",
  maxWidth: 600,
  margin: "0 auto",
  padding: "40px 48px",
};

const hero_section: React.CSSProperties = {
  paddingBottom: 8,
};

const eyebrow: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: gold,
  margin: "0 0 16px",
};

const hero_title: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 28,
  lineHeight: 1.12,
  letterSpacing: "-0.025em",
  color: ink,
  margin: "0 0 16px",
};

const hero_summary: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontSize: 16,
  lineHeight: 1.65,
  color: "#2a4348",
  margin: "0 0 28px",
};

const cta_button: React.CSSProperties = {
  backgroundColor: ink,
  color: paper,
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 15,
  borderRadius: 40,
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const cta_button_outline: React.CSSProperties = {
  backgroundColor: "transparent",
  color: ink,
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 700,
  fontSize: 14,
  borderRadius: 40,
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
  border: `2px solid ${ink}`,
};

const divider: React.CSSProperties = {
  borderColor: "rgba(3,25,38,0.12)",
  margin: "32px 0",
};

const section_label: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: teal,
  margin: "0 0 24px",
};

const story_row: React.CSSProperties = {
  marginBottom: 4,
};

const story_num: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 11,
  letterSpacing: "0.1em",
  color: "rgba(3,25,38,0.25)",
  margin: "0 0 4px",
};

const story_category: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: gold,
  margin: "0 0 6px",
};

const story_link_wrap: React.CSSProperties = {
  textDecoration: "none",
};

const story_title: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontWeight: 800,
  fontSize: 18,
  lineHeight: 1.2,
  letterSpacing: "-0.015em",
  color: ink,
  margin: "0 0 8px",
};

const story_summary: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#2a4348",
  margin: "0 0 4px",
};

const story_divider: React.CSSProperties = {
  borderColor: "rgba(3,25,38,0.08)",
  margin: "20px 0",
};

const archive_copy: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontSize: 15,
  color: "#2a4348",
  margin: "0 0 16px",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  maxWidth: 600,
  margin: "24px auto 0",
};

const footer_meta: React.CSSProperties = {
  fontFamily: "'Hanken Grotesk', Helvetica, Arial, sans-serif",
  fontSize: 12,
  color: "rgba(3,25,38,0.4)",
  margin: "4px 0",
};

const link_muted: React.CSSProperties = {
  color: teal,
  textDecoration: "underline",
};
