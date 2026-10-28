import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Keuanganku - Personal Finance Tracker',
  description: 'Kelola keuangan secara modern dari mana saja',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/ikon-192.png" />
        <link rel="apple-touch-icon" href="/ikon-192.png" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}