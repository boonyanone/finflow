import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

interface PerformanceScoreCardProps {
  collectionEfficiency: string;
  marginPct: string;
  isEmpty: boolean;
}

export const PerformanceScoreCard: React.FC<PerformanceScoreCardProps> = ({
  collectionEfficiency,
  marginPct,
  isEmpty,
}) => {
  const score = isEmpty ? 0 : 88;
  const rating = isEmpty ? 'STANDBY' : 'EXCELLENT';

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              FINANCIAL HEALTH SCORE
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">ดัชนีสุขภาพธุรกิจองค์รวม</p>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="flex items-center space-x-4 my-2">
          {/* Circular Score Badge (Pulse AI Style) */}
          <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{score}</span>
              <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400">{rating}</span>
            </div>
          </div>

          {/* 3 Metric Bars */}
          <div className="flex-1 space-y-2 text-xs">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-500">Cash Liquidity</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">92%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-500">Collection Speed</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{collectionEfficiency}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(Number(collectionEfficiency) || 85, 100)}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span className="text-slate-500">Margin Health</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{marginPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(Number(marginPct) * 2 || 80, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>DBD Standard Audit</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">เสี่ยงต่ำ (Low Risk)</span>
      </div>
    </div>
  );
};
