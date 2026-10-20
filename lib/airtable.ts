const BASE = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_TOKEN!;

// Reads every record from one Airtable table and returns them as simple objects.
export async function listRecords(table: string, max = 1000): Promise<any[]> {
  const rows: any[] = [];
  let offset: string | undefined;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}`);
    url.searchParams.set('pageSize', '100');
    if (offset) url.searchParams.set('offset', offset);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Airtable error ${res.status}: ${await res.text()}`);
    const json = await res.json();
    rows.push(...json.records.map((r: any) => ({ id: r.id, created_at: r.createdTime, ...r.fields })));
    offset = json.offset;
  } while (offset && rows.length < max);
  return rows;
}