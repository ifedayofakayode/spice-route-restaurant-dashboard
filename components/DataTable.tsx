type Column = { key: string; label: string; date?: boolean };

export default function DataTable({ columns, rows }: { columns: Column[]; rows: any[] }) {
  if (rows.length === 0) {
    return <p className='rounded border bg-white p-6 text-gray-500'>Nothing here yet.</p>;
  }
  return (
    <div className='overflow-x-auto rounded-lg border bg-white'>
      <table className='min-w-full text-left text-sm'>
        <thead className='bg-gray-100'>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className='px-4 py-3 font-semibold'>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className='border-t align-top'>
              {columns.map((c) => {
                const v = r[c.key];
                const text = v === null || v === undefined || v === ''
                  ? '-'
                  : c.date ? new Date(String(v)).toLocaleString('en-NG') : String(v);
                return <td key={c.key} className='px-4 py-3'>{text}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}