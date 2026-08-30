import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  InvoiceRecord,
  Customer,
  SalesTargetItem,
  CommissionSchemeConfig,
  SalesRepAttainment,
} from '../types';
import { SalesCommissionHeader } from '../components/sales/SalesCommissionHeader';
import { SalesCommissionKpis } from '../components/sales/SalesCommissionKpis';
import { SalesCommissionSchemeSimulator } from '../components/sales/SalesCommissionSchemeSimulator';
import { SalesCommissionCharts } from '../components/sales/SalesCommissionCharts';
import { SalesLeaderboardTable } from '../components/sales/SalesLeaderboardTable';
import { SalesTargetEditModal } from '../components/sales/SalesTargetEditModal';

interface SalesTargetCommissionViewProps {
  invoices: InvoiceRecord[];
  customers: Customer[];
  onOpenCopilot?: () => void;
}

export const SalesTargetCommissionView: React.FC<SalesTargetCommissionViewProps> = ({
  invoices,
  onOpenCopilot,
}) => {
  // 1. Quota & Target Configuration State
  const initialTargets: Record<string, SalesTargetItem> = {
    'สมชาย ยอดนักขาย': {
      salesRep: 'สมชาย ยอดนักขาย',
      targetRevenue: 2500000,
      targetGrossMarginPct: 35.0,
      targetNewAccounts: 5,
      period: '2026-Q1',
      department: 'Enterprise Sales',
    },
    'วิภา บริการดี': {
      salesRep: 'วิภา บริการดี',
      targetRevenue: 2000000,
      targetGrossMarginPct: 38.0,
      targetNewAccounts: 4,
      period: '2026-Q1',
      department: 'SMB Sales',
    },
    'กิตติศักดิ์ นักปิดดีล': {
      salesRep: 'กิตติศักดิ์ นักปิดดีล',
      targetRevenue: 1800000,
      targetGrossMarginPct: 32.0,
      targetNewAccounts: 3,
      period: '2026-Q1',
      department: 'SMB Sales',
    },
    'นภัสสร คล่องแคล่ว': {
      salesRep: 'นภัสสร คล่องแคล่ว',
      targetRevenue: 1500000,
      targetGrossMarginPct: 30.0,
      targetNewAccounts: 3,
      period: '2026-Q1',
      department: 'Inside Sales',
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
      <SalesCommissionHeader
        teamAttainmentPct={teamMetrics.teamAttainmentPct}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        onOpenTargetModal={() => {
          setTempTargets(targets);
          setIsEditingTargets(true);
        }}
        onExportExcel={handleExportExcel}
      />

      {/* 2. Executive KPI Scorecards */}
      <SalesCommissionKpis
        totalActual={teamMetrics.totalActual}
        totalTarget={teamMetrics.totalTarget}
        teamAttainmentPct={teamMetrics.teamAttainmentPct}
        totalCommissionPool={teamMetrics.totalCommissionPool}
        teamMarginPct={teamMetrics.teamMarginPct}
        totalGrossProfit={teamMetrics.totalGrossProfit}
        topPerformer={teamMetrics.topPerformer}
      />

      {/* 3. Interactive Commission Policy & Calculation Simulator */}
      <SalesCommissionSchemeSimulator
        scheme={scheme}
        setScheme={setScheme}
        defaultScheme={defaultScheme}
        showSchemeEditor={showSchemeEditor}
        setShowSchemeEditor={setShowSchemeEditor}
      />

      {/* 4. Visual Comparison Charts & AI Insights */}
      <SalesCommissionCharts
        repAttainments={repAttainments}
        teamAttainmentPct={teamMetrics.teamAttainmentPct}
        topPerformer={teamMetrics.topPerformer}
        onOpenCopilot={onOpenCopilot}
      />

      {/* 5. Sales Rep Attainment & Settlement Table */}
      <SalesLeaderboardTable
        filteredAttainments={filteredAttainments}
        selectedPeriod={selectedPeriod}
        activeTabFilter={activeTabFilter}
        setActiveTabFilter={setActiveTabFilter}
        searchRep={searchRep}
        setSearchRep={setSearchRep}
      />

      {/* 6. Target Setting Modal */}
      <SalesTargetEditModal
        isOpen={isEditingTargets}
        onClose={() => setIsEditingTargets(false)}
        repsList={repsList}
        tempTargets={tempTargets}
        setTempTargets={setTempTargets}
        selectedPeriod={selectedPeriod}
        onSave={handleSaveTargets}
      />
    </div>
  );
};

export default SalesTargetCommissionView;
