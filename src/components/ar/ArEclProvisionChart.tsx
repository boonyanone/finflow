import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import { BarChart3, Layers, ExternalLink } from 'lucide-react';
import { InvoiceRecord } from '../../types';
import { ArFilterType } from './ArAgingBands';

interface ArEclProvisionChartProps {
  agingChartData: {
    bucketKey: ArFilterType;
    name: string;
    shortName: string;
    amount: number;
    provision: number;
    rate: string;
    fill: string;
  }[];
  grandTotalAR: number;
  total0_30: number;
  total31_60: number;
  total61_90: number;
  totalOver90: number;
  onSelectFilter: (filter: ArFilterType) => void;
  onDrillDown: (title: string, subtitle: string, records: InvoiceRecord[]) => void;
  invoices: InvoiceRecord[];
}

export const ArEclProvisionChart: React.FC<ArEclProvisionChartProps> = ({
  agingChartData,
  grandTotalAR,
  total0_30,
  total31_60,
  total61_90,
  totalOver90,
  onSelectFilter,
  onDrillDown,
  invoices,
}) => {
  const handleBarClick = (entry: any) => {
    if (!entry) return;
    const bucketKey = entry.bucketKey as ArFilterType;
    if (bucketKey) {
      onSelectFilter(bucketKey);
    }
  };

  const openDrillDownForBucket = (bucketKey: ArFilterType, label: string) => {
    let matched: InvoiceRecord[] = [];
    if (bucketKey === '0_30') matched = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays <= 30);
    else if (bucketKey === '31_60') matched = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 30 && i.overdueDays <= 60);
    else if (bucketKey === '61_90') matched = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 60 && i.overdueDays <= 90);
    else if (bucketKey === 'over90') matched = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 90);

    const sum = matched.reduce((acc, i) => acc + i.outstandingAmount, 0);
    onDrillDown(
      `เจาะลึกช่วงอายุหนี้: ${label}`,
      `พบทั้งหมด ${matched.length} ใบแจ้งหนี้ รวมมูลค่าคงค้าง ฿${sum.toLocaleString()}`,
      matched
    );
  };

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>AGING DISTRIBUTION &amp; TFRS 9 PROVISION</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
              คลิกที่แท่งกราฟหรือปุ่มด้านล่างเพื่อ <span className="text-indigo-600 dark:text-indigo-400 font-bold underline">กรองตาราง / เจาะลึกบิลย่อย</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => onDrillDown(
              'ยอดลูกหนี้คงค้างทั้งหมด (Total AR Portfolio)',
              `รายการบิลคงค้างทั้งหมดในระบบ (${invoices.filter((i) => i.outstandingAmount > 0).length} รายการ)`,
              invoices.filter((i) => i.outstandingAmount > 0)
            )}
            className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition shrink-0 self-start sm:self-auto font-mono flex items-center gap-1 cursor-pointer"
          >
            <span>Total AR ฿{grandTotalAR.toLocaleString()}</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="h-60 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agingChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `฿${Number(value).toLocaleString()}`,
                  name === 'amount' ? 'ยอดลูกหนี้รวม' : 'สำรองหนี้สูญ (ECL)',
                ]}
                labelFormatter={(label) => `ช่วงอายุหนี้: ${label}`}
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
                formatter={(value) => (value === 'amount' ? 'ยอดลูกหนี้คงเหลือ' : 'สำรองหนี้สูญ (ECL)')}
              />
              <Bar
                dataKey="amount"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                name="amount"
                cursor="pointer"
                onClick={(data) => handleBarClick(data)}
              >
                {agingChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
              <Bar
                dataKey="provision"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
                name="provision"
                cursor="pointer"
                onClick={(data) => handleBarClick(data)}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Quick Drill-Down Footer Buttons */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-center">
        <button
          type="button"
          onClick={() => openDrillDownForBucket('0_30', '0-30 วัน')}
          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition text-center group cursor-pointer border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300"
        >
          <span className="text-slate-700 dark:text-slate-200 font-bold block text-[11px] group-hover:text-emerald-700 dark:group-hover:text-emerald-300 flex items-center justify-center gap-0.5">
            0-30 วัน <Layers className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </span>
          <strong className="text-emerald-700 dark:text-emerald-400 font-mono block text-xs mt-0.5">฿{total0_30.toLocaleString()}</strong>
        </button>

        <button
          type="button"
          onClick={() => openDrillDownForBucket('31_60', '31-60 วัน')}
          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition text-center group cursor-pointer border border-slate-200/80 dark:border-slate-700 hover:border-blue-300"
        >
          <span className="text-slate-700 dark:text-slate-200 font-bold block text-[11px] group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center justify-center gap-0.5">
            31-60 วัน <Layers className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </span>
          <strong className="text-blue-700 dark:text-blue-400 font-mono block text-xs mt-0.5">฿{total31_60.toLocaleString()}</strong>
        </button>

        <button
          type="button"
          onClick={() => openDrillDownForBucket('61_90', '61-90 วัน')}
          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition text-center group cursor-pointer border border-slate-200/80 dark:border-slate-700 hover:border-amber-300"
        >
          <span className="text-slate-700 dark:text-slate-200 font-bold block text-[11px] group-hover:text-amber-700 dark:group-hover:text-amber-300 flex items-center justify-center gap-0.5">
            61-90 วัน <Layers className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </span>
          <strong className="text-amber-700 dark:text-amber-400 font-mono block text-xs mt-0.5">฿{total61_90.toLocaleString()}</strong>
        </button>

        <button
          type="button"
          onClick={() => openDrillDownForBucket('over90', '>90 วัน')}
          className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition text-center group cursor-pointer border border-slate-200/80 dark:border-slate-700 hover:border-rose-300"
        >
          <span className="text-slate-700 dark:text-slate-200 font-bold block text-[11px] group-hover:text-rose-700 dark:group-hover:text-rose-300 flex items-center justify-center gap-0.5">
            &gt;90 วัน <Layers className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
          </span>
          <strong className="text-rose-700 dark:text-rose-400 font-mono block text-xs mt-0.5">฿{totalOver90.toLocaleString()}</strong>
        </button>
      </div>
    </div>
  );
};
