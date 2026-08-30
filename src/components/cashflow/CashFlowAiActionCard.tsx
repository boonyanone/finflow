import React from 'react';
import { Bot, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { CustomerCashInflowItem } from '../../types';

interface CashFlowAiActionCardProps {
  healthStatus: 'Healthy' | 'Caution' | 'Stressed';
  finalCashBalance: number;
  runwayMonths: string;
  minCashBalanceInPeriod: number;
  inflowSchedule: CustomerCashInflowItem[];
  onOpenCopilot?: () => void;
}

export const CashFlowAiActionCard: React.FC<CashFlowAiActionCardProps> = ({
  healthStatus,
  finalCashBalance,
  runwayMonths,
  minCashBalanceInPeriod,
  inflowSchedule,
  onOpenCopilot,
}) => {
  const highRiskArSum = inflowSchedule
    .filter((i) => i.riskLevel === 'High' || i.riskLevel === 'Critical')
    .reduce((s, i) => s + i.outstandingAmount, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              AI Liquidity Diagnosis
            </h3>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
            Gemini Advisor
          </span>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          {healthStatus === 'Healthy' ? (
            <p>
              <strong>สภาพคล่องมีเสถียรภาพสูง:</strong> เงินสดสำรองคงเหลือปลายงวดอยู่ที่ <strong>฿{finalCashBalance.toLocaleString()}</strong> สูงกว่าเกณฑ์ความปลอดภัย สามารถรองรับค่าใช้จ่ายประจำได้มากกว่า {runwayMonths} เดือน
            </p>
          ) : healthStatus === 'Caution' ? (
            <p>
              <strong>ต้องเฝ้าระวังกระแสเงินสด:</strong> พบช่วงเวลาที่เงินสดคงเหลือแตะระดับขั้นต่ำ ฿{minCashBalanceInPeriod.toLocaleString()} แนะนำให้เร่งติดตามลูกหนี้กลุ่ม Overdue &gt;60 วัน เพื่อเสริมความคล่องตัว
            </p>
          ) : (
            <p className="text-rose-700 dark:text-rose-300">
              <strong>แจ้งเตือนความเสี่ยงสภาพคล่องตึงตัว:</strong> ภายใต้สมมติฐานนี้ เงินสดปลายงวดจะต่ำกว่าเกณฑ์ความปลอดภัย ควรพิจารณาออกแคมเปญส่วนลดชำระเร็ว หรือเจรจาขยายเครดิตเจ้าหนี้การค้า
            </p>
          )}
        </div>

        {/* Tactical Recommendations Checklist */}
        <div className="mt-3.5 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            ข้อเสนอแนะเชิงกลยุทธ์ (Tactical Actions)
          </span>

          <div className="space-y-1.5 text-xs">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start space-x-2">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-slate-600 dark:text-slate-300">
                เสนอส่วนลดเงินสด <strong>2.0%</strong> สำหรับลูกหนี้ชั้นดีเพื่อเร่งเก็บเงินเข้ากระเป๋าในสัปดาห์ที่ 1-2
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
              <span className="text-slate-600 dark:text-slate-300">
                ติดตามยอดค้างชำระโครงการกลุ่ม High Risk ฿{highRiskArSum.toLocaleString()} ก่อนถึงสิ้นเดือน
              </span>
            </div>
          </div>
        </div>
      </div>

      {onOpenCopilot && (
        <button
          onClick={onOpenCopilot}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold transition cursor-pointer"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>ขอคำแนะนำแผนกระแสเงินสดเชิงลึกจาก AI</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
