export function downloadCsv(data: Record<string, unknown>[], filename: string) {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0] || {}).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(val => {
      if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
      if (val === null || val === undefined) return '';
      return val;
    }).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
