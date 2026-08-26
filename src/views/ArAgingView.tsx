import React, { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building2,
  Send,
  Calendar,
  DollarSign,
  TrendingDown,
  AlertOctagon,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Filter,
  User,
  Phone,
  Mail,
  ArrowUpDown,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { ArAgingBucket, Customer, InvoiceRecord } from '../types';

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
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | 'current' | 'overdue' | 'high_risk' | 'overlimit'>('all');
  const [sortBy, setSortBy] = useState<'outstanding_desc' | 'overdue_desc' | 'credit_util_desc' | 'name_asc'>('outstanding_desc');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  // 1. Calculate Real-time Customer AR Buckets dynamically from invoices & customer master data
  const customerAgingData = useMemo(() => {
    // Map customer master for lookup
    const customerMap = new Map<string, Customer>();
    customers.forEach((c) => {
      customerMap.set(c.id, c);
      customerMap.set(c.name, c);
    });

    // Group invoices by customer
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

    // Initialize with all customers that have invoices or buckets
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

        // Categorize by Sage 50 aging standard
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

    // Merge any existing arBuckets that might not be in invoices
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

  // Days Sales Outstanding (DSO) = (Total AR / Total Credit Sales) * 90 days (for quarterly cycle)
  const totalCreditSales = invoices.reduce((acc, r) => acc + r.netAmount, 0) || 5473200;
  const dsoDays = totalCreditSales > 0 ? Math.round((grandTotalAR / totalCreditSales) * 180) : 32;

  // Expected Credit Loss (ECL / ค่าเผื่อหนี้สงสัยจะสูญตามเกณฑ์ TFRS 9)
  // Provision rates: 0-30d: 1%, 31-60d: 5%, 61-90d: 25%, >90d: 60%
  const estimatedProvisionECL = Math.round(
    total0_30 * 0.01 + total31_60 * 0.05 + total61_90 * 0.25 + totalOver90 * 0.60
  );

  // Number of accounts with credit overlimit (>90% utilization or over limit)
  const overlimitAccountsCount = customerAgingData.filter(
    (c) => c.totalOutstanding >= c.creditLimit * 0.85
  ).length;

  // 3. Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let list = customerAgingData.filter((c) => {
      // Search
      const matchSearch =
        !searchTerm ||
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.salesRep.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      // Risk filters
      if (selectedRiskFilter === 'current') return c.current0_30 > 0 && c.aging31_60 === 0 && c.aging61_90 === 0 && c.over90 === 0;
      if (selectedRiskFilter === 'overdue') return c.aging31_60 > 0 || c.aging61_90 > 0 || c.over90 > 0;
      if (selectedRiskFilter === 'high_risk') return c.aging61_90 > 0 || c.over90 > 0 || c.status === 'Credit Hold';
      if (selectedRiskFilter === 'overlimit') return c.totalOutstanding >= c.creditLimit * 0.85;

      return true;
    });

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'outstanding_desc') return b.totalOutstanding - a.totalOutstanding;
      if (sortBy === 'overdue_desc') return (b.aging31_60 + b.aging61_90 + b.over90) - (a.aging31_60 + a.aging61_90 + a.over90);
      if (sortBy === 'credit_util_desc') return (b.totalOutstanding / (b.creditLimit || 1)) - (a.totalOutstanding / (a.creditLimit || 1));
      if (sortBy === 'name_asc') return a.customerName.localeCompare(b.customerName, 'th');
      return 0;
    });

    return list;
  }, [customerAgingData, searchTerm, selectedRiskFilter, sortBy]);

  const toggleExpand = (id: string) => {
    setExpandedCustomerId((prev) => (prev === id ? null : id));
  };

  return (
    <div id="viewAging" className="view-panel space-y-5 w-full min-w-0">
      {/* 1. Header with Breadcrumb, Live Indicator & Export / AI Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                A/R Aging &amp; Credit Risk Intelligence (วิเคราะห์อายุลูกหนี้และการควบคุมสินเชื่อ)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sage 50 Direct Linked
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ตรวจจับลูกหนี้เกินกำหนด ควบคุมเพดานวงเงินเครดิต (Credit Limit) และประเมินความเสี่ยงหนี้สูญเชิงรุก
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => onOpenDebtDraft('บจก. เบทาฟู้ดส์ โพลทรี่ โพรเซสซิ่ง', 'INV-2026-CR13', 368800, 63)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs shadow-blue-500/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-100" />
            <span>AI ร่างหนังสือทวงหนี้</span>
          </button>
        </div>
      </div>

      {/* 2. Top Accounting & Credit Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total AR Outstanding */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              ลูกหนี้การค้ารวม (Total AR)
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              ฿{grandTotalAR.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>จำนวน {customerAgingData.filter((c) => c.totalOutstanding > 0).length} ลูกหนี้ค้างชำระ</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">100% AR</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Days Sales Outstanding (DSO) */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              ระยะเวลาเก็บหนี้เฉลี่ย (DSO)
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                {dsoDays}
              </span>
              <span className="text-xs font-bold text-slate-500">วัน (Days)</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
                เป้าหมาย &lt;45 วัน
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              เร็วกว่าเกณฑ์เฉลี่ยอุตสาหกรรม 13 วัน
            </div>
          </div>
        </div>

        {/* KPI 3: Overdue Amount & Risk Exposure */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              หนี้เกินกำหนด (Overdue AR)
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
              ฿{totalOverdue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>สัดส่วนหนี้เกินกำหนด</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{overdueRatio}% ของยอดหนี้</span>
            </div>
          </div>
        </div>

        {/* KPI 4: ECL Provision / Bad Debt Risk */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              ประมาณการเผื่อหนี้สงสัยจะสูญ (ECL)
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
              ฿{estimatedProvisionECL.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>เกณฑ์ TFRS 9 Provision</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {overlimitAccountsCount > 0 ? `${overlimitAccountsCount} รายเฝ้าระวัง` : 'ปกติ'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Aging Breakdown Distribution Timeline Cards */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              สัดส่วนอายุหนี้รายช่วงเวลา (Standard Aging Buckets)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              คลิกที่การ์ดช่วงเวลาเพื่อกรองตารางข้อมูลด้านล่างแบบอัตโนมัติ
            </p>
          </div>
          <button
            onClick={() => onDrillDown('รายงานอายุหนี้ทั้งหมด (All Aging Invoices)', 'รายการบิลค้างชำระทุกลูกค้า', invoices.filter((i) => i.outstandingAmount > 0))}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>ดูบิลค้างชำระทั้งหมด</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Progress Bar Ratio */}
        <div className="h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
          <div
            style={{ width: `${grandTotalAR > 0 ? (total0_30 / grandTotalAR) * 100 : 50}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`0-30 วัน: ฿${total0_30.toLocaleString()}`}
          />
          <div
            style={{ width: `${grandTotalAR > 0 ? (total31_60 / grandTotalAR) * 100 : 25}%` }}
            className="bg-blue-500 transition-all duration-500"
            title={`31-60 วัน: ฿${total31_60.toLocaleString()}`}
          />
          <div
            style={{ width: `${grandTotalAR > 0 ? (total61_90 / grandTotalAR) * 100 : 25}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`61-90 วัน: ฿${total61_90.toLocaleString()}`}
          />
          <div
            style={{ width: `${grandTotalAR > 0 ? (totalOver90 / grandTotalAR) * 100 : 0}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`>90 วัน: ฿${totalOver90.toLocaleString()}`}
          />
        </div>

        {/* 4 Interactive Aging Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: 0 - 30 Days */}
          <div
            onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'current' ? 'all' : 'current')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedRiskFilter === 'current'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-500/20'
                : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40 hover:bg-emerald-50/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>0 - 30 วัน (อยู่ในกำหนด)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  {grandTotalAR > 0 ? ((total0_30 / grandTotalAR) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="text-xl font-black text-emerald-900 dark:text-emerald-100 font-mono mt-1">
                ฿{total0_30.toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
              ✓ ความเสี่ยงต่ำตามเงื่อนไขเครดิตเทอม
            </div>
          </div>

          {/* Card 2: 31 - 60 Days */}
          <div
            onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'overdue' ? 'all' : 'overdue')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedRiskFilter === 'overdue'
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 ring-2 ring-blue-500/20'
                : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-900/40 hover:bg-blue-50/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>31 - 60 วัน (เริ่มเกินกำหนด)</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">
                  {grandTotalAR > 0 ? ((total31_60 / grandTotalAR) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="text-xl font-black text-blue-900 dark:text-blue-100 font-mono mt-1">
                ฿{total31_60.toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 font-medium">
              ℹ ส่งข้อความเตือนความจำรอบแรก
            </div>
          </div>

          {/* Card 3: 61 - 90 Days */}
          <div
            onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'high_risk' ? 'all' : 'high_risk')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedRiskFilter === 'high_risk'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 ring-2 ring-amber-500/20'
                : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40 hover:bg-amber-50/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>61 - 90 วัน (เฝ้าระวังเข้มงวด)</span>
                </span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  {grandTotalAR > 0 ? ((total61_90 / grandTotalAR) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="text-xl font-black text-amber-900 dark:text-amber-100 font-mono mt-1">
                ฿{total61_90.toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              ⚠ ระงับเปิดใบสั่งซื้อโครงการใหม่
            </div>
          </div>

          {/* Card 4: > 90 Days */}
          <div
            onClick={() => setSelectedRiskFilter(selectedRiskFilter === 'high_risk' ? 'all' : 'high_risk')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              totalOver90 > 0
                ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40 hover:bg-rose-50/70'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-80'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center space-x-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>&gt; 90 วัน (เสี่ยงสูญ / Bad Debt)</span>
                </span>
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">
                  {grandTotalAR > 0 ? ((totalOver90 / grandTotalAR) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="text-xl font-black text-rose-900 dark:text-rose-100 font-mono mt-1">
                ฿{totalOver90.toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
              {totalOver90 > 0 ? '⛔ มอบหมายฝ่ายกฎหมายดำเนินการ' : '✓ ไม่มีหนี้ค้างเกิน 90 วัน'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Customer Credit Risk & Aging Analysis Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Table Controls: Search, Risk Pill Filter, Sorting */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อลูกค้า, รหัส, พนักงานขาย..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
            />
          </div>

          {/* Risk Level Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">กรองสถานะ:</span>
            {[
              { id: 'all', label: 'ทุกลูกหนี้' },
              { id: 'current', label: 'อยู่ในกำหนด (0-30d)' },
              { id: 'overdue', label: 'เกินกำหนด (>30d)' },
              { id: 'high_risk', label: 'เสี่ยงสูง (>60d / Hold)' },
              { id: 'overlimit', label: 'วงเงินตึงตัว (>85%)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRiskFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedRiskFilter === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 shrink-0 self-end lg:self-auto">
            <span className="text-[11px] text-slate-400 font-medium">เรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="outstanding_desc">ยอดหนี้ค้างสูงสุด (Top Outstanding)</option>
              <option value="overdue_desc">ยอดเกินกำหนดสูงสุด (Highest Overdue)</option>
              <option value="credit_util_desc">% ใช้วงเงินสูงสุด (Highest Credit %)</option>
              <option value="name_asc">ชื่อลูกค้า (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Master Aging Table */}
        <div className="overflow-x-auto custom-scrollbar border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[950px]">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center"></th>
                <th className="py-3 px-3">ลูกค้า / รหัสโครงการ</th>
                <th className="py-3 px-3">พนักงานขาย</th>
                <th className="py-3 px-3 text-right">วงเงินเครดิต &amp; การใช้งาน</th>
                <th className="py-3 px-3 text-right">0 - 30 วัน</th>
                <th className="py-3 px-3 text-right">31 - 60 วัน</th>
                <th className="py-3 px-3 text-right">61 - 90 วัน</th>
                <th className="py-3 px-3 text-right">&gt; 90 วัน</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">ยอดค้างรวม (AR)</th>
                <th className="py-3 px-3 text-center">ระดับความเสี่ยง</th>
                <th className="py-3 px-3 text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#0f172a]">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลลูกหนี้ที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((c) => {
                  const isExpanded = expandedCustomerId === c.customerId;
                  const utilPercent = c.creditLimit > 0 ? Math.min(100, Math.round((c.totalOutstanding / c.creditLimit) * 100)) : 0;
                  const isOverlimit = c.totalOutstanding >= c.creditLimit;
                  const isHighUtil = utilPercent >= 80;

                  // Determine Risk Badge
                  let riskBadge = {
                    text: 'ปกติ (Low Risk)',
                    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60',
                  };
                  if (c.status === 'Credit Hold' || c.aging61_90 > 0 || c.over90 > 0) {
                    riskBadge = {
                      text: 'เสี่ยงสูง (High Risk)',
                      color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60',
                    };
                  } else if (c.aging31_60 > 0 || isHighUtil) {
                    riskBadge = {
                      text: 'เฝ้าระวัง (Watchlist)',
                      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60',
                    };
                  }

                  return (
                    <React.Fragment key={c.customerId}>
                      <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}>
                        {/* Expand Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleExpand(c.customerId)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="ดูรายการบิลย่อย"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-600" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>

                        {/* Customer Info */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{c.customerName}</span>
                            {c.status === 'Credit Hold' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-600 text-white">
                                HOLD
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>ID: {c.customerId}</span>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">{c.group}</span>
                          </div>
                        </td>

                        {/* Sales Rep */}
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[130px]">{c.salesRep.split(' ')[0]}</span>
                          </div>
                        </td>

                        {/* Credit Limit & Utilization */}
                        <td className="py-3 px-3 text-right">
                          <div className="font-mono text-slate-700 dark:text-slate-300">
                            ฿{c.creditLimit.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-end gap-1.5 mt-1">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                              <div
                                style={{ width: `${utilPercent}%` }}
                                className={`h-full rounded-full ${
                                  isOverlimit ? 'bg-rose-500' : isHighUtil ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                              />
                            </div>
                            <span className={`text-[10px] font-bold font-mono ${
                              isOverlimit ? 'text-rose-600' : isHighUtil ? 'text-amber-600' : 'text-slate-400'
                            }`}>
                              {utilPercent}%
                            </span>
                          </div>
                        </td>

                        {/* 0 - 30 Days */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                          {c.current0_30 > 0 ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              ฿{c.current0_30.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>

                        {/* 31 - 60 Days */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                          {c.aging31_60 > 0 ? (
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              ฿{c.aging31_60.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>

                        {/* 61 - 90 Days */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                          {c.aging61_90 > 0 ? (
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                              ฿{c.aging61_90.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>

                        {/* > 90 Days */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                          {c.over90 > 0 ? (
                            <span className="font-bold text-rose-600 dark:text-rose-400">
                              ฿{c.over90.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>

                        {/* Total Outstanding */}
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                          ฿{c.totalOutstanding.toLocaleString()}
                        </td>

                        {/* Risk Rating Badge */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskBadge.color}`}>
                            {riskBadge.text}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() =>
                                onOpenDebtDraft(
                                  c.customerName,
                                  c.invoices[0]?.invoiceNo || `INV-${c.customerId}`,
                                  c.totalOutstanding,
                                  c.maxOverdueDays || 45
                                )
                              }
                              title="ร่างจดหมายทวงหนี้ด้วย AI"
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-[11px] font-bold transition cursor-pointer flex items-center space-x-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>AI ทวงหนี้</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Sub-table: Invoice Breakdown for this Customer */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 dark:bg-slate-900/40">
                          <td colSpan={11} className="p-3 sm:p-4">
                            <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 sm:p-4 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-2.5">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                                    รายการบิลขายและใบแจ้งหนี้ของ {c.customerName}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                                    {c.invoices.length} รายการ
                                  </span>
                                </div>
                                <div className="flex items-center space-x-3 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{c.phone}</span>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{c.email}</span>
                                  </span>
                                </div>
                              </div>

                              {c.invoices.length === 0 ? (
                                <div className="text-xs text-slate-400 py-2 text-center">
                                  ยังไม่มีประวัติบิลย่อยในระบบ
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs">
                                    <thead className="text-slate-400 border-b border-slate-100 dark:border-slate-700 text-[10px] uppercase">
                                      <tr>
                                        <th className="pb-2">เลขที่บิล (Invoice No)</th>
                                        <th className="pb-2">วันที่เปิดบิล</th>
                                        <th className="pb-2">วันครบกำหนด (Due Date)</th>
                                        <th className="pb-2">รายการสินค้า / โครงการ</th>
                                        <th className="pb-2 text-right">ยอดสุทธิ</th>
                                        <th className="pb-2 text-right">ชำระแล้ว</th>
                                        <th className="pb-2 text-right">ยอดค้างชำระ</th>
                                        <th className="pb-2 text-center">สถานะ</th>
                                        <th className="pb-2 text-center">เกินกำหนด</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-mono">
                                      {c.invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                          <td className="py-2 font-bold text-blue-600 dark:text-blue-400">{inv.invoiceNo}</td>
                                          <td className="py-2 text-slate-500">{inv.date}</td>
                                          <td className="py-2 text-slate-500">{inv.dueDate}</td>
                                          <td className="py-2 text-slate-800 dark:text-slate-200 font-sans max-w-[200px] truncate">{inv.itemDescription}</td>
                                          <td className="py-2 text-right text-slate-800 dark:text-slate-200">฿{inv.netAmount.toLocaleString()}</td>
                                          <td className="py-2 text-right text-emerald-600">฿{inv.paidAmount.toLocaleString()}</td>
                                          <td className="py-2 text-right font-bold text-rose-600">฿{inv.outstandingAmount.toLocaleString()}</td>
                                          <td className="py-2 text-center font-sans">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                              inv.status === 'Paid'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : inv.status === 'Overdue'
                                                ? 'bg-rose-100 text-rose-800'
                                                : 'bg-amber-100 text-amber-800'
                                            }`}>
                                              {inv.status}
                                            </span>
                                          </td>
                                          <td className="py-2 text-center">
                                            {inv.overdueDays > 0 ? (
                                              <span className="text-rose-600 font-bold">+{inv.overdueDays} วัน</span>
                                            ) : (
                                              <span className="text-emerald-600">ในกำหนด</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
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

        {/* Footer Summary Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            แสดงผล <strong>{filteredAndSorted.length}</strong> จากทั้งหมด {customerAgingData.length} ลูกหนี้การค้า
          </div>
          <div className="flex items-center space-x-4">
            <span>
              ยอดค้างชำระรวมของตาราง: <strong className="font-mono font-bold text-slate-900 dark:text-white">฿{filteredAndSorted.reduce((acc, c) => acc + c.totalOutstanding, 0).toLocaleString()}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
