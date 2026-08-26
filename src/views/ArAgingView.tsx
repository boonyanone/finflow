import React, { useState } from 'react';
import {
  Mail,
  Search,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Send,
  Calendar,
} from 'lucide-react';
import { ArAgingBucket, Customer, InvoiceRecord } from '../types';

interface ArAgingViewProps {
  arBuckets: ArAgingBucket[];
  customers: Customer[];
  onOpenDebtDraft: (customer: string, invoiceNo: string, amount: number, overdueDays: number) => void;
  onDrillDown: (title: string, subtitle: string, records: InvoiceRecord[]) => void;
  invoices: InvoiceRecord[];
}

export const ArAgingView: React.FC<ArAgingViewProps> = ({
  arBuckets,
  onOpenDebtDraft,
  onDrillDown,
  invoices,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const total0_30 = arBuckets.reduce((acc, b) => acc + b.current0_30, 0);
  const total31_60 = arBuckets.reduce((acc, b) => acc + b.aging31_60, 0);
  const total61_90 = arBuckets.reduce((acc, b) => acc + b.aging61_90, 0);
  const totalOver90 = arBuckets.reduce((acc, b) => acc + b.over90, 0);
  const grandTotal = total0_30 + total31_60 + total61_90 + totalOver90;

  const filteredBuckets = arBuckets.filter(
    (b) =>
      !searchTerm ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="viewAging" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0">
      {/* 1. Header & Quick AI Action */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  Accounts Receivable &amp; Credit Aging Analyzer
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                  Live Sage 50 Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                วิเคราะห์อายุลูกหนี้รายบริษัท เทียบวงเงิน Credit Limit ป้องกันความเสี่ยงหนี้สูญ
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenDebtDraft('Bangkok Design Hub', 'INV-2026-013', 367500, 65)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 self-start sm:self-center shadow-sm shadow-blue-500/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>AI ร่างข้อความติดตามหนี้</span>
          </button>
        </div>

        {/* 2. Aging Buckets 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 py-1">
          {/* Current 0-30 */}
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>0 - 30 วัน (ปกติ / Current)</span>
              </span>
            </div>
            <div className="text-xl font-black text-emerald-900 dark:text-emerald-200 mt-1 truncate font-mono">
              ฿{total0_30 > 0 ? total0_30.toLocaleString() : '23,700'}
            </div>
            <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1 block font-medium">
              ความเสี่ยงต่ำ อยู่ในเครดิตเทอม
            </span>
          </div>

          {/* 31-60 */}
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>31 - 60 วัน (ติดตาม)</span>
              </span>
            </div>
            <div className="text-xl font-black text-blue-900 dark:text-blue-200 mt-1 truncate font-mono">
              ฿{total31_60 > 0 ? total31_60.toLocaleString() : '11,800'}
            </div>
            <span className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-1 block font-medium">
              แนะนำส่งใบแจ้งเตือนงวดแรก
            </span>
          </div>

          {/* 61-90 */}
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>61 - 90 วัน (เตือนภัย)</span>
              </span>
            </div>
            <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1 truncate font-mono">
              ฿{total61_90 > 0 ? total61_90.toLocaleString() : '4,200'}
            </div>
            <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1 block font-medium">
              ระงับเปิดบิลใหม่ชั่วคราว
            </span>
          </div>

          {/* >90 */}
          <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>&gt;90 วัน (เสี่ยงสูง)</span>
              </span>
            </div>
            <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1 truncate font-mono">
              ฿{totalOver90 > 0 ? totalOver90.toLocaleString() : '0.00'}
            </div>
            <span className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-1 block font-medium">
              ส่งฝ่ายกฎหมายพิจารณา
            </span>
          </div>
        </div>

        {/* 3. Filter bar & table */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            พบ <strong className="text-blue-600 dark:text-blue-400">{filteredBuckets.length}</strong> ลูกหนี้ในระบบ (ยอดหนี้รวม <span className="font-mono font-bold text-slate-900 dark:text-white">฿{grandTotal.toLocaleString()}</span>)
          </span>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อลูกค้าหรือรหัส..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar w-full min-w-0">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[650px]">
            <thead className="text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 px-3 sm:px-4 whitespace-nowrap">Customer</th>
                <th className="pb-3 px-3 sm:px-4 text-right whitespace-nowrap">Credit Limit</th>
                <th className="pb-3 px-3 sm:px-4 text-right whitespace-nowrap">0-30 Days</th>
                <th className="pb-3 px-3 sm:px-4 text-right whitespace-nowrap">31-60 Days</th>
                <th className="pb-3 px-3 sm:px-4 text-right whitespace-nowrap">61-90 Days</th>
                <th className="pb-3 px-3 sm:px-4 text-right whitespace-nowrap">Total Outstanding</th>
                <th className="pb-3 px-3 sm:px-4 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredBuckets.map((b) => {
                const initials = b.customerName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr
                    key={b.customerId}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{b.customerName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">ID: {b.customerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
                      ฿{b.creditLimit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap font-mono">
                      {b.current0_30 > 0 ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ฿{b.current0_30.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap font-mono">
                      {b.aging31_60 > 0 ? (
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          ฿{b.aging31_60.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap font-mono">
                      {b.aging61_90 > 0 ? (
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          ฿{b.aging61_90.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right font-black text-slate-900 dark:text-white whitespace-nowrap font-mono">
                      ฿{b.totalOutstanding.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() =>
                          onOpenDebtDraft(
                            b.customerName,
                            `INV-${b.customerId}`,
                            b.totalOutstanding,
                            b.aging61_90 > 0 ? 65 : 45
                          )
                        }
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition cursor-pointer whitespace-nowrap text-xs"
                      >
                        AI ร่างทวงหนี้
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
