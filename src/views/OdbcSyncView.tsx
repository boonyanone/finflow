import React, { useState } from 'react';
import {
  RefreshCw,
  Server,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
  Clock,
  Terminal,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface OdbcSyncViewProps {
  onShowToast: (msg: string) => void;
}

export const OdbcSyncView: React.FC<OdbcSyncViewProps> = ({ onShowToast }) => {
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[2026-08-25 10:00:00] [ODBC Agent] Initialized connection to Sage 50 Pervasive PSQL engine on 192.168.1.150:1583',
    '[2026-08-25 10:00:01] [ODBC Agent] DSN "Sage50_Company_DB" authenticated successfully.',
    '[2026-08-25 10:00:02] [ODBC Agent] Telemetry: Latency 118ms, 0 packet loss.',
    '[2026-08-25 10:15:00] [Scheduler] Scheduled incremental sync completed. 16 Invoices, 4 Inventory records updated.',
  ]);

  const handleManualSync = () => {
    setSyncing(true);
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] [Manual Trigger] Triggering on-demand ODBC sync...`]);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[${time}] [Query Execution] SELECT * FROM JrnlHdr INNER JOIN JrnlRow ON JrnlHdr.PostOrder = JrnlRow.PostOrder WHERE JrnlHdr.Journal = 8`,
        `[${time}] [Transform] Converted 16 transactions into Canonical JSON format.`,
        `[${time}] [Success] Cloud Synced in 420ms! Database up to date.`,
      ]);
      setSyncing(false);
      onShowToast('ซิงค์ข้อมูลสดจาก Sage 50 ผ่าน ODBC สำเร็จแล้ว');
    }, 1200);
  };

  return (
    <div id="view-odbc-sync" className="space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0 shadow-sm">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span>Sage 50 Direct ODBC Real-Time Agent</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Connected (Online)
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              เชื่อมต่อตรงกับ Sage 50 Accounting Database ผ่าน Pervasive / Actian SQL ODBC Driver
            </p>
          </div>
        </div>

        <button
          onClick={handleManualSync}
          disabled={syncing}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 self-start sm:self-center shadow-sm shadow-blue-500/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'กำลังซิงค์ข้อมูล...' : 'สั่งซิงค์เดี๋ยวนี้ (Sync Now)'}</span>
        </button>
      </div>

      {/* Connection & Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full min-w-0">
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">สถานะการเชื่อมต่อ (Status)</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ONLINE</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">DSN: Sage50_Company_DB</div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ความเร็วหน่วงเวลา (Latency)</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <span>118 ms</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">ความเร็วดีเยี่ยม (Ultra Low)</div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">รอบเวลาอัปเดตอัตโนมัติ</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>ทุก 15 นาที</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">Incremental Delta Sync</div>
        </div>

        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">การเข้ารหัสความปลอดภัย</span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">TLS 1.3 AES</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 truncate">End-to-End Encrypted</div>
        </div>
      </div>

      {/* Terminal Live Console */}
      <div className="bg-[#020617] border border-slate-800 rounded-2xl p-5 space-y-3 font-mono w-full min-w-0">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-300">Live Agent Console Stream</span>
          </div>
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-300 max-h-64 overflow-y-auto custom-scrollbar break-all">
          {logs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              {log}
            </div>
          ))}
          {syncing && (
            <div className="text-amber-400">
              [Sync in Progress] Querying Sage 50 database tables: Chart, Customer, LineItem...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
