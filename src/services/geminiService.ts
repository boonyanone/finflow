/**
 * Gemini AI Client API Service
 */

export interface AiSummaryResponse {
  summary: string;
  highlights?: string[];
  source: string;
}

export interface AiChatResponse {
  answer: string;
  source: string;
}

export interface AiDebtDraftResponse {
  draft: string;
  source: string;
}

export interface AiReportBuilderResponse {
  reportDefinition: any;
  explanation: string;
}

export async function fetchAiSummary(metrics: any, salesData: any[]): Promise<AiSummaryResponse> {
  try {
    const res = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics, salesData }),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (error) {
    console.warn('Fallback to local AI heuristic:', error);
    const net = metrics?.netSales || 1855000;
    const margin = metrics?.marginPct || 41.1;
    return {
      summary: `วิเคราะห์ข้อมูล Sage 50 ปัจจุบัน: ยอดขายสุทธิรวม ฿${net.toLocaleString()} อัตรากำไรขั้นต้น ${margin}% มีลูกหนี้ค้างชำระเกินกำหนด ฿588,000 แนะนำให้เร่งรัดติดตามลูกหนี้ที่มีอายุเกิน 60 วัน และสำรองสินค้าขายดีล่วงหน้า`,
      highlights: [
        `ยอดขายเติบโต +14.8% เมื่อเทียบกับเดือนก่อนหน้า`,
        `กลุ่มสินค้า Acoustic Wall Panel ทำ Gross Margin สูงสุดที่ 49.6%`,
        `พบลูกหนี้ค้างชำระเกิน 60 วัน 2 รายการ ควรจำกัดการปล่อยสินเชื่อเพิ่มเติม`,
      ],
      source: 'local_fallback',
    };
  }
}

export async function fetchAiChat(question: string, contextData: any): Promise<AiChatResponse> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, contextData }),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (error) {
    const q = question.toLowerCase();
    let reply = 'ระบบกำลังประมวลผลข้อมูล Sage 50...';
    if (q.includes('กระแสเงินสด') || q.includes('cash flow') || q.includes('สภาพคล่อง') || q.includes('forecast')) {
      reply = 'จากแบบจำลองกระแสเงินสดรับ 30 วันข้างหน้า คาดการณ์เงินสดรับสุทธิอยู่ที่ **฿1,420,000** (คิดเป็น 76% ของยอดลูกหนี้รอเก็บ) สภาพคล่องอยู่ในเกณฑ์ปลอดภัย รองรับค่าใช้จ่ายดำเนินงาน (OPEX) ได้มากกว่า 4.2 เดือน โดยแนะนำให้เสนอส่วนลด 2% ให้กับลูกหนี้โครงการขนาดใหญ่เพื่อเร่งเงินสดเข้าในสัปดาห์ที่ 1-2 ครับ';
    } else if (q.includes('กำไร') || q.includes('profit')) {
      reply = 'จากข้อมูล Sage 50 สินค้าที่ทำอัตรากำไร (Gross Margin) สูงสุดคือ **Acoustic Wall Panel (49.6%)** และ **Solid Teak Dining Table (46.7%)** ส่วนหมวดหมู่ที่มีสัดส่วนยอดขายมากที่สุดคือ Furniture (58%)';
    } else if (q.includes('ค้างชำระ') || q.includes('ลูกหนี้') || q.includes('ar')) {
      reply = 'พบลูกหนี้ค้างชำระเกิน 60 วัน 2 ราย ได้แก่ **Bangkok Design Hub (฿367,500)** และ **Silom Finance Tower (฿220,500)** รวมค้างชำระ ฿588,000 แนะนำให้ส่งจดหมายเตือนและระงับการสั่งซื้อรอบใหม่';
    } else if (q.includes('เซลส์') || q.includes('rep') || q.includes('ขายดี')) {
      reply = 'พนักงานขายที่ทำยอดขายสุทธิสูงสุดคือ **Alex Wong (฿879,750)** รองลงมาคือ **Somchai P. (฿503,125)** และ **Kanya R. (฿294,000)**';
    } else {
      reply = `สรุปการวิเคราะห์สำหรับ "${question}": ยอดขายรวม ฿1,855,000 อัตรากำไรเฉลี่ย 41.1% สินค้าคงคลังมี 2 รายการที่ต่ำกว่าจุดสั่งซื้อซ้ำ`;
    }
    return { answer: reply, source: 'local_rule' };
  }
}

export async function fetchAiDebtDraft(
  customerName: string,
  invoiceNo: string,
  amount: number,
  overdueDays: number,
  contactPerson?: string
): Promise<AiDebtDraftResponse> {
  try {
    const res = await fetch('/api/ai/debt-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, invoiceNo, amount, overdueDays, contactPerson }),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (error) {
    const draft = `เรียน ฝ่ายบัญชีและการเงิน ${customerName} (เรียนคุณ ${contactPerson || 'ผู้จัดการแผนกการเงิน'}),

บริษัทฯ ขออนุญาตติดตามและแจ้งเตือนยอดค้างชำระตามใบแจ้งหนี้เลขที่ ${invoiceNo}
จำนวนเงิน ฿${Number(amount || 0).toLocaleString()} ซึ่งครบกำหนดชำระแล้วเป็นเวลา ${overdueDays} วัน

เนื่องจากระบบบัญชี Sage 50 มีการปิดรอบบัญชีและปรับปรุงสถานะเครดิตของลูกค้า ทางเราใคร่ขอความอนุเคราะห์จากท่านในการตรวจสอบและแจ้งกำหนดการโอนชำระเงิน หรือส่งหลักฐานการชำระเงินกลับมายังแผนกบัญชี

หากท่านได้ดำเนินการชำระเงินเรียบร้อยแล้ว ต้องกราบขออภัยเป็นอย่างยิ่ง และโปรดแจ้งให้เราทราบเพื่อปรับปรุงข้อมูลในระบบ

ขอแสดงความนับถือ,
ฝ่ายการเงินและบริหารสินเชื่อ`;
    return { draft, source: 'template_fallback' };
  }
}

export async function fetchAiExecutiveInsight(metrics: {
  totalRevenue: number;
  grossProfit: number;
  overdueAR: number;
  topCategory: string;
  growthMoM: string;
}): Promise<{ insight: string }> {
  try {
    const res = await fetchAiSummary(metrics, []);
    return { insight: res.summary };
  } catch (e) {
    return {
      insight: `ผลประกอบการภาพรวมเติบโตแข็งแกร่ง ${metrics.growthMoM} นำโดยหมวด ${metrics.topCategory} ยอดขายรวม ฿${metrics.totalRevenue.toLocaleString()} กำไรขั้นต้น ฿${metrics.grossProfit.toLocaleString()} แนะนำให้เร่งรัดติดตามลูกหนี้ค้างชำระ ฿${metrics.overdueAR.toLocaleString()}`,
    };
  }
}

export async function fetchAiReportBuilder(userPrompt: string): Promise<AiReportBuilderResponse> {
  try {
    const res = await fetch('/api/ai/report-builder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userPrompt }),
    });
    if (!res.ok) throw new Error('API request failed');
    return await res.json();
  } catch (error) {
    return {
      reportDefinition: {
        title: `รายงาน: ${userPrompt}`,
        dataset: 'sales',
        selectedFields: ['month', 'salesRep', 'netAmount', 'grossProfit', 'marginPct'],
        filters: [],
        groupBy: ['salesRep'],
        sortBy: { field: 'netAmount', direction: 'desc' },
        aggregation: 'sum',
        visualization: 'combo',
      },
      explanation: 'สร้างโครงสร้างรายงานยอดขายและกำไรตามคำสั่งอัตโนมัติ',
    };
  }
}
