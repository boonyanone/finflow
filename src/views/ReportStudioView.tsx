import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  Download,
  Layers,
  Filter,
  BarChart3,
  Table as TableIcon,
  PieChart as PieIcon,
  Check,
  RotateCcw,
  GripVertical,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
} from 'recharts';
import { InvoiceRecord, ReportDefinition, ReportFilter, CalculatedField } from '../types';
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
  category: 'dimension' | 'measure';
  dataType: 'string' | 'number' | 'date';
}

const ALL_STUDIO_FIELDS: FieldItem[] = [
  { id: 'salesRep', name: 'Sales Rep (พนักงานขาย)', category: 'dimension', dataType: 'string' },
  { id: 'category', name: 'Category (หมวดสินค้า)', category: 'dimension', dataType: 'string' },
  { id: 'customerName', name: 'Customer (ลูกค้า)', category: 'dimension', dataType: 'string' },
  { id: 'month', name: 'Month (เดือน)', category: 'dimension', dataType: 'string' },
  { id: 'period', name: 'Quarter (ไตรมาส)', category: 'dimension', dataType: 'string' },
  { id: 'status', name: 'Status (สถานะบิล)', category: 'dimension', dataType: 'string' },
  { id: 'itemDescription', name: 'Product Name (ชื่อสินค้า)', category: 'dimension', dataType: 'string' },
  { id: 'netAmount', name: 'Sales Amount (ยอดขายสุทธิ)', category: 'measure', dataType: 'number' },
  { id: 'grossProfit', name: 'Gross Profit (กำไรขั้นต้น)', category: 'measure', dataType: 'number' },
  { id: 'cogs', name: 'COGS Cost (ต้นทุนขาย)', category: 'measure', dataType: 'number' },
  { id: 'marginPct', name: 'Margin % (อัตรากำไร)', category: 'measure', dataType: 'number' },
  { id: 'quantity', name: 'Quantity (จำนวนชิ้น)', category: 'measure', dataType: 'number' },
];

export const ReportStudioView: React.FC<ReportStudioViewProps> = ({
  invoices,
  savedReports,
  onSaveReport,
  activeReportDef,
  onShowToast,
}) => {
  const [reportTitle, setReportTitle] = useState<string>(
    activeReportDef?.title || 'รายงานวิเคราะห์ยอดขายและกำไรตามพนักงานและหมวดหมู่'
  );

  // 4 Pivot Zones: Rows, Columns, Values, Filters
  const [rowFields, setRowFields] = useState<string[]>(
    activeReportDef?.groupBy || ['salesRep', 'category']
  );
  const [columnFields, setColumnFields] = useState<string[]>(['month']);
  const [valueFields, setValueFields] = useState<string[]>(['netAmount', 'grossProfit', 'marginPct']);
  const [filters, setFilters] = useState<ReportFilter[]>(activeReportDef?.filters || []);

  const [visualization, setVisualization] = useState<'pivot' | 'combo' | 'bar' | 'donut' | 'table'>(
    activeReportDef?.visualization || 'pivot'
  );
  const [valueAggregations, setValueAggregations] = useState<Record<string, 'sum' | 'avg' | 'count'>>({
    netAmount: 'sum',
    grossProfit: 'sum',
    cogs: 'sum',
    marginPct: 'avg',
    quantity: 'sum',
  });

  const handleAddFieldToZone = (fieldId: string, zone: 'rows' | 'columns' | 'values' | 'filters') => {
    if (zone === 'rows') {
      if (!rowFields.includes(fieldId)) setRowFields([...rowFields, fieldId]);
    } else if (zone === 'columns') {
      if (!columnFields.includes(fieldId)) setColumnFields([...columnFields, fieldId]);
    } else if (zone === 'values') {
      if (!valueFields.includes(fieldId)) setValueFields([...valueFields, fieldId]);
    } else if (zone === 'filters') {
      setFilters([
        ...filters,
        { id: `flt-${Date.now()}`, field: fieldId, operator: 'equals', value: 'all' },
      ]);
    }
  };

  const handleRemoveField = (fieldId: string, zone: 'rows' | 'columns' | 'values') => {
    if (zone === 'rows') setRowFields(rowFields.filter((f) => f !== fieldId));
    if (zone === 'columns') setColumnFields(columnFields.filter((f) => f !== fieldId));
    if (zone === 'values') setValueFields(valueFields.filter((f) => f !== fieldId));
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

    const rowKeys: string[] = Array.from(new Set(filteredData.map((d) => String((d as any)[primaryRow] || 'Other'))));
    const colKeys: string[] = primaryCol
      ? Array.from(new Set(filteredData.map((d) => String((d as any)[primaryCol] || 'Other'))))
      : [];

    const matrixRows = rowKeys.map((rKey) => {
      const items = filteredData.filter((d) => String((d as any)[primaryRow] || 'Other') === rKey);
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
        rowKey: rKey,
        count: items.length,
        netAmount: totalNet,
        grossProfit: totalGp,
        cogs: totalCogs,
        marginPct: margin,
        quantity: totalQty,
        colBreakdown,
      };
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
  }, [filteredData, rowFields, columnFields, valueFields]);

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
    onShowToast(`✓ บันทึกรายงาน "${reportTitle}" ลงในคลังเรียบร้อย`);
  };

  const handleExport = () => {
    exportToExcel(pivotMatrix.rows, 'ReportStudio', `${reportTitle.replace(/\s+/g, '_')}.xlsx`);
    onShowToast('✓ ส่งออกรายงานไปยัง Excel เรียบร้อยแล้ว');
  };

  const handleReset = () => {
    setRowFields(['salesRep', 'category']);
    setColumnFields(['month']);
    setValueFields(['netAmount', 'grossProfit', 'marginPct']);
    setFilters([]);
    onShowToast('↺ รีเซ็ตโครงสร้างรายงานเรียบร้อยแล้ว');
  };

  return (
    <div id="view-report-studio" className="space-y-5 w-full min-w-0">
      {/* Top Header & Actions */}
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
                Pill Drag &amp; Drop Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              สร้างตารางไขว้ (Pivot Matrix) และสรุปยอดขาย กำไรขั้นต้น อัตรากำไรได้อิสระ
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
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

      {/* Main Studio Workspace: Left Field Library + Right Pivot Builder & Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 w-full min-w-0">
        {/* Left Column: Field Palette with Grip Dots */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>คลังฟิลด์ข้อมูล (Fields)</span>
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">คลิก (+) เพื่อส่งฟิลด์เข้าแกนที่ต้องการ</p>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dimensions (มิติข้อมูล)</div>
            <div className="space-y-1.5">
              {ALL_STUDIO_FIELDS.filter((f) => f.category === 'dimension').map((f) => (
                <div
                  key={f.id}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs flex items-center justify-between group transition hover:border-teal-500/40"
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <GripVertical className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate text-[11px]">{f.name}</span>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => handleAddFieldToZone(f.id, 'rows')}
                      title="เพิ่มในแถว (Rows)"
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 shadow-2xs cursor-pointer"
                    >
                      Row
                    </button>
                    <button
                      onClick={() => handleAddFieldToZone(f.id, 'columns')}
                      title="เพิ่มในคอลัมน์ (Cols)"
                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 shadow-2xs cursor-pointer"
                    >
                      Col
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Measures */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Measures (ค่าตัวเลข)</div>
            <div className="space-y-1.5">
              {ALL_STUDIO_FIELDS.filter((f) => f.category === 'measure').map((f) => (
                <div
                  key={f.id}
                  className="p-2 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 text-xs flex items-center justify-between group transition hover:border-teal-500/40"
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <TrendingUp className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="font-bold text-teal-900 dark:text-teal-200 truncate text-[11px]">{f.name}</span>
                  </div>
                  <button
                    onClick={() => handleAddFieldToZone(f.id, 'values')}
                    title="เพิ่มในค่าตัวเลข (Values)"
                    className="px-1.5 py-0.5 rounded bg-teal-600 text-[10px] font-bold text-white shadow-2xs cursor-pointer shrink-0"
                  >
                    + Val
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 3 Cols: The 4 Drop Zones + Live Pivot Table Canvas */}
        <div className="lg:col-span-3 space-y-4 w-full min-w-0">
          {/* 4 Interactive Drop Zones */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Rows Zone */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 space-y-2 min-h-[90px]">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>แถว (Rows)</span>
                  <span className="text-[10px] text-slate-400">{rowFields.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rowFields.map((fId) => {
                    const f = ALL_STUDIO_FIELDS.find((item) => item.id === fId);
                    return (
                      <span
                        key={fId}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800 shadow-2xs"
                      >
                        <GripVertical className="w-2.5 h-2.5 text-teal-500 shrink-0" />
                        <span className="truncate">{f?.name.split(' ')[0] || fId}</span>
                        <button
                          onClick={() => handleRemoveField(fId, 'rows')}
                          className="hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  {rowFields.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">คลิกเลือกจากคลังฟิลด์ซ้าย</span>
                  )}
                </div>
              </div>

              {/* 2. Columns Zone */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 space-y-2 min-h-[90px]">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>คอลัมน์ (Columns)</span>
                  <span className="text-[10px] text-slate-400">{columnFields.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {columnFields.map((fId) => {
                    const f = ALL_STUDIO_FIELDS.find((item) => item.id === fId);
                    return (
                      <span
                        key={fId}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800 shadow-2xs"
                      >
                        <GripVertical className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                        <span className="truncate">{f?.name.split(' ')[0] || fId}</span>
                        <button
                          onClick={() => handleRemoveField(fId, 'columns')}
                          className="hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                  {columnFields.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">เลือกเดือน/ไตรมาส</span>
                  )}
                </div>
              </div>

              {/* 3. Values Zone */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 space-y-2 min-h-[90px]">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>ค่าตัวเลข (Values)</span>
                  <span className="text-[10px] text-slate-400">{valueFields.length}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {valueFields.map((fId) => {
                    const f = ALL_STUDIO_FIELDS.find((item) => item.id === fId);
                    return (
                      <span
                        key={fId}
                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 shadow-2xs"
                      >
                        <span className="truncate">Σ {f?.name.split(' ')[0] || fId}</span>
                        <button
                          onClick={() => handleRemoveField(fId, 'values')}
                          className="hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 4. Filters Zone */}
              <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 space-y-2 min-h-[90px]">
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>ตัวกรอง (Filters)</span>
                  <button
                    onClick={() => handleAddFieldToZone('category', 'filters')}
                    className="text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                  >
                    + Filter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {filters.map((flt) => (
                    <span
                      key={flt.id}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800 shadow-2xs"
                    >
                      <Filter className="w-2.5 h-2.5 text-amber-500" />
                      <span>{flt.field}: All</span>
                      <button
                        onClick={() => setFilters(filters.filter((f) => f.id !== flt.id))}
                        className="hover:text-rose-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">ไม่จำกัดตัวกรอง</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Visualization Controls */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <span className="text-xs font-bold text-slate-900 dark:text-white">มุมมองการวิเคราะห์ (View Layout):</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { type: 'pivot', label: 'Pivot Matrix (ตารางไขว้)', icon: FileSpreadsheet },
                { type: 'combo', label: 'Combo (Bar+Line)', icon: BarChart3 },
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

          {/* Chart View if selected */}
          {visualization !== 'pivot' && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="h-64 w-full">
                {visualization === 'combo' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={pivotMatrix.rows}>
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
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Live Pivot Matrix Grid</h4>
                <p className="text-[11px] text-slate-400">
                  คำนวณสดตามแกนแถว: <span className="font-semibold text-teal-600 dark:text-teal-400">{rowFields.join(' › ') || 'ทั้งหมด'}</span>
                  {columnFields.length > 0 && ` | แกนคอลัมน์: ${columnFields.join(', ')}`}
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 font-mono font-bold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40">
                {pivotMatrix.rows.length} กลุ่ม
              </span>
            </div>

            <div className="overflow-x-auto max-h-96 custom-scrollbar w-full min-w-0">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[620px]">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase font-semibold sticky top-0 border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">
                      {rowFields.map((fId) => ALL_STUDIO_FIELDS.find((f) => f.id === fId)?.name.split(' ')[0]).join(' / ') || 'กลุ่ม'}
                    </th>
                    <th className="py-2.5 px-3 text-right">จำนวนบิล</th>
                    {/* Dynamic Columns */}
                    {pivotMatrix.colKeys.map((cKey) => (
                      <th key={cKey} className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                        {cKey}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right font-bold">ยอดขายรวม</th>
                    <th className="py-2.5 px-3 text-right">ต้นทุน COGS</th>
                    <th className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">กำไรขั้นต้น</th>
                    <th className="py-2.5 px-3 text-right font-bold">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pivotMatrix.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <ChevronRight className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                        <span>{row.rowKey}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">{row.count}</td>
                      {/* Dynamic Columns values */}
                      {pivotMatrix.colKeys.map((cKey) => (
                        <td key={cKey} className="py-2.5 px-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                          {row.colBreakdown[cKey] ? `฿${row.colBreakdown[cKey].toLocaleString()}` : '-'}
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right font-bold text-teal-600 dark:text-teal-400 font-mono">
                        ฿{row.netAmount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 font-mono">
                        ฿{row.cogs.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ฿{row.grossProfit.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {row.marginPct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Grand Total Footer Row */}
                <tfoot className="bg-slate-100/80 dark:bg-slate-850 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                  <tr>
                    <td className="py-3 px-3 text-slate-900 dark:text-white">รวมทั้งสิ้น (Grand Total)</td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {pivotMatrix.rows.reduce((acc, r) => acc + r.count, 0)}
                    </td>
                    {pivotMatrix.colKeys.map((cKey) => {
                      const colSum = pivotMatrix.rows.reduce((acc, r) => acc + (r.colBreakdown[cKey] || 0), 0);
                      return (
                        <td key={cKey} className="py-3 px-3 text-right font-mono text-blue-600 dark:text-blue-400">
                          ฿{colSum.toLocaleString()}
                        </td>
                      );
                    })}
                    <td className="py-3 px-3 text-right text-teal-700 dark:text-teal-300 font-mono">
                      ฿{pivotMatrix.grandTotals.netAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 font-mono">
                      ฿{pivotMatrix.rows.reduce((acc, r) => acc + r.cogs, 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-700 dark:text-emerald-300 font-mono">
                      ฿{pivotMatrix.grandTotals.grossProfit.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-900 dark:text-white font-mono">
                      {pivotMatrix.grandTotals.marginPct}%
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
