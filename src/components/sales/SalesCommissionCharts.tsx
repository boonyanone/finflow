import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Bot, ArrowRight } from 'lucide-react';
import { SalesRepAttainment } from '../../types';

interface SalesCommissionChartsProps {
  repAttainments: SalesRepAttainment[];
  teamAttainmentPct: number;
  topPerformer?: SalesRepAttainment;
  onOpenCopilot?: () => void;
}

export const SalesCommissionCharts: React.FC<SalesCommissionChartsProps> = ({
  repAttainments,
  teamAttainmentPct,
  topPerformer,
  onOpenCopilot,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Main Chart: Target vs Actual Revenue by Sales Rep */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              Sales Target Quota vs Actual Revenue by Sales Rep
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              เปรียบเทียบยอดขายทำได้จริงกับเป้าหมายตามช่วงเวลา
            </p>
          </div>
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600 inline-block"></span>
              เป้าหมาย (Target)
            </span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"></span>
              ยอดขายจริง (Actual)
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={repAttainments} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="salesRep" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any, name: any) => {
                  const formatted = `฿${Number(val).toLocaleString()}`;
                  if (name === 'targetRevenue') return [formatted, 'เป้าหมาย (Target)'];
                  if (name === 'actualRevenue') return [formatted, 'ยอดขายจริง (Actual)'];
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
              <Bar dataKey="targetRevenue" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="actualRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28}>
                {repAttainments.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.attainmentPct >= 100 ? '#10b981' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side Card: AI Incentive Insights & Motivation Brief */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                AI Sales Incentive Advisor
              </h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              Gemini Co-Pilot
            </span>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
            <p>
              <strong>ภาพรวมความคืบหน้าทีม:</strong> ทีมทำผลงานได้ <strong>{teamAttainmentPct.toFixed(1)}%</strong> ของเป้าหมาย Q1 โดย <strong>{topPerformer?.salesRep}</strong> ปิดยอดเกินเป้าหมาย ({topPerformer?.attainmentPct.toFixed(0)}%) ได้รับโบนัส Kicker เต็มจำนวน
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              💡 <strong>คำแนะนำกระตุ้นยอด:</strong> ปรับโฟกัสทีม SMB ให้เร่งปิดดีลสินค้ามาร์จิ้นสูง (&gt;40%) เพื่อปลดล็อกโบนัส Gross Margin Booster ก่อนสิ้นสุดไตรมาส
            </p>
          </div>

          <div className="mt-3.5 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              ไฮไลท์รายบุคคล (Rep Highlights)
            </span>
            <div className="space-y-1.5 text-xs">
              {repAttainments.slice(0, 2).map((rep) => (
                <div key={rep.salesRep} className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center">
                      #{rep.rank}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{rep.salesRep}</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    ฿{rep.totalCommissionEarned.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold transition cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>ขอแนวทางเพิ่มยอดขายรายบุคคลจาก AI</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
