import React from 'react';
import { Target, X, Save } from 'lucide-react';
import { SalesTargetItem } from '../../types';

interface SalesTargetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  repsList: string[];
  tempTargets: Record<string, SalesTargetItem>;
  setTempTargets: React.Dispatch<React.SetStateAction<Record<string, SalesTargetItem>>>;
  selectedPeriod: string;
  onSave: () => void;
}

export const SalesTargetEditModal: React.FC<SalesTargetEditModalProps> = ({
  isOpen,
  onClose,
  repsList,
  tempTargets,
  setTempTargets,
  selectedPeriod,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              ตั้งค่าเป้าหมายยอดขายพนักงาน (Sales Quota Setting)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {repsList.map((rep) => {
            const current = tempTargets[rep] || {
              salesRep: rep,
              targetRevenue: 1000000,
              targetGrossMarginPct: 35.0,
              targetNewAccounts: 3,
              period: selectedPeriod,
              department: 'Sales',
            };

            return (
              <div key={rep} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">{rep}</span>
                  <span className="text-[10px] text-slate-400">{selectedPeriod}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400">เป้าหมายยอดขาย (THB)</label>
                    <input
                      type="number"
                      value={current.targetRevenue}
                      onChange={(e) =>
                        setTempTargets({
                          ...tempTargets,
                          [rep]: {
                            ...current,
                            targetRevenue: Math.max(0, parseInt(e.target.value) || 0),
                          },
                        })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400">เป้าหมาย Gross Margin (%)</label>
                    <input
                      type="number"
                      value={current.targetGrossMarginPct}
                      onChange={(e) =>
                        setTempTargets({
                          ...tempTargets,
                          [rep]: {
                            ...current,
                            targetGrossMarginPct: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full mt-1 px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            onClick={onSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกเป้าหมาย</span>
          </button>
        </div>
      </div>
    </div>
  );
};
