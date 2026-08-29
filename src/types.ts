/**
 * Sage 50 Enterprise BI Platform - Canonical Types
 */

export type UserRole = 'executive' | 'finance' | 'sales_rep' | 'warehouse';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatarInitials: string;
  accessibleRepName?: string; // If sales_rep, limit to this rep
}

export interface CompanyWorkspace {
  id: string;
  name: string;
  sageEdition: string;
  currency: string;
  fiscalYear: string;
  lastSyncTime: string;
  syncStatus: 'connected' | 'syncing' | 'idle' | 'warning';
  isDemo?: boolean;
  isImported?: boolean;
}

// 02 Canonical Data Model Entities
export interface Customer {
  id: string;
  code: string;
  name: string;
  group: string;
  creditLimit: number;
  salesRep: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Credit Hold' | 'Inactive';
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'Furniture' | 'Wood Craft' | 'Outdoor' | 'Acoustic' | 'Accessories';
  unit: string;
  costPrice: number;
  sellingPrice: number;
  qtyOnHand: number;
  reorderPoint: number;
  status: 'In Stock' | 'Low Stock' | 'Critical' | 'Discontinued';
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  date: string; // YYYY-MM-DD
  dueDate: string;
  customerId: string;
  customerName: string;
  salesRep: string;
  category: string;
  itemCode: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discount: number;
  tax: number;
  netAmount: number;
  cogs: number;
  grossProfit: number;
  marginPct: number;
  paidAmount: number;
  outstandingAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  overdueDays: number;
  period: 'q1' | 'q2' | 'q3' | 'q4';
  month: string; // 'ม.ค.', 'ก.พ.', etc.
  sourceFile?: string;
  sourceSheet?: string;
  sourceRow?: number;
}

export interface ArAgingBucket {
  customerId: string;
  customerName: string;
  creditLimit: number;
  current0_30: number;
  aging31_60: number;
  aging61_90: number;
  over90: number;
  totalOutstanding: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  lastPaymentDate?: string;
  invoicesCount: number;
}

export interface InventoryItem {
  code: string;
  name: string;
  category: string;
  qtyOnHand: number;
  qtyAvailable: number;
  qtyReserved: number;
  unitCost: number;
  sellingPrice: number;
  totalAssetValue: number;
  reorderPoint: number;
  stockHealth: 'Healthy' | 'Low' | 'Critical' | 'Overstocked';
  stockTurnover: number;
  slowMovingDays: number;
}

// 01 Data Hub Types
export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  sampleValue: string;
  status: 'matched' | 'unmapped' | 'optional';
  confidence: number;
}

export interface MappingProfile {
  id: string;
  name: string;
  description: string;
  sourceSystem: string;
  mappings: Record<string, string>;
  createdAt: string;
  isDefault?: boolean;
}

export interface ImportHistoryItem {
  id: string;
  fileName: string;
  importedAt: string;
  importedBy: string;
  rowsProcessed: number;
  rowsSuccess: number;
  rowsFailed: number;
  qualityScore: number;
  status: 'Success' | 'Warning' | 'Failed';
  sheetName: string;
}

// 03 Report Studio Types
export interface CalculatedField {
  id: string;
  name: string;
  formula: string;
  format: 'currency' | 'percent' | 'number';
}

export interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'contains';
  value: any;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description?: string;
  dataset: 'sales' | 'ar_aging' | 'inventory' | 'customer';
  selectedFields: string[];
  filters: ReportFilter[];
  groupBy: string[];
  sortBy: { field: string; direction: 'asc' | 'desc' };
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  calculatedFields?: CalculatedField[];
  visualization: 'table' | 'pivot' | 'bar' | 'line' | 'area' | 'donut' | 'combo';
  category?: 'Sales' | 'Finance' | 'AR' | 'Inventory' | 'Executive' | 'Custom';
  isTemplate?: boolean;
  createdAt: string;
  updatedAt: string;
  owner: string;
}

// Feature Toggles
export interface FeatureToggles {
  coreSales?: boolean;
  aiCopilot: boolean;
  arAging: boolean;
  cashFlowForecast: boolean;
  salesCommission: boolean;
  executiveDigest: boolean;
  inventoryValuation: boolean;
  reportStudio: boolean;
  odbcSync: boolean;
  auditLogs?: boolean;
  multiCompany?: boolean;
}

// Cash Flow & What-If Forecasting Types
export interface CashFlowScenarioParams {
  paymentDelayDays: number; // e.g. -15 to +45 days
  salesGrowthPct: number; // e.g. -30% to +50%
  earlyPaymentDiscountPct: number; // e.g. 0% to 5%
  earlyCollectionAdoptionPct: number; // e.g. 0% to 100%
  cogsInflationPct: number; // e.g. -10% to +20%
  openingCashBalance: number; // e.g. 1,500,000 THB
  monthlyFixedOpex: number; // e.g. 350,000 THB
  minSafetyCash: number; // e.g. 500,000 THB
}

export interface WeeklyCashBucket {
  weekKey: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  baseInflow: number;
  scenarioInflow: number;
  worstCaseInflow: number;
  bestCaseInflow: number;
  projectedOutflow: number;
  netCashFlow: number;
  closingCash: number;
  safetyBuffer: number;
  riskStatus: 'Safe' | 'Moderate' | 'Tight' | 'Deficit';
}

export interface CustomerCashInflowItem {
  customerId: string;
  customerName: string;
  invoiceNo: string;
  invoiceDate: string;
  originalDueDate: string;
  adjustedDueDate: string;
  amount: number;
  outstandingAmount: number;
  overdueDays: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  expectedProbability: number;
  expectedInflow: number;
  discountEligible: boolean;
  discountedAmount: number;
}

// Sales Target, Quota & Commission Tracking Types
export interface SalesTargetItem {
  salesRep: string;
  targetRevenue: number;
  targetGrossMarginPct: number;
  targetNewAccounts: number;
  period: string; // e.g. '2026-Q1', '2026-Q2', '2026-03'
  department: string;
}

export interface CommissionTier {
  thresholdPct: number; // e.g. 0%, 80%, 100%, 120%
  ratePct: number; // e.g. 1.0%, 1.5%, 2.5%, 3.5%
  label: string;
}

export interface CommissionSchemeConfig {
  modelType: 'revenue_tiered' | 'gross_profit_linked' | 'accelerator_kicker';
  baseRatePct: number; // e.g. 1.5%
  kickerRatePct: number; // e.g. +1.0% when > 100% target
  superKickerRatePct: number; // e.g. +2.0% when > 120% target
  minMarginThresholdPct: number; // e.g. 25% (if margin < 25%, commission reduced by 50%)
  uncollectedOverdueDeductionPct: number; // e.g. 10% penalty for invoices > 90d overdue
  paidOnlySettlement: boolean; // Only pay commission on collected/paid cash
}

export interface SalesRepAttainment {
  salesRep: string;
  targetRevenue: number;
  actualRevenue: number;
  attainmentPct: number;
  targetGrossMarginPct: number;
  actualGrossMarginPct: number;
  grossProfitAmount: number;
  invoiceCount: number;
  collectedAmount: number;
  uncollectedAmount: number;
  overdueSevereAmount: number;
  baseCommission: number;
  bonusKickerCommission: number;
  penaltyDeduction: number;
  totalCommissionEarned: number;
  pacingForecastRevenue: number;
  pacingAttainmentPct: number;
  rank: number;
  badge: string;
  status: 'Exceeding' | 'On Track' | 'At Risk' | 'Behind';
}

// Enterprise White-Label & Theme Branding Types
export type ThemePresetId = 'classic-original' | 'teal-modern' | 'navy-corporate' | 'emerald-sage' | 'indigo-tech' | 'obsidian-luxury' | 'light-minimal';

export interface ThemeConfig {
  id: ThemePresetId;
  name: string;
  brandName: string;
  brandSubtitle: string;
  logoText: string;
  companyName: string;
  accentColor: string; // Hex for charts/buttons
  accentClass: 'teal' | 'blue' | 'emerald' | 'indigo' | 'slate' | 'amber';
  sidebarStyle: 'classic-dark' | 'deep-slate' | 'midnight-navy' | 'forest-dark' | 'pure-dark' | 'light-clean' | 'slate-soft';
  density: 'airy' | 'comfortable' | 'compact';
  borderRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-lg' | 'rounded-none';
  cardStyle: 'glass-flat' | 'solid-white' | 'border-crisp';
  showDataHealthBadge: boolean;
  customHeaderTitle?: string;
}

// Global Filter State
export interface GlobalFilterState {
  period: string; // 'all' | 'q1' | 'q2'
  salesRep: string; // 'all' | rep name
  category: string; // 'all' | category name
  status: string; // 'all' | 'Paid' | 'Pending' | 'Overdue'
  searchQuery: string;
}

// Smart Alert Rules & Executive Digest Studio Types
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertCategory = 'ar_overdue' | 'credit_limit' | 'margin_drop' | 'cash_runway' | 'inventory_deadstock';

export interface SmartAlertRule {
  id: string;
  name: string;
  category: AlertCategory;
  description: string;
  severity: AlertSeverity;
  thresholdValue: number;
  unit: 'days' | 'thb' | 'percent' | 'times' | 'units';
  enabled: boolean;
  notifyChannels: ('in_app' | 'email' | 'line_webhook')[];
  lastTriggeredAt?: string;
  triggeredCount: number;
}

export interface ActiveFinancialAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  detail: string;
  entityName: string; // e.g. Customer Name, Product Name, or System
  entityId?: string;
  metricValue: number;
  metricLabel: string;
  impactAmount: number; // in THB
  suggestedAction: string;
  actionType: 'draft_debt_letter' | 'hold_credit' | 'review_margin' | 'liquidate_stock' | 'rebalance_cash';
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}

export interface ExecutiveDigestReport {
  periodTitle: string;
  reportDate: string;
  companyName: string;
  formatType: 'weekly' | 'monthly' | 'risk_memo';
  revenueTotal: number;
  revenueTarget: number;
  revenueAttainmentPct: number;
  revenueGrowthPct: number;
  grossProfitTotal: number;
  grossMarginPct: number;
  cashClosingBalance: number;
  cashRunwayWeeks: number;
  totalArOverdue: number;
  criticalArCount: number;
  topDebtorName: string;
  topDebtorAmount: number;
  deadStockValue: number;
  topRepName: string;
  topRepRevenue: number;
  kpiCards: {
    label: string;
    value: string;
    subtext: string;
    badgeColor?: 'emerald' | 'rose' | 'blue' | 'amber' | 'slate';
  }[];
  aiExecutiveSummary: string;
  positiveHighlights: string[];
  redFlags: string[];
  strategicRecommendations: string[];
}

