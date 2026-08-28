import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Clock,
  Boxes,
  FileSpreadsheet,
  Layers,
  Database,
  RefreshCw,
  Sliders,
  Shield,
  Moon,
  Sun,
  Globe,
  PanelLeftClose,
  X,
  ChevronDown,
  ChevronsUpDown,
  CheckCircle2,
  Check,
  SlidersHorizontal,
  BarChart3,
  TrendingUp,
  Target,
} from 'lucide-react';
import { UserRole, FeatureToggles, UserProfile, CompanyWorkspace, ThemeConfig } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  features: FeatureToggles;
  isOpen: boolean;
  onCloseMobile?: () => void;
  onToggleSidebar?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  lang?: 'th' | 'en';
  onToggleLang?: () => void;
  currentCompany?: CompanyWorkspace;
  companies?: CompanyWorkspace[];
  onSelectCompany?: (company: CompanyWorkspace) => void;
  themeConfig?: ThemeConfig;
  onOpenCopilot?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  features,
  isOpen,
  onCloseMobile,
  onToggleSidebar,
  theme = 'light',
  onToggleTheme,
  currentUser,
  onRoleChange,
  lang = 'th',
  onToggleLang,
  currentCompany,
  companies = [],
  onSelectCompany,
  themeConfig,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: { role: UserRole; title: string; desc: string }[] = [
    { role: 'executive', title: 'สมชาย มั่นคง (Admin)', desc: 'Chief Executive • สิทธิ์สูงสุด' },
    { role: 'finance', title: 'Finance Manager', desc: 'เข้าถึง AR, Aging, Profit & Loss และรายงานการเงิน' },
    { role: 'sales_rep', title: 'Sales Rep (Alex Wong)', desc: 'เห็นเฉพาะลูกค้าตนเอง และซ่อนต้นทุน COGS / Margin' },
    { role: 'warehouse', title: 'Warehouse Lead', desc: 'เน้นดู Inventory Valuation, Reorder Point, Stock Movement' },
  ];

  const isLightSidebar = themeConfig?.sidebarStyle === 'light-clean';

  // Dynamic Theme Sidebar Background
  const getSidebarBg = () => {
    switch (themeConfig?.sidebarStyle) {
      case 'light-clean':
        return 'bg-[#f8fafc] border-r border-slate-200/80 text-slate-700';
      case 'midnight-navy':
        return 'bg-[#091428] border-r border-[#15233c] text-slate-200';
      case 'forest-dark':
        return 'bg-[#06241a] border-r border-[#0d3c2d] text-slate-200';
      case 'pure-dark':
        return 'bg-[#000000] border-r border-neutral-900 text-neutral-200';
      case 'classic-dark':
        return 'bg-[#0f172a] border-r border-slate-800 text-slate-200';
      case 'deep-slate':
      default:
        return 'bg-[#0b1324] border-r border-slate-800/80 text-slate-300';
    }
  };

  const getActiveItemClass = (isActive: boolean) => {
    if (isLightSidebar) {
      if (!isActive) {
        return 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-medium';
      }
      switch (themeConfig?.accentClass) {
        case 'teal':
          return 'bg-white text-teal-600 font-bold shadow-2xs border border-slate-200/70';
        case 'blue':
          return 'bg-white text-blue-600 font-bold shadow-2xs border border-slate-200/70';
        case 'emerald':
          return 'bg-white text-emerald-600 font-bold shadow-2xs border border-slate-200/70';
        case 'indigo':
          return 'bg-white text-indigo-600 font-bold shadow-2xs border border-slate-200/70';
        case 'slate':
        default:
          return 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/70';
      }
    }

    if (!isActive) {
      return 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-normal';
    }
    switch (themeConfig?.accentClass) {
      case 'teal':
        return 'bg-teal-500/15 text-teal-300 font-semibold';
      case 'blue':
        return 'bg-blue-500/15 text-blue-300 font-semibold';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-300 font-semibold';
      case 'indigo':
        return 'bg-indigo-500/15 text-indigo-300 font-semibold';
      case 'slate':
      default:
        return 'bg-slate-700/40 text-white font-semibold';
    }
  };

  const getLogoBadgeBg = () => {
    switch (themeConfig?.accentClass) {
      case 'teal':
        return 'bg-teal-600 text-white shadow-teal-500/30';
      case 'blue':
        return 'bg-blue-600 text-white shadow-blue-500/30';
      case 'emerald':
        return 'bg-emerald-600 text-white shadow-emerald-500/30';
      case 'indigo':
        return 'bg-indigo-600 text-white shadow-indigo-500/30';
      case 'slate':
      default:
        return 'bg-slate-800 text-white border border-slate-700';
    }
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-30 lg:hidden transition-opacity"
        />
      )}

      <aside
        id="mainSidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 ${getSidebarBg()} flex flex-col justify-between transition-transform duration-300 z-40 shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-64'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Header & Brand Logo (FinFlow BI Style) */}
          <div className={`h-16 px-4 flex items-center justify-between shrink-0 ${isLightSidebar ? 'border-b border-slate-200/80' : 'border-b border-slate-800/60'}`}>
            <div className="flex items-center space-x-3 overflow-hidden min-w-0">
              <div className={`w-9 h-9 rounded-xl ${getLogoBadgeBg()} flex items-center justify-center font-black text-sm shrink-0 shadow-sm`}>
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className={`font-bold text-sm tracking-tight leading-tight truncate ${isLightSidebar ? 'text-slate-900' : 'text-white'}`}>
                    {themeConfig?.brandName || 'FinFlow'}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 uppercase tracking-tight">
                    {themeConfig?.logoText || 'BI'}
                  </span>
                </div>
                <div className={`text-[10px] font-medium truncate mt-0.5 ${isLightSidebar ? 'text-slate-500' : 'text-slate-400'}`}>
                  {themeConfig?.brandSubtitle || 'Financial Treasury Suite'}
                </div>
              </div>
            </div>

            {/* Actions: Collapse button for desktop and Close button for mobile */}
            <div className="flex items-center space-x-1 shrink-0">
              {onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  title="ยุบแถบเมนู"
                  className={`hidden lg:flex p-1.5 rounded-lg transition cursor-pointer ${
                    isLightSidebar ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              )}
              {onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  title="ปิดเมนู"
                  className={`lg:hidden p-1.5 rounded-lg cursor-pointer ${
                    isLightSidebar ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Workspace Switcher / Company Name */}
          <div className="px-3 py-3 shrink-0 relative" ref={companyRef}>
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition text-xs cursor-pointer shadow-2xs ${
                isLightSidebar
                  ? 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800'
                  : 'bg-[#131d33] hover:bg-[#182542] border border-slate-800/80 text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <div className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 border ${
                  currentCompany?.isDemo
                    ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900'
                    : currentCompany?.isImported
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                    : 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900'
                }`}>
                  {currentCompany?.isDemo ? 'D' : currentCompany?.isImported ? 'L' : 'บ'}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`font-semibold truncate text-[11px] ${isLightSidebar ? 'text-slate-900' : 'text-slate-200'}`}>
                      {themeConfig?.companyName || currentCompany?.name || 'บจก. สยาม คูลลิ่งฯ'}
                    </span>
                  </div>
                  <div className={`text-[9.5px] truncate flex items-center gap-1.5 ${isLightSidebar ? 'text-slate-500' : 'text-slate-400'}`}>
                    {currentCompany?.isDemo ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                        <span>[DEMO] ข้อมูลตัวอย่างทดสอบ</span>
                      </span>
                    ) : currentCompany?.isImported ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                        <span>[LIVE] ข้อมูลนำเข้าจริง</span>
                      </span>
                    ) : (
                      <span>Sage 50 Direct Sync</span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Company Dropdown */}
            {showCompanyDropdown && companies.length > 0 && (
              <div className={`absolute left-3 right-3 top-full mt-1.5 rounded-xl shadow-2xl border p-2 z-50 space-y-1 ${
                isLightSidebar ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#141e35] border-slate-700/80 text-slate-200'
              }`}>
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>สลับบริษัท / Workspace</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                    DEMO SUITES
                  </span>
                </div>
                {companies.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      if (onSelectCompany) onSelectCompany(comp);
                      setShowCompanyDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                      currentCompany?.id === comp.id
                        ? isLightSidebar
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'bg-blue-500/20 text-blue-300 font-bold'
                        : isLightSidebar
                        ? 'hover:bg-slate-100 text-slate-700'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-medium text-[11px] truncate flex items-center gap-1.5">
                        <span className="truncate">{comp.name}</span>
                        {comp.isDemo && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold shrink-0">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-[9.5px] text-slate-400">{comp.sageEdition}</div>
                    </div>
                    {currentCompany?.id === comp.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Items (Organized into Original 4 Categories) */}
          <nav className="flex-1 px-3 space-y-3.5 overflow-y-auto custom-scrollbar pt-1">
            {/* GROUP 1: FINANCIAL REPORTS (CORE) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLightSidebar ? 'text-slate-500' : 'text-slate-400'}`}>
                  FINANCIAL REPORTS
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                  CORE
                </span>
              </div>

              {/* 1. Sales & Margin Hub */}
              <button
                onClick={() => {
                  onSelectTab('dashboard');
                  if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                  activeTab === 'dashboard'
                )}`}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>Sales &amp; Margin Hub</span>
              </button>

              {/* 2. AR Aging */}
              {features.arAging && (
                <button
                  onClick={() => {
                    onSelectTab('ar-aging');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                    activeTab === 'ar-aging'
                  )}`}
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>A/R Aging (วิเคราะห์ลูกหนี้)</span>
                </button>
              )}

              {/* 3. Cash Flow & What-If Forecast */}
              {features.cashFlowForecast && (
                <button
                  onClick={() => {
                    onSelectTab('cash-flow');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                    activeTab === 'cash-flow'
                  )}`}
                >
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span>Cash Flow &amp; What-If</span>
                </button>
              )}

              {/* 4. Sales Quota & Commission Tracking */}
              {features.salesCommission && (
                <button
                  onClick={() => {
                    onSelectTab('sales-commission');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                    activeTab === 'sales-commission'
                  )}`}
                >
                  <Target className="w-4 h-4 shrink-0" />
                  <span>Sales Target &amp; Commission</span>
                </button>
              )}

              {/* 5. Inventory Valuation */}
              {features.inventoryValuation && (
                <button
                  onClick={() => {
                    onSelectTab('inventory');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                    activeTab === 'inventory'
                  )}`}
                >
                  <Boxes className="w-4 h-4 shrink-0" />
                  <span>Inventory Valuation</span>
                </button>
              )}

              {/* 5. Standard Reports */}
              <button
                onClick={() => {
                  onSelectTab('standard-reports');
                  if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                  activeTab === 'standard-reports'
                )}`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>รายงานมาตรฐาน (Reports)</span>
              </button>
            </div>

            {/* GROUP 2: SELF-SERVICE BI (STUDIO) */}
            {features.reportStudio && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLightSidebar ? 'text-slate-500' : 'text-slate-400'}`}>
                    SELF-SERVICE BI
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase tracking-tight">
                    STUDIO
                  </span>
                </div>

                <button
                  onClick={() => {
                    onSelectTab('report-studio');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                    activeTab === 'report-studio'
                  )}`}
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Ad-Hoc Report Studio</span>
                </button>
              </div>
            )}

            {/* GROUP 3: DATA OPERATIONS (ETL/CDM) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLightSidebar ? 'text-slate-500' : 'text-slate-400'}`}>
                  DATA OPERATIONS
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase tracking-tight">
                  ETL/CDM
                </span>
              </div>

              {/* Import Sage Excel */}
              <button
                onClick={() => {
                  onSelectTab('data-hub');
                  if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                  activeTab === 'data-hub'
                )}`}
              >
                <Database className="w-4 h-4 shrink-0" />
                <span>Import Sage Excel</span>
              </button>

              {/* ODBC Direct Sync */}
              {features.odbcSync && (
                <button
                  onClick={() => {
                    onSelectTab('odbc-sync');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                    activeTab === 'odbc-sync'
                  )}`}
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <span>ODBC Direct Sync</span>
                </button>
              )}

              {/* Custom Field Mapping */}
              <button
                onClick={() => {
                  onSelectTab('field-mapping');
                  if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                  activeTab === 'field-mapping'
                )}`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>Custom Field Mapping</span>
              </button>
            </div>

            {/* GROUP 4: ADMINISTRATION */}
            {currentUser.role === 'executive' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLightSidebar ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>ADMINISTRATION</span>
                  </span>
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <button
                  onClick={() => {
                    onSelectTab('settings');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                    activeTab === 'settings'
                  )}`}
                >
                  <SlidersHorizontal className="w-4 h-4 shrink-0" />
                  <span>ตั้งค่าโมดูล &amp; สิทธิ์ (Settings)</span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer: User Profile Menu */}
        <div className={`p-3 shrink-0 relative ${isLightSidebar ? 'border-t border-slate-200/80 bg-[#f8fafc]' : 'border-t border-slate-800/80 bg-[#09101f]'}`} ref={profileRef}>
          {/* Profile Popup Dropdown (Opens Upwards) */}
          {showProfileDropdown && (
            <div className={`absolute bottom-full left-3 right-3 mb-2 rounded-2xl p-3.5 z-50 space-y-3 shadow-2xl border ${
              isLightSidebar ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#141e35] border-slate-700 text-slate-200'
            }`}>
              {/* User summary */}
              <div className={`flex items-center space-x-3 pb-2.5 border-b ${isLightSidebar ? 'border-slate-200' : 'border-slate-700/80'}`}>
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
                  {currentUser.avatarInitials || 'SC'}
                </div>
                <div className="min-w-0">
                  <div className={`font-bold text-xs truncate ${isLightSidebar ? 'text-slate-900' : 'text-white'}`}>
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {currentUser.department}
                  </div>
                </div>
              </div>

              {/* Preferences Section: Language & Dark Mode */}
              <div className="space-y-2">
                {/* Language Toggle */}
                {onToggleLang && (
                  <div className={`flex items-center justify-between p-2 rounded-xl text-xs ${isLightSidebar ? 'bg-slate-100 text-slate-700' : 'bg-slate-800/50 text-slate-300'}`}>
                    <div className="flex items-center space-x-2 font-medium">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>{lang === 'th' ? 'ภาษา' : 'Language'}</span>
                    </div>
                    <button
                      onClick={onToggleLang}
                      className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                        isLightSidebar ? 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50' : 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
                      }`}
                    >
                      {lang === 'th' ? 'TH (ไทย)' : 'EN (English)'}
                    </button>
                  </div>
                )}

                {/* Theme Toggle */}
                {onToggleTheme && (
                  <div className={`flex items-center justify-between p-2 rounded-xl text-xs ${isLightSidebar ? 'bg-slate-100 text-slate-700' : 'bg-slate-800/50 text-slate-300'}`}>
                    <div className="flex items-center space-x-2 font-medium">
                      {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                      <span>{lang === 'th' ? 'โหมดสี' : 'Theme'}</span>
                    </div>
                    <button
                      onClick={onToggleTheme}
                      className={`px-2 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 ${
                        isLightSidebar ? 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-50' : 'bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600'
                      }`}
                    >
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </button>
                  </div>
                )}
              </div>

              {/* RBAC Role Simulator */}
              <div className={`space-y-1.5 pt-1 border-t ${isLightSidebar ? 'border-slate-200' : 'border-slate-700/80'}`}>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{lang === 'th' ? 'สิทธิ์ผู้ใช้งาน' : 'User Role'}</span>
                  <Shield className="w-3 h-3 text-blue-600" />
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        onRoleChange(r.role);
                        setShowProfileDropdown(false);
                      }}
                      className={`w-full text-left p-1.5 rounded-lg text-xs transition cursor-pointer ${
                        currentUser.role === r.role
                          ? isLightSidebar
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'bg-blue-500/20 text-blue-300 font-bold'
                          : isLightSidebar
                          ? 'hover:bg-slate-100 text-slate-700'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate text-[11px]">{r.title}</span>
                        {currentUser.role === r.role && (
                          <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* User Profile Card Button */}
          <button
            id="btnProfileMenu"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`w-full flex items-center justify-between p-2 rounded-xl transition cursor-pointer text-left shadow-2xs ${
              isLightSidebar
                ? 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800'
                : 'bg-[#131d33] hover:bg-[#182542] border border-slate-800/80 text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                {currentUser.avatarInitials || 'SC'}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-semibold truncate ${isLightSidebar ? 'text-slate-900' : 'text-slate-200'}`}>
                  {currentUser.name}
                </div>
                <div className={`text-[10px] truncate ${isLightSidebar ? 'text-slate-500' : 'text-slate-400'}`}>
                  {currentUser.department}
                </div>
              </div>
            </div>
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
          </button>
        </div>
      </aside>
    </>
  );
};
