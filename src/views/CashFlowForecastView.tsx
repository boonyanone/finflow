import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCcw,
  Bot,
  ArrowRight,
  ShieldCheck,
  Building2,
  Wallet,
  Coins,
  Percent,
  Clock,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowUpRight,
  FileSpreadsheet,
  HelpCircle,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  Area,
  BarChart,
} from 'recharts';
import * as XLSX from 'xlsx';
import {
  InvoiceRecord,
  Customer,
  ArAgingBucket,
  CashFlowScenarioParams,
  WeeklyCashBucket,
  CustomerCashInflowItem,
} from '../types';

interface CashFlowForecastViewProps {
  invoices: InvoiceRecord[];
  customers: Customer[];
  arBuckets: ArAgingBucket[];
  onOpenDebtDraft?: (customer: string, invoiceNo: string, amount: number, overdueDays: number) => void;
  onOpenCopilot?: () => void;
}

export const CashFlowForecastView: React.FC<CashFlowForecastViewProps> = ({
  invoices,
  customers,
  arBuckets,
  onOpenDebtDraft,
  onOpenCopilot,
}) => {
  // Scenario Parameters State
  const defaultParams: CashFlowScenarioParams = {
    paymentDelayDays: 0,
    salesGrowthPct: 0,
    earlyPaymentDiscountPct: 0,
    earlyCollectionAdoptionPct: 40,
    cogsInflationPct: 0,
    openingCashBalance: 1500000,
    monthlyFixedOpex: 350000,
    minSafetyCash: 500000,
  };

  const [params, setParams] = useState<CashFlowScenarioParams>(defaultParams);
  const [selectedPreset, setSelectedPreset] = useState<string>('baseline');
  const [showAdvancedParams, setShowAdvancedParams] = useState<boolean>(false);
  const [scheduleFilter, setScheduleFilter] = useState<'all' | '30days' | '60days' | 'high_risk'>('all');
  const [searchSchedule, setSearchSchedule] = useState<string>('');

  // Presets Handlers
  const handleApplyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    switch (presetKey) {
      case 'baseline':
        setParams(defaultParams);
        break;
      case 'delayed_stress':
        setParams({
          ...defaultParams,
          paymentDelayDays: 25,
          salesGrowthPct: -10,
          earlyPaymentDiscountPct: 0,
          cogsInflationPct: 8,
        });
        break;
      case 'aggressive_discount':
        setParams({
          ...defaultParams,
          paymentDelayDays: -10,
          salesGrowthPct: 5,
          earlyPaymentDiscountPct: 2.5,
          earlyCollectionAdoptionPct: 65,
          cogsInflationPct: 0,
        });
        break;
      case 'high_growth':
        setParams({
          ...defaultParams,
          paymentDelayDays: 0,
          salesGrowthPct: 30,
          earlyPaymentDiscountPct: 1.5,
          earlyCollectionAdoptionPct: 50,
          cogsInflationPct: 3,
        });
        break;
      default:
        break;
    }
  };

  // 1. Calculate Detailed Receivables Inflow Timing with Scenario Adjustments
  const inflowSchedule: CustomerCashInflowItem[] = useMemo(() => {
    const today = new Date();
    // Filter unpaid / outstanding invoices
    const outstandingInvoices = invoices.filter(
      (inv) => inv.outstandingAmount > 0 || inv.status === 'Pending' || inv.status === 'Overdue'
    );

    return outstandingInvoices.map((inv) => {
      // Risk level based on customer or invoice overdue days
      let risk: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
      let recoveryProb = 0.98;

      if (inv.overdueDays > 90) {
        risk = 'Critical';
        recoveryProb = 0.65;
      } else if (inv.overdueDays > 60) {
        risk = 'High';
        recoveryProb = 0.8;
      } else if (inv.overdueDays > 30) {
        risk = 'Medium';
        recoveryProb = 0.9;
      }

      // Calculate adjusted due date based on paymentDelayDays & early discount
      const originalDue = new Date(inv.dueDate || inv.date);
      const shiftDays = params.paymentDelayDays;
      const adjustedDate = new Date(originalDue);
      adjustedDate.setDate(adjustedDate.getDate() + shiftDays);

      const amount = inv.outstandingAmount || inv.netAmount;
      const discountEligible = params.earlyPaymentDiscountPct > 0 && inv.overdueDays <= 15;
      const discountRatio = discountEligible ? (params.earlyPaymentDiscountPct / 100) : 0;
      const discountedAmount = amount * (1 - discountRatio);

      // Expected inflow calculation
      const expectedInflow = discountedAmount * recoveryProb;

      return {
        customerId: inv.customerId,
        customerName: inv.customerName,
        invoiceNo: inv.invoiceNo,
        invoiceDate: inv.date,
        originalDueDate: inv.dueDate || inv.date,
        adjustedDueDate: adjustedDate.toISOString().split('T')[0],
        amount,
        outstandingAmount: amount,
        overdueDays: inv.overdueDays,
        riskLevel: risk,
        expectedProbability: recoveryProb,
        expectedInflow,
        discountEligible,
        discountedAmount,
      };
    });
  }, [invoices, params]);

  // 2. Generate 12-Week Rolling Cash Flow Projection
  const weeklyForecast: WeeklyCashBucket[] = useMemo(() => {
    const today = new Date();
    const buckets: WeeklyCashBucket[] = [];
    let rollingCash = params.openingCashBalance;

    const weeklyOpex = params.monthlyFixedOpex / 4.33;
    const baseAvgWeeklySales =
      invoices.length > 0
        ? invoices.reduce((sum, i) => sum + i.netAmount, 0) / 12
        : 400000;
    const adjustedWeeklySales = baseAvgWeeklySales * (1 + params.salesGrowthPct / 100);
    const weeklyCogs = adjustedWeeklySales * 0.6 * (1 + params.cogsInflationPct / 100);

    for (let w = 1; w <= 12; w++) {
      const wStart = new Date(today);
      wStart.setDate(today.getDate() + (w - 1) * 7);
      const wEnd = new Date(today);
      wEnd.setDate(today.getDate() + w * 7 - 1);

      const startStr = wStart.toISOString().split('T')[0];
      const endStr = wEnd.toISOString().split('T')[0];

      // Sum expected inflows from existing AR falling into this week
      const arItemsInWeek = inflowSchedule.filter((item) => {
        return item.adjustedDueDate >= startStr && item.adjustedDueDate <= endStr;
      });

      const arBaseInflow = arItemsInWeek.reduce((sum, item) => sum + item.amount, 0);
      const arScenarioInflow = arItemsInWeek.reduce((sum, item) => sum + item.expectedInflow, 0);

      // Future new sales collection component (spread over weeks based on terms)
      const newSalesCollection = w >= 4 ? adjustedWeeklySales * 0.85 : 0;

      const totalInflow = arScenarioInflow + newSalesCollection;
      const totalOutflow = weeklyOpex + (w >= 3 ? weeklyCogs * 0.7 : weeklyOpex * 0.3);
      const netFlow = totalInflow - totalOutflow;
      rollingCash += netFlow;

      const worstCaseInflow = totalInflow * 0.75;
      const bestCaseInflow = totalInflow * 1.15;
      const safetyBuffer = rollingCash - params.minSafetyCash;

      let riskStatus: 'Safe' | 'Moderate' | 'Tight' | 'Deficit' = 'Safe';
      if (rollingCash < 0) {
        riskStatus = 'Deficit';
      } else if (rollingCash < params.minSafetyCash) {
        riskStatus = 'Tight';
      } else if (rollingCash < params.minSafetyCash * 1.5) {
        riskStatus = 'Moderate';
      }

      buckets.push({
        weekKey: `W${w}`,
        weekLabel: `W${w} (${wStart.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })})`,
        startDate: startStr,
        endDate: endStr,
        baseInflow: arBaseInflow,
        scenarioInflow: Math.round(totalInflow),
        worstCaseInflow: Math.round(worstCaseInflow),
        bestCaseInflow: Math.round(bestCaseInflow),
        projectedOutflow: Math.round(totalOutflow),
        netCashFlow: Math.round(netFlow),
        closingCash: Math.round(rollingCash),
        safetyBuffer: Math.round(safetyBuffer),
        riskStatus,
      });
    }

    return buckets;
  }, [inflowSchedule, params, invoices]);

  // 3. High-Level Summary Metrics
  const metrics = useMemo(() => {
    const totalOutstandingAR = inflowSchedule.reduce((sum, i) => sum + i.outstandingAmount, 0);
    const day30Inflow = weeklyForecast.slice(0, 4).reduce((sum, w) => sum + w.scenarioInflow, 0);
    const day60Inflow = weeklyForecast.slice(0, 8).reduce((sum, w) => sum + w.scenarioInflow, 0);
    const day90Inflow = weeklyForecast.slice(0, 12).reduce((sum, w) => sum + w.scenarioInflow, 0);

    const totalOutflow90d = weeklyForecast.reduce((sum, w) => sum + w.projectedOutflow, 0);
    const finalCashBalance = weeklyForecast[weeklyForecast.length - 1]?.closingCash || 0;
    const minCashBalanceInPeriod = Math.min(...weeklyForecast.map((w) => w.closingCash));

    // Calculate Liquidity Runway in Months
    const avgMonthlyBurn = params.monthlyFixedOpex + 150000;
    const runwayMonths = avgMonthlyBurn > 0 ? (params.openingCashBalance / avgMonthlyBurn).toFixed(1) : '12+';

    // Liquidity Health Assessment
    let healthLabel = 'สภาพคล่องแข็งแกร่ง (Healthy)';
    let healthColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
    let healthStatus: 'Healthy' | 'Caution' | 'Stressed' = 'Healthy';

    if (minCashBalanceInPeriod < 0) {
      healthLabel = 'เสี่ยงเงินสดขาดมือ (Liquidity Deficit)';
      healthColor = 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';
      healthStatus = 'Stressed';
    } else if (minCashBalanceInPeriod < params.minSafetyCash) {
      healthLabel = 'เงินสดสำรองตึงตัว (Tight Buffer)';
      healthColor = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
      healthStatus = 'Caution';
    }

    return {
      totalOutstandingAR,
      day30Inflow,
      day60Inflow,
      day90Inflow,
      totalOutflow90d,
      finalCashBalance,
      minCashBalanceInPeriod,
      runwayMonths,
      healthLabel,
      healthColor,
      healthStatus,
    };
  }, [inflowSchedule, weeklyForecast, params]);

  // Filtered Schedule Table
  const filteredSchedule = useMemo(() => {
    const today = new Date();
    const day30Date = new Date();
    day30Date.setDate(today.getDate() + 30);
    const day30Str = day30Date.toISOString().split('T')[0];

    const day60Date = new Date();
    day60Date.setDate(today.getDate() + 60);
    const day60Str = day60Date.toISOString().split('T')[0];

    return inflowSchedule.filter((item) => {
      // Search
      if (
        searchSchedule &&
        !item.customerName.toLowerCase().includes(searchSchedule.toLowerCase()) &&
        !item.invoiceNo.toLowerCase().includes(searchSchedule.toLowerCase())
      ) {
        return false;
      }

      // Timing / Risk filter
      if (scheduleFilter === '30days') {
        return item.adjustedDueDate <= day30Str;
      }
      if (scheduleFilter === '60days') {
        return item.adjustedDueDate <= day60Str;
      }
      if (scheduleFilter === 'high_risk') {
        return item.riskLevel === 'High' || item.riskLevel === 'Critical';
      }
      return true;
    });
  }, [inflowSchedule, scheduleFilter, searchSchedule]);

  // Export Forecast to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Weekly Projection
    const weeklyData = weeklyForecast.map((w) => ({
      'สัปดาห์ (Week)': w.weekLabel,
      'วันที่เริ่มต้น': w.startDate,
      'วันที่สิ้นสุด': w.endDate,
      'เงินสดรับคาดการณ์ (Inflow)': w.scenarioInflow,
      'กรณีแย่สุด (Worst Case)': w.worstCaseInflow,
      'กรณีดีสุด (Best Case)': w.bestCaseInflow,
      'เงินสดจ่ายประมาณการ (Outflow)': w.projectedOutflow,
      'กระแสเงินสดสุทธิ (Net Flow)': w.netCashFlow,
      'เงินสดคงเหลือปลายงวด (Closing Cash)': w.closingCash,
      'สถานะสภาพคล่อง': w.riskStatus,
    }));
    const ws1 = XLSX.utils.json_to_sheet(weeklyData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Weekly_Cash_Projection');

    // Sheet 2: Receivables Schedule
    const scheduleData = inflowSchedule.map((i) => ({
      'รหัสลูกค้า': i.customerId,
      'ชื่อลูกค้า': i.customerName,
      'เลขที่อินวอยซ์': i.invoiceNo,
      'วันครบกำหนดเดิม': i.originalDueDate,
      'วันคาดว่าจะได้รับเงิน (Adjusted)': i.adjustedDueDate,
      'ยอดหนี้ค้างชำระ': i.outstandingAmount,
      'โอกาสเก็บเงินได้ (%)': `${(i.expectedProbability * 100).toFixed(0)}%`,
      'ยอดเงินสดคาดการณ์': Math.round(i.expectedInflow),
      'ระดับความเสี่ยง': i.riskLevel,
    }));
    const ws2 = XLSX.utils.json_to_sheet(scheduleData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Receivables_Schedule');

    XLSX.writeFile(wb, `FinFlow_CashFlow_Forecast_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div id="viewCashFlowForecast" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0">
      {/* 1. Top Header Banner & Preset Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Cash Flow Projection &amp; What-If Scenario Simulator
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${metrics.healthColor}`}>
                {metrics.healthLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              แบบจำลองกระแสเงินสดรับล่วงหน้า 12 สัปดาห์ และเครื่องมือทดสอบสมมติฐานทางธุรกิจแบบ Real-time
            </p>
          </div>
        </div>

        {/* Preset Selector & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-stretch sm:self-auto">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => handleApplyPreset('baseline')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedPreset === 'baseline'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              มาตรฐาน (Baseline)
            </button>
            <button
              onClick={() => handleApplyPreset('delayed_stress')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedPreset === 'delayed_stress'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              ลูกค้าจ่ายช้า (+25d)
            </button>
            <button
              onClick={() => handleApplyPreset('aggressive_discount')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedPreset === 'aggressive_discount'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              เร่งเก็บหนี้ (Discount 2.5%)
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="ส่งออกผลการพยากรณ์เป็น Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: 30-Day Inflow */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">เงินสดรับคาดการณ์ (30 วัน)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ฿{metrics.day30Inflow.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>คิดเป็น {((metrics.day30Inflow / (metrics.totalOutstandingAR || 1)) * 100).toFixed(0)}% ของลูกหนี้ทั้งหมด</span>
          </div>
        </div>

        {/* Card 2: 90-Day Cumulative Inflow */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">เงินสดรับสะสม (90 วัน)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ฿{metrics.day90Inflow.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span>รวมลูกหนี้เดิม + ยอดขายใหม่</span>
          </div>
        </div>

        {/* Card 3: Projected Ending Cash Balance */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">เงินสดคงเหลือปลายไตรมาส</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              metrics.finalCashBalance >= params.minSafetyCash
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
            }`}>
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl sm:text-2xl font-bold ${
              metrics.finalCashBalance >= params.minSafetyCash
                ? 'text-slate-900 dark:text-white'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              ฿{metrics.finalCashBalance.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>เงินสำรองขั้นต่ำ ฿{params.minSafetyCash.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 4: Total Uncollected AR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ยอดหนี้ค้างรับรอเก็บ (A/R)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              ฿{metrics.totalOutstandingAR.toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>จาก {inflowSchedule.length} รายการอินวอยซ์</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive What-If Scenario Control Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              ตัวปรับแต่งสมมติฐานจำลองสถานการณ์ (What-If Parameters)
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleApplyPreset('baseline')}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ตค่าเดิม</span>
            </button>
            <button
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-900/60 transition cursor-pointer"
            >
              <span>{showAdvancedParams ? 'ย่อตัวแปรขั้นสูง' : 'ตั้งค่าต้นทุน & OPEX ขั้นสูง'}</span>
              {showAdvancedParams ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Primary Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          {/* Parameter 1: Payment Delay / Acceleration */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                พฤติกรรมการจ่ายเงินลูกค้า
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                params.paymentDelayDays === 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : params.paymentDelayDays > 0
                  ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
              }`}>
                {params.paymentDelayDays === 0
                  ? 'ตามกำหนด (0 วัน)'
                  : params.paymentDelayDays > 0
                  ? `จ่ายช้า +${params.paymentDelayDays} วัน`
                  : `จ่ายเร็ว ${params.paymentDelayDays} วัน`}
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="45"
              step="5"
              value={params.paymentDelayDays}
              onChange={(e) => setParams({ ...params, paymentDelayDays: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-15 วัน (เร่งเก็บ)</span>
              <span>ปกติ (0)</span>
              <span>+45 วัน (ชะลอจ่าย)</span>
            </div>
          </div>

          {/* Parameter 2: Sales Revenue Growth */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                อัตราเติบโตของยอดขายใหม่
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                params.salesGrowthPct === 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  : params.salesGrowthPct > 0
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
              }`}>
                {params.salesGrowthPct > 0 ? `+${params.salesGrowthPct}%` : `${params.salesGrowthPct}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="50"
              step="5"
              value={params.salesGrowthPct}
              onChange={(e) => setParams({ ...params, salesGrowthPct: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-30% (หดตัว)</span>
              <span>0% (คงเดิม)</span>
              <span>+50% (เติบโตสูง)</span>
            </div>
          </div>

          {/* Parameter 3: Early Payment Cash Discount */}
          <div className="space-y-2 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                ส่วนลดเงินสดชำระเร็ว (Early Cash Discount)
              </span>
              <span className="px-2 py-0.5 rounded-md font-bold text-xs bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {params.earlyPaymentDiscountPct}% (ยอมรับ {params.earlyCollectionAdoptionPct}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={params.earlyPaymentDiscountPct}
              onChange={(e) => setParams({ ...params, earlyPaymentDiscountPct: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (ไม่มีส่วนลด)</span>
              <span>2.5%</span>
              <span>5.0% (จูงใจสูงสุด)</span>
            </div>
          </div>
        </div>

        {/* Advanced Cost & Liquidity Parameters (Collapsible) */}
        {showAdvancedParams && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                เงินสดตั้งต้น (Opening Cash Balance)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">฿</span>
                <input
                  type="number"
                  value={params.openingCashBalance}
                  onChange={(e) => setParams({ ...params, openingCashBalance: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                ค่าใช้จ่ายประจำคงที่รายเดือน (Fixed OPEX)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">฿</span>
                <input
                  type="number"
                  value={params.monthlyFixedOpex}
                  onChange={(e) => setParams({ ...params, monthlyFixedOpex: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                เงินสำรองขั้นต่ำที่ต้องการ (Min Safety Cash)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">฿</span>
                <input
                  type="number"
                  value={params.minSafetyCash}
                  onChange={(e) => setParams({ ...params, minSafetyCash: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Visual Charts: 12-Week Rolling Cash Flow & Cumulative Liquidity Line */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Chart: 12-Week Rolling Projection */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                12-Week Rolling Cash Inflow vs Outflow &amp; Cumulative Balance
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                เปรียบเทียบเงินสดรับ-จ่ายรายสัปดาห์ และเส้นสะสมสภาพคล่องสุทธิ
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block"></span>
                Inflow (เงินรับ)
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-600 inline-block"></span>
                Outflow (เงินจ่าย)
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block"></span>
                Closing Cash
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weeklyForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="weekKey" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={11}
                  tickFormatter={(val) => `฿${(val / 1000000).toFixed(1)}M`}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    const formatted = `฿${Number(val).toLocaleString()}`;
                    if (name === 'scenarioInflow') return [formatted, 'เงินสดรับคาดการณ์ (Inflow)'];
                    if (name === 'projectedOutflow') return [formatted, 'เงินสดจ่ายประมาณการ (Outflow)'];
                    if (name === 'closingCash') return [formatted, 'เงินสดคงเหลือสะสม (Closing Cash)'];
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
                <ReferenceLine
                  yAxisId="right"
                  y={params.minSafetyCash}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: 'Min Safety Cash', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }}
                />
                <Bar yAxisId="left" dataKey="scenarioInflow" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar yAxisId="left" dataKey="projectedOutflow" fill="#94a3b8" opacity={0.5} radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="closingCash"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Card: AI Cash Flow Diagnosis & Tactical Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  AI Liquidity Diagnosis
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                Gemini Advisor
              </span>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {metrics.healthStatus === 'Healthy' ? (
                <p>
                  <strong>สภาพคล่องมีเสถียรภาพสูง:</strong> เงินสดสำรองคงเหลือปลายงวดอยู่ที่ <strong>฿{metrics.finalCashBalance.toLocaleString()}</strong> สูงกว่าเกณฑ์ความปลอดภัย สามารถรองรับค่าใช้จ่ายประจำได้มากกว่า {metrics.runwayMonths} เดือน
                </p>
              ) : metrics.healthStatus === 'Caution' ? (
                <p>
                  <strong>ต้องเฝ้าระวังกระแสเงินสด:</strong> พบช่วงเวลาที่เงินสดคงเหลือแตะระดับขั้นต่ำ ฿{metrics.minCashBalanceInPeriod.toLocaleString()} แนะนำให้เร่งติดตามลูกหนี้กลุ่ม Overdue &gt;60 วัน เพื่อเสริมความคล่องตัว
                </p>
              ) : (
                <p className="text-rose-700 dark:text-rose-300">
                  <strong>แจ้งเตือนความเสี่ยงสภาพคล่องตึงตัว:</strong> ภายใต้สมมติฐานนี้ เงินสดปลายงวดจะต่ำกว่าเกณฑ์ความปลอดภัย ควรพิจารณาออกแคมเปญส่วนลดชำระเร็ว หรือเจรจาขยายเครดิตเจ้าหนี้การค้า
                </p>
              )}
            </div>

            {/* Tactical Recommendations Checklist */}
            <div className="mt-3.5 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ข้อเสนอแนะเชิงกลยุทธ์ (Tactical Actions)
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start space-x-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-300">
                    เสนอส่วนลดเงินสด <strong>2.0%</strong> สำหรับลูกหนี้ชั้นดีเพื่อเร่งเก็บเงินเข้ากระเป๋าในสัปดาห์ที่ 1-2
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-600 dark:text-slate-300">
                    ติดตามยอดค้างชำระโครงการกลุ่ม High Risk ฿{inflowSchedule.filter(i => i.riskLevel === 'High' || i.riskLevel === 'Critical').reduce((s, i) => s + i.outstandingAmount, 0).toLocaleString()} ก่อนถึงสิ้นเดือน
                  </span>
                </div>
              </div>
            </div>
          </div>

          {onOpenCopilot && (
            <button
              onClick={onOpenCopilot}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold transition cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>ขอคำแนะนำแผนกระแสเงินสดเชิงลึกจาก AI</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Detailed Receivables Inflow Schedule Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              ตารางกำหนดรับชำระและโอกาสการเก็บเงินรายลูกค้า (Receivables Collection Schedule)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              แสดง {filteredSchedule.length} รายการตามผลการปรับสมมติฐานการจ่ายเงิน
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => setScheduleFilter('all')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                  scheduleFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setScheduleFilter('30days')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                  scheduleFilter === '30days'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ภายใน 30 วัน
              </button>
              <button
                onClick={() => setScheduleFilter('high_risk')}
                className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                  scheduleFilter === 'high_risk'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                กลุ่มเสี่ยงสูง
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="ค้นหาลูกค้า/เลขที่..."
              value={searchSchedule}
              onChange={(e) => setSearchSchedule(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 font-semibold">
              <tr>
                <th className="p-3">ลูกค้า / โครงการ</th>
                <th className="p-3">เลขที่อินวอยซ์</th>
                <th className="p-3">วันครบกำหนดเดิม</th>
                <th className="p-3">วันคาดว่าจะได้รับเงิน</th>
                <th className="p-3 text-right">ยอดหนี้ค้างชำระ</th>
                <th className="p-3 text-center">โอกาสเก็บเงิน (%)</th>
                <th className="p-3 text-right">ยอดคาดการณ์สุทธิ</th>
                <th className="p-3 text-center">ความเสี่ยง</th>
                <th className="p-3 text-center">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSchedule.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                    ไม่พบรายการลูกหนี้ตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredSchedule.map((item, idx) => (
                  <tr key={`${item.invoiceNo}-${idx}`} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {item.customerName}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 font-mono">
                      {item.invoiceNo}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400">
                      {item.originalDueDate}
                    </td>
                    <td className="p-3 font-medium text-blue-600 dark:text-blue-400">
                      {item.adjustedDueDate}
                    </td>
                    <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                      ฿{item.outstandingAmount.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {(item.expectedProbability * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ฿{Math.round(item.expectedInflow).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.riskLevel === 'Low'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : item.riskLevel === 'Medium'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {onOpenDebtDraft && item.overdueDays > 0 ? (
                        <button
                          onClick={() => onOpenDebtDraft(item.customerName, item.invoiceNo, item.outstandingAmount, item.overdueDays)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                        >
                          ร่างทวงถาม
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">ปกติ</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashFlowForecastView;
