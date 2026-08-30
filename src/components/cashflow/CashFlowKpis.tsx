import React from 'react';
import { Calendar, Coins, Wallet, Clock } from 'lucide-react';

interface CashFlowKpisProps {
  day30Inflow: number;
  totalOutstandingAR: number;
  day90Inflow: number;
  finalCashBalance: number;
  minSafetyCash: number;
  inflowCount: number;
}

export const CashFlowKpis: React.FC<CashFlowKpisProps> = ({
  day30Inflow,
  totalOutstandingAR,
  day90Inflow,
  finalCashBalance,
  minSafetyCash,
  inflowCount,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1: 30-Day Inflow */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">เงินสดรับคาดการณ์ (30 วัน)</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            ฿{day30Inflow.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>คิดเป็น {((day30Inflow / (totalOutstandingAR || 1)) * 100).toFixed(0)}% ของลูกหนี้ทั้งหมด</span>
        </div>
      </div>

      {/* Card 2: 90-Day Cumulative Inflow */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">เงินสดรับสะสม (90 วัน)</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            ฿{day90Inflow.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <span>รวมลูกหนี้เดิม + ยอดขายใหม่</span>
        </div>
      </div>

      {/* Card 3: Projected Ending Cash Balance */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">เงินสดคงเหลือปลายไตรมาส</span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            finalCashBalance >= minSafetyCash
              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
          }`}>
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className={`text-xl sm:text-2xl font-bold ${
            finalCashBalance >= minSafetyCash
              ? 'text-slate-900 dark:text-white'
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            ฿{finalCashBalance.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>เงินสำรองขั้นต่ำ ฿{minSafetyCash.toLocaleString()}</span>
        </div>
      </div>

      {/* Card 4: Total Uncollected AR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ยอดหนี้ค้างรับรอเก็บ (A/R)</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            ฿{totalOutstandingAR.toLocaleString()}
          </span>
        </div>
        <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>จาก {inflowCount} รายการอินวอยซ์</span>
        </div>
      </div>
    </div>
  );
};
