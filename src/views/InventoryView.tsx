import React from 'react';
import { Package, AlertTriangle, CheckCircle2, DollarSign, Layers } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory }) => {
  const totalValuation = inventory.reduce((acc, item) => acc + item.totalAssetValue, 0);
  const criticalItems = inventory.filter((item) => item.qtyOnHand < item.reorderPoint);
  const healthyItems = inventory.filter((item) => item.qtyOnHand >= item.reorderPoint);

  return (
    <div id="viewInventory" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0">
      {/* 1. Inventory Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Valuation */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Total Inventory Valuation
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate font-mono">
              ฿{totalValuation.toLocaleString()}
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
            <span>มูลค่าต้นทุนสินค้าคงเหลือรวม</span>
          </div>
        </div>

        {/* Total SKUs */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Total Tracked Items
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate">
              {inventory.length} <span className="text-xs font-semibold text-slate-400">SKUs</span>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            <span>เชื่อมต่อกับ Sage 50 ERP Live</span>
          </div>
        </div>

        {/* Critical Low Stock */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Critical Low Stock
              </span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-1 truncate">
              {criticalItems.length} <span className="text-xs font-semibold text-rose-500">รายการวิกฤต</span>
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-rose-600 dark:text-rose-400 font-medium">
            <span>ต่ำกว่าเกณฑ์ Reorder Point</span>
          </div>
        </div>

        {/* Healthy Items */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Stock Health Ratio
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate font-mono">
              {((healthyItems.length / (inventory.length || 1)) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>สต็อกอยู่ในเกณฑ์ปลอดภัย {healthyItems.length}/{inventory.length} รายการ</span>
          </div>
        </div>
      </div>

      {/* 2. Main Inventory Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  Inventory Valuation &amp; Stock Health
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  Sage 50 Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                ตรวจสอบจุดสั่งซื้อซ้ำ (Reorder Point) และวิเคราะห์เงินจมในสินค้าไม่เคลื่อนไหว
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar w-full min-w-0">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[650px]">
            <thead className="text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="pb-3 px-3 sm:px-4 whitespace-nowrap">Item Code</th>
                <th className="pb-3 px-3 sm:px-4 whitespace-nowrap">Description</th>
                <th className="pb-3 px-3 sm:px-4 whitespace-nowrap">Category</th>
                <th className="pb-3 px-3 sm:px-4 text-right whitespace-nowrap">Qty On Hand</th>
                <th className="pb-3 px-3 sm:px-4 text-right whitespace-nowrap">Reorder Point</th>
                <th className="pb-3 px-3 sm:px-4 text-right whitespace-nowrap">Total Asset Value</th>
                <th className="pb-3 px-3 sm:px-4 text-center whitespace-nowrap">Stock Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {inventory.map((item) => {
                const isCritical = item.qtyOnHand < item.reorderPoint;
                return (
                  <tr key={item.code} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3 sm:px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-800 dark:text-slate-200">{item.name}</td>
                    <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 px-3 sm:px-4 text-right font-black whitespace-nowrap font-mono ${
                        isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.qtyOnHand} ตัว
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right font-medium text-slate-500 whitespace-nowrap font-mono">
                      {item.reorderPoint} ตัว
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap font-mono">
                      ฿{item.totalAssetValue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isCritical
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {isCritical ? 'ต่ำกว่าเกณฑ์สั่งซื้อ' : 'ปกติ (Healthy)'}
                      </span>
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
