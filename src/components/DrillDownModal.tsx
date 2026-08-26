import React from 'react';
import { X, Layers, FileSpreadsheet } from 'lucide-react';
import { InvoiceRecord } from '../types';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  records: InvoiceRecord[];
  hideCostAndMargin?: boolean;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  records,
  hideCostAndMargin,
}) => {
  if (!isOpen) return null;

  const totalNet = records.reduce((acc, r) => acc + r.netAmount, 0);
  const totalCogs = records.reduce((acc, r) => acc + r.cogs, 0);
  const grossProfit = totalNet - totalCogs;
  const marginPct = totalNet > 0 ? ((grossProfit / totalNet) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col min-w-0 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5 shrink-0">
          <div className="min-w-0 pr-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{title}</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate pl-10.5">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary metric banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">
              จำนวนรายการ <span className="text-[10px] text-slate-400 font-normal">(Count)</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {records.length} <span className="text-xs font-semibold text-slate-400">รายการ</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate">
              ยอดขายสุทธิรวม <span className="text-[10px] text-slate-400 font-normal">(Net Sales)</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              ฿{totalNet.toLocaleString()}
            </div>
          </div>

          {!hideCostAndMargin && (
            <>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate">
                  กำไรขั้นต้นรวม <span className="text-[10px] text-slate-400 font-normal">(Gross Profit)</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ฿{grossProfit.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                  อัตรากำไรเฉลี่ย <span className="text-[10px] text-slate-400 font-normal">(Avg Margin)</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {marginPct}%
                </div>
              </div>
            </>
          )}
        </div>

        {/* Detailed Table with Line-item and Source reference */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar border border-slate-200/90 dark:border-slate-800 rounded-xl min-w-0 bg-white dark:bg-[#0f172a]">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[920px]">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold sticky top-0 border-b border-slate-200/90 dark:border-slate-800 z-10">
              <tr>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[130px]">
                  เลขที่บิล <span className="text-[10px] text-slate-400 font-normal">(Invoice No)</span>
                </th>
                <th className="py-3 px-3 whitespace-nowrap min-w-[100px]">
                  วันที่ <span className="text-[10px] text-slate-400 font-normal">(Date)</span>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[160px]">
                  ลูกค้า <span className="text-[10px] text-slate-400 font-normal">(Customer)</span>
                </th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[220px]">
                  รายการสินค้า <span className="text-[10px] text-slate-400 font-normal">(Product Description)</span>
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap min-w-[70px]">
                  จำนวน <span className="text-[10px] text-slate-400 font-normal">(Qty)</span>
                </th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap min-w-[120px]">
                  ยอดสุทธิ <span className="text-[10px] text-slate-400 font-normal">(Net Amount)</span>
                </th>
                {!hideCostAndMargin && (
                  <th className="py-3 px-3 text-right whitespace-nowrap min-w-[90px]">
                    กำไร % <span className="text-[10px] text-slate-400 font-normal">(Margin)</span>
                  </th>
                )}
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[170px]">
                  แหล่งข้อมูล <span className="text-[10px] text-slate-400 font-normal">(Source Ref)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {r.invoiceNo}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {r.customerName}
                  </td>
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-slate-400 font-mono text-[11px] shrink-0">[{r.itemCode}]</span>
                      <span className="truncate text-slate-800 dark:text-slate-200">{r.itemDescription}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {r.quantity}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap font-mono">
                    ฿{r.netAmount.toLocaleString()}
                  </td>
                  {!hideCostAndMargin && (
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {r.marginPct}%
                    </td>
                  )}
                  <td className="py-2.5 px-3.5 text-[11px] text-slate-400 font-mono whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate max-w-[130px]">{r.sourceFile || 'Sage50_Q2.xlsx'}</span>
                      <span className="text-[10px] text-slate-400">(Row {r.sourceRow || idx + 2})</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 shrink-0">
          <span className="text-xs text-slate-400">
            แสดงข้อมูลทั้งหมด {records.length} รายการที่ตรงตามเงื่อนไข
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
