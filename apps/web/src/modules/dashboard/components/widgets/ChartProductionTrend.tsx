import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';

export function ChartProductionTrend() {
  const { productionEntries, isLoading } = useDashboardData();

  const data = useMemo(() => {
    // Last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayEntries = productionEntries.filter(e => e.date === dateStr);
      const volume = dayEntries.reduce((sum, e) => sum + (e.productionQuantity || 0), 0);
      
      result.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        volume,
        fullDate: dateStr,
      });
    }
    return result;
  }, [productionEntries]);

  const todayVolume = data[data.length - 1]?.volume || 0;

  const gradientStops = useMemo(() => {
    if (!data || data.length < 2) return null;
    
    const stops = [];
    const n = data.length;
    for (let i = 0; i < n - 1; i++) {
      const current = data[i];
      const next = data[i + 1];
      if (!current || !next) continue;
      
      const isUp = next.volume >= current.volume;
      const color = isUp ? '#10b981' : '#ef4444'; // emerald-500 or red-500
      
      const startOffset = `${(i / (n - 1)) * 100}%`;
      const endOffset = `${((i + 1) / (n - 1)) * 100}%`;
      
      stops.push(
        <stop key={`start-${i}`} offset={startOffset} stopColor={color} stopOpacity={1} />,
        <stop key={`end-${i}`} offset={endOffset} stopColor={color} stopOpacity={1} />
      );
    }
    return stops;
  }, [data]);

  if (isLoading) {
    return <div className="h-full w-full animate-pulse bg-muted rounded-xl" />;
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Production Output (7 Days)</h3>
        <p className="text-2xl font-bold">{todayVolume} <span className="text-sm font-normal text-muted-foreground">today</span></p>
      </div>
      <div className="flex-1 min-h-[150px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="splitColor" x1="0" y1="0" x2="1" y2="0">
                {gradientStops}
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke="url(#splitColor)" 
              strokeWidth={2}
              fillOpacity={0.1} 
              fill="url(#splitColor)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
