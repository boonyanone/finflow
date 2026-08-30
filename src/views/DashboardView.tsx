import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileUp,
  Sparkles,
  Download,
  Calendar,
  User,
  Tag,
  BadgeCheck,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { InvoiceRecord, GlobalFilterState, UserProfile } from '../types';
import { downloadBlankStarterTemplateExcel } from '../utils/sampleExcelHelper';

// Sub-components (Pulse AI Modern Enterprise BI System)
import { KpiScorecards } from '../components/dashboard/KpiScorecards';
import { RevenueTargetChart } from '../components/dashboard/RevenueTargetChart';
import { AiInsightsConsole } from '../components/dashboard/AiInsightsConsole';
import { GrowthBarCard } from '../components/dashboard/GrowthBarCard';
import { RevenueChannelDonut } from '../components/dashboard/RevenueChannelDonut';
import { PerformanceScoreCard } from '../components/dashboard/PerformanceScoreCard';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { AdvanceToolsBar } from '../components/dashboard/AdvanceToolsBar';

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
  onSelectTab?: (tab: string) => void;
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
  onSelectTab = () => {},
}) => {
  const [showFilterBar, setShowFilterBar] = useState(false);

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
      { color: 'bg-indigo-600', text: 'text-indigo-600', bar: '#4f46e5' },
      { color: 'bg-cyan-500', text: 'text-cyan-600', bar: '#06b6d4' },
      { color: 'bg-emerald-500', text: 'text-emerald-600', bar: '#10b981' },
      { color: 'bg-amber-500', text: 'text-amber-600', bar: '#f59e0b' },
      { color: 'bg-purple-500', text: 'text-purple-600', bar: '#a855f7' },
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
    <div id="viewDashboard" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0 pb-12">
      {/* 1. TOP HEADER & QUICK FILTER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Home /</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Dashboard Overview</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60">
              PRO BI
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            ภาพรวมธุรกิจ &amp; สุขภาพการเงิน (Executive Hub)
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0 flex-wrap gap-y-1">
          <button
            onClick={() => setShowFilterBar(!showFilterBar)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center space-x-1.5 ${
              showFilterBar
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-300'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>ตัวกรองข้อมูล</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>นำเข้า Excel</span>
          </button>

          {isEmpty && onLoadDemoData && (
            <button
              onClick={onLoadDemoData}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>โหลดข้อมูล Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Toggleable Filter Strip */}
      {showFilterBar && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 flex-1 min-w-0">
            {/* Period Filter */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-xs">
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
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-xs">
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
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-xs">
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
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-3 py-2 text-xs">
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
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center space-x-1.5 transition cursor-pointer py-2 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตตัวกรอง</span>
          </button>
        </div>
      )}

      {/* 2. LEVEL 1: 4 KPI SCORECARDS (Pulse AI Aesthetic) */}
      <KpiScorecards
        totalNetSales={totalNetSales}
        grossProfit={grossProfit}
        marginPct={marginPct}
        totalCogs={totalCogs}
        totalPaidCash={totalPaidCash}
        collectionEfficiency={collectionEfficiency}
        totalOverdue={totalOverdue}
        overdueCount={overdueRecords.length}
        isSalesRep={isSalesRep}
        isEmpty={isEmpty}
        filteredCount={filteredData.length}
        onDrillDown={onDrillDown}
        filteredData={filteredData}
      />

      {/* 3. LEVEL 2: REVENUE & FORECAST + AI INSIGHTS CONSOLE (2-Column Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 w-full min-w-0">
        <div className="lg:col-span-2">
          <RevenueTargetChart monthlyData={monthlyChartData} isEmpty={isEmpty} />
        </div>
        <div className="lg:col-span-1">
          <AiInsightsConsole
            aiInsightText={aiInsightText}
            aiLoading={aiLoading}
            isEmpty={isEmpty}
            onOpenCopilot={onOpenCopilot}
          />
        </div>
      </div>

      {/* 4. LEVEL 3: 3-COLUMN MID BENTO (Growth Bar + Revenue Donut + Financial Health Gauge) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full min-w-0">
        <GrowthBarCard categoryBreakdown={categoryBreakdown} isEmpty={isEmpty} />
        <RevenueChannelDonut isEmpty={isEmpty} />
        <PerformanceScoreCard
          collectionEfficiency={collectionEfficiency}
          marginPct={marginPct}
          isEmpty={isEmpty}
        />
      </div>

      {/* 5. LEVEL 4: DEEP DRILLDOWN & ADVANCE STUDIO ACCESS BAR */}
      <AdvanceToolsBar onSelectTab={onSelectTab} onOpenUpload={onOpenUpload} />

      {/* 6. LEVEL 5: RECENT TRANSACTIONS & ACTIONABLE LEDGER TABLE */}
      <RecentTransactionsTable
        filteredData={filteredData}
        isSalesRep={isSalesRep}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => onFilterChange({ searchQuery: q })}
        onDrillDown={onDrillDown}
        onOpenDebtDraft={onOpenDebtDraft}
        isEmpty={isEmpty}
        onOpenUpload={onOpenUpload}
        onLoadDemoData={onLoadDemoData}
      />
    </div>
  );
};
