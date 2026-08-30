import * as XLSX from 'xlsx';
import { INITIAL_INVOICES, INITIAL_CUSTOMERS, INITIAL_INVENTORY } from '../data/sampleSage50Data';

/**
 * Generate real downloadable Excel (.xlsx) files for testing import functionality
 */

export function downloadSage50DemoExcel() {
  const data = INITIAL_INVOICES.map((inv) => ({
    'Invoice Number': inv.invoiceNo,
    'Date': inv.date,
    'Due Date': inv.dueDate,
    'Customer ID': inv.customerId,
    'Customer Name': inv.customerName,
    'Sales Rep': inv.salesRep,
    'Item ID': inv.itemCode,
    'Item Description': inv.itemDescription,
    'Quantity': inv.quantity,
    'Unit Price': inv.unitPrice,
    'Amount': inv.netAmount,
    'Cost of Goods Sold': inv.cogs,
    'Gross Profit': inv.grossProfit,
    'Gross Margin %': inv.marginPct,
    'Amount Paid': inv.paidAmount,
    'Balance Due': inv.outstandingAmount,
    'Status': inv.status,
    'Category': inv.category,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sage50_Sales_AR');

  XLSX.writeFile(workbook, 'Sage50_Sample_Invoices_AR.xlsx');
}

export function downloadExpressDemoExcel() {
  const data = INITIAL_INVOICES.map((inv) => ({
    'เลขที่เอกสาร': inv.invoiceNo,
    'วันที่เอกสาร': inv.date,
    'วันครบกำหนด': inv.dueDate,
    'รหัสลูกค้า': inv.customerId,
    'ชื่อลูกค้า': inv.customerName,
    'พนักงานขาย': inv.salesRep,
    'รหัสสินค้า': inv.itemCode,
    'ชื่อสินค้า/รายการ': inv.itemDescription,
    'หมวดหมู่': inv.category,
    'จำนวน': inv.quantity,
    'ราคาต่อหน่วย': inv.unitPrice,
    'ยอดรวมเงิน': inv.netAmount,
    'ต้นทุนขาย': inv.cogs,
    'กำไรขั้นต้น': inv.grossProfit,
    'อัตรากำไร%': inv.marginPct,
    'ยอดชำระแล้ว': inv.paidAmount,
    'ยอดคงค้าง': inv.outstandingAmount,
    'สถานะบิล': inv.status === 'Paid' ? 'ชำระแล้ว' : inv.status === 'Pending' ? 'รอชำระ' : 'เกินกำหนดชำระ',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'รายงานยอดขายและลูกหนี้_Express');

  XLSX.writeFile(workbook, 'Express_Accounting_Sample_Data.xlsx');
}

export function downloadFlowAccountDemoExcel() {
  const data = INITIAL_INVOICES.map((inv) => ({
    'เลขที่ใบแจ้งหนี้/ใบเสร็จ': inv.invoiceNo,
    'วันที่ออกเอกสาร': inv.date,
    'วันครบกำหนดชำระ': inv.dueDate,
    'ชื่อคู่ค้า/ลูกค้า': inv.customerName,
    'เลขประจำตัวผู้เสียภาษี': '010555800' + Math.floor(1000 + Math.random() * 9000),
    'พนักงานขาย': inv.salesRep,
    'รหัสรายการ': inv.itemCode,
    'ชื่อรายการสินค้า/บริการ': inv.itemDescription,
    'หมวดหมู่': inv.category,
    'จำนวน': inv.quantity,
    'ราคาต่อหน่วย (บาท)': inv.unitPrice,
    'มูลค่าก่อนภาษี (THB)': inv.netAmount,
    'ภาษีมูลค่าเพิ่ม 7%': Math.round(inv.netAmount * 0.07),
    'ยอดรวมทั้งสิ้น': Math.round(inv.netAmount * 1.07),
    'ต้นทุนขาย (COGS)': inv.cogs,
    'ยอดชำระแล้ว': inv.paidAmount,
    'ยอดค้างรับ': inv.outstandingAmount,
    'สถานะเอกสาร': inv.status === 'Paid' ? 'เก็บเงินแล้ว' : inv.status === 'Pending' ? 'รอเก็บเงิน' : 'เลยกำหนดชำระ',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'FlowAccount_Sales_Report');

  XLSX.writeFile(workbook, 'FlowAccount_Sample_Invoices.xlsx');
}

export function downloadPeakEngineDemoExcel() {
  const data = INITIAL_INVOICES.map((inv) => ({
    'Document_No': inv.invoiceNo,
    'Issue_Date': inv.date,
    'Due_Date': inv.dueDate,
    'Contact_Code': inv.customerId,
    'Contact_Name': inv.customerName,
    'Sales_Person': inv.salesRep,
    'Product_Code': inv.itemCode,
    'Description': inv.itemDescription,
    'Product_Group': inv.category,
    'Qty': inv.quantity,
    'Price_Per_Unit': inv.unitPrice,
    'Subtotal_Amount': inv.netAmount,
    'COGS_Amount': inv.cogs,
    'Gross_Profit': inv.grossProfit,
    'Paid_Amount': inv.paidAmount,
    'Remaining_Balance': inv.outstandingAmount,
    'Payment_Status': inv.status,
    'Project_Code': inv.invoiceNo.startsWith('CR-') ? 'PRJ-COLD-ROOM' : 'PRJ-GENERAL',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PEAK_Sales_Journal');

  XLSX.writeFile(workbook, 'PEAK_Engine_Sample_Data.xlsx');
}

export function downloadMyAccountDemoExcel() {
  const data = INITIAL_INVOICES.map((inv) => ({
    'DocNo': inv.invoiceNo,
    'DocDate': inv.date,
    'DueDate': inv.dueDate,
    'CustCode': inv.customerId,
    'CustName': inv.customerName,
    'Salesman': inv.salesRep,
    'GoodCode': inv.itemCode,
    'GoodName': inv.itemDescription,
    'GoodGroup': inv.category,
    'Quantity': inv.quantity,
    'UnitPrice': inv.unitPrice,
    'NetSales': inv.netAmount,
    'CostAmount': inv.cogs,
    'GrossMargin': inv.grossProfit,
    'PaidAmt': inv.paidAmount,
    'ARBalance': inv.outstandingAmount,
    'BillStatus': inv.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'myAccount_Winspeed_Export');

  XLSX.writeFile(workbook, 'myAccount_Winspeed_Sample.xlsx');
}

export function downloadBlankStarterTemplate() {
  const blankHeaders = [
    {
      'Invoice Number / เลขที่เอกสาร': 'INV-2026-001',
      'Date / วันที่': '2026-08-01',
      'Due Date / วันครบกำหนด': '2026-08-31',
      'Customer ID / รหัสลูกค้า': 'CUST-001',
      'Customer Name / ชื่อลูกค้า': 'ตัวอย่าง บจก. ลูกค้าเอเปกซ์ มาร์เก็ตติ้ง',
      'Sales Rep / พนักงานขาย': 'สมศักดิ์ ช่างทอง',
      'Item Code / รหัสสินค้า': 'SKU-001',
      'Description / รายละเอียดสินค้า': 'สินค้าและบริการมาตรฐานสำหรับธุรกิจ SME',
      'Category / หมวดหมู่': 'General Trading',
      'Quantity / จำนวน': 100,
      'Unit Price / ราคาต่อหน่วย': 850,
      'Total Amount / ยอดขายสุทธิ': 85000,
      'Cost / ต้นทุนสินค้า': 49300,
      'Amount Paid / ยอดชำระแล้ว': 85000,
      'Balance Due / ยอดคงค้าง': 0,
      'Status / สถานะ': 'Paid',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(blankHeaders);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_เริ่มต้น');

  XLSX.writeFile(workbook, 'FinFlow_BI_Starter_Template.xlsx');
}

export function downloadInventoryDemoExcel() {
  const data = INITIAL_INVENTORY.map((item) => ({
    'Item Code': item.code,
    'Description': item.name,
    'Category': item.category,
    'Quantity On Hand': item.qtyOnHand,
    'Available Quantity': item.qtyAvailable,
    'Reserved Quantity': item.qtyReserved,
    'Average Cost': item.unitCost,
    'Selling Price': item.sellingPrice,
    'Total Asset Value': item.totalAssetValue,
    'Reorder Point': item.reorderPoint,
    'Stock Status': item.stockHealth,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory_Valuation');

  XLSX.writeFile(workbook, 'Inventory_Stock_Valuation_Sample.xlsx');
}
