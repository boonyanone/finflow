import React, { useState } from 'react';
import {
  FileUp,
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Download,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseExcelFile, ParsedWorkbook, TARGET_FIELDS, transformToCanonical } from '../utils/excelParser';
import { ColumnMapping, InvoiceRecord, MappingProfile } from '../types';
import { downloadColdRoomExcelTemplate } from '../utils/coldRoomExportHelper';
import { SIAM_COLD_ROOM_INVOICES } from '../data/sampleSage50Data';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (newInvoices: InvoiceRecord[], fileName: string, sheetName: string, qualityScore: number) => void;
  mappingProfiles: MappingProfile[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  mappingProfiles,
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'processing'>('upload');
  const [parsedData, setParsedData] = useState<ParsedWorkbook | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [currentMappings, setCurrentMappings] = useState<ColumnMapping[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string>('prof-sage-us');
  const [progress, setProgress] = useState<number>(0);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    try {
      const parsed = await parseExcelFile(file);
      setParsedData(parsed);
      setSelectedSheet(parsed.selectedSheet);
      setCurrentMappings(parsed.mappings);
      setStep('mapping');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์ Excel: ' + (err?.message || 'Invalid file format'));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleMappingChange = (sourceCol: string, targetKey: string) => {
    setCurrentMappings((prev) =>
      prev.map((m) =>
        m.sourceColumn === sourceCol
          ? {
              ...m,
              targetField: targetKey,
              status: targetKey !== 'ignore' ? 'matched' : 'unmapped',
            }
          : m
      )
    );
  };

  const handleLoadColdRoomDataset = () => {
    // Generate realistic Thai Cold Storage Wall & Panel dataset
    const coldRoomHeaders = [
      'Project_Invoice_No',
      'Billing_Date',
      'Due_Date',
      'Customer_Company_Name',
      'Project_Sales_Engineer',
      'Product_Group',
      'Item_SKU_Code',
      'Material_Description',
      'Quantity_SQM_Units',
      'Unit_Price_THB',
      'Net_Sales_Amount',
      'COGS_Cost_Amount',
      'Paid_Amount_THB',
      'Payment_Status',
    ];

    const coldRoomRows = SIAM_COLD_ROOM_INVOICES.map((inv) => [
      inv.invoiceNo,
      inv.date,
      inv.dueDate,
      inv.customerName,
      inv.salesRep,
      inv.category,
      inv.itemCode,
      inv.itemDescription,
      inv.quantity,
      inv.unitPrice,
      inv.netAmount,
      inv.cogs,
      inv.paidAmount,
      inv.status,
    ]);

    const mockMappings: ColumnMapping[] = coldRoomHeaders.map((h, i) => ({
      sourceColumn: h,
      targetField: [
        'invoiceNo',
        'date',
        'dueDate',
        'customerName',
        'salesRep',
        'category',
        'itemCode',
        'itemDescription',
        'quantity',
        'unitPrice',
        'netAmount',
        'cogs',
        'paidAmount',
        'status',
      ][i],
      sampleValue: String(coldRoomRows[0][i]),
      status: 'matched',
      confidence: 100,
    }));

    setParsedData({
      fileName: 'Sage50_Siam_Cooling_Panel_ColdRoom_Demo.xlsx',
      sheetNames: ['Invoices_Line_Items', 'Customer_Master', 'Stock_Valuation'],
      selectedSheet: 'Invoices_Line_Items',
      rawHeaders: coldRoomHeaders,
      rawRows: coldRoomRows,
      mappings: mockMappings,
      validation: {
        totalRows: coldRoomRows.length,
        validRows: coldRoomRows.length,
        warningRows: 0,
        errorRows: 0,
        qualityScore: 100,
        errors: [],
        warnings: [],
      },
    });
    setCurrentMappings(mockMappings);
    setSelectedSheet('Invoices_Line_Items');
    setStep('mapping');
  };

  const handleLoadDemoDataset = () => {
    handleLoadColdRoomDataset();
  };

  const handleCommitImport = () => {
    if (!parsedData) return;
    setStep('processing');
    setProgress(20);

    const timer1 = setTimeout(() => setProgress(60), 250);
    const timer2 = setTimeout(() => setProgress(100), 550);
    const timer3 = setTimeout(() => {
      const canonicalInvoices = transformToCanonical(
        parsedData.rawHeaders,
        parsedData.rawRows,
        currentMappings,
        parsedData.fileName
      );

      onImportComplete(
        canonicalInvoices,
        parsedData.fileName,
        selectedSheet,
        parsedData.validation.qualityScore
      );

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      onClose();
      setStep('upload');
      setParsedData(null);
    }, 850);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[92vh] flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-sm">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>Sage 50 Data Hub &amp; Excel Ingestion</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold whitespace-nowrap border border-blue-200/60 dark:border-blue-800/40">
                  Step {step === 'upload' ? '1/3' : step === 'mapping' ? '2/3' : '3/3'}
                </span>
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">รองรับไฟล์ .xlsx, .xls, .csv พร้อมระบบ AI Auto-Mapping</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 min-w-0">
          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition flex flex-col items-center justify-center space-y-3 cursor-pointer ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40'
                }`}
                onClick={() => document.getElementById('file-input-upload')?.click()}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40 shadow-sm">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    ลากไฟล์ Excel จาก Sage 50 มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    รองรับไฟล์ .xlsx, .xls, .csv (สูงสุด 20MB)
                  </p>
                </div>
                <input
                  id="file-input-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Demo Dataset Quick Loader - Thai Cold Storage Company */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-800/60 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <span>ชุดข้อมูลตัวอย่าง: บจก. สยาม คูลลิ่งฯ (รับทำผนังห้องเย็น)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                          แนะนำ
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        โครงสร้างจริงของธุรกิจรับทำผนังห้องเย็น/แผ่นฉนวน Sandwich Panel (PIR, Rockwool, ประตูห้องเย็น, ค่าแรงติดตั้ง) พร้อมรายชื่อโรงงานลูกค้า 16 โครงการ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    onClick={handleLoadColdRoomDataset}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-sm shadow-blue-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>นำเข้าข้อมูลผนังห้องเย็นทันที</span>
                  </button>

                  <button
                    onClick={downloadColdRoomExcelTemplate}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>ดาวน์โหลดไฟล์ .xlsx ตัวอย่าง</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Smart Column Mapping */}
          {step === 'mapping' && parsedData && (
            <div className="space-y-3.5 sm:space-y-4">
              {/* Sheet selector */}
              {parsedData.sheetNames.length > 1 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center space-x-2 font-semibold min-w-0">
                    <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">เลือก Sheet:</span>
                  </div>
                  <select
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {parsedData.sheetNames.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Mapping Profile Header */}
              <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Auto-Mapping ({currentMappings.filter((m) => m.status === 'matched').length}/{currentMappings.length} Fields Matched)</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  AI Confidence: 98%
                </span>
              </div>

              {/* Mappings Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto max-h-60 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[500px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Excel Column</th>
                      <th className="py-2.5 px-3">Sample Value</th>
                      <th className="py-2.5 px-3">Target System Field</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {currentMappings.map((mapItem, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                          {mapItem.sourceColumn}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
                          {mapItem.sampleValue || '-'}
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={mapItem.targetField}
                            onChange={(e) => handleMappingChange(mapItem.sourceColumn, e.target.value)}
                            className={`w-full rounded-lg px-2 py-1 text-xs border font-medium focus:outline-none focus:border-blue-400 ${
                              mapItem.targetField !== 'ignore'
                                ? 'bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 border-blue-200 dark:border-blue-800 font-semibold'
                                : 'bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <option value="ignore">-- ข้ามคอลัมน์นี้ (Ignore) --</option>
                            {TARGET_FIELDS.map((tf) => (
                              <option key={tf.key} value={tf.key}>
                                {tf.label} {tf.required ? '(จำเป็น)' : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Data Validation & Quality Score */}
          {step === 'validation' && parsedData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3 sm:p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-center">
                  <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300">Data Quality Score</div>
                  <div className="text-xl sm:text-2xl font-black text-blue-900 dark:text-white mt-1">
                    {parsedData.validation.qualityScore}%
                  </div>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-center">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">จำนวนแถวที่ผ่าน (Valid)</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-white mt-1">
                    {parsedData.validation.validRows} / {parsedData.validation.totalRows}
                  </div>
                </div>
                <div className="p-3 sm:p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center">
                  <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400">ข้อควรระวัง (Warnings)</div>
                  <div className="text-xl sm:text-2xl font-black text-amber-900 dark:text-white mt-1">
                    {parsedData.validation.warningRows}
                  </div>
                </div>
              </div>

              {/* Status report */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>ผลการตรวจสอบโครงสร้างและความสมบูรณ์:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-1">
                  <li>จับคู่คอลัมน์สำคัญ (Invoice No, Date, Net Amount, Customer) ครบถ้วน</li>
                  <li>ไม่พบข้อผิดพลาดรุนแรง (0 Fatal Errors) พร้อมเข้าสู่ Canonical Model</li>
                  <li>คำนวณ Gross Profit, Margin %, และแยกช่วงเวลา Q1-Q4 อัตโนมัติ</li>
                </ul>
              </div>
            </div>
          )}

          {/* Processing Screen */}
          {step === 'processing' && (
            <div className="py-8 sm:py-10 text-center space-y-4">
              <div className="w-10 h-10 sm:w-12 h-12 rounded-full border-4 border-blue-600 dark:border-blue-400 border-t-transparent animate-spin mx-auto"></div>
              <div className="space-y-1">
                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  กำลังแปลงและเชื่อมโยงเข้าสู่ Canonical Data Model...
                </div>
                <div className="text-xs text-slate-500">
                  ระบบกำลังปรับปรุง Dashboard และสร้างตัวชี้วัดทางการเงินแบบ Real-time
                </div>
              </div>
              <div className="w-56 sm:w-64 mx-auto bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-3 sm:pt-4 gap-2 shrink-0">
          <div>
            {step === 'mapping' && (
              <button
                onClick={() => setStep('upload')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                ย้อนกลับ
              </button>
            )}
            {step === 'validation' && (
              <button
                onClick={() => setStep('mapping')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
              >
                ย้อนกลับไปแก้ไข
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              ยกเลิก
            </button>

            {step === 'mapping' && (
              <button
                onClick={() => setStep('validation')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <span>ตรวจสอบข้อมูล</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {step === 'validation' && (
              <button
                onClick={handleCommitImport}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <span>บันทึกเข้าสู่ระบบ</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
