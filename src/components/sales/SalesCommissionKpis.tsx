import React from 'react';
import { Target, Wallet, Percent, Trophy } from 'lucide-react';
import { SalesRepAttainment } from '../../types';

interface SalesCommissionKpisProps {
  totalActual: number;
  totalTarget: number;
  teamAttainmentPct: number;
  totalCommissionPool: number;
  teamMarginPct: number;
  totalGrossProfit: number;
  topPerformer?: SalesRepAttainment;
}

export const SalesCommissionKpis: React.FC<SalesCommissionKpisProps> = ({
  totalActual,
  totalTarget,
  teamAttainmentPct,
  totalCommissionPool,
  teamMarginPct,
  totalGrossProfit,
  topPerformer,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: Team Quota vs Actual */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ยอดขายรวมเทียบเป้า</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            ฿{totalActual.toLocaleString()}
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              teamAttainmentPct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, teamAttainmentPct)}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>เป้าหมาย ฿{totalTarget.toLocaleString()}</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{teamAttainmentPct.toFixed(0)}%</span>
        </div>
      </div>

      {/* Card 2: Total Commission Payout Pool */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">กองทุนคอมมิชชั่นสุทธิ</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            ฿{totalCommissionPool.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <span>คิดเป็น {((totalCommissionPool / (totalActual || 1)) * 100).toFixed(2)}% ของยอดขาย</span>
        </div>
      </div>

      {/* Card 3: Team Gross Margin % */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">อัตรากำไรเฉลี่ยทีม</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {teamMarginPct.toFixed(1)}%
          </span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>กำไรขั้นต้นรวม ฿{totalGrossProfit.toLocaleString()}</span>
        </div>
      </div>

      {/* Card 4: Top Performer Spotlight */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ยอดขายอันดับ 1</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
            {topPerformer?.salesRep || 'ไม่มีข้อมูล'}
          </span>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {topPerformer?.attainmentPct.toFixed(0)}%
          </span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>ยอด ฿{topPerformer?.actualRevenue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
