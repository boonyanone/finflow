import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Bar,
  Line,
} from 'recharts';
import { WeeklyCashBucket } from '../../types';

interface CashFlowTimelineChartProps {
  weeklyForecast: WeeklyCashBucket[];
  minSafetyCash: number;
}

export const CashFlowTimelineChart: React.FC<CashFlowTimelineChartProps> = ({
  weeklyForecast,
  minSafetyCash,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            12-Week Rolling Cash Inflow vs Outflow &amp; Cumulative Balance
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            เปรียบเทียบเงินสดรับ-จ่ายรายสัปดาห์ และเส้นสะสมสภาพคล่องสุทธิ
          </p>
        </div>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>
            Inflow (เงินรับ)
          </span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600 inline-block"></span>
            Outflow (เงินจ่าย)
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block"></span>
            Closing Cash
          </span>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={weeklyForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey="weekKey" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={11}
              tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={11}
              tickFormatter={(val) => `฿${(val / 1000000).toFixed(1)}M`}
              tickLine={false}
            />
            <Tooltip
              formatter={(val: any, name: any) => {
                const formatted = `฿${Number(val).toLocaleString()}`;
                if (name === 'scenarioInflow') return [formatted, 'เงินสดรับคาดการณ์ (Inflow)'];
                if (name === 'projectedOutflow') return [formatted, 'เงินสดจ่ายประมาณการ (Outflow)'];
                if (name === 'closingCash') return [formatted, 'เงินสดคงเหลือสะสม (Closing Cash)'];
                return [formatted, name];
              }}
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '12px',
                border: 'none',
                padding: '8px 12px',
              }}
            />
            <ReferenceLine
              yAxisId="right"
              y={minSafetyCash}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: 'Min Safety Cash', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }}
            />
            <Bar yAxisId="left" dataKey="scenarioInflow" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Bar yAxisId="left" dataKey="projectedOutflow" fill="#94a3b8" opacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={20} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="closingCash"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
