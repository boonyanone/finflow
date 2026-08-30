import React, { useState, useMemo } from 'react';
import {
  Clock,
  DollarSign,
  Calendar,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Filter,
  X,
  TrendingDown,
  Calculator,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ArAgingBucket, Customer, InvoiceRecord } from '../types';

// Sub-components
import { ArAgingBands, ArFilterType } from '../components/ar/ArAgingBands';
import { ArEclProvisionChart } from '../components/ar/ArEclProvisionChart';
import { TopDebtorsConcentration } from '../components/ar/TopDebtorsConcentration';
import { ArAgingCustomerTable } from '../components/ar/ArAgingCustomerTable';

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

      const entry = grouped.get(custKey)!;
      entry.totalSales += inv.netAmount;
      entry.invoices.push(inv);

      if (inv.outstandingAmount > 0) {
        entry.totalOutstanding += inv.outstandingAmount;
        if (inv.overdueDays > entry.maxOverdueDays) {
          entry.maxOverdueDays = inv.overdueDays;
        }

        if (inv.overdueDays <= 30) {
          entry.current0_30 += inv.outstandingAmount;
        } else if (inv.overdueDays <= 60) {
          entry.aging31_60 += inv.outstandingAmount;
        } else if (inv.overdueDays <= 90) {
          entry.aging61_90 += inv.outstandingAmount;
        } else {
          entry.over90 += inv.outstandingAmount;
        }
      }
    });

    arBuckets.forEach((b) => {
      const key = b.customerId || b.customerName;
      if (!grouped.has(key)) {
        const custInfo = customerMap.get(b.customerId) || customerMap.get(b.customerName);
        grouped.set(key, {
          customerId: b.customerId,
          customerName: b.customerName,
          group: custInfo?.group || 'ลูกค้ารายโครงการ',
          creditLimit: b.creditLimit || custInfo?.creditLimit || 1500000,
          salesRep: custInfo?.salesRep || 'ฝ่ายขายส่วนกลาง',
          contactPerson: custInfo?.contactPerson || 'ฝ่ายจัดซื้อ',
          phone: custInfo?.phone || '-',
          email: custInfo?.email || '-',
          status: custInfo?.status || 'Active',
          current0_30: b.current0_30,
          aging31_60: b.aging31_60,
          aging61_90: b.aging61_90,
          over90: b.over90,
          totalOutstanding: b.totalOutstanding,
          totalSales: b.totalOutstanding * 1.5,
          maxOverdueDays: b.aging61_90 > 0 ? 65 : b.aging31_60 > 0 ? 45 : 15,
          invoices: [],
        });
      }
    });

    return Array.from(grouped.values()).filter((c) => c.totalOutstanding > 0 || c.totalSales > 0);
  }, [invoices, customers, arBuckets]);

  // 2. Aggregate Financial Accounting Metrics
  const total0_30 = customerAgingData.reduce((acc, b) => acc + b.current0_30, 0);
  const total31_60 = customerAgingData.reduce((acc, b) => acc + b.aging31_60, 0);
  const total61_90 = customerAgingData.reduce((acc, b) => acc + b.aging61_90, 0);
  const totalOver90 = customerAgingData.reduce((acc, b) => acc + b.over90, 0);
  const grandTotalAR = total0_30 + total31_60 + total61_90 + totalOver90;

  const totalOverdue = total31_60 + total61_90 + totalOver90;
  const overdueRatio = grandTotalAR > 0 ? ((totalOverdue / grandTotalAR) * 100).toFixed(1) : '0.0';

  const totalCreditSales = invoices.reduce((acc, r) => acc + r.netAmount, 0) || 5473200;
  const dsoDays = totalCreditSales > 0 ? Math.round((grandTotalAR / totalCreditSales) * 180) : 32;

  const estimatedProvisionECL = Math.round(
    total0_30 * 0.01 + total31_60 * 0.05 + total61_90 * 0.25 + totalOver90 * 0.60
  );

  const overlimitAccountsCount = customerAgingData.filter(
    (c) => c.totalOutstanding >= c.creditLimit * 0.85
  ).length;

  // Working Capital Impact Calculation for Simulator
  const dailySales = totalCreditSales / 180;
  const cashReleased = Math.max(0, Math.round((dsoDays - targetDso) * dailySales));

  // 3. Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let list = customerAgingData.filter((c) => {
      const matchSearch =
        !searchTerm ||
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.salesRep.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (selectedRiskFilter === '0_30') return c.current0_30 > 0;
      if (selectedRiskFilter === '31_60') return c.aging31_60 > 0;
      if (selectedRiskFilter === '61_90') return c.aging61_90 > 0;
      if (selectedRiskFilter === 'over90') return c.over90 > 0;
      if (selectedRiskFilter === 'current') return c.current0_30 > 0 && c.aging31_60 === 0 && c.aging61_90 === 0 && c.over90 === 0;
      if (selectedRiskFilter === 'overdue') return c.aging31_60 > 0 || c.aging61_90 > 0 || c.over90 > 0;
      if (selectedRiskFilter === 'high_risk') return c.aging61_90 > 0 || c.over90 > 0 || c.status === 'Credit Hold';
      if (selectedRiskFilter === 'overlimit') return c.totalOutstanding >= c.creditLimit * 0.85;

      return true;
    });

    list.sort((a, b) => {
      if (sortBy === 'outstanding_desc') return b.totalOutstanding - a.totalOutstanding;
      if (sortBy === 'overdue_desc') return (b.aging31_60 + b.aging61_90 + b.over90) - (a.aging31_60 + a.aging61_90 + a.over90);
      if (sortBy === 'credit_util_desc') return (b.totalOutstanding / (b.creditLimit || 1)) - (a.totalOutstanding / (a.creditLimit || 1));
      if (sortBy === 'name_asc') return a.customerName.localeCompare(b.customerName, 'th');
      return 0;
    });

    return list;
  }, [customerAgingData, searchTerm, selectedRiskFilter, sortBy]);

  // Chart 1: Aging Buckets & ECL Loss Provision Chart Data
  const agingChartData = useMemo(() => {
    return [
      {
        bucketKey: '0_30' as ArFilterType,
        name: '0-30 วัน (Current)',
        shortName: '0-30 วัน',
        amount: total0_30,
        provision: Math.round(total0_30 * 0.01),
        rate: '1%',
        fill: '#10b981',
      },
      {
        bucketKey: '31_60' as ArFilterType,
        name: '31-60 วัน (Overdue)',
        shortName: '31-60 วัน',
        amount: total31_60,
        provision: Math.round(total31_60 * 0.05),
        rate: '5%',
        fill: '#3b82f6',
      },
      {
        bucketKey: '61_90' as ArFilterType,
        name: '61-90 วัน (High Risk)',
        shortName: '61-90 วัน',
        amount: total61_90,
        provision: Math.round(total61_90 * 0.25),
        rate: '25%',
        fill: '#f59e0b',
      },
      {
        bucketKey: 'over90' as ArFilterType,
        name: '> 90 วัน (Bad Debt)',
        shortName: '> 90 วัน',
        amount: totalOver90,
        provision: Math.round(totalOver90 * 0.60),
        rate: '60%',
        fill: '#ef4444',
      },
    ];
  }, [total0_30, total31_60, total61_90, totalOver90]);

  // Chart 2: Top 5 Highest Outstanding Debtors Exposure vs Credit Limit
  const topDebtorsChartData = useMemo(() => {
    return [...customerAgingData]
      .filter((c) => c.totalOutstanding > 0)
      .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
      .slice(0, 5)
      .map((c) => {
        const overdue = c.aging31_60 + c.aging61_90 + c.over90;
        const displayName = c.customerName.replace('บจก.', '').replace('จำกัด', '').trim();
        return {
          name: displayName.length > 18 ? displayName.substring(0, 16) + '...' : displayName,
          fullName: c.customerName,
          customerId: c.customerId,
          current: c.current0_30,
          overdue: overdue,
          totalOutstanding: c.totalOutstanding,
          creditLimit: c.creditLimit,
          utilizationPct: c.creditLimit > 0 ? Math.round((c.totalOutstanding / c.creditLimit) * 100) : 0,
          invoices: c.invoices,
        };
      });
  }, [customerAgingData]);

  const toggleExpand = (id: string) => {
    setExpandedCustomerId((prev) => (prev === id ? null : id));
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Customer ID',
      'Customer Name',
      'Group',
      'Sales Rep',
      'Credit Limit',
      '0-30 Days',
      '31-60 Days',
      '61-90 Days',
      '>90 Days',
      'Total Outstanding',
      'Max Overdue Days',
      'Status',
    ];

    const rows = filteredAndSorted.map((c) => [
      `"${c.customerId}"`,
      `"${c.customerName}"`,
      `"${c.group}"`,
      `"${c.salesRep}"`,
      c.creditLimit,
      c.current0_30,
      c.aging31_60,
      c.aging61_90,
      c.over90,
      c.totalOutstanding,
      c.maxOverdueDays,
      `"${c.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AR_Aging_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="viewAging" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0 pb-12">
      {/* 1. Header with Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Finance /</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">A/R Aging &amp; Collections</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
              AUDIT READY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            วิเคราะห์อายุลูกหนี้ &amp; บริหารความเสี่ยงสินเชื่อ (A/R Aging)
          </h1>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowDsoSimulator(!showDsoSimulator)}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200/80 dark:border-slate-700"
          >
            <Calculator className="w-3.5 h-3.5 text-indigo-600" />
            <span>จำลองเป้า DSO &amp; เงินสด</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenDebtDraft('บจก. เบทาฟู้ดส์ โพลทรี่ โพรเซสซิ่ง', 'INV-2026-CR13', 368800, 63)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>AI ร่างหนังสือทวงหนี้</span>
          </button>
        </div>
      </div>

      {/* DSO & Working Capital Simulator Drawer/Card (if open) */}
      {showDsoSimulator && (
        <div className="bg-gradient-to-br from-indigo-50/95 via-slate-50 to-blue-50/90 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 text-slate-900 dark:text-white p-5 sm:p-6 rounded-2xl border border-indigo-200/90 dark:border-indigo-800/80 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  เครื่องมือจำลองเป้าหมาย DSO &amp; ผลกระทบกระแสเงินสดหมุนเวียน
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  ประเมินมูลค่าเงินสดที่จะถูกปลดล็อกเข้าบริษัททันที หากเร่งรัดเก็บเงินได้ตามเป้าหมาย
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDsoSimulator(false)}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Current DSO */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl p-4 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                DSO ปัจจุบัน (Current DSO)
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white mt-1.5">
                {dsoDays} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">วัน</span>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1.5 block">
                ยอดหนี้คงค้างรวม: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">฿{grandTotalAR.toLocaleString()}</strong>
              </span>
            </div>

            {/* Target DSO Slider */}
            <div className="bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 rounded-xl p-4 shadow-2xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  ปรับเป้าหมาย DSO ใหม่:
                </span>
                <span className="font-black font-mono text-indigo-600 dark:text-indigo-400 text-lg px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800">
                  {targetDso} วัน
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={45}
                value={targetDso}
                onChange={(e) => setTargetDso(Number(e.target.value))}
                className="w-full accent-indigo-600 dark:accent-indigo-400 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-emerald-700 dark:text-emerald-400">15 วัน (เร่งด่วน)</span>
                <span className="text-indigo-600 dark:text-indigo-300">30 วัน (มาตรฐาน)</span>
                <span className="text-amber-700 dark:text-amber-400">45 วัน (เพดาน)</span>
              </div>
            </div>

            {/* Cash Released Result */}
            <div className="bg-emerald-50/95 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700/80 rounded-xl p-4 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 block">
                เงินสดหมุนเวียนที่ปลดล็อกได้ (Cash Released)
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1.5">
                +฿{cashReleased.toLocaleString()}
              </div>
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 mt-1.5 block">
                {targetDso < dsoDays
                  ? `✓ เร่งเก็บหนี้เร็วขึ้น ${dsoDays - targetDso} วัน เพิ่มสภาพคล่องเงินสด`
                  : '⚠ ตั้งเป้าหมาย DSO ให้ต่ำกว่าปัจจุบันเพื่อดูยอดเงินสดที่ปลดล็อก'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Accounting & Credit Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* KPI 1: Total AR Outstanding */}
        <div
          onClick={() => onDrillDown(
            'ยอดลูกหนี้คงค้างทั้งหมด (Total AR Portfolio)',
            `รายการใบแจ้งหนี้ที่มีหนี้คงเหลือทั้งหมด (${invoices.filter((i) => i.outstandingAmount > 0).length} รายการ)`,
            invoices.filter((i) => i.outstandingAmount > 0)
          )}
          className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              TOTAL AR (ลูกหนี้คงเหลือ)
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight font-mono">
              ฿{grandTotalAR.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>{customerAgingData.filter((c) => c.totalOutstanding > 0).length} ลูกหนี้ที่มียอดค้าง</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
                เจาะลึกบิล <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Days Sales Outstanding (DSO) */}
        <div
          onClick={() => setShowDsoSimulator(true)}
          className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              DSO (ระยะเวลาเก็บหนี้เฉลี่ย)
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-[28px] font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {dsoDays}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">วัน</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                เป้า &lt;45 วัน
              </span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>เร็วกว่าเกณฑ์ 13 วัน</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5">
                จำลองเงินสด <Calculator className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Overdue Amount */}
        <div
          onClick={() => {
            const overdueInvoices = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 30);
            onDrillDown(
              'ยอดหนี้เกินกำหนดทั้งหมด (Total Overdue AR > 30 Days)',
              `รายการใบแจ้งหนี้ที่เกินกำหนดรอบแรกขึ้นไป (${overdueInvoices.length} รายการ | รวม ฿${totalOverdue.toLocaleString()})`,
              overdueInvoices
            );
          }}
          className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              OVERDUE AR (หนี้เกินกำหนด)
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-[28px] font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
              ฿{totalOverdue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>สัดส่วนหนี้เกินกำหนด {overdueRatio}%</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 group-hover:underline flex items-center gap-0.5">
                เจาะลึกบิล <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: ECL Provision */}
        <div
          onClick={() => {
            const highRiskInvoices = invoices.filter((i) => i.outstandingAmount > 0 && i.overdueDays > 60);
            onDrillDown(
              'หนี้ที่ต้องตั้งสำรองสูงตาม TFRS 9 (Stage 2 & Stage 3)',
              `รายการใบแจ้งหนี้ค้างเกิน 60 วัน (${highRiskInvoices.length} รายการ | ประมาณการสำรอง ฿${estimatedProvisionECL.toLocaleString()})`,
              highRiskInvoices
            );
          }}
          className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 hover:border-rose-400 rounded-2xl p-5 shadow-xs flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              ECL PROVISION (สำรองหนี้สูญ)
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-[28px] font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
              ฿{estimatedProvisionECL.toLocaleString()}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>เกณฑ์ TFRS 9</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 group-hover:underline flex items-center gap-0.5">
                เจาะลึกบิล <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

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
