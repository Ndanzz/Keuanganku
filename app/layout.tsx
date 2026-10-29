import './globals.css';

export const metadata = {
  title: 'Keuanganku - Personal Finance',
  description: 'Kelola dompet & transaksimu dengan mudah',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
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
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className="bg-gray-50 text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}