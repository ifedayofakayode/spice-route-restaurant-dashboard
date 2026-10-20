import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = { title: 'Spice Route Kitchen Dashboard' };

const links = [
  { href: '/', label: 'Overview' },
  { href: '/calls', label: 'Calls' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/orders', label: 'Orders' },
  { href: '/customers', label: 'Customers' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className='bg-gray-50 text-gray-900'>
        <nav className='flex flex-wrap gap-6 border-b bg-white px-6 py-4'>
          <span className='font-bold'>Spice Route Kitchen</span>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className='text-gray-600 hover:text-black'>
              {l.label}
            </Link>
          ))}
        </nav>
        <main className='mx-auto max-w-6xl p-6'>{children}</main>
      </body>
    </html>
  );
}