import React, { useState, useEffect } from 'react';
import { Bot, X, Copy, Check, Sparkles, Send, Mail } from 'lucide-react';
import { fetchAiDebtDraft } from '../services/geminiService';

interface DebtDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  invoiceNo: string;
  amount: number;
  overdueDays: number;
  contactPerson?: string;
  onShowToast: (msg: string) => void;
}

export const DebtDraftModal: React.FC<DebtDraftModalProps> = ({
  isOpen,
  onClose,
  customerName,
  invoiceNo,
  amount,
  overdueDays,
  contactPerson,
  onShowToast,
}) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && customerName) {
      loadDraft();
    }
  }, [isOpen, customerName, invoiceNo, amount, overdueDays]);

  const loadDraft = async () => {
    setLoading(true);
    try {
      const res = await fetchAiDebtDraft(customerName, invoiceNo, amount, overdueDays, contactPerson);
      setContent(res.draft);
    } catch (e) {
      setContent(
        `เรียน ฝ่ายบัญชีและการเงิน ${customerName},\n\nขออนุญาตติดตามใบแจ้งหนี้เลขที่ ${invoiceNo} ยอดชำระ ฿${amount.toLocaleString()} ซึ่งครบกำหนดชำระแล้ว ${overdueDays} วัน\nรบกวนตรวจสอบและแจ้งกำหนดการโอนชำระเงินให้ทางเราทราบด้วยครับ\n\nขอแสดงความนับถือ,\nฝ่ายการเงินและการบัญชี`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onShowToast('คัดลอกข้อความทวงหนี้ลง Clipboard เรียบร้อยแล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-3.5 sm:space-y-4 min-w-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">AI ร่างข้อความติดตามหนี้สุภาพ</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">สำหรับส่งทาง LINE, Email หรือแจ้งฝ่ายบัญชีลูกค้า</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Metadata Preview */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap justify-between gap-1.5">
          <div className="min-w-0">
            <span className="text-slate-500">ลูกค้า: </span>
            <strong className="text-slate-900 dark:text-white">{customerName}</strong>
          </div>
          <div className="shrink-0">
            <span className="text-slate-500">ยอดค้าง: </span>
            <strong className="text-rose-600 dark:text-rose-400">฿{amount.toLocaleString()}</strong>
            <span className="text-slate-400 ml-1">({overdueDays} วัน)</span>
          </div>
        </div>

        {/* Textarea */}
        <div className="relative">
          {loading ? (
            <div className="w-full h-48 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-2 text-xs text-slate-500 p-4 text-center">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
              <span>Gemini กำลังร่างข้อความติดตามหนี้แบบมืออาชีพ...</span>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            onClick={loadDraft}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1 cursor-pointer transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>สร้างข้อความใหม่</span>
          </button>
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              ปิด
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกข้อความ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
