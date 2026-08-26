import * as XLSX from 'xlsx';
import { SIAM_COLD_ROOM_CUSTOMERS, SIAM_COLD_ROOM_INVENTORY, SIAM_COLD_ROOM_INVOICES } from '../data/sampleSage50Data';

/**
 * Generates and triggers download of the authentic Thai Cold Storage Wall & Panel Company Excel workbook.
 * Contains 3 fully structured sheets:
 * 1. Invoices_Line_Items (ใบแจ้งหนี้/ส่งมอบงานผนังห้องเย็น)
 * 2. Customer_Master (รายชื่อโรงงานและลูกค้าธุรกิจห้องเย็น)
 * 3. Inventory_Stock (สต็อกแผ่นฉนวน PIR, ใยหิน, ประตู และอุปกรณ์)
 */
export function downloadColdRoomExcelTemplate() {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Invoices
  const invoicesData = SIAM_COLD_ROOM_INVOICES.map((inv) => ({
    'Project_Invoice_No': inv.invoiceNo,
    'Billing_Date': inv.date,
    'Due_Date': inv.dueDate,
    'Customer_Company_Name': inv.customerName,
    'Project_Sales_Engineer': inv.salesRep,
    'Product_Group': inv.category,
    'Item_SKU_Code': inv.itemCode,
    'Material_Description': inv.itemDescription,
    'Quantity_SQM_Units': inv.quantity,
    'Unit_Price_THB': inv.unitPrice,
    'Subtotal_THB': inv.subtotal,
    'VAT_7_Pct_THB': inv.tax,
    'Net_Sales_Amount': inv.netAmount,
    'COGS_Cost_Amount': inv.cogs,
    'Gross_Profit_THB': inv.grossProfit,
    'Gross_Margin_Pct': `${inv.marginPct}%`,
    'Paid_Amount_THB': inv.paidAmount,
    'Outstanding_THB': inv.outstandingAmount,
    'Payment_Status': inv.status,
    'Overdue_Days': inv.overdueDays,
  }));
  const wsInvoices = XLSX.utils.json_to_sheet(invoicesData);
  XLSX.utils.book_append_sheet(workbook, wsInvoices, 'Invoices_Line_Items');

  // Sheet 2: Customers
  const customerData = SIAM_COLD_ROOM_CUSTOMERS.map((c) => ({
    'Customer_Code': c.code,
    'Company_Name': c.name,
    'Industry_Group': c.group,
    'Credit_Limit_THB': c.creditLimit,
    'Assigned_Engineer': c.salesRep,
    'Contact_Person': c.contactPerson,
    'Email': c.email,
    'Phone': c.phone,
    'Account_Status': c.status,
  }));
  const wsCustomers = XLSX.utils.json_to_sheet(customerData);
  XLSX.utils.book_append_sheet(workbook, wsCustomers, 'Customer_Master');

  // Sheet 3: Stock
  const stockData = SIAM_COLD_ROOM_INVENTORY.map((st) => ({
    'Item_Code': st.code,
    'Material_Name': st.name,
    'Category': st.category,
    'Quantity_On_Hand': st.qtyOnHand,
    'Available_Stock': st.qtyAvailable,
    'Reserved_Projects': st.qtyReserved,
    'Unit_Cost_THB': st.unitCost,
    'Selling_Price_THB': st.sellingPrice,
    'Total_Asset_Value_THB': st.totalAssetValue,
    'Reorder_Point': st.reorderPoint,
    'Stock_Health_Status': st.stockHealth,
  }));
  const wsStock = XLSX.utils.json_to_sheet(stockData);
  XLSX.utils.book_append_sheet(workbook, wsStock, 'Stock_Valuation');

  // Trigger download
  XLSX.writeFile(workbook, 'Sage50_Siam_Cooling_Panel_ColdRoom_Demo.xlsx');
}
