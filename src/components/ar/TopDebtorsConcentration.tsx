import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Users, Layers, ExternalLink } from 'lucide-react';
import { InvoiceRecord } from '../../types';

interface TopDebtorsConcentrationProps {
  topDebtorsChartData: {
    name: string;
    fullName: string;
    customerId: string;
    current: number;
    overdue: number;
    totalOutstanding: number;
    creditLimit: number;
    utilizationPct: number;
    invoices: InvoiceRecord[];
  }[];
  overlimitAccountsCount: number;
  onDrillDown: (title: string, subtitle: string, records: InvoiceRecord[]) => void;
  onFilterCustomer?: (customerId: string) => void;
}

export const TopDebtorsConcentration: React.FC<TopDebtorsConcentrationProps> = ({
  topDebtorsChartData,
  overlimitAccountsCount,
  onDrillDown,
  onFilterCustomer,
}) => {
  const topTotal = topDebtorsChartData.reduce((acc, c) => acc + c.totalOutstanding, 0);

  const handleBarClick = (entry: any) => {
    if (!entry) return;
    const debtor = topDebtorsChartData.find((d) => d.name === entry.name || d.customerId === entry.customerId);
    if (debtor) {
      onDrillDown(
        `ลูกหนี้รายใหญ่: ${debtor.fullName}`,
        `รหัส ${debtor.customerId} | ยอดค้างชำระ ฿${debtor.totalOutstanding.toLocaleString()} (วงเงิน ฿${debtor.creditLimit.toLocaleString()} - ใช้ไป ${debtor.utilizationPct}%)`,
        debtor.invoices
      );
    }
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>TOP DEBTORS CONCENTRATION</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
              คลิกที่แท่งกราฟเพื่อ <span className="text-indigo-600 dark:text-indigo-400 font-bold underline">เจาะลึกบิลของลูกหนี้รายนั้น</span>
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shrink-0 self-start sm:self-auto font-mono">
            Top 5 = ฿{topTotal.toLocaleString()}
          </span>
        </div>

        <div className="h-60 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={topDebtorsChartData} margin={{ top: 10, right: 20, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `฿${Number(value).toLocaleString()}`,
                  name === 'current' ? 'อยู่ในกำหนด (Current)' : 'เกินกำหนด (Overdue)',
                ]}
                labelFormatter={(_label, payload: any) => {
                  const row = payload?.[0]?.payload;
                  return row ? `${row.fullName} (วงเงิน: ฿${row.creditLimit.toLocaleString()} | ใช้ไป ${row.utilizationPct}%) - คลิกดูบิล` : '';
                }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                  fontWeight: '500',
                }}
                itemStyle={{
                  color: '#f8fafc',
                  fontWeight: 'bold',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px', fontWeight: 600, color: '#1e293b' }}
                formatter={(value) => (value === 'current' ? 'อยู่ในกำหนด' : 'เกินกำหนด')}
              />
              <Bar
                dataKey="current"
                stackId="debt"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
                name="current"
                cursor="pointer"
                onClick={(data) => handleBarClick(data)}
              />
              <Bar
                dataKey="overdue"
                stackId="debt"
                fill="#f59e0b"
                radius={[0, 6, 6, 0]}
                name="overdue"
                cursor="pointer"
                onClick={(data) => handleBarClick(data)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">เขียว = ในกำหนด</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">ส้ม = เกินกำหนด</span>
        </span>
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {overlimitAccountsCount > 0 ? `⚠ มี ${overlimitAccountsCount} รายใช้วงเงินเกิน 85%` : '✓ วงเงินอยู่ในระดับปลอดภัย'}
        </span>
      </div>
    </div>
  );
};
