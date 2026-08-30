import React, { useState } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FileText,
  Receipt,
  Bot,
  AlertCircle,
  TrendingUp,
  Wallet,
  BookOpen,
  Lock,
} from 'lucide-react';
import { InvoiceRecord, UserProfile } from '../../types';

interface RecentTransactionsTableProps {
  filteredData: InvoiceRecord[];
  isSalesRep: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onDrillDown: (title: string, subtitle: string, filteredRecords: InvoiceRecord[]) => void;
  onOpenDebtDraft: (customer: string, invoiceNo: string, amount: number, overdueDays: number) => void;
  isEmpty: boolean;
  onOpenUpload: () => void;
  onLoadDemoData?: () => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  filteredData,
  isSalesRep,
  searchQuery,
  onSearchChange,
  onDrillDown,
  onOpenDebtDraft,
  isEmpty,
  onOpenUpload,
  onLoadDemoData,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'paid'>('all');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [copiedInvoiceNo, setCopiedInvoiceNo] = useState<string | null>(null);

  const handleCopyInvoice = (invNo: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(invNo);
    setCopiedInvoiceNo(invNo);
    setTimeout(() => setCopiedInvoiceNo(null), 2000);
  };

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedInvoiceId((prev) => (prev === id ? null : id));
  };

  const displayedRecords = filteredData.filter((r) => {
    if (activeTab === 'overdue') return r.status === 'Overdue';
    if (activeTab === 'paid') return r.status === 'Paid';
    return true;
  });

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-xs">
      {/* Header with Segmented Tabs and Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2">
          {/* Segmented Tab Controls (Pulse AI style) */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              รายการบิลทั้งหมด ({filteredData.length})
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'overdue'
                  ? 'bg-white dark:bg-[#0f172a] text-rose-600 dark:text-rose-400 shadow-2xs'
                  : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>บิลค้างชำระ ({filteredData.filter((r) => r.status === 'Overdue').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'paid'
                  ? 'bg-white dark:bg-[#0f172a] text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ชำระแล้ว ({filteredData.filter((r) => r.status === 'Paid').length})
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาเลขที่บิล, ลูกค้า, สินค้า..."
            className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
      </div>

      {/* Table Canvas */}
      <div className="overflow-x-auto custom-scrollbar w-full min-w-0 rounded-xl border border-slate-100 dark:border-slate-800/80">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[700px]">
          <thead className="bg-slate-50/90 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200/80 dark:border-slate-700">
            <tr>
              <th className="py-3 px-3 w-8 text-center"></th>
              <th className="py-3 px-3.5 whitespace-nowrap">Invoice No</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Date</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Customer Name</th>
              <th className="py-3 px-3.5 whitespace-nowrap">Category &amp; Item</th>
              <th className="py-3 px-3.5 text-center whitespace-nowrap">Sales Rep</th>
              <th className="py-3 px-3.5 text-right whitespace-nowrap">Amount</th>
              {!isSalesRep && <th className="py-3 px-3.5 text-right whitespace-nowrap">Margin %</th>}
              <th className="py-3 px-3.5 text-center whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-transparent">
            {displayedRecords.length === 0 ? (
              <tr>
                <td colSpan={isSalesRep ? 8 : 9} className="text-center py-12 text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      {isEmpty ? 'ยังไม่มีข้อมูลรายการใบแจ้งหนี้' : 'ไม่พบรายการที่ตรงกับเงื่อนไข'}
                    </p>
                    {isEmpty && (
                      <button
                        onClick={onOpenUpload}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        + นำเข้าไฟล์ Excel ทันที
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              displayedRecords.map((r) => {
                let badge = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60';
                if (r.status === 'Pending') badge = 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60';
                if (r.status === 'Overdue') badge = 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60';

                const isExpanded = expandedInvoiceId === r.id;

                return (
                  <React.Fragment key={r.id}>
                    <tr
                      onClick={() => toggleExpand(r.id)}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer ${
                        isExpanded ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-2 text-center" onClick={(e) => toggleExpand(r.id, e)}>
                        <button
                          type="button"
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 transition cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {r.invoiceNo}
                      </td>

                      <td className="py-3 px-3.5 text-slate-400 whitespace-nowrap">{r.date}</td>

                      <td className="py-3 px-3.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {r.customerName}
                      </td>

                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mr-1.5 whitespace-nowrap">
                          {r.category}
                        </span>
                        <span>{r.itemDescription}</span>
                      </td>

                      <td className="py-3 px-3.5 text-center text-slate-500 whitespace-nowrap">{r.salesRep}</td>

                      <td className="py-3 px-3.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap font-mono">
                        ฿{r.netAmount.toLocaleString()}
                      </td>

                      {!isSalesRep && (
                        <td className="py-3 px-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                          {r.marginPct}%
                        </td>
                      )}

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>
                          {r.status === 'Paid' ? 'Settled' : r.status}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                        <td colSpan={isSalesRep ? 8 : 9} className="p-4">
                          <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 space-y-4 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/70 pb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                  <Receipt className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                      ใบแจ้งหนี้: {r.invoiceNo}
                                    </h4>
                                    <button
                                      onClick={(e) => handleCopyInvoice(r.invoiceNo, e)}
                                      className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition"
                                      title="คัดลอกเลขที่บิล"
                                    >
                                      {copiedInvoiceNo === r.invoiceNo ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    ลูกค้า: {r.customerName} ({r.customerId}) | วันครบกำหนด: {r.dueDate}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDrillDown(`รายละเอียดบิล ${r.invoiceNo}`, `ลูกค้า: ${r.customerName}`, [r]);
                                  }}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>เปิด Drill-down</span>
                                </button>

                                {r.status === 'Overdue' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onOpenDebtDraft(r.customerName, r.invoiceNo, r.outstandingAmount, r.overdueDays);
                                    }}
                                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/70 hover:bg-amber-100 transition cursor-pointer"
                                  >
                                    <Bot className="w-3.5 h-3.5 text-amber-600" />
                                    <span>ร่างจดหมายทวงหนี้ AI</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* 3 Detail Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1 font-mono">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                                  โครงสร้างราคา &amp; ภาษี
                                </span>
                                <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-1">
                                  <span>ยอดก่อนภาษี:</span>
                                  <span>฿{r.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                  <span>VAT 7%:</span>
                                  <span>฿{r.tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200 pt-1">
                                  <span>ยอดสุทธิ:</span>
                                  <span className="text-indigo-600 dark:text-indigo-400">฿{r.netAmount.toLocaleString()}</span>
                                </div>
                              </div>

                              {!isSalesRep ? (
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1 font-mono">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                                    กำไรขั้นต้น &amp; ต้นทุน
                                  </span>
                                  <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-1">
                                    <span>ต้นทุนขาย (COGS):</span>
                                    <span>฿{r.cogs.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                                    <span>กำไร (GP):</span>
                                    <span>฿{r.grossProfit.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300 border-t border-slate-200 pt-1">
                                    <span>มาร์จิ้น:</span>
                                    <span>{r.marginPct}%</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs flex flex-col justify-center text-slate-400">
                                  <Lock className="w-4 h-4 text-amber-500 mb-1" />
                                  <span>ข้อมูลต้นทุนสงวนสิทธิ์เฉพาะฝ่ายบริหาร</span>
                                </div>
                              )}

                              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1 font-mono">
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                                  สถานะการรับชำระ
                                </span>
                                <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-1">
                                  <span>รับชำระแล้ว:</span>
                                  <span className="text-emerald-600 font-bold">฿{(r.paidAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-rose-600">
                                  <span>ยอดค้างชำระ:</span>
                                  <span>฿{(r.outstandingAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-slate-500 border-t border-slate-200 pt-1">
                                  <span>ครบกำหนด:</span>
                                  <span>{r.dueDate}</span>
                                </div>
                              </div>
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
