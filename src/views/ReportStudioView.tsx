import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Save,
  Download,
  Layers,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  RotateCcw,
  GripVertical,
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  User,
  Building,
  Tag,
  Package,
  Calendar,
  Search,
  ArrowUpDown,
  Percent,
  SlidersHorizontal,
  Eye,
  Activity,
  Zap,
  Clock,
  DollarSign,
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { InvoiceRecord, ReportDefinition, ReportFilter } from '../types';
import { exportToExcel } from '../utils/exportUtils';

interface ReportStudioViewProps {
  invoices: InvoiceRecord[];
  savedReports: ReportDefinition[];
  onSaveReport: (report: ReportDefinition) => void;
  activeReportDef?: ReportDefinition;
  onShowToast: (msg: string) => void;
}

interface FieldItem {
  id: string;
  name: string;
  group: 'sales' | 'product' | 'customer' | 'time' | 'finance';
  category: 'dimension' | 'measure';
  dataType: 'string' | 'number' | 'date';
  icon: any;
}

const ALL_STUDIO_FIELDS: FieldItem[] = [
  // Dimensions
  { id: 'salesRep', name: 'พนักงานขาย (Sales Rep)', group: 'sales', category: 'dimension', dataType: 'string', icon: User },
  { id: 'customerName', name: 'ชื่อลูกค้า (Customer)', group: 'customer', category: 'dimension', dataType: 'string', icon: Building },
  { id: 'category', name: 'หมวดสินค้า (Category)', group: 'product', category: 'dimension', dataType: 'string', icon: Tag },
  { id: 'itemDescription', name: 'รายการสินค้า (Product)', group: 'product', category: 'dimension', dataType: 'string', icon: Package },
  { id: 'month', name: 'ประจำเดือน (Month)', group: 'time', category: 'dimension', dataType: 'string', icon: Calendar },
  { id: 'period', name: 'ไตรมาส (Quarter)', group: 'time', category: 'dimension', dataType: 'string', icon: Clock },
  { id: 'status', name: 'สถานะเอกสาร (Status)', group: 'sales', category: 'dimension', dataType: 'string', icon: Activity },

  // Measures
  { id: 'netAmount', name: 'ยอดขายสุทธิ (Sales)', group: 'finance', category: 'measure', dataType: 'number', icon: DollarSign },
  { id: 'grossProfit', name: 'กำไรขั้นต้น (Gross Profit)', group: 'finance', category: 'measure', dataType: 'number', icon: TrendingUp },
  { id: 'cogs', name: 'ต้นทุนสินค้า (COGS)', group: 'finance', category: 'measure', dataType: 'number', icon: Boxes },
  { id: 'marginPct', name: 'อัตรากำไร (Margin %)', group: 'finance', category: 'measure', dataType: 'number', icon: Percent },
  { id: 'quantity', name: 'จำนวนชิ้น (Qty)', group: 'finance', category: 'measure', dataType: 'number', icon: Package },
];

const PRESET_TEMPLATES = [
  {
    id: 'rep-sales-gp',
    title: 'ยอดขาย & กำไรตามพนักงาน',
    fullTitle: 'รายงานวิเคราะห์ยอดขายและกำไรตามพนักงานขาย',
    desc: 'ภาพรวมผลงานขาย กำไร และ Margin ของพนักงานขายแต่ละคน',
    rows: ['salesRep'],
    cols: [],
    vals: ['netAmount', 'grossProfit', 'marginPct'],
    viz: 'pivot',
    icon: User,
  },
  {
    id: 'category-monthly',
    title: 'ยอดขายหมวดหมู่แยกตามเดือน',
    fullTitle: 'ยอดขายรายหมวดหมู่สินค้าแยกตามเดือน',
    desc: 'เปรียบเทียบยอดขายของแต่ละหมวดสินค้าในแต่ละเดือน',
    rows: ['category'],
    cols: ['month'],
    vals: ['netAmount', 'grossProfit'],
    viz: 'pivot',
    icon: Calendar,
  },
  {
    id: 'customer-profitability',
    title: 'วิเคราะห์กำไรตามลูกค้า',
    fullTitle: 'วิเคราะห์การทำกำไรขั้นต้นจำแนกตามลูกค้า',
    desc: 'จัดอันดับลูกค้าที่สร้างยอดขายและกำไรสูงสุด',
    rows: ['customerName'],
    cols: [],
    vals: ['netAmount', 'grossProfit', 'marginPct'],
    viz: 'pivot',
    icon: Building,
  },
  {
    id: 'rep-product-matrix',
    title: 'พนักงาน × หมวดสินค้า',
    fullTitle: 'เมทริกซ์ยอดขาย พนักงานขาย × หมวดสินค้า',
    desc: 'ดูการกระจายตัวของสินค้าที่พนักงานแต่ละคนขายได้',
    rows: ['salesRep', 'category'],
    cols: [],
    vals: ['netAmount', 'grossProfit', 'marginPct'],
    viz: 'pivot',
    icon: Tag,
  },
];

export const ReportStudioView: React.FC<ReportStudioViewProps> = ({
  invoices,
  savedReports,
  onSaveReport,
  activeReportDef,
  onShowToast,
}) => {
  const [reportTitle, setReportTitle] = useState<string>(
    activeReportDef?.title || 'รายงานวิเคราะห์ยอดขายและกำไรตามพนักงานขาย'
  );

  // 4 Pivot Zones
  const [rowFields, setRowFields] = useState<string[]>(
    activeReportDef?.groupBy || ['salesRep']
  );
  const [columnFields, setColumnFields] = useState<string[]>([]);
  const [valueFields, setValueFields] = useState<string[]>(['netAmount', 'grossProfit', 'marginPct']);
  const [filters, setFilters] = useState<ReportFilter[]>(activeReportDef?.filters || []);

  const [visualization, setVisualization] = useState<'pivot' | 'combo' | 'bar' | 'donut'>('pivot');
  const [matrixSearch, setMatrixSearch] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'netAmount',
    direction: 'desc',
  });

  // Left Studio Panel Visibility
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(true);
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<'rows' | 'columns' | 'values' | 'filters' | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>('rep-sales-gp');

  // Apply Quick Template
  const handleApplyPreset = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setActivePresetId(tpl.id);
    setReportTitle(tpl.fullTitle);
    setRowFields(tpl.rows);
    setColumnFields(tpl.cols);
    setValueFields(tpl.vals);
    setVisualization(tpl.viz as any);
    onShowToast(`⚡ สลับเป็น: "${tpl.title}" เรียบร้อยแล้ว`);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    e.dataTransfer.setData('text/plain', fieldId);
    e.dataTransfer.effectAllowed = 'copyMove';
    setDraggedFieldId(fieldId);
  };

  const handleDragEnd = () => {
    setDraggedFieldId(null);
    setActiveDropZone(null);
  };

  const handleDragOverZone = (e: React.DragEvent, zone: 'rows' | 'columns' | 'values' | 'filters') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (activeDropZone !== zone) {
      setActiveDropZone(zone);
    }
  };

  const handleDragLeaveZone = () => {
    setActiveDropZone(null);
  };

  const handleDropInZone = (e: React.DragEvent, zone: 'rows' | 'columns' | 'values' | 'filters') => {
    e.preventDefault();
    const fieldId = e.dataTransfer.getData('text/plain') || draggedFieldId;
    if (!fieldId) return;

    const field = ALL_STUDIO_FIELDS.find((f) => f.id === fieldId);
    if (!field) return;

    if (zone === 'rows') {
      if (!rowFields.includes(fieldId)) {
        setRowFields((prev) => [...prev, fieldId]);
        setColumnFields((prev) => prev.filter((id) => id !== fieldId));
        onShowToast(`✓ เพิ่ม "${field.name.split(' ')[0]}" ในแกนแถว`);
      }
    } else if (zone === 'columns') {
      if (!columnFields.includes(fieldId)) {
        setColumnFields((prev) => [...prev, fieldId]);
        setRowFields((prev) => prev.filter((id) => id !== fieldId));
        onShowToast(`✓ เพิ่ม "${field.name.split(' ')[0]}" ในแกนคอลัมน์`);
      }
    } else if (zone === 'values') {
      if (field.category === 'measure' && !valueFields.includes(fieldId)) {
        setValueFields((prev) => [...prev, fieldId]);
        onShowToast(`✓ เพิ่ม "${field.name.split(' ')[0]}" ในช่องผลรวม`);
      } else if (field.category === 'dimension') {
        onShowToast(`ℹ "${field.name.split(' ')[0]}" เป็นมิติข้อมูล แนะนำให้วางใน Rows/Cols`);
      }
    } else if (zone === 'filters') {
      if (!filters.find((f) => f.field === fieldId)) {
        setFilters((prev) => [
          ...prev,
          {
            id: `flt-${Date.now()}`,
            field: fieldId,
            operator: 'equals',
            value: 'all',
          },
        ]);
        onShowToast(`✓ เพิ่มตัวกรองสำหรับ "${field.name.split(' ')[0]}"`);
      }
    }

    setDraggedFieldId(null);
    setActiveDropZone(null);
  };

  const handleToggleFieldInZone = (field: FieldItem) => {
    if (field.category === 'dimension') {
      if (rowFields.includes(field.id)) {
        setRowFields(rowFields.filter((id) => id !== field.id));
      } else if (columnFields.includes(field.id)) {
        setColumnFields(columnFields.filter((id) => id !== field.id));
      } else {
        setRowFields([...rowFields, field.id]);
      }
    } else {
      if (valueFields.includes(field.id)) {
        if (valueFields.length > 1) {
          setValueFields(valueFields.filter((id) => id !== field.id));
        } else {
          onShowToast('⚠ ตารางต้องมีตัวเลขอย่างน้อย 1 ฟิลด์');
        }
      } else {
        setValueFields([...valueFields, field.id]);
      }
    }
  };

  const handleRemoveField = (fieldId: string, zone: 'rows' | 'columns' | 'values' | 'filters') => {
    if (zone === 'rows') setRowFields(rowFields.filter((f) => f !== fieldId));
    if (zone === 'columns') setColumnFields(columnFields.filter((f) => f !== fieldId));
    if (zone === 'values') setValueFields(valueFields.filter((f) => f !== fieldId));
    if (zone === 'filters') setFilters(filters.filter((f) => f.id !== fieldId && f.field !== fieldId));
  };

  // Filtered dataset
  const filteredData = useMemo(() => {
    let res = [...invoices];
    filters.forEach((flt) => {
      if (flt.value && flt.value !== 'all') {
        res = res.filter((r) => String((r as any)[flt.field]) === flt.value);
      }
    });
    return res;
  }, [invoices, filters]);

  // Pivot Matrix Calculation
  const pivotMatrix = useMemo(() => {
    const primaryRow = rowFields[0] || 'salesRep';
    const secondaryRow = rowFields[1];
    const primaryCol = columnFields[0];

    type KeyMapEntry = { primaryVal: string; secondaryVal?: string; combinedKey: string };
    const keyMap = new Map<string, KeyMapEntry>();

    filteredData.forEach((d) => {
      const pVal = String((d as any)[primaryRow] || 'Other');
      const sVal = secondaryRow ? String((d as any)[secondaryRow] || '-') : undefined;
      const combined = secondaryRow ? `${pVal}__${sVal}` : pVal;
      if (!keyMap.has(combined)) {
        keyMap.set(combined, { primaryVal: pVal, secondaryVal: sVal, combinedKey: combined });
      }
    });

    const colKeys: string[] = primaryCol
      ? Array.from(new Set(filteredData.map((d) => String((d as any)[primaryCol] || 'Other'))))
      : [];

    let matrixRows = Array.from(keyMap.values()).map(({ primaryVal, secondaryVal, combinedKey }) => {
      const items = filteredData.filter((d) => {
        const pMatch = String((d as any)[primaryRow] || 'Other') === primaryVal;
        if (!secondaryRow) return pMatch;
        return pMatch && String((d as any)[secondaryRow] || '-') === secondaryVal;
      });

      const totalNet = items.reduce((acc, i) => acc + (i.netAmount || 0), 0);
      const totalCogs = items.reduce((acc, i) => acc + (i.cogs || 0), 0);
      const totalGp = items.reduce((acc, i) => acc + (i.grossProfit || 0), 0);
      const totalQty = items.reduce((acc, i) => acc + (i.quantity || 0), 0);
      const margin = totalNet > 0 ? Math.round((totalGp / totalNet) * 1000) / 10 : 0;

      // By Column breakdown
      const colBreakdown: Record<string, number> = {};
      colKeys.forEach((cKey) => {
        const cItems = items.filter((d) => String((d as any)[primaryCol] || 'Other') === cKey);
        colBreakdown[cKey] = cItems.reduce((acc, i) => acc + (i.netAmount || 0), 0);
      });

      return {
        id: combinedKey,
        rowKey: primaryVal,
        secondaryKey: secondaryRow ? secondaryVal : undefined,
        primaryField: primaryRow,
        secondaryField: secondaryRow,
        count: items.length,
        netAmount: totalNet,
        grossProfit: totalGp,
        cogs: totalCogs,
        marginPct: margin,
        quantity: totalQty,
        colBreakdown,
      };
    });

    // Search filtering
    if (matrixSearch.trim()) {
      const q = matrixSearch.toLowerCase();
      matrixRows = matrixRows.filter(
        (r) =>
          r.rowKey.toLowerCase().includes(q) ||
          (r.secondaryKey && r.secondaryKey.toLowerCase().includes(q))
      );
    }

    // Sorting
    matrixRows.sort((a, b) => {
      let aVal = (a as any)[sortConfig.field];
      let bVal = (b as any)[sortConfig.field];

      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
    });

    // Grand totals
    const grandNet = matrixRows.reduce((acc, r) => acc + r.netAmount, 0);
    const grandGp = matrixRows.reduce((acc, r) => acc + r.grossProfit, 0);
    const grandMargin = grandNet > 0 ? Math.round((grandGp / grandNet) * 1000) / 10 : 0;
    const grandQty = matrixRows.reduce((acc, r) => acc + r.quantity, 0);

    return {
      rows: matrixRows,
      colKeys,
      grandTotals: {
        netAmount: grandNet,
        grossProfit: grandGp,
        marginPct: grandMargin,
        quantity: grandQty,
      },
    };
  }, [filteredData, rowFields, columnFields, valueFields, matrixSearch, sortConfig]);

  const handleSortToggle = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleSaveReport = () => {
    const report: ReportDefinition = {
      id: `rep-${Date.now()}`,
      title: reportTitle,
      dataset: 'sales',
      selectedFields: [...rowFields, ...columnFields, ...valueFields],
      filters,
      groupBy: rowFields,
      sortBy: { field: 'netAmount', direction: 'desc' },
      aggregation: 'sum',
      visualization,
      category: 'Custom',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      owner: 'Admin',
    };
    onSaveReport(report);
    onShowToast(`✓ บันทึกรายงาน "${reportTitle}" เรียบร้อยแล้ว`);
  };

  const handleExport = () => {
    exportToExcel(pivotMatrix.rows, 'ReportStudio', `${reportTitle.replace(/\s+/g, '_')}.xlsx`);
    onShowToast('✓ ส่งออกรายงานไปยัง Excel เรียบร้อยแล้ว');
  };

  const handleReset = () => {
    setRowFields(['salesRep']);
    setColumnFields([]);
    setValueFields(['netAmount', 'grossProfit', 'marginPct']);
    setFilters([]);
    onShowToast('↺ รีเซ็ตโครงสร้างรายงานเรียบร้อยแล้ว');
  };

  return (
    <div id="view-report-studio" className="space-y-4 w-full min-w-0">
      {/* 1. Top Header Bar */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0 shadow-xs">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="font-bold text-sm sm:text-base text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 focus:outline-hidden focus:border-teal-500 pb-0.5 max-w-full"
              />
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200/60 dark:border-teal-800/40 whitespace-nowrap">
                Ad-Hoc Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              สร้างตารางวิเคราะห์ Pivot Matrix และสรุปยอดขายด้วย Drag &amp; Drop แบบเข้าใจง่าย
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer shadow-2xs ${
              isSidePanelOpen
                ? 'bg-teal-50 dark:bg-teal-950 border-teal-300 dark:border-teal-700 text-teal-800 dark:text-teal-200'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {isSidePanelOpen ? (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>ซ่อนพาเนลซ้าย</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>เปิดพาเนลจัดแกน</span>
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ต</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleSaveReport}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกรายงาน</span>
          </button>
        </div>
      </div>

      {/* 2. Redesigned Subtle & Elegant Quick Preset Templates Bar */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
          <div className="w-5 h-5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-200">เทมเพลตด่วน:</span>
          <span className="text-[11px] text-slate-400 font-normal hidden lg:inline">
            (คลิกเพื่อสลับมิติรายงานทันที)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = activePresetId === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => handleApplyPreset(tpl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/70 border border-teal-300/80 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-semibold shadow-2xs'
                    : 'bg-slate-50/80 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                <span>{tpl.title}</span>
                {isSelected && <Check className="w-3 h-3 text-teal-600 dark:text-teal-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Studio Body: Left Dock Panel + Right Canvas Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-4 w-full min-w-0">
        {/* Left: Pivot Designer Side Dock Panel (Excel/Power BI Field List Style on Left) */}
        {isSidePanelOpen && (
          <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0 space-y-4">
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-4 sticky top-4">
              {/* Panel Header - Guaranteed Single Line on Notebooks */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span className="font-bold text-xs sm:text-[13px] text-slate-900 dark:text-white whitespace-nowrap">
                    Pivot Table Fields (ตัวจัดแกน)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-slate-500 shrink-0 whitespace-nowrap">
                  {ALL_STUDIO_FIELDS.length} ฟิลด์
                </span>
              </div>

              {/* Step 1: Field List Categorized (มิติข้อมูล vs ตัวเลข) */}
              <div className="space-y-3.5">
                {/* 1.1 Dimensions List */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                      <Layers className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>มิติข้อมูล (Dimensions)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">จัดกลุ่ม</span>
                  </div>
                  <div className="space-y-1">
                    {ALL_STUDIO_FIELDS.filter((f) => f.category === 'dimension').map((f) => {
                      const isRow = rowFields.includes(f.id);
                      const isCol = columnFields.includes(f.id);
                      const Icon = f.icon;

                      return (
                        <div
                          key={f.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, f.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleToggleFieldInZone(f)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center justify-between transition select-none cursor-grab active:cursor-grabbing ${
                            isRow
                              ? 'bg-teal-50 dark:bg-teal-950/70 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200 font-semibold'
                              : isCol
                              ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-semibold'
                              : 'bg-slate-50/70 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="w-3 h-3 text-slate-400 shrink-0" />
                            <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{f.name.split(' ')[0]}</span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 whitespace-nowrap ${
                              isRow
                                ? 'bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold'
                                : isCol
                                ? 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold'
                                : 'bg-slate-200 dark:bg-slate-750 text-slate-500'
                            }`}
                          >
                            {isRow ? 'แกนแถว' : isCol ? 'คอลัมน์' : '+'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 1.2 Measures List */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>ตัวเลขคำนวณ (Measures)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">วัดผล</span>
                  </div>
                  <div className="space-y-1">
                    {ALL_STUDIO_FIELDS.filter((f) => f.category === 'measure').map((f) => {
                      const isVal = valueFields.includes(f.id);
                      const Icon = f.icon;

                      return (
                        <div
                          key={f.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, f.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => handleToggleFieldInZone(f)}
                          className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center justify-between transition select-none cursor-grab active:cursor-grabbing ${
                            isVal
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold'
                              : 'bg-slate-50/70 dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <GripVertical className="w-3 h-3 text-slate-400 shrink-0" />
                            <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{f.name.split(' ')[0]}</span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 whitespace-nowrap ${
                              isVal
                                ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold'
                                : 'bg-slate-200 dark:bg-slate-750 text-slate-500'
                            }`}
                          >
                            {isVal ? '✓ คำนวณ' : '+'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 2: 4 Drop Zones - Single Column Stacked (เรียงแถวเดี่ยวลงมาเห็นชัดเจน) */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    โครงสร้าง Pivot (Drop Zones)
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                    ลากวางเพื่อปรับแกน
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Drop Zone 1: Rows (แกนแถว) */}
                  <div
                    onDragOver={(e) => handleDragOverZone(e, 'rows')}
                    onDragLeave={handleDragLeaveZone}
                    onDrop={(e) => handleDropInZone(e, 'rows')}
                    className={`p-2.5 rounded-xl border-2 transition-all min-h-[58px] ${
                      activeDropZone === 'rows'
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/60 shadow-inner'
                        : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                        <span>แกนแถว (Rows)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rowFields.length} ฟิลด์
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {rowFields.map((fId) => (
                        <span
                          key={fId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 shadow-2xs"
                        >
                          <span>{ALL_STUDIO_FIELDS.find((f) => f.id === fId)?.name.split(' ')[0] || fId}</span>
                          <button
                            onClick={() => handleRemoveField(fId, 'rows')}
                            className="text-teal-600 dark:text-teal-300 hover:text-red-500 dark:hover:text-red-400 p-0.5 rounded hover:bg-teal-200/50 dark:hover:bg-teal-800 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {rowFields.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">ลากมิติข้อมูลมาวางที่นี่</span>
                      )}
                    </div>
                  </div>

                  {/* Drop Zone 2: Columns (คอลัมน์) */}
                  <div
                    onDragOver={(e) => handleDragOverZone(e, 'columns')}
                    onDragLeave={handleDragLeaveZone}
                    onDrop={(e) => handleDropInZone(e, 'columns')}
                    className={`p-2.5 rounded-xl border-2 transition-all min-h-[58px] ${
                      activeDropZone === 'columns'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-inner'
                        : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                        <span>คอลัมน์ (Cols)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {columnFields.length} ฟิลด์
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {columnFields.map((fId) => (
                        <span
                          key={fId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 shadow-2xs"
                        >
                          <span>{ALL_STUDIO_FIELDS.find((f) => f.id === fId)?.name.split(' ')[0] || fId}</span>
                          <button
                            onClick={() => handleRemoveField(fId, 'columns')}
                            className="text-blue-600 dark:text-blue-300 hover:text-red-500 dark:hover:text-red-400 p-0.5 rounded hover:bg-blue-200/50 dark:hover:bg-blue-800 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {columnFields.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">ว่าง (ลากฟิลด์เพื่อแยกคอลัมน์)</span>
                      )}
                    </div>
                  </div>

                  {/* Drop Zone 3: Values (ค่าตัวเลข) */}
                  <div
                    onDragOver={(e) => handleDragOverZone(e, 'values')}
                    onDragLeave={handleDragLeaveZone}
                    onDrop={(e) => handleDropInZone(e, 'values')}
                    className={`p-2.5 rounded-xl border-2 transition-all min-h-[58px] ${
                      activeDropZone === 'values'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 shadow-inner'
                        : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span>ค่าตัวเลข (Values)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {valueFields.length} ฟิลด์
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {valueFields.map((fId) => (
                        <span
                          key={fId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                        >
                          <span>{ALL_STUDIO_FIELDS.find((f) => f.id === fId)?.name.split(' ')[0] || fId}</span>
                          {valueFields.length > 1 && (
                            <button
                              onClick={() => handleRemoveField(fId, 'values')}
                              className="text-emerald-600 dark:text-emerald-300 hover:text-red-500 dark:hover:text-red-400 p-0.5 rounded hover:bg-emerald-200/50 dark:hover:bg-emerald-800 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Drop Zone 4: Filters (ตัวกรอง) */}
                  <div
                    onDragOver={(e) => handleDragOverZone(e, 'filters')}
                    onDragLeave={handleDragLeaveZone}
                    onDrop={(e) => handleDropInZone(e, 'filters')}
                    className={`p-2.5 rounded-xl border-2 transition-all min-h-[58px] ${
                      activeDropZone === 'filters'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 shadow-inner'
                        : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap">
                        <Filter className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>ตัวกรอง (Filters)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {filters.length} ฟิลด์
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {filters.map((flt) => (
                        <span
                          key={flt.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 shadow-2xs"
                        >
                          <span>{ALL_STUDIO_FIELDS.find((f) => f.id === flt.field)?.name.split(' ')[0] || flt.field}</span>
                          <button
                            onClick={() => handleRemoveField(flt.id, 'filters')}
                            className="text-amber-600 dark:text-amber-300 hover:text-red-500 dark:hover:text-red-400 p-0.5 rounded hover:bg-amber-200/50 dark:hover:bg-amber-800 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {filters.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">ว่าง (ลากฟิลด์เพื่อกรองข้อมูล)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right: Main Canvas (Live Pivot Matrix Grid & Charts) */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* View Switcher Tabs */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                มุมมองรายงาน:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { type: 'pivot', label: 'Live Pivot Matrix Grid', icon: FileSpreadsheet },
                { type: 'combo', label: 'Combo Chart', icon: BarChart3 },
                { type: 'bar', label: 'Bar Chart', icon: BarChart3 },
                { type: 'donut', label: 'Donut Share', icon: PieIcon },
              ].map((v) => {
                const Icon = v.icon;
                const isActive = visualization === v.type;
                return (
                  <button
                    key={v.type}
                    onClick={() => setVisualization(v.type as any)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart View (if active) */}
          {visualization !== 'pivot' && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="h-72 w-full">
                {visualization === 'combo' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={pivotMatrix.rows}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="rowKey" stroke="#94a3b8" fontSize={11} />
                      <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar yAxisId="left" dataKey="netAmount" fill="#0d9488" radius={[6, 6, 0, 0]} name="ยอดขายสุทธิ" />
                      <Line yAxisId="right" type="monotone" dataKey="marginPct" stroke="#10b981" strokeWidth={3} name="Margin %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}

                {visualization === 'bar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pivotMatrix.rows}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="rowKey" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="netAmount" fill="#0d9488" radius={[6, 6, 0, 0]} name="ยอดขาย" />
                      <Bar dataKey="grossProfit" fill="#10b981" radius={[6, 6, 0, 0]} name="กำไรขั้นต้น" />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {visualization === 'donut' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pivotMatrix.rows}
                        dataKey="netAmount"
                        nameKey="rowKey"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {pivotMatrix.rows.map((_, i) => (
                          <Cell
                            key={i}
                            fill={['#0d9488', '#059669', '#2563eb', '#4f46e5', '#d97706'][i % 5]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* The Live Pivot Matrix Table */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Live Pivot Matrix Grid</h4>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 font-mono font-bold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                    {pivotMatrix.rows.length} กลุ่มข้อมูล
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  จัดกลุ่มตาม: <span className="font-semibold text-teal-600 dark:text-teal-400">{rowFields.map((fId) => ALL_STUDIO_FIELDS.find((f) => f.id === fId)?.name.split(' ')[0] || fId).join(' › ') || 'ทั้งหมด'}</span>
                  {columnFields.length > 0 && ` | แยกคอลัมน์: ${columnFields.map((fId) => ALL_STUDIO_FIELDS.find((f) => f.id === fId)?.name.split(' ')[0] || fId).join(', ')}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={matrixSearch}
                    onChange={(e) => setMatrixSearch(e.target.value)}
                    placeholder="ค้นหาในตาราง..."
                    className="w-40 sm:w-56 pl-8 pr-7 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-teal-500 transition"
                  />
                  {matrixSearch && (
                    <button
                      onClick={() => setMatrixSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[520px] custom-scrollbar w-full min-w-0 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[700px] border-collapse">
                <thead className="bg-slate-50/95 dark:bg-slate-850/95 backdrop-blur-xs text-slate-600 dark:text-slate-400 uppercase font-semibold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 shadow-2xs">
                  <tr>
                    <th
                      onClick={() => handleSortToggle('rowKey')}
                      className="py-3 px-4 text-left cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span>{rowFields.map((fId) => ALL_STUDIO_FIELDS.find((f) => f.id === fId)?.name.split(' ')[0]).join(' / ') || 'กลุ่มข้อมูล'}</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('count')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none whitespace-nowrap"
                    >
                      <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                        <span>จำนวนบิล</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    {/* Dynamic Columns */}
                    {pivotMatrix.colKeys.map((cKey) => (
                      <th key={cKey} className="py-3 px-3 text-right font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {cKey}
                      </th>
                    ))}
                    <th
                      onClick={() => handleSortToggle('netAmount')}
                      className="py-3 px-3 text-right font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none whitespace-nowrap"
                    >
                      <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                        <span>ยอดขายรวม</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('cogs')}
                      className="py-3 px-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none whitespace-nowrap"
                    >
                      <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                        <span>ต้นทุนขาย (COGS)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('grossProfit')}
                      className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:text-emerald-500 transition select-none whitespace-nowrap"
                    >
                      <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                        <span>กำไรขั้นต้น</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortToggle('marginPct')}
                      className="py-3 px-4 text-right font-bold cursor-pointer hover:text-slate-900 dark:hover:text-white transition select-none whitespace-nowrap"
                    >
                      <div className="inline-flex items-center justify-end gap-1 whitespace-nowrap">
                        <span>Margin %</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-[#0f172a]">
                  {pivotMatrix.rows.map((row, idx) => {
                    const primaryFieldObj = ALL_STUDIO_FIELDS.find((f) => f.id === row.primaryField);
                    const secondaryFieldObj = row.secondaryField ? ALL_STUDIO_FIELDS.find((f) => f.id === row.secondaryField) : null;
                    const PrimaryIcon = primaryFieldObj?.icon || FileSpreadsheet;
                    const SecondaryIcon = secondaryFieldObj?.icon;

                    return (
                      <tr
                        key={row.id || idx}
                        className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <td className="py-3.5 px-4 text-left">
                          <div className="flex items-start gap-2.5 min-w-[200px]">
                            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/40 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              <PrimaryIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm tracking-tight leading-snug">
                                {row.rowKey}
                              </div>
                              {row.secondaryKey && (
                                <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                                  {SecondaryIcon && <SecondaryIcon className="w-3 h-3 text-slate-400" />}
                                  <span>{row.secondaryKey}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold whitespace-nowrap">
                            {row.count} บิล
                          </span>
                        </td>
                        {/* Dynamic Columns values */}
                        {pivotMatrix.colKeys.map((cKey) => (
                          <td key={cKey} className="py-3.5 px-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {row.colBreakdown[cKey] ? `฿${row.colBreakdown[cKey].toLocaleString()}` : '-'}
                          </td>
                        ))}
                        <td className="py-3.5 px-3 text-right font-bold text-teal-600 dark:text-teal-400 font-mono text-xs sm:text-sm whitespace-nowrap">
                          ฿{row.netAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-right text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                          ฿{row.cogs.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs sm:text-sm whitespace-nowrap">
                          ฿{row.grossProfit.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                              row.marginPct >= 30
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50'
                                : row.marginPct >= 20
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50'
                            }`}
                          >
                            {row.marginPct >= 30 ? (
                              <TrendingUp className="w-3 h-3 text-emerald-500" />
                            ) : row.marginPct >= 20 ? (
                              <Percent className="w-3 h-3 text-blue-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-amber-500" />
                            )}
                            <span>{row.marginPct}%</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {pivotMatrix.rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6 + pivotMatrix.colKeys.length}
                        className="py-8 text-center text-slate-400 dark:text-slate-500"
                      >
                        ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
                {/* Grand Total Footer Row */}
                <tfoot className="bg-slate-100/90 dark:bg-slate-850/95 font-bold border-t-2 border-slate-300 dark:border-slate-700 sticky bottom-0 z-10">
                  <tr>
                    <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold text-xs sm:text-sm whitespace-nowrap">
                      รวมทั้งสิ้น (Grand Total)
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-600 dark:text-slate-300 font-mono whitespace-nowrap">
                      {pivotMatrix.rows.reduce((acc, r) => acc + r.count, 0)} บิล
                    </td>
                    {pivotMatrix.colKeys.map((cKey) => {
                      const colSum = pivotMatrix.rows.reduce((acc, r) => acc + (r.colBreakdown[cKey] || 0), 0);
                      return (
                        <td key={cKey} className="py-3.5 px-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          ฿{colSum.toLocaleString()}
                        </td>
                      );
                    })}
                    <td className="py-3.5 px-3 text-right text-teal-700 dark:text-teal-300 font-mono font-bold text-xs sm:text-sm whitespace-nowrap">
                      ฿{pivotMatrix.grandTotals.netAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                      ฿{pivotMatrix.rows.reduce((acc, r) => acc + r.cogs, 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs sm:text-sm whitespace-nowrap">
                      ฿{pivotMatrix.grandTotals.grossProfit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-teal-600 text-white shadow-2xs whitespace-nowrap">
                        {pivotMatrix.grandTotals.marginPct}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportStudioView;
