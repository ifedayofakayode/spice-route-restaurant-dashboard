import { Suspense } from 'react';
import { listRecords } from '@/lib/airtable';

// 1. This component fetches the live data from Airtable
async function DashboardCards() {
  const [calls, bookings, orders] = await Promise.all([
    listRecords('calls'),
    listRecords('reservations'),
    listRecords('orders'),
  ]);
  
  const revenue = orders.reduce((sum: number, r: any) => sum + (r.total_amount ?? 0), 0);

  const cards = [
    { label: 'Calls handled', value: calls.length },
    { label: 'Bookings', value: bookings.length },
    { label: 'Orders', value: orders.length },
    { label: 'Order value (NGN)', value: revenue.toLocaleString('en-NG') },
  ];

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
      {cards.map((c) => (
        <div key={c.label} className='rounded-lg border bg-white p-5'>
          <p className='text-sm text-gray-500'>{c.label}</p>
          <p className='mt-1 text-3xl font-bold'>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// 2. This is a loading skeleton placeholder while the data streams in
function DashboardSkeleton() {
  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4 animate-pulse'>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className='rounded-lg border bg-gray-50 p-5 h-[116px]'>
          <div className='h-4 bg-gray-200 rounded w-2/3 mb-3'></div>
          <div className='h-8 bg-gray-300 rounded w-1/3'></div>
        </div>
      ))}
    </div>
  );
}

// 3. Your main page remains clean and error-free
export default function Home() {
  return (
    <>
      <h1 className='mb-6 text-2xl font-bold'>Overview</h1>
      
      {/* Suspense forces the page to ship instantly while data loads */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardCards />
      </Suspense>
    </>
  );
}
