import React from 'react';
import { GitMerge, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export const CustomFieldMappingView: React.FC = () => {
  const mappingPairs = [
    {
      sageCol: 'Invoice_Number_Ref',
      sageDesc: 'รหัสเอกสารใบแจ้งหนี้จาก Sage 50',
      targetField: 'Invoice ID (Primary Key)',
      type: 'String (Unique)',
      confidence: 100,
    },
    {
      sageCol: 'Trans_Date_Post',
      sageDesc: 'วันที่ทำรายการบันทึกบัญชี',
      targetField: 'Date (Transaction Date)',
      type: 'Date (YYYY-MM-DD)',
      confidence: 98,
    },
    {
      sageCol: 'Customer_Name_Master',
      sageDesc: 'ชื่อบัญชีลูกค้า / บริษัทคู่ค้า',
      targetField: 'Customer Name',
      type: 'String',
      confidence: 99,
    },
    {
      sageCol: 'Item_Desc_Line',
      sageDesc: 'ชื่อรายการสินค้า / บริการ',
      targetField: 'Item & Description',
      type: 'String',
      confidence: 96,
    },
    {
      sageCol: 'Sales_Rep_Code',
      sageDesc: 'รหัสพนักงานขายผู้ดูแล',
      targetField: 'Sales Rep',
      type: 'String',
      confidence: 95,
    },
    {
      sageCol: 'Qty_Shipped_Line',
      sageDesc: 'จำนวนชิ้นที่ส่งมอบ',
      targetField: 'Quantity',
      type: 'Number (Integer)',
      confidence: 99,
    },
    {
      sageCol: 'Net_Sales_Amt_THB',
      sageDesc: 'ยอดขายสุทธิหลังหักส่วนลด',
      targetField: 'Net Amount (THB)',
      type: 'Currency (THB)',
      confidence: 100,
    },
    {
      sageCol: 'COGS_Cost_Line',
      sageDesc: 'ต้นทุนสินค้าขายเฉลี่ย (Cost)',
      targetField: 'COGS (Cost of Goods Sold)',
      type: 'Currency (THB)',
      confidence: 98,
    },
    {
      sageCol: 'Gross_Profit_Margin_Pct',
      sageDesc: 'อัตรากำไรขั้นต้น (%)',
      targetField: 'Gross Margin %',
      type: 'Percentage',
      confidence: 100,
    },
  ];

  return (
    <div id="viewMapping" className="view-panel space-y-5 sm:space-y-6 w-full min-w-0">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-sm">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Smart Schema Auto-Mapper (AI Powered)</span>
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                จับคู่คอลัมน์ Sage 50 เข้าสู่โครงสร้างฐานข้อมูลระบบโดยอัตโนมัติ
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40 flex items-center space-x-1.5 shrink-0 self-start sm:self-center">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>AI Match Rate: 98%</span>
          </span>
        </div>

        <div className="space-y-3">
          {mappingPairs.map((pair) => (
            <div
              key={pair.sageCol}
              className="p-3.5 sm:p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4 hover:border-blue-200 dark:hover:border-blue-800/60 transition"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">
                  Sage 50 Source Column
                </div>
                <div className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-[#0f172a] border border-blue-100 dark:border-blue-900/40 px-3 py-1.5 rounded-lg truncate">
                  {pair.sageCol}
                </div>
                <div className="text-[10px] text-slate-400">{pair.sageDesc}</div>
              </div>

              <div className="flex items-center justify-center px-1 shrink-0 self-center">
                <ArrowRight className="w-4 h-4 text-blue-500 rotate-90 md:rotate-0" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Target System Field</span>
                  <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{pair.type}</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center justify-between">
                  <span className="truncate">{pair.targetField}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1.5" />
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  AI Confidence: {pair.confidence}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

