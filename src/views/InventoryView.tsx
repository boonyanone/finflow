import React, { useState, useMemo } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Layers,
  Search,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertOctagon,
  Boxes,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Zap,
  Info,
  Calendar,
  Filter,
  BarChart3,
  Flame,
  Snowflake,
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHealthFilter, setSelectedHealthFilter] = useState<'all' | 'critical' | 'low' | 'healthy' | 'slow_moving' | 'overstocked'>('all');
  const [selectedAbcClass, setSelectedAbcClass] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [sortBy, setSortBy] = useState<'valuation_desc' | 'turnover_desc' | 'qty_asc' | 'margin_desc' | 'name_asc'>('valuation_desc');
  const [expandedItemCode, setExpandedItemCode] = useState<string | null>(null);

  // 1. Enrich Inventory Items with ABC Classification, Profit Margins, Stock Coverage Days & Valuation Breakdown
  const enrichedInventory = useMemo(() => {
    // Calculate total portfolio valuation
    const totalVal = inventory.reduce((acc, i) => acc + i.totalAssetValue, 0) || 1;

    // Sort descending by asset value to assign ABC Analysis (Pareto: Top 70% value = A, 70-90% = B, Remaining = C)
    const sortedByVal = [...inventory].sort((a, b) => b.totalAssetValue - a.totalAssetValue);

    let cumulativeVal = 0;
    const abcMap = new Map<string, { abc: 'A' | 'B' | 'C'; cumShare: number }>();

    sortedByVal.forEach((item) => {
      cumulativeVal += item.totalAssetValue;
      const share = (cumulativeVal / totalVal) * 100;
      if (share <= 70) {
        abcMap.set(item.code, { abc: 'A', cumShare: share });
      } else if (share <= 90) {
        abcMap.set(item.code, { abc: 'B', cumShare: share });
      } else {
        abcMap.set(item.code, { abc: 'C', cumShare: share });
      }
    });

    return inventory.map((item) => {
      const marginPerUnit = item.sellingPrice - item.unitCost;
      const marginPct = item.sellingPrice > 0 ? (marginPerUnit / item.sellingPrice) * 100 : 0;
      const abcInfo = abcMap.get(item.code) || { abc: 'B', cumShare: 50 };

      // Stock Coverage (Days of Inventory) estimated from turnover: 365 / turnover
      const daysOfSupply = item.stockTurnover > 0 ? Math.round(365 / item.stockTurnover) : 90;

      // Reorder Shortage
      const shortage = Math.max(0, item.reorderPoint - item.qtyOnHand);

      // Estimated Capital Tied in Slow Moving (if turnover < 6 or slowMovingDays > 10)
      const isSlowMoving = item.slowMovingDays >= 12 || item.stockTurnover < 5.5;

      return {
        ...item,
        marginPerUnit,
        marginPct,
        abcClass: abcInfo.abc,
        daysOfSupply,
        shortage,
        isSlowMoving,
        isOverstocked: item.qtyOnHand > item.reorderPoint * 2.5,
      };
    });
  }, [inventory]);

  // 2. Executive Accounting KPIs
  const totalValuation = enrichedInventory.reduce((acc, item) => acc + item.totalAssetValue, 0);
  const totalSKUs = enrichedInventory.length;
  const criticalItems = enrichedInventory.filter((item) => item.qtyOnHand < item.reorderPoint);
  const slowMovingItems = enrichedInventory.filter((item) => item.isSlowMoving);
  const slowMovingCapital = slowMovingItems.reduce((acc, item) => acc + item.totalAssetValue, 0);
  const avgTurnover = enrichedInventory.length > 0
    ? (enrichedInventory.reduce((acc, item) => acc + item.stockTurnover, 0) / enrichedInventory.length).toFixed(1)
    : '8.4';
  const healthyCount = enrichedInventory.filter((item) => item.qtyOnHand >= item.reorderPoint && !item.isSlowMoving).length;

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    inventory.forEach((i) => cats.add(i.category));
    return Array.from(cats);
  }, [inventory]);

  // 3. Filter & Sort
  const filteredAndSorted = useMemo(() => {
    let list = enrichedInventory.filter((item) => {
      // Search
      const matchSearch =
        !searchTerm ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // ABC filter
      if (selectedAbcClass !== 'all' && item.abcClass !== selectedAbcClass) return false;

      // Health / Status filter
      if (selectedHealthFilter === 'critical') return item.qtyOnHand < item.reorderPoint;
      if (selectedHealthFilter === 'low') return item.qtyOnHand >= item.reorderPoint && item.qtyOnHand <= item.reorderPoint * 1.2;
      if (selectedHealthFilter === 'healthy') return item.qtyOnHand >= item.reorderPoint && !item.isSlowMoving;
      if (selectedHealthFilter === 'slow_moving') return item.isSlowMoving;
      if (selectedHealthFilter === 'overstocked') return item.isOverstocked;

      return true;
    });

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'valuation_desc') return b.totalAssetValue - a.totalAssetValue;
      if (sortBy === 'turnover_desc') return b.stockTurnover - a.stockTurnover;
      if (sortBy === 'qty_asc') return a.qtyOnHand - b.qtyOnHand;
      if (sortBy === 'margin_desc') return b.marginPct - a.marginPct;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name, 'th');
      return 0;
    });

    return list;
  }, [enrichedInventory, searchTerm, selectedCategory, selectedHealthFilter, selectedAbcClass, sortBy]);

  const toggleExpand = (code: string) => {
    setExpandedItemCode((prev) => (prev === code ? null : code));
  };

  return (
    <div id="viewInventory" className="view-panel space-y-5 w-full min-w-0">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0 shadow-2xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                Inventory Valuation &amp; Stock Intelligence (มูลค่าสินค้าคงคลังและการควบคุมสต็อก)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                FIFO Perpetual Costing
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ติดตามมูลค่าสินทรัพย์สต็อก อัตราหมุนเวียน (Inventory Turnover) ตรวจจับจุดสั่งซื้อซ้ำ และลดเงินจมในสินค้าไม่เคลื่อนไหว
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => setSelectedHealthFilter('critical')}
            className="flex items-center space-x-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200/70 dark:border-rose-800/60 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>ดู {criticalItems.length} สินค้าวิกฤต</span>
          </button>
        </div>
      </div>

      {/* 2. Top Accounting & Operations KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Inventory Asset Value */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              มูลค่าสินทรัพย์สต็อกรวม (Total Valuation)
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              ฿{totalValuation.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>{totalSKUs} รายการ (Active SKUs)</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">วิธีต้นทุน FIFO</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Inventory Turnover & Velocity */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              รอบหมุนเวียนสินค้าเฉลี่ย (Turnover)
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                {avgTurnover}x
              </span>
              <span className="text-xs font-bold text-slate-500">รอบ/ปี</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
                เร็วมาก (High Flow)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              ระยะเวลาถือครองสต็อกเฉลี่ย ~43 วัน
            </div>
          </div>
        </div>

        {/* KPI 3: Stockout Risk / Critical Shortage */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              สินค้าใกล้หมด (Reorder Warning)
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight font-mono">
                {criticalItems.length}
              </span>
              <span className="text-xs font-bold text-slate-500">SKUs ต่ำกว่าเกณฑ์</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60">
                ต้องเปิด PO ด่วน
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>เสี่ยงของขาดส่งโครงการ</span>
              <span className="font-bold text-rose-600">กระทบ 3 โครงการ</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Slow-Moving & Dead Stock Capital */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              เงินจมในสินค้าหมุนช้า (Slow-Moving)
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">
              ฿{slowMovingCapital.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
              <span>{slowMovingItems.length} รายการหมุนเวียนต่ำ</span>
              <span className="font-semibold text-amber-600">
                {totalValuation > 0 ? ((slowMovingCapital / totalValuation) * 100).toFixed(1) : 0}% ของสต็อก
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ABC Stratification & Stock Health Matrix */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>การจำแนกความสำคัญของสินค้าตามหลัก ABC Analysis (Pareto Principle)</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                80/20 Rule
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              จัดลำดับการควบคุมตามมูลค่าเม็ดเงิน: กลุ่ม A (มูลค่าสูง 70%), กลุ่ม B (ปานกลาง 20%), กลุ่ม C (มูลค่าต่ำ 10%)
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedAbcClass(selectedAbcClass === 'A' ? 'all' : 'A')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedAbcClass === 'A'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/40 hover:bg-blue-100'
              }`}
            >
              Class A (สินค้าหลัก 70% มูลค่า)
            </button>
            <button
              onClick={() => setSelectedAbcClass(selectedAbcClass === 'B' ? 'all' : 'B')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedAbcClass === 'B'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/40 hover:bg-indigo-100'
              }`}
            >
              Class B (กลุ่มรอง 20%)
            </button>
            <button
              onClick={() => setSelectedAbcClass(selectedAbcClass === 'C' ? 'all' : 'C')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedAbcClass === 'C'
                  ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              Class C (สินค้าปลีกย่อย 10%)
            </button>
          </div>
        </div>

        {/* 4 Interactive Health Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Critical Low */}
          <div
            onClick={() => setSelectedHealthFilter(selectedHealthFilter === 'critical' ? 'all' : 'critical')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedHealthFilter === 'critical'
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-400 ring-2 ring-rose-500/20'
                : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40 hover:bg-rose-50/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ต่ำกว่าจุดสั่งซื้อ (Critical Low)</span>
                </span>
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">
                  {criticalItems.length} รายการ
                </span>
              </div>
              <div className="text-xl font-black text-rose-900 dark:text-rose-100 font-mono mt-1">
                ฿{criticalItems.reduce((acc, i) => acc + i.totalAssetValue, 0).toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-300 font-medium">
              ⚠ แนะนำเปิด Purchase Order (PO) วันนี้
            </div>
          </div>

          {/* Card 2: Healthy Stock */}
          <div
            onClick={() => setSelectedHealthFilter(selectedHealthFilter === 'healthy' ? 'all' : 'healthy')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedHealthFilter === 'healthy'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 ring-2 ring-emerald-500/20'
                : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40 hover:bg-emerald-50/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>สต็อกระดับปกติ (Healthy)</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  {healthyCount} รายการ
                </span>
              </div>
              <div className="text-xl font-black text-emerald-900 dark:text-emerald-100 font-mono mt-1">
                ฿{enrichedInventory.filter((i) => i.qtyOnHand >= i.reorderPoint && !i.isSlowMoving).reduce((acc, i) => acc + i.totalAssetValue, 0).toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/40 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
              ✓ ปริมาณพร้อมจ่ายเพียงพอสำหรับโครงการ
            </div>
          </div>

          {/* Card 3: Slow Moving */}
          <div
            onClick={() => setSelectedHealthFilter(selectedHealthFilter === 'slow_moving' ? 'all' : 'slow_moving')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedHealthFilter === 'slow_moving'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 ring-2 ring-amber-500/20'
                : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40 hover:bg-amber-50/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-600" />
                  <span>สินค้าหมุนเวียนช้า (Slow-Moving)</span>
                </span>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  {slowMovingItems.length} รายการ
                </span>
              </div>
              <div className="text-xl font-black text-amber-900 dark:text-amber-100 font-mono mt-1">
                ฿{slowMovingCapital.toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              ℹ แนะนำจัดโปรโมชั่นหรือ bundle ร่วมกับโครงการ
            </div>
          </div>

          {/* Card 4: Overstocked */}
          <div
            onClick={() => setSelectedHealthFilter(selectedHealthFilter === 'overstocked' ? 'all' : 'overstocked')}
            className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
              selectedHealthFilter === 'overstocked'
                ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <Boxes className="w-4 h-4 text-blue-600" />
                  <span>สต็อกเกินเกณฑ์ (Overstocked)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {enrichedInventory.filter((i) => i.isOverstocked).length} รายการ
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1">
                ฿{enrichedInventory.filter((i) => i.isOverstocked).reduce((acc, i) => acc + i.totalAssetValue, 0).toLocaleString()}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              ชะลอการสั่งซื้อเพื่อรักษาสภาพคล่อง
            </div>
          </div>
        </div>
      </div>

      {/* 4. Interactive Master Inventory & Valuation Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Table Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารหัสสินค้า, ชื่อ, หมวดหมู่..."
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium mr-1 hidden sm:inline">หมวดหมู่:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
              }`}
            >
              ทั้งหมด
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70'
                }`}
              >
                {cat}
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
              <option value="valuation_desc">มูลค่าสต็อกสูงสุด (Top Asset Value)</option>
              <option value="turnover_desc">อัตราหมุนเวียนสูงสุด (Top Turnover)</option>
              <option value="qty_asc">จำนวนคงเหลือเหลือน้อยสุด (Lowest Qty)</option>
              <option value="margin_desc">% กำไรขั้นต้นสูงสุด (Highest Margin %)</option>
              <option value="name_asc">ชื่อสินค้า (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto custom-scrollbar border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[1000px]">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-8 text-center"></th>
                <th className="py-3 px-3">รหัส / รายการสินค้า</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3 text-center">ABC Class</th>
                <th className="py-3 px-3 text-right">คงเหลือ (On Hand)</th>
                <th className="py-3 px-3 text-right">พร้อมจ่าย / จอง</th>
                <th className="py-3 px-3 text-right">จุดสั่งซื้อ (ROP)</th>
                <th className="py-3 px-3 text-right">ต้นทุน/หน่วย (FIFO)</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">มูลค่าสต็อกรวม</th>
                <th className="py-3 px-3 text-right">หมุนเวียน (Turnover)</th>
                <th className="py-3 px-3 text-center">สถานะสต็อก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#0f172a]">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    ไม่พบรายการสินค้าที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((item) => {
                  const isExpanded = expandedItemCode === item.code;
                  const isCritical = item.qtyOnHand < item.reorderPoint;
                  const stockHealthBadge = isCritical
                    ? { text: 'ต่ำกว่าเกณฑ์สั่งซื้อ', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60' }
                    : item.isSlowMoving
                    ? { text: 'หมุนเวียนช้า', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60' }
                    : item.isOverstocked
                    ? { text: 'สต็อกเกินเกณฑ์', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60' }
                    : { text: 'ปกติ (Healthy)', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60' };

                  return (
                    <React.Fragment key={item.code}>
                      <tr className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''}`}>
                        {/* Expand Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleExpand(item.code)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="ดูรายละเอียดการคำนวณต้นทุนและราคาขาย"
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        </td>

                        {/* Item Info */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span className="font-bold text-blue-600 dark:text-blue-400">{item.code}</span>
                            <span>•</span>
                            <span>ถือครองได้ ~{item.daysOfSupply} วัน</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.category}
                          </span>
                        </td>

                        {/* ABC Class Badge */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black font-mono border ${
                            item.abcClass === 'A'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                              : item.abcClass === 'B'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            Class {item.abcClass}
                          </span>
                        </td>

                        {/* Qty on Hand */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                          <span className={`font-black ${isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                            {item.qtyOnHand.toLocaleString()}
                          </span>
                        </td>

                        {/* Available / Reserved */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap text-slate-600 dark:text-slate-400">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{item.qtyAvailable}</span>
                          <span className="text-slate-300 dark:text-slate-600 mx-1">/</span>
                          <span className="text-amber-600 dark:text-amber-400">{item.qtyReserved}</span>
                        </td>

                        {/* Reorder Point */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap text-slate-500">
                          {item.reorderPoint.toLocaleString()}
                        </td>

                        {/* Unit Cost */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap text-slate-700 dark:text-slate-300">
                          ฿{item.unitCost.toLocaleString()}
                        </td>

                        {/* Total Asset Valuation */}
                        <td className="py-3 px-3 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                          ฿{item.totalAssetValue.toLocaleString()}
                        </td>

                        {/* Turnover */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                          <span className={`font-bold ${item.stockTurnover >= 10 ? 'text-emerald-600' : item.stockTurnover <= 5 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.stockTurnover}x
                          </span>
                        </td>

                        {/* Health Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stockHealthBadge.color}`}>
                            {stockHealthBadge.text}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Sub-Panel: Pricing, Margins, Stock Movements & Replenishment Recommender */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 dark:bg-slate-900/40">
                          <td colSpan={11} className="p-3 sm:p-4">
                            <div className="bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-4 space-y-3.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                                <div>
                                  <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>ข้อมูลการวิเคราะห์ต้นทุนและราคาจำหน่าย: {item.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">({item.code})</span>
                                  </h4>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    เชื่อมโยงการบันทึกต้นทุนแบบ FIFO Perpetual จากสมุดรายวันซื้อ Sage 50
                                  </p>
                                </div>

                                {isCritical && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-rose-600 font-bold">
                                      ขาดอีก {item.shortage} หน่วย จะถึงเกณฑ์ปลอดภัย
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* Metric 1: Selling Price & Margin */}
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block font-medium">ราคาขายมาตรฐาน / หน่วย</span>
                                  <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                                    ฿{item.sellingPrice.toLocaleString()}
                                  </span>
                                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                                    กำไร ฿{item.marginPerUnit.toLocaleString()} ({item.marginPct.toFixed(1)}% Margin)
                                  </div>
                                </div>

                                {/* Metric 2: Stock Availability Breakdown */}
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block font-medium">สถานะสต็อกทางกายภาพ</span>
                                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 space-y-0.5 font-mono">
                                    <div className="flex justify-between">
                                      <span>ในคลัง (Physical):</span>
                                      <span>{item.qtyOnHand}</span>
                                    </div>
                                    <div className="flex justify-between text-amber-600">
                                      <span>จองในโครงการ (Allocated):</span>
                                      <span>{item.qtyReserved}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-600 font-black">
                                      <span>พร้อมขายอิสระ (Available):</span>
                                      <span>{item.qtyAvailable}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Metric 3: Days of Supply */}
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block font-medium">ระยะเวลาสต็อกพอใช้ (Coverage)</span>
                                  <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                                    ~{item.daysOfSupply} วัน
                                  </span>
                                  <div className="text-[10px] text-slate-500 mt-1">
                                    ระยะเวลาเคลื่อนไหวเฉลี่ย {item.slowMovingDays} วัน/ลอต
                                  </div>
                                </div>

                                {/* Metric 4: Replenishment Action */}
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block font-medium">คำแนะนำจัดซื้อ (Action)</span>
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                      {isCritical
                                        ? `แนะนำเปิดสั่งซื้อขั้นต่ำ ${Math.max(item.reorderPoint * 1.5 - item.qtyOnHand, 50)} หน่วย`
                                        : item.isSlowMoving
                                        ? 'จัดแคมเปญระบายสต็อกเพื่อคืนสภาพคล่อง'
                                        : 'ปริมาณอยู่ในระดับที่เหมาะสม'}
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

        {/* Footer Summary Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            แสดงผล <strong>{filteredAndSorted.length}</strong> จากทั้งหมด {enrichedInventory.length} รายการสินค้า
          </div>
          <div className="flex items-center space-x-4">
            <span>
              มูลค่าสต็อกรวมของตาราง: <strong className="font-mono font-bold text-slate-900 dark:text-white">฿{filteredAndSorted.reduce((acc, i) => acc + i.totalAssetValue, 0).toLocaleString()}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
