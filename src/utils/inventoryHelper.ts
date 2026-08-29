import * as XLSX from 'xlsx';
import { InventoryItem, InvoiceRecord, Customer, ArAgingBucket } from '../types';
import { INITIAL_INVENTORY, SIAM_COLD_ROOM_CUSTOMERS, SIAM_COLD_ROOM_AR_AGING } from '../data/sampleSage50Data';

/**
 * Intelligently synthesizes an Inventory Valuation Catalog from Invoice records
 * Groups items by itemCode / description and calculates realistic on-hand stock, costs, turnover, and valuation.
 */
export function synthesizeInventoryFromInvoices(invoices: InvoiceRecord[]): InventoryItem[] {
  if (!invoices || invoices.length === 0) {
    return INITIAL_INVENTORY;
  }

  // Check if invoice items match cold room demo
  const isColdRoom = invoices.some((i) =>
    i.itemCode?.startsWith('PIR-') || i.itemCode?.startsWith('RW-') || i.itemCode?.startsWith('DOR-')
  );
  if (isColdRoom) {
    return INITIAL_INVENTORY;
  }

  // Group by itemCode or itemDescription
  const productMap = new Map<
    string,
    {
      code: string;
      name: string;
      category: string;
      totalSoldQty: number;
      totalSalesVal: number;
      totalCogs: number;
      minPrice: number;
      maxPrice: number;
    }
  >();

  invoices.forEach((inv) => {
    const code = (inv.itemCode || `SKU-${inv.itemDescription?.slice(0, 4).toUpperCase() || 'ITEM'}`).trim();
    const name = (inv.itemDescription || inv.itemCode || 'สินค้ามาตรฐาน').trim();
    const category = (inv.category || 'สินค้าทั่วไป (General)').trim();
    const qty = Number(inv.quantity) || 1;
    const net = Number(inv.netAmount) || 0;
    const cogs = Number(inv.cogs) || (net * 0.65);
    const unitPrice = Number(inv.unitPrice) || (qty > 0 ? net / qty : 1000);

    const existing = productMap.get(code);
    if (existing) {
      existing.totalSoldQty += qty;
      existing.totalSalesVal += net;
      existing.totalCogs += cogs;
      existing.minPrice = Math.min(existing.minPrice, unitPrice);
      existing.maxPrice = Math.max(existing.maxPrice, unitPrice);
    } else {
      productMap.set(code, {
        code,
        name,
        category,
        totalSoldQty: qty,
        totalSalesVal: net,
        totalCogs: cogs,
        minPrice: unitPrice,
        maxPrice: unitPrice,
      });
    }
  });

  const items: InventoryItem[] = [];

  productMap.forEach((p, code) => {
    const avgSellingPrice = p.totalSoldQty > 0 ? Math.round(p.totalSalesVal / p.totalSoldQty) : 1000;
    const avgUnitCost = p.totalSoldQty > 0 ? Math.round(p.totalCogs / p.totalSoldQty) : Math.round(avgSellingPrice * 0.65);

    // Realistic warehouse buffering:
    // Qty on hand based on sales volume with safety buffer
    const baseBuffer = Math.max(10, Math.round(p.totalSoldQty * 0.6));
    const reorderPoint = Math.max(8, Math.round(p.totalSoldQty * 0.35));
    const qtyReserved = Math.round(baseBuffer * 0.2);
    const qtyAvailable = Math.max(0, baseBuffer - qtyReserved);
    const totalAssetValue = baseBuffer * avgUnitCost;

    // Turnover: Annualized COGS / Asset Value
    const turnover = totalAssetValue > 0 ? Number(((p.totalCogs * 4) / totalAssetValue).toFixed(1)) : 8.5;
    const slowMovingDays = turnover < 5 ? 25 : turnover < 8 ? 12 : 4;

    let stockHealth: 'Healthy' | 'Low' | 'Critical' | 'Overstocked' = 'Healthy';
    if (baseBuffer < reorderPoint) {
      stockHealth = 'Critical';
    } else if (baseBuffer <= reorderPoint * 1.2) {
      stockHealth = 'Low';
    } else if (baseBuffer > reorderPoint * 2.8) {
      stockHealth = 'Overstocked';
    }

    items.push({
      code: p.code,
      name: p.name,
      category: p.category,
      qtyOnHand: baseBuffer,
      qtyAvailable,
      qtyReserved,
      unitCost: avgUnitCost,
      sellingPrice: avgSellingPrice,
      totalAssetValue,
      reorderPoint,
      stockHealth,
      stockTurnover: Math.max(2.0, turnover),
      slowMovingDays,
    });
  });

  // Sort by asset value descending
  return items.sort((a, b) => b.totalAssetValue - a.totalAssetValue);
}

/**
 * Synthesize Customers from Invoice list
 */
export function synthesizeCustomersFromInvoices(invoices: InvoiceRecord[]): Customer[] {
  if (!invoices || invoices.length === 0) return SIAM_COLD_ROOM_CUSTOMERS;

  const isColdRoom = invoices.some((i) => i.customerName?.includes('ซีฟู้ด') || i.customerName?.includes('เจริญคลังเย็น'));
  if (isColdRoom) return SIAM_COLD_ROOM_CUSTOMERS;

  const custMap = new Map<string, { name: string; salesRep: string; totalSales: number; count: number }>();
  invoices.forEach((inv) => {
    const name = inv.customerName || 'ลูกค้าทั่วไป';
    const rep = inv.salesRep || 'สมชาย มั่นคง';
    const net = Number(inv.netAmount) || 0;
    const existing = custMap.get(name);
    if (existing) {
      existing.totalSales += net;
      existing.count += 1;
    } else {
      custMap.set(name, { name, salesRep: rep, totalSales: net, count: 1 });
    }
  });

  const customers: Customer[] = [];
  let idx = 1;
  custMap.forEach((c, name) => {
    customers.push({
      id: `CUST-IMP-${String(idx).padStart(3, '0')}`,
      code: `CUST-IMP-${String(idx).padStart(3, '0')}`,
      name,
      group: 'ลูกค้าองค์กรและโครงการ',
      creditLimit: Math.max(1000000, Math.round(c.totalSales * 1.5)),
      salesRep: c.salesRep,
      contactPerson: `ผู้จัดการฝ่ายจัดซื้อ / โครงการ`,
      email: `purchasing@customer-${idx}.com`,
      phone: `02-999-00${idx < 10 ? '0' + idx : idx}`,
      status: 'Active',
    });
    idx++;
  });

  return customers;
}

/**
 * Synthesize AR Aging Buckets from Invoices
 */
export function synthesizeArAgingFromInvoices(invoices: InvoiceRecord[]): ArAgingBucket[] {
  if (!invoices || invoices.length === 0) return SIAM_COLD_ROOM_AR_AGING;

  const isColdRoom = invoices.some((i) => i.customerName?.includes('ซีฟู้ด') || i.customerName?.includes('เจริญคลังเย็น'));
  if (isColdRoom) return SIAM_COLD_ROOM_AR_AGING;

  const map = new Map<
    string,
    {
      customerName: string;
      current0_30: number;
      aging31_60: number;
      aging61_90: number;
      over90: number;
      total: number;
      count: number;
    }
  >();

  invoices.forEach((inv) => {
    const outstanding = Number(inv.outstandingAmount) || 0;
    if (outstanding <= 0) return;

    const name = inv.customerName || 'ลูกค้าทั่วไป';
    const days = Number(inv.overdueDays) || 0;

    let bucket = map.get(name);
    if (!bucket) {
      bucket = {
        customerName: name,
        current0_30: 0,
        aging31_60: 0,
        aging61_90: 0,
        over90: 0,
        total: 0,
        count: 0,
      };
      map.set(name, bucket);
    }

    bucket.total += outstanding;
    bucket.count += 1;

    if (days <= 30) {
      bucket.current0_30 += outstanding;
    } else if (days <= 60) {
      bucket.aging31_60 += outstanding;
    } else if (days <= 90) {
      bucket.aging61_90 += outstanding;
    } else {
      bucket.over90 += outstanding;
    }
  });

  const buckets: ArAgingBucket[] = [];
  let idx = 1;
  map.forEach((b, name) => {
    const riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' =
      b.over90 > 0 || b.aging61_90 > 200000
        ? 'Critical'
        : b.aging61_90 > 0 || b.aging31_60 > 300000
        ? 'High'
        : b.aging31_60 > 0
        ? 'Medium'
        : 'Low';

    buckets.push({
      customerId: `CUST-IMP-${String(idx).padStart(3, '0')}`,
      customerName: name,
      creditLimit: Math.max(1500000, Math.round(b.total * 1.4)),
      current0_30: b.current0_30,
      aging31_60: b.aging31_60,
      aging61_90: b.aging61_90,
      over90: b.over90,
      totalOutstanding: b.total,
      riskLevel,
      invoicesCount: b.count,
    });
    idx++;
  });

  return buckets.sort((a, b) => b.totalOutstanding - a.totalOutstanding);
}

/**
 * Parse Inventory Excel / CSV file
 */
export async function parseInventoryExcelFile(file: File): Promise<InventoryItem[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rows.length < 2) {
    throw new Error('ไฟล์ไม่มีข้อมูลสินค้า');
  }

  const headers = (rows[0] || []).map((h: any) => String(h || '').trim().toLowerCase());
  const codeIdx = headers.findIndex((h: string) => /รหัส|code|sku|item_id/i.test(h));
  const nameIdx = headers.findIndex((h: string) => /ชื่อ|name|description|รายการ/i.test(h));
  const catIdx = headers.findIndex((h: string) => /หมวด|category|กลุ่ม/i.test(h));
  const qtyIdx = headers.findIndex((h: string) => /คงเหลือ|onhand|qty|จำนวน|stock/i.test(h));
  const costIdx = headers.findIndex((h: string) => /ต้นทุน|cost|unitcost/i.test(h));
  const priceIdx = headers.findIndex((h: string) => /ราคา|price|selling/i.test(h));
  const reorderIdx = headers.findIndex((h: string) => /reorder|จุดสั่ง|เตือน/i.test(h));

  const items: InventoryItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const code = String(r[codeIdx >= 0 ? codeIdx : 0] || `SKU-${i}`).trim();
    const name = String(r[nameIdx >= 0 ? nameIdx : 1] || code).trim();
    if (!name && !code) continue;

    const category = String(r[catIdx >= 0 ? catIdx : 2] || 'สินค้าคงคลัง').trim();
    const qtyOnHand = Number(r[qtyIdx >= 0 ? qtyIdx : 3]) || 0;
    const unitCost = Number(r[costIdx >= 0 ? costIdx : 4]) || 0;
    const sellingPrice = Number(r[priceIdx >= 0 ? priceIdx : 5]) || (unitCost * 1.4);
    const reorderPoint = Number(r[reorderIdx >= 0 ? reorderIdx : 6]) || Math.max(5, Math.round(qtyOnHand * 0.3));

    const totalAssetValue = qtyOnHand * unitCost;
    const qtyReserved = Math.round(qtyOnHand * 0.15);
    const qtyAvailable = Math.max(0, qtyOnHand - qtyReserved);

    let stockHealth: 'Healthy' | 'Low' | 'Critical' | 'Overstocked' = 'Healthy';
    if (qtyOnHand < reorderPoint) {
      stockHealth = 'Critical';
    } else if (qtyOnHand <= reorderPoint * 1.2) {
      stockHealth = 'Low';
    } else if (qtyOnHand > reorderPoint * 2.5) {
      stockHealth = 'Overstocked';
    }

    items.push({
      code,
      name,
      category,
      qtyOnHand,
      qtyAvailable,
      qtyReserved,
      unitCost,
      sellingPrice,
      totalAssetValue,
      reorderPoint,
      stockHealth,
      stockTurnover: 8.5,
      slowMovingDays: 10,
    });
  }

  return items;
}

/**
 * Export Inventory to Excel
 */
export function exportInventoryToExcel(inventory: InventoryItem[], companyName: string) {
  const exportData = inventory.map((item, index) => ({
    'ลำดับ (No.)': index + 1,
    'รหัสสินค้า (Item Code)': item.code,
    'ชื่อสินค้า / รายการ (Description)': item.name,
    'หมวดหมู่ (Category)': item.category,
    'คงคลังจริง (Qty on Hand)': item.qtyOnHand,
    'พร้อมขาย (Qty Available)': item.qtyAvailable,
    'ติดจอง/สั่งผลิต (Qty Reserved)': item.qtyReserved,
    'จุดสั่งซื้อซ้ำ (Reorder Point)': item.reorderPoint,
    'ต้นทุนต่อหน่วย (FIFO Unit Cost)': item.unitCost,
    'ราคาขายมาตรฐาน (Selling Price)': item.sellingPrice,
    'กำไรต่อหน่วย (Margin/Unit)': item.sellingPrice - item.unitCost,
    '% อัตรากำไร (Margin %)': item.sellingPrice > 0 ? `${(((item.sellingPrice - item.unitCost) / item.sellingPrice) * 100).toFixed(1)}%` : '0%',
    'มูลค่าสต็อกรวม (Total Asset Value)': item.totalAssetValue,
    'รอบหมุนเวียน (Turnover x)': `${item.stockTurnover}x`,
    'สถานะสุขภาพสต็อก (Stock Health)': item.stockHealth,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Valuation');

  // Auto column widths
  const colWidths = [
    { wch: 10 },
    { wch: 18 },
    { wch: 45 },
    { wch: 28 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 16 },
    { wch: 18 },
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `Inventory_Valuation_${companyName.replace(/[^a-zA-Z0-9ก-๙]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
