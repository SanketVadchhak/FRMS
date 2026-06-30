import { useMemo } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardData } from '../../hooks/useDashboardData';

export function ChartTopEmployees() {
  const { productionEntries, employees, isLoading } = useDashboardData();

  const data = useMemo(() => {
    // Top employees of the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0]!;

    const weeklyEntries = productionEntries.filter(e => e.date >= weekAgoStr);
    
    const employeeVolume: Record<string, number> = {};
    weeklyEntries.forEach(e => {
      employeeVolume[e.employeeId] = (employeeVolume[e.employeeId] || 0) + (e.productionQuantity || 0);
    });

    const result = Object.entries(employeeVolume)
      .map(([empId, volume]) => {
        const emp = employees.find(e => e.id === empId);
        return {
          name: emp ? emp.name : empId,
          volume,
        };
      })
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5) // Top 5 employees
      .map((item, index) => {
        const colors = ['#F59E0B', '#94A3B8', '#B45309']; // Gold, Silver, Bronze
        return {
          ...item,
          fill: index < 3 ? colors[index] : 'var(--primary)',
        };
      });

    return result;
  }, [productionEntries, employees]);

  if (isLoading) {
    return <div className="h-full w-full animate-pulse bg-muted rounded-xl" />;
  }

  return (
    <div className="flex flex-col h-full p-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Top Employees (This Week)</h3>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          No production data this week
        </div>
      ) : (
        <div className="flex-1 min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} dy={10} />
              <YAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
              />
              <Bar dataKey="volume" radius={[4, 4, 0, 0]} barSize={30}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
