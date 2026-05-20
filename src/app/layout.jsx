import { Oswald } from 'next/font/google';
import "./globals.css";
import ClientLayoutWrapper from "@/components/reusable/ClientLayoutWrapper";

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-oswald',
});

export const metadata = {
  metadataBase: new URL('https://turuq.in'),
  title: {
    template: '%s | TURUQ',
    default: 'TURUQ | Webzine',
  },
  description: 'TURUQ is a platform dedicated to fostering thoughtful discourse on culture, art, and society.',
  keywords: ['TURUQ', 'Webzine', 'Culture', 'Art', 'Society', 'Discourse', 'Articles', 'Malayalam'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://turuq.in',
    siteName: 'TURUQ',
    title: 'TURUQ | Webzine',
    description: 'TURUQ is a platform dedicated to fostering thoughtful discourse on culture, art, and society.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TURUQ | Webzine',
    description: 'TURUQ is a platform dedicated to fostering thoughtful discourse on culture, art, and society.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TURUQ',
    url: 'https://turuq.in',
    logo: 'https://turuq.in/icon1.png',
    sameAs: [
      'https://www.instagram.com/turuq.in/',
      'https://www.facebook.com/profile.php?id=61554438333912'
    ],
  };

  return (
    <html lang="en">
    <head>
      <meta name="apple-mobile-web-app-title" content="TURUQ" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </head>
      <body className={`${oswald.variable} font-sans`} suppressHydrationWarning>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
