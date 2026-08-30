import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Send,
  X,
  Sparkles,
  Download,
  FileText,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InvoiceRecord } from '../types';
import { parseExcelFile } from '../utils/excelParser';
import { INITIAL_INVOICES } from '../data/sampleSage50Data';

interface AccountantUploadPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  onImportComplete: (newInvoices: InvoiceRecord[], fileName: string, sheetName: string, qualityScore: number) => void;
  onShowToast: (msg: string) => void;
}

export const AccountantUploadPortalModal: React.FC<AccountantUploadPortalModalProps> = ({
  isOpen,
  onClose,
  companyName,
  onImportComplete,
  onShowToast,
}) => {
  const [accountantName, setAccountantName] = useState('');
  const [accountantFirm, setAccountantFirm] = useState('');
  const [periodMonth, setPeriodMonth] = useState('2026-08');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSimulateAccountantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      onImportComplete(INITIAL_INVOICES, `Accountant_Report_${periodMonth}.xlsx`, 'Sales_Summary', 100);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      onShowToast(`✓ สำนักงานบัญชีส่งไฟล์รายงานรอบ ${periodMonth} เรียบร้อยแล้ว`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 my-8">
        {/* Header with Company Context */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded-full border border-teal-200">
                  Accountant Client Portal
                </span>
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                ช่องทางส่งไฟล์สำหรับสำนักงานบัญชี
              </h3>
              <p className="text-xs text-slate-500">สำหรับ: {companyName || 'บริษัทลูกค้า SME'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isDone ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                ส่งไฟล์ข้อมูลให้ผู้บริหารสำเร็จเรียบร้อย!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                ระบบได้ทำการแปลงข้อมูลและอัปเดตแดชบอร์ดบริหารของลูกค้า ({companyName}) เรียบร้อยแล้ว ขอบคุณสำหรับข้อมูลครับ
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              ปิดหน้าต่างนี้
            </button>
          </div>
        ) : (
          <form onSubmit={handleSimulateAccountantSubmit} className="space-y-4">
            <div className="bg-teal-50/70 dark:bg-teal-950/30 p-3.5 rounded-2xl border border-teal-200/80 dark:border-teal-800/60 flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <p className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
                หน้านี้ถูกสร้างขึ้นเพื่อให้สำนักงานบัญชีสามารถแนบไฟล์รายงานการขาย/ลูกหนี้ (Express, FlowAccount, PEAK หรือ Excel) ให้กับผู้บริหารได้โดยตรงในไม่กี่วินาที
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อผู้ส่งข้อมูล / ผู้ทำบัญชี
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณกมลวรรณ (สมุห์บัญชี)"
                  value={accountantName}
                  onChange={(e) => setAccountantName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อสำนักงานบัญชี
                </label>
                <input
                  type="text"
                  placeholder="เช่น สนง. บัญชี พีเค แอคเคาท์ติ้ง"
                  value={accountantFirm}
                  onChange={(e) => setAccountantFirm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                รอบประจำงวดเดือน
              </label>
              <input
                type="month"
                required
                value={periodMonth}
                onChange={(e) => setPeriodMonth(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* File Dropzone */}
            <div className="border-2 border-dashed border-teal-300 dark:border-teal-700 hover:border-teal-500 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 text-center cursor-pointer transition space-y-2">
              <UploadCloud className="w-8 h-8 text-teal-600 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                แนบไฟล์ Excel สรุปยอดขาย / ลูกหนี้คงค้าง
              </div>
              <p className="text-[11px] text-slate-400">
                รองรับไฟล์ที่ Export ออกมาจาก Express, FlowAccount, PEAK หรือ Excel ทั่วไป
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                หมายเหตุเพิ่มเติมถึงผู้บริหาร (ไม่บังคับ)
              </label>
              <textarea
                rows={2}
                placeholder="เช่น ปรับปรุงรายการรับชำระหนี้รอบสิ้นเดือนเรียบร้อยแล้วค่ะ"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                {isSubmitting ? (
                  <span>กำลังอัปโหลดและประมวลผล...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่งข้อมูลเข้าแดชบอร์ดทันที</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
