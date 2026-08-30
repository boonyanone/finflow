import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  InvoiceRecord,
  Customer,
  ArAgingBucket,
  CashFlowScenarioParams,
  WeeklyCashBucket,
  CustomerCashInflowItem,
} from '../types';
import { CashFlowHeaderBanner } from '../components/cashflow/CashFlowHeaderBanner';
import { CashFlowKpis } from '../components/cashflow/CashFlowKpis';
import { CashFlowSimulatorControls } from '../components/cashflow/CashFlowSimulatorControls';
import { CashFlowTimelineChart } from '../components/cashflow/CashFlowTimelineChart';
import { CashFlowAiActionCard } from '../components/cashflow/CashFlowAiActionCard';
import { CashFlowInflowTable } from '../components/cashflow/CashFlowInflowTable';

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
    const outstandingInvoices = invoices.filter(
      (inv) => inv.outstandingAmount > 0 || inv.status === 'Pending' || inv.status === 'Overdue'
    );

    return outstandingInvoices.map((inv) => {
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

      const originalDue = new Date(inv.dueDate || inv.date);
      const shiftDays = params.paymentDelayDays;
      const adjustedDate = new Date(originalDue);
      adjustedDate.setDate(adjustedDate.getDate() + shiftDays);

      const amount = inv.outstandingAmount || inv.netAmount;
      const discountEligible = params.earlyPaymentDiscountPct > 0 && inv.overdueDays <= 15;
      const discountRatio = discountEligible ? params.earlyPaymentDiscountPct / 100 : 0;
      const discountedAmount = amount * (1 - discountRatio);
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

      const arItemsInWeek = inflowSchedule.filter((item) => {
        return item.adjustedDueDate >= startStr && item.adjustedDueDate <= endStr;
      });

      const arBaseInflow = arItemsInWeek.reduce((sum, item) => sum + item.amount, 0);
      const arScenarioInflow = arItemsInWeek.reduce((sum, item) => sum + item.expectedInflow, 0);
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

    const avgMonthlyBurn = params.monthlyFixedOpex + 150000;
    const runwayMonths = avgMonthlyBurn > 0 ? (params.openingCashBalance / avgMonthlyBurn).toFixed(1) : '12+';

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
      if (
        searchSchedule &&
        !item.customerName.toLowerCase().includes(searchSchedule.toLowerCase()) &&
        !item.invoiceNo.toLowerCase().includes(searchSchedule.toLowerCase())
      ) {
        return false;
      }

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
      <CashFlowHeaderBanner
        healthColor={metrics.healthColor}
        healthLabel={metrics.healthLabel}
        selectedPreset={selectedPreset}
        onApplyPreset={handleApplyPreset}
        onExportExcel={handleExportExcel}
      />

      {/* 2. Executive KPI Summary Cards */}
      <CashFlowKpis
        day30Inflow={metrics.day30Inflow}
        totalOutstandingAR={metrics.totalOutstandingAR}
        day90Inflow={metrics.day90Inflow}
        finalCashBalance={metrics.finalCashBalance}
        minSafetyCash={params.minSafetyCash}
        inflowCount={inflowSchedule.length}
      />

      {/* 3. Interactive What-If Scenario Control Panel */}
      <CashFlowSimulatorControls
        params={params}
        setParams={setParams}
        onReset={() => handleApplyPreset('baseline')}
        showAdvancedParams={showAdvancedParams}
        setShowAdvancedParams={setShowAdvancedParams}
      />

      {/* 4. Visual Charts: 12-Week Rolling Cash Flow & AI Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <CashFlowTimelineChart
            weeklyForecast={weeklyForecast}
            minSafetyCash={params.minSafetyCash}
          />
        </div>
        <CashFlowAiActionCard
          healthStatus={metrics.healthStatus}
          finalCashBalance={metrics.finalCashBalance}
          runwayMonths={metrics.runwayMonths}
          minCashBalanceInPeriod={metrics.minCashBalanceInPeriod}
          inflowSchedule={inflowSchedule}
          onOpenCopilot={onOpenCopilot}
        />
      </div>

      {/* 5. Detailed Receivables Inflow Schedule Table */}
      <CashFlowInflowTable
        filteredSchedule={filteredSchedule}
        scheduleFilter={scheduleFilter}
        setScheduleFilter={setScheduleFilter}
        searchSchedule={searchSchedule}
        setSearchSchedule={setSearchSchedule}
        onOpenDebtDraft={onOpenDebtDraft}
      />
    </div>
  );
};

export default CashFlowForecastView;
