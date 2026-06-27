import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'top3news — What matters today',
  description: 'Autos, Technology, Movies and Music news. Smart Brevity.',
};

const GA_ID = 'G-LZBWXVWW9M';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
        <meta name="google-adsense-account" content="ca-pub-9748169351348753" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9748169351348753" crossOrigin="anonymous" />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans bg-white text-gray-950 antialiased`}>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-100 mt-16 py-8 text-center text-xs text-gray-400">
          <span className="font-pixel text-brand text-xs">top3news</span>
          <span className="mx-2">·</span>Miami, FL
          <span className="mx-2">·</span>Updated 3× daily
        </footer>
      </body>
    </html>
  );
}
