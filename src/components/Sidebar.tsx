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
  Bell,
  Sparkles,
  Settings,
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

  // Close dropdowns when clicking outside
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

  const roles: { role: UserRole; name: string; title: string; desc: string; icon: string }[] = [
    {
      role: 'executive',
      name: 'Pi Loh (Executive)',
      title: 'Executive / Admin',
      desc: 'เข้าถึงข้อมูลทั้งหมด & สิทธิ์ผู้ดูแลระบบ',
      icon: '👑',
    },
    {
      role: 'finance',
      name: 'Kanya (Finance Mgr)',
      title: 'Finance Manager',
      desc: 'เข้าถึง AR, Cash Flow & Financial Reports',
      icon: '📊',
    },
    {
      role: 'sales_rep',
      name: 'Alex Wong (Sales Rep)',
      title: 'Sales Rep (ฝ่ายขาย)',
      desc: 'เห็นเฉพาะลูกค้าตนเอง และซ่อนต้นทุน COGS/Margin',
      icon: '💼',
    },
    {
      role: 'warehouse',
      name: 'Wichai (Warehouse Lead)',
      title: 'Warehouse Lead',
      desc: 'เน้น Inventory Valuation, Dead Stock & ROP',
      icon: '📦',
    },
  ];

  const isLightSidebar = themeConfig?.sidebarStyle === 'light-clean';

  const getActiveItemClass = (isActive: boolean) => {
    if (isActive) {
      if (isLightSidebar) {
        return 'bg-teal-50 text-teal-700 font-bold border-l-4 border-teal-600 shadow-2xs dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-400';
      }
      return 'bg-teal-500/15 text-teal-300 font-bold border-l-4 border-teal-400 shadow-2xs';
    }
    if (isLightSidebar) {
      return 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white';
    }
    return 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        id="sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-40 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
          isLightSidebar
            ? 'bg-white border-r border-slate-200/90 text-slate-800 dark:bg-[#0f172a] dark:border-slate-800 dark:text-slate-200'
            : 'bg-[#09101f] border-r border-slate-800/90 text-slate-200'
        } ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:border-none'}`}
      >
        {/* Sidebar Header: Brand & Collapse */}
        <div className={`p-4 flex items-center justify-between shrink-0 border-b ${isLightSidebar ? 'border-slate-200/80 bg-[#f8fafc] dark:bg-[#091122]' : 'border-slate-800/80 bg-[#070c18]'}`}>
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs ring-2 ring-teal-500/20">
              {themeConfig?.logoText || 'S50'}
            </div>
            <div className="min-w-0">
              <div className={`font-bold text-xs tracking-tight truncate ${isLightSidebar ? 'text-slate-900 dark:text-white' : 'text-white'}`}>
                {themeConfig?.brandName || 'FinFlow Analytics'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {themeConfig?.brandSubtitle || 'Enterprise BI Platform'}
              </div>
            </div>
          </div>

          {/* Desktop Collapse / Mobile Close */}
          <div className="flex items-center space-x-1 shrink-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                title="ย่อแถบเมนู (Collapse Sidebar)"
                className={`hidden lg:flex p-1.5 rounded-lg transition cursor-pointer ${
                  isLightSidebar
                    ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                title="ปิดเมนู"
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Company Workspace Selector */}
        {companies && companies.length > 0 && currentCompany && (
          <div className={`p-2.5 shrink-0 relative border-b ${isLightSidebar ? 'border-slate-200/80 bg-slate-50/50 dark:bg-slate-900/30' : 'border-slate-800/80 bg-[#0c1427]'}`} ref={companyRef}>
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition cursor-pointer ${
                isLightSidebar
                  ? 'bg-white border-slate-200 hover:border-teal-400 text-slate-800 dark:bg-slate-800/90 dark:border-slate-700 dark:text-slate-100'
                  : 'bg-[#111c33] border-slate-700/80 hover:border-teal-500 text-slate-200'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate flex items-center gap-1">
                  <span>บริษัทปัจจุบัน:</span>
                </div>
                <div className="font-bold text-xs truncate flex items-center gap-1.5">
                  <span className="truncate">{currentCompany.name}</span>
                </div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showCompanyDropdown && onSelectCompany && (
              <div className={`absolute top-full left-2.5 right-2.5 mt-1 rounded-2xl p-2 z-50 space-y-1 shadow-2xl border ${
                isLightSidebar ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#141e35] border-slate-700 text-slate-200'
              }`}>
                <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 text-slate-400">
                  เลือกชุดข้อมูล / Workspace
                </div>
                {companies.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      onSelectCompany(comp);
                      setShowCompanyDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${
                      currentCompany.id === comp.id
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold truncate">{comp.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{comp.sageEdition}</div>
                    </div>
                    {currentCompany.id === comp.id && (
                      <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
          <nav className="space-y-4">
            {/* GROUP 1: FINANCIAL & OPERATIONAL SUITE (DAILY CORE) */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                FINANCIAL &amp; OPERATIONS
              </div>

              {/* 1. Dashboard Overview */}
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
                  <span>A/R Aging &amp; Collections</span>
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

              {/* 6. Smart Risk Alerts & Executive Digest */}
              {features.executiveDigest && (
                <button
                  onClick={() => {
                    onSelectTab('executive-alerts');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs transition cursor-pointer ${getActiveItemClass(
                    activeTab === 'executive-alerts'
                  )}`}
                >
                  <Bell className="w-4 h-4 shrink-0" />
                  <span>Smart Alerts &amp; Digest</span>
                </button>
              )}

              {/* 7. Standard Financial Reports */}
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

            {/* GROUP 3: SYSTEM ADMINISTRATION & DATA CONTROL CENTER */}
            {(currentUser.role === 'executive' || currentUser.role === 'finance') && (
              <div className="space-y-1 pt-2 border-t border-slate-200/60 dark:border-slate-800/70">
                <div className="flex items-center justify-between px-3 py-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLightSidebar ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span>ADMINISTRATION</span>
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 uppercase tracking-tight">
                    DATA &amp; SETTINGS
                  </span>
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
                  <Shield className="w-4 h-4 shrink-0 text-teal-600 dark:text-teal-400" />
                  <div className="text-left flex-1 min-w-0">
                    <div className="truncate font-semibold">Settings &amp; Data Center</div>
                    <div className="text-[10px] opacity-75 truncate">Data Hub, Connectors, RBAC &amp; ธีม</div>
                  </div>
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
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
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
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
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
                  <Shield className="w-3 h-3 text-teal-600" />
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
                            ? 'bg-teal-50 text-teal-700 font-bold'
                            : 'bg-teal-500/20 text-teal-300 font-bold'
                          : isLightSidebar
                          ? 'hover:bg-slate-100 text-slate-700'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span>{r.icon}</span>
                        <span className="font-semibold">{r.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Bar Profile Trigger */}
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className={`w-full flex items-center justify-between p-2 rounded-xl transition cursor-pointer ${
              isLightSidebar
                ? 'hover:bg-slate-100 text-slate-800'
                : 'hover:bg-slate-800/80 text-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser.avatarInitials || 'SC'}
              </div>
              <div className="min-w-0 text-left">
                <div className="font-bold text-xs truncate leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{currentUser.department}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
