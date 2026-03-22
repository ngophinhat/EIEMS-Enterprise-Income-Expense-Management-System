import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EIEMS - Quản lý thu chi doanh nghiệp',
  description: 'Enterprise Income Expense Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" style={{ height: '100%' }}>
      <body style={{ height: '100%', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}