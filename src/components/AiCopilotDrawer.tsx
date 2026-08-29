import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Lightbulb,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Award,
  BarChart3,
  TrendingUp,
  Target,
  Bell,
  FileText,
} from 'lucide-react';
import { fetchAiChat, fetchAiReportBuilder } from '../services/geminiService';
import { ReportDefinition } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedReport?: any;
}

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contextData: any;
  onApplyGeneratedReport?: (reportDef: Partial<ReportDefinition>) => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  contextData,
  onApplyGeneratedReport,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: 'สวัสดีครับ! ผมเป็น FinFlow AI Copilot ประจำระบบ FinFlow Business Intelligence Platform\n\nท่านสามารถถามวิเคราะห์ยอดขาย, อัตรากำไร, ความเสี่ยงลูกหนี้ AR Aging, หรือสั่งให้ผมสร้างรายงาน (Report) ให้โดยอัตโนมัติได้ทันทีครับ',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { text: 'ประเมินความเสี่ยงทางการเงิน 5 ด้าน และแจ้งเตือนจุดวิกฤติ', icon: Bell },
    { text: 'ร่างบทสรุปผู้บริหารประจำสัปดาห์ (Weekly Executive Digest)', icon: FileText },
    { text: 'ประเมินกระแสเงินสดรับล่วงหน้า และจุดเสี่ยงสภาพคล่อง', icon: TrendingUp },
    { text: 'สรุปผลงานยอดขายเทียบเป้าหมาย และการคำนวณคอมมิชชั่น Q1', icon: Target },
    { text: 'สินค้าไหนกำไรดีที่สุด?', icon: Lightbulb },
    { text: 'ลูกหนี้รายไหนค้างชำระเกิน 60 วัน?', icon: AlertTriangle },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (userText?: string) => {
    const query = userText || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Check if user is asking to build a report
      const isReportRequest =
        query.includes('สร้างรายงาน') ||
        query.includes('ทำรายงาน') ||
        query.includes('report') ||
        query.includes('สร้าง report');

      if (isReportRequest) {
        const repRes = await fetchAiReportBuilder(query);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: `${repRes.explanation}\n\nผมได้สร้างโครงร่างรายงาน **"${repRes.reportDefinition?.title || 'รายงานใหม่'}"** ให้เรียบร้อยแล้ว คุณสามารถคลิกปุ่มด้านล่างเพื่อเปิดและบันทึกใน Report Studio ได้ทันทีครับ`,
            suggestedReport: repRes.reportDefinition,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        const aiRes = await fetchAiChat(query, contextData);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: aiRes.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำตอบ กรุณาลองใหม่อีกครั้ง',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="copilot-drawer"
      className={`fixed inset-y-0 right-0 w-full sm:w-96 md:w-[420px] max-w-full bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Drawer Header */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <span>FinFlow AI Copilot</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold rounded border border-blue-200/60 dark:border-blue-800/40">
                Pro
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">Financial &amp; Accounting AI</p>
          </div>
        </div>
        <button
          id="btn-close-copilot"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg transition cursor-pointer shrink-0 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages List */}
      <div id="copilot-chat-messages" className="flex-1 p-3 sm:p-4 space-y-3.5 overflow-y-auto custom-scrollbar text-xs min-w-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-sm shadow-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-line break-words">{msg.text}</div>

              {/* Action button if AI suggested a report */}
              {msg.suggestedReport && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700 space-y-2">
                  <div className="font-semibold text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Report Configuration Ready</span>
                  </div>
                  <button
                    onClick={() => {
                      if (onApplyGeneratedReport) {
                        onApplyGeneratedReport(msg.suggestedReport);
                        onClose();
                      }
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-sm shadow-blue-500/20"
                  >
                    <span>เปิดรายงานนี้ใน Report Studio</span>
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span className="truncate font-medium">Gemini กำลังวิเคราะห์ข้อมูล...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts & Chat Input */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50 dark:bg-slate-900 shrink-0">
        {/* Quick prompt pills */}
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
          {quickPrompts.map((qp, idx) => {
            const Icon = qp.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(qp.text)}
                className="px-2.5 py-1.5 rounded-xl text-[10px] bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition text-left cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Icon className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{qp.text}</span>
              </button>
            );
          })}
        </div>

        {/* Input box */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            id="copilot-text-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="ถามข้อมูลกำไร, ลูกหนี้ หรือสั่งสร้างรายงาน..."
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition min-w-0"
          />
          <button
            id="btn-send-copilot"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white transition cursor-pointer shrink-0 shadow-sm shadow-blue-500/20"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
