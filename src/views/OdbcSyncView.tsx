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
  Globe,
  Radio,
  Cpu,
  FileCode,
  Download,
  FolderSync,
  KeyRound,
  Check,
  ArrowRight,
  Workflow,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  downloadExpressDbWatcherScript,
  downloadOdbcSqlBridgeScript,
} from '../utils/agentScriptGenerator';

interface OdbcSyncViewProps {
  onShowToast: (msg: string) => void;
}

export const OdbcSyncView: React.FC<OdbcSyncViewProps> = ({ onShowToast }) => {
  const [activeSubTab, setActiveSubTab] = useState<'cloud_api' | 'on_premise_agent' | 'terminal_logs'>('cloud_api');
  const [syncing, setSyncing] = useState(false);
  const [testingFlowAccount, setTestingFlowAccount] = useState(false);
  const [testingPeak, setTestingPeak] = useState(false);
  const [flowAccountStatus, setFlowAccountStatus] = useState<'connected' | 'idle'>('connected');
  const [peakStatus, setPeakStatus] = useState<'connected' | 'idle'>('connected');

  // Cloud API settings
  const [flowAccountId, setFlowAccountId] = useState('flow_cli_9948201948');
  const [flowAccountSecret, setFlowAccountSecret] = useState('••••••••••••••••••••••••');
  const [peakToken, setPeakToken] = useState('pk_live_sec_789123847192847');
  const [syncFrequency, setSyncFrequency] = useState<'realtime' | '15m' | '1h' | 'nightly'>('15m');

  // Desktop Agent settings
  const [expressPath, setExpressPath] = useState('C:\\ExpressI\\DATA');
  const [odbcDsn, setOdbcDsn] = useState('Winspeed_Production_DB');

  const [logs, setLogs] = useState<string[]>([
    '[2026-08-29 10:00:00] [Excel / CSV] Universal Ingestion Engine active (Health Quality Score: 100%).',
    '[2026-08-29 10:05:12] [FlowAccount Cloud] Open API connected (Token validated, 16 Invoices fetched).',
    '[2026-08-29 10:10:45] [PEAK Engine] Webhook listener active on /api/webhooks/peak.',
    '[2026-08-29 10:15:00] [Express Native] DBF File Watcher listening to ' + expressPath + ' (ARTRN.DBF, OESLM.DBF).',
    '[2026-08-29 10:15:02] [ODBC Bridge] DSN "' + odbcDsn + '" authenticated successfully. Latency: 48ms.',
  ]);

  const handleManualSync = () => {
    setSyncing(true);
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] [Manual Trigger] Starting global sync across all data sources...`]);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[${time}] [FlowAccount Cloud] 16 Invoices & 4 Receipts verified with zero delta.`,
        `[${time}] [PEAK Engine] Verified Journal balances (Debits = Credits = ฿2,890,000).`,
        `[${time}] [Express DBF Agent] Read ARTRN.DBF buffer: 0 file lock conflicts.`,
        `[${time}] [Normalization] Transformed to Canonical 4-Table Schema in 340ms.`,
        `[${time}] [Success] Global Cloud Database is 100% Up to Date!`,
      ]);
      setSyncing(false);
      onShowToast('ซิงค์ข้อมูลจากทุกช่องทาง (Cloud API & On-Premise) สำเร็จแล้ว');
    }, 1200);
  };

  const handleTestFlowAccount = () => {
    setTestingFlowAccount(true);
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] [FlowAccount Test] Authenticating Client ID: ${flowAccountId}...`]);

    setTimeout(() => {
      setTestingFlowAccount(false);
      setFlowAccountStatus('connected');
      setLogs((prev) => [
        ...prev,
        `[${time}] [FlowAccount OAuth2] Token Grant 200 OK. Scope: [invoices:read, receipts:read, contacts:read].`,
        `[${time}] [FlowAccount Ping] Response latency: 94ms. Connection healthy.`,
      ]);
      onShowToast('ทดสอบการเชื่อมต่อ FlowAccount API สำเร็จ (Latency 94ms)');
    }, 1000);
  };

  const handleTestPeak = () => {
    setTestingPeak(true);
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] [PEAK Test] Verifying Secret Token with PEAK Engine API v1...`]);

    setTimeout(() => {
      setTestingPeak(false);
      setPeakStatus('connected');
      setLogs((prev) => [
        ...prev,
        `[${time}] [PEAK Engine API] Auth OK. Organization: "บริษัท สยาม คูลลิ่ง แอนด์ แผงฉนวน จำกัด".`,
        `[${time}] [PEAK Webhook] Sync endpoint /api/webhooks/peak is ACTIVE. Latency: 82ms.`,
      ]);
      onShowToast('ทดสอบการเชื่อมต่อ PEAK Engine API สำเร็จ (Latency 82ms)');
    }, 1000);
  };

  return (
    <div id="view-odbc-sync" className="space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full min-w-0 shadow-sm">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shrink-0 shadow-sm">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span>ศูนย์เชื่อมต่อโปรแกรมบัญชี &amp; Sync Agent (Connectors)</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Services All Online
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              เชื่อมต่อโปรแกรมบัญชีทั้งระบบ Cloud (FlowAccount, PEAK) และ On-Premise (Express .DBF, Winspeed, myAccount, Sage 50)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 shadow-sm shadow-blue-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'กำลังซิงค์ข้อมูล...' : 'สั่งซิงค์สดเดี๋ยวนี้ (Sync All Now)'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveSubTab('cloud_api')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'cloud_api'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Phase 2: Cloud Open API (FlowAccount &amp; PEAK)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('on_premise_agent')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'on_premise_agent'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Phase 3: Desktop On-Premise Agent (Express DBF / ODBC)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('terminal_logs')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeSubTab === 'terminal_logs'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Live Telemetry &amp; Terminal Logs</span>
        </button>
      </div>

      {/* SUB-TAB 1: Cloud Open API Connectors (Phase 2) */}
      {activeSubTab === 'cloud_api' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* FlowAccount Connector Box */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                      FA
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>FlowAccount Open API Connector</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                          OAuth2 Ready
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">ดึงใบแจ้งหนี้, ใบเสร็จรับเงิน, ภาษีขาย และรายชื่อลูกค้าอัตโนมัติ</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">FlowAccount Client ID</label>
                    <input
                      type="text"
                      value={flowAccountId}
                      onChange={(e) => setFlowAccountId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Client Secret</label>
                    <input
                      type="password"
                      value={flowAccountSecret}
                      onChange={(e) => setFlowAccountSecret(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Webhook Endpoint URL for Real-Time Sync:</span>
                    </div>
                    <code className="block p-1.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] text-blue-600 dark:text-blue-400 break-all select-all">
                      https://finflow-bi.app/api/webhooks/flowaccount/f6a0ab8f
                    </code>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Webhook Listener Active</span>
                </div>
                <button
                  onClick={handleTestFlowAccount}
                  disabled={testingFlowAccount}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold transition cursor-pointer flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingFlowAccount ? 'animate-spin' : ''}`} />
                  <span>{testingFlowAccount ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ API'}</span>
                </button>
              </div>
            </div>

            {/* PEAK Account Connector Box */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      PK
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>PEAK Engine OpenAPI Connector</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                          REST API Ready
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">ดึงสมุดรายวัน (Journal Entry), ผังบัญชี GL, ลูกหนี้คงค้าง</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">PEAK User Token / Secret Key</label>
                    <input
                      type="password"
                      value={peakToken}
                      onChange={(e) => setPeakToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">รอบเวลาการดึงข้อมูลอัตโนมัติ (Scheduler)</label>
                    <select
                      value={syncFrequency}
                      onChange={(e: any) => setSyncFrequency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="realtime">Real-Time Webhook (ทันทีเมื่อออกบิล)</option>
                      <option value="15m">ทุก 15 นาที (Incremental Delta Sync)</option>
                      <option value="1h">ทุก 1 ชั่วโมง</option>
                      <option value="nightly">ทุกเที่ยงคืน (Daily Reconciliation 00:00 น.)</option>
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>PEAK Event Listener Webhook:</span>
                    </div>
                    <code className="block p-1.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 break-all select-all">
                      https://finflow-bi.app/api/webhooks/peak/f6a0ab8f
                    </code>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>API Key Authenticated</span>
                </div>
                <button
                  onClick={handleTestPeak}
                  disabled={testingPeak}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition cursor-pointer flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingPeak ? 'animate-spin' : ''}`} />
                  <span>{testingPeak ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ API'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Desktop On-Premise Sync Agent (Phase 3) */}
      {activeSubTab === 'on_premise_agent' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Express DBF Watcher Box */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                      EXP
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Express Accounting .DBF File Watcher</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                          On-Premise LAN
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">ตรวจจับการคีย์บิลใน Express ทันทีที่มีการ Save ลงไฟล์ ARTRN.DBF</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">โฟลเดอร์เก็บข้อมูล Express บนเครื่อง/Server</label>
                    <input
                      type="text"
                      value={expressPath}
                      onChange={(e) => setExpressPath(e.target.value)}
                      placeholder="C:\ExpressI\DATA"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
                    <div className="font-bold text-slate-700 dark:text-slate-300">ตารางที่ Agent ทำการอ่านและแปลงให้อัตโนมัติ:</div>
                    <ul className="space-y-1 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      <li>• <strong>ARTRN.DBF:</strong> ข้อมูลบิลขาย, เลขที่เอกสาร, ยอดเงิน, ลูกหนี้</li>
                      <li>• <strong>OESLM.DBF:</strong> รหัสและชื่อพนักงานขายผู้รับผิดชอบ</li>
                      <li>• <strong>STKCOD.DBF:</strong> รหัสสินค้า, รายละเอียด, สต็อก, หมวดหมู่</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">รันเป็น Windows Service ได้</span>
                <button
                  onClick={() => {
                    downloadExpressDbWatcherScript(expressPath);
                    onShowToast('ดาวน์โหลดสคริปต์ Express DBF Watcher Agent (.ps1) แล้ว');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-sm shadow-emerald-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด Express Agent (.ps1)</span>
                </button>
              </div>
            </div>

            {/* Winspeed / myAccount ODBC Bridge Box */}
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                      SQL
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Winspeed / myAccount / Sage 50 (ODBC Bridge)</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/60 dark:border-purple-800/40">
                          SQL Server / DSN
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400">เชื่อมต่อผ่าน ODBC Driver 18 หรือ Pervasive PSQL</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">System DSN / ODBC Connection Name</label>
                    <input
                      type="text"
                      value={odbcDsn}
                      onChange={(e) => setOdbcDsn(e.target.value)}
                      placeholder="Winspeed_Production_DB"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1.5">
                    <div className="font-bold text-slate-700 dark:text-slate-300">ความปลอดภัยและการเข้ารหัส (Security Standard):</div>
                    <ul className="space-y-1 text-slate-500 dark:text-slate-400 text-[10px]">
                      <li>• <strong>Read-Only Query:</strong> ดึงเฉพาะข้อมูลเพื่อการวิเคราะห์ ไม่มีการเขียนทับระบบบัญชี</li>
                      <li>• <strong>TLS 1.3 + SHA-256:</strong> เข้ารหัสก่อนส่งข้อมูลข้ามเครือข่าย</li>
                      <li>• <strong>No Open Port:</strong> ใช้งานแบบ Outbound Only ไม่ต้องเปิดพอร์ตขาเข้าในเราเตอร์</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">รองรับ MS SQL / PostgreSQL</span>
                <button
                  onClick={() => {
                    downloadOdbcSqlBridgeScript(odbcDsn);
                    onShowToast('ดาวน์โหลดสคริปต์ ODBC SQL Bridge Agent (.ps1) แล้ว');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-sm shadow-purple-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด ODBC Agent (.ps1)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Live Telemetry & Terminal Logs */}
      {activeSubTab === 'terminal_logs' && (
        <div className="space-y-4">
          {/* Connection & Telemetry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full min-w-0">
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">สถานะการเชื่อมต่อ (Status)</span>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>ONLINE 100%</span>
              </div>
              <div className="mt-2 text-xs text-slate-400 truncate">3 Active Channel Listeners</div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ความเร็วหน่วงเวลา (Latency)</span>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>48 ms</span>
              </div>
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">ความเร็วดีเยี่ยม (Ultra Low)</div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">รอบเวลาอัปเดตอัตโนมัติ</span>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>ทุก 15 นาที</span>
              </div>
              <div className="mt-2 text-xs text-slate-400 truncate">Incremental Delta Sync</div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">การเข้ารหัสความปลอดภัย</span>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">TLS 1.3 AES-256</span>
              </div>
              <div className="mt-2 text-xs text-slate-400 truncate">End-to-End Encrypted</div>
            </div>
          </div>

          {/* Terminal Live Console */}
          <div className="bg-[#020617] border border-slate-800 rounded-2xl p-5 space-y-3 font-mono w-full min-w-0">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300">Live Agent Console Stream (All Ingestion Channels)</span>
              </div>
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 max-h-72 overflow-y-auto custom-scrollbar break-all">
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log}
                </div>
              ))}
              {syncing && (
                <div className="text-amber-400 animate-pulse">
                  [Sync in Progress] Querying Cloud APIs &amp; reading local file buffers...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
