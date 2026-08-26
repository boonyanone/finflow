import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  Download,
  Play,
  Layers,
  Filter,
  BarChart3,
  Table as TableIcon,
  PieChart as PieIcon,
  Calculator,
  Sparkles,
  Check,
  RotateCcw,
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
import { exportToCsv, exportToExcel } from '../utils/exportUtils';

interface ReportStudioViewProps {
  invoices: InvoiceRecord[];
  savedReports: ReportDefinition[];
  onSaveReport: (report: ReportDefinition) => void;
  activeReportDef?: ReportDefinition;
  onShowToast: (msg: string) => void;
}

const AVAILABLE_FIELDS = [
  { id: 'invoiceNo', label: 'Invoice No (เลขที่บิล)', type: 'string' },
  { id: 'date', label: 'Invoice Date (วันที่เอกสาร)', type: 'date' },
  { id: 'customerName', label: 'Customer Name (ชื่อลูกค้า)', type: 'string' },
  { id: 'salesRep', label: 'Sales Rep (พนักงานขาย)', type: 'string' },
  { id: 'category', label: 'Category (หมวดหมู่สินค้า)', type: 'string' },
  { id: 'itemDescription', label: 'Product Description (สินค้า)', type: 'string' },
  { id: 'quantity', label: 'Quantity (จำนวน)', type: 'number' },
  { id: 'netAmount', label: 'Net Sales Amount (ยอดขายสุทธิ)', type: 'number' },
  { id: 'cogs', label: 'COGS Cost (ต้นทุนขาย)', type: 'number' },
  { id: 'grossProfit', label: 'Gross Profit (กำไรขั้นต้น)', type: 'number' },
  { id: 'marginPct', label: 'Margin % (อัตรากำไร %)', type: 'number' },
  { id: 'status', label: 'Status (สถานะบิล)', type: 'string' },
  { id: 'month', label: 'Month (เดือน)', type: 'string' },
];

export const ReportStudioView: React.FC<ReportStudioViewProps> = ({
  invoices,
  savedReports,
  onSaveReport,
  activeReportDef,
  onShowToast,
}) => {
  const [reportTitle, setReportTitle] = useState<string>(
    activeReportDef?.title || 'รายงานวิเคราะห์ยอดขายและกำไรขั้นต้น (Custom Report)'
  );
  const [dataset, setDataset] = useState<'sales' | 'ar_aging' | 'inventory'>('sales');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    activeReportDef?.selectedFields || ['month', 'salesRep', 'category', 'netAmount', 'grossProfit', 'marginPct']
  );
  const [groupByField, setGroupByField] = useState<string>(activeReportDef?.groupBy?.[0] || 'salesRep');
  const [visualization, setVisualization] = useState<'table' | 'bar' | 'line' | 'combo' | 'donut' | 'pivot'>(
    activeReportDef?.visualization || 'combo'
  );
  const [aggregation, setAggregation] = useState<'sum' | 'avg' | 'count'>('sum');
  const [filters, setFilters] = useState<ReportFilter[]>(activeReportDef?.filters || []);

  // Calculated fields
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([
    { id: 'calc-1', name: 'Gross Margin %', formula: '(Gross Profit / Net Sales) * 100', format: 'percent' },
  ]);

  const toggleField = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      if (selectedFields.length > 1) {
        setSelectedFields(selectedFields.filter((f) => f !== fieldId));
      }
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        id: `f-${Date.now()}`,
        field: 'category',
        operator: 'equals',
        value: 'Furniture',
      },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id: string, updates: Partial<ReportFilter>) => {
    setFilters(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  // Grouped Result Calculation
  const groupedData = React.useMemo(() => {
    let result = [...invoices];

    // Apply filters
    filters.forEach((flt) => {
      if (flt.operator === 'equals') {
        result = result.filter((r) => String((r as any)[flt.field]) === flt.value);
      } else if (flt.operator === 'greater_than') {
        result = result.filter((r) => Number((r as any)[flt.field]) > Number(flt.value));
      } else if (flt.operator === 'less_than') {
        result = result.filter((r) => Number((r as any)[flt.field]) < Number(flt.value));
      } else if (flt.operator === 'contains') {
        result = result.filter((r) =>
          String((r as any)[flt.field]).toLowerCase().includes(String(flt.value).toLowerCase())
        );
      }
    });

    // Grouping
    if (groupByField && groupByField !== 'none') {
      const map: Record<string, any> = {};
      result.forEach((item) => {
        const key = String((item as any)[groupByField] || 'Other');
        if (!map[key]) {
          map[key] = {
            groupKey: key,
            quantity: 0,
            netAmount: 0,
            cogs: 0,
            grossProfit: 0,
            count: 0,
          };
        }
        map[key].quantity += item.quantity || 0;
        map[key].netAmount += item.netAmount || 0;
        map[key].cogs += item.cogs || 0;
        map[key].grossProfit += item.grossProfit || 0;
        map[key].count += 1;
      });

      return Object.values(map).map((g: any) => {
        const margin = g.netAmount > 0 ? Math.round((g.grossProfit / g.netAmount) * 1000) / 10 : 0;
        return {
          ...g,
          marginPct: margin,
        };
      });
    }

    return result;
  }, [invoices, filters, groupByField]);

  const handleSave = () => {
    const newReport: ReportDefinition = {
      id: `rep-${Date.now()}`,
      title: reportTitle,
      dataset,
      selectedFields,
      filters,
      groupBy: [groupByField],
      sortBy: { field: 'netAmount', direction: 'desc' },
      aggregation,
      calculatedFields,
      visualization,
      category: 'Custom',
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      owner: 'Current User',
    };
    onSaveReport(newReport);
    onShowToast(`บันทึกรายงาน "${reportTitle}" เข้าสู่ Saved Reports แล้ว`);
  };

  const handleExport = () => {
    exportToExcel(groupedData, 'CustomReport', `${reportTitle.replace(/\s+/g, '_')}.xlsx`);
    onShowToast('ส่งออกรายงานเป็นไฟล์ Excel เรียบร้อยแล้ว');
  };

  return (
    <div id="view-report-studio" className="space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0 shadow-sm">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="font-bold text-sm sm:text-base text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 focus:outline-none focus:border-blue-500 pb-0.5 max-w-full"
              />
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/40 whitespace-nowrap">
                Self-Service Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              สร้างรายงานอิสระโดยไม่ต้องเขียน SQL (ทดแทน Crystal Reports)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-sm shadow-blue-500/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกรายงาน</span>
          </button>
        </div>
      </div>

      {/* Builder Layout: Left Controls + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 w-full min-w-0">
        {/* Left Col: Configurations (Fields, Grouping, Filters, Visualization) */}
        <div className="space-y-4">
          {/* Step 1: Field Selector */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 w-full min-w-0 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>1. เลือกฟิลด์ที่ต้องการแสดง (Columns)</span>
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 px-2 py-0.5 rounded-full">
                {selectedFields.length} selected
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {AVAILABLE_FIELDS.map((f) => {
                const isSelected = selectedFields.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleField(f.id)}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100 font-bold border border-blue-200 dark:border-blue-800/80 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                  >
                    <span>{f.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Group By & Aggregations */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 w-full min-w-0 shadow-sm">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>2. จัดกลุ่ม &amp; สรุปผล (Group By &amp; Aggregation)</span>
            </span>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Group By Column:</label>
                <select
                  value={groupByField}
                  onChange={(e) => setGroupByField(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="salesRep">Sales Rep (พนักงานขาย)</option>
                  <option value="category">Category (หมวดหมู่สินค้า)</option>
                  <option value="month">Month (รอบรายเดือน)</option>
                  <option value="customerName">Customer (รายชื่อลูกค้า)</option>
                  <option value="none">-- ไม่จัดกลุ่ม (Raw List) --</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Aggregation Function:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['sum', 'avg', 'count'] as const).map((agg) => (
                    <button
                      key={agg}
                      onClick={() => setAggregation(agg)}
                      className={`py-1.5 rounded-xl uppercase font-bold text-[10px] transition cursor-pointer ${
                        aggregation === agg
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {agg}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Visual Filter Builder */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 w-full min-w-0 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>3. ตัวกรองเงื่อนไข (Filter Builder)</span>
              </span>
              <button
                onClick={addFilter}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>เพิ่ม Filter</span>
              </button>
            </div>

            {filters.length === 0 ? (
              <div className="text-[11px] text-slate-400 text-center py-2">
                ยังไม่มีการกำหนด Filter (ประมวลผลข้อมูลทั้งหมด)
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {filters.map((f) => (
                  <div
                    key={f.id}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-xs"
                  >
                    <select
                      value={f.field}
                      onChange={(e) => updateFilter(f.id, { field: e.target.value })}
                      className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                    >
                      <option value="category">Category</option>
                      <option value="salesRep">Sales Rep</option>
                      <option value="status">Status</option>
                      <option value="netAmount">Net Amount</option>
                    </select>

                    <select
                      value={f.operator}
                      onChange={(e) => updateFilter(f.id, { operator: e.target.value as any })}
                      className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                    >
                      <option value="equals">=</option>
                      <option value="greater_than">&gt;</option>
                      <option value="less_than">&lt;</option>
                      <option value="contains">contains</option>
                    </select>

                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => updateFilter(f.id, { value: e.target.value })}
                      className="flex-1 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-blue-500"
                    />

                    <button
                      onClick={() => removeFilter(f.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Visualization Selector & Interactive Preview Canvas */}
        <div className="lg:col-span-2 space-y-4 w-full min-w-0">
          {/* Chart Type Selector Header */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 w-full min-w-0 shadow-sm">
            <span className="text-xs font-bold text-slate-900 dark:text-white">รูปแบบการแสดงผล (Visualization):</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { type: 'combo', label: 'Combo (Bar+Line)', icon: BarChart3 },
                { type: 'bar', label: 'Bar Chart', icon: BarChart3 },
                { type: 'donut', label: 'Donut', icon: PieIcon },
                { type: 'table', label: 'Detailed Table', icon: TableIcon },
                { type: 'pivot', label: 'Pivot Matrix', icon: FileSpreadsheet },
              ].map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.type}
                    onClick={() => setVisualization(v.type as any)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      visualization === v.type
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20'
                        : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Chart Canvas */}
          {visualization !== 'table' && visualization !== 'pivot' && (
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 w-full min-w-0 shadow-sm">
              <div className="flex justify-between items-center text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white">Visual Analytics Preview</h4>
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 px-2 py-0.5 rounded-full">
                  Grouped by: {groupByField}
                </span>
              </div>

              <div className="h-64 w-full">
                {visualization === 'combo' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={groupedData}>
                      <XAxis dataKey="groupKey" stroke="#94a3b8" fontSize={11} />
                      <YAxis
                        yAxisId="left"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#64748b"
                        fontSize={11}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar yAxisId="left" dataKey="netAmount" fill="#3b82f6" radius={[6, 6, 0, 0]} name="ยอดขาย" />
                      <Line yAxisId="right" type="monotone" dataKey="marginPct" stroke="#10b981" strokeWidth={3} name="Margin %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}

                {visualization === 'bar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={groupedData}>
                      <XAxis dataKey="groupKey" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="netAmount" fill="#3b82f6" radius={[6, 6, 0, 0]} name="ยอดขาย" />
                      <Bar dataKey="grossProfit" fill="#10b981" radius={[6, 6, 0, 0]} name="กำไรขั้นต้น" />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {visualization === 'donut' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={groupedData}
                        dataKey="netAmount"
                        nameKey="groupKey"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {groupedData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={['#3b82f6', '#10b981', '#6366f1', '#8b5cf6', '#ec4899'][i % 5]}
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

          {/* Live Data Grid Table */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3 w-full min-w-0 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Live Data Results Table</h4>
                <p className="text-[11px] text-slate-400">ผลการประมวลผลตามฟิลด์และตัวกรองที่เลือกไว้</p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 font-mono font-bold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
                {groupedData.length} Rows
              </span>
            </div>

            <div className="overflow-x-auto max-h-80 custom-scrollbar w-full min-w-0">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[550px]">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold sticky top-0 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    {groupByField !== 'none' ? (
                      <>
                        <th className="py-2.5 px-3">{groupByField.toUpperCase()} Group</th>
                        <th className="py-2.5 px-3 text-right">Count</th>
                        <th className="py-2.5 px-3 text-right">Net Sales</th>
                        <th className="py-2.5 px-3 text-right">COGS</th>
                        <th className="py-2.5 px-3 text-right">Gross Profit</th>
                        <th className="py-2.5 px-3 text-right">Margin %</th>
                      </>
                    ) : (
                      selectedFields.map((fId) => (
                        <th key={fId} className="py-2.5 px-3">
                          {AVAILABLE_FIELDS.find((f) => f.id === fId)?.label || fId}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {groupedData.map((row: any, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      {groupByField !== 'none' ? (
                        <>
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{row.groupKey}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-500">{row.count}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-600 dark:text-blue-400 font-mono">
                            +฿{Number(row.netAmount || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono">
                            ฿{Number(row.cogs || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                            ฿{Number(row.grossProfit || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                            {row.marginPct}%
                          </td>
                        </>
                      ) : (
                        selectedFields.map((fId) => (
                          <td key={fId} className="py-2.5 px-3">
                            {fId === 'netAmount' || fId === 'cogs' || fId === 'grossProfit'
                              ? `฿${Number(row[fId] || 0).toLocaleString()}`
                              : fId === 'marginPct'
                              ? `${row[fId]}%`
                              : String(row[fId] || '-')}
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
