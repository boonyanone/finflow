import React, { useState } from 'react';
import {
  Shield,
  ToggleLeft,
  ToggleRight,
  Users,
  Building2,
  Sparkles,
  Layers,
  CheckCircle2,
  Palette,
  Check,
  RotateCcw,
  Database,
  RefreshCw,
  GitMerge,
  SlidersHorizontal,
  FolderSync,
  FileSpreadsheet,
  Briefcase,
  HardHat,
  Factory,
  Truck,
  Utensils,
  ShoppingCart,
  Save,
  HelpCircle,
  Lock,
  ArrowRight,
  Search,
  Landmark,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import {
  FeatureToggles,
  UserProfile,
  ThemeConfig,
  ThemePresetId,
  InvoiceRecord,
  MappingProfile,
  SmeBusinessType
} from '../types';
import { THEME_PRESETS, DEFAULT_THEME } from '../utils/themePresets';
import { SME_BUSINESS_SECTORS } from '../data/smeBusinessSectors';
import {
  DbdCompanyRecord,
  DBD_REGISTERED_COMPANIES,
  searchDbdCompanies,
  getDbdCompanyByTaxId,
  formatThaiTaxId
} from '../services/dbdLookupService';
import { DbdCompanyLookupModal } from '../components/DbdCompanyLookupModal';
import { DataHubView } from './DataHubView';

export type AdminTab = 'business_profile' | 'data_hub' | 'rbac_roles' | 'modules_preferences';

interface SettingsAdminViewProps {
  features: FeatureToggles;
  onToggleFeature: (key: keyof FeatureToggles) => void;
  currentUser: UserProfile;
  onSelectRole: (role: UserProfile['role']) => void;
  onShowToast: (msg: string) => void;
  themeConfig: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
  // Data props for embedded Data Hub
  invoices?: InvoiceRecord[];
  mappingProfiles?: MappingProfile[];
  onOpenUpload?: () => void;
  onImportComplete?: (newInvoices: InvoiceRecord[], fileName: string, sheetName: string, qualityScore: number) => void;
  companyName?: string;
  initialAdminTab?: AdminTab;
}

export const SettingsAdminView: React.FC<SettingsAdminViewProps> = ({
  features,
  onToggleFeature,
  currentUser,
  onSelectRole,
  onShowToast,
  themeConfig,
  onUpdateTheme,
  invoices = [],
  mappingProfiles = [],
  onOpenUpload = () => {},
  onImportComplete,
  companyName,
  initialAdminTab = 'business_profile',
}) => {
  const [adminTab, setAdminTab] = useState<AdminTab>(initialAdminTab);
  const [selectedSector, setSelectedSector] = useState<SmeBusinessType>('wholesale_retail');
  const [isDbdModalOpen, setIsDbdModalOpen] = useState(false);
  const [dbdSearchQuery, setDbdSearchQuery] = useState('');
  const [dbdSearchResults, setDbdSearchResults] = useState<DbdCompanyRecord[]>([]);
  const [isSearchingDbd, setIsSearchingDbd] = useState(false);
  const [currentDbdRecord, setCurrentDbdRecord] = useState<DbdCompanyRecord | null>(
    DBD_REGISTERED_COMPANIES[0]
  );
  const [isDbdVerified, setIsDbdVerified] = useState(true);

  const [companyProfile, setCompanyProfile] = useState({
    companyName: companyName || themeConfig.companyName || 'บริษัท สยามโปรเกรส เทรดดิ้ง แอนด์ ซัพพลาย จำกัด',
    taxId: '0105558012345',
    branch: 'สำนักงานใหญ่ (00000)',
    brandName: themeConfig.brandName || 'Siam Progress Trading',
    currency: 'THB (฿)',
    accountingSoftware: 'Express Accounting / Excel',
  });

  const currentSector = SME_BUSINESS_SECTORS.find((s) => s.id === selectedSector) || SME_BUSINESS_SECTORS[0];

  const handleApplyDbdCompany = (company: DbdCompanyRecord) => {
    setCompanyProfile((prev) => ({
      ...prev,
      companyName: company.companyNameTh,
      taxId: company.taxId,
      branch: company.branch,
      brandName: company.brandName,
    }));
    setSelectedSector(company.smeSectorId);
    setCurrentDbdRecord(company);
    setIsDbdVerified(true);
    setDbdSearchResults([]);
    setDbdSearchQuery('');

    // Update global app theme brand & name
    onUpdateTheme({
      ...themeConfig,
      brandName: company.brandName,
      companyName: company.companyNameTh,
    });

    onShowToast(`✓ ดึงข้อมูลสำเร็จ: "${company.companyNameTh}" และตั้งค่ากลุ่มธุรกิจ (${company.tsicCode}) เรียบร้อยแล้ว`);
  };

  const handleSearchDbdInline = (val: string) => {
    setDbdSearchQuery(val);
    if (!val.trim()) {
      setDbdSearchResults([]);
      return;
    }
    const results = searchDbdCompanies(val);
    setDbdSearchResults(results.slice(0, 5));
  };

  const handleSelectPreset = (presetId: ThemePresetId) => {
    const preset = THEME_PRESETS[presetId];
    const updated: ThemeConfig = {
      ...preset,
      brandName: companyProfile.brandName || preset.brandName,
      companyName: companyProfile.companyName || preset.companyName,
    };
    onUpdateTheme(updated);
    onShowToast(`✓ ปรับใช้ธีม "${preset.name}" เรียบร้อยแล้ว`);
  };

  const handleUpdateSidebarStyle = (style: ThemeConfig['sidebarStyle']) => {
    onUpdateTheme({ ...themeConfig, sidebarStyle: style });
    onShowToast(`✓ ปรับสไตล์ Sidebar เป็น ${style === 'light-clean' ? 'สีขาวสว่าง โปร่งตา' : 'สีเข้มพรีเมียม'}`);
  };

  const handleUpdateDensity = (density: ThemeConfig['density']) => {
    onUpdateTheme({ ...themeConfig, density });
    onShowToast(`✓ ปรับระยะช่องไฟ (Density) เรียบร้อย`);
  };

  const handleSaveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ThemeConfig = {
      ...themeConfig,
      brandName: companyProfile.brandName.trim() || 'FinFlow SME BI',
      companyName: companyProfile.companyName.trim() || 'บริษัท ตัวอย่างการค้า จำกัด',
    };
    onUpdateTheme(updated);
    onShowToast(`✓ บันทึกข้อมูลบริษัทและตั้งค่ากลุ่มธุรกิจ "${currentSector.name}" เรียบร้อยแล้ว`);
  };

  const handleResetTheme = () => {
    onUpdateTheme(DEFAULT_THEME);
    setCompanyProfile((prev) => ({
      ...prev,
      brandName: DEFAULT_THEME.brandName,
      companyName: DEFAULT_THEME.companyName,
    }));
    onShowToast('↺ รีเซ็ตธีมและแบรนด์กลับสู่ค่ามาตรฐานเดิม');
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

  return (
    <div id="view-settings-admin" className="space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Top Banner & Streamlined Tab Navigation */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 w-full min-w-0 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
                <span>การตั้งค่าระบบ SME (SME Business Settings)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                ศูนย์กลางจัดการสำหรับเจ้าของธุรกิจ: กลุ่มธุรกิจ, นำเข้าไฟล์บัญชี, สิทธิ์ทีมงาน และโมดูลเสริม
              </p>
            </div>
          </div>

          {adminTab === 'modules_preferences' && (
            <button
              onClick={handleResetTheme}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer self-start sm:self-auto shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตธีมมาตรฐาน</span>
            </button>
          )}
        </div>

        {/* 4 Streamlined, Easy-to-Understand Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-3">
          {[
            {
              id: 'business_profile' as const,
              label: 'ข้อมูล & กลุ่มธุรกิจ',
              sub: 'DBD Sector & Profile',
              icon: Building2,
            },
            {
              id: 'data_hub' as const,
              label: 'นำเข้าข้อมูลบัญชี',
              sub: 'Data Hub & Excel',
              icon: Database,
            },
            {
              id: 'rbac_roles' as const,
              label: 'สิทธิ์ผู้ใช้งาน & สนง.บัญชี',
              sub: 'Team Access & Roles',
              icon: Users,
            },
            {
              id: 'modules_preferences' as const,
              label: 'โมดูลเสริม & ธีม',
              sub: 'Modules & Branding',
              icon: SlidersHorizontal,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`flex flex-col items-center justify-center text-center p-3 rounded-xl text-xs transition cursor-pointer border ${
                  isActive
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 shrink-0 ${isActive ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                <div className="font-bold text-xs truncate leading-tight">{tab.label}</div>
                <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-teal-100' : 'text-slate-400'}`}>
                  {tab.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BUSINESS PROFILE & INDUSTRY SECTOR (WITH DBD AUTO-LOOKUP)           */}
      {/* ========================================================================= */}
      {adminTab === 'business_profile' && (
        <div className="space-y-5">
          {/* 1. DBD Smart Auto-Lookup & Financial Benchmark Hub */}
          <div className="bg-gradient-to-br from-teal-500/10 via-white to-blue-500/10 dark:from-teal-950/40 dark:via-slate-900 dark:to-blue-950/30 border border-teal-200/90 dark:border-teal-800/60 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 dark:border-teal-900/40 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      ดึงข้อมูลนิติบุคคลและงบการเงินอัตโนมัติจาก DBD (DBD Open Data)
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/80 text-teal-800 dark:text-teal-200 font-bold">
                      กรมพัฒนาธุรกิจการค้า
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    พิมพ์เลข Tax ID 13 หลัก หรือชื่อบริษัท เพื่อกรอกข้อมูลนิติบุคคลและจัดกลุ่มธุรกิจ SME อัตโนมัติในคลิกเดียว
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDbdModalOpen(true)}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>ค้นหา DBD เต็มรูปแบบ</span>
              </button>
            </div>

            {/* Quick Inline Search & Live Suggestions */}
            <div className="space-y-2 relative">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                ค้นหาด่วนด้วยเลขประจำตัวผู้เสียภาษี 13 หลัก หรือชื่อบริษัท:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={dbdSearchQuery}
                  onChange={(e) => handleSearchDbdInline(e.target.value)}
                  placeholder="พิมพ์เลข 13 หลัก (เช่น 0105558012345) หรือคำค้น (เช่น สยาม, ไทยสมาร์ท, ธนกิจ, รุ่งเรือง, โกลบอล)..."
                  className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
                />
                {dbdSearchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      const results = searchDbdCompanies(dbdSearchQuery);
                      if (results.length > 0) {
                        handleApplyDbdCompany(results[0]);
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer shadow-2xs"
                  >
                    ดึงทันที
                  </button>
                )}
              </div>

              {/* Live Dropdown Results */}
              {dbdSearchResults.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-xl shadow-xl overflow-hidden p-1.5 space-y-1 animate-fadeIn">
                  <div className="text-[10px] text-slate-400 px-2 py-1 font-bold">
                    ผลการค้นหา DBD ที่ตรงกัน ({dbdSearchResults.length} รายการ):
                  </div>
                  {dbdSearchResults.map((comp) => (
                    <button
                      key={comp.taxId}
                      type="button"
                      onClick={() => handleApplyDbdCompany(comp)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/60 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 truncate">
                          {comp.companyNameTh}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-teal-700 dark:text-teal-300 font-medium">
                            {formatThaiTaxId(comp.taxId)}
                          </span>
                          <span>•</span>
                          <span className="truncate">{comp.tsicCode} - {comp.tsicName}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 shrink-0 flex items-center gap-1 bg-teal-50 dark:bg-teal-900/40 px-2.5 py-1 rounded-md">
                        <Sparkles className="w-3 h-3" />
                        <span>เลือกใช้</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick 1-Click Sector Presets Bar */}
            <div className="pt-1">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                <span>หรือคลิกเลือกตัวอย่างนิติบุคคล DBD ตาม 6 กลุ่มธุรกิจ SME:</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 text-xs">
                {DBD_REGISTERED_COMPANIES.slice(0, 6).map((c) => {
                  const isCurrent = currentDbdRecord?.taxId === c.taxId;
                  return (
                    <button
                      key={c.taxId}
                      type="button"
                      onClick={() => handleApplyDbdCompany(c)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer whitespace-nowrap border flex items-center gap-1.5 shrink-0 ${
                        isCurrent
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:text-teal-600'
                      }`}
                    >
                      <span>{c.brandName}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded ${
                        isCurrent ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {c.tsicCode}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Currently Active DBD Registered Dossier & Financial Benchmark Box */}
            {currentDbdRecord && (
              <div className="pt-3 border-t border-teal-100 dark:border-teal-900/40 space-y-3">
                <div className="bg-white dark:bg-slate-900 border border-teal-200/80 dark:border-teal-800/60 rounded-xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {currentDbdRecord.companyNameTh}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{currentDbdRecord.status}</span>
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          TAX ID: {formatThaiTaxId(currentDbdRecord.taxId)} • ทุนจดทะเบียน {currentDbdRecord.registeredCapitalText} • {currentDbdRecord.lastUpdated}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg self-start sm:self-auto border border-teal-200/60">
                      TSIC: {currentDbdRecord.tsicCode}
                    </span>
                  </div>

                  {/* Benchmark Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">รายได้รวมงบ DBD ล่าสุด:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ฿{(currentDbdRecord.dbdFinancialBenchmark.totalRevenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">กำไรขั้นต้น (GP Margin):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {currentDbdRecord.dbdFinancialBenchmark.grossMarginPct}%
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">กำไรสุทธิ (Net Margin):</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {currentDbdRecord.dbdFinancialBenchmark.netMarginPct}% (฿{(currentDbdRecord.dbdFinancialBenchmark.netProfit / 1000000).toFixed(2)}M)
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] text-slate-400 block">สภาพคล่อง (Current Ratio):</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {currentDbdRecord.dbdFinancialBenchmark.currentRatio}x (D/E {currentDbdRecord.dbdFinancialBenchmark.debtToEquityRatio}x)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Sector Selection Card */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    ประเภทธุรกิจของคุณ (ตามการจัดตั้งบริษัท DBD)
                  </h3>
                  <p className="text-xs text-slate-400">
                    เลือกลักษณะกิจการเพื่อให้ระบบปรับคำศัพท์และตัวชี้วัดทางการเงิน (KPI) ให้ตรงกับธุรกิจของคุณ
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 self-start sm:self-auto">
                ปัจจุบัน: {currentSector.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SME_BUSINESS_SECTORS.map((sector) => {
                const Icon = getSectorIcon(sector.iconName);
                const isSelected = selectedSector === sector.id;
                return (
                  <button
                    key={sector.id}
                    type="button"
                    onClick={() => {
                      setSelectedSector(sector.id);
                      onShowToast(`✓ ปรับกลุ่มธุรกิจเป็น "${sector.name}" เรียบร้อยแล้ว`);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-2.5 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-teal-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {sector.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{sector.nameEn}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                      {sector.description}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px]">
                      <span className="text-teal-700 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                        {sector.docTerminology}
                      </span>
                      <span className="font-bold text-slate-400">
                        {isSelected ? '✓ กำลังใช้งาน' : 'คลิกเลือก'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sector Impact Details Box */}
            <div className="bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/40 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-900 dark:text-teal-200">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>การปรับแต่งอัตโนมัติสำหรับ {currentSector.name}:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">คำศัพท์เอกสาร:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentSector.docTerminology}</span>
                </div>
                <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">คำศัพท์ต้นทุน:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{currentSector.cogsTerminology}</span>
                </div>
                <div className="bg-white dark:bg-slate-900/80 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">ตัวชี้วัดสำคัญ (Key KPI):</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 truncate block">
                    {currentSector.keyMetrics.slice(0, 2).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Company Legal Profile Form */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    ข้อมูลนิติบุคคลและหัวรายงาน (Company Profile)
                  </h3>
                  <p className="text-xs text-slate-400">
                    ข้อมูลนี้จะปรากฏบนหัวรายงาน PDF, Excel Export และหน้าแดชบอร์ดบริหาร
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDbdModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-bold transition cursor-pointer border border-teal-200/60"
              >
                <Search className="w-3.5 h-3.5" />
                <span>ดึงจาก DBD</span>
              </button>
            </div>

            <form onSubmit={handleSaveCompanyProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อบริษัท / นิติบุคคล (Company Name)
                </label>
                <input
                  type="text"
                  required
                  value={companyProfile.companyName}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  เลขประจำตัวผู้เสียภาษี 13 หลัก (Tax ID)
                </label>
                <input
                  type="text"
                  value={companyProfile.taxId}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, taxId: e.target.value })}
                  placeholder="เช่น 0105558012345"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  สาขา (Branch)
                </label>
                <input
                  type="text"
                  value={companyProfile.branch}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, branch: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อแบรนด์ / เครื่องหมายการค้า (Brand Name)
                </label>
                <input
                  type="text"
                  value={companyProfile.brandName}
                  onChange={(e) => setCompanyProfile({ ...companyProfile, brandName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลบริษัท</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DBD Lookup Modal */}
      <DbdCompanyLookupModal
        isOpen={isDbdModalOpen}
        onClose={() => setIsDbdModalOpen(false)}
        onSelectCompany={handleApplyDbdCompany}
        currentTaxId={companyProfile.taxId}
        currentCompanyName={companyProfile.companyName}
      />

      {/* ========================================================================= */}
      {/* TAB 2: DATA HUB & ACCOUNTING CONNECTORS                                   */}
      {/* ========================================================================= */}
      {adminTab === 'data_hub' && (
        <DataHubView
          invoices={invoices}
          mappingProfiles={mappingProfiles}
          onOpenUpload={onOpenUpload}
          onImportComplete={onImportComplete}
          onShowToast={onShowToast}
          companyName={companyProfile.companyName || companyName || themeConfig.companyName}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RBAC ROLES & TEAM ACCESS                                          */}
      {/* ========================================================================= */}
      {adminTab === 'rbac_roles' && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 w-full min-w-0 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  สิทธิ์การเข้าถึงข้อมูลตามบทบาท (RBAC Role Simulator)
                </h3>
                <p className="text-xs text-slate-400">
                  ทดสอบและกำหนดการมองเห็นข้อมูลสำหรับผู้บริหาร ฝ่ายการเงิน พนักงานขาย และฝ่ายคลัง
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/40 self-start sm:self-auto">
              Current Role: {currentUser.role}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              {
                role: 'executive' as const,
                title: 'Executive / Owner (เจ้าของกิจการ / ผู้บริหาร)',
                desc: 'สิทธิ์สูงสุด: ดูยอดขายรวม กำไรขั้นต้น ลูกหนี้ AR คลังสินค้า และตั้งค่าระบบทั้งหมด',
                accessList: ['ดูภาพรวมทางการเงินทุกมิติ', 'ปรับแต่งค่าระบบและสร้างโมดูล', 'เข้าถึงรายงานทุกประเภท'],
              },
              {
                role: 'finance' as const,
                title: 'Finance & Accountant (ฝ่ายบัญชีและการเงิน)',
                desc: 'สิทธิ์ด้านการเงิน: ดู AR Aging, Cash Flow Forecast, ออกรายงาน และทวงหนี้',
                accessList: ['ติดตามลูกหนี้และพยากรณ์เงินสด', 'ออกจดหมายทวงหนี้และตั้งดอกเบี้ย', 'ดูงบการเงินและรายงานภาษี'],
              },
              {
                role: 'sales_rep' as const,
                title: 'Sales Rep (พนักงานขาย - ซ่อนต้นทุน)',
                desc: 'ความปลอดภัยข้อมูล: เห็นเฉพาะบิลและลูกค้าของตนเอง และถูกซ่อนต้นทุน COGS / กำไร Margin เพื่อความลับทางการค้า',
                accessList: ['ดูยอดขายและเป้าหมายของตนเอง', 'คำนวณค่าคอมมิชชั่นรายเดือน', 'ซ่อนต้นทุนสินค้า (Data Privacy)'],
              },
              {
                role: 'warehouse' as const,
                title: 'Warehouse & Logistics (ฝ่ายคลังและจัดส่ง)',
                desc: 'คลังสินค้า: เน้นดู Inventory Valuation, Dead Stock, อัตราหมุนเวียน และจุดสั่งซื้อซ้ำ (ROP)',
                accessList: ['เช็คยอดสต็อกคงเหลือและมูลค่าสินทรัพย์', 'วิเคราะห์สินค้าค้างนาน (Dead Stock)', 'แจ้งเตือนจุดสั่งซื้อซ้ำอัตโนมัติ'],
              },
            ].map((r) => {
              const isCurrent = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => {
                    onSelectRole(r.role);
                    onShowToast(`สลับการจำลองสิทธิ์เป็น: ${r.title}`);
                  }}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between space-y-3 ${
                    isCurrent
                      ? 'border-teal-500 dark:border-teal-400 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{r.title}</span>
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>กำลังใช้งาน</span>
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                          คลิกเพื่อสลับ
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      {r.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ขอบเขตการเข้าถึง:</div>
                    {r.accessList.map((item, idx) => (
                      <div key={idx} className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MODULES & THEME PREFERENCES                                        */}
      {/* ========================================================================= */}
      {adminTab === 'modules_preferences' && (
        <div className="space-y-5">
          {/* Feature Toggles Card */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">เปิด/ปิดโมดูลการทำงาน (Feature Modules)</h3>
                <p className="text-xs text-slate-400">ควบคุมการแสดงผลของฟีเจอร์ในระบบตามความต้องการขององค์กร</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  key: 'aiCopilot' as const,
                  label: 'Gemini AI Assistant & Copilot',
                  desc: 'ผู้ช่วยอัจฉริยะวิเคราะห์ธุรกิจและตอบคำถามการเงิน',
                  icon: Sparkles,
                  color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-100 dark:border-teal-900/40',
                },
                {
                  key: 'arAging' as const,
                  label: 'AR Aging & Debt Collection Matrix',
                  desc: 'วิเคราะห์หนี้เกินกำหนดและสร้างหนังสือทวงถามอัตโนมัติ',
                  icon: Shield,
                  color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900/40',
                },
                {
                  key: 'cashFlowForecast' as const,
                  label: 'Cash Flow Projection & What-If Simulator',
                  desc: 'แบบจำลองกระแสเงินสดรับล่วงหน้า 12 สัปดาห์ และจำลองสภาพคล่อง',
                  icon: Shield,
                  color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900/40',
                },
                {
                  key: 'salesCommission' as const,
                  label: 'Sales Commission & Quotas',
                  desc: 'ติดตามเป้าหมายยอดขายรายบุคคล และคำนวณคอมมิชชั่นขั้นบันได',
                  icon: Shield,
                  color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/40',
                },
                {
                  key: 'inventoryValuation' as const,
                  label: 'Inventory Valuation (FIFO & Dead Stock)',
                  desc: 'คำนวณมูลค่าสินค้าคงคลัง สินค้าเคลื่อนไหวช้า และจุดสั่งซื้อซ้ำ',
                  icon: Shield,
                  color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/40',
                },
                {
                  key: 'reportStudio' as const,
                  label: 'Report Studio (Pivot Matrix)',
                  desc: 'สร้างรายงานสรุปวิเคราะห์ Pivot Matrix อิสระ',
                  icon: Shield,
                  color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/40',
                },
              ].map((f) => {
                const Icon = f.icon;
                const isEnabled = features[f.key];
                return (
                  <div
                    key={f.key}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`w-8 h-8 rounded-lg ${f.color} border flex items-center justify-center shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{f.label}</div>
                        <div className="text-[10.5px] text-slate-400 truncate">{f.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onToggleFeature(f.key);
                        onShowToast(`สลับสถานะโมดูล "${f.label}" เป็น ${!isEnabled ? 'เปิดใช้งาน' : 'ปิดการทำงาน'}`);
                      }}
                      className={`p-1 rounded-lg transition cursor-pointer shrink-0 ${
                        isEnabled ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {isEnabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theme Preset Card */}
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  ชุดธีมและสไตล์การแสดงผล (Themes &amp; Branding)
                </h3>
                <p className="text-xs text-slate-400">
                  เลือกชุดสีที่เข้ากับองค์กรของคุณ (มี 4 สไตล์ยอดนิยม)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'light-minimal' as const,
                  title: 'Airy Light Clean',
                  desc: 'Sidebar ขาวสว่าง โปร่งตาสบายที่สุด',
                  accent: '#0d9488',
                  bgPreview: 'bg-white',
                  accentBadge: 'bg-teal-500',
                  badgeText: 'โปร่งสบายตา',
                },
                {
                  id: 'teal-modern' as const,
                  title: 'Airy Petrol Teal',
                  desc: 'Modern FinTech เขียวหัวเป็ด',
                  accent: '#0d9488',
                  bgPreview: 'bg-[#0b1324]',
                  accentBadge: 'bg-teal-500',
                  badgeText: 'FinTech',
                },
                {
                  id: 'emerald-sage' as const,
                  title: 'Sage Classic Emerald',
                  desc: 'Sage 50 ดั้งเดิม สีเขียวมรกต',
                  accent: '#059669',
                  bgPreview: 'bg-[#06241a]',
                  accentBadge: 'bg-emerald-600',
                  badgeText: 'Classic',
                },
                {
                  id: 'navy-corporate' as const,
                  title: 'Corporate Royal Navy',
                  desc: 'Banking & Financial สีน้ำเงินเข้ม',
                  accent: '#2563eb',
                  bgPreview: 'bg-[#091428]',
                  accentBadge: 'bg-blue-600',
                  badgeText: 'Corporate',
                },
              ].map((p) => {
                const isSelected = themeConfig.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-teal-500 dark:border-teal-400 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <div className={`w-5 h-5 rounded-md ${p.bgPreview} border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-2xs`}>
                          <div className={`w-2 h-2 rounded-full ${p.accentBadge}`}></div>
                        </div>
                        <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: p.accent }}></div>
                      </div>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                          {p.badgeText}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{p.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sidebar Style Toggle */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                สไตล์แถบเมนูด้านข้าง (Sidebar Style):
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateSidebarStyle('light-clean')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    themeConfig.sidebarStyle === 'light-clean'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  สีขาวสว่าง โปร่งตา (Light)
                </button>
                <button
                  onClick={() => handleUpdateSidebarStyle('deep-slate')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    themeConfig.sidebarStyle === 'deep-slate' || themeConfig.sidebarStyle === 'classic-dark'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  สีเข้มพรีเมียม (Dark)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
