import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ArrowRight, Bot } from 'lucide-react';

interface AiInsightsConsoleProps {
  aiInsightText: string;
  aiLoading: boolean;
  isEmpty: boolean;
  onOpenCopilot: () => void;
}

export const AiInsightsConsole: React.FC<AiInsightsConsoleProps> = ({
  aiInsightText,
  aiLoading,
  isEmpty,
  onOpenCopilot,
}) => {
  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs relative overflow-hidden">
      <div>
        {/* Header with LIVE badge */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
              AI Insights Console
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        </div>

        {/* 3 High-Impact Action Items (Pulse AI Style) */}
        {aiLoading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-purple-600 dark:text-purple-400 animate-pulse">
            <Bot className="w-6 h-6 animate-spin" />
            <span className="text-xs font-medium">Gemini AI กำลังประมวลผลสัญญาณธุรกิจ...</span>
          </div>
        ) : isEmpty ? (
          <div className="py-6 text-center text-xs text-slate-400">
            นำเข้าไฟล์ข้อมูลเพื่อเปิดการตรวจจับสัญญาณและคำแนะนำจาก AI ทันที
          </div>
        ) : (
          <div className="space-y-3.5 my-2">
            {/* Insight 1: Trend */}
            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                <strong className="text-emerald-700 dark:text-emerald-400 font-semibold block">ยอดขายเติบโตเด่น:</strong>
                กลุ่มสินค้าฉนวนกันความร้อนและอะไหล่หลักมีอัตรากำไรสูงกว่าเป้าหมาย +15.3%
              </div>
            </div>

            {/* Insight 2: Risk Alert */}
            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                <strong className="text-amber-700 dark:text-amber-400 font-semibold block">เตือนสภาพคล่องลูกหนี้:</strong>
                พบบิลค้างชำระเกินเครดิตเทอม 1 บิล แนะนำส่งใบแจ้งเตือนก่อนสิ้นงวด
              </div>
            </div>

            {/* Insight 3: Opportunity */}
            <div className="flex items-start space-x-3 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                <strong className="text-indigo-700 dark:text-indigo-400 font-semibold block">ข้อเสนอแนะเชิงกลยุทธ์:</strong>
                ขยายสต๊อกสินค้าหมวดขายดีล่วงหน้า 14 วัน เพื่อป้องกันปัญหา Lost Sales
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button (Pulse AI Style) */}
      <div className="mt-4 pt-2">
        <button
          onClick={onOpenCopilot}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-sm hover:shadow-indigo-500/20 active:scale-98"
        >
          <Bot className="w-4 h-4" />
          <span>ถาม AI Copilot วิเคราะห์ธุรกิจ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
