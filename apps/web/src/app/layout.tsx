import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';

export const metadata: Metadata = { title: 'Riki LMS', description: 'Learning management system' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><QueryProvider>{children}</QueryProvider></body></html>;
}
