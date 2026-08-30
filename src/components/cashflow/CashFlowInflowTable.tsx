import React from 'react';
import { CustomerCashInflowItem } from '../../types';

interface CashFlowInflowTableProps {
  filteredSchedule: CustomerCashInflowItem[];
  scheduleFilter: 'all' | '30days' | '60days' | 'high_risk';
  setScheduleFilter: React.Dispatch<React.SetStateAction<'all' | '30days' | '60days' | 'high_risk'>>;
  searchSchedule: string;
  setSearchSchedule: React.Dispatch<React.SetStateAction<string>>;
  onOpenDebtDraft?: (customer: string, invoiceNo: string, amount: number, overdueDays: number) => void;
}

export const CashFlowInflowTable: React.FC<CashFlowInflowTableProps> = ({
  filteredSchedule,
  scheduleFilter,
  setScheduleFilter,
  searchSchedule,
  setSearchSchedule,
  onOpenDebtDraft,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            ตารางกำหนดรับชำระและโอกาสการเก็บเงินรายลูกค้า (Receivables Collection Schedule)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            แสดง {filteredSchedule.length} รายการตามผลการปรับสมมติฐานการจ่ายเงิน
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setScheduleFilter('all')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                scheduleFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setScheduleFilter('30days')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                scheduleFilter === '30days'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ภายใน 30 วัน
            </button>
            <button
              onClick={() => setScheduleFilter('high_risk')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                scheduleFilter === 'high_risk'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              กลุ่มเสี่ยงสูง
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="ค้นหาลูกค้า/เลขที่..."
            value={searchSchedule}
            onChange={(e) => setSearchSchedule(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 font-semibold">
            <tr>
              <th className="p-3">ลูกค้า / โครงการ</th>
              <th className="p-3">เลขที่อินวอยซ์</th>
              <th className="p-3">วันครบกำหนดเดิม</th>
              <th className="p-3">วันคาดว่าจะได้รับเงิน</th>
              <th className="p-3 text-right">ยอดหนี้ค้างชำระ</th>
              <th className="p-3 text-center">โอกาสเก็บเงิน (%)</th>
              <th className="p-3 text-right">ยอดคาดการณ์สุทธิ</th>
              <th className="p-3 text-center">ความเสี่ยง</th>
              <th className="p-3 text-center">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredSchedule.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                  ไม่พบรายการลูกหนี้ตามเงื่อนไขที่เลือก
                </td>
              </tr>
            ) : (
              filteredSchedule.map((item, idx) => (
                <tr key={`${item.invoiceNo}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">
                    {item.customerName}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">
                    {item.invoiceNo}
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">
                    {item.originalDueDate}
                  </td>
                  <td className="p-3 font-medium text-blue-600 dark:text-blue-400">
                    {item.adjustedDueDate}
                  </td>
                  <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                    ฿{item.outstandingAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {(item.expectedProbability * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    ฿{Math.round(item.expectedInflow).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.riskLevel === 'Low'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : item.riskLevel === 'Medium'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    }`}>
                      {item.riskLevel}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {onOpenDebtDraft && item.overdueDays > 0 ? (
                      <button
                        onClick={() => onOpenDebtDraft(item.customerName, item.invoiceNo, item.outstandingAmount, item.overdueDays)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                      >
                        ร่างทวงถาม
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">ปกติ</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
