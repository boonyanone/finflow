import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  Clock,
  Boxes,
  GitMerge,
  UploadCloud,
  Database,
  Sliders,
  BarChart3,
  ChevronsUpDown,
  Sun,
  Moon,
  FileSpreadsheet,
  X,
  Globe,
  Shield,
  CheckCircle2,
  Building2,
  Check,
} from 'lucide-react';
import { CompanyWorkspace, FeatureToggles, UserProfile, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  features: FeatureToggles;
  onOpenUpload: () => void;
  isOpen?: boolean;
  onCloseMobile?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  lang?: 'th' | 'en';
  onToggleLang?: () => void;
  currentCompany?: CompanyWorkspace;
  companies?: CompanyWorkspace[];
  onSelectCompany?: (company: CompanyWorkspace) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  features,
  onOpenUpload,
  isOpen = true,
  onCloseMobile,
  theme = 'light',
  onToggleTheme,
  currentUser,
  onRoleChange,
  lang = 'th',
  onToggleLang,
  currentCompany,
  companies = [],
  onSelectCompany,
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
    { role: 'executive', title: 'Executive / Admin', desc: 'เห็นภาพรวมการเงิน ยอดขาย ต้นทุน กำไร และ AR ครบถ้วน' },
    { role: 'finance', title: 'Finance Manager', desc: 'เข้าถึง AR, Aging, Profit & Loss และรายงานการเงิน' },
    { role: 'sales_rep', title: 'Sales Rep (Alex Wong)', desc: 'เห็นเฉพาะลูกค้าตนเอง และซ่อนต้นทุน COGS / Margin' },
    { role: 'warehouse', title: 'Warehouse Lead', desc: 'เน้นดู Inventory Valuation, Reorder Point, Stock Movement' },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-30 lg:hidden transition-opacity"
        />
      )}

      <aside
        id="mainSidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200/80 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 z-40 shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-64'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Header & Brand Logo */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-blue-500/20">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div className="truncate">
                <div className="font-black text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  <span>FinFlow</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
                    BI
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  Financial Treasury Suite
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Workspace Switcher */}
          <div className="p-3 shrink-0 relative" ref={companyRef}>
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-left px-3 py-2 rounded-xl flex items-center justify-between transition text-xs cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            >
              <div className="flex items-center space-x-2 truncate">
                <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {currentCompany?.name ? currentCompany.name.charAt(0) : 'S'}
                </div>
                <div className="truncate">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                    {currentCompany?.name || 'บจก. สยาม คูลลิ่ง แอนด์ อินซูเลชั่น พาเนล'}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                    <span>Sage 50 Connected</span>
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {/* Company Dropdown */}
            {showCompanyDropdown && companies.length > 0 && (
              <div className="absolute left-3 right-3 top-full mt-1.5 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  สลับบริษัท / Business Workspace
                </div>
                {companies.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      if (onSelectCompany) onSelectCompany(comp);
                      setShowCompanyDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition cursor-pointer text-xs ${
                      currentCompany?.id === comp.id
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate text-xs font-semibold">{comp.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{comp.sageEdition}</div>
                    </div>
                    {currentCompany?.id === comp.id && (
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 px-3 space-y-4 overflow-y-auto custom-scrollbar">
            {/* Analytics Section */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Financial Reports
              </div>
              <div className="space-y-1">
                {/* Sales Hub */}
                <button
                  onClick={() => {
                    onSelectTab('dashboard');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`nav-item w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>Sales & Margin Hub</span>
                </button>

                {/* AR Aging Module Item */}
                {features.arAging && (
                  <button
                    id="navItemAr"
                    onClick={() => {
                      onSelectTab('ar-aging');
                      if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                    }}
                    className={`nav-item w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'ar-aging'
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${activeTab === 'ar-aging' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>A/R Aging (วิเคราะห์ลูกหนี้)</span>
                  </button>
                )}

                {/* Inventory Module Item */}
                {features.inventoryValuation && (
                  <button
                    id="navItemInv"
                    onClick={() => {
                      onSelectTab('inventory');
                      if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                    }}
                    className={`nav-item w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'inventory'
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Boxes className={`w-4 h-4 ${activeTab === 'inventory' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>Inventory Valuation</span>
                  </button>
                )}

                {/* Field Mapping Item */}
                <button
                  onClick={() => {
                    onSelectTab('field-mapping');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`nav-item w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'field-mapping'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <GitMerge className={`w-4 h-4 ${activeTab === 'field-mapping' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>Custom Field Mapping</span>
                </button>

                {/* Report Studio */}
                {features.reportStudio && (
                  <button
                    onClick={() => {
                      onSelectTab('report-studio');
                      if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                    }}
                    className={`nav-item w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'report-studio'
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'report-studio' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>Report Studio</span>
                  </button>
                )}
              </div>
            </div>

            {/* Data & Automation Section */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Data Operations
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onSelectTab('data-hub');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`nav-item w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'data-hub'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <UploadCloud className={`w-4 h-4 ${activeTab === 'data-hub' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>Import Sage Excel</span>
                </button>

                {features.odbcSync && (
                  <button
                    id="navItemOdbc"
                    onClick={() => {
                      onSelectTab('odbc-sync');
                      if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                    }}
                    className={`nav-item w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeTab === 'odbc-sync'
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Database className={`w-4 h-4 ${activeTab === 'odbc-sync' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>ODBC Direct Sync</span>
                  </button>
                )}
              </div>
            </div>

            {/* Administration & Settings */}
            <div>
              <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Administration
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onSelectTab('settings');
                    if (window.innerWidth < 1024 && onCloseMobile) onCloseMobile();
                  }}
                  className={`nav-item w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Sliders className={`w-4 h-4 ${activeTab === 'settings' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>ตั้งค่าโมดูล (Settings)</span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer / User Profile & Menu (Bottom Left) */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0 relative" ref={profileRef}>
          {/* Profile Popup Dropdown (Opens Upwards) */}
          {showProfileDropdown && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-[#1e293b] border border-slate-200/80 dark:border-slate-700 rounded-2xl p-3.5 z-50 space-y-3 shadow-xl">
              {/* User summary */}
              <div className="flex items-center space-x-3 pb-2.5 border-b border-slate-100 dark:border-slate-700/80">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center text-sm shrink-0 shadow-sm shadow-blue-500/20">
                  {currentUser.avatarInitials || 'PL'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.department}
                  </div>
                  <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                    Apex Global Trading Ltd.
                  </div>
                </div>
              </div>

              {/* Preferences Section: Language & Dark Mode */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'th' ? 'การตั้งค่าทั่วไป (Preferences)' : 'Preferences'}
                </div>

                {/* Language Toggle */}
                {onToggleLang && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200 font-medium">
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span>{lang === 'th' ? 'ภาษา' : 'Language'}</span>
                    </div>
                    <button
                      id="btnProfileToggleLang"
                      onClick={onToggleLang}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold border border-slate-200 dark:border-slate-600 text-[11px] hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3 text-blue-500" />
                      <span>{lang === 'th' ? 'TH (ไทย)' : 'EN (English)'}</span>
                    </button>
                  </div>
                )}

                {/* Theme Toggle */}
                {onToggleTheme && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-200 font-medium">
                      {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                      <span>{lang === 'th' ? 'โหมดสี' : 'Theme'}</span>
                    </div>
                    <button
                      id="btnProfileToggleTheme"
                      onClick={onToggleTheme}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold border border-slate-200 dark:border-slate-600 text-[11px] hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
                    >
                      {theme === 'dark' ? (
                        <>
                          <Moon className="w-3 h-3 text-indigo-400" />
                          <span>Dark</span>
                        </>
                      ) : (
                        <>
                          <Sun className="w-3 h-3 text-amber-500" />
                          <span>Light</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* RBAC Role Simulator */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-700/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{lang === 'th' ? 'จำลองสิทธิ์ (RBAC)' : 'User Role'}</span>
                  <Shield className="w-3 h-3 text-blue-500" />
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => {
                        onRoleChange(r.role);
                        setShowProfileDropdown(false);
                      }}
                      className={`w-full text-left p-1.5 rounded-xl text-xs transition cursor-pointer ${
                        currentUser.role === r.role
                          ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate text-[11px]">{r.title}</span>
                        {currentUser.role === r.role && (
                          <CheckCircle2 className="w-3 h-3 text-white shrink-0" />
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
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition cursor-pointer text-left"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm shadow-blue-500/20">
                {currentUser.avatarInitials || 'PL'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
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
