import React, { useState, useMemo } from 'react';
import {
  Clock,
  DollarSign,
  Sparkles,
  Search,
  X,
  TrendingDown,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { ArAgingBucket, Customer, InvoiceRecord } from '../types';

// Sub-components
import { ArAgingBands, ArFilterType } from '../components/ar/ArAgingBands';
import { ArEclProvisionChart } from '../components/ar/ArEclProvisionChart';
import { TopDebtorsConcentration } from '../components/ar/TopDebtorsConcentration';
import { ArAgingCustomerTable } from '../components/ar/ArAgingCustomerTable';
import { ArDsoSimulatorModal } from '../components/ar/ArDsoSimulatorModal';
import { ArExecutiveKpis } from '../components/ar/ArExecutiveKpis';

interface ArAgingViewProps {
  arBuckets: ArAgingBucket[];
  customers: Customer[];
  onOpenDebtDraft: (customer: string, invoiceNo: string, amount: number, overdueDays: number) => void;
  onDrillDown: (title: string, subtitle: string, records: InvoiceRecord[]) => void;
  invoices: InvoiceRecord[];
}

export const ArAgingView: React.FC<ArAgingViewProps> = ({
  arBuckets,
  customers,
  onOpenDebtDraft,
  onDrillDown,
  invoices,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<ArFilterType>('all');
  const [sortBy, setSortBy] = useState<'outstanding_desc' | 'overdue_desc' | 'credit_util_desc' | 'name_asc'>('outstanding_desc');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [showDsoSimulator, setShowDsoSimulator] = useState(false);
  const [targetDso, setTargetDso] = useState(25);

  // Helper to handle filter selection and auto-scroll smoothly to the table
  const handleSelectFilterWithScroll = (filter: ArFilterType) => {
    setSelectedRiskFilter(filter);
    if (filter !== 'all') {
      setTimeout(() => {
        const tableElem = document.getElementById('agingCustomerTableSection');
        if (tableElem) {
          tableElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    }
  };

  // 1. Calculate Real-time Customer AR Buckets dynamically from invoices & customer master data
  const customerAgingData = useMemo(() => {
    const customerMap = new Map<string, Customer>();
    customers.forEach((c) => {
      customerMap.set(c.id, c);
      customerMap.set(c.name, c);
    });

    const grouped = new Map<string, {
      customerId: string;
      customerName: string;
      group: string;
      creditLimit: number;
      salesRep: string;
      contactPerson: string;
      phone: string;
      email: string;
      status: string;
      current0_30: number;
      aging31_60: number;
      aging61_90: number;
      over90: number;
      totalOutstanding: number;
      totalSales: number;
      maxOverdueDays: number;
      invoices: InvoiceRecord[];
    }>();

    invoices.forEach((inv) => {
      const custKey = inv.customerId || inv.customerName;
      if (!grouped.has(custKey)) {
        const custInfo = customerMap.get(inv.customerId) || customerMap.get(inv.customerName);
        grouped.set(custKey, {
          customerId: inv.customerId || 'CUST-GEN',
          customerName: inv.customerName,
          group: custInfo?.group || 'ลูกค้ารายโครงการ',
          creditLimit: custInfo?.creditLimit || 2000000,
          salesRep: inv.salesRep || custInfo?.salesRep || 'ฝ่ายขายส่วนกลาง',
          contactPerson: custInfo?.contactPerson || 'ฝ่ายจัดซื้อ / การเงิน',
          phone: custInfo?.phone || '-',
          email: custInfo?.email || '-',
          status: custInfo?.status || 'Active',
          current0_30: 0,
          aging31_60: 0,
          aging61_90: 0,
          over90: 0,
          totalOutstanding: 0,
          totalSales: 0,
          maxOverdueDays: 0,
          invoices: [],
        });
      }

      const item = grouped.get(custKey)!;
      item.totalSales += inv.netAmount;
      item.invoices.push(inv);

      const dueAmt = inv.outstandingAmount;
      if (dueAmt > 0) {
        item.totalOutstanding += dueAmt;
        if (inv.overdueDays > item.maxOverdueDays) {
          item.maxOverdueDays = inv.overdueDays;
        }

        if (inv.overdueDays <= 30) {
          item.current0_30 += dueAmt;
        } else if (inv.overdueDays <= 60) {
          item.aging31_60 += dueAmt;
        } else if (inv.overdueDays <= 90) {
          item.aging61_90 += dueAmt;
        } else {
          item.over90 += dueAmt;
        }
      }
    });

    return Array.from(grouped.values());
  }, [invoices, customers]);

  // Aggregate totals
  const {
    total0_30,
    total31_60,
    total61_90,
    totalOver90,
    grandTotalAR,
    totalOverdue,
    overdueRatio,
    estimatedProvisionECL,
    dsoDays,
    cashReleased,
    overlimitAccountsCount,
  } = useMemo(() => {
    let t0 = 0;
    let t31 = 0;
    let t61 = 0;
    let t90 = 0;
    let totalSalesAll = 0;
    let overlimitCount = 0;

    customerAgingData.forEach((c) => {
      t0 += c.current0_30;
      t31 += c.aging31_60;
      t61 += c.aging61_90;
      t90 += c.over90;
      totalSalesAll += c.totalSales;
      if (c.creditLimit > 0 && c.totalOutstanding / c.creditLimit >= 0.85) {
        overlimitCount++;
      }
    });

    const grand = t0 + t31 + t61 + t90;
    const overdue = t31 + t61 + t90;
    const ratio = grand > 0 ? ((overdue / grand) * 100).toFixed(1) : '0.0';

    // ECL Expected Credit Loss Provision (TFRS 9 / IFRS 9 simplified matrix):
    // 0-30d: 1%, 31-60d: 5%, 61-90d: 20%, >90d: 65%
    const ecl = Math.round(t0 * 0.01 + t31 * 0.05 + t61 * 0.20 + t90 * 0.65);

    // Days Sales Outstanding (DSO) = (Total AR / Total Invoiced Sales in Period) * 90 days (assumed quarter)
    const annualSalesEst = totalSalesAll > 0 ? totalSalesAll : (grand * 4 || 1);
    const dso = Math.round((grand / (annualSalesEst / 90)) || 32);

    // Cash unlocked if DSO reduced to targetDso
    const dailySales = annualSalesEst / 90;
    const daysReduced = Math.max(0, dso - targetDso);
    const released = Math.round(daysReduced * dailySales);

    return {
      total0_30: t0,
      total31_60: t31,
      total61_90: t61,
      totalOver90: t90,
      grandTotalAR: grand,
      totalOverdue: overdue,
      overdueRatio: ratio,
      estimatedProvisionECL: ecl,
      dsoDays: dso,
      cashReleased: released,
      overlimitAccountsCount: overlimitCount,
    };
  }, [customerAgingData, targetDso]);

  // 2. Chart data for aging breakdown (matching ArEclProvisionChart contract)
  const agingChartData = useMemo(() => [
    {
      bucketKey: '0_30' as ArFilterType,
      name: '0-30 วัน (อยู่ในกำหนด)',
      shortName: '0-30 วัน',
      amount: total0_30,
      provision: Math.round(total0_30 * 0.01),
      rate: '1%',
      fill: '#10b981',
    },
    {
      bucketKey: '31_60' as ArFilterType,
      name: '31-60 วัน (เริ่มเตือน)',
      shortName: '31-60 วัน',
      amount: total31_60,
      provision: Math.round(total31_60 * 0.05),
      rate: '5%',
      fill: '#3b82f6',
    },
    {
      bucketKey: '61_90' as ArFilterType,
      name: '61-90 วัน (เฝ้าระวังเข้ม)',
      shortName: '61-90 วัน',
      amount: total61_90,
      provision: Math.round(total61_90 * 0.20),
      rate: '20%',
      fill: '#f59e0b',
    },
    {
      bucketKey: 'over90' as ArFilterType,
      name: '>90 วัน (หนี้วิกฤต/NPL)',
      shortName: '>90 วัน',
      amount: totalOver90,
      provision: Math.round(totalOver90 * 0.65),
      rate: '65%',
      fill: '#ef4444',
    },
  ], [total0_30, total31_60, total61_90, totalOver90]);

  // 3. Top Debtors Chart Data (matching TopDebtorsConcentration contract)
  const topDebtorsChartData = useMemo(() => {
    return [...customerAgingData]
      .filter((c) => c.totalOutstanding > 0)
      .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
      .slice(0, 5)
      .map((c) => ({
        name: c.customerName.length > 16 ? c.customerName.substring(0, 16) + '...' : c.customerName,
        fullName: c.customerName,
        customerId: c.customerId,
        current: c.current0_30,
        overdue: c.aging31_60 + c.aging61_90 + c.over90,
        totalOutstanding: c.totalOutstanding,
        creditLimit: c.creditLimit,
        utilizationPct: c.creditLimit > 0 ? Math.min(100, Math.round((c.totalOutstanding / c.creditLimit) * 100)) : 0,
        invoices: c.invoices.filter((i) => i.outstandingAmount > 0),
      }));
  }, [customerAgingData]);

  // Filtered & Sorted Customer Data
  const filteredAndSorted = useMemo(() => {
    return customerAgingData.filter((c) => {
      // Search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = c.customerName.toLowerCase().includes(term);
        const matchId = c.customerId.toLowerCase().includes(term);
        const matchRep = c.salesRep.toLowerCase().includes(term);
        if (!matchName && !matchId && !matchRep) return false;
      }

      // Risk / Bucket Filter
      if (selectedRiskFilter === '0_30') return c.current0_30 > 0;
      if (selectedRiskFilter === '31_60') return c.aging31_60 > 0;
      if (selectedRiskFilter === '61_90') return c.aging61_90 > 0;
      if (selectedRiskFilter === 'over90') return c.over90 > 0;
      if (selectedRiskFilter === 'overdue') return (c.aging31_60 + c.aging61_90 + c.over90) > 0;
      if (selectedRiskFilter === 'high_risk') return c.over90 > 0 || (c.creditLimit > 0 && c.totalOutstanding > c.creditLimit);
      if (selectedRiskFilter === 'overlimit') return c.creditLimit > 0 && (c.totalOutstanding / c.creditLimit) >= 0.85;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'outstanding_desc') return b.totalOutstanding - a.totalOutstanding;
      if (sortBy === 'overdue_desc') return (b.aging31_60 + b.aging61_90 + b.over90) - (a.aging31_60 + a.aging61_90 + a.over90);
      if (sortBy === 'credit_util_desc') {
        const utilA = a.creditLimit > 0 ? a.totalOutstanding / a.creditLimit : 0;
        const utilB = b.creditLimit > 0 ? b.totalOutstanding / b.creditLimit : 0;
        return utilB - utilA;
      }
      if (sortBy === 'name_asc') return a.customerName.localeCompare(b.customerName, 'th');
      return 0;
    });
  }, [customerAgingData, searchTerm, selectedRiskFilter, sortBy]);

  const toggleExpand = (customerId: string) => {
    setExpandedCustomerId(expandedCustomerId === customerId ? null : customerId);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Customer ID',
      'Customer Name',
      'Group',
      'Credit Limit',
      'Total Outstanding',
      '0-30 Days',
      '31-60 Days',
      '61-90 Days',
      'Over 90 Days',
      'Credit Utilization %',
      'Sales Rep',
      'Phone',
      'Email',
    ];

    const rows = filteredAndSorted.map((c) => [
      `"${c.customerId}"`,
      `"${c.customerName}"`,
      `"${c.group}"`,
      c.creditLimit,
      c.totalOutstanding,
      c.current0_30,
      c.aging31_60,
      c.aging61_90,
      c.over90,
      c.creditLimit > 0 ? ((c.totalOutstanding / c.creditLimit) * 100).toFixed(1) : 0,
      `"${c.salesRep}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinFlow_AR_Aging_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="viewArAging" className="view-panel space-y-6 w-full min-w-0">
      {/* 1. Header Banner & Quick Action */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Accounts Receivable Aging &amp; Credit Risk Matrix
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                TFRS 9 Standard
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ระบบวิเคราะห์อายุลูกหนี้การค้า คัดกรองระดับความเสี่ยง ประเมินวงเงินเครดิต และจำลองการปลดล็อกกระแสเงินสด
            </p>
          </div>
        </div>

        {/* DSO Simulator Trigger Button */}
        <button
          onClick={() => setShowDsoSimulator(!showDsoSimulator)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
        >
          <Calculator className="w-4 h-4" />
          <span>{showDsoSimulator ? 'ซ่อนตัวจำลองเงินสด' : 'เปิดตัวจำลองเป้าหมาย DSO'}</span>
        </button>
      </div>

      {/* DSO Interactive Simulator Banner */}
      <ArDsoSimulatorModal
        showDsoSimulator={showDsoSimulator}
        setShowDsoSimulator={setShowDsoSimulator}
        dsoDays={dsoDays}
        grandTotalAR={grandTotalAR}
        targetDso={targetDso}
        setTargetDso={setTargetDso}
        cashReleased={cashReleased}
      />

      {/* 2. Top Accounting & Credit Executive KPIs */}
      <ArExecutiveKpis
        grandTotalAR={grandTotalAR}
        outstandingCustomersCount={customerAgingData.filter((c) => c.totalOutstanding > 0).length}
        dsoDays={dsoDays}
        totalOverdue={totalOverdue}
        overdueRatio={overdueRatio}
        estimatedProvisionECL={estimatedProvisionECL}
        invoices={invoices}
        onDrillDown={onDrillDown}
        onOpenDsoSimulator={() => setShowDsoSimulator(true)}
      />

      {/* 3. Aging Breakdown Distribution Timeline Cards (Level 2) */}
      <ArAgingBands
        total0_30={total0_30}
        total31_60={total31_60}
        total61_90={total61_90}
        totalOver90={totalOver90}
        grandTotalAR={grandTotalAR}
        selectedRiskFilter={selectedRiskFilter}
        onSelectFilter={handleSelectFilterWithScroll}
        onDrillDown={onDrillDown}
        invoices={invoices}
      />

      {/* 4. Visual Credit & Aging Intelligence (Charts - Level 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full min-w-0">
        <ArEclProvisionChart
          agingChartData={agingChartData}
          grandTotalAR={grandTotalAR}
          total0_30={total0_30}
          total31_60={total31_60}
          total61_90={total61_90}
          totalOver90={totalOver90}
          onSelectFilter={handleSelectFilterWithScroll}
          onDrillDown={onDrillDown}
          invoices={invoices}
        />
        <TopDebtorsConcentration
          topDebtorsChartData={topDebtorsChartData}
          overlimitAccountsCount={overlimitAccountsCount}
          onDrillDown={onDrillDown}
        />
      </div>

      {/* 5. Customer Credit Risk & Aging Analysis Table (Level 4) */}
      <div id="agingCustomerTableSection" className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 scroll-mt-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อลูกค้า, รหัส, พนักงานขาย..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Risk Level & Bucket Filter Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'ทุกลูกหนี้' },
              { id: '0_30', label: '0-30 วัน (ในกำหนด)' },
              { id: '31_60', label: '31-60 วัน (เริ่มเตือน)' },
              { id: '61_90', label: '61-90 วัน (เฝ้าระวัง)' },
              { id: 'over90', label: '>90 วัน (วิกฤต)' },
              { id: 'overdue', label: 'เกินกำหนดทั้งหมด (>30d)' },
              { id: 'high_risk', label: 'เสี่ยงสูง / Hold' },
              { id: 'overlimit', label: 'วงเงินตึงตัว (>85%)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSelectFilterWithScroll(tab.id as ArFilterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedRiskFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {selectedRiskFilter !== 'all' && (
              <button
                onClick={() => handleSelectFilterWithScroll('all')}
                className="px-2 py-1 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 transition flex items-center gap-1 cursor-pointer"
                title="ล้างตัวกรอง"
              >
                <X className="w-3 h-3" />
                <span>ล้างกรอง</span>
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 shrink-0 self-end lg:self-auto text-xs">
            <span className="text-slate-400 font-medium">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="outstanding_desc">ยอดหนี้ค้างสูงสุด (Top Outstanding)</option>
              <option value="overdue_desc">ยอดเกินกำหนดสูงสุด (Highest Overdue)</option>
              <option value="credit_util_desc">% ใช้วงเงินสูงสุด (Highest Credit %)</option>
              <option value="name_asc">ชื่อลูกค้า (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Master Aging Table */}
        <ArAgingCustomerTable
          filteredAndSorted={filteredAndSorted}
          expandedCustomerId={expandedCustomerId}
          toggleExpand={toggleExpand}
          onOpenDebtDraft={onOpenDebtDraft}
          onDrillDown={onDrillDown}
          onExportCsv={handleExportCsv}
        />
      </div>
    </div>
  );
};

export default ArAgingView;
