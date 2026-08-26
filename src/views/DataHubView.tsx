import React from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Settings2,
  Database,
  History,
  ShieldCheck,
  RefreshCw,
  Plus,
  Download,
  Building2,
} from 'lucide-react';
import { MappingProfile, InvoiceRecord } from '../types';
import { downloadColdRoomExcelTemplate } from '../utils/coldRoomExportHelper';

interface DataHubViewProps {
  invoices: InvoiceRecord[];
  mappingProfiles: MappingProfile[];
  onOpenUpload: () => void;
}

export const DataHubView: React.FC<DataHubViewProps> = ({
  invoices,
  mappingProfiles,
  onOpenUpload,
}) => {
  return (
    <div id="view-data-hub" className="space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full min-w-0 shadow-sm">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span>Sage 50 Data Hub &amp; ERP Excel Ingestion Pipeline</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/40 whitespace-nowrap">
                ETL Pipeline Ready
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              รองรับไฟล์ Excel/CSV จาก Sage 50, Express, Peak, FlowAccount พร้อมระบบ AI Smart Column Mapping
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={downloadColdRoomExcelTemplate}
            className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>ดาวน์โหลด .xlsx ตัวอย่างผนังห้องเย็น</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-sm shadow-blue-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>นำเข้าไฟล์ Excel ใหม่</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ชุดข้อมูลปัจจุบันในระบบ</span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {invoices.length} <span className="text-xs font-semibold text-slate-400">Records</span>
          </div>
          <div className="mt-2.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="truncate">Canonical Data Synchronized</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Data Quality Health Index</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            98.4%
          </div>
          <div className="mt-2.5 text-xs text-slate-400 truncate">0 Fatal Errors / 2 Minor Warnings</div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Mapping Profiles</span>
          <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {mappingProfiles.length} <span className="text-xs font-semibold text-slate-400">Templates</span>
          </div>
          <div className="mt-2.5 text-xs text-slate-400 truncate">Sage 50 US Pro, Sage 50 UK, Custom</div>
        </div>
      </div>

      {/* Mapping Profiles List */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Saved Smart Mapping Profiles</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              จดจำโครงสร้างหัวคอลัมน์ของ Sage 50 แต่ละเวอร์ชัน เพื่อการแปลงข้อมูลอัตโนมัติไม่ต้องจับคู่ใหม่ทุกครั้ง
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {mappingProfiles.map((prof) => (
            <div
              key={prof.id}
              className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-200 dark:hover:border-blue-800/60 transition space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{prof.name}</h4>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/40">
                  {prof.mappings.length} Fields
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{prof.description}</p>
              <div className="text-[10px] text-slate-400 font-mono">
                Updated: {prof.updatedAt}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ingestion History Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Ingestion History &amp; Audit Trail</h3>
          </div>
          <span className="text-xs text-slate-400">Total 3 Sync Batches</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar w-full min-w-0">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[650px]">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">File Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Sheet Name</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Rows Ingested</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Quality Score</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Imported By</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date Timestamp</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                  Sage50_Siam_Cooling_Panel_ColdRoom_Demo.xlsx
                </td>
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap">Invoices_Line_Items</td>
                <td className="py-3 px-3 text-right font-medium whitespace-nowrap font-mono">16 records</td>
                <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">100%</td>
                <td className="py-3 px-3 whitespace-nowrap">สมชาย มั่นคง (Admin)</td>
                <td className="py-3 px-3 text-slate-400 whitespace-nowrap">วันนี้ 15:30 น.</td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    Success
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                  AR_Aging_Retentions_Export.xlsx
                </td>
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap">AR_Aging_ColdRoom</td>
                <td className="py-3 px-3 text-right font-medium whitespace-nowrap font-mono">5 records</td>
                <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">100%</td>
                <td className="py-3 px-3 whitespace-nowrap">ศิริพร การเงิน</td>
                <td className="py-3 px-3 text-slate-400 whitespace-nowrap">เมื่อวาน 11:20 น.</td>
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                    Success
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

