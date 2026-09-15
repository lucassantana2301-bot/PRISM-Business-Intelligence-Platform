import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'PRISM — Business Intelligence Platform',
  description: 'Ask. Understand. Decide. Modern data intelligence and conversational analytics.',
  other: {
    google: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-prism-bg-canvas text-prism-text-primary antialiased selection:bg-prism-accent-blue/30 selection:text-white"
      >
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

