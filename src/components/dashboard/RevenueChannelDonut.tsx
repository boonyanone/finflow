import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface RevenueChannelDonutProps {
  isEmpty: boolean;
}

export const RevenueChannelDonut: React.FC<RevenueChannelDonutProps> = ({ isEmpty }) => {
  const data = [
    { name: 'องค์กร / โรงงาน (B2B)', value: 52, color: '#4f46e5' },
    { name: 'ตัวแทนจำหน่าย (Wholesale)', value: 28, color: '#06b6d4' },
    { name: 'โครงการรับเหมา (Contractor)', value: 14, color: '#10b981' },
    { name: 'ลูกค้าทั่วไป (Retail)', value: 6, color: '#f59e0b' },
  ];

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              REVENUE BY CHANNEL
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">สัดส่วนยอดขายตามกลุ่มลูกค้า</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-2 mt-1">
          {/* Donut Chart */}
          <div className="h-36 w-full min-w-0 relative flex items-center justify-center">
            {isEmpty ? (
              <div className="text-xs text-slate-400">รอข้อมูล</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #1e293b',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#fff',
                      }}
                      formatter={(v: any, name: any) => [`${v}%`, name]}
                    />
                    <Pie
                      data={data}
                      innerRadius={36}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-slate-900 dark:text-white">100%</span>
                  <span className="text-[9px] text-slate-400">All Channels</span>
                </div>
              </>
            )}
          </div>

          {/* Legends */}
          <div className="space-y-1.5 text-xs">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 truncate text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white font-mono text-[11px]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Channel Diversity</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Balanced Portfolio</span>
      </div>
    </div>
  );
};
