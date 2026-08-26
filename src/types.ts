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
  coreSales: boolean;
  aiCopilot: boolean;
  arAging: boolean;
  inventoryValuation: boolean;
  reportStudio: boolean;
  odbcSync: boolean;
  auditLogs: boolean;
  multiCompany: boolean;
}

// Global Filter State
export interface GlobalFilterState {
  period: string; // 'all' | 'q1' | 'q2'
  salesRep: string; // 'all' | rep name
  category: string; // 'all' | category name
  status: string; // 'all' | 'Paid' | 'Pending' | 'Overdue'
  searchQuery: string;
}
