import React, { useState, useMemo } from 'react';
import {
  Award,
  Target,
  DollarSign,
  TrendingUp,
  Percent,
  Users,
  ShieldCheck,
  Download,
  RotateCcw,
  Sliders,
  Sparkles,
  Bot,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Star,
  Trophy,
  BarChart3,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  FileSpreadsheet,
  HelpCircle,
  Clock,
  ArrowUpRight,
  BadgePercent,
  Receipt,
  Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
} from 'recharts';
import * as XLSX from 'xlsx';
import {
  InvoiceRecord,
  Customer,
  SalesTargetItem,
  CommissionSchemeConfig,
  SalesRepAttainment,
} from '../types';

interface SalesTargetCommissionViewProps {
  invoices: InvoiceRecord[];
  customers: Customer[];
  onOpenCopilot?: () => void;
}

export const SalesTargetCommissionView: React.FC<SalesTargetCommissionViewProps> = ({
  invoices,
  customers,
  onOpenCopilot,
}) => {
  // 1. Initial Default Targets by Sales Rep
  const initialTargets: Record<string, SalesTargetItem> = {
    'สมชาย ยอดขายดี': {
      salesRep: 'สมชาย ยอดขายดี',
      targetRevenue: 1500000,
      targetGrossMarginPct: 38.0,
      targetNewAccounts: 5,
      period: '2026-Q1',
      department: 'Enterprise Sales',
    },
    'วิภา บริการเด่น': {
      salesRep: 'วิภา บริการเด่น',
      targetRevenue: 1200000,
      targetGrossMarginPct: 35.0,
      targetNewAccounts: 4,
      period: '2026-Q1',
      department: 'Corporate & Gov',
    },
    'กิตติศักดิ์ ปิดดีลไว': {
      salesRep: 'กิตติศักดิ์ ปิดดีลไว',
      targetRevenue: 1000000,
      targetGrossMarginPct: 36.0,
      targetNewAccounts: 3,
      period: '2026-Q1',
      department: 'Commercial SMB',
    },
  };

  const [targets, setTargets] = useState<Record<string, SalesTargetItem>>(initialTargets);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-Q1');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'exceeding' | 'on_track' | 'behind'>('all');
  const [searchRep, setSearchRep] = useState<string>('');

  // Target Editing Modal State
  const [isEditingTargets, setIsEditingTargets] = useState<boolean>(false);
  const [tempTargets, setTempTargets] = useState<Record<string, SalesTargetItem>>(initialTargets);

  // 2. Commission Scheme Configuration
  const defaultScheme: CommissionSchemeConfig = {
    modelType: 'accelerator_kicker',
    baseRatePct: 1.5, // 1.5% Base
    kickerRatePct: 1.0, // +1.0% when attainment >= 100%
    superKickerRatePct: 2.0, // +2.0% when attainment >= 120%
    minMarginThresholdPct: 25.0, // Minimum Margin floor
    uncollectedOverdueDeductionPct: 10.0, // Penalty on >90d overdue
    paidOnlySettlement: false,
  };

  const [scheme, setScheme] = useState<CommissionSchemeConfig>(defaultScheme);
  const [showSchemeEditor, setShowSchemeEditor] = useState<boolean>(false);

  // 3. Aggregate Actual Performance by Sales Rep from Invoices
  const repsList = useMemo(() => {
    const reps = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.salesRep) reps.add(inv.salesRep);
    });
    // Ensure default reps exist
    Object.keys(targets).forEach((r) => reps.add(r));
    return Array.from(reps);
  }, [invoices, targets]);

  // 4. Calculate Sales Rep Performance & Commission Attainment
  const repAttainments: SalesRepAttainment[] = useMemo(() => {
    return repsList.map((rep) => {
      const repInvoices = invoices.filter((inv) => inv.salesRep === rep);
      const targetConfig = targets[rep] || {
        salesRep: rep,
        targetRevenue: 1000000,
        targetGrossMarginPct: 35.0,
        targetNewAccounts: 3,
        period: selectedPeriod,
        department: 'Sales Team',
      };

      const actualRevenue = repInvoices.reduce((sum, inv) => sum + inv.netAmount, 0);
      const totalCost = repInvoices.reduce((sum, inv) => sum + (inv.costAmount || inv.netAmount * 0.62), 0);
      const grossProfitAmount = Math.max(0, actualRevenue - totalCost);
      const actualGrossMarginPct = actualRevenue > 0 ? (grossProfitAmount / actualRevenue) * 100 : 0;

      const collectedAmount = repInvoices
        .filter((inv) => inv.status === 'Paid' || inv.outstandingAmount === 0)
        .reduce((sum, inv) => sum + inv.netAmount, 0);

      const uncollectedAmount = repInvoices.reduce((sum, inv) => sum + inv.outstandingAmount, 0);

      const overdueSevereAmount = repInvoices
        .filter((inv) => inv.overdueDays > 90 && inv.outstandingAmount > 0)
        .reduce((sum, inv) => sum + inv.outstandingAmount, 0);

      const attainmentPct = targetConfig.targetRevenue > 0 ? (actualRevenue / targetConfig.targetRevenue) * 100 : 0;

      // Commission Computation
      let baseCommission = 0;
      let bonusKickerCommission = 0;
      let penaltyDeduction = 0;

      const commissionBaseAmount = scheme.paidOnlySettlement ? collectedAmount : actualRevenue;

      if (scheme.modelType === 'gross_profit_linked') {
        // Profit-linked: 4% of Gross Profit
        baseCommission = grossProfitAmount * (scheme.baseRatePct * 2.5 / 100);
      } else {
        // Revenue-linked
        baseCommission = commissionBaseAmount * (scheme.baseRatePct / 100);
      }

      // Kicker Bonusing
      if (attainmentPct >= 120) {
        bonusKickerCommission = commissionBaseAmount * ((scheme.kickerRatePct + scheme.superKickerRatePct) / 100);
      } else if (attainmentPct >= 100) {
        bonusKickerCommission = commissionBaseAmount * (scheme.kickerRatePct / 100);
      }

      // Margin Penalty Check
      if (actualGrossMarginPct < scheme.minMarginThresholdPct && actualRevenue > 0) {
        // Margin below floor -> 30% reduction on base commission
        baseCommission *= 0.7;
      }

      // Overdue Penalty Check
      if (overdueSevereAmount > 0 && scheme.uncollectedOverdueDeductionPct > 0) {
        penaltyDeduction = (baseCommission + bonusKickerCommission) * (scheme.uncollectedOverdueDeductionPct / 100);
      }

      const totalCommissionEarned = Math.max(0, baseCommission + bonusKickerCommission - penaltyDeduction);

      // Pacing Forecast (Assuming current day 60 out of 90 in quarter = 66% through quarter)
      const quarterProgressRatio = 0.68;
      const pacingForecastRevenue = quarterProgressRatio > 0 ? actualRevenue / quarterProgressRatio : actualRevenue;
      const pacingAttainmentPct = targetConfig.targetRevenue > 0 ? (pacingForecastRevenue / targetConfig.targetRevenue) * 100 : 0;

      // Status Assessment
      let status: 'Exceeding' | 'On Track' | 'At Risk' | 'Behind' = 'On Track';
      if (attainmentPct >= 100) {
        status = 'Exceeding';
      } else if (pacingAttainmentPct >= 95) {
        status = 'On Track';
      } else if (pacingAttainmentPct >= 75) {
        status = 'At Risk';
      } else {
        status = 'Behind';
      }

      return {
        salesRep: rep,
        targetRevenue: targetConfig.targetRevenue,
        actualRevenue,
        attainmentPct,
        targetGrossMarginPct: targetConfig.targetGrossMarginPct,
        actualGrossMarginPct,
        grossProfitAmount,
        invoiceCount: repInvoices.length,
        collectedAmount,
        uncollectedAmount,
        overdueSevereAmount,
        baseCommission: Math.round(baseCommission),
        bonusKickerCommission: Math.round(bonusKickerCommission),
        penaltyDeduction: Math.round(penaltyDeduction),
        totalCommissionEarned: Math.round(totalCommissionEarned),
        pacingForecastRevenue: Math.round(pacingForecastRevenue),
        pacingAttainmentPct,
        rank: 1,
        badge: '',
        status,
      };
    })
      .sort((a, b) => b.actualRevenue - a.actualRevenue)
      .map((item, index) => {
        let badge = '';
        if (index === 0) badge = 'Top Performer';
        else if (item.attainmentPct >= 110) badge = 'Overachiever';
        else if (item.actualGrossMarginPct >= 40) badge = 'Margin Champion';

        return {
          ...item,
          rank: index + 1,
          badge,
        };
      });
  }, [repsList, invoices, targets, scheme, selectedPeriod]);

  // 5. Team Summary Metrics
  const teamMetrics = useMemo(() => {
    const totalTarget = repAttainments.reduce((sum, r) => sum + r.targetRevenue, 0);
    const totalActual = repAttainments.reduce((sum, r) => sum + r.actualRevenue, 0);
    const totalGrossProfit = repAttainments.reduce((sum, r) => sum + r.grossProfitAmount, 0);
    const teamMarginPct = totalActual > 0 ? (totalGrossProfit / totalActual) * 100 : 0;
    const teamAttainmentPct = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    const totalCommissionPool = repAttainments.reduce((sum, r) => sum + r.totalCommissionEarned, 0);
    const totalCollectedCash = repAttainments.reduce((sum, r) => sum + r.collectedAmount, 0);

    const topPerformer = repAttainments[0];

    return {
      totalTarget,
      totalActual,
      teamAttainmentPct,
      totalGrossProfit,
      teamMarginPct,
      totalCommissionPool,
      totalCollectedCash,
      topPerformer,
    };
  }, [repAttainments]);

  // Filtered Rep List for Table
  const filteredAttainments = useMemo(() => {
    return repAttainments.filter((rep) => {
      if (searchRep && !rep.salesRep.toLowerCase().includes(searchRep.toLowerCase())) {
        return false;
      }
      if (activeTabFilter === 'exceeding') return rep.status === 'Exceeding';
      if (activeTabFilter === 'on_track') return rep.status === 'On Track';
      if (activeTabFilter === 'behind') return rep.status === 'At Risk' || rep.status === 'Behind';
      return true;
    });
  }, [repAttainments, activeTabFilter, searchRep]);

  // Export Settlement Report to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Sales Attainment & Commission Settlement
    const settlementData = repAttainments.map((r) => ({
      'อันดับ (Rank)': r.rank,
      'พนักงานขาย (Sales Rep)': r.salesRep,
      'เป้าหมายยอดขาย (Target)': r.targetRevenue,
      'ยอดขายทำได้จริง (Actual)': r.actualRevenue,
      'อัตราบรรลุเป้า (% Attainment)': `${r.attainmentPct.toFixed(1)}%`,
      'กำไรขั้นต้น (Gross Profit)': r.grossProfitAmount,
      'อัตรากำไร (% Margin)': `${r.actualGrossMarginPct.toFixed(1)}%`,
      'ยอดเก็บเงินสดแล้ว (Collected)': r.collectedAmount,
      'ยอดหนี้ค้างรับ (Uncollected A/R)': r.uncollectedAmount,
      'คอมมิชชั่นพื้นฐาน (Base)': r.baseCommission,
      'โบนัสเร่งเป้า (Accelerator)': r.bonusKickerCommission,
      'หักหนี้ค้างชำระ (Penalty)': r.penaltyDeduction,
      'คอมมิชชั่นสุทธิ (Net Payout)': r.totalCommissionEarned,
      'สถานะการทำงาน': r.status,
    }));
    const ws1 = XLSX.utils.json_to_sheet(settlementData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Commission_Settlement');

    // Sheet 2: Scheme Rules Summary
    const schemeData = [
      { 'เงื่อนไขคอมมิชชั่น': 'โมเดลโครงสร้าง', 'การตั้งค่า': scheme.modelType },
      { 'เงื่อนไขคอมมิชชั่น': 'อัตราคอมมิชชั่นพื้นฐาน (Base Rate)', 'การตั้งค่า': `${scheme.baseRatePct}%` },
      { 'เงื่อนไขคอมมิชชั่น': 'โบนัสเกินเป้า 100% (Kicker)', 'การตั้งค่า': `+${scheme.kickerRatePct}%` },
      { 'เงื่อนไขคอมมิชชั่น': 'โบนัสเกินเป้า 120% (Super Kicker)', 'การตั้งค่า': `+${scheme.superKickerRatePct}%` },
      { 'เงื่อนไขคอมมิชชั่น': 'เกณฑ์กำไรขั้นต้นขั้นต่ำ (Min Margin)', 'การตั้งค่า': `${scheme.minMarginThresholdPct}%` },
      { 'เงื่อนไขคอมมิชชั่น': 'หักกรณีมีหนี้ค้าง >90 วัน (Overdue Penalty)', 'การตั้งค่า': `${scheme.uncollectedOverdueDeductionPct}%` },
    ];
    const ws2 = XLSX.utils.json_to_sheet(schemeData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Scheme_Configuration');

    XLSX.writeFile(wb, `FinFlow_Sales_Commission_Settlement_${selectedPeriod}.xlsx`);
  };

  // Save Target Edits
  const handleSaveTargets = () => {
    setTargets(tempTargets);
    setIsEditingTargets(false);
  };

  return (
    <div id="viewSalesCommission" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0">
      {/* 1. Header Banner & Period Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Sales Quotas &amp; Commission Tracking
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                teamMetrics.teamAttainmentPct >= 100
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              }`}>
                บรรลุเป้าหมายรวม {teamMetrics.teamAttainmentPct.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ระบบติดตามผลงานเซลส์รายบุคคล วัด % Attainment คำนวณคอมมิชชั่นแบบขั้นบันได และประเมินความคุ้มค่าผลกำไร
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-stretch sm:self-auto">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setSelectedPeriod('2026-Q1')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedPeriod === '2026-Q1'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ไตรมาส 1 (Q1)
            </button>
            <button
              onClick={() => setSelectedPeriod('2026-Q2')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedPeriod === '2026-Q2'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ไตรมาส 2 (Q2)
            </button>
          </div>

          <button
            onClick={() => {
              setTempTargets(targets);
              setIsEditingTargets(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>กำหนดเป้าหมาย</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="ส่งออกรายงานยอดขายและคอมมิชชั่นเป็น Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Settlement</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Team Quota vs Actual */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ยอดขายรวมเทียบเป้า</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ฿{teamMetrics.totalActual.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                teamMetrics.teamAttainmentPct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, teamMetrics.teamAttainmentPct)}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>เป้าหมาย ฿{teamMetrics.totalTarget.toLocaleString()}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{teamMetrics.teamAttainmentPct.toFixed(0)}%</span>
          </div>
        </div>

        {/* Card 2: Total Commission Payout Pool */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">กองทุนคอมมิชชั่นสุทธิ</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ฿{teamMetrics.totalCommissionPool.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span>คิดเป็น {((teamMetrics.totalCommissionPool / (teamMetrics.totalActual || 1)) * 100).toFixed(2)}% ของยอดขาย</span>
          </div>
        </div>

        {/* Card 3: Team Gross Margin % */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">อัตรากำไรเฉลี่ยทีม</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {teamMetrics.teamMarginPct.toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>กำไรขั้นต้นรวม ฿{teamMetrics.totalGrossProfit.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 4: Top Performer Spotlight */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ยอดขายอันดับ 1</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
              {teamMetrics.topPerformer?.salesRep || 'ไม่มีข้อมูล'}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {teamMetrics.topPerformer?.attainmentPct.toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>ยอด ฿{teamMetrics.topPerformer?.actualRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Commission Policy & Calculation Simulator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              แบบจำลองโครงสร้างและนโยบายจ่ายคอมมิชชั่น (Commission Scheme Simulator)
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setScheme(defaultScheme)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตนโยบายมาตรฐาน</span>
            </button>
            <button
              onClick={() => setShowSchemeEditor(!showSchemeEditor)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 transition cursor-pointer"
            >
              <span>{showSchemeEditor ? 'ซ่อนการปรับแต่ง' : 'ปรับเกณฑ์คอมมิชชั่น'}</span>
              {showSchemeEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Quick Model Selector Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setScheme({ ...scheme, modelType: 'accelerator_kicker', baseRatePct: 1.5, kickerRatePct: 1.0 })}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              scheme.modelType === 'accelerator_kicker'
                ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-2xs'
                : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">ขั้นบันไดเร่งยอด (Accelerator)</span>
              <Flame className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              ฐาน 1.5% + โบนัสเพิ่ม 1.0% เมื่อทะลุ 100% เหมาะสำหรับผลักดันเป้าหมายยอดขาย
            </p>
          </button>

          <button
            onClick={() => setScheme({ ...scheme, modelType: 'gross_profit_linked', baseRatePct: 1.8, kickerRatePct: 0.8 })}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              scheme.modelType === 'gross_profit_linked'
                ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">เน้นกำไรขั้นต้น (Profit-Linked)</span>
              <BadgePercent className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              คำนวณจาก Gross Margin ป้องกันการลดราคาตัดยอดขาย และเพิ่มผลตอบแทนดีลกำไรสูง
            </p>
          </button>

          <button
            onClick={() => setScheme({ ...scheme, modelType: 'revenue_tiered', paidOnlySettlement: true, uncollectedOverdueDeductionPct: 15 })}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              scheme.paidOnlySettlement
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-2xs'
                : 'bg-slate-50/50 dark:bg-slate-950/30 border-slate-200/70 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">เน้นเงินสดเข้า (Cash-Settled)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              จ่ายคอมมิชชั่นเฉพาะบิลที่เก็บเงินสดแล้ว + หักลดหย่อนหากปล่อยลูกหนี้ค้างเกิน 90 วัน
            </p>
          </button>
        </div>

        {/* Collapsible Sliders */}
        {showSchemeEditor && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">อัตราคอมมิชชั่นฐาน (Base Rate)</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{scheme.baseRatePct}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={scheme.baseRatePct}
                onChange={(e) => setScheme({ ...scheme, baseRatePct: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">โบนัสทะลุเป้า 100% (Kicker)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+{scheme.kickerRatePct}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.2"
                value={scheme.kickerRatePct}
                onChange={(e) => setScheme({ ...scheme, kickerRatePct: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">หักลดหย่อนหนี้ค้าง &gt;90 วัน</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">-{scheme.uncollectedOverdueDeductionPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={scheme.uncollectedOverdueDeductionPct}
                onChange={(e) => setScheme({ ...scheme, uncollectedOverdueDeductionPct: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Visual Comparison Charts: Target vs Actual & Commission Payout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Chart: Target vs Actual Revenue by Sales Rep */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Sales Target Quota vs Actual Revenue by Sales Rep
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                เปรียบเทียบยอดขายทำได้จริงกับเป้าหมายตามช่วงเวลา
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center gap-1 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600 inline-block"></span>
                เป้าหมาย (Target)
              </span>
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"></span>
                ยอดขายจริง (Actual)
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={repAttainments} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="salesRep" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    const formatted = `฿${Number(val).toLocaleString()}`;
                    if (name === 'targetRevenue') return [formatted, 'เป้าหมาย (Target)'];
                    if (name === 'actualRevenue') return [formatted, 'ยอดขายจริง (Actual)'];
                    return [formatted, name];
                  }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: 'none',
                    padding: '8px 12px',
                  }}
                />
                <Bar dataKey="targetRevenue" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="actualRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {repAttainments.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.attainmentPct >= 100 ? '#10b981' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Card: AI Incentive Insights & Motivation Brief */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  AI Sales Incentive Advisor
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                Gemini Co-Pilot
              </span>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
              <p>
                <strong>ภาพรวมความคืบหน้าทีม:</strong> ทีมทำผลงานได้ <strong>{teamMetrics.teamAttainmentPct.toFixed(1)}%</strong> ของเป้าหมาย Q1 โดย <strong>{teamMetrics.topPerformer?.salesRep}</strong> ปิดยอดเกินเป้าหมาย ({teamMetrics.topPerformer?.attainmentPct.toFixed(0)}%) ได้รับโบนัส Kicker เต็มจำนวน
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                💡 <strong>คำแนะนำกระตุ้นยอด:</strong> ปรับโฟกัสทีม SMB ให้เร่งปิดดีลสินค้ามาร์จิ้นสูง (&gt;40%) เพื่อปลดล็อกโบนัส Gross Margin Booster ก่อนสิ้นสุดไตรมาส
              </p>
            </div>

            <div className="mt-3.5 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ไฮไลท์รายบุคคล (Rep Highlights)
              </span>
              <div className="space-y-1.5 text-xs">
                {repAttainments.slice(0, 2).map((rep) => (
                  <div key={rep.salesRep} className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center">
                        #{rep.rank}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{rep.salesRep}</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      ฿{rep.totalCommissionEarned.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold transition cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>ขอแนวทางเพิ่มยอดขายรายบุคคลจาก AI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Sales Rep Attainment & Settlement Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              ตารางสรุปผลงานและการจ่ายเงินรางวัลคอมมิชชั่น (Sales Attainment &amp; Commission Settlement)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              แสดง {filteredAttainments.length} รายการพนักงานขายประจำงวด {selectedPeriod}
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setActiveTabFilter('all')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                  activeTabFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setActiveTabFilter('exceeding')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                  activeTabFilter === 'exceeding'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                เกินเป้า (&gt;100%)
              </button>
              <button
                onClick={() => setActiveTabFilter('behind')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                  activeTabFilter === 'behind'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ต้องเร่งยอด
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="ค้นหาชื่อเซลส์..."
              value={searchRep}
              onChange={(e) => setSearchRep(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 font-semibold">
              <tr>
                <th className="p-3 text-center w-12">อันดับ</th>
                <th className="p-3">พนักงานขาย</th>
                <th className="p-3 text-right">เป้าหมาย (Quota)</th>
                <th className="p-3 text-right">ยอดขายจริง (Actual)</th>
                <th className="p-3 text-center">บรรลุเป้า (%)</th>
                <th className="p-3 text-right">กำไรขั้นต้น (GM)</th>
                <th className="p-3 text-right">ฐานคอมมิชชั่น</th>
                <th className="p-3 text-right">โบนัส Kicker</th>
                <th className="p-3 text-right font-bold">คอมมิชชั่นสุทธิ</th>
                <th className="p-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAttainments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400 text-xs">
                    ไม่พบข้อมูลพนักงานขายตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredAttainments.map((rep) => (
                  <tr key={rep.salesRep} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        rep.rank === 1
                          ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                          : rep.rank === 2
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {rep.rank}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <span>{rep.salesRep}</span>
                        {rep.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                            {rep.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{rep.invoiceCount} อินวอยซ์</span>
                    </td>
                    <td className="p-3 text-right text-slate-600 dark:text-slate-300">
                      ฿{rep.targetRevenue.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                      ฿{rep.actualRevenue.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        rep.attainmentPct >= 100
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : rep.attainmentPct >= 80
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                      }`}>
                        {rep.attainmentPct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="text-slate-700 dark:text-slate-300">฿{rep.grossProfitAmount.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">({rep.actualGrossMarginPct.toFixed(1)}%)</div>
                    </td>
                    <td className="p-3 text-right text-slate-600 dark:text-slate-300">
                      ฿{rep.baseCommission.toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                      {rep.bonusKickerCommission > 0 ? `+฿${rep.bonusKickerCommission.toLocaleString()}` : '-'}
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-white text-sm">
                      ฿{rep.totalCommissionEarned.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        rep.status === 'Exceeding'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : rep.status === 'On Track'
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {rep.status === 'Exceeding' ? 'ทะลุเป้า' : rep.status === 'On Track' ? 'ตามเป้าหมาย' : 'ต่ำกว่าเป้า'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Target Setting Modal */}
      {isEditingTargets && (
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
                onClick={() => setIsEditingTargets(false)}
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
                onClick={() => setIsEditingTargets(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveTargets}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึกเป้าหมาย</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
