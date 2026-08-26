import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { UploadModal } from './components/UploadModal';
import { DrillDownModal } from './components/DrillDownModal';
import { DebtDraftModal } from './components/DebtDraftModal';

// Views
import { DashboardView } from './views/DashboardView';
import { ArAgingView } from './views/ArAgingView';
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
} from './types';
import { fetchAiExecutiveInsight } from './services/geminiService';

export const App: React.FC = () => {
  // App state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'th' | 'en'>('th');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Companies / Workspaces
  const [companies, setCompanies] = useState<CompanyWorkspace[]>(INITIAL_COMPANIES);
  const [currentCompany, setCurrentCompany] = useState<CompanyWorkspace>(INITIAL_COMPANIES[0]);

  // Data Collections
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
    inventoryValuation: true,
    reportStudio: true,
    odbcSync: true,
  });

  // Current Logged-in User Profile (RBAC Simulation)
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr-1',
    name: 'สมชาย มั่นคง (Admin)',
    email: 'somchai@siamcooling.co.th',
    role: 'executive',
    department: 'Chief Executive',
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
    'วิเคราะห์ภาพรวม บจก. สยาม คูลลิ่งฯ: ยอดขายโครงการสะสม ฿5,473,200 กำไรขั้นต้นรวม 38.3% (฿2,096,400) โดยกลุ่มแผ่น PIR ฉนวนกันไฟ และประตูห้องเย็นสแตนเลสมี Margin สูงสุดที่ 42-45% พบลูกหนี้ค้างชำระเกิน 60 วัน 1 โครงการ (บจก. เบทาฟู้ดส์ โพรเซสซิ่ง ฿368,800) อยู่ระหว่างรออนุมัติส่งมอบงานงวดสุดท้าย'
  );
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const handleSelectCompany = (comp: CompanyWorkspace) => {
    setCurrentCompany(comp);
    setToastMessage(`สลับไปยัง ${comp.name} เรียบร้อยแล้ว`);
    setTimeout(() => setToastMessage(null), 3000);
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
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
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
    setInvoices((prev) => [...newInvoices, ...prev]);
    showToast(`✅ นำเข้าและแมปข้อมูล Sage 50 สำเร็จ! (${newInvoices.length} รายการ)`);
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
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-white dark:bg-[#0b101d]">
        {/* Top Header - Seamless with main canvas */}
        <Header
          activeTab={activeTab}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          lang={lang}
          onToggleLang={() => setLang(lang === 'th' ? 'en' : 'th')}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          features={features}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Scrollable Main Body */}
        <main className="flex-1 overflow-y-auto px-3 sm:px-5 md:px-7 pb-8 pt-1 space-y-5 custom-scrollbar w-full min-w-0">
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

          {activeTab === 'inventory' && <InventoryView inventory={inventory} />}

          {activeTab === 'field-mapping' && <CustomFieldMappingView />}

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
            <DataHubView
              invoices={invoices}
              mappingProfiles={mappingProfiles}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {activeTab === 'odbc-sync' && <OdbcSyncView onShowToast={showToast} />}

          {activeTab === 'settings' && (
            <SettingsAdminView
              features={features}
              onToggleFeature={handleToggleFeature}
              currentUser={currentUser}
              onSelectRole={handleRoleChange}
              onShowToast={showToast}
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
