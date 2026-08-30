import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Settings2,
  Database,
  History,
  ShieldCheck,
  RefreshCw,
  Plus,
  Download,
  Building2,
  FileText,
  Network,
  Cpu,
  Server,
  ArrowRight,
  Workflow,
  Zap,
  Globe,
  Radio,
  Clock,
  ChevronRight,
  Table,
  Share2,
  Info,
  Check,
  Copy,
} from 'lucide-react';
import { MappingProfile, InvoiceRecord } from '../types';
import {
  downloadSage50DemoExcel,
  downloadExpressDemoExcel,
  downloadFlowAccountDemoExcel,
  downloadPeakEngineDemoExcel,
  downloadMyAccountDemoExcel,
  downloadBlankStarterTemplate,
  downloadInventoryDemoExcel,
} from '../utils/demoExcelGenerator';
import { SmeQuickConnectWizard } from '../components/SmeQuickConnectWizard';
import { AccountantUploadPortalModal } from '../components/AccountantUploadPortalModal';

interface DataHubViewProps {
  invoices: InvoiceRecord[];
  mappingProfiles: MappingProfile[];
  onOpenUpload: () => void;
  onImportComplete?: (newInvoices: InvoiceRecord[], fileName: string, sheetName: string, qualityScore: number) => void;
  onShowToast?: (msg: string) => void;
  companyName?: string;
}

export const DataHubView: React.FC<DataHubViewProps> = ({
  invoices,
  mappingProfiles,
  onOpenUpload,
  onImportComplete,
  onShowToast = () => {},
  companyName = 'บริษัท ตัวอย่างการค้า จำกัด',
}) => {
  const [hubMode, setHubMode] = useState<'sme_wizard' | 'templates' | 'roadmap' | 'schema' | 'history'>('sme_wizard');
  const [isAccountantPortalOpen, setIsAccountantPortalOpen] = useState(false);

  return (
    <div id="view-data-hub" className="space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Top Mode Selector: SME Easy Mode vs Detailed Specs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>ศูนย์เชื่อมต่อและนำเข้าข้อมูลบัญชี (Data Hub)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ออกแบบสำหรับ SME ไทย: ไม่ต้องมีความรู้ IT • เชื่อมต่อได้ใน 3 คลิก
            </p>
          </div>
        </div>

        {/* View Mode Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setHubMode('sme_wizard')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              hubMode === 'sme_wizard'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>โหมด SME ใช้งานง่าย (แนะนำ)</span>
          </button>

          <button
            onClick={() => setHubMode('templates')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              hubMode === 'templates'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>คลังเทมเพลต Excel</span>
          </button>

          <button
            onClick={() => setHubMode('roadmap')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              hubMode === 'roadmap'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>ตัวเลือกการเชื่อมต่อ</span>
          </button>

          <button
            onClick={() => setHubMode('schema')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              hubMode === 'schema'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>โครงสร้างตารางกลาง</span>
          </button>

          <button
            onClick={() => setHubMode('history')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              hubMode === 'history'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ประวัตินำเข้า</span>
          </button>
        </div>
      </div>

      {/* MODE 1: SME Easy 3-Click Wizard (Default Experience) */}
      {hubMode === 'sme_wizard' && (
        <SmeQuickConnectWizard
          onOpenUpload={onOpenUpload}
          onImportComplete={onImportComplete}
          onShowToast={onShowToast}
        />
      )}

      {/* MODE 2: Templates Hub */}
      {hubMode === 'templates' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>คลังแม่แบบไฟล์ Excel จากโปรแกรมบัญชีชั้นนำในไทย</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ดาวน์โหลดไฟล์ตัวอย่าง .xlsx สำหรับทดสอบ หรือส่งต่อให้สำนักงานบัญชีจัดเตรียมข้อมูล
                </p>
              </div>
              <button
                onClick={() => setIsAccountantPortalOpen(true)}
                className="flex items-center space-x-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200/60 transition cursor-pointer self-start sm:self-auto"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>จำลองหน้าส่งไฟล์ของ สนง.บัญชี</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* 1. Express Accounting */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Express Accounting</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                      ยอดนิยม 1
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    หัวตารางภาษาไทย: เลขที่เอกสาร, วันที่, วันครบกำหนด, ยอดรวมเงิน, ต้นทุนขาย, ยอดคงค้าง
                  </p>
                </div>
                <button
                  onClick={downloadExpressDemoExcel}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Express .xlsx</span>
                </button>
              </div>

              {/* 2. FlowAccount Cloud */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>FlowAccount</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
                      Cloud SME
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    ฟิลด์: เลขที่ใบแจ้งหนี้/ใบเสร็จ, มูลค่าก่อนภาษี, ภาษีมูลค่าเพิ่ม 7%, ต้นทุนขาย COGS, ยอดค้างรับ
                  </p>
                </div>
                <button
                  onClick={downloadFlowAccountDemoExcel}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด FlowAccount .xlsx</span>
                </button>
              </div>

              {/* 3. PEAK Engine */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>PEAK Engine</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                      Cloud Pro
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    ฟิลด์: Document Code, Contact Tax ID, Total Excl VAT, Gross Profit, Balance Due
                  </p>
                </div>
                <button
                  onClick={downloadPeakEngineDemoExcel}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด PEAK .xlsx</span>
                </button>
              </div>

              {/* 4. myAccount / Winspeed */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>myAccount / Winspeed</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                      Enterprise
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    ฟิลด์: รหัสลูกหนี้, ชื่อลูกค้า, จำนวนเงินสุทธิ, ต้นทุนมาตรฐาน, กำไรขั้นต้น, วันนัดชำระ
                  </p>
                </div>
                <button
                  onClick={downloadMyAccountDemoExcel}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Winspeed .xlsx</span>
                </button>
              </div>

              {/* 5. Sage 50 US / UK */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Sage 50 US / UK</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                      Global ERP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    ฟิลด์: Invoice No, Customer ID, AR Balance Due, COGS Amount, Item Description
                  </p>
                </div>
                <button
                  onClick={downloadSage50DemoExcel}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Sage 50 .xlsx</span>
                </button>
              </div>

              {/* 7. Inventory & Stock Valuation */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>รายงานสินค้าคงเหลือ (Stock)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold">
                      คลังสินค้า
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    รายงานสินค้าคงคลัง, มูลค่าทุนเฉลี่ย, จุดสั่งซื้อซ้ำ Reorder Point, สินค้าไม่เคลื่อนไหว
                  </p>
                </div>
                <button
                  onClick={downloadInventoryDemoExcel}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Stock .xlsx</span>
                </button>
              </div>

              {/* 8. Blank Universal Starter Template */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 hover:border-teal-300 dark:hover:border-teal-700 transition flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Universal Starter Template</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                      แม่แบบกลาง
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    หัวตาราง 2 ภาษามาตรฐาน สำหรับธุรกิจที่ต้องการออกแบบไฟล์ส่งเข้า BI ด้วยตนเอง
                  </p>
                </div>
                <button
                  onClick={downloadBlankStarterTemplate}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 text-xs font-bold transition cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Starter .xlsx</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: Roadmap */}
      {hubMode === 'roadmap' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-5 w-full min-w-0 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>3 ช่องทางการเชื่อมต่อข้อมูลโปรแกรมบัญชี (Integration Options)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                รองรับการทำงานทั้งแบบอัปโหลดไฟล์, เชื่อมต่อ Cloud API และการซิงค์ฐานข้อมูล On-Premise
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1 */}
              <div className="p-5 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/60 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black text-sm">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">1. นำเข้าผ่านไฟล์ (Excel / CSV)</h4>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">อัปโหลดไฟล์และจับคู่อัตโนมัติ</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                    <li>รองรับการ Export ไฟล์ .xlsx / .csv จากทุกโปรแกรมบัญชีในไทย</li>
                    <li><strong>AI Smart Auto-Mapping:</strong> จำแนกหัวคอลัมน์ภาษาไทย 99%+</li>
                    <li>ตรวจสอบความถูกต้อง Data Validation &amp; Health Index ทันที</li>
                    <li>บันทึก Template จับคู่คอลัมน์ไว้ใช้ซ้ำในครั้งต่อไป</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-teal-200 dark:border-teal-800/60 flex items-center justify-between text-xs text-teal-700 dark:text-teal-300 font-bold">
                  <span>พร้อมใช้งานทันที</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                </div>
              </div>

              {/* Option 2 */}
              <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-sm">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">2. เชื่อมต่อผ่าน Cloud Open API</h4>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">FlowAccount &amp; PEAK Engine</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                    <li><strong>FlowAccount Open API:</strong> ดึงใบกำกับภาษี, ใบเสร็จ, ผังบัญชีอัตโนมัติ</li>
                    <li><strong>PEAK Engine API:</strong> Sync รายการบันทึกบัญชี และยอดลูกหนี้</li>
                    <li><strong>Webhook Event Trigger:</strong> เมื่อออกบิลใหม่ ข้อมูลวิ่งเข้า BI ทันที</li>
                    <li>ตั้งเวลา Sync อัตโนมัติ (เช่น ทุกเที่ยงคืน หรือทุก 1 ชั่วโมง)</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-bold">
                  <span>REST API &amp; Webhooks</span>
                  <Radio className="w-4 h-4 text-blue-600" />
                </div>
              </div>

              {/* Option 3 */}
              <div className="p-5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">3. ซิงค์ฐานข้อมูล (DBF / ODBC Agent)</h4>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Express &amp; SQL Server / Sage</span>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                    <li><strong>Express Native File Watcher:</strong> ตรวจจับการเปลี่ยนแปลงไฟล์ `.DBF` (ARTRN, OESLM)</li>
                    <li><strong>ODBC / SQL Bridge:</strong> รองรับ Winspeed, myAccount, Sage 50, SQL Server</li>
                    <li>ติดตั้ง Lightweight Agent ฝั่ง Client เข้ารหัสข้อมูล SHA-256 ก่อนส่งเข้า Cloud</li>
                    <li>ซิงค์เบื้องหลังอัตโนมัติ ไม่ต้อง Export ไฟล์ด้วยมือ</li>
                  </ul>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-bold">
                  <span>Desktop Agent Sync</span>
                  <Cpu className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: Canonical Schema */}
      {hubMode === 'schema' && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-5 w-full min-w-0 shadow-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>สถาปัตยกรรมตารางกลาง 4 ตาราง (Universal Data Normalization Schema)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ไม่ว่าจะดึงข้อมูลจากโปรแกรมบัญชีตัวใด ระบบจะทำการแปลง (Transform &amp; Normalize) เข้าสู่ 4 ตารางมาตรฐานนี้ เพื่อให้ Dashboard และ AI ใช้งานร่วมกันได้อย่างแม่นยำ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400 font-mono">dim_contacts</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">ลูกค้า/คู่ค้า</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
                <li>• contact_id (PK)</li>
                <li>• contact_name</li>
                <li>• tax_id (เลขผู้เสียภาษี)</li>
                <li>• credit_limit (วงเงิน)</li>
                <li>• payment_term_days</li>
                <li>• default_sales_rep</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">dim_products</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">สินค้า/บริการ</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
                <li>• product_id (PK)</li>
                <li>• product_code (SKU)</li>
                <li>• product_name</li>
                <li>• category_group</li>
                <li>• standard_unit</li>
                <li>• standard_cogs</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-mono">fact_transactions_header</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">หัวบิลเอกสาร</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
                <li>• invoice_no (PK)</li>
                <li>• doc_date &amp; due_date</li>
                <li>• contact_id (FK)</li>
                <li>• sales_rep_name</li>
                <li>• total_net_amount</li>
                <li>• paid_amount &amp; ar_balance</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-600 dark:text-purple-400 font-mono">fact_transactions_lines</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">รายการย่อย</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
                <li>• line_id (PK)</li>
                <li>• invoice_no (FK)</li>
                <li>• product_id (FK)</li>
                <li>• quantity &amp; unit_price</li>
                <li>• line_cogs (ต้นทุนขาย)</li>
                <li>• line_gross_profit</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: Ingestion History */}
      {hubMode === 'history' && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">ประวัตินำเข้าข้อมูลและผลการตรวจสอบ (Audit Trail)</h3>
            </div>
            <span className="text-xs text-slate-400">Total Sync Batches</span>
          </div>

          <div className="overflow-x-auto custom-scrollbar w-full min-w-0">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[650px]">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 whitespace-nowrap">File Name</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Source Accounting Engine</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Rows Ingested</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Quality Score</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Imported By</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                    Express_Accounting_Sales_2026.xlsx
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">Express Accounting (TH)</td>
                  <td className="py-3 px-3 text-right font-medium whitespace-nowrap font-mono">{invoices.length || 16} records</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">100%</td>
                  <td className="py-3 px-3 whitespace-nowrap">สมชาย มั่นคง (Admin)</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                      Normalized
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                    Siam_Cooling_Panel_ColdRoom_Demo.xlsx
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">รับเหมา/โครงการห้องเย็น</td>
                  <td className="py-3 px-3 text-right font-medium whitespace-nowrap font-mono">16 records</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono">100%</td>
                  <td className="py-3 px-3 whitespace-nowrap">สนง. บัญชี (คุณศิริพร)</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                      Normalized
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accountant Portal Modal Simulator */}
      <AccountantUploadPortalModal
        isOpen={isAccountantPortalOpen}
        onClose={() => setIsAccountantPortalOpen(false)}
        companyName={companyName}
        onImportComplete={(newInvs, fName, sName, qScore) => {
          if (onImportComplete) {
            onImportComplete(newInvs, fName, sName, qScore);
          }
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
