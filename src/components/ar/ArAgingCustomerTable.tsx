import React from 'react';
import {
  User,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Phone,
  Mail,
  Receipt,
  FileSpreadsheet,
  Copy,
  Layers,
} from 'lucide-react';
import { InvoiceRecord } from '../../types';

export interface CustomerAgingEntry {
  customerId: string;
  customerName: string;
  group: string;
  creditLimit: number;
  salesRep: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: string;
  current0_30: number;
  aging31_60: number;
  aging61_90: number;
  over90: number;
  totalOutstanding: number;
  totalSales: number;
  maxOverdueDays: number;
  invoices: InvoiceRecord[];
}

interface ArAgingCustomerTableProps {
  filteredAndSorted: CustomerAgingEntry[];
  expandedCustomerId: string | null;
  toggleExpand: (id: string) => void;
  onOpenDebtDraft: (customer: string, invoiceNo: string, amount: number, overdueDays: number) => void;
  onDrillDown: (title: string, subtitle: string, records: InvoiceRecord[]) => void;
  onExportCsv?: () => void;
}

export const ArAgingCustomerTable: React.FC<ArAgingCustomerTableProps> = ({
  filteredAndSorted,
  expandedCustomerId,
  toggleExpand,
  onOpenDebtDraft,
  onDrillDown,
  onExportCsv,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          แสดงผล <strong className="text-slate-900 dark:text-white font-mono">{filteredAndSorted.length}</strong> ลูกหนี้
        </span>
        {onExportCsv && (
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center space-x-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>ส่งออกตาราง (CSV)</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto custom-scrollbar border border-slate-100 dark:border-slate-800/80 rounded-xl">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[950px]">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-3 w-8 text-center"></th>
              <th className="py-3 px-3">ลูกค้า / รหัสโครงการ</th>
              <th className="py-3 px-3">พนักงานขาย</th>
              <th className="py-3 px-3 text-right">วงเงินเครดิต &amp; การใช้งาน</th>
              <th className="py-3 px-3 text-right">0 - 30 วัน</th>
              <th className="py-3 px-3 text-right">31 - 60 วัน</th>
              <th className="py-3 px-3 text-right">61 - 90 วัน</th>
              <th className="py-3 px-3 text-right">&gt; 90 วัน</th>
              <th className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">ยอดค้างรวม (AR)</th>
              <th className="py-3 px-3 text-center">ระดับความเสี่ยง</th>
              <th className="py-3 px-3 text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#0f172a]">
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500 dark:text-slate-400">
                  ไม่พบข้อมูลลูกหนี้ที่ตรงกับเงื่อนไขการค้นหา
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((c) => {
                const isExpanded = expandedCustomerId === c.customerId;
                const utilPercent = c.creditLimit > 0 ? Math.min(100, Math.round((c.totalOutstanding / c.creditLimit) * 100)) : 0;
                const isOverlimit = c.totalOutstanding >= c.creditLimit;
                const isHighUtil = utilPercent >= 80;

                let riskBadge = {
                  text: 'ปกติ (Low Risk)',
                  color: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
                };
                if (c.status === 'Credit Hold' || c.aging61_90 > 0 || c.over90 > 0) {
                  riskBadge = {
                    text: 'เสี่ยงสูง (High Risk)',
                    color: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700',
                  };
                } else if (c.aging31_60 > 0 || isHighUtil) {
                  riskBadge = {
                    text: 'เฝ้าระวัง (Watchlist)',
                    color: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700',
                  };
                }

                return (
                  <React.Fragment key={c.customerId}>
                    <tr
                      onClick={() => toggleExpand(c.customerId)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer ${
                        isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => { e.stopPropagation(); toggleExpand(c.customerId); }}>
                        <button
                          type="button"
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                          title="คลิกเพื่อคลี่ดูบิลย่อยทั้งหมด"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{c.customerName}</span>
                          {c.status === 'Credit Hold' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white">
                              HOLD
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>ID: {c.customerId}</span>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{c.group}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]">{c.salesRep.split(' ')[0]}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-mono text-slate-700 dark:text-slate-300">
                          ฿{c.creditLimit.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            <div
                              style={{ width: `${utilPercent}%` }}
                              className={`h-full rounded-full ${
                                isOverlimit ? 'bg-rose-500' : isHighUtil ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <span className={`text-[10px] font-bold font-mono ${
                            isOverlimit ? 'text-rose-600' : isHighUtil ? 'text-amber-600' : 'text-slate-400'
                          }`}>
                            {utilPercent}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        {c.current0_30 > 0 ? (
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ฿{c.current0_30.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        {c.aging31_60 > 0 ? (
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            ฿{c.aging31_60.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        {c.aging61_90 > 0 ? (
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            ฿{c.aging61_90.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                        {c.over90 > 0 ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            ฿{c.over90.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">-</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                        ฿{c.totalOutstanding.toLocaleString()}
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskBadge.color}`}>
                          {riskBadge.text}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onOpenDebtDraft(
                                c.customerName,
                                c.invoices[0]?.invoiceNo || `INV-${c.customerId}`,
                                c.totalOutstanding,
                                c.maxOverdueDays || 45
                              )
                            }
                            className="p-1.5 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg transition border border-indigo-200 dark:border-indigo-800"
                            title="AI ร่างหนังสือทวงหนี้"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onDrillDown(
                                `รายการบิลลูกค้า: ${c.customerName}`,
                                `รหัส ${c.customerId} | ยอดค้าง ฿${c.totalOutstanding.toLocaleString()} (${c.invoices.length} บิล)`,
                                c.invoices
                              )
                            }
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition border border-slate-200 dark:border-slate-700"
                            title="เปิดหน้าต่างเจาะลึกดูรายการบิล"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Invoices List */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                        <td colSpan={11} className="p-4">
                          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                              <div className="flex items-center space-x-2">
                                <Receipt className="w-4 h-4 text-indigo-600" />
                                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                  รายการใบแจ้งหนี้ของ {c.customerName} ({c.invoices.length} บิล)
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</span>
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>
                              </div>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full text-[11px] text-left">
                                <thead className="text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                                  <tr>
                                    <th className="py-2 px-2.5">เลขที่บิล</th>
                                    <th className="py-2 px-2.5">วันที่ออกบิล</th>
                                    <th className="py-2 px-2.5">วันครบกำหนด</th>
                                    <th className="py-2 px-2.5 text-center">เกินกำหนด (วัน)</th>
                                    <th className="py-2 px-2.5 text-right">ยอดสุทธิ</th>
                                    <th className="py-2 px-2.5 text-right">ยอดคงค้าง</th>
                                    <th className="py-2 px-2.5 text-center">สถานะ</th>
                                    <th className="py-2 px-2.5 text-center">การกระทำ</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                  {c.invoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                                      <td className="py-2 px-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">{inv.invoiceNo}</td>
                                      <td className="py-2 px-2.5 text-slate-600 dark:text-slate-300 font-mono">{inv.date}</td>
                                      <td className="py-2 px-2.5 text-slate-600 dark:text-slate-300 font-mono">{inv.dueDate}</td>
                                      <td className="py-2 px-2.5 text-center font-mono font-bold">
                                        {inv.overdueDays > 0 ? (
                                          <span className="text-rose-600 dark:text-rose-400 font-bold">{inv.overdueDays} วัน</span>
                                        ) : (
                                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">อยู่ในกำหนด</span>
                                        )}
                                      </td>
                                      <td className="py-2 px-2.5 text-right font-mono text-slate-700 dark:text-slate-300">฿{inv.netAmount.toLocaleString()}</td>
                                      <td className="py-2 px-2.5 text-right font-mono font-black text-rose-600 dark:text-rose-400">฿{inv.outstandingAmount.toLocaleString()}</td>
                                      <td className="py-2 px-2.5 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                          inv.status === 'Overdue'
                                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                                        }`}>
                                          {inv.status}
                                        </span>
                                      </td>
                                      <td className="py-2 px-2.5 text-center">
                                        <button
                                          type="button"
                                          onClick={() => onOpenDebtDraft(c.customerName, inv.invoiceNo, inv.outstandingAmount, inv.overdueDays)}
                                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                        >
                                          <Sparkles className="w-3 h-3" />
                                          <span>ทวงบิลนี้</span>
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
