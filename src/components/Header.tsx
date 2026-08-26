import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  FileUp,
  Download,
  Menu,
  Search,
  ChevronDown,
  Printer,
} from 'lucide-react';
import { FeatureToggles } from '../types';

interface HeaderProps {
  activeTab: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  lang?: 'th' | 'en';
  onToggleLang?: () => void;
  onOpenCopilot: () => void;
  onOpenUpload: () => void;
  features: FeatureToggles;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  lang = 'th',
  onOpenCopilot,
  onOpenUpload,
  features,
  onToggleSidebar,
}) => {
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbTitle = () => {
    if (lang === 'en') {
      switch (activeTab) {
        case 'dashboard':
          return 'Sales & Margin Hub';
        case 'ar-aging':
          return 'A/R Aging & Collection';
        case 'inventory':
          return 'Inventory Valuation';
        case 'field-mapping':
          return 'Custom Field Mapping';
        case 'report-studio':
          return 'Report Studio';
        case 'standard-reports':
          return 'Standard Reports';
        case 'data-hub':
          return 'Import Sage Excel';
        case 'odbc-sync':
          return 'ODBC Direct Sync';
        case 'settings':
          return 'System Settings & Roles';
        default:
          return 'Sales & Margin Hub';
      }
    }

    switch (activeTab) {
      case 'dashboard':
        return 'Sales & Margin Hub (ยอดขายและกำไร)';
      case 'ar-aging':
        return 'A/R Aging (วิเคราะห์ลูกหนี้)';
      case 'inventory':
        return 'Inventory Valuation (มูลค่าสินค้าคงคลัง)';
      case 'field-mapping':
        return 'Custom Field Mapping (จับคู่ฟิลด์)';
      case 'report-studio':
        return 'Report Studio (สร้างรายงาน)';
      case 'standard-reports':
        return 'Standard Reports (รายงานมาตรฐาน)';
      case 'data-hub':
        return 'Import Sage Excel (นำเข้าไฟล์)';
      case 'odbc-sync':
        return 'ODBC Direct Sync (เชื่อมต่อฐานข้อมูล)';
      case 'settings':
        return 'System Settings (ตั้งค่าระบบ & สิทธิ์)';
      default:
        return 'Sales & Margin Hub (ยอดขายและกำไร)';
    }
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Invoice No,Date,Customer Name,Item,Sales Rep,Qty,Net Amount,Margin Pct,Status\n' +
      'INV-2026-001,2026-01-15,Modern Living Co.,Ergonomic Office Chair X1,Alex Wong,25,99750,38.6%,Paid\n' +
      'INV-2026-002,2026-01-18,Chiang Mai Resort & Spa,Solid Teak Dining Table,Somchai P.,8,126000,46.7%,Paid\n' +
      'INV-2026-004,2026-02-14,Phuket Villa Horizon,Outdoor Rattan Sunbed,Kanya R.,12,112000,43.8%,Paid\n' +
      'INV-2026-005,2026-03-05,Bangkok Design Hub,Ergonomic Office Chair X1,Alex Wong,50,192500,36.4%,Paid\n' +
      'INV-2026-007,2026-04-10,Modern Living Co.,Acoustic Wall Panel (6-Pack),Alex Wong,30,87500,49.6%,Paid\n' +
      'INV-2026-008,2026-04-22,Pattaya Boutique Hotel,Solid Teak Dining Table,Somchai P.,10,149625,43.9%,Paid\n' +
      'INV-2026-009,2026-05-08,Krabi Emerald Resort,Outdoor Rattan Sunbed,Kanya R.,20,182000,42.3%,Pending\n' +
      'INV-2026-010,2026-05-19,Korat Industrial Supply,Height Adjustable Desk,Somchai P.,22,227500,35.7%,Pending\n' +
      'INV-2026-012,2026-06-15,Silom Finance Tower,Ergonomic Office Chair X1,Alex Wong,60,220500,33.3%,Overdue\n' +
      'INV-2026-013,2026-06-25,Bangkok Design Hub,Height Adjustable Desk,Alex Wong,35,367500,36.7%,Overdue';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinFlow_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-4 md:px-6 flex items-center justify-between shrink-0 z-20 transition-colors gap-2 min-w-0">
      {/* Left Breadcrumb & Sidebar Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 shrink">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 dark:text-slate-500 min-w-0 truncate">
          <span className="hidden sm:inline shrink-0 font-medium">FinFlow BI</span>
          <span className="hidden sm:inline shrink-0">/</span>
          <span className="text-slate-900 dark:text-white font-bold truncate max-w-[160px] sm:max-w-[240px] md:max-w-[360px]" id="currentBreadcrumb">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Right Controls: Clean, spacious, and uncluttered */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
        {/* Global Search */}
        <div className="relative hidden xl:block w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="headerGlobalSearch"
            placeholder={lang === 'th' ? 'ค้นหาข้อมูล...' : 'Search records...'}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 transition"
          />
        </div>

        {/* AI Copilot Button */}
        {features.aiCopilot && (
          <button
            id="btnHeaderCopilot"
            onClick={onOpenCopilot}
            title="Open AI Copilot"
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-sm shadow-blue-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-100" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        )}

        {/* Upload Excel Button */}
        <button
          onClick={onOpenUpload}
          title="Upload Sage File"
          className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
        >
          <FileUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden md:inline">Import Sage</span>
          <span className="hidden sm:inline md:hidden">Import</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative shrink-0" ref={exportRef}>
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            title="Export Report"
            className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 z-50 space-y-1 shadow-lg">
              <button
                onClick={() => {
                  handleExportCsv();
                  setShowExportDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center space-x-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Export Dataset (.csv)</span>
              </button>
              <button
                onClick={() => {
                  handleExportPdf();
                  setShowExportDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center space-x-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
