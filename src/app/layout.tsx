import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/contexts/themeContext";

export const metadata: Metadata = {
  title: "Orion | The Modern Logging Stack",
  description: "Orion provides real-time log aggregation, intelligent alerting, and a stunning developer-first dashboard.",
  openGraph: {
    title: "Orion | The Modern Logging Stack",
    description: "Orion provides real-time log aggregation, intelligent alerting, and a stunning developer-first dashboard.",
    url: "https://orion.dev", // Note: Update when domain is final
    siteName: "Orion",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orion | The Modern Logging Stack",
    description: "Orion provides real-time log aggregation, intelligent alerting, and a stunning developer-first dashboard.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
