import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface GrowthBarCardProps {
  categoryBreakdown: {
    name: string;
    amount: number;
    pct: number;
    color: string;
    text: string;
    bar: string;
  }[];
  isEmpty: boolean;
}

export const GrowthBarCard: React.FC<GrowthBarCardProps> = ({ categoryBreakdown, isEmpty }) => {
  const chartData = categoryBreakdown.slice(0, 5).map((cat) => ({
    name: cat.name.length > 14 ? `${cat.name.slice(0, 14)}...` : cat.name,
    fullName: cat.name,
    amount: cat.amount,
    pct: cat.pct,
  }));

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              GROWTH &amp; CATEGORY SALES
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">ยอดขายแยกตามหมวดหมู่สินค้าหลัก</p>
          </div>
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
            5 อันดับแรก
          </span>
        </div>

        <div className="h-44 w-full min-w-0 mt-2">
          {isEmpty || chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              ยังไม่มีข้อมูลยอดขายแยกหมวดหมู่
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} width={85} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `฿${Number(val).toLocaleString()} (${item.payload.pct}%)`,
                    item.payload.fullName,
                  ]}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>คำนวณจากยอดขายจริง</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">Marginal Contribution</span>
      </div>
    </div>
  );
};
