import React from 'react';
import {
  Shield,
  ToggleLeft,
  ToggleRight,
  Users,
  Building2,
  Lock,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { FeatureToggles, UserProfile } from '../types';

interface SettingsAdminViewProps {
  features: FeatureToggles;
  onToggleFeature: (key: keyof FeatureToggles) => void;
  currentUser: UserProfile;
  onSelectRole: (role: UserProfile['role']) => void;
  onShowToast: (msg: string) => void;
}

export const SettingsAdminView: React.FC<SettingsAdminViewProps> = ({
  features,
  onToggleFeature,
  currentUser,
  onSelectRole,
  onShowToast,
}) => {
  return (
    <div id="view-settings-admin" className="space-y-5 sm:space-y-6 w-full min-w-0">
      {/* Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full min-w-0 shadow-sm">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0 shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span>System Settings, RBAC &amp; Modular Features</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/60 dark:border-blue-800/40 whitespace-nowrap">
                Super Admin
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              ควบคุมการเปิด-ปิดโมดูลระบบ, จำลองสิทธิ์บทบาทผู้ใช้งาน (RBAC), และจัดการความปลอดภัย
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
        {/* Modular Feature Toggles */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Modular Feature Toggles (เปิด/ปิดโมดูล)</h3>
          </div>

          <div className="space-y-2.5">
            {[
              {
                key: 'aiCopilot' as const,
                label: 'Gemini AI Assistant & Copilot',
                desc: 'ผู้ช่วยอัจฉริยะวิเคราะห์ธุรกิจและตอบคำถามการเงิน',
                icon: Sparkles,
                color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/40',
              },
              {
                key: 'arAging' as const,
                label: 'AR Aging & Debt Collection Matrix',
                desc: 'วิเคราะห์อายุลูกหนี้ 0-90+ วัน และระบบร่างทวงหนี้อัตโนมัติ',
                icon: Shield,
                color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/40',
              },
              {
                key: 'inventoryValuation' as const,
                label: 'Inventory Health & Valuation',
                desc: 'ระบบประเมินมูลค่าสินค้าคงคลังและแจ้งเตือน Reorder Point',
                icon: Layers,
                color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900/40',
              },
              {
                key: 'reportStudio' as const,
                label: 'Self-Service Report Studio',
                desc: 'เครื่องมือสร้างรายงานอิสระแบบ Drag-and-Drop (แทน Crystal Reports)',
                icon: Layers,
                color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900/40',
              },
              {
                key: 'odbcSync' as const,
                label: 'Sage 50 Direct ODBC Sync Agent',
                desc: 'การเชื่อมต่อฐานข้อมูล Sage 50 ผ่าน ODBC Driver แบบสด',
                icon: Shield,
                color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-100 dark:border-sky-900/40',
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = features[item.key];
              return (
                <div
                  key={item.key}
                  className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.label}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">{item.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onToggleFeature(item.key);
                      onShowToast(`สลับสถานะโมดูล "${item.label}" เรียบร้อยแล้ว`);
                    }}
                    className="p-1 text-slate-900 dark:text-white hover:opacity-80 transition shrink-0 cursor-pointer"
                  >
                    {isActive ? (
                      <ToggleRight className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RBAC Role Simulator & Masking Guard */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Role Simulator &amp; Security Masking</h3>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              ทดสอบมุมมองของแต่ละตำแหน่ง เพื่อตรวจสอบว่าระบบซ่อนต้นทุนและจำกัดข้อมูลถูกต้องตามนโยบาย:
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  role: 'executive' as const,
                  name: 'Executive / CEO',
                  desc: 'ดูได้ทุกตัวชี้วัด, ยอดขาย, กำไรขั้นต้น, สต็อก และลูกหนี้ครบถ้วน',
                  access: 'Full Access (All Metrics)',
                },
                {
                  role: 'finance' as const,
                  name: 'Finance & Accounting Manager',
                  desc: 'เข้าถึงการเงิน, AR Aging, ต้นทุน COGS, และการทำรายงานทั้งหมด',
                  access: 'Financial Full Access',
                },
                {
                  role: 'sales_rep' as const,
                  name: 'Sales Representative (Alex Wong)',
                  desc: 'ซ่อนต้นทุนสินค้า (COGS) และ Gross Margin / เห็นเฉพาะยอดขายของตนเอง',
                  access: 'Restricted (Masked Cost & Margin)',
                  hasLock: true,
                },
                {
                  role: 'warehouse' as const,
                  name: 'Warehouse & Inventory Manager',
                  desc: 'เน้นการจัดการสต็อก, จุดสั่งซื้อซ้ำ Reorder, และมูลค่าสินทรัพย์คลัง',
                  access: 'Inventory Focus',
                },
              ].map((r) => {
                const isSelected = currentUser.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => {
                      onSelectRole(r.role);
                      onShowToast(`สลับไปสู่สิทธิ์: ${r.name}`);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-slate-900 dark:text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                        <span>{r.name}</span>
                        {isSelected && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold whitespace-nowrap shadow-sm shadow-blue-500/20">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 flex items-center gap-1">
                        {r.hasLock && <Lock className="w-3 h-3 text-amber-500 shrink-0 inline" />}
                        <span>{r.desc}</span>
                      </div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
                        {r.access}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

