import React from 'react';
import { Target, Edit3, Download } from 'lucide-react';

interface SalesCommissionHeaderProps {
  teamAttainmentPct: number;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  onOpenTargetModal: () => void;
  onExportExcel: () => void;
}

export const SalesCommissionHeader: React.FC<SalesCommissionHeaderProps> = ({
  teamAttainmentPct,
  selectedPeriod,
  setSelectedPeriod,
  onOpenTargetModal,
  onExportExcel,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex items-start space-x-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Sales Quotas &amp; Commission Tracking
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              teamAttainmentPct >= 100
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            }`}>
              บรรลุเป้าหมายรวม {teamAttainmentPct.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ระบบติดตามผลงานเซลส์รายบุคคล วัด % Attainment คำนวณคอมมิชชั่นแบบขั้นบันได และประเมินความคุ้มค่าผลกำไร
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center flex-wrap gap-2 shrink-0 self-stretch sm:self-auto">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <button
            onClick={() => setSelectedPeriod('2026-Q1')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedPeriod === '2026-Q1'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ไตรมาส 1 (Q1)
          </button>
          <button
            onClick={() => setSelectedPeriod('2026-Q2')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedPeriod === '2026-Q2'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ไตรมาส 2 (Q2)
          </button>
        </div>

        <button
          onClick={onOpenTargetModal}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>กำหนดเป้าหมาย</span>
        </button>

        <button
          onClick={onExportExcel}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
          title="ส่งออกรายงานยอดขายและคอมมิชชั่นเป็น Excel"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Export Settlement</span>
        </button>
      </div>
    </div>
  );
};
