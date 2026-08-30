import React from 'react';
import { Sliders, TrendingUp, Clock, FileSpreadsheet, Sparkles, Building2, Layers, ArrowRight } from 'lucide-react';

interface AdvanceToolsBarProps {
  onSelectTab: (tab: string) => void;
  onOpenUpload: () => void;
}

export const AdvanceToolsBar: React.FC<AdvanceToolsBarProps> = ({ onSelectTab, onOpenUpload }) => {
  const tools = [
    {
      id: 'report-studio',
      title: 'Report Studio (Ad-hoc)',
      desc: 'เครื่องมือสร้าง Pivot Table ลากวางอิสระ',
      icon: <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
      tag: 'Pro Tool',
    },
    {
      id: 'cash-flow',
      title: 'Cash Flow Simulator',
      desc: 'แบบจำลองกระแสเงินสดและ What-If',
      icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      tag: '12-Week',
    },
    {
      id: 'ar-aging',
      title: 'A/R Aging & Collections',
      desc: 'ตารางวิเคราะห์อายุหนี้ 30/60/90 วัน',
      icon: <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      tag: 'Audit Ready',
    },
    {
      id: 'standard-reports',
      title: 'Tax & Standard Reports',
      desc: 'รายงาน ภ.พ.30 และงบการเงินมาตรฐาน',
      icon: <FileSpreadsheet className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      tag: 'RD Tax',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-indigo-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-2">
              <span>Deep Drilldown &amp; Advance BI Studio</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                PRO MODULES
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              เข้าถึงเครื่องมือวิเคราะห์เชิงลึก, เครื่องมือลากวาง Pivot Matrix, และแบบจำลองสถานการณ์ทางธุรกิจ
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelectTab('report-studio')}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
        >
          <span>เปิด Report Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Tool Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => onSelectTab(tool.id)}
            className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/50 transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {tool.icon}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                  {tool.tag}
                </span>
              </div>
              <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                {tool.title}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {tool.desc}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-indigo-300">
              <span>คลิกเพื่อเปิดเครื่องมือ</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
