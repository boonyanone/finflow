import React, { useState, useMemo, useRef } from 'react';
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
  PieChart as PieChartIcon,
  Upload,
  Download,
  Plus,
  Edit3,
  FileSpreadsheet,
  X,
  Check,
  SlidersHorizontal,
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
  PieChart,
  Pie,
} from 'recharts';
import { InventoryItem, InvoiceRecord } from '../types';
import {
  parseInventoryExcelFile,
  exportInventoryToExcel,
  synthesizeInventoryFromInvoices,
} from '../utils/inventoryHelper';
import * as XLSX from 'xlsx';

interface InventoryViewProps {
  inventory: InventoryItem[];
  invoices?: InvoiceRecord[];
  onUpdateInventory?: (newInventory: InventoryItem[]) => void;
  onLoadDemoInventory?: () => void;
  onGenerateFromInvoices?: () => void;
  companyName?: string;
  onShowToast?: (msg: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  invoices = [],
  onUpdateInventory,
  onLoadDemoInventory,
  onGenerateFromInvoices,
  companyName = 'บจก. สยาม คูลลิ่งฯ',
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHealthFilter, setSelectedHealthFilter] = useState<
    'all' | 'critical' | 'low' | 'healthy' | 'slow_moving' | 'overstocked'
  >('all');
  const [selectedAbcClass, setSelectedAbcClass] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [sortBy, setSortBy] = useState<
    'valuation_desc' | 'turnover_desc' | 'qty_asc' | 'margin_desc' | 'name_asc'
  >('valuation_desc');
  const [expandedItemCode, setExpandedItemCode] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);

  // Add SKU form
  const [newItem, setNewItem] = useState<{
    code: string;
    name: string;
    category: string;
    qtyOnHand: number;
    unitCost: number;
    sellingPrice: number;
    reorderPoint: number;
  }>({
    code: '',
    name: '',
    category: 'แผ่นฉนวนสำเร็จรูป (Insulated Panels)',
    qtyOnHand: 100,
    unitCost: 1200,
    sellingPrice: 1850,
    reorderPoint: 40,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Enrich Inventory Items with ABC Classification, Profit Margins, Stock Coverage Days & Valuation Breakdown
  const enrichedInventory = useMemo(() => {
    if (!inventory || inventory.length === 0) return [];

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
  const avgTurnover =
    enrichedInventory.length > 0
      ? (enrichedInventory.reduce((acc, item) => acc + item.stockTurnover, 0) / enrichedInventory.length).toFixed(1)
      : '8.4';
  const healthyCount = enrichedInventory.filter(
    (item) => item.qtyOnHand >= item.reorderPoint && !item.isSlowMoving
  ).length;

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
      if (selectedHealthFilter === 'low')
        return item.qtyOnHand >= item.reorderPoint && item.qtyOnHand <= item.reorderPoint * 1.2;
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

  // Chart 1: Category Asset Valuation & SKU Share
  const categoryChartData = useMemo(() => {
    const catMap = new Map<string, { name: string; totalValue: number; skuCount: number }>();
    enrichedInventory.forEach((item) => {
      if (!catMap.has(item.category)) {
        catMap.set(item.category, { name: item.category, totalValue: 0, skuCount: 0 });
      }
      const entry = catMap.get(item.category)!;
      entry.totalValue += item.totalAssetValue;
      entry.skuCount += 1;
    });

    const colors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
    return Array.from(catMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .map((cat, idx) => {
        const shortName = cat.name.split(' (')[0];
        return {
          ...cat,
          shortName,
          color: colors[idx % colors.length],
          pctShare: totalValuation > 0 ? (cat.totalValue / totalValuation) * 100 : 0,
        };
      });
  }, [enrichedInventory, totalValuation]);

  // Chart 2: ABC Pareto Classification Breakdown
  const abcChartData = useMemo(() => {
    const aItems = enrichedInventory.filter((i) => i.abcClass === 'A');
    const bItems = enrichedInventory.filter((i) => i.abcClass === 'B');
    const cItems = enrichedInventory.filter((i) => i.abcClass === 'C');

    const aVal = aItems.reduce((acc, i) => acc + i.totalAssetValue, 0);
    const bVal = bItems.reduce((acc, i) => acc + i.totalAssetValue, 0);
    const cVal = cItems.reduce((acc, i) => acc + i.totalAssetValue, 0);

    return [
      {
        name: 'Class A (High Value 70%)',
        skuCount: aItems.length,
        totalValue: aVal,
        color: '#3b82f6',
        desc: 'สินค้ามูลค่าสูงสุด 70% ของคลัง ต้องคุมสต็อกเข้มงวด',
      },
      {
        name: 'Class B (Medium Value 20%)',
        skuCount: bItems.length,
        totalValue: bVal,
        color: '#6366f1',
        desc: 'สินค้ามูลค่าปานกลาง ตรวจนับสต็อกรายเดือน',
      },
      {
        name: 'Class C (Bulk/Low Value 10%)',
        skuCount: cItems.length,
        totalValue: cVal,
        color: '#94a3b8',
        desc: 'สินค้าเบ็ดเตล็ด/อุปกรณ์ประกอบ สั่งซื้อแบบเหมาลอต',
      },
    ];
  }, [enrichedInventory]);

  // Handlers
  const toggleExpand = (code: string) => {
    setExpandedItemCode((prev) => (prev === code ? null : code));
  };

  const handleExportExcel = () => {
    if (inventory.length === 0) {
      onShowToast?.('⚠️ ไม่มีข้อมูลสต็อกสินค้าที่จะส่งออก');
      return;
    }
    exportInventoryToExcel(inventory, companyName);
    onShowToast?.(`📊 ส่งออกรายงานมูลค่าสินค้าคงคลัง (${inventory.length} รายการ) เป็น Excel เรียบร้อยแล้ว`);
  };

  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Item Code': 'PIR-100',
        'Description': 'แผ่นฉนวน PIR หนา 100mm เกรดกันไฟ Class 1 (ตร.ม.)',
        'Category': 'แผ่นฉนวนสำเร็จรูป (Insulated Panels)',
        'Qty on Hand': 450,
        'Unit Cost': 1180,
        'Selling Price': 1850,
        'Reorder Point': 150,
      },
      {
        'Item Code': 'RW-075',
        'Description': 'แผ่นฉนวน Rockwool ใยหินหนา 75mm ทนไฟ 4 ชม. (ตร.ม.)',
        'Category': 'แผ่นฉนวนสำเร็จรูป (Insulated Panels)',
        'Qty on Hand': 220,
        'Unit Cost': 1320,
        'Selling Price': 2050,
        'Reorder Point': 80,
      },
      {
        'Item Code': 'DOR-SLD-SS',
        'Description': 'ประตูห้องเย็นบานเลื่อนสแตนเลส 304 หนา 100mm (บาน)',
        'Category': 'Cold Room Doors',
        'Qty on Hand': 4,
        'Unit Cost': 51000,
        'Selling Price': 85000,
        'Reorder Point': 6,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Inventory_Import_Template.xlsx');
    onShowToast?.('📥 ดาวน์โหลดเทมเพลต Excel สำหรับนำเข้าสต็อกสินค้าแล้ว');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const items = await parseInventoryExcelFile(file);
      if (items.length === 0) {
        onShowToast?.('⚠️ ไม่พบข้อมูลรายการสินค้าในไฟล์');
        return;
      }
      onUpdateInventory?.(items);
      setIsImportModalOpen(false);
      onShowToast?.(`✅ นำเข้าข้อมูลสินค้าคงคลัง ${items.length} รายการจาก ${file.name} สำเร็จ!`);
    } catch (err: any) {
      onShowToast?.(`❌ เกิดข้อผิดพลาดในการอ่านไฟล์: ${err?.message || 'ไฟล์ไม่ถูกต้อง'}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveAdjust = (updated: InventoryItem) => {
    const newItems = inventory.map((i) => (i.code === updated.code ? updated : i));
    onUpdateInventory?.(newItems);
    setAdjustingItem(null);
    onShowToast?.(`💾 บันทึกการปรับปรุงสต็อก ${updated.code} เรียบร้อยแล้ว`);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.code.trim() || !newItem.name.trim()) {
      onShowToast?.('⚠️ กรุณาระบุรหัสและชื่อสินค้า');
      return;
    }

    const totalAssetValue = newItem.qtyOnHand * newItem.unitCost;
    const qtyReserved = Math.round(newItem.qtyOnHand * 0.15);
    const qtyAvailable = Math.max(0, newItem.qtyOnHand - qtyReserved);

    let stockHealth: 'Healthy' | 'Low' | 'Critical' | 'Overstocked' = 'Healthy';
    if (newItem.qtyOnHand < newItem.reorderPoint) {
      stockHealth = 'Critical';
    } else if (newItem.qtyOnHand <= newItem.reorderPoint * 1.2) {
      stockHealth = 'Low';
    } else if (newItem.qtyOnHand > newItem.reorderPoint * 2.5) {
      stockHealth = 'Overstocked';
    }

    const item: InventoryItem = {
      code: newItem.code.trim().toUpperCase(),
      name: newItem.name.trim(),
      category: newItem.category.trim(),
      qtyOnHand: Number(newItem.qtyOnHand) || 0,
      qtyAvailable,
      qtyReserved,
      unitCost: Number(newItem.unitCost) || 0,
      sellingPrice: Number(newItem.sellingPrice) || 0,
      totalAssetValue,
      reorderPoint: Number(newItem.reorderPoint) || 10,
      stockHealth,
      stockTurnover: 8.5,
      slowMovingDays: 10,
    };

    onUpdateInventory?.([item, ...inventory.filter((i) => i.code !== item.code)]);
    setIsAddModalOpen(false);
    setNewItem({
      code: '',
      name: '',
      category: 'แผ่นฉนวนสำเร็จรูป (Insulated Panels)',
      qtyOnHand: 100,
      unitCost: 1200,
      sellingPrice: 1850,
      reorderPoint: 40,
    });
    onShowToast?.(`✅ เพิ่มสินค้า ${item.code} เข้าสู่ฐานข้อมูลสต็อกเรียบร้อยแล้ว`);
  };

  // If inventory is completely empty, render a helpful empty state screen
  if (inventory.length === 0) {
    return (
      <div id="viewInventoryEmpty" className="view-panel space-y-6 w-full min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Inventory Valuation &amp; Stock Intelligence
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ระบบคำนวณมูลค่าสินค้าคงคลัง FIFO Perpetual, ABC Pareto, อัตราหมุนเวียน และจุดสั่งซื้อซ้ำ
              </p>
            </div>
          </div>
        </div>

        {/* Empty State Banner Card */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
            <Boxes className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              ยังไม่มีข้อมูลมูลค่าสินค้าคงคลัง (No Inventory Data)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              ระบบพร้อมสำหรับการวิเคราะห์สต็อกสินค้า คุณสามารถโหลดชุดข้อมูลตัวอย่าง (แผ่นฉนวน PIR, Rockwool, ประตูห้องเย็น 12 SKUs) หรือสร้างแคตตาล็อกสินค้าอัตโนมัติจากบิลขาย หรือนำเข้าไฟล์ Excel ของคุณ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 text-left max-w-xl mx-auto">
            {/* Option 1: Load Demo Stock */}
            <button
              onClick={() => onLoadDemoInventory?.()}
              className="flex items-start p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 transition cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-3 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200 block">
                  🌟 โหลดสต็อกตัวอย่าง
                </span>
                <span className="text-xs text-indigo-700/80 dark:text-indigo-400 mt-0.5 block">
                  บจก. สยาม คูลลิ่งฯ (12 SKUs แผ่นฉนวน & ประตู)
                </span>
              </div>
            </button>

            {/* Option 2: Auto-generate from Invoices */}
            {invoices.length > 0 && (
              <button
                onClick={() => onGenerateFromInvoices?.()}
                className="flex items-start p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition cursor-pointer group"
              >
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200 block">
                    ⚡ สร้างอัตโนมัติจากบิลขาย
                  </span>
                  <span className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-0.5 block">
                    คำนวณจาก {invoices.length} รายการบิลขายในระบบ
                  </span>
                </div>
              </button>
            )}

            {/* Option 3: Upload Excel */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-start p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer group"
            >
              <Upload className="w-5 h-5 text-slate-600 dark:text-slate-300 mr-3 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                  📁 นำเข้าไฟล์ Excel สต็อก
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                  อัปโหลดไฟล์ .xlsx หรือ .csv ขององค์กร
                </span>
              </div>
            </button>

            {/* Option 4: Add First SKU */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-start p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer group"
            >
              <Plus className="w-5 h-5 text-slate-600 dark:text-slate-300 mr-3 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                  ➕ เพิ่มสินค้าชิ้นแรก (+ Add SKU)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">
                  กรอกรหัสและต้นทุนสินค้าด้วยตนเอง
                </span>
              </div>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center space-x-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดตัวอย่างไฟล์เทมเพลต Excel สำหรับสต็อกสินค้า (Inventory Template)</span>
            </button>
          </div>
        </div>

        {/* Modal: Direct Import Excel */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  <span>นำเข้าไฟล์ Excel สต็อกสินค้าคงคลัง</span>
                </h3>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                รองรับไฟล์ Excel (.xlsx, .xls) หรือ CSV ที่มีคอลัมน์ รหัสสินค้า, ชื่อรายการ, หมวดหมู่, จำนวนคงเหลือ, ต้นทุนต่อหน่วย, ราคาขาย, จุดสั่งซื้อ
              </p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl p-8 text-center bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/70 cursor-pointer transition"
              >
                <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200 block">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </span>
                <span className="text-xs text-slate-400 mt-1 block">รองรับ .xlsx, .xls, .csv</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลดเทมเพลต</span>
                </button>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

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

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
          {/* Direct Import Excel Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            title="นำเข้าไฟล์ Excel สต็อกสินค้า"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>นำเข้า Excel</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            title="ส่งออกรายงานมูลค่าสินค้าคงคลังเป็น Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>ส่งออก Excel</span>
          </button>

          {/* Add SKU Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ เพิ่ม SKU</span>
          </button>

          {/* Critical filter button */}
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
              <span className="font-bold text-rose-600">วิกฤต {criticalItems.length} รายการ</span>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Category Asset Valuation Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>มูลค่าสต็อกแยกตามกลุ่มผลิตภัณฑ์ (Valuation by Category)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                การกระจายตัวของเงินทุนหมุนเวียนในคลังสินค้าตามกลุ่มสินค้า
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryChartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} />
                <XAxis
                  type="number"
                  tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  width={140}
                />
                <Tooltip
                  formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'มูลค่ารวม']}
                  labelFormatter={(label) => `หมวด: ${label}`}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="totalValue" radius={[0, 6, 6, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ABC Pareto Stratification */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-600" />
                <span>ABC Pareto Classification</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                กฎ 80/20
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              จัดกลุ่มสินค้าตามสัดส่วนมูลค่าเงินทุนเพื่อลำดับความสำคัญในการบริหาร
            </p>

            <div className="space-y-3">
              {abcChartData.map((item) => (
                <div
                  key={item.name}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      ฿{item.totalValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex justify-between items-center">
                    <span>{item.skuCount} รายการ</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {totalValuation > 0 ? ((item.totalValue / totalValuation) * 100).toFixed(1) : 0}% ของคลัง
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Class A คือสินค้าทำเงินสูงสุด แนะนำตรวจนับสต็อกทุกสัปดาห์</span>
          </div>
        </div>
      </div>

      {/* 4. Inventory Data Grid & Product Matrix */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            {/* Search */}
            <div className="relative min-w-[200px] max-w-xs flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหารหัส หรือชื่อสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">หมวดหมู่ทั้งหมด ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Health Filter */}
            <select
              value={selectedHealthFilter}
              onChange={(e) => setSelectedHealthFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">สถานะสุขภาพสต็อกทั้งหมด</option>
              <option value="critical">🚨 ใกล้หมด (ต่ำกว่าจุดสั่งซื้อ - {criticalItems.length})</option>
              <option value="low">⚠️ ระดับเตือนภัย (Low Buffer)</option>
              <option value="healthy">✅ ปกติ (Healthy - {healthyCount})</option>
              <option value="slow_moving">⏳ หมุนช้า (Slow-Moving - {slowMovingItems.length})</option>
              <option value="overstocked">📦 สต็อกเกิน (Overstocked)</option>
            </select>

            {/* ABC Filter */}
            <select
              value={selectedAbcClass}
              onChange={(e) => setSelectedAbcClass(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="all">ABC ทุกคลาส</option>
              <option value="A">Class A (Top Value)</option>
              <option value="B">Class B (Medium Value)</option>
              <option value="C">Class C (Low Value)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              <option value="valuation_desc">มูลค่าสต็อกสูงสุด (Valuation)</option>
              <option value="turnover_desc">อัตราหมุนเวียนสูงสุด (Turnover)</option>
              <option value="qty_asc">จำนวนคงเหลือเหลือน้อยสุด (Lowest Qty)</option>
              <option value="margin_desc">% กำไรขั้นต้นสูงสุด (Highest Margin %)</option>
              <option value="name_asc">ชื่อสินค้า (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="overflow-x-auto custom-scrollbar border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[1050px]">
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
                <th className="py-3 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-[#0f172a]">
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400 space-y-3">
                    <Package className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                    <div>ไม่พบรายการสินค้าที่ตรงกับเงื่อนไขการค้นหา</div>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedHealthFilter('all');
                        setSelectedAbcClass('all');
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((item) => {
                  const isExpanded = expandedItemCode === item.code;
                  const isCritical = item.qtyOnHand < item.reorderPoint;
                  const stockHealthBadge = isCritical
                    ? {
                        text: 'ต่ำกว่าเกณฑ์สั่งซื้อ',
                        color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/60',
                      }
                    : item.isSlowMoving
                    ? {
                        text: 'หมุนเวียนช้า',
                        color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60',
                      }
                    : item.isOverstocked
                    ? {
                        text: 'สต็อกเกินเกณฑ์',
                        color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60',
                      }
                    : {
                        text: 'ปกติ (Healthy)',
                        color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60',
                      };

                  return (
                    <React.Fragment key={item.code}>
                      <tr
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                          isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        }`}
                      >
                        {/* Expand Toggle */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleExpand(item.code)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="ดูรายละเอียดการคำนวณต้นทุนและราคาขาย"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-indigo-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
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
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black font-mono border ${
                              item.abcClass === 'A'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60'
                                : item.abcClass === 'B'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60'
                                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            Class {item.abcClass}
                          </span>
                        </td>

                        {/* Qty on Hand */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap">
                          <span
                            className={`font-black ${
                              isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.qtyOnHand.toLocaleString()}
                          </span>
                        </td>

                        {/* Available / Reserved */}
                        <td className="py-3 px-3 text-right font-mono whitespace-nowrap text-slate-600 dark:text-slate-400">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            {item.qtyAvailable}
                          </span>
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
                          <span
                            className={`font-bold ${
                              item.stockTurnover >= 10
                                ? 'text-emerald-600'
                                : item.stockTurnover <= 5
                                ? 'text-amber-600'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {item.stockTurnover}x
                          </span>
                        </td>

                        {/* Health Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stockHealthBadge.color}`}
                          >
                            {stockHealthBadge.text}
                          </span>
                        </td>

                        {/* Action: Quick Adjust Stock */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setAdjustingItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                            title="ปรับปรุงจำนวนสต็อก หรือต้นทุน"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Sub-Panel: Pricing, Margins, Stock Movements & Replenishment Recommender */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60 dark:bg-slate-900/40">
                          <td colSpan={12} className="p-3 sm:p-4">
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
                                  <span className="text-[10px] text-slate-400 block font-medium">
                                    ราคาขายมาตรฐาน / หน่วย
                                  </span>
                                  <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                                    ฿{item.sellingPrice.toLocaleString()}
                                  </span>
                                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                                    กำไร ฿{item.marginPerUnit.toLocaleString()} ({item.marginPct.toFixed(1)}% Margin)
                                  </div>
                                </div>

                                {/* Metric 2: Stock Availability Breakdown */}
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block font-medium">
                                    สถานะสต็อกทางกายภาพ
                                  </span>
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
                                  <span className="text-[10px] text-slate-400 block font-medium">
                                    ระยะเวลาสต็อกพอใช้ (Coverage)
                                  </span>
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
                                    <span className="text-[10px] text-slate-400 block font-medium">
                                      คำแนะนำจัดซื้อ (Action)
                                    </span>
                                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                                      {isCritical
                                        ? `แนะนำเปิดสั่งซื้อขั้นต่ำ ${Math.max(
                                            item.reorderPoint * 1.5 - item.qtyOnHand,
                                            50
                                          )} หน่วย`
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
              มูลค่าสต็อกรวมของตาราง:{' '}
              <strong className="font-mono font-bold text-slate-900 dark:text-white">
                ฿{filteredAndSorted.reduce((acc, i) => acc + i.totalAssetValue, 0).toLocaleString()}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Modal 1: Quick Adjust Stock Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  ปรับปรุงสต็อก: {adjustingItem.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">รหัส: {adjustingItem.code}</span>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  จำนวนคงคลังจริง (Qty on Hand)
                </label>
                <input
                  type="number"
                  value={adjustingItem.qtyOnHand}
                  onChange={(e) => {
                    const qty = Number(e.target.value) || 0;
                    const res = adjustingItem.qtyReserved;
                    setAdjustingItem({
                      ...adjustingItem,
                      qtyOnHand: qty,
                      qtyAvailable: Math.max(0, qty - res),
                      totalAssetValue: qty * adjustingItem.unitCost,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  จุดสั่งซื้อซ้ำ (Reorder Point)
                </label>
                <input
                  type="number"
                  value={adjustingItem.reorderPoint}
                  onChange={(e) =>
                    setAdjustingItem({
                      ...adjustingItem,
                      reorderPoint: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ต้นทุน FIFO ต่อหน่วย (Unit Cost - ฿)
                </label>
                <input
                  type="number"
                  value={adjustingItem.unitCost}
                  onChange={(e) => {
                    const cost = Number(e.target.value) || 0;
                    setAdjustingItem({
                      ...adjustingItem,
                      unitCost: cost,
                      totalAssetValue: adjustingItem.qtyOnHand * cost,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ราคาขายมาตรฐาน (Selling Price - ฿)
                </label>
                <input
                  type="number"
                  value={adjustingItem.sellingPrice}
                  onChange={(e) =>
                    setAdjustingItem({
                      ...adjustingItem,
                      sellingPrice: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex justify-between items-center font-mono">
                <span className="text-slate-500 font-sans">มูลค่าสต็อกคำนวณใหม่:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  ฿{(adjustingItem.qtyOnHand * adjustingItem.unitCost).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAdjustingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleSaveAdjust(adjustingItem)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
              >
                บันทึกการปรับปรุง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add New SKU Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddNewItem}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                <span>เพิ่มรายการสินค้าใหม่ (+ Add SKU)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  รหัสสินค้า (Item Code) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น PIR-125, DOR-SS-02"
                  value={newItem.code}
                  onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ชื่อสินค้า / รายการ (Description) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แผ่นฉนวน PIR หนา 125mm"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  หมวดหมู่สินค้า (Category)
                </label>
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    คงเหลือเริ่มต้น (Qty)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.qtyOnHand}
                    onChange={(e) => setNewItem({ ...newItem, qtyOnHand: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    จุดสั่งซื้อซ้ำ (ROP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.reorderPoint}
                    onChange={(e) => setNewItem({ ...newItem, reorderPoint: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ต้นทุนต่อหน่วย (฿)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({ ...newItem, unitCost: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ราคาขาย (฿)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItem.sellingPrice}
                    onChange={(e) => setNewItem({ ...newItem, sellingPrice: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
              >
                บันทึกสินค้าใหม่
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Import Excel Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <span>นำเข้าไฟล์ Excel สต็อกสินค้าคงคลัง</span>
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              รองรับไฟล์ Excel (.xlsx, .xls) หรือ CSV ที่มีคอลัมน์ รหัสสินค้า, ชื่อรายการ, หมวดหมู่, จำนวนคงเหลือ, ต้นทุนต่อหน่วย, ราคาขาย, จุดสั่งซื้อ
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl p-8 text-center bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/70 cursor-pointer transition"
            >
              <Upload className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200 block">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </span>
              <span className="text-xs text-slate-400 mt-1 block">รองรับ .xlsx, .xls, .csv</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleDownloadTemplate}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ดาวน์โหลดเทมเพลต</span>
              </button>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
