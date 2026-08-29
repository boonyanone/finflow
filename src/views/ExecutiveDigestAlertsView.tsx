import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Copy,
  Printer,
  Download,
  Share2,
  Send,
  Sparkles,
  Bot,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Mail,
  Zap,
  Info,
  Calendar,
  Eye,
  X,
  Layers,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  InvoiceRecord,
  Customer,
  InventoryItem,
  SmartAlertRule,
  ActiveFinancialAlert,
  ExecutiveDigestReport,
  AlertSeverity,
  AlertCategory,
} from '../types';

interface ExecutiveDigestAlertsViewProps {
  invoices: InvoiceRecord[];
  customers: Customer[];
  inventory: InventoryItem[];
  onOpenDebtDraft?: (customer: Customer, invoiceNo: string, amount: number, overdueDays: number) => void;
  onOpenCopilot?: () => void;
  companyName?: string;
}

export const ExecutiveDigestAlertsView: React.FC<ExecutiveDigestAlertsViewProps> = ({
  invoices,
  customers,
  inventory,
  onOpenDebtDraft,
  onOpenCopilot,
  companyName = 'สยาม ลิฟวิ่ง ดีไซน์ จำกัด (Siam Living Design Co., Ltd.)',
}) => {
  // Navigation Tabs: 'alerts' (Smart Alerts & Rules) | 'digest' (Executive Digest Studio)
  const [activeTab, setActiveTab] = useState<'alerts' | 'digest'>('alerts');

  // 1. Initial Smart Alert Rules
  const initialRules: SmartAlertRule[] = [
    {
      id: 'rule-ar-30',
      name: 'ลูกหนี้ค้างชำระเกิน 30 วัน (A/R Overdue Warning)',
      category: 'ar_overdue',
      description: 'แจ้งเตือนทันทีเมื่อมีอินวอยซ์ค้างชำระเกินกว่า 30 วัน เพื่อเร่งรัดเงินสดเข้าบริษัท',
      severity: 'warning',
      thresholdValue: 30,
      unit: 'days',
      enabled: true,
      notifyChannels: ['in_app', 'line_webhook', 'email'],
      lastTriggeredAt: '2026-08-28 08:30',
      triggeredCount: 2,
    },
    {
      id: 'rule-credit-limit',
      name: 'ยอดหนี้ค้างใกล้เต็มวงเงิน หรือติด Credit Hold',
      category: 'credit_limit',
      description: 'แจ้งเตือนเมื่อลูกหนี้มียอดค้างชำระสะสมสูง หรือติดสถานะระงับเครดิต (Credit Hold)',
      severity: 'critical',
      thresholdValue: 80,
      unit: 'percent',
      enabled: true,
      notifyChannels: ['in_app', 'email'],
      lastTriggeredAt: '2026-08-27 15:45',
      triggeredCount: 1,
    },
    {
      id: 'rule-margin-low',
      name: 'อัตรากำไรขั้นต้นต่ำกว่าเกณฑ์ (<36%)',
      category: 'margin_drop',
      description: 'ตรวจจับรายการขายสินค้าหรืองานโครงการที่มี Gross Margin ต่ำกว่า 36%',
      severity: 'warning',
      thresholdValue: 36,
      unit: 'percent',
      enabled: true,
      notifyChannels: ['in_app'],
      lastTriggeredAt: '2026-08-26 11:20',
      triggeredCount: 3,
    },
    {
      id: 'rule-stock-reorder',
      name: 'สต็อกต่ำกว่าจุดสั่งผลิต/สั่งซื้อ (Reorder Point)',
      category: 'inventory_deadstock',
      description: 'แจ้งเตือนเมื่อแผ่นฉนวนหรืออุปกรณ์ห้องเย็นคงเหลือต่ำกว่าเกณฑ์ความปลอดภัย',
      severity: 'warning',
      thresholdValue: 1,
      unit: 'times',
      enabled: true,
      notifyChannels: ['in_app', 'line_webhook'],
      lastTriggeredAt: '2026-08-28 09:00',
      triggeredCount: 3,
    },
    {
      id: 'rule-dead-stock',
      name: 'สินค้าสต็อกหมุนเวียนช้า (Slow-moving / Dead Stock)',
      category: 'inventory_deadstock',
      description: 'ตรวจจับสินค้าที่ไม่เคลื่อนไหวและมีมูลค่าทุนจมสูงกว่า ฿100,000',
      severity: 'info',
      thresholdValue: 12,
      unit: 'days',
      enabled: true,
      notifyChannels: ['in_app'],
      lastTriggeredAt: '2026-08-28 00:00',
      triggeredCount: 2,
    },
  ];

  const [rules, setRules] = useState<SmartAlertRule[]>(initialRules);
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMessage, setScanMessage] = useState<string>('');

  // Resolved Alerts State (tracking which alerts the user marked resolved)
  const [resolvedAlertIds, setResolvedAlertIds] = useState<Set<string>>(new Set());

  // Rule Edit Modal State
  const [editingRule, setEditingRule] = useState<SmartAlertRule | null>(null);

  // 2. Generate Real-time Active Alerts dynamically from data
  const activeAlerts: ActiveFinancialAlert[] = useMemo(() => {
    const alerts: ActiveFinancialAlert[] = [];

    // Check Rule 1: A/R Overdue (ค้างชำระเกินเกณฑ์วัน)
    const overdueRule = rules.find((r) => r.category === 'ar_overdue' && r.enabled);
    if (overdueRule) {
      invoices
        .filter((inv) => inv.overdueDays >= overdueRule.thresholdValue && inv.outstandingAmount > 0)
        .forEach((inv) => {
          alerts.push({
            id: `alert-ar-${inv.id}`,
            ruleId: overdueRule.id,
            ruleName: overdueRule.name,
            category: 'ar_overdue',
            severity: inv.overdueDays >= 60 ? 'critical' : 'warning',
            title: `หนี้ค้างชำระ ${inv.overdueDays} วัน: ${inv.customerName}`,
            detail: `อินวอยซ์ ${inv.invoiceNo} (ยอดสุทธิ ฿${inv.netAmount.toLocaleString()}) ค้างชำระมาแล้ว ${inv.overdueDays} วัน ยอดคงค้าง ฿${inv.outstandingAmount.toLocaleString()}`,
            entityName: inv.customerName,
            entityId: inv.customerId,
            metricValue: inv.overdueDays,
            metricLabel: `${inv.overdueDays} วัน`,
            impactAmount: inv.outstandingAmount,
            suggestedAction: 'ส่งหนังสือเตือนทวงถามหนี้ระดับทางการ และประสานงานฝ่ายจัดซื้อลูกค้า',
            actionType: 'draft_debt_letter',
            createdAt: 'วันนี้ 08:30',
            isRead: false,
            isResolved: resolvedAlertIds.has(`alert-ar-${inv.id}`),
          });
        });
    }

    // Check Rule 2: Credit Limit & Credit Hold Risk
    const creditRule = rules.find((r) => r.category === 'credit_limit' && r.enabled);
    if (creditRule) {
      customers.forEach((cust) => {
        const custInvoices = invoices.filter((i) => (i.customerId === cust.id || i.customerName === cust.name) && i.outstandingAmount > 0);
        const totalOutstanding = custInvoices.reduce((sum, i) => sum + i.outstandingAmount, 0);
        const creditUsagePct = cust.creditLimit > 0 ? (totalOutstanding / cust.creditLimit) * 100 : 0;

        if (cust.status === 'Credit Hold' && totalOutstanding > 0) {
          alerts.push({
            id: `alert-credit-hold-${cust.id}`,
            ruleId: creditRule.id,
            ruleName: 'ลูกหนี้สถานะระงับเครดิต (Credit Hold)',
            category: 'credit_limit',
            severity: 'critical',
            title: `ลูกค้าติดสถานะ Credit Hold: ${cust.name}`,
            detail: `มียอดค้างชำระค้างนาน ฿${totalOutstanding.toLocaleString()} (วงเงิน ฿${cust.creditLimit.toLocaleString()}) ระบบระงับการเปิดบิลใหม่`,
            entityName: cust.name,
            entityId: cust.id,
            metricValue: creditUsagePct,
            metricLabel: `Credit Hold`,
            impactAmount: totalOutstanding,
            suggestedAction: 'ระงับส่งมอบสินค้าล็อตใหม่จนกว่าจะได้รับชำระค่างวดค้างเดิม',
            actionType: 'hold_credit',
            createdAt: 'เมื่อวานนี้ 15:45',
            isRead: false,
            isResolved: resolvedAlertIds.has(`alert-credit-hold-${cust.id}`),
          });
        } else if (creditUsagePct >= creditRule.thresholdValue && totalOutstanding > 0) {
          alerts.push({
            id: `alert-credit-${cust.id}`,
            ruleId: creditRule.id,
            ruleName: creditRule.name,
            category: 'credit_limit',
            severity: creditUsagePct >= 100 ? 'critical' : 'warning',
            title: `การใช้วงเงินเครดิตแตะ ${creditUsagePct.toFixed(0)}%: ${cust.name}`,
            detail: `ยอดค้างชำระ ฿${totalOutstanding.toLocaleString()} จากวงเงิน ฿${cust.creditLimit.toLocaleString()}`,
            entityName: cust.name,
            entityId: cust.id,
            metricValue: creditUsagePct,
            metricLabel: `${creditUsagePct.toFixed(0)}% วงเงิน`,
            impactAmount: totalOutstanding,
            suggestedAction: 'ตรวจสอบสถานะการเงินลูกค้าก่อนอนุมัติใบสั่งขาย (SO) ถัดไป',
            actionType: 'hold_credit',
            createdAt: 'เมื่อวานนี้ 15:45',
            isRead: false,
            isResolved: resolvedAlertIds.has(`alert-credit-${cust.id}`),
          });
        }
      });
    }

    // Check Rule 3: Low Margin Sales
    const marginRule = rules.find((r) => r.category === 'margin_drop' && r.enabled);
    if (marginRule) {
      invoices
        .filter((inv) => {
          const margin = inv.marginPct ?? (inv.cogs ? ((inv.netAmount - inv.cogs) / inv.netAmount) * 100 : 35);
          return margin < marginRule.thresholdValue && inv.netAmount > 200000;
        })
        .slice(0, 3)
        .forEach((inv) => {
          const margin = inv.marginPct ?? ((inv.netAmount - (inv.cogs || inv.netAmount * 0.65)) / inv.netAmount) * 100;
          alerts.push({
            id: `alert-margin-${inv.id}`,
            ruleId: marginRule.id,
            ruleName: marginRule.name,
            category: 'margin_drop',
            severity: margin < 30 ? 'critical' : 'warning',
            title: `อัตรากำไรต่ำกว่าเกณฑ์ (${margin.toFixed(1)}%): บิล ${inv.invoiceNo}`,
            detail: `ลูกค้า ${inv.customerName} รายการ "${inv.itemDescription}" ยอดขาย ฿${inv.netAmount.toLocaleString()} กำไรขั้นต้นเพียง ${margin.toFixed(1)}% (ต่ำกว่าเกณฑ์ ${marginRule.thresholdValue}%)`,
            entityName: inv.customerName,
            metricValue: margin,
            metricLabel: `${margin.toFixed(1)}% Margin`,
            impactAmount: inv.netAmount,
            suggestedAction: 'ตรวจสอบต้นทุนแผ่นฉนวน/ค่าติดตั้ง และทบทวนโครงสร้างส่วนลดกับเซลส์',
            actionType: 'review_margin',
            createdAt: '2 วันที่แล้ว',
            isRead: true,
            isResolved: resolvedAlertIds.has(`alert-margin-${inv.id}`),
          });
        });
    }

    // Check Rule 4: Stock Reorder / Critical Stockout Risk
    const criticalStockItems = inventory.filter(
      (item) => item.stockHealth === 'Critical' || (item.reorderPoint > 0 && item.qtyOnHand <= item.reorderPoint)
    );
    if (criticalStockItems.length > 0) {
      criticalStockItems.slice(0, 3).forEach((item) => {
        alerts.push({
          id: `alert-stock-reorder-${item.code}`,
          ruleId: 'rule-stock-reorder',
          ruleName: 'สต็อกต่ำกว่าจุดสั่งผลิต/สั่งซื้อ (Reorder Point)',
          category: 'inventory_deadstock',
          severity: 'warning',
          title: `สต็อกต่ำกว่าเกณฑ์สั่งผลิต: ${item.name}`,
          detail: `ปริมาณคงคลังเหลือ ${item.qtyOnHand.toLocaleString()} (จุดสั่งซื้อ ${item.reorderPoint.toLocaleString()}) มูลค่าทรัพย์สิน ฿${item.totalAssetValue.toLocaleString()}`,
          entityName: item.name,
          metricValue: item.qtyOnHand,
          metricLabel: `${item.qtyOnHand} คงคลัง`,
          impactAmount: item.totalAssetValue,
          suggestedAction: 'ออกใบสั่งซื้อวัตถุดิบ / สั่งผลิตเติมคลังด่วน เพื่อไม่ให้กระทบงานติดตั้งหน้างาน',
          actionType: 'liquidate_stock',
          createdAt: 'วันนี้ 09:00',
          isRead: false,
          isResolved: resolvedAlertIds.has(`alert-stock-reorder-${item.code}`),
        });
      });
    }

    // Check Rule 5: Dead Stock / Slow-moving Inventory
    const deadStockRule = rules.find((r) => r.category === 'inventory_deadstock' && r.enabled);
    if (deadStockRule) {
      inventory
        .filter((item) => (item.slowMovingDays >= 12 || item.stockHealth === 'Critical') && item.totalAssetValue >= 100000)
        .slice(0, 2)
        .forEach((item) => {
          alerts.push({
            id: `alert-stock-slow-${item.code}`,
            ruleId: deadStockRule.id,
            ruleName: deadStockRule.name,
            category: 'inventory_deadstock',
            severity: 'info',
            title: `สต็อกเคลื่อนไหวช้า: ${item.name}`,
            detail: `หมวดหมู่ ${item.category} คงคลัง ${item.qtyOnHand.toLocaleString()} ชิ้น มูลค่าทุนจม ฿${item.totalAssetValue.toLocaleString()} (Slow Days: ${item.slowMovingDays || 14} วัน)`,
            entityName: item.name,
            metricValue: item.slowMovingDays || 14,
            metricLabel: `${item.slowMovingDays || 14} วัน`,
            impactAmount: item.totalAssetValue,
            suggestedAction: 'เสนอขายพร้อมโปรโมชั่นโครงการหรือ Bundle ควบคู่สินค้าขายดี',
            actionType: 'liquidate_stock',
            createdAt: 'วันนี้ 00:00',
            isRead: true,
            isResolved: resolvedAlertIds.has(`alert-stock-slow-${item.code}`),
          });
        });
    }

    return alerts;
  }, [invoices, customers, inventory, rules, resolvedAlertIds]);

  // Filtered Alerts
  const filteredAlerts = useMemo(() => {
    return activeAlerts.filter((a) => {
      if (selectedSeverityFilter === 'all') return true;
      return a.severity === selectedSeverityFilter;
    });
  }, [activeAlerts, selectedSeverityFilter]);

  // Total At-Risk Capital
  const totalRiskCapital = useMemo(() => {
    return activeAlerts.filter((a) => !a.isResolved).reduce((sum, a) => sum + a.impactAmount, 0);
  }, [activeAlerts]);

  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical' && !a.isResolved).length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'warning' && !a.isResolved).length;

  // Toggle Alert Resolved
  const handleToggleResolve = (alertId: string) => {
    setResolvedAlertIds((prev) => {
      const next = new Set(prev);
      if (next.has(alertId)) next.delete(alertId);
      else next.add(alertId);
      return next;
    });
  };

  // Run Manual Scan Simulator
  const handleRunScan = () => {
    setIsScanning(true);
    setScanMessage('กำลังเชื่อมต่อฐานข้อมูลและตรวจสอบเงื่อนไขความเสี่ยง 5 ด้าน...');
    setTimeout(() => {
      setIsScanning(false);
      setScanMessage('การสแกนเสร็จสมบูรณ์! ข้อมูลอัปเดตตรงกับระบบบัญชีล่าสุด');
      setTimeout(() => setScanMessage(''), 4000);
    }, 1200);
  };

  // 3. Executive Digest Synthesis Data
  const [digestPeriod, setDigestPeriod] = useState<'weekly' | 'monthly' | 'risk_memo'>('weekly');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const digestReport: ExecutiveDigestReport = useMemo(() => {
    const totalRev = invoices.reduce((sum, i) => sum + i.netAmount, 0);
    const targetRev = totalRev > 0 ? Math.round(totalRev * 1.05 / 10000) * 10000 : 3700000;
    const totalCost = invoices.reduce((sum, i) => sum + (i.cogs || i.netAmount * 0.62), 0);
    const grossProfit = totalRev - totalCost;
    const grossMargin = totalRev > 0 ? (grossProfit / totalRev) * 100 : 38;

    const overdueInvoices = invoices.filter((i) => (i.overdueDays || 0) > 0 && (i.outstandingAmount || 0) > 0);
    const totalArOverdue = overdueInvoices.reduce((sum, i) => sum + (i.outstandingAmount || 0), 0);
    const criticalOverdue = invoices.filter((i) => (i.overdueDays || 0) >= 30 && (i.outstandingAmount || 0) > 0);

    const sortedDebtors = [...overdueInvoices].sort((a, b) => (b.outstandingAmount || 0) - (a.outstandingAmount || 0));
    const topDebtor = sortedDebtors[0] || {
      customerName: 'บจก. เบทาฟู้ดส์ โพลทรี่ โพรเซสซิ่ง',
      outstandingAmount: 368800,
    };

    const deadStockTotal = inventory
      .filter((i) => (i.slowMovingDays && i.slowMovingDays >= 10) || i.stockHealth === 'Critical')
      .reduce((sum, i) => sum + (i.totalAssetValue || i.unitCost * i.qtyOnHand || 0), 0);

    // Dynamic Top Sales Rep
    const repSales: Record<string, number> = {};
    invoices.forEach((inv) => {
      if (inv.salesRep) {
        repSales[inv.salesRep] = (repSales[inv.salesRep] || 0) + inv.netAmount;
      }
    });
    const topRepEntry = Object.entries(repSales).sort((a, b) => b[1] - a[1])[0];
    const topRepName = topRepEntry ? topRepEntry[0] : 'สมชาย มั่นคง (วิศวกรฝ่ายขาย)';
    const topRepRevenue = topRepEntry ? topRepEntry[1] : 1580000;

    // Mode 1: Weekly Brief (Focus on Week 34 Pace & Velocity)
    if (digestPeriod === 'weekly') {
      const weeklyRev = Math.round(totalRev * 0.25);
      const weeklyTarget = Math.round(targetRev * 0.25);
      const weeklyProfit = Math.round(grossProfit * 0.25);
      const weeklyGM = 38.6;

      return {
        formatType: 'weekly',
        periodTitle: 'Weekly Executive Briefing (สัปดาห์ที่ 34/2026)',
        reportDate: '28 สิงหาคม 2026 (รอบสัปดาห์ที่ 34)',
        companyName,
        revenueTotal: weeklyRev,
        revenueTarget: weeklyTarget,
        revenueAttainmentPct: (weeklyRev / weeklyTarget) * 100,
        revenueGrowthPct: 18.2,
        grossProfitTotal: weeklyProfit,
        grossMarginPct: weeklyGM,
        cashClosingBalance: 1420000,
        cashRunwayWeeks: 12.5,
        totalArOverdue: topDebtor.outstandingAmount,
        criticalArCount: 1,
        topDebtorName: topDebtor.customerName,
        topDebtorAmount: topDebtor.outstandingAmount,
        deadStockValue: deadStockTotal,
        topRepName,
        topRepRevenue: Math.round(topRepRevenue * 0.35),
        kpiCards: [
          {
            label: 'ยอดขายปิดสัปดาห์นี้',
            value: `฿${weeklyRev.toLocaleString()}`,
            subtext: `${((weeklyRev / weeklyTarget) * 100).toFixed(1)}% ของเป้าสัปดาห์`,
            badgeColor: 'emerald',
          },
          {
            label: 'กำไรขั้นต้นสัปดาห์นี้ (GM)',
            value: `${weeklyGM.toFixed(1)}%`,
            subtext: `กำไร ฿${weeklyProfit.toLocaleString()}`,
            badgeColor: 'emerald',
          },
          {
            label: 'สภาพคล่องเงินสดในมือ',
            value: '฿1,420,000',
            subtext: 'รองรับ OPEX ได้ 12.5 สัปดาห์',
            badgeColor: 'blue',
          },
          {
            label: 'หนี้ครบกำหนดตามสัปดาห์นี้',
            value: `฿${topDebtor.outstandingAmount.toLocaleString()}`,
            subtext: '1 รายการวิกฤติต้องออกจดหมาย',
            badgeColor: 'rose',
          },
        ],
        aiExecutiveSummary: `ภาพรวมการดำเนินงานสัปดาห์ที่ 34 (22 - 28 ส.ค. 2026) ของ ${companyName}: ทำผลงานสัปดาห์นี้ได้ ฿${weeklyRev.toLocaleString()} บรรลุ ${((weeklyRev / weeklyTarget) * 100).toFixed(1)}% ของเป้าหมายสัปดาห์ โดยรักษาอัตรากำไรขั้นต้นเด่นที่ ${weeklyGM.toFixed(1)}% ทีมงานสามารถส่งมอบงานติดตั้งห้องเย็น 2 โครงการพร้อมวางบิล จุดเสี่ยงเร่งด่วนประจำสัปดาห์คือ ${topDebtor.customerName} มียอดค้างชำระครบ 63 วัน (฿${topDebtor.outstandingAmount.toLocaleString()}) ควรออกหนังสือเตือนทวงถามหนี้ทางการก่อนสิ้นสัปดาห์`,
        positiveHighlights: [
          `ท็อปเซลส์ประจำสัปดาห์ ${topRepName} ปิดดีลโครงการห้องเย็นล็อตใหม่ได้ ฿${Math.round(topRepRevenue * 0.35).toLocaleString()}`,
          `อัตรากำไรขั้นต้นสัปดาห์นี้ทำได้ ${weeklyGM.toFixed(1)}% สูงกว่าเกณฑ์ขั้นต่ำของบริษัท`,
          `ส่งมอบและตรวจรับงานติดตั้งแผ่นฉนวน 2 โครงการเสร็จสมบูรณ์พร้อมวางบิลรับเงิน`,
        ],
        redFlags: [
          `${topDebtor.customerName} ค้างชำระครบ 63 วัน ยอด ฿${topDebtor.outstandingAmount.toLocaleString()} ต้องส่งจดหมายเตือนทางการ`,
          `สต็อกแผ่นฉนวน PIR 100mm คงคลังเหลือต่ำกว่าจุดสั่งซื้อ (Reorder Point) เสี่ยงกระทบงานสัปดาห์หน้า`,
          `บิลงานติดตั้งบางรายการมีส่วนลดหน้างานสูงกว่าเกณฑ์ที่กำหนด ต้องขออนุมัติย้อนหลัง`,
        ],
        strategicRecommendations: [
          `เร่งออกหนังสือทวงถามหนี้และประสานงานฝ่ายจัดซื้อ ${topDebtor.customerName} ภายในวันศุกร์นี้`,
          `เปิด PO สั่งผลิตแผ่นฉนวน PIR 100mm เติมสต็อกฉุกเฉินเพื่อเตรียมส่งมอบงานโครงการสัปดาห์หน้า`,
          `ตรวจสอบใบเสนอราคา (Quotation) ของทีมขายก่อนส่งลูกค้าเพื่อควบคุมส่วนลดไม่เกิน 5%`,
        ],
      };
    }

    // Mode 2: Monthly Deck (Full Month Consolidated Board Report)
    if (digestPeriod === 'monthly') {
      return {
        formatType: 'monthly',
        periodTitle: 'Monthly Financial & Ops Performance (สิงหาคม 2026)',
        reportDate: '28 สิงหาคม 2026 (รอบเดือน สิงหาคม 2026)',
        companyName,
        revenueTotal: totalRev,
        revenueTarget: targetRev,
        revenueAttainmentPct: targetRev > 0 ? (totalRev / targetRev) * 100 : 100,
        revenueGrowthPct: 14.8,
        grossProfitTotal: grossProfit,
        grossMarginPct: grossMargin,
        cashClosingBalance: 1420000,
        cashRunwayWeeks: 12.5,
        totalArOverdue,
        criticalArCount: criticalOverdue.length,
        topDebtorName: topDebtor.customerName,
        topDebtorAmount: topDebtor.outstandingAmount,
        deadStockValue: deadStockTotal,
        topRepName,
        topRepRevenue,
        kpiCards: [
          {
            label: 'ยอดขายรวมทั้งเดือนเทียบเป้า',
            value: `฿${totalRev.toLocaleString()}`,
            subtext: `${((totalRev / targetRev) * 100).toFixed(1)}% ของเป้าหมายประจำเดือน`,
            badgeColor: 'emerald',
          },
          {
            label: 'อัตรากำไรขั้นต้น (GM เฉลี่ย)',
            value: `${grossMargin.toFixed(1)}%`,
            subtext: `กำไร ฿${grossProfit.toLocaleString()}`,
            badgeColor: 'emerald',
          },
          {
            label: 'กระแสเงินสดคงเหลือสะสม',
            value: '฿1,420,000',
            subtext: 'Runway 12.5 สัปดาห์ (>3 เดือน)',
            badgeColor: 'blue',
          },
          {
            label: 'ลูกหนี้ค้างชำระรวม >30 วัน',
            value: `฿${totalArOverdue.toLocaleString()}`,
            subtext: `${criticalOverdue.length} รายการเฝ้าระวัง`,
            badgeColor: 'rose',
          },
        ],
        aiExecutiveSummary: `ภาพรวมผลการดำเนินงานประจำเดือนสิงหาคม 2026 ของ ${companyName}: มียอดขายรวม ฿${totalRev.toLocaleString()} บรรลุ ${((totalRev / targetRev) * 100).toFixed(1)}% ของเป้าหมายประจำเดือน รักษาอัตรากำไรขั้นต้นเฉลี่ยที่ ${grossMargin.toFixed(1)}% ด้านกระแสเงินสดหมุนเวียนมีสภาพคล่อง ฿1.42M รองรับการดำเนินงานได้นานกว่า 12 สัปดาห์ อย่างไรก็ตามมียอดลูกหนี้ค้างชำระสะสมรวม ฿${totalArOverdue.toLocaleString()} (ลูกหนี้เฝ้าระวังสูงสุดคือ ${topDebtor.customerName}) ซึ่งควรเร่งรัดติดตามก่อนปิดงวดบัญชีสิ้นเดือนเพื่อรักษา Cash Conversion Cycle`,
        positiveHighlights: [
          `รายได้สะสมทั้งเดือนเติบโต +14.8% YoY จากงานโครงการห้องเย็นและโรงงานแปรรูปอาหารขนาดใหญ่`,
          `รักษา Gross Margin รวมทั้งเดือนได้ ${grossMargin.toFixed(1)}% อยู่ในเกณฑ์มาตรฐานที่คณะกรรมการบริหารกำหนด`,
          `กระแสเงินสดปิดงวด ฿1,420,000 รองรับภาระค่าใช้จ่ายดำเนินงาน (OPEX) ได้กว่า 3 เดือน`,
        ],
        redFlags: [
          `ลูกหนี้ค้างชำระสะสม ฿${totalArOverdue.toLocaleString()} กระทบต่อรอบหมุนเวียนเงินสด (Cash Conversion Cycle)`,
          `สต็อกสินค้าชะลอตัวและต่ำกว่าเกณฑ์ความปลอดภัยมีมูลค่ารวม ฿${deadStockTotal.toLocaleString()}`,
          `ลูกค้าองค์กรรายใหญ่ 2 รายมีแนวโน้มขยายระยะเวลาจ่ายเงินเกิน Credit Term ที่ตกลงไว้`,
        ],
        strategicRecommendations: [
          `ตั้งทีมเฉพาะกิจเร่งเก็บเงินจากลูกหนี้ค้างนาน 2 รายใหญ่เพื่อนำเงินสด ฿${totalArOverdue.toLocaleString()} เข้ามาก่อนสิ้นงวดบัญชี`,
          `จัดแคมเปญโปรโมชั่นสำหรับสต็อกชะลอตัวมูลค่า ฿${deadStockTotal.toLocaleString()} เพื่อเปลี่ยนเป็นเงินสดหมุนเวียน`,
          `ทบทวนวงเงินสินเชื่อการค้า (Credit Limit Review) ประจำไตรมาสสำหรับลูกค้ากลุ่ม High-Risk`,
        ],
      };
    }

    // Mode 3: Risk Memo (Focus on Liquidity Exposure, Capital at Risk, and Bad Debt Defense)
    const totalRiskCapital = totalArOverdue + deadStockTotal;
    return {
      formatType: 'risk_memo',
      periodTitle: 'Urgent Liquidity & Risk Management Memo (บันทึกความเสี่ยงด่วน)',
      reportDate: '28 สิงหาคม 2026 (รายงานประเมินความเสี่ยงฉุกเฉิน)',
      companyName,
      revenueTotal: totalRev,
      revenueTarget: targetRev,
      revenueAttainmentPct: (totalRiskCapital / totalRev) * 100,
      revenueGrowthPct: 0,
      grossProfitTotal: grossProfit,
      grossMarginPct: grossMargin,
      cashClosingBalance: 1420000,
      cashRunwayWeeks: 12.5,
      totalArOverdue,
      criticalArCount: criticalOverdue.length,
      topDebtorName: topDebtor.customerName,
      topDebtorAmount: topDebtor.outstandingAmount,
      deadStockValue: deadStockTotal,
      topRepName,
      topRepRevenue,
      kpiCards: [
        {
          label: 'มูลค่าเงินทุนที่ตกอยู่ในความเสี่ยง',
          value: `฿${totalRiskCapital.toLocaleString()}`,
          subtext: `${((totalRiskCapital / totalRev) * 100).toFixed(1)}% ของพอร์ตโฟลิโอ`,
          badgeColor: 'rose',
        },
        {
          label: 'หนี้ค้างชำระเสี่ยงสูง (A/R Risk)',
          value: `฿${totalArOverdue.toLocaleString()}`,
          subtext: `${criticalOverdue.length} ลูกหนี้ผิดนัดชำระ`,
          badgeColor: 'rose',
        },
        {
          label: 'ทุนจมในสต็อกชะลอตัว',
          value: `฿${deadStockTotal.toLocaleString()}`,
          subtext: 'Slow-Moving / Critical Items',
          badgeColor: 'amber',
        },
        {
          label: 'สถานะระงับเครดิต (Credit Hold)',
          value: '1 ราย (฿368,800)',
          subtext: 'ระงับการเปิดบิลสั่งผลิตล็อตใหม่',
          badgeColor: 'rose',
        },
      ],
      aiExecutiveSummary: `[บันทึกความเสี่ยงด่วน] สรุปการประเมินความเสี่ยงทางการเงินและสภาพคล่องของ ${companyName} ณ วันที่ 28 สิงหาคม 2026: ตรวจพบเงินทุนที่ตกอยู่ในความเสี่ยงรวม ฿${totalRiskCapital.toLocaleString()} (คิดเป็น ${((totalRiskCapital / totalRev) * 100).toFixed(1)}% ของยอดขาย) โดยจุดเสี่ยงสูงสุดคือหนี้ค้างชำระเกิน 60 วันของ ${topDebtor.customerName} ยอดเงิน ฿${topDebtor.outstandingAmount.toLocaleString()} ซึ่งติดสถานะ Credit Hold และเงินทุนจมในสต็อกชะลอตัว ฿${deadStockTotal.toLocaleString()} ฝ่ายบริหารควรบังคับใช้มาตรการควบคุมสินเชื่อและเร่งรัดสภาพคล่องทันที`,
      positiveHighlights: [
        `สภาพคล่องเงินสดในมือ ฿1.42M ยังอยู่ในเกณฑ์ Safety Buffer เพียงพอรองรับหนี้สินระยะสั้น`,
        `ลูกหนี้ 89.5% ของพอร์ตโฟลิโอยังอยู่ในสถานะชำระปกติและไม่มีประวัติผิดนัด`,
        `ระบบ Credit Risk Guarding ทำงานอัตโนมัติ ระงับการเปิด SO ใหม่ให้ลูกหนี้ผิดนัดชำระแล้ว`,
      ],
      redFlags: [
        `ความเสี่ยงหนี้สูญ: ${topDebtor.customerName} ค้างชำระ 63 วัน ยอด ฿${topDebtor.outstandingAmount.toLocaleString()} ต้องส่งหนังสือทวงถามตามกฎหมาย`,
        `ความเสี่ยงสต็อกขาด: แผ่นฉนวน PIR และประตูห้องเย็น 3 รายการต่ำกว่าเกณฑ์ อาจกระทบงานติดตั้งที่รับมัดจำแล้ว`,
        `บจก. ซีพีเอฟ ฟู้ด แอนด์ เบฟเวอเรจ ค้างชำระ 42 วัน ยอด ฿185,000 รอการตรวจรับงวดงาน`,
      ],
      strategicRecommendations: [
        `ส่งหนังสือบอกกล่าวทวงถามหนี้ตามกฎหมาย (Formal Legal Debt Letter) ไปยัง ${topDebtor.customerName} ทันที`,
        `ระงับการปล่อยสินค้าหรือรับงานโครงการใหม่ของลูกค้าที่ติดสถานะ Credit Hold ทุกกรณีจนกว่าจะเคลียร์ยอดเดิม`,
        `เปิด PO ฉุกเฉินจัดหาแผ่นฉนวน PIR 100mm และจัดโปรโมชั่นระบายสต็อกสินค้าเคลื่อนไหวช้า ฿${deadStockTotal.toLocaleString()}`,
      ],
    };
  }, [invoices, inventory, digestPeriod, companyName]);

  // Generate Copyable Text for LINE / Slack / Email
  const generateDigestText = () => {
    return `📊 [FinFlow] ${digestReport.periodTitle}
🏢 ${digestReport.companyName}
📅 วันที่สรุป: ${digestReport.reportDate}
----------------------------------------
📈 ตัวชี้วัดสำคัญ (Key Performance Indicators):
${digestReport.kpiCards.map((k) => `• ${k.label}: ${k.value} (${k.subtext})`).join('\n')}

💡 ข้อสรุปและบทวิเคราะห์จาก AI (Executive Summary):
${digestReport.aiExecutiveSummary}

✅ จุดแข็งและผลงานเด่น:
${digestReport.positiveHighlights.map((p) => `• ${p}`).join('\n')}

⚠️ จุดเฝ้าระวังและความเสี่ยง:
${digestReport.redFlags.map((r) => `• ${r}`).join('\n')}

🎯 3 แผนปฏิบัติการเร่งด่วน:
${digestReport.strategicRecommendations.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

สร้างโดย FinFlow Financial BI & AI Analytics Platform`;
  };

  const handleCopyDigest = () => {
    navigator.clipboard.writeText(generateDigestText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrintDigest = () => {
    window.print();
  };

  // Export Summary to Excel
  const handleExportDigestExcel = () => {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      { 'หมวดหมู่': 'หัวข้อรายงาน', 'ข้อมูล': digestReport.periodTitle },
      { 'หมวดหมู่': 'บริษัท', 'ข้อมูล': digestReport.companyName },
      { 'หมวดหมู่': 'วันที่รายงาน', 'ข้อมูล': digestReport.reportDate },
      { 'หมวดหมู่': 'ยอดขายรวม (THB)', 'ข้อมูล': digestReport.revenueTotal },
      { 'หมวดหมู่': 'เป้าหมายยอดขาย (THB)', 'ข้อมูล': digestReport.revenueTarget },
      { 'หมวดหมู่': 'อัตราบรรลุเป้า (%)', 'ข้อมูล': `${digestReport.revenueAttainmentPct.toFixed(1)}%` },
      { 'หมวดหมู่': 'กำไรขั้นต้น (THB)', 'ข้อมูล': digestReport.grossProfitTotal },
      { 'หมวดหมู่': 'อัตรากำไร (% Margin)', 'ข้อมูล': `${digestReport.grossMarginPct.toFixed(1)}%` },
      { 'หมวดหมู่': 'เงินสดคงเหลือ (THB)', 'ข้อมูล': digestReport.cashClosingBalance },
      { 'หมวดหมู่': 'ลูกหนี้ค้างชำระรวม (THB)', 'ข้อมูล': digestReport.totalArOverdue },
      { 'หมวดหมู่': 'ลูกหนี้เฝ้าระวังสูงสุด', 'ข้อมูล': `${digestReport.topDebtorName} (฿${digestReport.topDebtorAmount.toLocaleString()})` },
    ];
    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Executive_Digest');

    const alertsData = activeAlerts.map((a) => ({
      'ระดับความเสี่ยง': a.severity.toUpperCase(),
      'หัวข้อแจ้งเตือน': a.title,
      'เป้าหมาย/คู่ค้า': a.entityName,
      'มูลค่าผลกระทบ (THB)': a.impactAmount,
      'คำแนะนำแก้ไข': a.suggestedAction,
      'สถานะ': a.isResolved ? 'แก้ไขแล้ว' : 'รอการจัดการ',
    }));
    const ws2 = XLSX.utils.json_to_sheet(alertsData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Active_Risk_Alerts');

    XLSX.writeFile(wb, `FinFlow_Executive_Digest_${digestPeriod}_${digestReport.reportDate}.xlsx`);
  };

  return (
    <div id="viewExecutiveAlerts" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0">
      {/* 1. Header Banner & View Switcher */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Smart Risk Alerts &amp; Executive Digest Studio
              </h2>
              {criticalCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 animate-pulse">
                  {criticalCount} ความเสี่ยงวิกฤติ
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ตรวจจับความเสี่ยงทางการเงินอัตโนมัติ 5 มิติ และสร้างบทสรุปผู้บริหารรายสัปดาห์/รายเดือนพร้อมส่งต่อ
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center flex-wrap gap-2 shrink-0 self-stretch sm:self-auto">
          {/* Main Navigation Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Smart Risk Alerts ({activeAlerts.filter((a) => !a.isResolved).length})</span>
            </button>
            <button
              onClick={() => setActiveTab('digest')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === 'digest'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Digest Studio</span>
            </button>
          </div>

          {activeTab === 'alerts' ? (
            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'กำลังสแกน...' : 'สแกนความเสี่ยงทันที'}</span>
            </button>
          ) : (
            <button
              onClick={handleCopyDigest}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'คัดลอกสำเร็จแล้ว!' : 'คัดลอกข้อความสรุป'}</span>
            </button>
          )}
        </div>
      </div>

      {scanMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{scanMessage}</span>
          </div>
          <button onClick={() => setScanMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: SMART RISK ALERTS & RULES ENGINE
         ========================================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-5">
          {/* Risk Scorecard Badges - Uniform 4 Equal Width Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full">
            {/* 1. Critical Risk Exposure */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">มูลค่าเสี่ยงทั้งหมด</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  ฿{totalRiskCapital.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate">
                <span>จากลูกหนี้ค้างนาน &amp; สต็อกชะลอตัว</span>
              </div>
            </div>

            {/* 2. Critical Alerts Count */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">ความเสี่ยงระดับวิกฤติ</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {criticalCount} รายการ
                </span>
              </div>
              <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 truncate">
                <span>ต้องการมาตรการแก้ไขเร่งด่วน</span>
              </div>
            </div>

            {/* 3. Monitored Active Rules */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">เงื่อนไขที่เปิดตรวจจับ</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
              </div>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {rules.filter((r) => r.enabled).length} / {rules.length} กฎ
                </span>
              </div>
              <div className="flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                <span>ทำงานอัตโนมัติแบบ Real-time</span>
              </div>
            </div>

            {/* 4. Resolved Items */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[110px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">จัดการเรียบร้อยแล้ว</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="my-1.5 flex items-baseline justify-between">
                <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {resolvedAlertIds.size} รายการ
                </span>
              </div>
              <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 truncate">
                <span>ได้รับการติดตามหรือแก้ไขแล้ว</span>
              </div>
            </div>
          </div>

          {/* Active Alerts List & Trigger Rules Manager Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Col (2 cols): Live Active Alerts Stream */}
            <div className="lg:col-span-2 space-y-3.5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>รายการแจ้งเตือนความเสี่ยงที่ตรวจพบ (Active Triggered Alerts)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {filteredAlerts.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    ตรวจจับจากฐานข้อมูลบัญชีและจัดอันดับความสำคัญตามมูลค่าความเสียหาย
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <button
                    onClick={() => setSelectedSeverityFilter('all')}
                    className={`px-2 py-1 rounded-md transition cursor-pointer font-medium ${
                      selectedSeverityFilter === 'all'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  <button
                    onClick={() => setSelectedSeverityFilter('critical')}
                    className={`px-2 py-1 rounded-md transition cursor-pointer font-medium ${
                      selectedSeverityFilter === 'critical'
                        ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    วิกฤติ
                  </button>
                  <button
                    onClick={() => setSelectedSeverityFilter('warning')}
                    className={`px-2 py-1 rounded-md transition cursor-pointer font-medium ${
                      selectedSeverityFilter === 'warning'
                        ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    เฝ้าระวัง
                  </button>
                </div>
              </div>

              {/* Alert Cards */}
              <div className="space-y-2.5">
                {filteredAlerts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/90 dark:border-slate-800 text-center text-slate-400 text-xs">
                    <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-75" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">ไม่พบความเสี่ยงในหมวดหมู่นี้</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">ระบบทำงานปกติ ข้อมูลทั้งหมดอยู่ในเกณฑ์ปลอดภัย</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const isResolved = alert.isResolved;
                    return (
                      <div
                        key={alert.id}
                        className={`rounded-2xl p-4 border transition ${
                          isResolved
                            ? 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 opacity-60'
                            : alert.severity === 'critical'
                            ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 shadow-2xs'
                            : alert.severity === 'warning'
                            ? 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/60 shadow-2xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                                alert.severity === 'critical'
                                  ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50'
                                  : alert.severity === 'warning'
                                  ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
                                  : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50'
                              }`}
                            >
                              {alert.category === 'ar_overdue' && <Clock className="w-4 h-4" />}
                              {alert.category === 'credit_limit' && <ShieldAlert className="w-4 h-4" />}
                              {alert.category === 'margin_drop' && <TrendingDown className="w-4 h-4" />}
                              {alert.category === 'inventory_deadstock' && <Package className="w-4 h-4" />}
                              {alert.category === 'cash_runway' && <DollarSign className="w-4 h-4" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                  {alert.title}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    alert.severity === 'critical'
                                      ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                                      : alert.severity === 'warning'
                                      ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                  }`}
                                >
                                  {alert.severity === 'critical' ? 'CRITICAL' : alert.severity === 'warning' ? 'WARNING' : 'INFO'}
                                </span>
                                {isResolved && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                    ✓ จัดการแล้ว
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                                {alert.detail}
                              </p>

                              {/* Suggested Tactical Action */}
                              <div className="mt-2.5 flex items-center flex-wrap gap-2 text-xs">
                                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
                                  <Zap className="w-3 h-3 text-amber-500" />
                                  <span>
                                    <strong>ข้อแนะนำ:</strong> {alert.suggestedAction}
                                  </span>
                                </div>

                                {alert.actionType === 'draft_debt_letter' && onOpenDebtDraft && (
                                  <button
                                    onClick={() => {
                                      const cust = customers.find((c) => c.name === alert.entityName || c.id === alert.entityId) || {
                                        id: 'CUST-TEMP',
                                        name: alert.entityName,
                                        contactPerson: 'ฝ่ายการเงิน/จัดซื้อ',
                                        phone: '02-xxx-xxxx',
                                        email: 'finance@client.co.th',
                                        creditLimit: 2000000,
                                        creditTermDays: 30,
                                        category: 'Corporate',
                                        status: 'Active' as const,
                                        totalSalesYTD: 0,
                                        totalOutstanding: alert.impactAmount,
                                      };
                                      const relatedInv = invoices.find(
                                        (i) => i.id === alert.id.replace('alert-ar-', '') || i.customerName === alert.entityName
                                      );
                                      onOpenDebtDraft(
                                        cust,
                                        relatedInv?.invoiceNo || 'INV-2026-CR13',
                                        alert.impactAmount,
                                        alert.metricValue || 63
                                      );
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800 flex items-center space-x-1 transition cursor-pointer"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>สร้างหนังสือทวงหนี้ทันที</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Button: Mark Resolved */}
                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              ฿{alert.impactAmount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => handleToggleResolve(alert.id)}
                              className={`mt-2 text-[11px] px-2 py-1 rounded-lg border transition cursor-pointer flex items-center space-x-1 ${
                                isResolved
                                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                                  : 'bg-white dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>{isResolved ? 'ยกเลิกจัดการ' : 'ปิดความเสี่ยงนี้'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Col: Smart Rules Configuration Panel */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      การตั้งค่าเกณฑ์ตรวจจับ (Alert Rules)
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400">5 กฎมาตรฐาน</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  กำหนดค่าเกณฑ์ความเสี่ยงที่ FinFlow จะคอยตรวจจับและส่งสัญญาณเตือนไปยังผู้บริหาร
                </p>

                {/* Rules List */}
                <div className="space-y-2 text-xs">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{rule.name}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={() => {
                              setRules(
                                rules.map((r) => (r.id === rule.id ? { ...r, enabled: !r.enabled } : r))
                              );
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:width after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {rule.description}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          เกณฑ์: {rule.thresholdValue.toLocaleString()} {rule.unit}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          {rule.notifyChannels.includes('line_webhook') && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium">
                              LINE
                            </span>
                          )}
                          {rule.notifyChannels.includes('email') && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                              Email
                            </span>
                          )}
                          <button
                            onClick={() => setEditingRule({ ...rule })}
                            className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer"
                          >
                            แก้ไขเกณฑ์
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notification Channels Simulator Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    ช่องทางแจ้งเตือนอัตโนมัติ
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  รองรับการส่งการแจ้งเตือนทันทีเมื่อตรวจพบความเสี่ยงระดับวิกฤติ
                </p>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">LINE Notify / Webhook</span>
                        <p className="text-[10px] text-slate-500">แจ้งเตือนเข้ากลุ่มผู้บริหารและฝ่ายการเงิน</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-full">
                      เชื่อมต่อแล้ว
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Email Digest Alert</span>
                        <p className="text-[10px] text-slate-500">ส่งสรุปรายสัปดาห์ถึง CFO &amp; กรรมการผู้จัดการ</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-full">
                      ทุกวันจันทร์ 08:00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: EXECUTIVE DIGEST STUDIO
         ========================================================================= */}
      {activeTab === 'digest' && (
        <div className="space-y-5">
          {/* Digest Mode Selection Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">เลือกรูปแบบสรุป:</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <button
                  onClick={() => setDigestPeriod('weekly')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    digestPeriod === 'weekly'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  สรุปรายสัปดาห์ (Weekly Brief)
                </button>
                <button
                  onClick={() => setDigestPeriod('monthly')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    digestPeriod === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  รายงานบอร์ดรายเดือน (Monthly Deck)
                </button>
                <button
                  onClick={() => setDigestPeriod('risk_memo')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    digestPeriod === 'risk_memo'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  บันทึกความเสี่ยงด่วน (Risk Memo)
                </button>
              </div>
            </div>

            {/* Export & Sharing Actions */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <button
                onClick={handleCopyDigest}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedText ? 'คัดลอกแล้ว!' : 'Copy for LINE / Slack'}</span>
              </button>

              <button
                onClick={handlePrintDigest}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>พิมพ์ / บันทึก PDF</span>
              </button>

              <button
                onClick={handleExportDigestExcel}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Interactive Executive Document Preview Sheet - Full Width */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm w-full space-y-6 print:border-none print:shadow-none">
            {/* Document Header */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  EXECUTIVE BRIEFING REPORT
                </span>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {digestReport.periodTitle}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {digestReport.companyName} | สรุปข้อมูล ณ วันที่ {digestReport.reportDate}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  CONFIDENTIAL - สำหรับผู้บริหาร
                </span>
                <p className="text-[10px] text-slate-400 mt-1">แหล่งข้อมูล: Express / Sage 50 ERP</p>
              </div>
            </div>

            {/* Section 1: Executive KPI Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {digestReport.kpiCards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between"
                >
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{card.label}</span>
                  <div
                    className={`text-base sm:text-lg font-bold mt-1 ${
                      card.badgeColor === 'rose'
                        ? 'text-rose-600 dark:text-rose-400'
                        : card.badgeColor === 'blue'
                        ? 'text-blue-600 dark:text-blue-400'
                        : card.badgeColor === 'amber'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {card.value}
                  </div>
                  <div
                    className={`text-[11px] font-medium mt-0.5 ${
                      card.badgeColor === 'emerald'
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : card.badgeColor === 'rose'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {card.subtext}
                  </div>
                </div>
              ))}
            </div>

            {/* Section 2: AI Executive Synthesis Prose */}
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-bold text-xs sm:text-sm text-blue-950 dark:text-blue-200">
                  ข้อสรุปภาพรวมผู้บริหาร (AI Executive Synthesis)
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {digestReport.aiExecutiveSummary}
              </p>
            </div>

            {/* Section 3: Key Positives & Red Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Positive Highlights */}
              <div className="p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>จุดแข็ง &amp; ผลการดำเนินงานเด่น</span>
                </div>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside">
                  {digestReport.positiveHighlights.map((pos, pIdx) => (
                    <li key={pIdx} className="leading-relaxed">
                      {pos}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red Flags / Concerns */}
              <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center space-x-2 text-rose-800 dark:text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>จุดเฝ้าระวัง &amp; ความเสี่ยงต้องแก้ไข</span>
                </div>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 list-disc list-inside">
                  {digestReport.redFlags.map((flag, fIdx) => (
                    <li key={fIdx} className="leading-relaxed">
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Section 4: Recommended Action Items */}
            <div className="space-y-2.5 pt-2">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>
                  {digestPeriod === 'weekly'
                    ? '3 แผนปฏิบัติการเร่งด่วนสำหรับสัปดาห์นี้ (Weekly Tactical Sprint)'
                    : digestPeriod === 'monthly'
                    ? '3 แผนยุทธศาสตร์ประจำเดือนและการปิดงวดบัญชี (Monthly Strategic Initiatives)'
                    : '3 มาตรการป้องกันและบริหารความเสี่ยงเร่งด่วน (Immediate Risk Mitigation Plan)'}
                </span>
              </h4>
              <div className="space-y-2 text-xs">
                {digestReport.strategicRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start space-x-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>จัดทำโดย FinFlow AI Executive Engine</span>
              <span>หน้า 1/1 • รับรองความถูกต้องข้อมูลการเงิน</span>
            </div>
          </div>
        </div>
      )}

      {/* Rule Edit Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  แก้ไขเกณฑ์ตรวจจับความเสี่ยง
                </h3>
              </div>
              <button
                onClick={() => setEditingRule(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ชื่อกฎ (Rule Name)
                </label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  คำอธิบายวัตถุประสงค์
                </label>
                <textarea
                  rows={2}
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    เกณฑ์แจ้งเตือน (Threshold)
                  </label>
                  <input
                    type="number"
                    value={editingRule.thresholdValue}
                    onChange={(e) =>
                      setEditingRule({ ...editingRule, thresholdValue: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    หน่วยวัด
                  </label>
                  <input
                    type="text"
                    disabled
                    value={
                      editingRule.unit === 'days'
                        ? 'วัน (Days)'
                        : editingRule.unit === 'percent'
                        ? 'เปอร์เซ็นต์ (%)'
                        : editingRule.unit === 'thb'
                        ? 'บาท (THB)'
                        : 'ครั้ง'
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ระดับความรุนแรง (Severity)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['critical', 'warning', 'info'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setEditingRule({ ...editingRule, severity: sev })}
                      className={`py-2 px-3 rounded-xl border text-center font-bold capitalize transition cursor-pointer ${
                        editingRule.severity === sev
                          ? sev === 'critical'
                            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-400/20'
                            : sev === 'warning'
                            ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/20'
                            : 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400/20'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  ช่องทางส่งสัญญาณเตือน
                </label>
                <div className="space-y-1.5">
                  <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.notifyChannels.includes('in_app')}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...editingRule.notifyChannels, 'in_app' as const]
                          : editingRule.notifyChannels.filter((c) => c !== 'in_app');
                        setEditingRule({ ...editingRule, notifyChannels: next });
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>In-App Dashboard Notification</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.notifyChannels.includes('line_webhook')}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...editingRule.notifyChannels, 'line_webhook' as const]
                          : editingRule.notifyChannels.filter((c) => c !== 'line_webhook');
                        setEditingRule({ ...editingRule, notifyChannels: next });
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>LINE Notify / Group Webhook</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingRule.notifyChannels.includes('email')}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...editingRule.notifyChannels, 'email' as const]
                          : editingRule.notifyChannels.filter((c) => c !== 'email');
                        setEditingRule({ ...editingRule, notifyChannels: next });
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Executive Email Summary</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setEditingRule(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  setRules(rules.map((r) => (r.id === editingRule.id ? editingRule : r)));
                  setEditingRule(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                บันทึกการตั้งค่ากฎ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
