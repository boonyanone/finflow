import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { UploadModal } from './components/UploadModal';
import { DrillDownModal } from './components/DrillDownModal';
import { DebtDraftModal } from './components/DebtDraftModal';
import { DataHealthModal } from './components/DataHealthModal';

// Views
import { DashboardView } from './views/DashboardView';
import { ArAgingView } from './views/ArAgingView';
import { CashFlowForecastView } from './views/CashFlowForecastView';
import { SalesTargetCommissionView } from './views/SalesTargetCommissionView';
import { ExecutiveDigestAlertsView } from './views/ExecutiveDigestAlertsView';
import { InventoryView } from './views/InventoryView';
import { CustomFieldMappingView } from './views/CustomFieldMappingView';
import { ReportStudioView } from './views/ReportStudioView';
import { StandardReportsView } from './views/StandardReportsView';
import { DataHubView } from './views/DataHubView';
import { OdbcSyncView } from './views/OdbcSyncView';
import { SettingsAdminView } from './views/SettingsAdminView';

// Sample Data & Initial State
import {
  INITIAL_COMPANIES,
  INITIAL_INVOICES,
  INITIAL_AR_AGING,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_MAPPING_PROFILES,
  INITIAL_STANDARD_REPORTS,
} from './data/sampleSage50Data';

import {
  InvoiceRecord,
  ArAgingBucket,
  Customer,
  InventoryItem,
  MappingProfile,
  ReportDefinition,
  FeatureToggles,
  UserProfile,
  UserRole,
  GlobalFilterState,
  CompanyWorkspace,
  ThemeConfig,
} from './types';
import { fetchAiExecutiveInsight } from './services/geminiService';
import { loadSavedTheme, saveTheme } from './utils/themePresets';
import {
  synthesizeInventoryFromInvoices,
  synthesizeCustomersFromInvoices,
  synthesizeArAgingFromInvoices,
} from './utils/inventoryHelper';

export const App: React.FC = () => {
  // App state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(loadSavedTheme());
  const [lang, setLang] = useState<'th' | 'en'>('th');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isDataHealthOpen, setIsDataHealthOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUpdateTheme = (newConfig: ThemeConfig) => {
    setThemeConfig(newConfig);
    saveTheme(newConfig);
  };

  // Companies / Workspaces & Data Source Mode
  const EMPTY_COMPANY: CompanyWorkspace = {
    id: 'comp-unloaded',
    name: 'Workspace ว่าง (รอการนำเข้าข้อมูล)',
    sageEdition: 'Sage 50 / Excel Ready for Import',
    currency: 'THB (฿)',
    fiscalYear: '2026',
    lastSyncTime: 'รอการนำเข้าไฟล์',
    syncStatus: 'idle',
  };

  const [dataSourceMode, setDataSourceMode] = useState<'empty' | 'demo' | 'imported'>('demo');
  const [importedFileName, setImportedFileName] = useState<string>('');

  const [companies, setCompanies] = useState<CompanyWorkspace[]>([
    ...INITIAL_COMPANIES,
    EMPTY_COMPANY,
  ]);
  const [currentCompany, setCurrentCompany] = useState<CompanyWorkspace>(INITIAL_COMPANIES[0]);

  // Data Collections - Pre-loaded with cold room demo data for instant out-of-the-box exploration
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [arBuckets, setArBuckets] = useState<ArAgingBucket[]>(INITIAL_AR_AGING);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [mappingProfiles, setMappingProfiles] = useState<MappingProfile[]>(INITIAL_MAPPING_PROFILES);
  const [savedReports, setSavedReports] = useState<ReportDefinition[]>(INITIAL_STANDARD_REPORTS);
  const [activeStudioReport, setActiveStudioReport] = useState<ReportDefinition | undefined>(undefined);

  // Modular Feature Toggles
  const [features, setFeatures] = useState<FeatureToggles>({
    aiCopilot: true,
    arAging: true,
    cashFlowForecast: true,
    salesCommission: true,
    executiveDigest: true,
    inventoryValuation: true,
    reportStudio: true,
    odbcSync: true,
  });

  // Current Logged-in User Profile (RBAC Simulation)
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-1',
    name: 'สมชาย มั่นคง (เจ้าของกิจการ / Admin)',
    email: 'admin@siam-supply.co.th',
    role: 'executive',
    department: 'Executive Board',
    avatarInitials: 'SC',
    accessibleRepName: undefined,
  });

  // Global Filter State
  const [filters, setFilters] = useState<GlobalFilterState>({
    period: 'all',
    salesRep: 'all',
    category: 'all',
    status: 'all',
    searchQuery: '',
  });

  // AI Executive Insight state
  const [aiInsightText, setAiInsightText] = useState<string>(
    'ระบบ FinFlow BI พร้อมสำหรับการนำเข้าข้อมูล กรุณานำเข้าไฟล์ Excel / Sage 50 ของคุณ หรือโหลดชุดข้อมูลตัวอย่าง (DEMO DATA) เพื่อเริ่มการวิเคราะห์'
  );
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const handleLoadDemoData = () => {
    setInvoices(INITIAL_INVOICES);
    setArBuckets(INITIAL_AR_AGING);
    setCustomers(INITIAL_CUSTOMERS);
    setInventory(INITIAL_INVENTORY);
    setCurrentCompany(INITIAL_COMPANIES[0]);
    setDataSourceMode('demo');
    setAiInsightText(
      'วิเคราะห์ภาพรวม บจก. สยาม คูลลิ่งฯ (DEMO): ยอดขายโครงการสะสม ฿5,473,200 กำไรขั้นต้นรวม 38.3% (฿2,096,400) โดยกลุ่มแผ่น PIR ฉนวนกันไฟ และประตูห้องเย็นสแตนเลสมี Margin สูงสุดที่ 42-45% พบลูกหนี้ค้างชำระเกิน 60 วัน 1 โครงการ (บจก. เบทาฟู้ดส์ โพรเซสซิ่ง ฿368,800) อยู่ระหว่างรออนุมัติส่งมอบงานงวดสุดท้าย'
    );
    showToast('✨ โหลดชุดข้อมูลตัวอย่าง (DEMO DATA) เรียบร้อยแล้ว พร้อมให้ทดสอบระบบ');
  };

  const handleClearData = () => {
    setInvoices([]);
    setArBuckets([]);
    setCustomers([]);
    setInventory([]);
    setCurrentCompany(EMPTY_COMPANY);
    setDataSourceMode('empty');
    setImportedFileName('');
    setAiInsightText('ระบบพร้อมสำหรับการนำเข้าข้อมูล กรุณานำเข้าไฟล์ Excel / Sage 50 เพื่อเริ่มการวิเคราะห์');
    showToast('🧹 ล้างข้อมูลเรียบร้อยแล้ว — กลับสู่สถานะว่างพร้อมนำเข้าไฟล์');
  };

  const handleSelectCompany = (comp: CompanyWorkspace) => {
    setCurrentCompany(comp);
    if (comp.id === 'comp-unloaded') {
      handleClearData();
    } else if (comp.isDemo) {
      setInvoices(INITIAL_INVOICES);
      setArBuckets(INITIAL_AR_AGING);
      setCustomers(INITIAL_CUSTOMERS);
      setInventory(INITIAL_INVENTORY);
      setDataSourceMode('demo');
      showToast(`🟠 สลับไปยังชุดข้อมูลตัวอย่าง: ${comp.name}`);
    } else {
      showToast(`สลับไปยัง ${comp.name} เรียบร้อยแล้ว`);
    }
  };

  // Drill-down Modal State
  const [drillModal, setDrillModal] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    records: InvoiceRecord[];
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    records: [],
  });

  // Debt Draft Modal State
  const [debtModal, setDebtModal] = useState<{
    isOpen: boolean;
    customer: string;
    invoiceNo: string;
    amount: number;
    overdueDays: number;
  }>({
    isOpen: false,
    customer: '',
    invoiceNo: '',
    amount: 0,
    overdueDays: 0,
  });

  // Dark mode effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load live AI Executive brief on initial mount or when invoices change
  useEffect(() => {
    async function loadInsight() {
      if (!features.aiCopilot) return;
      setAiLoading(true);
      try {
        const totalNet = invoices.reduce((acc, r) => acc + r.netAmount, 0);
        const totalCogs = invoices.reduce((acc, r) => acc + r.cogs, 0);
        const gp = totalNet - totalCogs;
        const overdue = invoices
          .filter((r) => r.status === 'Overdue')
          .reduce((acc, r) => acc + r.outstandingAmount, 0);

        const res = await fetchAiExecutiveInsight({
          totalRevenue: totalNet,
          grossProfit: gp,
          overdueAR: overdue,
          topCategory: 'Furniture',
          growthMoM: '+14.8%',
        });
        if (res.insight) {
          setAiInsightText(res.insight);
        }
      } catch (e) {
        // use default fallback
      } finally {
        setAiLoading(false);
      }
    }
    loadInsight();
  }, [invoices.length, features.aiCopilot]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleToggleFeature = (key: keyof FeatureToggles) => {
    setFeatures((prev) => {
      const nextVal = !prev[key];
      // Real-time navigation safety when disabling features
      if (!nextVal) {
        if (key === 'arAging' && activeTab === 'ar-aging') setActiveTab('dashboard');
        if (key === 'inventoryValuation' && activeTab === 'inventory') setActiveTab('dashboard');
        if (key === 'reportStudio' && activeTab === 'report-studio') setActiveTab('dashboard');
        if (key === 'odbcSync' && activeTab === 'odbc-sync') setActiveTab('dashboard');
        if (key === 'aiCopilot') setIsCopilotOpen(false);
      }
      return { ...prev, [key]: nextVal };
    });
  };

  const handleRoleChange = (role: UserRole) => {
    let accessibleRep: string | undefined = undefined;
    let name = 'Pi Loh (Admin)';
    let department = 'Chief Executive';
    let initials = 'PL';

    if (role === 'sales_rep') {
      accessibleRep = 'Alex Wong';
      name = 'Alex Wong (Sales Rep)';
      department = 'Commercial Sales';
      initials = 'AW';
    } else if (role === 'finance') {
      name = 'Kanya Finance Mgr';
      department = 'Finance & Accounting';
      initials = 'KF';
    } else if (role === 'warehouse') {
      name = 'Wichai Warehouse';
      department = 'Logistics & Inventory';
      initials = 'WW';
    }

    setCurrentUser({
      id: `usr-${role}`,
      name,
      email: `${role}@apexglobal.com`,
      role,
      department,
      avatarInitials: initials,
      accessibleRepName: accessibleRep,
    });
  };

  const handleImportComplete = (
    newInvoices: InvoiceRecord[],
    fileName: string,
    sheetName: string,
    qualityScore: number
  ) => {
    // Intelligently derive Customers, AR Aging Buckets, and Inventory Catalog from the imported invoices
    const synthesizedInventory = synthesizeInventoryFromInvoices(newInvoices);
    const synthesizedCustomers = synthesizeCustomersFromInvoices(newInvoices);
    const synthesizedArBuckets = synthesizeArAgingFromInvoices(newInvoices);

    setInvoices(newInvoices);
    setInventory(synthesizedInventory);
    setCustomers(synthesizedCustomers);
    setArBuckets(synthesizedArBuckets);
    setDataSourceMode('imported');
    setImportedFileName(fileName);

    const importedCompany: CompanyWorkspace = {
      id: `comp-imported-${Date.now()}`,
      name: `ข้อมูลนำเข้า: ${fileName}`,
      sageEdition: `Sage 50 / Excel (${newInvoices.length} รายการ)`,
      currency: 'THB (฿)',
      fiscalYear: '2026',
      lastSyncTime: 'เพิ่งนำเข้าเมื่อสักครู่',
      syncStatus: 'connected',
      isImported: true,
      isDemo: false,
    };

    setCompanies((prev) => [
      importedCompany,
      ...prev.filter((c) => c.id !== 'comp-unloaded' && c.id !== importedCompany.id),
    ]);
    setCurrentCompany(importedCompany);
    showToast(`✅ นำเข้าข้อมูลจริงสำเร็จ! (${newInvoices.length} รายการบิล, ${synthesizedInventory.length} สินค้าคงคลัง, ${synthesizedCustomers.length} ลูกค้า)`);
  };

  const handleOpenReportInStudio = (report: ReportDefinition) => {
    setActiveStudioReport(report);
    setActiveTab('report-studio');
    showToast(`📝 เปิดรายงาน "${report.title}" ใน Report Studio แล้ว`);
  };

  const handleSaveReport = (report: ReportDefinition) => {
    setSavedReports((prev) => {
      const idx = prev.findIndex((r) => r.id === report.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = report;
        return next;
      }
      return [report, ...prev];
    });
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-[#0b101d] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        features={features}
        onOpenUpload={() => setIsUploadOpen(true)}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onCloseMobile={() => setIsSidebarOpen(false)}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        lang={lang}
        onToggleLang={() => setLang(lang === 'th' ? 'en' : 'th')}
        currentCompany={currentCompany}
        companies={companies}
        onSelectCompany={handleSelectCompany}
        themeConfig={themeConfig}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-slate-50/60 dark:bg-[#0b101d]">
        {/* Top Header - Seamless with main canvas */}
        <Header
          activeTab={activeTab}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          lang={lang}
          onToggleLang={() => setLang(lang === 'th' ? 'en' : 'th')}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenDataHealth={() => setIsDataHealthOpen(true)}
          features={features}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          themeConfig={themeConfig}
        />

        {/* Scrollable Main Body with Dynamic Density & Spacing */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar w-full min-w-0 ${
          themeConfig.density === 'airy'
            ? 'px-4 sm:px-6 md:px-8 py-5 space-y-6'
            : themeConfig.density === 'compact'
            ? 'px-2.5 sm:px-4 py-2 space-y-3'
            : 'px-3 sm:px-5 md:px-7 py-3 space-y-5'
        }`}>
          {activeTab === 'dashboard' && (
            <DashboardView
              invoices={invoices}
              filters={filters}
              onFilterChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
              onResetFilters={() =>
                setFilters({
                  period: 'all',
                  salesRep: 'all',
                  category: 'all',
                  status: 'all',
                  searchQuery: '',
                })
              }
              user={currentUser}
              aiInsightText={aiInsightText}
              aiLoading={aiLoading}
              onOpenCopilot={() => setIsCopilotOpen(true)}
              onDrillDown={(title, subtitle, records) =>
                setDrillModal({ isOpen: true, title, subtitle, records })
              }
              onOpenDebtDraft={(customer, invoiceNo, amount, overdueDays) =>
                setDebtModal({ isOpen: true, customer, invoiceNo, amount, overdueDays })
              }
              dataSourceMode={dataSourceMode}
              importedFileName={importedFileName}
              onLoadDemoData={handleLoadDemoData}
              onClearData={handleClearData}
              onOpenUpload={() => setIsUploadOpen(true)}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === 'ar-aging' && (
            <ArAgingView
              arBuckets={arBuckets}
              customers={customers}
              invoices={invoices}
              onOpenDebtDraft={(customer, invoiceNo, amount, overdueDays) =>
                setDebtModal({ isOpen: true, customer, invoiceNo, amount, overdueDays })
              }
              onDrillDown={(title, subtitle, records) =>
                setDrillModal({ isOpen: true, title, subtitle, records })
              }
            />
          )}

          {activeTab === 'cash-flow' && (
            <CashFlowForecastView
              invoices={invoices}
              customers={customers}
              arBuckets={arBuckets}
              onOpenDebtDraft={(customer, invoiceNo, amount, overdueDays) =>
                setDebtModal({ isOpen: true, customer, invoiceNo, amount, overdueDays })
              }
              onOpenCopilot={() => setIsCopilotOpen(true)}
            />
          )}

          {activeTab === 'sales-commission' && (
            <SalesTargetCommissionView
              invoices={invoices}
              customers={customers}
              onOpenCopilot={() => setIsCopilotOpen(true)}
            />
          )}

          {activeTab === 'executive-alerts' && (
            <ExecutiveDigestAlertsView
              invoices={invoices}
              customers={customers}
              inventory={inventory}
              onOpenDebtDraft={(cust, invNo, amt, days) =>
                setDebtModal({
                  isOpen: true,
                  customer: cust.name,
                  invoiceNo: invNo,
                  amount: amt,
                  overdueDays: days,
                })
              }
              onOpenCopilot={() => setIsCopilotOpen(true)}
              companyName={currentCompany.name}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              inventory={inventory}
              invoices={invoices}
              onUpdateInventory={setInventory}
              onLoadDemoInventory={handleLoadDemoData}
              onGenerateFromInvoices={() => {
                const synthesized = synthesizeInventoryFromInvoices(invoices);
                setInventory(synthesized);
                showToast(`⚡ สร้างแคตตาล็อกสินค้าคงคลังสำเร็จ ${synthesized.length} รายการจากบิลขาย`);
              }}
              companyName={currentCompany.name}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'field-mapping' && (
            <SettingsAdminView
              features={features}
              onToggleFeature={handleToggleFeature}
              currentUser={currentUser}
              onSelectRole={handleRoleChange}
              onShowToast={showToast}
              themeConfig={themeConfig}
              onUpdateTheme={handleUpdateTheme}
              invoices={invoices}
              mappingProfiles={mappingProfiles}
              onOpenUpload={() => setIsUploadOpen(true)}
              onImportComplete={handleImportComplete}
              companyName={currentCompany.name}
              initialAdminTab="data_hub"
            />
          )}

          {activeTab === 'report-studio' && (
            <ReportStudioView
              invoices={invoices}
              savedReports={savedReports}
              onSaveReport={handleSaveReport}
              activeReportDef={activeStudioReport}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'standard-reports' && (
            <StandardReportsView
              reports={savedReports}
              invoices={invoices}
              onOpenInStudio={handleOpenReportInStudio}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'data-hub' && (
            <SettingsAdminView
              features={features}
              onToggleFeature={handleToggleFeature}
              currentUser={currentUser}
              onSelectRole={handleRoleChange}
              onShowToast={showToast}
              themeConfig={themeConfig}
              onUpdateTheme={handleUpdateTheme}
              invoices={invoices}
              mappingProfiles={mappingProfiles}
              onOpenUpload={() => setIsUploadOpen(true)}
              onImportComplete={handleImportComplete}
              companyName={currentCompany.name}
              initialAdminTab="data_hub"
            />
          )}

          {activeTab === 'odbc-sync' && (
            <SettingsAdminView
              features={features}
              onToggleFeature={handleToggleFeature}
              currentUser={currentUser}
              onSelectRole={handleRoleChange}
              onShowToast={showToast}
              themeConfig={themeConfig}
              onUpdateTheme={handleUpdateTheme}
              invoices={invoices}
              mappingProfiles={mappingProfiles}
              onOpenUpload={() => setIsUploadOpen(true)}
              onImportComplete={handleImportComplete}
              companyName={currentCompany.name}
              initialAdminTab="data_hub"
            />
          )}

          {activeTab === 'settings' && (
            <SettingsAdminView
              features={features}
              onToggleFeature={handleToggleFeature}
              currentUser={currentUser}
              onSelectRole={handleRoleChange}
              onShowToast={showToast}
              themeConfig={themeConfig}
              onUpdateTheme={handleUpdateTheme}
              invoices={invoices}
              mappingProfiles={mappingProfiles}
              onOpenUpload={() => setIsUploadOpen(true)}
              onImportComplete={handleImportComplete}
              companyName={currentCompany.name}
              initialAdminTab="business_profile"
            />
          )}
        </main>
      </div>

      {/* 3. AI Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        contextData={{
          invoicesCount: invoices.length,
          totalRevenue: invoices.reduce((acc, r) => acc + r.netAmount, 0),
          activeView: activeTab,
          role: currentUser.role,
        }}
      />

      {/* 4. Excel Upload & Auto-Mapping Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImportComplete={handleImportComplete}
        mappingProfiles={mappingProfiles}
      />

      {/* 5. Drill-Down Line-Items Modal */}
      <DrillDownModal
        isOpen={drillModal.isOpen}
        onClose={() => setDrillModal({ ...drillModal, isOpen: false })}
        title={drillModal.title}
        subtitle={drillModal.subtitle}
        records={drillModal.records}
        hideCostAndMargin={currentUser.role === 'sales_rep'}
      />

      {/* 6. AI Debt Collection Draft Modal */}
      <DebtDraftModal
        isOpen={debtModal.isOpen}
        onClose={() => setDebtModal({ ...debtModal, isOpen: false })}
        customerName={debtModal.customer}
        invoiceNo={debtModal.invoiceNo}
        amount={debtModal.amount}
        overdueDays={debtModal.overdueDays}
        onShowToast={showToast}
      />

      {/* 7. Data Health & Integrity Modal (CDM Inspector) */}
      <DataHealthModal
        isOpen={isDataHealthOpen}
        onClose={() => setIsDataHealthOpen(false)}
        invoices={invoices}
        customers={customers}
        inventory={inventory}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className="bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-2">
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
