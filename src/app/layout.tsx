import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VibSeek - Picture to Sound Discovery',
  description: 'Transform images into matching sounds using AI-powered analysis and semantic search',
  keywords: ['audio', 'sound', 'image', 'AI', 'discovery', 'OpenAI', 'Weaviate'],
  authors: [{ name: 'VibSeek Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
} 