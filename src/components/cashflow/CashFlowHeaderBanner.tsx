import React from 'react';
import { TrendingUp, Download } from 'lucide-react';

interface CashFlowHeaderBannerProps {
  healthColor: string;
  healthLabel: string;
  selectedPreset: string;
  onApplyPreset: (presetKey: string) => void;
  onExportExcel: () => void;
}

export const CashFlowHeaderBanner: React.FC<CashFlowHeaderBannerProps> = ({
  healthColor,
  healthLabel,
  selectedPreset,
  onApplyPreset,
  onExportExcel,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex items-start space-x-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Cash Flow Projection &amp; What-If Scenario Simulator
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${healthColor}`}>
              {healthLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            แบบจำลองกระแสเงินสดรับล่วงหน้า 12 สัปดาห์ และเครื่องมือทดสอบสมมติฐานทางธุรกิจแบบ Real-time
          </p>
        </div>
      </div>

      {/* Preset Selector & Action Buttons */}
      <div className="flex items-center flex-wrap gap-2 shrink-0 self-stretch sm:self-auto">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <button
            onClick={() => onApplyPreset('baseline')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedPreset === 'baseline'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            มาตรฐาน (Baseline)
          </button>
          <button
            onClick={() => onApplyPreset('delayed_stress')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedPreset === 'delayed_stress'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ลูกค้าจ่ายช้า (+25d)
          </button>
          <button
            onClick={() => onApplyPreset('aggressive_discount')}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              selectedPreset === 'aggressive_discount'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            เร่งเก็บหนี้ (Discount 2.5%)
          </button>
        </div>

        <button
          onClick={onExportExcel}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
          title="ส่งออกผลการพยากรณ์เป็น Excel"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Export Excel</span>
        </button>
      </div>
    </div>
  );
};
