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

export function downloadBlankStarterTemplate() {
  const blankHeaders = [
    {
      'Invoice Number / เลขที่เอกสาร': 'INV-2026-001',
      'Date / วันที่': '2026-08-01',
      'Due Date / วันครบกำหนด': '2026-08-31',
      'Customer ID / รหัสลูกค้า': 'CUST-001',
      'Customer Name / ชื่อลูกค้า': 'ตัวอย่าง บจก. ลูกค้าเอเปกซ์',
      'Sales Rep / พนักงานขาย': 'สมศักดิ์ ช่างทอง',
      'Item Code / รหัสสินค้า': 'PIR-75MM',
      'Description / รายละเอียดสินค้า': 'แผ่นฉนวนกันความร้อน PIR หนา 75 มม.',
      'Category / หมวดหมู่': 'Insulated Panels',
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
