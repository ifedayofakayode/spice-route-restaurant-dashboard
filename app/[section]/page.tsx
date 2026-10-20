import { notFound } from 'next/navigation';
import { listRecords } from '@/lib/airtable';
import DataTable from '@/components/DataTable';
import { Suspense } from 'react';

type Column = { key: string; label: string; date?: boolean };

// Airtable has no customers table, so we build the list from bookings and orders.
async function loadCustomers() {
  const [bookings, orders] = await Promise.all([listRecords('reservations'), listRecords('orders')]);
  const byPhone = new Map<string, any>();
  for (const r of [...bookings, ...orders]) {
    if (!r.phone) continue;
    const c = byPhone.get(r.phone) ?? { phone: r.phone, name: r.customer_name, total_interactions: 0, last_seen: r.created_at };
    c.total_interactions += 1;
    if (r.created_at > c.last_seen) {
      c.last_seen = r.created_at;
      c.name = r.customer_name ?? c.name;
    }
    byPhone.set(r.phone, c);
  }
  return [...byPhone.values()];
}

const SECTIONS: Record<string, { title: string; load: () => Promise<any[]>; orderBy: string; columns: Column[] }> = {
  calls: {
    title: 'Calls',
    load: () => listRecords('calls'),
    orderBy: 'created_at',
    columns: [
      { key: 'created_at', label: 'When', date: true },
      { key: 'caller_number', label: 'Caller' },
      { key: 'duration_seconds', label: 'Seconds' },
      { key: 'summary', label: 'Summary' },
      { key: 'ended_reason', label: 'Ended because' },
    ],
  },
  bookings: {
    title: 'Bookings',
    load: () => listRecords('reservations'),
    orderBy: 'reservation_date',
    columns: [
      { key: 'reservation_date', label: 'Date' },
      { key: 'reservation_time', label: 'Time' },
      { key: 'customer_name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'party_size', label: 'Guests' },
      { key: 'notes', label: 'Notes' },
      { key: 'confirmation_code', label: 'Code' },
      { key: 'status', label: 'Status' },
    ],
  },
  orders: {
    title: 'Orders',
    load: () => listRecords('orders'),
    orderBy: 'created_at',
    columns: [
      { key: 'created_at', label: 'When', date: true },
      { key: 'order_code', label: 'Order' },
      { key: 'customer_name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'order_type', label: 'Type' },
      { key: 'items', label: 'Items' },
      { key: 'total_amount', label: 'Total (NGN)' },
      { key: 'delivery_address', label: 'Address' },
      { key: 'status', label: 'Status' },
    ],
  },
  customers: {
    title: 'Customers',
    load: loadCustomers,
    orderBy: 'last_seen',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_interactions', label: 'Bookings + orders' },
      { key: 'last_seen', label: 'Last seen', date: true },
    ],
  },
};

// --- NEW FUNCTION ADDED HERE ---
export function generateStaticParams() {
  return [
    { section: 'calls' },
    { section: 'bookings' },
    { section: 'orders' },
    { section: 'customers' },
  ];
}
// -------------------------------

// 1. The Page Component (Renders instantly at build time)
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const config = SECTIONS[section];
  if (!config) notFound();

  return (
    <>
      <h1 className='mb-4 text-2xl font-bold'>{config.title}</h1>
      {/* Suspense boundary catches the uncached fetch below it */}
      <Suspense fallback={<p className="mt-4 text-gray-500">Loading {config.title.toLowerCase()}...</p>}>
        <SectionData section={section} />
      </Suspense>
    </>
  );
}

// 2. The Data Component (Fetches Airtable data on request)
async function SectionData({ section }: { section: string }) {
  const config = SECTIONS[section];
  if (!config) return null;

  let rows: any[];
  try {
    rows = await config.load();
  } catch (e: any) {
    return <p className='text-red-600'>Could not load data: {e.message}</p>;
  }
  
  rows.sort((a, b) => String(b[config.orderBy] ?? '').localeCompare(String(a[config.orderBy] ?? '')));

  return <DataTable columns={config.columns} rows={rows.slice(0, 200)} />;
}