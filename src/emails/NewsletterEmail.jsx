import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export const NewsletterEmail = ({
  postTitle = "Article Title",
  postDescription = "Article description goes here...",
  postImage = "",
  postLink = "https://turuq.in",
  unsubscribeLink = "https://turuq.in/unsubscribe",
}) => (
  <Html>
    <Head />
    <Preview>{postTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
           <Text style={logo}>TURUQ</Text>
        </Section>
        
        {postImage && (
          <Img
            src={postImage}
            width="600"
            alt="Featured Image"
            style={image}
          />
        )}

        <Section style={content}>
          <Heading style={heading}>{postTitle}</Heading>
          <Text style={paragraph}>
            {postDescription}
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={postLink}>
              Read Full Article
            </Button>
          </Section>
        </Section>

        <Hr style={hr} />

        <Section style={footer}>
          <Text style={footerText}>
            You received this email because you're subscribed to TURUQ Webzine.
          </Text>
          <Link href={unsubscribeLink} style={unsubscribeStyle}>
            Unsubscribe from this list
          </Link>
          <Text style={footerText}>
            © 2026 TURUQ | Thoughtful Discourse on Culture & Society
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NewsletterEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
};

const header = {
  padding: "32px",
  textAlign: "center",
};

const logo = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#dc2626", // red-600
  letterSpacing: "4px",
  margin: "0",
};

const image = {
  width: "100%",
  borderRadius: "0",
  objectFit: "cover",
};

const content = {
  padding: "32px",
};

const heading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#484848",
  marginBottom: "24px",
};

const buttonContainer = {
  textAlign: "center",
  marginTop: "32px",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "9999px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "block",
  padding: "16px 32px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  padding: "0 32px",
  textAlign: "center",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "22px",
  color: "#8898aa",
  margin: "4px 0",
};

const unsubscribeStyle = {
  fontSize: "12px",
  color: "#dc2626",
  textDecoration: "underline",
};
