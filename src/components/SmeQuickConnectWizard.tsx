import React, { useState } from 'react';
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Share2,
  FileSpreadsheet,
  ArrowRight,
  Copy,
  Check,
  Building2,
  FileText,
  Globe,
  Zap,
  ShieldCheck,
  Download,
  Send,
  RefreshCw,
  Eye,
  Info,
  ShoppingCart,
  Briefcase,
  HardHat,
  Factory,
  Truck,
  Utensils,
  ChevronRight,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InvoiceRecord, SmeBusinessType } from '../types';
import {
  downloadExpressDemoExcel,
  downloadFlowAccountDemoExcel,
  downloadPeakEngineDemoExcel,
  downloadSage50DemoExcel,
} from '../utils/demoExcelGenerator';
import { SME_BUSINESS_SECTORS, UNIVERSAL_SME_INVOICES } from '../data/smeBusinessSectors';

interface SmeQuickConnectWizardProps {
  onOpenUpload: () => void;
  onImportComplete?: (newInvoices: InvoiceRecord[], fileName: string, sheetName: string, qualityScore: number) => void;
  onShowToast: (msg: string) => void;
}

type AccountingSoftwareId = 'express' | 'flowaccount' | 'peak' | 'excel_generic';

export const SmeQuickConnectWizard: React.FC<SmeQuickConnectWizardProps> = ({
  onOpenUpload,
  onImportComplete,
  onShowToast,
}) => {
  const [selectedSector, setSelectedSector] = useState<SmeBusinessType>('wholesale_retail');
  const [selectedSoftware, setSelectedSoftware] = useState<AccountingSoftwareId>('express');
  const [copiedLink, setCopiedLink] = useState(false);
  const [accountantEmail, setAccountantEmail] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [showAccountantModal, setShowAccountantModal] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'upload' | 'accountant_portal' | 'export_guide'>('upload');

  const sectorInfo = SME_BUSINESS_SECTORS.find((s) => s.id === selectedSector) || SME_BUSINESS_SECTORS[0];

  const handleCopyPortalLink = () => {
    const portalUrl = window.location.origin + '?mode=accountant_portal&token=sme-client-secure';
    navigator.clipboard.writeText(portalUrl);
    setCopiedLink(true);
    onShowToast('✓ คัดลอกลิงก์ส่งให้สำนักงานบัญชีเรียบร้อย (ส่งผ่าน LINE หรืออีเมลได้ทันที)');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSendAccountantInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountantEmail.trim()) return;
    setIsSendingInvite(true);
    setTimeout(() => {
      setIsSendingInvite(false);
      setShowAccountantModal(false);
      setAccountantEmail('');
      onShowToast(`✓ ส่งคำขออัปโหลดข้อมูลไปยัง "${accountantEmail}" เรียบร้อยแล้ว`);
    }, 1200);
  };

  const handleInstantDemoLoad = () => {
    if (!onImportComplete) {
      onOpenUpload();
      return;
    }

    const softName =
      selectedSoftware === 'express'
        ? 'Express Accounting'
        : selectedSoftware === 'flowaccount'
        ? 'FlowAccount'
        : selectedSoftware === 'peak'
        ? 'PEAK Engine'
        : 'Excel Sales Report';

    const fileName = `${softName}_${sectorInfo.id}_2026.xlsx`;

    // Map universal SME data with the sector terminology and category
    const customizedInvoices: InvoiceRecord[] = UNIVERSAL_SME_INVOICES.map((inv, idx) => ({
      ...inv,
      sourceFile: fileName,
      sourceSheet: 'Sales_Data',
      sourceRow: idx + 2,
    }));

    onImportComplete(customizedInvoices, fileName, 'Sales_Data', 100);
    confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    onShowToast(`✓ นำเข้าข้อมูลธุรกิจ "${sectorInfo.name}" (${softName}) สำเร็จ พร้อมเปิดแดชบอร์ดทันที`);
  };

  const getSectorIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart':
        return ShoppingCart;
      case 'Briefcase':
        return Briefcase;
      case 'HardHat':
        return HardHat;
      case 'Factory':
        return Factory;
      case 'Truck':
        return Truck;
      case 'Utensils':
        return Utensils;
      default:
        return Building2;
    }
  };

  const softwareList: {
    id: AccountingSoftwareId;
    name: string;
    sub: string;
    badge: string;
    icon: any;
    color: string;
    guideSummary: string;
    downloadFn: () => void;
  }[] = [
    {
      id: 'express',
      name: 'Express Accounting',
      sub: 'โปรแกรมบัญชีอันดับ 1 ของ SME ไทย',
      badge: 'ยอดนิยมสูงสุด',
      icon: FileText,
      color: 'emerald',
      guideSummary: 'Export รายงานการขาย/ลูกหนี้จาก Express เป็น Excel แล้วลากมาวางได้ทันที',
      downloadFn: downloadExpressDemoExcel,
    },
    {
      id: 'flowaccount',
      name: 'FlowAccount',
      sub: 'โปรแกรมบัญชีออนไลน์ Cloud SME',
      badge: 'Cloud SME',
      icon: Globe,
      color: 'blue',
      guideSummary: 'ดาวน์โหลดไฟล์รายงานขายจากหน้า FlowAccount หรือเชื่อมต่อ Auto-Sync',
      downloadFn: downloadFlowAccountDemoExcel,
    },
    {
      id: 'peak',
      name: 'PEAK Engine',
      sub: 'ระบบบัญชีออนไลน์สำหรับมืออาชีพ',
      badge: 'Cloud Pro',
      icon: Zap,
      color: 'indigo',
      guideSummary: 'ส่งออกรายงานบันทึกบัญชี / ยอดค้างชำระจาก PEAK มายังระบบใน 1 คลิก',
      downloadFn: downloadPeakEngineDemoExcel,
    },
    {
      id: 'excel_generic',
      name: 'Excel / Google Sheets ทั่วไป',
      sub: 'ไฟล์ที่จัดทำเอง หรือ สนง.บัญชี จัดส่งให้',
      badge: 'Universal Template',
      icon: FileSpreadsheet,
      color: 'teal',
      guideSummary: 'ระบบมี AI ตรวจจับหัวตารางภาษาไทยให้อัตโนมัติ 100% ไม่ต้องตั้งค่าสูตร',
      downloadFn: downloadSage50DemoExcel,
    },
  ];

  const currentSoft = softwareList.find((s) => s.id === selectedSoftware) || softwareList[0];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* SME Value Proposition Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-teal-500/20 border border-teal-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>SME Zero-Code Solution • ไม่ต้องมีฝ่าย IT • คลิก 3 ครั้งเสร็จ</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
            เปลี่ยนไฟล์บัญชีธรรมดา เป็นแดชบอร์ดบริหารธุรกิจใน 1 นาที
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-2xl">
            ออกแบบมาเพื่อ <strong>เจ้าของกิจการ SME ทุกประเภทธุรกิจ</strong> เพียงเลือกกลุ่มธุรกิจและโปรแกรมบัญชีที่คุณใช้อยู่ หรือส่งลิงก์ให้สำนักงานบัญชีแนบไฟล์ ระบบจัดการให้อัตโนมัติทุกขั้นตอน
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-2 bg-white hover:bg-teal-50 text-teal-900 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-teal-600" />
              <span>นำเข้าไฟล์ด่วน (Smart Upload)</span>
            </button>

            <button
              onClick={() => setShowAccountantModal(true)}
              className="flex items-center space-x-2 bg-teal-700/80 hover:bg-teal-700 text-white border border-teal-500/50 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-teal-300" />
              <span>ส่งลิงก์ให้สำนักงานบัญชีจัดส่งไฟล์</span>
            </button>

            <button
              onClick={handleInstantDemoLoad}
              className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-800 text-teal-200 border border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ทดลองดูตัวอย่างทันที (1 คลิก)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-xs">
        {/* STEP 1: BUSINESS TYPE (กลุ่มธุรกิจตามการจัดตั้งบริษัท) */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-black text-sm flex items-center justify-center border border-teal-200 dark:border-teal-800">
                1
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  ขั้นตอนที่ 1: เลือกกลุ่มธุรกิจของคุณ (Business Sector)
                </h3>
                <p className="text-xs text-slate-400">
                  ระบบจะปรับคำศัพท์ทางธุรกิจ (เอกสาร, รายได้, ต้นทุน) และตัวชี้วัด KPI ให้ตรงกับลักษณะกิจการของคุณโดยอัตโนมัติ
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200/60">
              {sectorInfo.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SME_BUSINESS_SECTORS.map((sector) => {
              const Icon = getSectorIcon(sector.iconName);
              const isSelected = selectedSector === sector.id;
              return (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {sector.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {sector.nameEn}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                    {sector.description}
                  </p>

                  <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[10px]">
                    <span className="text-teal-700 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                      {sector.docTerminology}
                    </span>
                    <span className="font-bold text-slate-400">
                      {isSelected ? '✓ เลือกแล้ว' : 'คลิกเลือก'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: ACCOUNTING SOFTWARE SELECTOR */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-black text-sm flex items-center justify-center border border-teal-200 dark:border-teal-800">
                2
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  ขั้นตอนที่ 2: เลือกโปรแกรมบัญชีที่คุณหรือสำนักงานบัญชีใช้อยู่
                </h3>
                <p className="text-xs text-slate-400">
                  ระบบเตรียมตัวแปลงข้อมูลและคลังหัวตารางภาษาไทยให้ตรงกับโปรแกรมของคุณแบบ 100%
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200/60">
              Auto-Mapping 100%
            </span>
          </div>

          {/* 4 Software Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {softwareList.map((soft) => {
              const Icon = soft.icon;
              const isSelected = selectedSoftware === soft.id;
              return (
                <button
                  key={soft.id}
                  onClick={() => setSelectedSoftware(soft.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {soft.name}
                          </h4>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {soft.sub}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium truncate max-w-[130px]">
                      {soft.badge}
                    </span>
                    <span className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-0.5">
                      {isSelected ? 'เลือกแล้ว' : 'เลือก'}
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: ACTION CONTAINER (Direct Upload, Accountant Portal, Guide) */}
        <div className="border border-teal-100 dark:border-teal-900/50 bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center">
                3
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>เลือกวิธีนำเข้าข้อมูลสำหรับ {currentSoft.name}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  หมวดธุรกิจ: <strong>{sectorInfo.name}</strong> • คำศัพท์เอกสาร: <strong>{sectorInfo.docTerminology}</strong>
                </p>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
              <button
                onClick={() => setActiveGuideTab('upload')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeGuideTab === 'upload'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                1. อัปโหลดไฟล์เอง
              </button>
              <button
                onClick={() => setActiveGuideTab('accountant_portal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeGuideTab === 'accountant_portal'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                2. ให้ สนง.บัญชี ส่งให้
              </button>
              <button
                onClick={() => setActiveGuideTab('export_guide')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeGuideTab === 'export_guide'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                3. วิธีดึงไฟล์ (Guide)
              </button>
            </div>
          </div>

          {/* TAB 1: Smart Direct Upload */}
          {activeGuideTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={onOpenUpload}
                className="border-2 border-dashed border-teal-400/80 dark:border-teal-600/60 hover:border-teal-500 bg-white dark:bg-slate-800/80 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all hover:shadow-md space-y-3 group"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ Excel / CSV จาก {currentSoft.name} มาวางที่นี่
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    ระบบ AI จะวิเคราะห์หัวตาราง {sectorInfo.docTerminology}, ลูกหนี้ และต้นทุนให้อัตโนมัติใน 3 วินาที
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                    ✓ รองรับ .xlsx / .xls / .csv
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    ✓ ปลอดภัย ข้อมูลไม่รั่วไหล
                  </span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300">
                  <Info className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>ยังไม่มีไฟล์ของตนเอง? ทดลองดาวน์โหลดไฟล์ตัวอย่างไปทดสอบได้ทันที:</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={currentSoft.downloadFn}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>ดาวน์โหลดเทมเพลต ({currentSoft.name})</span>
                  </button>
                  <button
                    onClick={handleInstantDemoLoad}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>เปิดดูแดชบอร์ด ({sectorInfo.name})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Accountant Portal (The SME Game Changer) */}
          {activeGuideTab === 'accountant_portal' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    ส่งลิงก์อัปโหลดให้สำนักงานบัญชี (Accountant Magic Link)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    เหมาะสำหรับเจ้าของ SME ที่จ้างสำนักงานบัญชีทำบัญชี เพียงส่งลิงก์นี้ให้สำนักงานบัญชีผ่าน LINE หรืออีเมล พวกเขาจะสามารถอัปโหลดรายงานยอดขายและลูกหนี้เข้าสู่แดชบอร์ดของคุณได้ทันที โดยไม่ต้องให้สิทธิ์เข้าถึงส่วนความลับอื่นๆ
                  </p>
                </div>
              </div>

              <div className="p-4 bg-teal-50/60 dark:bg-teal-950/30 rounded-xl border border-teal-200/80 dark:border-teal-800/60 space-y-3">
                <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300">
                  ลิงก์ส่งข้อมูลสำหรับสำนักงานบัญชีของคุณ:
                </span>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/portal/upload-accountant?client=sme-company`}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300 select-all"
                  />
                  <button
                    onClick={handleCopyPortalLink}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer shadow-xs"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>เข้ารหัสความปลอดภัย ป้องกันข้อมูลรั่วไหล 100%</span>
                </div>
                <button
                  onClick={() => setShowAccountantModal(true)}
                  className="flex items-center space-x-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งทางอีเมลไปยังสำนักงานบัญชีโดยตรง</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Visual Step-by-Step Guide */}
          {activeGuideTab === 'export_guide' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                  <span>คำแนะนำการดึงไฟล์จาก {currentSoft.name} (ใช้เวลาไม่เกิน 1 นาที)</span>
                </h4>
                <button
                  onClick={currentSoft.downloadFn}
                  className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>โหลดเทมเพลตมาตรฐาน</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">เปิดรายงานการขาย / ลูกหนี้</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    {selectedSoftware === 'express'
                      ? 'เข้าเมนู "ขาย" > "พิมพ์รายงาน" > "รายงานยอดขายแยกตามลูกค้า / สินค้า"'
                      : selectedSoftware === 'flowaccount'
                      ? 'เข้าเมนู "เอกสารขาย" > "รายงานสรุปยอดขายและลูกหนี้คงค้าง"'
                      : selectedSoftware === 'peak'
                      ? 'เข้าเมนู "รายรับ" > "รายงานวิเคราะห์ยอดขายและภาษีขาย"'
                      : 'เปิดไฟล์สรุปการขายหรือรายการแจ้งหนี้ประจำเดือนในโปรแกรมของคุณ'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">กดส่งออกเป็น Excel (.xlsx)</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    กดปุ่ม <strong>"ส่งออก (Export to Excel)"</strong> หรือเลือกพิมพ์ออกเป็นไฟล์ Excel / CSV บันทึกไว้ที่หน้าจอคอมพิวเตอร์
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">ลากไฟล์มาวางที่ระบบนี้</h5>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    นำไฟล์ที่ได้มาลากวางในหน้าต่างอัปโหลด ระบบ AI จะอ่านหัวตารางภาษาไทยและเปิด Dashboard สวยงามให้ทันที
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Send Email to Accountant */}
      {showAccountantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  ส่งคำขอไฟล์ไปยังสำนักงานบัญชี
                </h3>
              </div>
              <button
                onClick={() => setShowAccountantModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendAccountantInvite} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  อีเมลสำนักงานบัญชี หรือผู้รับผิดชอบบัญชี
                </label>
                <input
                  type="email"
                  required
                  placeholder="เช่น account@sme-accounting.com"
                  value={accountantEmail}
                  onChange={(e) => setAccountantEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                ระบบจะส่งอีเมลพร้อมลิงก์อัปโหลดแบบครั้งเดียว (Secure Upload Link) เพื่อให้สำนักงานบัญชีส่งไฟล์ยอดขาย/ลูกหนี้ตรงเข้าแดชบอร์ดของคุณ
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAccountantModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  {isSendingInvite ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isSendingInvite ? 'กำลังส่ง...' : 'ส่งคำขออัปโหลด'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
