import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, AlertOctagon, ArrowUpRight, Layers } from 'lucide-react';
import { InvoiceRecord } from '../../types';

export type ArFilterType = 'all' | '0_30' | '31_60' | '61_90' | 'over90' | 'current' | 'overdue' | 'high_risk' | 'overlimit';

interface ArAgingBandsProps {
  total0_30: number;
  total31_60: number;
  total61_90: number;
  totalOver90: number;
  grandTotalAR: number;
  selectedRiskFilter: ArFilterType;
  onSelectFilter: (filter: ArFilterType) => void;
  onDrillDown: (title: string, subtitle: string, records: InvoiceRecord[]) => void;
  invoices: InvoiceRecord[];
}

export const ArAgingBands: React.FC<ArAgingBandsProps> = ({
  total0_30,
  total31_60,
  total61_90,
  totalOver90,
  grandTotalAR,
  selectedRiskFilter,
  onSelectFilter,
  onDrillDown,
  invoices,
}) => {
  // Invoices filtered by bucket
  const inv0_30 = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays <= 30);
  const inv31_60 = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 30 && i.overdueDays <= 60);
  const inv61_90 = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 60 && i.overdueDays <= 90);
  const invOver90 = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 90);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Bucket 1: 0-30 Days (Current) */}
      <div
        id="cardAging0_30"
        onClick={() => onSelectFilter(selectedRiskFilter === '0_30' ? 'all' : '0_30')}
        className={`bg-white dark:bg-[#0f172a] border rounded-2xl p-5 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group ${
          selectedRiskFilter === '0_30'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20'
            : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-400'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>0-30 DAYS (อยู่ในกำหนด)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              {grandTotalAR > 0 ? ((total0_30 / grandTotalAR) * 100).toFixed(0) : 0}% ของยอดหนี้
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight font-mono">
              ฿{total0_30.toLocaleString()}
            </div>
            {/* Sparkline Safe */}
            <svg className="w-14 h-6 text-emerald-500 shrink-0" viewBox="0 0 56 24" fill="none">
              <path d="M2 18 L14 14 L26 16 L38 8 L54 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectFilter(selectedRiskFilter === '0_30' ? 'all' : '0_30');
            }}
            className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            {selectedRiskFilter === '0_30' ? '✓ กำลังกรองช่วงนี้' : 'กรองดูในตาราง'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDrillDown(
                'ลูกหนี้อยู่ในกำหนด 0 - 30 วัน (Current & Safe)',
                `รายการใบแจ้งหนี้ที่อยู่ในเกณฑ์ปกติ (${inv0_30.length} รายการ | รวม ฿${total0_30.toLocaleString()})`,
                inv0_30
              );
            }}
            className="text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
            title="เปิดหน้าต่างเจาะลึกดูทุกบิล"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>เจาะลึกบิล</span>
          </button>
        </div>
      </div>

      {/* Bucket 2: 31-60 Days (Mild Overdue) */}
      <div
        id="cardAging31_60"
        onClick={() => onSelectFilter(selectedRiskFilter === '31_60' ? 'all' : '31_60')}
        className={`bg-white dark:bg-[#0f172a] border rounded-2xl p-5 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group ${
          selectedRiskFilter === '31_60'
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20'
            : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>31-60 DAYS (เริ่มเตือน)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
              {grandTotalAR > 0 ? ((total31_60 / grandTotalAR) * 100).toFixed(0) : 0}% ของยอดหนี้
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight font-mono">
              ฿{total31_60.toLocaleString()}
            </div>
            {/* Sparkline */}
            <svg className="w-14 h-6 text-blue-500 shrink-0" viewBox="0 0 56 24" fill="none">
              <path d="M2 10 L14 14 L26 8 L38 12 L54 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectFilter(selectedRiskFilter === '31_60' ? 'all' : '31_60');
            }}
            className="text-blue-700 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            {selectedRiskFilter === '31_60' ? '✓ กำลังกรองช่วงนี้' : 'กรองดูในตาราง'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDrillDown(
                'ลูกหนี้เริ่มเกินกำหนด 31 - 60 วัน (First Reminder Stage)',
                `รายการใบแจ้งหนี้ที่เกินกำหนดระยะแรก (${inv31_60.length} รายการ | รวม ฿${total31_60.toLocaleString()})`,
                inv31_60
              );
            }}
            className="text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
            title="เปิดหน้าต่างเจาะลึกดูทุกบิล"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>เจาะลึกบิล</span>
          </button>
        </div>
      </div>

      {/* Bucket 3: 61-90 Days (High Risk) */}
      <div
        id="cardAging61_90"
        onClick={() => onSelectFilter(selectedRiskFilter === '61_90' ? 'all' : '61_90')}
        className={`bg-white dark:bg-[#0f172a] border rounded-2xl p-5 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group ${
          selectedRiskFilter === '61_90'
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20'
            : 'border-slate-200/90 dark:border-slate-800 hover:border-amber-400'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>61-90 DAYS (เฝ้าระวังเข้ม)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
              {grandTotalAR > 0 ? ((total61_90 / grandTotalAR) * 100).toFixed(0) : 0}% เสี่ยงสูง
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl sm:text-[26px] font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
              ฿{total61_90.toLocaleString()}
            </div>
            {/* Sparkline */}
            <svg className="w-14 h-6 text-amber-500 shrink-0" viewBox="0 0 56 24" fill="none">
              <path d="M2 4 L14 10 L26 6 L38 18 L54 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectFilter(selectedRiskFilter === '61_90' ? 'all' : '61_90');
            }}
            className="text-amber-700 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            {selectedRiskFilter === '61_90' ? '✓ กำลังกรองช่วงนี้' : 'กรองดูในตาราง'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDrillDown(
                'ลูกหนี้ค้างชำระ 61 - 90 วัน (High Risk Watchlist)',
                `รายการใบแจ้งหนี้เกินกำหนด 61-90 วัน เฝ้าระวังเข้ม (${inv61_90.length} รายการ | รวม ฿${total61_90.toLocaleString()})`,
                inv61_90
              );
            }}
            className="text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
            title="เปิดหน้าต่างเจาะลึกดูทุกบิล"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>เจาะลึกบิล</span>
          </button>
        </div>
      </div>

      {/* Bucket 4: >90 Days (Bad Debt Risk) */}
      <div
        id="cardAgingOver90"
        onClick={() => onSelectFilter(selectedRiskFilter === 'over90' ? 'all' : 'over90')}
        className={`bg-white dark:bg-[#0f172a] border rounded-2xl p-5 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group ${
          selectedRiskFilter === 'over90'
            ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
            : totalOver90 > 0
            ? 'border-rose-300 dark:border-rose-800 hover:border-rose-500'
            : 'border-slate-200/90 dark:border-slate-800'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>&gt;90 DAYS (หนี้วิกฤต)</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              totalOver90 > 0
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-700'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}>
              {totalOver90 > 0 ? '⛔ ต้องเร่งรัด' : '✓ 0% ไม่มีหนี้เสีย'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className={`text-2xl sm:text-[26px] font-black tracking-tight font-mono ${
              totalOver90 > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              ฿{totalOver90.toLocaleString()}
            </div>
            {/* Sparkline */}
            <svg className={`w-14 h-6 shrink-0 ${totalOver90 > 0 ? 'text-rose-500' : 'text-slate-300'}`} viewBox="0 0 56 24" fill="none">
              <path d={totalOver90 > 0 ? "M2 4 L14 12 L26 8 L38 20 L54 22" : "M2 20 L54 20"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectFilter(selectedRiskFilter === 'over90' ? 'all' : 'over90');
            }}
            className="text-rose-700 dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            {selectedRiskFilter === 'over90' ? '✓ กำลังกรองช่วงนี้' : 'กรองดูในตาราง'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDrillDown(
                'ลูกหนี้ค้างชำระเกิน 90 วัน (Critical / Stage 3 ECL)',
                `รายการใบแจ้งหนี้ค้างเกิน 90 วัน (${invOver90.length} รายการ | รวม ฿${totalOver90.toLocaleString()})`,
                invOver90
              );
            }}
            className="text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="เปิดหน้าต่างเจาะลึกดูทุกบิล"
          >
            <Layers className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>เจาะลึกบิล</span>
          </button>
        </div>
      </div>
    </div>
  );
};
