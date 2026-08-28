import React, { useState } from 'react';
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
  Palette,
  Eye,
  Check,
  RotateCcw,
  Sliders,
  Type,
  LayoutGrid,
  Square,
  Sun,
  Moon,
} from 'lucide-react';
import { FeatureToggles, UserProfile, ThemeConfig, ThemePresetId } from '../types';
import { THEME_PRESETS, DEFAULT_THEME } from '../utils/themePresets';

interface SettingsAdminViewProps {
  features: FeatureToggles;
  onToggleFeature: (key: keyof FeatureToggles) => void;
  currentUser: UserProfile;
  onSelectRole: (role: UserProfile['role']) => void;
  onShowToast: (msg: string) => void;
  themeConfig: ThemeConfig;
  onUpdateTheme: (theme: ThemeConfig) => void;
}

export const SettingsAdminView: React.FC<SettingsAdminViewProps> = ({
  features,
  onToggleFeature,
  currentUser,
  onSelectRole,
  onShowToast,
  themeConfig,
  onUpdateTheme,
}) => {
  const [editingBrand, setEditingBrand] = useState({
    brandName: themeConfig.brandName,
    brandSubtitle: themeConfig.brandSubtitle,
    logoText: themeConfig.logoText,
    companyName: themeConfig.companyName,
  });

  const isSuperAdmin = currentUser.role === 'executive' || currentUser.role === 'finance';

  const handleSelectPreset = (presetId: ThemePresetId) => {
    const preset = THEME_PRESETS[presetId];
    const updated: ThemeConfig = {
      ...preset,
      brandName: editingBrand.brandName || preset.brandName,
      brandSubtitle: editingBrand.brandSubtitle || preset.brandSubtitle,
      logoText: editingBrand.logoText || preset.logoText,
      companyName: editingBrand.companyName || preset.companyName,
    };
    onUpdateTheme(updated);
    onShowToast(`✓ ปรับใช้ธีม "${preset.name}" เรียบร้อยแล้ว`);
  };

  const handleUpdateSidebarStyle = (style: ThemeConfig['sidebarStyle']) => {
    onUpdateTheme({ ...themeConfig, sidebarStyle: style });
    onShowToast(`✓ ปรับสไตล์ Sidebar เป็น ${style === 'light-clean' ? 'สีขาวสว่าง โปร่งตา' : 'สีเข้มพรีเมียม'}`);
  };

  const handleUpdateDensity = (density: ThemeConfig['density']) => {
    onUpdateTheme({ ...themeConfig, density });
    onShowToast(`✓ ปรับระยะช่องไฟ (Density) เป็น ${density === 'airy' ? 'Airy โปร่งสบายตา' : density === 'compact' ? 'Compact กระชับ' : 'Comfortable มาตรฐาน'}`);
  };

  const handleUpdateRadius = (radius: ThemeConfig['borderRadius']) => {
    onUpdateTheme({ ...themeConfig, borderRadius: radius });
    onShowToast(`✓ ปรับความโค้งมนของขอบ (Border Radius) เรียบร้อย`);
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ThemeConfig = {
      ...themeConfig,
      brandName: editingBrand.brandName.trim() || 'Sage 50 BI',
      brandSubtitle: editingBrand.brandSubtitle.trim() || 'Enterprise Analytics',
      logoText: editingBrand.logoText.trim() || 'S50',
      companyName: editingBrand.companyName.trim() || 'บริษัท ตัวอย่างการค้า จำกัด',
    };
    onUpdateTheme(updated);
    onShowToast('✓ บันทึกชื่อระบบและแบรนด์ White-label เรียบร้อยแล้ว');
  };

  const handleResetTheme = () => {
    onUpdateTheme(DEFAULT_THEME);
    setEditingBrand({
      brandName: DEFAULT_THEME.brandName,
      brandSubtitle: DEFAULT_THEME.brandSubtitle,
      logoText: DEFAULT_THEME.logoText,
      companyName: DEFAULT_THEME.companyName,
    });
    onShowToast('↺ รีเซ็ตธีมและแบรนด์กลับสู่ค่ามาตรฐานเดิม (Classic Default)');
  };

  return (
    <div id="view-settings-admin" className="space-y-6 w-full min-w-0">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0 shadow-xs">
        <div className="flex items-center space-x-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/40 flex items-center justify-center shrink-0 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex flex-wrap items-center gap-2">
              <span>Enterprise Administration, Themes &amp; White-Label Studio</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200/60 dark:border-teal-800/40 whitespace-nowrap">
                Admin Exclusive
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ปรับแต่งธีมการแสดงผลให้โปร่งตา, ปรับ Sidebar ขาว/มืด, เปลี่ยนความโค้งมน, และกำหนดชื่อแบรนด์ White-Label
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleResetTheme}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตเป็นธีมเดิม (Classic Default)</span>
          </button>
        )}
      </div>

      {/* 1. Theme Presets & Visual Customization */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 w-full min-w-0 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Enterprise Theme Presets (ชุดธีมและสไตล์การแสดงผล)
              </h3>
              <p className="text-xs text-slate-400">
                รวมธีมเดิม (Classic Default) และชุดธีมใหม่ ให้คุณเลือกปรับตามความต้องการ
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
            กำลังใช้งาน: {themeConfig.name}
          </span>
        </div>

        {/* Theme Preset Cards Grid */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>1. เลือกชุดธีม (คลิกเพื่อสลับทันที):</span>
            <span className="text-[11px] text-slate-400">มี 7 สไตล์ให้เลือก</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {
                id: 'classic-original' as const,
                title: 'Classic Default',
                desc: 'เวอร์ชันเดิม High-Contrast (น้ำเงิน)',
                accent: '#2563eb',
                bgPreview: 'bg-[#0f172a]',
                accentBadge: 'bg-blue-600',
                badgeText: 'ต้นฉบับเดิม',
              },
              {
                id: 'light-minimal' as const,
                title: 'Airy Light Clean',
                desc: 'Sidebar สีขาวสว่าง โปร่งตา สบายที่สุด',
                accent: '#0d9488',
                bgPreview: 'bg-white',
                accentBadge: 'bg-teal-500',
                badgeText: 'โปร่งสบายตา',
              },
              {
                id: 'teal-modern' as const,
                title: 'Airy Petrol Teal',
                desc: 'Modern FinTech เขียวหัวเป็ด',
                accent: '#0d9488',
                bgPreview: 'bg-[#0b1324]',
                accentBadge: 'bg-teal-500',
                badgeText: 'FinTech',
              },
              {
                id: 'navy-corporate' as const,
                title: 'Corporate Royal Navy',
                desc: 'Banking & Financial สถาบันการเงิน',
                accent: '#2563eb',
                bgPreview: 'bg-[#091428]',
                accentBadge: 'bg-blue-600',
                badgeText: 'ธนาคาร',
              },
              {
                id: 'emerald-sage' as const,
                title: 'Sage Classic Emerald',
                desc: 'Sage 50 ดั้งเดิม สีเขียวมรกต',
                accent: '#059669',
                bgPreview: 'bg-[#06241a]',
                accentBadge: 'bg-emerald-600',
                badgeText: 'Sage Heritage',
              },
              {
                id: 'indigo-tech' as const,
                title: 'Silicon Valley Indigo',
                desc: 'Cloud SaaS สีม่วงน้ำเงิน',
                accent: '#4f46e5',
                bgPreview: 'bg-[#0b1324]',
                accentBadge: 'bg-indigo-600',
                badgeText: 'Cloud SaaS',
              },
              {
                id: 'obsidian-luxury' as const,
                title: 'Obsidian Minimalist',
                desc: 'Monochrome ขาว-ดำคมชัดสูง',
                accent: '#0f172a',
                bgPreview: 'bg-[#000000]',
                accentBadge: 'bg-slate-800',
                badgeText: 'Luxury',
              },
            ].map((p) => {
              const isSelected = themeConfig.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id)}
                  className={`p-3.5 rounded-xl border text-left transition relative cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-teal-500 dark:border-teal-400 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Color Swatch Preview */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-5 h-5 rounded-md ${p.bgPreview} border border-slate-300 dark:border-slate-600 flex items-center justify-center shadow-2xs`}>
                        <div className={`w-2 h-2 rounded-full ${p.accentBadge}`}></div>
                      </div>
                      <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: p.accent }}></div>
                    </div>
                    {isSelected ? (
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                        {p.badgeText}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{p.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Structural Customization Controls: Sidebar Style, Density & Border Radius */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            2. ปรับแต่งโครงสร้างและมิติหน้าจอ (Layout &amp; Sidebar Controls):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sidebar Style (Light vs Dark) */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>สไตล์แถบเมนูซ้าย (Sidebar Style)</span>
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleUpdateSidebarStyle('light-clean')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border transition cursor-pointer ${
                    themeConfig.sidebarStyle === 'light-clean'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>สีขาวสว่าง (Light)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSidebarStyle('deep-slate')}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border transition cursor-pointer ${
                    themeConfig.sidebarStyle !== 'light-clean'
                      ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>สีเข้มพรีเมียม (Dark)</span>
                </button>
              </div>
            </div>

            {/* Spacing Density */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-500" />
                <span>ความโปร่งของช่องไฟ (Density)</span>
              </span>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['airy', 'comfortable', 'compact'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleUpdateDensity(d)}
                    className={`p-2 rounded-lg text-xs font-semibold text-center border capitalize transition cursor-pointer ${
                      themeConfig.density === d
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    {d === 'airy' ? 'Airy (โปร่ง)' : d === 'compact' ? 'Compact' : 'Normal'}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Radius */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Square className="w-3.5 h-3.5 text-blue-500" />
                <span>ความโค้งมนของขอบ (Corners)</span>
              </span>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { r: 'rounded-2xl' as const, label: 'มนละมุน 16px' },
                  { r: 'rounded-xl' as const, label: 'มาตรฐาน 12px' },
                  { r: 'rounded-none' as const, label: 'เหลี่ยมคม 0px' },
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => handleUpdateRadius(item.r)}
                    className={`p-2 rounded-lg text-[11px] font-semibold text-center border transition cursor-pointer ${
                      themeConfig.borderRadius === item.r
                        ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. White-Label Branding Form */}
        <form onSubmit={handleSaveBranding} className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>3. ปรับแต่งชื่อแบรนด์และข้อความหัวระบบ (White-Label Customization):</span>
            <span className="text-[11px] text-slate-400">ระบบจะอัปเดต Header และ Sidebar ทันที</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Type className="w-3 h-3" />
                <span>ชื่อระบบหลัก (Brand Name)</span>
              </label>
              <input
                type="text"
                value={editingBrand.brandName}
                onChange={(e) => setEditingBrand({ ...editingBrand, brandName: e.target.value })}
                placeholder="เช่น Sage 50 BI หรือ SCG Analytics"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <LayoutGrid className="w-3 h-3" />
                <span>คำบรรยายย่อย (Subtitle)</span>
              </label>
              <input
                type="text"
                value={editingBrand.brandSubtitle}
                onChange={(e) => setEditingBrand({ ...editingBrand, brandSubtitle: e.target.value })}
                placeholder="เช่น Enterprise Analytics Platform"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span className="font-mono">S50</span>
                <span>ป้ายโลโก้ย่อ (Logo Badge)</span>
              </label>
              <input
                type="text"
                maxLength={5}
                value={editingBrand.logoText}
                onChange={(e) => setEditingBrand({ ...editingBrand, logoText: e.target.value })}
                placeholder="เช่น S50, SCG, BI"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>ชื่อบริษัทลูกค้า (Company Name)</span>
              </label>
              <input
                type="text"
                value={editingBrand.companyName}
                onChange={(e) => setEditingBrand({ ...editingBrand, companyName: e.target.value })}
                placeholder="เช่น บริษัท ตัวอย่างการค้า จำกัด"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>บันทึกการตั้งค่า White-Label</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2-Column: Feature Toggles & Role Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
        {/* Modular Feature Toggles */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Modular Feature Toggles (เปิด/ปิดโมดูล)</h3>
          </div>

          <div className="space-y-2.5">
            {[
              {
                key: 'aiCopilot' as const,
                label: 'Gemini AI Assistant & Copilot',
                desc: 'ผู้ช่วยอัจฉริยะวิเคราะห์ธุรกิจและตอบคำถามการเงิน',
                icon: Sparkles,
                color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border-teal-100 dark:border-teal-900/40',
              },
              {
                key: 'arAging' as const,
                label: 'AR Aging & Debt Collection Matrix',
                desc: 'วิเคราะห์หนี้เกินกำหนดและสร้างหนังสือทวงถามอัตโนมัติ',
                icon: Shield,
                color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900/40',
              },
              {
                key: 'cashFlowForecast' as const,
                label: 'Cash Flow Projection & What-If Simulator',
                desc: 'แบบจำลองกระแสเงินสดรับล่วงหน้า 12 สัปดาห์ และจำลองผลกระทบสภาพคล่อง',
                icon: Shield,
                color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900/40',
              },
              {
                key: 'salesCommission' as const,
                label: 'Sales Targets, Quotas & Commission Tracker',
                desc: 'ติดตามเป้าหมายยอดขายรายบุคคล คำนวณคอมมิชชั่นขั้นบันได และจำลองนโยบายผลตอบแทน',
                icon: Shield,
                color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/40',
              },
              {
                key: 'inventoryValuation' as const,
                label: 'Inventory Valuation (FIFO & Dead Stock)',
                desc: 'คำนวณมูลค่าสินค้าคงคลัง สินค้าเคลื่อนไหวช้า และจุดสั่งซื้อซ้ำ',
                icon: Shield,
                color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900/40',
              },
              {
                key: 'reportStudio' as const,
                label: 'Report Studio (Pill Drag & Drop Pivot)',
                desc: 'สร้างรายงานสรุปวิเคราะห์ Pivot Matrix อิสระ',
                icon: Shield,
                color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/40',
              },
              {
                key: 'odbcSync' as const,
                label: 'ODBC Direct Live Sync Monitor',
                desc: 'จำลองการเชื่อมต่อฐานข้อมูล Pervasive / Actian SQL ตรงจาก Sage 50',
                icon: Shield,
                color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900/40',
              },
            ].map((f) => {
              const Icon = f.icon;
              const isEnabled = features[f.key];
              return (
                <div
                  key={f.key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`w-8 h-8 rounded-lg ${f.color} border flex items-center justify-center shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{f.label}</div>
                      <div className="text-[10.5px] text-slate-400 truncate">{f.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onToggleFeature(f.key);
                      onShowToast(`สลับสถานะโมดูล "${f.label}" เป็น ${!isEnabled ? 'เปิดใช้งาน' : 'ปิดการทำงาน'}`);
                    }}
                    className={`p-1 rounded-lg transition cursor-pointer shrink-0 ${
                      isEnabled ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {isEnabled ? <ToggleRight className="w-7 h-7" /> : <ToggleLeft className="w-7 h-7" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* RBAC Simulation Matrix */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-4 w-full min-w-0 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">RBAC Role Simulator (สิทธิ์ตามบทบาท)</h3>
          </div>

          <p className="text-xs text-slate-400">
            คลิกเลือกบทบาทเพื่อทดสอบมุมมองการเข้าถึงข้อมูลตามสิทธิ์ขององค์กร (Role-Based Access Control):
          </p>

          <div className="space-y-2.5">
            {[
              {
                role: 'executive' as const,
                title: 'Executive / Admin (ผู้บริหารระดับสูง)',
                desc: 'สิทธิ์สูงสุด: ดูยอดขาย ต้นทุน กำไร AR และตั้งค่าระบบทั้งหมด',
              },
              {
                role: 'finance' as const,
                title: 'Finance Manager (ผู้จัดการฝ่ายการเงิน)',
                desc: 'สิทธิ์ด้านการเงิน: ดู AR Aging, Cash Flow และ Profit & Loss ได้ครบถ้วน',
              },
              {
                role: 'sales_rep' as const,
                title: 'Sales Rep (Alex Wong - ฝ่ายขาย)',
                desc: 'ความปลอดภัยข้อมูล: เห็นเฉพาะลูกค้าตนเอง และถูกซ่อนต้นทุน COGS / Margin',
              },
              {
                role: 'warehouse' as const,
                title: 'Warehouse Lead (หัวหน้าคลังสินค้า)',
                desc: 'คลังสินค้า: เน้นดู Inventory Valuation, Dead Stock, และจุด Reorder',
              },
            ].map((r) => {
              const isCurrent = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => {
                    onSelectRole(r.role);
                    onShowToast(`สลับการจำลองสิทธิ์เป็น: ${r.title}`);
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                    isCurrent
                      ? 'border-teal-500 dark:border-teal-400 bg-teal-50/40 dark:bg-teal-950/30 ring-2 ring-teal-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                      <span>{r.title}</span>
                      {isCurrent && (
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-semibold">
                          กำลังใช้งาน
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">{r.desc}</div>
                  </div>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
