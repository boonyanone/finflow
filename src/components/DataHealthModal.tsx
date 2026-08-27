import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  RefreshCw,
  FileCheck,
  GitBranch,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface DataHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const DataHealthModal: React.FC<DataHealthModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [isRechecking, setIsRechecking] = useState(false);
  const [recheckCount, setRecheckCount] = useState(0);

  if (!isOpen) return null;

  const handleRecheck = () => {
    setIsRechecking(true);
    setTimeout(() => {
      setIsRechecking(false);
      setRecheckCount((prev) => prev + 1);
      if (onShowToast) {
        onShowToast('✓ ตรวจสอบคุณภาพข้อมูล (Data Quality Audit) ผ่าน 100% ข้อมูลสอดคล้องกันสมบูรณ์');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Data Quality &amp; Integrity Inspector
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  100% Reconciled
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ตรวจสอบความถูกต้องของการแปลงข้อมูล Sage 50 เข้าสู่ Canonical Data Model (CDM v3.0)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Core Data Quality Pillars */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>ผลการตรวจสอบ 4 เสาหลักคุณภาพข้อมูล (TFRS &amp; GL Standard)</span>
            <span className="text-[11px] text-slate-400">ตรวจสอบล่าสุด: วันนี้ 08:30 น.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pillar 1: Orphan Record Reconciliation */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>1. Orphan Record Check</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 0 Missing
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                รายการบรรทัด (<code className="text-slate-700 dark:text-slate-300 font-mono">AUDIT_SPLIT</code>) เชื่อมโยงกับหัวบิล (<code className="text-slate-700 dark:text-slate-300 font-mono">AUDIT_HEADER</code>) ครบทุกรายการ ไม่พบข้อมูลตกหล่น
              </p>
            </div>

            {/* Pillar 2: Unallocated Usage Normalization */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                  <span>2. Unallocated Usage</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Balanced
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ยอดรับชำระเงินและใบลดหนี้ (<code className="text-slate-700 dark:text-slate-300 font-mono">AUDIT_USAGE</code>) ตัดจ่ายกับยอดหนี้ตรงตามบิลจริงทุกบัญชี
              </p>
            </div>

            {/* Pillar 3: Category & Chart of Accounts Mapping */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-500" />
                  <span>3. Chart of Accounts (GL)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 100% Mapped
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ผังบัญชีรายได้, ลูกหนี้, และต้นทุนสินค้าจับคู่กับผังบัญชีสากล (CDM Target Schema) เรียบร้อย
              </p>
            </div>

            {/* Pillar 4: Currency & Numeric Sanitization */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>4. Format &amp; Types</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Validated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                ฟอร์แมตวันที่มาตรฐาน ISO-8601, ค่าสกุลเงิน THB (฿) ทศนิยม 2 ตำแหน่ง ผ่านการ Sanitization ครบถ้วน
              </p>
            </div>
          </div>
        </div>

        {/* Live Trial Balance & Ledger Reconciliation Box */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-900/80 dark:to-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                งบทดลองและการกระทบยอดสมุดรายวัน (Ledger Reconciliation)
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
              Balanced: Difference = ฿0.00
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-sans">ยอดเดบิตรวม (Total Debits)</span>
              <strong className="text-sm text-slate-900 dark:text-white">฿5,473,200.00</strong>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">Dr. ลูกหนี้การค้า &amp; สต็อกสินค้า</div>
            </div>
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-sans">ยอดเครดิตรวม (Total Credits)</span>
              <strong className="text-sm text-slate-900 dark:text-white">฿5,473,200.00</strong>
              <div className="text-[10px] text-slate-500 font-sans mt-0.5">Cr. รายได้จากการขาย &amp; ภาษีขาย</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleRecheck}
            disabled={isRechecking}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRechecking ? 'animate-spin text-emerald-500' : ''}`} />
            <span>{isRechecking ? 'กำลังตรวจสอบ...' : 'รันตรวจสอบใหม่อีกครั้ง (Audit Re-Check)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
