import React from 'react';
import { Calculator, X } from 'lucide-react';

interface ArDsoSimulatorModalProps {
  showDsoSimulator: boolean;
  setShowDsoSimulator: (show: boolean) => void;
  dsoDays: number;
  grandTotalAR: number;
  targetDso: number;
  setTargetDso: (dso: number) => void;
  cashReleased: number;
}

export const ArDsoSimulatorModal: React.FC<ArDsoSimulatorModalProps> = ({
  showDsoSimulator,
  setShowDsoSimulator,
  dsoDays,
  grandTotalAR,
  targetDso,
  setTargetDso,
  cashReleased,
}) => {
  if (!showDsoSimulator) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/90 to-purple-50/90 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-purple-950/40 border border-indigo-200/90 dark:border-indigo-800/80 rounded-2xl p-5 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              เครื่องมือจำลองเป้าหมาย DSO &amp; ผลกระทบกระแสเงินสดหมุนเวียน
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              ประเมินมูลค่าเงินสดที่จะถูกปลดล็อกเข้าบริษัททันที หากเร่งรัดเก็บเงินได้ตามเป้าหมาย
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowDsoSimulator(false)}
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Current DSO */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
            DSO ปัจจุบัน (Current DSO)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-1.5">
            {dsoDays} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">วัน</span>
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1.5 block">
            ยอดหนี้คงค้างรวม: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">฿{grandTotalAR.toLocaleString()}</strong>
          </span>
        </div>

        {/* Target DSO Slider */}
        <div className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-4 shadow-2xs space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
              ปรับเป้าหมาย DSO ใหม่:
            </span>
            <span className="font-black font-mono text-indigo-600 dark:text-indigo-400 text-lg px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800">
              {targetDso} วัน
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={45}
            value={targetDso}
            onChange={(e) => setTargetDso(Number(e.target.value))}
            className="w-full accent-indigo-600 dark:accent-indigo-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-emerald-700 dark:text-emerald-400">15 วัน (เร่งด่วน)</span>
            <span className="text-indigo-600 dark:text-indigo-300">30 วัน (มาตรฐาน)</span>
            <span className="text-amber-700 dark:text-amber-400">45 วัน (เพดาน)</span>
          </div>
        </div>

        {/* Cash Released Result */}
        <div className="bg-emerald-50/95 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/80 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 block">
            เงินสดหมุนเวียนที่ปลดล็อกได้ (Cash Released)
          </span>
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1.5">
            +฿{cashReleased.toLocaleString()}
          </div>
          <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 mt-1.5 block">
            {targetDso < dsoDays
              ? `✓ เร่งเก็บหนี้เร็วขึ้น ${dsoDays - targetDso} วัน เพิ่มสภาพคล่องเงินสด`
              : '⚠ ตั้งเป้าหมาย DSO ให้ต่ำกว่าปัจจุบันเพื่อดูยอดเงินสดที่ปลดล็อก'}
          </span>
        </div>
      </div>
    </div>
  );
};
