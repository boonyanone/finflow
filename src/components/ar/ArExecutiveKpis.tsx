import React from 'react';
import {
  Layers,
  Calendar,
  AlertTriangle,
  AlertOctagon,
  ExternalLink,
  Calculator,
} from 'lucide-react';
import { InvoiceRecord } from '../../types';

interface ArExecutiveKpisProps {
  grandTotalAR: number;
  outstandingCustomersCount: number;
  dsoDays: number;
  totalOverdue: number;
  overdueRatio: string;
  estimatedProvisionECL: number;
  invoices: InvoiceRecord[];
  onDrillDown: (title: string, subtitle: string, records: InvoiceRecord[]) => void;
  onOpenDsoSimulator: () => void;
}

export const ArExecutiveKpis: React.FC<ArExecutiveKpisProps> = ({
  grandTotalAR,
  outstandingCustomersCount,
  dsoDays,
  totalOverdue,
  overdueRatio,
  estimatedProvisionECL,
  invoices,
  onDrillDown,
  onOpenDsoSimulator,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* KPI 1: Total AR Outstanding */}
      <div
        onClick={() => onDrillDown(
          'ยอดลูกหนี้คงค้างทั้งหมด (Total AR Portfolio)',
          `รายการใบแจ้งหนี้ที่มีหนี้คงเหลือทั้งหมด (${invoices.filter((i) => i.outstandingAmount > 0).length} รายการ)`,
          invoices.filter((i) => i.outstandingAmount > 0)
        )}
        className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between cursor-pointer transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            TOTAL AR (ลูกหนี้คงเหลือ)
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight font-mono">
            ฿{grandTotalAR.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{outstandingCustomersCount} ลูกหนี้ที่มียอดค้าง</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
              เจาะลึกบิล <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* KPI 2: Days Sales Outstanding (DSO) */}
      <div
        onClick={onOpenDsoSimulator}
        className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between cursor-pointer transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            DSO (ระยะเวลาเก็บหนี้เฉลี่ย)
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {dsoDays}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">วัน</span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              เป้า &lt;45 วัน
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>เร็วกว่าเกณฑ์ 13 วัน</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
              จำลองเงินสด <Calculator className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* KPI 3: Overdue Amount */}
      <div
        onClick={() => {
          const overdueInvoices = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 30);
          onDrillDown(
            'ยอดหนี้เกินกำหนดทั้งหมด (Total Overdue AR > 30 Days)',
            `รายการใบแจ้งหนี้ที่เกินกำหนดรอบแรกขึ้นไป (${overdueInvoices.length} รายการ | รวม ฿${totalOverdue.toLocaleString()})`,
            overdueInvoices
          );
        }}
        className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between cursor-pointer transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            OVERDUE AR (หนี้เกินกำหนด)
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-[28px] font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
            ฿{totalOverdue.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>สัดส่วนหนี้เกินกำหนด {overdueRatio}%</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-0.5">
              เจาะลึกบิล <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* KPI 4: ECL Provision */}
      <div
        onClick={() => {
          const highRiskInvoices = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 60);
          onDrillDown(
            'หนี้ที่ต้องตั้งสำรองสูงตาม TFRS 9 (Stage 2 & Stage 3)',
            `รายการใบแจ้งหนี้ค้างเกิน 60 วัน (${highRiskInvoices.length} รายการ | ประมาณการสำรอง ฿${estimatedProvisionECL.toLocaleString()})`,
            highRiskInvoices
          );
        }}
        className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 hover:border-rose-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between cursor-pointer transition group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            ECL PROVISION (สำรองหนี้สูญ)
          </span>
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="text-2xl sm:text-[28px] font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
            ฿{estimatedProvisionECL.toLocaleString()}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>เกณฑ์ TFRS 9</span>
            <span className="font-bold text-rose-600 dark:text-rose-400 group-hover:underline flex items-center gap-0.5">
              เจาะลึกบิล <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
