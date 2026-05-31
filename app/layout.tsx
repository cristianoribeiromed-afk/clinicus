import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Clinicus - Plataforma de Estudos para Medicina',
  description: 'Resumos organizados, simulados com gabarito e casos clínicos comentados para estudantes de medicina. Estude mais inteligente, passe mais rápido.',
  keywords: ['medicina', 'estudos', 'simulados', 'resumos', 'casos clínicos', 'graduação médica', 'revalida'],
  authors: [{ name: 'Cristiano Ribeiro da Silva' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://clinicus.com.br',
    siteName: 'Clinicus',
    title: 'Clinicus - Plataforma de Estudos para Medicina',
    description: 'Resumos organizados, simulados com gabarito e casos clínicos comentados para estudantes de medicina.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clinicus - Estude mais inteligente',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clinicus - Plataforma de Estudos para Medicina',
    description: 'Resumos organizados, simulados com gabarito e casos clínicos comentados.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
