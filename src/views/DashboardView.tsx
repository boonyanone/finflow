import React from 'react';
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
  CreditCard,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Sparkles,
  Lock,
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
}) => {
  // Security Masking: Sales Rep sees only their accounts & hidden cost/margin
  const isSalesRep = user.role === 'sales_rep';
  const accessibleInvoices =
    isSalesRep && user.accessibleRepName
      ? invoices.filter((inv) =>
          inv.salesRep.toLowerCase().includes(user.accessibleRepName!.toLowerCase())
        )
      : invoices;

  // Apply Global Filters
  const filteredData = accessibleInvoices.filter((item) => {
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

  // Calculate Metrics
  const totalNetSales = filteredData.reduce((acc, r) => acc + r.netAmount, 0);
  const totalCogs = filteredData.reduce((acc, r) => acc + r.cogs, 0);
  const grossProfit = totalNetSales - totalCogs;
  const marginPct = totalNetSales > 0 ? ((grossProfit / totalNetSales) * 100).toFixed(1) : '41.1';

  const overdueRecords = filteredData.filter((r) => r.status === 'Overdue');
  const totalOverdue = overdueRecords.reduce((acc, r) => acc + r.outstandingAmount, 0);

  // Monthly Sales & Margin Data for Velocity Chart
  const monthlyChartData = [
    { month: 'Jan', sales: 225750, margin: 42.6, expenses: 130000, projected: 240000 },
    { month: 'Feb', sales: 112000, margin: 43.8, expenses: 65000, projected: 120000 },
    { month: 'Mar', sales: 192500, margin: 36.4, expenses: 122000, projected: 200000 },
    { month: 'Apr', sales: 237125, margin: 46.7, expenses: 128000, projected: 250000 },
    { month: 'May', sales: 409500, margin: 39.0, expenses: 249000, projected: 420000 },
    { month: 'Jun', sales: 588000, margin: 35.0, expenses: 382000, projected: 600000 },
  ];

  // Category Breakdown Data
  const categoryBreakdown = [
    { name: 'Furniture (สำนักงาน)', pct: 58, amount: 1075900, color: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' },
    { name: 'Wood Craft (ไม้สัก)', pct: 16, amount: 296800, color: 'bg-teal-600', text: 'text-teal-600 dark:text-teal-400' },
    { name: 'Outdoor (กลางแจ้ง)', pct: 17, amount: 315350, color: 'bg-emerald-400', text: 'text-emerald-500 dark:text-emerald-300' },
    { name: 'Acoustic (แผ่นเก็บเสียง)', pct: 9, amount: 166950, color: 'bg-lime-600', text: 'text-lime-600 dark:text-lime-400' },
  ];

  return (
    <div id="viewSales" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0">
      {/* 1. AI Executive Insight Banner */}
      <div
        id="aiInsightBanner"
        className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-white dark:from-blue-950/25 dark:via-indigo-950/15 dark:to-[#0f172a] border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-start sm:items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                FinFlow Executive Financial Copilot
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Live Data Synchronized
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed" id="aiInsightText">
              {aiLoading ? (
                <span className="animate-pulse">กำลังประมวลผลข้อมูลตัวเลขทางธุรกิจ...</span>
              ) : (
                <>
                  ภาพรวมยอดขาย YTD สุทธิรวม{' '}
                  <strong className="text-slate-900 dark:text-white font-bold" id="aiNetSalesHighlight">
                    ฿{totalNetSales > 0 ? totalNetSales.toLocaleString() : '1,855,000'}
                  </strong>{' '}
                  อัตรากำไรเฉลี่ย{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold" id="aiMarginHighlight">
                    {marginPct}%
                  </strong>{' '}
                  พบลูกหนี้เกินกำหนดชำระ 2 รายการ (฿39,700) แนะนำให้ใช้ฟีเจอร์ AI ร่างข้อความแจ้งเตือนอัตโนมัติ
                </>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenCopilot}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center space-x-1.5 cursor-pointer shrink-0 self-end sm:self-center px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700/60 transition shadow-2xs"
        >
          <span>เปิด AI Copilot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. KPI Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Net Revenue */}
        <div
          onClick={() =>
            onDrillDown(
              'เจาะลึกยอดขายสุทธิ (Total Revenue Drill-down)',
              'รายการใบแจ้งหนี้ทั้งหมดในชุดข้อมูลปัจจุบัน',
              filteredData
            )
          }
          className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-blue-300 dark:hover:border-blue-700 transition cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Total Net Worth / Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate" id="kpiSalesVal">
              ฿{totalNetSales > 0 ? totalNetSales.toLocaleString() : '1,855,000'}
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>+14.8% vs last quarter</span>
            </span>
          </div>
        </div>

        {/* KPI 2: Gross Profit & Cash Flow */}
        <div
          onClick={() => {
            if (!isSalesRep) {
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
                Monthly Cash Flow / Gross Profit
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
                  ฿{grossProfit > 0 ? grossProfit.toLocaleString() : '762,400'}{' '}
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    ({marginPct}% margin)
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
              <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Target Met (Stable)</span>
            </span>
          </div>
        </div>

        {/* KPI 3: Margin Velocity */}
        <div
          onClick={() =>
            onDrillDown(
              'วิเคราะห์ Profit Margin Velocity',
              'แนวโน้มความสามารถในการทำกำไรแยกตามกลุ่มสินค้า',
              filteredData
            )
          }
          className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Profit Margin Velocity
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
              <span>+2.1% above benchmark</span>
            </span>
          </div>
        </div>

        {/* KPI 4: Overdue Liabilities / AR Aging */}
        <div
          id="kpiCardAr"
          onClick={() =>
            onDrillDown(
              'เจาะลึกลูกหนี้ค้างชำระ (Accounts Receivable Drill-down)',
              'บิลที่เกินกำหนดชำระและต้องเร่งรัดติดตาม',
              overdueRecords
            )
          }
          className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-rose-300 dark:hover:border-rose-700 transition cursor-pointer flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                AR Overdue / Active Liabilities
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight mt-1 truncate" id="kpiARVal">
              ฿{totalOverdue > 0 ? totalOverdue.toLocaleString() : '39,700'}
            </div>
          </div>
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>2 บิลเกินกำหนด (&gt;60 วัน)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. Charts & Liquidity Breakdown Grid */}
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
                  Dynamic revenue trajectory &amp; margin trendlines (Q1 - Q2 2026)
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
                    domain={[20, 60]}
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
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">฿1,855,000</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total COGS</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">฿1,092,600</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Average Margin</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">41.1%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Predicted Q3</span>
              <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">฿2.4M</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Treasury Reserve Card & Revenue Allocation */}
        <div className="space-y-4 w-full min-w-0">
          {/* Hero Treasury Card */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white flex flex-col justify-between h-48 relative overflow-hidden border border-indigo-900/60 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-blue-300" />
                <span className="text-xs font-semibold tracking-wide text-blue-100">
                  Treasury Liquid Reserve
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active
              </span>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-medium">Card Balance / Treasury Fund</div>
              <div className="text-2xl font-black tracking-tight text-white mt-0.5">
                ฿1,248,560<span className="text-sm font-normal text-slate-400">.00</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
              <span>•••• •••• •••• 8842</span>
              <span>12/28</span>
            </div>
          </div>

          {/* Revenue & Asset Allocation Breakdown */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  Revenue by Category Allocation
                </h4>
                <p className="text-[11px] text-slate-400">สัดส่วนรายได้แยกตามประเภทสินค้า</p>
              </div>
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Multi-segmented Progress Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 mb-4 gap-0.5">
              <div className="h-full bg-blue-600" style={{ width: '58%' }} title="Furniture: 58%"></div>
              <div className="h-full bg-indigo-500" style={{ width: '16%' }} title="Wood Craft: 16%"></div>
              <div className="h-full bg-emerald-500" style={{ width: '17%' }} title="Outdoor: 17%"></div>
              <div className="h-full bg-amber-500" style={{ width: '9%' }} title="Acoustic: 9%"></div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5 text-xs">
              {categoryBreakdown.map((cat, idx) => {
                const colors = ['bg-blue-600', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'];
                const dotColor = colors[idx % colors.length];
                return (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`}></span>
                      <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">฿{cat.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-semibold w-7 text-right">{cat.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Strip & Search Bar */}
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
              <option value="Furniture">Furniture (เฟอร์นิเจอร์)</option>
              <option value="Wood Craft">Wood Craft (ไม้สัก)</option>
              <option value="Outdoor">Outdoor (กลางแจ้ง)</option>
              <option value="Acoustic">Acoustic (แผ่นเก็บเสียง)</option>
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

      {/* 5. Recent Ledger & Asset Transactions Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
              Recent Ledger &amp; Asset Transactions
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Detailed breakdown synchronized with Sage 50 ERP
            </p>
          </div>
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              placeholder="Search transactions..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar w-full min-w-0 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[700px]">
            <thead className="bg-slate-50/90 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
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
                  <td colSpan={isSalesRep ? 8 : 9} className="text-center py-8 text-slate-400">
                    ไม่พบรายการที่ตรงกับเงื่อนไขตัวกรอง
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

                  return (
                    <tr
                      key={r.id}
                      onClick={() =>
                        onDrillDown(`รายละเอียดบิล ${r.invoiceNo}`, `ลูกค้า: ${r.customerName} | พนักงานขาย: ${r.salesRep}`, [r])
                      }
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                    >
                      <td className="py-3 px-3.5 sm:px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">{r.invoiceNo}</td>
                      <td className="py-3 px-3.5 sm:px-4 text-slate-400 whitespace-nowrap">{r.date}</td>
                      <td className="py-3 px-3.5 sm:px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {initials}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{r.customerName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 sm:px-4 text-slate-600 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mr-1.5 whitespace-nowrap border border-slate-200/60 dark:border-slate-700/60">
                          {r.category}
                        </span>
                        <span>{r.itemDescription}</span>
                      </td>
                      <td className="py-3 px-3.5 sm:px-4 text-center text-slate-500 whitespace-nowrap">{r.salesRep}</td>
                      <td className="py-3 px-3.5 sm:px-4 text-right font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{r.quantity}</td>
                      <td className="py-3 px-3.5 sm:px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap font-mono">
                        ฿{r.netAmount.toLocaleString()}
                      </td>
                      {!isSalesRep && (
                        <td className="py-3 px-3.5 sm:px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {r.marginPct}%
                        </td>
                      )}
                      <td className="py-3 px-3.5 sm:px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>
                          {r.status === 'Paid' ? 'Settled' : r.status}
                        </span>
                      </td>
                    </tr>
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

