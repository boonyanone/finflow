import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  FileUp,
  Download,
  Menu,
  PanelLeftOpen,
  Search,
  ChevronDown,
  Printer,
  LayoutGrid,
  Clock,
  Boxes,
  GitMerge,
  Sliders,
  FileSpreadsheet,
  Database,
  Shield,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { FeatureToggles, ThemeConfig } from '../types';

interface HeaderProps {
  activeTab: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  lang?: 'th' | 'en';
  onToggleLang?: () => void;
  onOpenCopilot: () => void;
  onOpenUpload: () => void;
  onOpenDataHealth?: () => void;
  features: FeatureToggles;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  themeConfig?: ThemeConfig;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenCopilot,
  onOpenUpload,
  onOpenDataHealth,
  features,
  isSidebarOpen = true,
  onToggleSidebar,
  themeConfig,
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

  const getViewDetails = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Sales & Margin Hub (ยอดขายและกำไร)',
          subtitle: 'Financial Analytics • Sage 50 Multi-Company Consolidation',
          icon: <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      case 'ar-aging':
        return {
          title: 'A/R Aging (วิเคราะห์ลูกหนี้และการเรียกเก็บ)',
          subtitle: 'วิเคราะห์โครงสร้างอายุหนี้ วงเงินสินเชื่อ และสถานะหนี้ค้างชำระ',
          icon: <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      case 'inventory':
        return {
          title: 'Inventory Valuation (มูลค่าสินค้าคงคลัง)',
          subtitle: 'มูลค่าสินค้าคงคลัง อัตราหมุนเวียน (Turnover) และจุดสั่งซื้อซ้ำ',
          icon: <Boxes className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      case 'report-studio':
        return {
          title: 'Ad-Hoc Report Studio (สตูดิโอสร้างรายงาน)',
          subtitle: 'เครื่องมือสร้างรายงานอิสระแบบ Drag-and-Drop Pivot Matrix',
          icon: <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      case 'standard-reports':
        return {
          title: 'รายงานมาตรฐาน (Standard Reports)',
          subtitle: 'คลังรายงานสำเร็จรูป 10 หมวดพร้อมพิมพ์และส่งออกทันที',
          icon: <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      case 'settings':
      case 'data-hub':
      case 'odbc-sync':
      case 'field-mapping':
        return {
          title: 'System Administration & Data Center (ศูนย์จัดการระบบ)',
          subtitle: 'Data Hub นำเข้าไฟล์, Connectors & Sync Agent, กฎ Schema Mapping, สิทธิ์ผู้ใช้ (RBAC) และธีมระบบ',
          icon: <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
        };
      case 'sales-commission':
        return {
          title: 'Sales Target, Quotas & Commission Tracker',
          subtitle: 'ติดตามผลงานพนักงานขาย บรรลุเป้ารายบุคคล และคำนวณคอมมิชชั่นขั้นบันได',
          icon: <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      case 'executive-alerts':
        return {
          title: 'Smart Risk Alerts & Executive Digest Studio',
          subtitle: 'ตรวจจับความเสี่ยงทางการเงิน 5 ด้าน และสตูดิโอสร้างบทสรุปผู้บริหาร',
          icon: <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      case 'cash-flow':
        return {
          title: 'Cash Flow Projection & What-If Simulator',
          subtitle: 'แบบจำลองสภาพคล่องเงินสดรับล่วงหน้า 12 สัปดาห์ และการจำลองสถานการณ์ความเสี่ยง',
          icon: <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
      default:
        return {
          title: 'Sales & Margin Hub (ยอดขายและกำไร)',
          subtitle: 'Financial Analytics • Sage 50 Multi-Company Consolidation',
          icon: <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
        };
    }
  };

  const currentView = getViewDetails();

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
    link.setAttribute('download', `${themeConfig?.brandName || 'FinFlow'}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <header className="h-16 bg-transparent px-4 sm:px-6 md:px-8 flex items-center justify-between shrink-0 z-20 transition-colors gap-3 min-w-0">
      {/* Left Active View Info & Mobile/Collapsed Sidebar Toggle */}
      <div className="flex items-center space-x-3 min-w-0 shrink">
        {onToggleSidebar && (!isSidebarOpen ? (
          <button
            onClick={onToggleSidebar}
            aria-label="Open navigation menu"
            title="ขยายเมนู (Expand Sidebar)"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition shrink-0 cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        ) : (
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu on mobile"
            className="lg:hidden text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition shrink-0 cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
        ))}

        <div className="flex items-center space-x-3 min-w-0 truncate">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base text-slate-900 dark:text-white font-bold truncate leading-tight tracking-tight" id="currentBreadcrumb">
              {currentView.title}
            </h1>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
              {currentView.subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        {/* Data Integrity & Health Badge */}
        {onOpenDataHealth && (
          <button
            onClick={onOpenDataHealth}
            title="ตรวจสอบคุณภาพข้อมูลและงบทดลอง (Data Health Inspector)"
            className="flex items-center space-x-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Data Health:</span>
            <span className="font-mono">100%</span>
            <span className="hidden lg:inline font-normal text-[11px] opacity-90">Reconciled</span>
          </button>
        )}

        {/* Global Search */}
        <div className="relative hidden xl:block w-48">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="headerGlobalSearch"
            placeholder="ค้นหารายการ..."
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>

        {/* AI Copilot Button */}
        {features.aiCopilot && (
          <button
            id="btnHeaderCopilot"
            onClick={onOpenCopilot}
            title="Open AI Copilot"
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>
        )}

        {/* Upload Excel Button */}
        <button
          onClick={onOpenUpload}
          title="นำเข้าไฟล์ Excel / CSV"
          className="flex items-center space-x-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0"
        >
          <FileUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span className="hidden md:inline">Import Excel</span>
          <span className="hidden sm:inline md:hidden">Import</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative shrink-0" ref={exportRef}>
          <button
            onClick={() => setShowExportDropdown(!showExportDropdown)}
            title="Export Report"
            className="flex items-center space-x-1 sm:space-x-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showExportDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#141e35] border border-slate-200 dark:border-slate-700 rounded-xl p-1.5 z-50 space-y-1 shadow-xl">
              <button
                onClick={() => {
                  handleExportCsv();
                  setShowExportDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center space-x-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Export Dataset (.csv)</span>
              </button>
              <button
                onClick={() => {
                  handleExportPdf();
                  setShowExportDropdown(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center space-x-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
