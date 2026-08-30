import React from 'react';
import { Sliders, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { CashFlowScenarioParams } from '../../types';

interface CashFlowSimulatorControlsProps {
  params: CashFlowScenarioParams;
  setParams: React.Dispatch<React.SetStateAction<CashFlowScenarioParams>>;
  onReset: () => void;
  showAdvancedParams: boolean;
  setShowAdvancedParams: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CashFlowSimulatorControls: React.FC<CashFlowSimulatorControlsProps> = ({
  params,
  setParams,
  onReset,
  showAdvancedParams,
  setShowAdvancedParams,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            ตัวปรับแต่งสมมติฐานจำลองสถานการณ์ (What-If Parameters)
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>รีเซ็ตค่าเดิม</span>
          </button>
          <button
            onClick={() => setShowAdvancedParams(!showAdvancedParams)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 transition cursor-pointer"
          >
            <span>{showAdvancedParams ? 'ย่อตัวแปรขั้นสูง' : 'ตั้งค่าต้นทุน & OPEX ขั้นสูง'}</span>
            {showAdvancedParams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Primary Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
        {/* Parameter 1: Payment Delay / Acceleration */}
        <div className="space-y-2 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              พฤติกรรมการจ่ายเงินลูกค้า
            </span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
              params.paymentDelayDays === 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : params.paymentDelayDays > 0
                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
            }`}>
              {params.paymentDelayDays === 0
                ? 'ตามกำหนด (0 วัน)'
                : params.paymentDelayDays > 0
                ? `จ่ายช้า +${params.paymentDelayDays} วัน`
                : `จ่ายเร็ว ${params.paymentDelayDays} วัน`}
            </span>
          </div>
          <input
            type="range"
            min="-15"
            max="45"
            step="5"
            value={params.paymentDelayDays}
            onChange={(e) => setParams((p) => ({ ...p, paymentDelayDays: parseInt(e.target.value) }))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>-15 วัน (เร่งเก็บ)</span>
            <span>ปกติ (0)</span>
            <span>+45 วัน (ชะลอจ่าย)</span>
          </div>
        </div>

        {/* Parameter 2: Sales Revenue Growth */}
        <div className="space-y-2 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              อัตราเติบโตของยอดขายใหม่
            </span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
              params.salesGrowthPct === 0
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                : params.salesGrowthPct > 0
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
            }`}>
              {params.salesGrowthPct > 0 ? `+${params.salesGrowthPct}%` : `${params.salesGrowthPct}%`}
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="50"
            step="5"
            value={params.salesGrowthPct}
            onChange={(e) => setParams((p) => ({ ...p, salesGrowthPct: parseInt(e.target.value) }))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>-30% (หดตัว)</span>
            <span>0% (คงเดิม)</span>
            <span>+50% (เติบโตสูง)</span>
          </div>
        </div>

        {/* Parameter 3: Early Payment Cash Discount */}
        <div className="space-y-2 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ส่วนลดเงินสดชำระเร็ว (Early Cash Discount)
            </span>
            <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              {params.earlyPaymentDiscountPct}% (ยอมรับ {params.earlyCollectionAdoptionPct}%)
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={params.earlyPaymentDiscountPct}
            onChange={(e) => setParams((p) => ({ ...p, earlyPaymentDiscountPct: parseFloat(e.target.value) }))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% (ไม่มีส่วนลด)</span>
            <span>2.5%</span>
            <span>5.0% (จูงใจสูงสุด)</span>
          </div>
        </div>
      </div>

      {/* Advanced Cost & Liquidity Parameters (Collapsible) */}
      {showAdvancedParams && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              เงินสดตั้งต้น (Opening Cash Balance)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">฿</span>
              <input
                type="number"
                value={params.openingCashBalance}
                onChange={(e) => setParams((p) => ({ ...p, openingCashBalance: Math.max(0, parseInt(e.target.value) || 0) }))}
                className="w-full pl-7 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              ค่าใช้จ่ายประจำคงที่รายเดือน (Fixed OPEX)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">฿</span>
              <input
                type="number"
                value={params.monthlyFixedOpex}
                onChange={(e) => setParams((p) => ({ ...p, monthlyFixedOpex: Math.max(0, parseInt(e.target.value) || 0) }))}
                className="w-full pl-7 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              เงินสำรองขั้นต่ำที่ต้องการ (Min Safety Cash)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">฿</span>
              <input
                type="number"
                value={params.minSafetyCash}
                onChange={(e) => setParams((p) => ({ ...p, minSafetyCash: Math.max(0, parseInt(e.target.value) || 0) }))}
                className="w-full pl-7 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
