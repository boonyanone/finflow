import * as XLSX from 'xlsx';
import { INITIAL_INVOICES, INITIAL_CUSTOMERS, INITIAL_INVENTORY } from '../data/sampleSage50Data';

/**
 * Generates and downloads the Cold Room & PIR Panel sample Excel (.xlsx) file
 */
export function downloadSiamCoolingDemoExcel() {
  const headers = [
    'Project_Invoice_No',
    'Billing_Date',
    'Due_Date',
    'Customer_Company_Name',
    'Project_Sales_Engineer',
    'Product_Group',
    'Item_SKU_Code',
    'Material_Description',
    'Quantity_SQM_Units',
    'Unit_Price_THB',
    'Net_Sales_Amount',
    'COGS_Cost_Amount',
    'Collected_Amount',
    'Payment_Status',
  ];

  const rows = INITIAL_INVOICES.map((inv) => [
    inv.invoiceNo,
    inv.date,
    inv.dueDate,
    inv.customerName,
    inv.salesRep,
    inv.category,
    inv.itemCode,
    inv.itemDescription,
    inv.quantity,
    inv.unitPrice,
    inv.netAmount,
    inv.cogs,
    inv.paidAmount,
    inv.status,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ColdRoom_Projects_2026');

  // Also add Customers sheet
  const custHeaders = ['Customer_Code', 'Company_Name', 'Industry_Group', 'Credit_Limit', 'Sales_Rep', 'Contact_Person', 'Phone', 'Email', 'Status'];
  const custRows = INITIAL_CUSTOMERS.map((c) => [
    c.code,
    c.name,
    c.group,
    c.creditLimit,
    c.salesRep,
    c.contactPerson,
    c.phone,
    c.email,
    c.status,
  ]);
  const custWorksheet = XLSX.utils.aoa_to_sheet([custHeaders, ...custRows]);
  XLSX.utils.book_append_sheet(workbook, custWorksheet, 'Customer_Master');

  // Also add Stock sheet
  const stockHeaders = ['SKU_Code', 'Product_Name', 'Category', 'Stock_Qty', 'Available_Qty', 'Cost_Per_Unit', 'Selling_Price', 'Asset_Valuation', 'Status'];
  const stockRows = INITIAL_INVENTORY.map((i) => [
    i.code,
    i.name,
    i.category,
    i.qtyOnHand,
    i.qtyAvailable,
    i.unitCost,
    i.sellingPrice,
    i.totalAssetValue,
    i.stockHealth,
  ]);
  const stockWorksheet = XLSX.utils.aoa_to_sheet([stockHeaders, ...stockRows]);
  XLSX.utils.book_append_sheet(workbook, stockWorksheet, 'Stock_Valuation');

  XLSX.writeFile(workbook, 'Sage50_Siam_Cooling_Panel_2026Q3_DEMO.xlsx');
}

/**
 * Generates and downloads blank starter template (.xlsx)
 */
export function downloadBlankStarterTemplateExcel() {
  const headers = [
    'เลขที่ใบแจ้งหนี้ / Invoice_No',
    'วันที่เอกสาร / Date',
    'วันครบกำหนด / Due_Date',
    'ชื่อลูกค้า / Customer_Name',
    'พนักงานขาย / Sales_Rep',
    'หมวดหมู่สินค้า / Category',
    'รหัสสินค้า / Item_Code',
    'รายละเอียดสินค้า / Description',
    'จำนวน / Quantity',
    'ราคาต่อหน่วย / Unit_Price',
    'ยอดขายสุทธิ / Net_Amount',
    'ต้นทุนขาย / COGS',
    'ยอดรับชำระแล้ว / Paid_Amount',
    'สถานะบิล / Status (Paid/Pending/Overdue)',
  ];

  const sampleExampleRow = [
    'INV-2026-001',
    '2026-01-15',
    '2026-02-15',
    'บริษัท ตัวอย่าง จำกัด',
    'สมชาย ฝ่ายขาย',
    'Sandwich Panel',
    'PIR-075-CB',
    'แผ่นฉนวน PIR 75mm สำหรับห้องเย็น (ตร.ม.)',
    100,
    1150,
    115000,
    72000,
    115000,
    'Paid',
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleExampleRow]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Sales_Invoices');
  XLSX.writeFile(workbook, 'FinFlow_Import_Template_Blank.xlsx');
}
