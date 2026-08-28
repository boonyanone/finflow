import * as XLSX from 'xlsx';
import { ColumnMapping, InvoiceRecord } from '../types';

export interface ParsedWorkbook {
  fileName: string;
  sheetNames: string[];
  selectedSheet: string;
  rawHeaders: string[];
  rawRows: any[];
  mappings: ColumnMapping[];
  validation: {
    totalRows: number;
    validRows: number;
    warningRows: number;
    errorRows: number;
    qualityScore: number;
    errors: string[];
    warnings: string[];
  };
}

// Canonical target fields dictionary
export const TARGET_FIELDS: { key: string; label: string; required: boolean; sample: string }[] = [
  { key: 'invoiceNo', label: 'Invoice No (เลขที่บิล)', required: true, sample: 'INV-2026-001' },
  { key: 'date', label: 'Invoice Date (วันที่เอกสาร)', required: true, sample: '2026-06-15' },
  { key: 'dueDate', label: 'Due Date (วันครบกำหนด)', required: false, sample: '2026-07-15' },
  { key: 'customerName', label: 'Customer Name (ชื่อลูกค้า)', required: true, sample: 'Bangkok Design Hub' },
  { key: 'salesRep', label: 'Sales Rep (พนักงานขาย)', required: false, sample: 'Alex Wong' },
  { key: 'category', label: 'Category (หมวดหมู่สินค้า)', required: false, sample: 'Furniture' },
  { key: 'itemCode', label: 'Item Code (รหัสสินค้า)', required: false, sample: 'FUR-001' },
  { key: 'itemDescription', label: 'Description (รายละเอียดสินค้า)', required: true, sample: 'Ergonomic Office Chair' },
  { key: 'quantity', label: 'Quantity (จำนวน)', required: true, sample: '25' },
  { key: 'unitPrice', label: 'Unit Price (ราคาต่อหน่วย)', required: false, sample: '3,990' },
  { key: 'netAmount', label: 'Net Sales (ยอดขายสุทธิ)', required: true, sample: '99,750' },
  { key: 'cogs', label: 'COGS (ต้นทุนขาย)', required: false, sample: '61,250' },
  { key: 'paidAmount', label: 'Paid Amount (ยอดชำระแล้ว)', required: false, sample: '99,750' },
  { key: 'status', label: 'Status (สถานะการชำระ)', required: false, sample: 'Paid / Pending / Overdue' },
];

export async function parseExcelFile(file: File): Promise<ParsedWorkbook> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames;
  const selectedSheet = sheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[selectedSheet];

  const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const rawHeaders: string[] = (jsonRows[0] || []).map((h: any) => String(h || '').trim());
  const dataRows = jsonRows.slice(1).filter((r: any[]) => r && r.length > 0 && r.some((c) => c !== undefined && c !== null && c !== ''));

  // Smart Auto-Mapping
  const mappings = autoMapColumns(rawHeaders, dataRows[0] || []);

  // Validation
  const validation = validateDataset(rawHeaders, dataRows, mappings);

  return {
    fileName: file.name,
    sheetNames,
    selectedSheet,
    rawHeaders,
    rawRows: dataRows,
    mappings,
    validation,
  };
}

export function autoMapColumns(headers: string[], firstRow: any[]): ColumnMapping[] {
  return headers.map((header, idx) => {
    const rawH = String(header || '').trim();
    const h = rawH.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sampleVal = firstRow[idx] !== undefined ? String(firstRow[idx]) : '';
    let target = 'ignore';
    let confidence = 50;

    // Check Thai keywords first
    if (/เลขที่|เอกสาร|บิล|ใบแจ้งหนี้|inv/i.test(rawH) && !/วันที่/i.test(rawH)) {
      target = 'invoiceNo';
      confidence = 99;
    } else if (/ครบกำหนด|due/i.test(rawH)) {
      target = 'dueDate';
      confidence = 98;
    } else if (/วันที่|date/i.test(rawH) && !/ครบกำหนด/i.test(rawH)) {
      target = 'date';
      confidence = 98;
    } else if (/ลูกค้า|customer|client/i.test(rawH) && !/รหัสลูกค้า/i.test(rawH)) {
      target = 'customerName';
      confidence = 98;
    } else if (/พนักงานขาย|ผู้แทนขาย|เซล|sales|rep|seller/i.test(rawH)) {
      target = 'salesRep';
      confidence = 96;
    } else if (/หมวดหมู่|กลุ่มสินค้า|category|group/i.test(rawH)) {
      target = 'category';
      confidence = 95;
    } else if (/รหัสสินค้า|sku|item\s*code|part\s*no/i.test(rawH)) {
      target = 'itemCode';
      confidence = 98;
    } else if (/ชื่อสินค้า|รายละเอียด|รายการ|description|item\s*name/i.test(rawH)) {
      target = 'itemDescription';
      confidence = 96;
    } else if (/จำนวน|ปริมาณ|qty|quantity/i.test(rawH)) {
      target = 'quantity';
      confidence = 98;
    } else if (/ราคาต่อหน่วย|ราคา\/หน่วย|unit\s*price|price/i.test(rawH)) {
      target = 'unitPrice';
      confidence = 95;
    } else if (/ยอดรวม|ยอดขาย|มูลค่า|net|amount|total|revenue/i.test(rawH) && !/ต้นทุน/i.test(rawH) && !/ชำระ/i.test(rawH)) {
      target = 'netAmount';
      confidence = 98;
    } else if (/ต้นทุน|cogs|cost/i.test(rawH)) {
      target = 'cogs';
      confidence = 98;
    } else if (/ชำระแล้ว|รับชำระ|paid/i.test(rawH)) {
      target = 'paidAmount';
      confidence = 95;
    } else if (/สถานะ|status|state/i.test(rawH)) {
      target = 'status';
      confidence = 95;
    }
    // Fallback to English standard substring checks
    else if (h.includes('inv') && (h.includes('no') || h.includes('num') || h.includes('id') || h.includes('ref') || h.includes('code'))) {
      target = 'invoiceNo';
      confidence = 98;
    } else if (h.includes('date') && !h.includes('due')) {
      target = 'date';
      confidence = 95;
    } else if (h.includes('due') || h.includes('expire')) {
      target = 'dueDate';
      confidence = 95;
    } else if (h.includes('cust') || h.includes('client') || h.includes('account')) {
      target = 'customerName';
      confidence = 96;
    } else if (h.includes('rep') || h.includes('seller') || h.includes('salesman') || h.includes('agent')) {
      target = 'salesRep';
      confidence = 92;
    } else if (h.includes('cat') || h.includes('group') || h.includes('type')) {
      target = 'category';
      confidence = 90;
    } else if (h.includes('itemcode') || h.includes('sku') || h.includes('partno') || h.includes('prodid')) {
      target = 'itemCode';
      confidence = 95;
    } else if (h.includes('desc') || h.includes('item') || h.includes('name') || h.includes('product')) {
      target = 'itemDescription';
      confidence = 90;
    } else if (h.includes('qty') || h.includes('quantity') || h.includes('unit') || h.includes('amountqty')) {
      target = 'quantity';
      confidence = 95;
    } else if (h.includes('price') || h.includes('rate') || h.includes('unitprice')) {
      target = 'unitPrice';
      confidence = 90;
    } else if (h.includes('net') || h.includes('sales') || h.includes('total') || h.includes('amount') || h.includes('revenue')) {
      target = 'netAmount';
      confidence = 95;
    } else if (h.includes('cogs') || h.includes('cost') || h.includes('expense')) {
      target = 'cogs';
      confidence = 95;
    } else if (h.includes('paid') || h.includes('received')) {
      target = 'paidAmount';
      confidence = 90;
    } else if (h.includes('status') || h.includes('state')) {
      target = 'status';
      confidence = 90;
    }

    return {
      sourceColumn: header,
      targetField: target,
      sampleValue: sampleVal,
      status: target !== 'ignore' ? 'matched' : 'unmapped',
      confidence,
    };
  });
}

export function validateDataset(
  headers: string[],
  rows: any[],
  mappings: ColumnMapping[]
) {
  const errors: string[] = [];
  const warnings: string[] = [];
  let errorRows = 0;
  let warningRows = 0;

  const mappedTargets = new Set(mappings.map((m) => m.targetField));
  TARGET_FIELDS.filter((f) => f.required).forEach((req) => {
    if (!mappedTargets.has(req.key)) {
      errors.push(`คอลัมน์จำเป็น "${req.label}" ยังไม่ได้ถูกจับคู่ (Unmapped Required Field)`);
    }
  });

  const invoiceNoIdx = mappings.findIndex((m) => m.targetField === 'invoiceNo');
  const netAmountIdx = mappings.findIndex((m) => m.targetField === 'netAmount');

  const seenInvoices = new Set<string>();

  rows.forEach((row, rIdx) => {
    let rowHasError = false;
    let rowHasWarning = false;

    if (invoiceNoIdx >= 0) {
      const val = row[invoiceNoIdx];
      if (!val) {
        rowHasError = true;
      } else {
        const invStr = String(val);
        if (seenInvoices.has(invStr)) {
          // Warning for duplicate line items of same invoice
          rowHasWarning = true;
        }
        seenInvoices.add(invStr);
      }
    }

    if (netAmountIdx >= 0) {
      const amt = Number(row[netAmountIdx]);
      if (isNaN(amt)) {
        rowHasError = true;
      } else if (amt < 0) {
        rowHasWarning = true;
        warnings.push(`แถวที่ ${rIdx + 2}: พบยอดขายติดลบ (Credit Note/ใบลดหนี้) ฿${amt}`);
      }
    }

    if (rowHasError) errorRows++;
    else if (rowHasWarning) warningRows++;
  });

  const total = rows.length || 1;
  const validRows = total - errorRows;
  const qualityScore = Math.max(0, Math.min(100, Math.round(((validRows - warningRows * 0.2) / total) * 100 * 10) / 10));

  return {
    totalRows: rows.length,
    validRows,
    warningRows,
    errorRows,
    qualityScore,
    errors,
    warnings,
  };
}

export function transformToCanonical(
  rawHeaders: string[],
  rawRows: any[],
  mappings: ColumnMapping[],
  fileName: string
): InvoiceRecord[] {
  const mapIdx: Record<string, number> = {};
  mappings.forEach((m) => {
    if (m.targetField && m.targetField !== 'ignore') {
      const colIdx = rawHeaders.indexOf(m.sourceColumn);
      if (colIdx >= 0) {
        mapIdx[m.targetField] = colIdx;
      }
    }
  });

  return rawRows.map((row, idx) => {
    const invNo = mapIdx.invoiceNo !== undefined ? String(row[mapIdx.invoiceNo] || `INV-IMP-${idx + 1}`) : `INV-IMP-${idx + 1}`;
    
    // Parse Date
    let dateStr = '2026-06-01';
    if (mapIdx.date !== undefined && row[mapIdx.date]) {
      const d = row[mapIdx.date];
      if (d instanceof Date) {
        dateStr = d.toISOString().slice(0, 10);
      } else {
        dateStr = String(d).slice(0, 10);
      }
    }

    const custName = mapIdx.customerName !== undefined ? String(row[mapIdx.customerName] || 'General Customer') : 'General Customer';
    const repName = mapIdx.salesRep !== undefined ? String(row[mapIdx.salesRep] || 'Alex Wong') : 'Alex Wong';
    const category = mapIdx.category !== undefined ? String(row[mapIdx.category] || 'Furniture') : 'Furniture';
    const itemCode = mapIdx.itemCode !== undefined ? String(row[mapIdx.itemCode] || 'GEN-01') : 'GEN-01';
    const itemDesc = mapIdx.itemDescription !== undefined ? String(row[mapIdx.itemDescription] || 'Sage Product Item') : 'Sage Product Item';
    const qty = mapIdx.quantity !== undefined ? Number(row[mapIdx.quantity]) || 1 : 1;
    const net = mapIdx.netAmount !== undefined ? Number(row[mapIdx.netAmount]) || 10000 : 10000;
    const cogs = mapIdx.cogs !== undefined ? Number(row[mapIdx.cogs]) || Math.round(net * 0.58) : Math.round(net * 0.58);
    const unitPrice = mapIdx.unitPrice !== undefined ? Number(row[mapIdx.unitPrice]) || Math.round(net / (qty || 1)) : Math.round(net / (qty || 1));
    const paid = mapIdx.paidAmount !== undefined ? Number(row[mapIdx.paidAmount]) || 0 : (idx % 3 === 0 ? net : 0);

    const grossProfit = net - cogs;
    const marginPct = net > 0 ? Math.round((grossProfit / net) * 1000) / 10 : 0;
    const outstanding = Math.max(0, net - paid);

    let status: 'Paid' | 'Pending' | 'Overdue' = 'Pending';
    if (outstanding <= 0) status = 'Paid';
    else if (idx % 2 === 0) status = 'Overdue';

    // Period calculation
    const monthNum = parseInt(dateStr.split('-')[1] || '6', 10);
    const period = monthNum <= 3 ? 'q1' : monthNum <= 6 ? 'q2' : monthNum <= 9 ? 'q3' : 'q4';
    const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthThai = thaiMonths[monthNum - 1] || 'มิ.ย.';

    return {
      id: `IMP-${invNo}-${idx}`,
      invoiceNo: invNo,
      date: dateStr,
      dueDate: dateStr,
      customerId: `CUST-IMP-${(idx % 5) + 1}`,
      customerName: custName,
      salesRep: repName,
      category,
      itemCode,
      itemDescription: itemDesc,
      quantity: qty,
      unitPrice,
      subtotal: net,
      discount: 0,
      tax: Math.round(net * 0.07),
      netAmount: net,
      cogs,
      grossProfit,
      marginPct,
      paidAmount: paid,
      outstandingAmount: outstanding,
      status,
      overdueDays: status === 'Overdue' ? 45 : 0,
      period,
      month: monthThai,
      sourceFile: fileName,
      sourceSheet: 'ActiveSheet',
      sourceRow: idx + 2,
    };
  });
}
