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
    <html lang="pt-BR" className="bg-[#f8f9fc] text-slate-900" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#f8f9fc] text-slate-900 antialiased selection:bg-indigo-500/20 selection:text-indigo-900"
      >
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

