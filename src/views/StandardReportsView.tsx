import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Printer,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  Boxes,
  PieChart,
  Edit3,
} from 'lucide-react';
import { ReportDefinition, InvoiceRecord } from '../types';
import { exportToExcel, printCurrentReport } from '../utils/exportUtils';

interface StandardReportsViewProps {
  reports: ReportDefinition[];
  invoices: InvoiceRecord[];
  onOpenInStudio: (report: ReportDefinition) => void;
  onShowToast: (msg: string) => void;
}

export const StandardReportsView: React.FC<StandardReportsViewProps> = ({
  reports,
  invoices,
  onOpenInStudio,
  onShowToast,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');

  const categories = ['All', 'Sales', 'Finance', 'AR', 'Inventory', 'Custom'];

  const filteredReports = reports.filter(
    (r) => selectedCategory === 'All' || r.category === selectedCategory
  );

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'Sales':
        return <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Finance':
        return <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'AR':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Inventory':
        return <Boxes className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleExport = (rep: ReportDefinition) => {
    exportToExcel(invoices, rep.category || 'SageReport', `${rep.title}.xlsx`);
    onShowToast(`ส่งออกรายงาน "${rep.title}" เป็นไฟล์ Excel เรียบร้อยแล้ว`);
  };

  return (
    <div id="view-standard-reports" className="space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0 shadow-sm">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span>Standard Reports Template Library</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                Crystal Reports Replacement
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              รวมแม่แบบรายงานมาตรฐานที่พร้อมใช้งานได้ทันที หรือเปิดปรับแต่งต่อใน Report Studio
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 w-full">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {cat} Reports
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full min-w-0">
        {filteredReports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-blue-400/60 dark:hover:border-blue-500/60 rounded-2xl p-5 transition flex flex-col justify-between space-y-4 group w-full min-w-0 shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getCategoryIcon(rep.category)}
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {rep.category || 'General'}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-medium">
                  {rep.visualization.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition line-clamp-1">
                  {rep.title}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {rep.description || 'รายงานสรุปผลการดำเนินงานและสถิติทางการเงิน'}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {rep.selectedFields.slice(0, 3).map((f) => (
                  <span
                    key={f}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 truncate max-w-[120px]"
                  >
                    {f}
                  </span>
                ))}
                {rep.selectedFields.length > 3 && (
                  <span className="text-[10px] text-slate-400 self-center font-medium">
                    +{rep.selectedFields.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <span className="text-[10px] text-slate-400">By: {rep.owner}</span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleExport(rep)}
                  title="Export to Excel"
                  className="p-1.5 sm:p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenInStudio(rep)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1 transition cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>เปิดใน Studio</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
