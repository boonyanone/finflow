import React from 'react';
import { Sliders, RotateCcw, ChevronDown, ChevronUp, Flame, BadgePercent, ShieldCheck } from 'lucide-react';
import { CommissionSchemeConfig } from '../../types';

interface SalesCommissionSchemeSimulatorProps {
  scheme: CommissionSchemeConfig;
  setScheme: React.Dispatch<React.SetStateAction<CommissionSchemeConfig>>;
  defaultScheme: CommissionSchemeConfig;
  showSchemeEditor: boolean;
  setShowSchemeEditor: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SalesCommissionSchemeSimulator: React.FC<SalesCommissionSchemeSimulatorProps> = ({
  scheme,
  setScheme,
  defaultScheme,
  showSchemeEditor,
  setShowSchemeEditor,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            แบบจำลองโครงสร้างและนโยบายจ่ายคอมมิชชั่น (Commission Scheme Simulator)
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setScheme(defaultScheme)}
            className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>รีเซ็ตนโยบายมาตรฐาน</span>
          </button>
          <button
            onClick={() => setShowSchemeEditor(!showSchemeEditor)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 transition cursor-pointer"
          >
            <span>{showSchemeEditor ? 'ซ่อนการปรับแต่ง' : 'ปรับเกณฑ์คอมมิชชั่น'}</span>
            {showSchemeEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Quick Model Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setScheme({ ...scheme, modelType: 'accelerator_kicker', baseRatePct: 1.5, kickerRatePct: 1.0 })}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            scheme.modelType === 'accelerator_kicker'
              ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-2xs'
              : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-900 dark:text-white">ขั้นบันไดเร่งยอด (Accelerator)</span>
            <Flame className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            ฐาน 1.5% + โบนัสเพิ่ม 1.0% เมื่อทะลุ 100% เหมาะสำหรับผลักดันเป้าหมายยอดขาย
          </p>
        </button>

        <button
          onClick={() => setScheme({ ...scheme, modelType: 'gross_profit_linked', baseRatePct: 1.8, kickerRatePct: 0.8 })}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            scheme.modelType === 'gross_profit_linked'
              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-2xs'
              : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-900 dark:text-white">เน้นกำไรขั้นต้น (Profit-Linked)</span>
            <BadgePercent className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            คำนวณจาก Gross Margin ป้องกันการลดราคาตัดยอดขาย และเพิ่มผลตอบแทนดีลกำไรสูง
          </p>
        </button>

        <button
          onClick={() => setScheme({ ...scheme, modelType: 'revenue_tiered', paidOnlySettlement: true, uncollectedOverdueDeductionPct: 15 })}
          className={`p-3 rounded-xl border text-left transition cursor-pointer ${
            scheme.paidOnlySettlement
              ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-2xs'
              : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-slate-900 dark:text-white">เน้นเงินสดเข้า (Cash-Settled)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            จ่ายคอมมิชชั่นเฉพาะบิลที่เก็บเงินสดแล้ว + หักลดหย่อนหากปล่อยลูกหนี้ค้างเกิน 90 วัน
          </p>
        </button>
      </div>

      {/* Collapsible Sliders */}
      {showSchemeEditor && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">อัตราคอมมิชชั่นฐาน (Base Rate)</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{scheme.baseRatePct}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={scheme.baseRatePct}
              onChange={(e) => setScheme({ ...scheme, baseRatePct: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">โบนัสทะลุเป้า 100% (Kicker)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">+{scheme.kickerRatePct}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.2"
              value={scheme.kickerRatePct}
              onChange={(e) => setScheme({ ...scheme, kickerRatePct: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">หักลดหย่อนหนี้ค้าง &gt;90 วัน</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">-{scheme.uncollectedOverdueDeductionPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={scheme.uncollectedOverdueDeductionPct}
              onChange={(e) => setScheme({ ...scheme, uncollectedOverdueDeductionPct: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
