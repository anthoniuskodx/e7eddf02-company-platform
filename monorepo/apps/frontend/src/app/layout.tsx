import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Monorepo Frontend',
  description: 'Next.js Frontend Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
