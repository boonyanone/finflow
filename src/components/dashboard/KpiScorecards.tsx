import React from 'react';
import { Banknote, TrendingUp, Wallet, AlertCircle, ArrowUpRight, Lock } from 'lucide-react';
import { InvoiceRecord, UserProfile } from '../../types';

interface KpiScorecardsProps {
  totalNetSales: number;
  grossProfit: number;
  marginPct: string;
  totalCogs: number;
  totalPaidCash: number;
  collectionEfficiency: string;
  totalOverdue: number;
  overdueCount: number;
  isSalesRep: boolean;
  isEmpty: boolean;
  filteredCount: number;
  onDrillDown: (title: string, subtitle: string, filteredRecords: InvoiceRecord[]) => void;
  filteredData: InvoiceRecord[];
}

export const KpiScorecards: React.FC<KpiScorecardsProps> = ({
  totalNetSales,
  grossProfit,
  marginPct,
  totalCogs,
  totalPaidCash,
  collectionEfficiency,
  totalOverdue,
  overdueCount,
  isSalesRep,
  isEmpty,
  filteredCount,
  onDrillDown,
  filteredData,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* KPI 1: Total Revenue YTD */}
      <div
        id="kpiCardRevenue"
        onClick={() => {
          if (filteredData.length > 0) {
            onDrillDown(
              'เจาะลึกยอดขายสุทธิ (Total Revenue Drill-down)',
              'รายการใบแจ้งหนี้ทั้งหมดในชุดข้อมูลปัจจุบัน',
              filteredData
            );
          }
        }}
        className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              YTD REVENUE (ยอดขายสุทธิ)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              +12.5% YoY
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight font-mono">
              ฿{totalNetSales.toLocaleString()}
            </div>
            {/* Sparkline Visual (Pulse AI Style) */}
            <svg className="w-16 h-7 text-indigo-500 shrink-0" viewBox="0 0 64 28" fill="none">
              <path
                d="M2 24 L14 18 L26 21 L38 12 L50 15 L62 4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{isEmpty ? 'รอการนำเข้าข้อมูล' : `${filteredCount} รายการบิลบันทึก`}</span>
          <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
            เจาะลึก <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* KPI 2: Gross Profit */}
      <div
        id="kpiCardGrossProfit"
        onClick={() => {
          if (!isSalesRep && filteredData.length > 0) {
            onDrillDown(
              'เจาะลึกกำไรขั้นต้น (Gross Profit Drill-down)',
              'วิเคราะห์ส่วนต่างราคาขายและต้นทุนสินค้า',
              filteredData
            );
          }
        }}
        className={`bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 transition-all shadow-xs flex flex-col justify-between group ${
          isSalesRep ? '' : 'hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md cursor-pointer'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              GROSS PROFIT (กำไรขั้นต้น)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              +8.2% MoM
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {isSalesRep ? (
                <span className="inline-flex items-center gap-1.5 text-slate-400 text-lg font-semibold">
                  <Lock className="w-4 h-4" /> ซ่อนต้นทุน
                </span>
              ) : (
                `฿${grossProfit.toLocaleString()}`
              )}
            </div>
            {/* Sparkline Visual */}
            <svg className="w-16 h-7 text-blue-500 shrink-0" viewBox="0 0 64 28" fill="none">
              <path
                d="M2 22 L14 20 L26 14 L38 16 L50 8 L62 5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{isSalesRep ? 'ฝ่ายขาย (สงวนสิทธิ์)' : `มาร์จิ้นเฉลี่ย ${marginPct}%`}</span>
          {!isSalesRep && (
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
              ต้นทุน ฿{totalCogs.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* KPI 3: Realized Cash & Collection */}
      <div
        id="kpiCardCollection"
        onClick={() => {
          if (filteredData.length > 0) {
            onDrillDown(
              'วิเคราะห์เงินสดรับชำระ (Cash Collection Efficiency)',
              'ประสิทธิภาพการจัดเก็บเงินสดเทียบกับยอดขาย',
              filteredData
            );
          }
        }}
        className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              COLLECTION RATE (เก็บเงินสด)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              {collectionEfficiency}% Settled
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight font-mono">
              ฿{totalPaidCash.toLocaleString()}
            </div>
            {/* Sparkline Visual */}
            <svg className="w-16 h-7 text-emerald-500 shrink-0" viewBox="0 0 64 28" fill="none">
              <path
                d="M2 20 L16 16 L28 18 L40 10 L52 11 L62 3"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>เงินสดจริงเข้าบัญชีแล้ว</span>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5">
            สถานะดีเยี่ยม <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* KPI 4: Active AR Overdue */}
      <div
        id="kpiCardArOverdue"
        onClick={() => {
          if (filteredData.filter((r) => r.status === 'Overdue').length > 0) {
            onDrillDown(
              'เจาะลึกลูกหนี้ค้างชำระ (Accounts Receivable Drill-down)',
              'บิลที่เกินกำหนดชำระและต้องเร่งรัดติดตาม',
              filteredData.filter((r) => r.status === 'Overdue')
            );
          }
        }}
        className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between group"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              AR OVERDUE (หนี้ค้างชำระ)
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              totalOverdue > 0
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
            }`}>
              {totalOverdue > 0 ? `${overdueCount} บิลเตือน` : 'ปกติ 0%'}
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div className={`text-2xl sm:text-[28px] font-black tracking-tight font-mono ${
              totalOverdue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
            }`}>
              ฿{totalOverdue.toLocaleString()}
            </div>
            {/* Sparkline Visual */}
            <svg className={`w-16 h-7 shrink-0 ${totalOverdue > 0 ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600'}`} viewBox="0 0 64 28" fill="none">
              <path
                d={totalOverdue > 0 ? "M2 6 L16 12 L28 10 L40 18 L52 14 L62 24" : "M2 24 L62 24"}
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{totalOverdue > 0 ? 'ต้องเร่งรัดติดตามหนี้' : 'สุขภาพลูกหนี้แข็งแกร่ง'}</span>
          <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 group-hover:underline flex items-center gap-0.5">
            ดูรายชื่อ <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
