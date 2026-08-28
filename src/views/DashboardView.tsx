import React, { useState, useMemo } from 'react';
import {
  Banknote,
  TrendingUp,
  Target,
  Search,
  RotateCcw,
  Bot,
  ArrowRight,
  Calendar,
  User,
  Tag,
  BadgeCheck,
  AlertCircle,
  Wallet,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Sparkles,
  Lock,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  FileText,
  Receipt,
  BookOpen,
  FileUp,
  FileSpreadsheet,
  Download,
  Trash2,
  HelpCircle,
  Info,
  CheckCircle2,
  Zap,
  BarChart3,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from 'recharts';
import { InvoiceRecord, GlobalFilterState, UserProfile } from '../types';
import { downloadSiamCoolingDemoExcel, downloadBlankStarterTemplateExcel } from '../utils/sampleExcelHelper';

interface DashboardViewProps {
  invoices: InvoiceRecord[];
  filters: GlobalFilterState;
  onFilterChange: (filters: Partial<GlobalFilterState>) => void;
  onResetFilters: () => void;
  user: UserProfile;
  aiInsightText: string;
  aiLoading: boolean;
  onOpenCopilot: () => void;
  onDrillDown: (title: string, subtitle: string, filteredRecords: InvoiceRecord[]) => void;
  onOpenDebtDraft: (customer: string, invoiceNo: string, amount: number, overdueDays: number) => void;
  dataSourceMode?: 'empty' | 'demo' | 'imported';
  importedFileName?: string;
  onLoadDemoData?: () => void;
  onClearData?: () => void;
  onOpenUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  filters,
  onFilterChange,
  onResetFilters,
  user,
  aiInsightText,
  aiLoading,
  onOpenCopilot,
  onDrillDown,
  onOpenDebtDraft,
  dataSourceMode = 'empty',
  importedFileName = '',
  onLoadDemoData,
  onClearData,
  onOpenUpload,
}) => {
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

  // Security Masking: Sales Rep sees only their accounts & hidden cost/margin
  const isSalesRep = user.role === 'sales_rep';
  const accessibleInvoices =
    isSalesRep && user.accessibleRepName
      ? invoices.filter((inv) =>
          inv.salesRep.toLowerCase().includes(user.accessibleRepName!.toLowerCase())
        )
      : invoices;

  // Apply Global Filters
  const filteredData = useMemo(() => {
    return accessibleInvoices.filter((item) => {
      const matchPeriod = filters.period === 'all' || item.period === filters.period;
      const matchRep = filters.salesRep === 'all' || item.salesRep === filters.salesRep;
      const matchCat = filters.category === 'all' || item.category === filters.category;
      const matchStatus = filters.status === 'all' || item.status === filters.status;
      const search = filters.searchQuery.toLowerCase();
      const matchSearch =
        !search ||
        item.invoiceNo.toLowerCase().includes(search) ||
        item.customerName.toLowerCase().includes(search) ||
        item.itemDescription.toLowerCase().includes(search) ||
        item.salesRep.toLowerCase().includes(search);

      return matchPeriod && matchRep && matchCat && matchStatus && matchSearch;
    });
  }, [accessibleInvoices, filters]);

  // Calculate Metrics from Real Filtered Data
  const totalNetSales = useMemo(() => filteredData.reduce((acc, r) => acc + r.netAmount, 0), [filteredData]);
  const totalCogs = useMemo(() => filteredData.reduce((acc, r) => acc + r.cogs, 0), [filteredData]);
  const grossProfit = totalNetSales - totalCogs;
  const marginPct = totalNetSales > 0 ? ((grossProfit / totalNetSales) * 100).toFixed(1) : '0.0';

  const totalPaidCash = useMemo(() => filteredData.reduce((acc, r) => acc + (r.paidAmount || 0), 0), [filteredData]);
  const collectionEfficiency = totalNetSales > 0 ? ((totalPaidCash / totalNetSales) * 100).toFixed(1) : '0.0';

  const overdueRecords = useMemo(() => filteredData.filter((r) => r.status === 'Overdue'), [filteredData]);
  const totalOverdue = useMemo(() => overdueRecords.reduce((acc, r) => acc + r.outstandingAmount, 0), [overdueRecords]);
  const pendingRecords = useMemo(() => filteredData.filter((r) => r.status === 'Pending'), [filteredData]);
  const totalPending = useMemo(() => pendingRecords.reduce((acc, r) => acc + r.outstandingAmount, 0), [pendingRecords]);

  // Monthly Sales & Margin Data dynamically computed
  const monthlyChartData = useMemo(() => {
    if (filteredData.length === 0) {
      return [
        { month: 'ม.ค.', sales: 0, margin: 0, expenses: 0 },
        { month: 'ก.พ.', sales: 0, margin: 0, expenses: 0 },
        { month: 'มี.ค.', sales: 0, margin: 0, expenses: 0 },
        { month: 'เม.ย.', sales: 0, margin: 0, expenses: 0 },
        { month: 'พ.ค.', sales: 0, margin: 0, expenses: 0 },
        { month: 'มิ.ย.', sales: 0, margin: 0, expenses: 0 },
      ];
    }
    const map = new Map<string, { sales: number; cogs: number }>();
    filteredData.forEach((r) => {
      const m = r.month || 'ม.ค.';
      const curr = map.get(m) || { sales: 0, cogs: 0 };
      curr.sales += r.netAmount;
      curr.cogs += r.cogs;
      map.set(m, curr);
    });
    return Array.from(map.entries()).map(([month, data]) => {
      const margin = data.sales > 0 ? ((data.sales - data.cogs) / data.sales) * 100 : 0;
      return {
        month,
        sales: data.sales,
        expenses: data.cogs,
        margin: Number(margin.toFixed(1)),
      };
    });
  }, [filteredData]);

  // Category Breakdown dynamically computed
  const categoryBreakdown = useMemo(() => {
    if (filteredData.length === 0) return [];
    const catMap = new Map<string, number>();
    filteredData.forEach((r) => {
      const c = r.category || 'ทั่วไป';
      catMap.set(c, (catMap.get(c) || 0) + r.netAmount);
    });
    const total = Array.from(catMap.values()).reduce((a, b) => a + b, 0) || 1;
    const colorPalette = [
      { color: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400', bar: '#2563eb' },
      { color: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', bar: '#6366f1' },
      { color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bar: '#10b981' },
      { color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bar: '#f59e0b' },
      { color: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400', bar: '#a855f7' },
    ];
    return Array.from(catMap.entries()).map(([name, amount], idx) => ({
      name,
      amount,
      pct: Math.round((amount / total) * 100),
      color: colorPalette[idx % colorPalette.length].color,
      text: colorPalette[idx % colorPalette.length].text,
      bar: colorPalette[idx % colorPalette.length].bar,
    }));
  }, [filteredData]);

  const isEmpty = invoices.length === 0;

  return (
    <div id="viewSales" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0">
      {/* 1. DATA SOURCE STATUS / ONBOARDING BAR (Shown only in Clean State when no data is loaded) */}
      {isEmpty && (
        /* Streamlined & Compact Empty State Bar */
        <div className="rounded-xl p-3 sm:p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
              <FileSpreadsheet className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  เริ่มต้นใช้งาน FinFlow BI
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                  ยังไม่มีข้อมูล
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                นำเข้าไฟล์ Excel (.xlsx, .csv) หรือคลิกโหลด Demo Data เพื่อทดลองใช้งานระบบ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-stretch sm:self-auto">
            <button
              onClick={onOpenUpload}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>นำเข้าไฟล์ Excel</span>
            </button>

            {onLoadDemoData && (
              <button
                onClick={onLoadDemoData}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>โหลด Demo Data</span>
              </button>
            )}

            <button
              onClick={downloadBlankStarterTemplateExcel}
              className="hidden sm:flex items-center justify-center space-x-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-1.5 sm:py-2 rounded-lg text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="ดาวน์โหลดไฟล์แม่แบบ Excel สำหรับเตรียมข้อมูล"
            >
              <Download className="w-3.5 h-3.5" />
              <span>แม่แบบ</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. AI Executive Insight Card */}
      <div
        id="aiInsightBanner"
        className="rounded-xl p-3.5 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3"
      >
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
              <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                AI Executive Summary
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {isEmpty ? 'Standby' : 'Gemini AI Insight'}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenCopilot}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs group"
          >
            <Bot className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
            <span>เปิดแชต AI Copilot</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-500 transition-all" />
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-slate-50/80 dark:bg-slate-950/40 rounded-lg p-3 sm:p-3.5 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-[13px] leading-relaxed">
          {aiLoading ? (
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 animate-pulse py-1">
              <Bot className="w-4 h-4 animate-spin" />
              <span>ระบบกำลังประมวลผลสรุปวิเคราะห์ข้อมูลตัวเลขทางธุรกิจ...</span>
            </div>
          ) : isEmpty ? (
            <p className="text-slate-500 dark:text-slate-400">
              ระบบ AI Copilot พร้อมช่วยวิเคราะห์ยอดขาย, คาดการณ์กระแสเงินสด และร่างหนังสือทวงหนี้อัตโนมัติ ทันทีที่คุณนำเข้าไฟล์ข้อมูล
            </p>
          ) : (
            <div className="space-y-2.5">
              <p id="aiInsightText" className="text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                {aiInsightText}
              </p>

              {/* Quick Context Action Prompts */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">ถามด่วน:</span>
                <button
                  onClick={onOpenCopilot}
                  className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                >
                  <BarChart3 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>สรุปสินค้าทำกำไรสูงสุด</span>
                </button>
                <button
                  onClick={onOpenCopilot}
                  className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 dark:hover:text-amber-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                >
                  <AlertCircle className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                  <span>วิเคราะห์ลูกหนี้ค้างชำระ</span>
                </button>
                <button
                  onClick={onOpenCopilot}
                  className="inline-flex items-center space-x-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs"
                >
                  <Award className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>ผลงานพนักงานขาย</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Net Revenue */}
        <div
          onClick={() => {
            if (filteredData.length > 0) {
              onDrillDown(
                'เจาะลึกยอดขายสุทธิ (Total Revenue Drill-down)',
                'รายการใบแจ้งหนี้ทั้งหมดในชุดข้อมูลปัจจุบัน',
                filteredData
              );
            }
          }}
          className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-blue-300 dark:hover:border-blue-700 transition cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Total Net Revenue (YTD)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate" id="kpiSalesVal">
              ฿{totalNetSales.toLocaleString()}
            </div>
          </div>
          <div className="mt-3 flex items-center">
            {isEmpty ? (
              <span className="text-xs text-slate-400 font-medium">รอการนำเข้าข้อมูล</span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{filteredData.length} รายการที่บันทึก</span>
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Gross Profit & Cash Flow */}
        <div
          onClick={() => {
            if (!isSalesRep && filteredData.length > 0) {
              onDrillDown(
                'เจาะลึกกำไรขั้นต้น (Gross Profit Drill-down)',
                'วิเคราะห์ส่วนต่างราคาขายและต้นทุนสินค้า',
                filteredData
              );
            }
          }}
          className={`bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 transition flex flex-col justify-between shadow-sm ${
            isSalesRep ? '' : 'hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Gross Profit (กำไรขั้นต้น)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate" id="kpiProfitVal">
              {isSalesRep ? (
                <span className="inline-flex items-center gap-1 text-slate-400 text-base font-semibold">
                  <Lock className="w-4 h-4 text-slate-400" />
                  Masked
                </span>
              ) : (
                <>
                  ฿{grossProfit.toLocaleString()}{' '}
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ({marginPct}%)
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center">
            {isEmpty ? (
              <span className="text-xs text-slate-400 font-medium">รอการนำเข้าข้อมูล</span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>ต้นทุนรวม ฿{totalCogs.toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Margin Velocity */}
        <div
          onClick={() => {
            if (filteredData.length > 0) {
              onDrillDown(
                'วิเคราะห์ Profit Margin Velocity',
                'แนวโน้มความสามารถในการทำกำไรแยกตามกลุ่มสินค้า',
                filteredData
              );
            }
          }}
          className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Avg Profit Margin %
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate">
              {marginPct}% <span className="text-xs font-normal text-slate-400">YTD</span>
            </div>
          </div>
          <div className="mt-3 flex items-center">
            {isEmpty ? (
              <span className="text-xs text-slate-400 font-medium">รอการนำเข้าข้อมูล</span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                <span>ประสิทธิภาพการเก็บเงิน {collectionEfficiency}%</span>
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Overdue Liabilities / AR Aging */}
        <div
          id="kpiCardAr"
          onClick={() => {
            if (overdueRecords.length > 0) {
              onDrillDown(
                'เจาะลึกลูกหนี้ค้างชำระ (Accounts Receivable Drill-down)',
                'บิลที่เกินกำหนดชำระและต้องเร่งรัดติดตาม',
                overdueRecords
              );
            }
          }}
          className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-rose-300 dark:hover:border-rose-700 transition cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                AR Overdue (หนี้ค้างชำระ)
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate" id="kpiARVal">
              ฿{totalOverdue.toLocaleString()}
            </div>
          </div>
          <div className="mt-3 flex items-center">
            {isEmpty ? (
              <span className="text-xs text-slate-400 font-medium">รอการนำเข้าข้อมูล</span>
            ) : totalOverdue > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{overdueRecords.length} บิลเกินกำหนดชำระ</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ไม่มีหนี้เกินกำหนด</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Charts & Liquidity Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
        {/* Left 2 Cols: Cash Flow Dynamics & Predictive Yields Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 w-full min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                  Cash Flow Dynamics &amp; Margin Velocity
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {isEmpty
                    ? 'แผนภูมิแสดงแนวโน้มรายได้และกำไรขั้นต้น (จะปรากฏอัตโนมัติเมื่อนำเข้าข้อมูล)'
                    : 'ทิศทางรายได้, ต้นทุนสินค้า และแนวโน้มอัตรากำไรขั้นต้นรายเดือน'}
                </p>
              </div>
              {/* Legend Badges */}
              <div className="flex items-center space-x-3 text-xs shrink-0">
                <span className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                  <span>Net Revenue</span>
                </span>
                <span className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-sm"></span>
                  <span>Expenses (COGS)</span>
                </span>
                <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                  <span>Margin %</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis
                    yAxisId="left"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#10b981"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(val: any, name: any) => [
                      name === 'sales'
                        ? `฿${Number(val).toLocaleString()}`
                        : name === 'expenses'
                        ? `฿${Number(val).toLocaleString()}`
                        : `${val}%`,
                      name === 'sales'
                        ? 'Net Revenue'
                        : name === 'expenses'
                        ? 'Expenses (COGS)'
                        : 'Gross Margin %',
                    ]}
                  />
                  <Bar yAxisId="left" dataKey="expenses" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="margin"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Mini Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Net YTD</span>
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">฿{totalNetSales.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total COGS</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">฿{totalCogs.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Average Margin</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{marginPct}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Collection Rate</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{collectionEfficiency}%</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cash Collection & Liquidity Position + Revenue Allocation */}
        <div className="space-y-4 w-full min-w-0">
          {/* Cash Flow & Realized Liquidity Card */}
          <div className="bg-gradient-to-br from-slate-900 via-[#131d31] to-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between h-48 relative overflow-hidden border border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold tracking-tight text-slate-200">
                  Realized Cash &amp; Liquidity
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{collectionEfficiency}% Collected</span>
              </span>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">เงินสดรับชำระสุทธิ (Collected Cash)</div>
              <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                ฿{totalPaidCash.toLocaleString()}<span className="text-sm font-normal text-slate-400">.00</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 border-t border-slate-800/90 pt-2.5">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block font-medium">ลูกหนี้รอเก็บ (Pending)</span>
                <span className="font-bold text-amber-300 text-xs">฿{totalPending.toLocaleString()}</span>
              </div>
              <div className="min-w-0 text-right">
                <span className="text-[10px] text-slate-400 block font-medium">เกินกำหนด (Overdue)</span>
                <span className="font-bold text-rose-400 text-xs">฿{totalOverdue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Revenue & Asset Allocation Breakdown */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Revenue by Category Allocation
                </h4>
                <p className="text-[11px] text-slate-400">สัดส่วนรายได้แยกตามหมวดหมู่สินค้า</p>
              </div>
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Multi-segmented Progress Bar */}
            {categoryBreakdown.length > 0 ? (
              <>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 mb-4 gap-0.5">
                  {categoryBreakdown.map((cat) => (
                    <div
                      key={cat.name}
                      className={`h-full ${cat.color}`}
                      style={{ width: `${Math.max(cat.pct, 4)}%` }}
                      title={`${cat.name}: ${cat.pct}%`}
                    />
                  ))}
                </div>

                {/* Breakdown List */}
                <div className="space-y-2.5 text-xs">
                  {categoryBreakdown.map((cat) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <span className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0`}></span>
                        <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{cat.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-bold text-slate-900 dark:text-white">฿{cat.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-semibold w-7 text-right">{cat.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                ยังไม่มีข้อมูลหมวดหมู่สินค้า
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Filter Strip & Search Bar */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 flex-1 min-w-0">
          {/* Period Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-xs min-w-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="filterPeriod"
              value={filters.period}
              onChange={(e) => onFilterChange({ period: e.target.value })}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer w-full truncate font-medium"
            >
              <option value="all">รอบระยะเวลา: ทั้งหมด (YTD 2026)</option>
              <option value="q1">Q1 (ม.ค. - มี.ค. 2026)</option>
              <option value="q2">Q2 (เม.ย. - มิ.ย. 2026)</option>
            </select>
          </div>

          {/* Sales Rep Filter */}
          {!isSalesRep && (
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-xs min-w-0">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                id="filterRep"
                value={filters.salesRep}
                onChange={(e) => onFilterChange({ salesRep: e.target.value })}
                className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer w-full truncate font-medium"
              >
                <option value="all">พนักงานขาย: ทุกคน (All Reps)</option>
                <option value="Alex Wong">Alex Wong (กทม./ปริมณฑล)</option>
                <option value="Somchai P.">Somchai P. (ภาคเหนือ/อีสาน)</option>
                <option value="Kanya R.">Kanya R. (ภาคใต้)</option>
              </select>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-xs min-w-0">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="filterCat"
              value={filters.category}
              onChange={(e) => onFilterChange({ category: e.target.value })}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer w-full truncate font-medium"
            >
              <option value="all">หมวดหมู่สินค้า: ทั้งหมด</option>
              <option value="Sandwich Panel">Sandwich Panel (แผ่นฉนวน)</option>
              <option value="Cold Room Door">Cold Room Door (ประตูห้องเย็น)</option>
              <option value="Refrigeration">Refrigeration (เครื่องทำความเย็น)</option>
              <option value="Accessories">Accessories (อุปกรณ์และฉนวน)</option>
              <option value="Furniture">Furniture (เฟอร์นิเจอร์)</option>
              <option value="Wood Craft">Wood Craft (ไม้สัก)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-xs min-w-0">
            <BadgeCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              id="filterStatus"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer w-full truncate font-medium"
            >
              <option value="all">สถานะบิล: ทั้งหมด</option>
              <option value="Paid">ชำระแล้ว (Settled)</option>
              <option value="Pending">รอเรียกเก็บ (Pending)</option>
              <option value="Overdue">ค้างชำระ (Overdue)</option>
            </select>
          </div>
        </div>

        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center space-x-1.5 transition cursor-pointer py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 self-center lg:self-center"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>รีเซ็ตตัวกรอง</span>
        </button>
      </div>

      {/* 6. Recent Ledger & Asset Transactions Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
              Recent Ledger &amp; Invoice Transactions
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isEmpty
                ? 'ตารางรายการใบแจ้งหนี้ (จะแสดงผลอัตโนมัติเมื่อนำเข้าข้อมูล)'
                : `แสดง ${filteredData.length} รายการตามเงื่อนไขตัวกรอง`}
            </p>
          </div>
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="ค้นหาเลขที่บิล, ลูกค้า, สินค้า..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar w-full min-w-0 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[750px]">
            <thead className="bg-slate-50/90 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3 w-8 text-center"></th>
                <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">Invoice No</th>
                <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">Date</th>
                <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">Customer Name</th>
                <th className="py-3 px-3.5 sm:px-4 whitespace-nowrap">Category &amp; Item</th>
                <th className="py-3 px-3.5 sm:px-4 text-center whitespace-nowrap">Sales Rep</th>
                <th className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap">Qty</th>
                <th className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap">Net Amount</th>
                {!isSalesRep && <th className="py-3 px-3.5 sm:px-4 text-right whitespace-nowrap">Gross Margin</th>}
                <th className="py-3 px-3.5 sm:px-4 text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-transparent">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={isSalesRep ? 9 : 10} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {isEmpty ? 'ยังไม่มีข้อมูลรายการใบแจ้งหนี้ในระบบ' : 'ไม่พบรายการที่ตรงกับเงื่อนไขตัวกรอง'}
                      </div>
                      {isEmpty && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={onOpenUpload}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            + นำเข้าไฟล์ Excel ของคุณ
                          </button>
                          {onLoadDemoData && (
                            <>
                              <span className="text-slate-300 dark:text-slate-700">•</span>
                              <button
                                onClick={onLoadDemoData}
                                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                              >
                                ✨ โหลดข้อมูลตัวอย่าง DEMO
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((r) => {
                  let badge = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60';
                  if (r.status === 'Pending') badge = 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60';
                  if (r.status === 'Overdue') badge = 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60';

                  const initials = r.customerName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  const isExpanded = expandedInvoiceId === r.id;

                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        onClick={() => toggleExpand(r.id)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer ${
                          isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        {/* Expand Toggle Button */}
                        <td className="py-3 px-2 text-center" onClick={(e) => toggleExpand(r.id, e)}>
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="คลี่ดูรายละเอียดทางบัญชีและการชำระเงิน"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Invoice No */}
                        <td className="py-3 px-3.5 sm:px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {r.invoiceNo}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3.5 sm:px-4 text-slate-400 whitespace-nowrap">{r.date}</td>

                        {/* Customer */}
                        <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {initials}
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{r.customerName}</span>
                          </div>
                        </td>

                        {/* Category & Item */}
                        <td className="py-3 px-3.5 sm:px-4 text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mr-1.5 whitespace-nowrap border border-slate-200/60 dark:border-slate-700/60">
                            {r.category}
                          </span>
                          <span>{r.itemDescription}</span>
                        </td>

                        {/* Sales Rep */}
                        <td className="py-3 px-3.5 sm:px-4 text-center text-slate-500 whitespace-nowrap">{r.salesRep}</td>

                        {/* Qty */}
                        <td className="py-3 px-3.5 sm:px-4 text-right font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {r.quantity}
                        </td>

                        {/* Net Amount */}
                        <td className="py-3 px-3.5 sm:px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap font-mono">
                          ฿{r.netAmount.toLocaleString()}
                        </td>

                        {/* Margin % */}
                        {!isSalesRep && (
                          <td className="py-3 px-3.5 sm:px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">
                            {r.marginPct}%
                          </td>
                        )}

                        {/* Status */}
                        <td className="py-3 px-3.5 sm:px-4 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>
                            {r.status === 'Paid' ? 'Settled' : r.status}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable Accounting & Transaction Detail Sub-Panel */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                          <td colSpan={isSalesRep ? 9 : 10} className="p-3 sm:p-4">
                            <div className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 space-y-4 shadow-xs">
                              {/* Sub-panel Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/70 pb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                                    <Receipt className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                        ใบแจ้งหนี้ / ใบกำกับภาษี: {r.invoiceNo}
                                      </h4>
                                      <button
                                        onClick={(e) => handleCopyInvoice(r.invoiceNo, e)}
                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition"
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
                                      ลูกค้า: <strong>{r.customerName}</strong> ({r.customerId}) | วันที่ออกเอกสาร: {r.date} | วันครบกำหนด: {r.dueDate}
                                    </p>
                                  </div>
                                </div>

                                {/* Quick Action Buttons */}
                                <div className="flex items-center flex-wrap gap-2 shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDrillDown(
                                        `รายละเอียดบิล ${r.invoiceNo}`,
                                        `ลูกค้า: ${r.customerName} | พนักงานขาย: ${r.salesRep}`,
                                        [r]
                                      );
                                    }}
                                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>เปิดหน้าต่างเจาะลึก</span>
                                  </button>

                                  {(r.status === 'Overdue' || r.status === 'Pending') && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenDebtDraft(
                                          r.customerName,
                                          r.invoiceNo,
                                          r.outstandingAmount,
                                          r.overdueDays
                                        );
                                      }}
                                      className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 hover:bg-amber-100 transition cursor-pointer"
                                    >
                                      <Bot className="w-3.5 h-3.5 text-amber-600" />
                                      <span>ร่างหนังสือทวงถาม AI</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* 4 Financial & Accounting Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* Card 1: Pricing & Line Item Breakdown */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                    <Receipt className="w-3 h-3 text-blue-500" />
                                    <span>โครงสร้างราคา &amp; ภาษี</span>
                                  </span>
                                  <div className="text-xs space-y-1 pt-1 font-mono">
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>ราคาต่อหน่วย:</span>
                                      <span>฿{r.unitPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>จำนวน:</span>
                                      <span>{r.quantity} หน่วย</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>ยอดก่อนภาษี:</span>
                                      <span>฿{r.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                                      <span>฿{r.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-slate-900 dark:text-white border-t border-slate-200/80 dark:border-slate-700 pt-1">
                                      <span>ยอดสุทธิ (Total):</span>
                                      <span className="text-blue-600 dark:text-blue-400">฿{r.netAmount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Card 2: Cost of Goods Sold & Margins (Masked for Sales Rep) */}
                                {!isSalesRep ? (
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                                      <span>ต้นทุน &amp; กำไรขั้นต้น (Profitability)</span>
                                    </span>
                                    <div className="text-xs space-y-1 pt-1 font-mono">
                                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>ต้นทุนขาย (COGS):</span>
                                        <span className="text-slate-500">฿{r.cogs.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                                        <span>กำไรขั้นต้น (Gross Profit):</span>
                                        <span>฿{r.grossProfit.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300">
                                        <span>อัตรากำไร (Margin %):</span>
                                        <span>{r.marginPct}%</span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-700">
                                        คำนวณจากวิธีต้นทุนมาตรฐาน FIFO
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5 flex flex-col justify-between">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                      <Lock className="w-3 h-3 text-amber-500" />
                                      <span>ข้อมูลต้นทุน (จำกัดสิทธิ์)</span>
                                    </span>
                                    <div className="text-xs text-slate-500 py-2">
                                      ข้อมูลต้นทุนและอัตรากำไรขั้นต้นถูกสงวนสิทธิ์เฉพาะฝ่ายบริหารและฝ่ายการเงิน
                                    </div>
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                      Role: Sales Representative
                                    </div>
                                  </div>
                                )}

                                {/* Card 3: Settlement & Cash Collection Status */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                    <Wallet className="w-3 h-3 text-indigo-500" />
                                    <span>สถานะการชำระเงิน (Settlement)</span>
                                  </span>
                                  <div className="text-xs space-y-1 pt-1 font-mono">
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>รับชำระแล้ว (Paid):</span>
                                      <span className="font-bold text-emerald-600">฿{(r.paidAmount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                      <span>ยอดค้างชำระ (Balance):</span>
                                      <span className={`font-bold ${r.outstandingAmount > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                                        ฿{(r.outstandingAmount || 0).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>วันครบกำหนด (Due):</span>
                                      <span>{r.dueDate}</span>
                                    </div>
                                    <div className="pt-1 border-t border-slate-200/80 dark:border-slate-700 text-[10px]">
                                      {r.status === 'Overdue' ? (
                                        <span className="text-rose-600 font-bold">
                                          ⚠ เกินกำหนด {r.overdueDays} วัน (ติดตามเร่งด่วน)
                                        </span>
                                      ) : r.status === 'Pending' ? (
                                        <span className="text-amber-600 font-medium">
                                          ⏳ อยู่ในกำหนดเครดิตเทอมปกติ
                                        </span>
                                      ) : (
                                        <span className="text-emerald-600 font-bold">
                                          ✓ ชำระครบถ้วน ปิดยอดแล้ว
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Card 4: Sage 50 ERP GL Journal Reference */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                                    <BookOpen className="w-3 h-3 text-purple-500" />
                                    <span>บันทึกสมุดรายวัน Sage 50 (GL)</span>
                                  </span>
                                  <div className="text-[11px] space-y-1 pt-1 font-mono text-slate-600 dark:text-slate-300">
                                    <div className="flex justify-between">
                                      <span>Dr. 11300 ลูกหนี้การค้า</span>
                                      <span>฿{r.netAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>Cr. 41000 รายได้จากการขาย</span>
                                      <span>฿{r.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                      <span>Cr. 21500 ภาษีขาย</span>
                                      <span>฿{r.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-1 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                                      <span>รหัสสินค้า: {r.itemCode}</span>
                                      <span className="font-bold text-emerald-600">Reconciled ✓</span>
                                    </div>
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
    </div>
  );
};
