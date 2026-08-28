import { ThemeConfig, ThemePresetId } from '../types';

export const THEME_PRESETS: Record<ThemePresetId, ThemeConfig> = {
  'classic-original': {
    id: 'classic-original',
    name: 'Classic FinFlow (ต้นฉบับเดิม - High Contrast)',
    brandName: 'FinFlow',
    brandSubtitle: 'Financial Treasury Suite',
    logoText: 'BI',
    companyName: 'บจก. สยาม คูลลิ่ง แอนด์ อินซูเลชั่น',
    accentColor: '#2563eb', // Classic Royal Blue
    accentClass: 'blue',
    sidebarStyle: 'light-clean',
    density: 'comfortable',
    borderRadius: 'rounded-xl',
    cardStyle: 'solid-white',
    showDataHealthBadge: true,
  },
  'teal-modern': {
    id: 'teal-modern',
    name: 'Airy Petrol Teal (Modern FinTech)',
    brandName: 'FinFlow',
    brandSubtitle: 'Financial Treasury Suite',
    logoText: 'BI',
    companyName: 'บจก. สยาม คูลลิ่ง แอนด์ อินซูเลชั่น',
    accentColor: '#0d9488', // Teal-600
    accentClass: 'teal',
    sidebarStyle: 'deep-slate',
    density: 'airy',
    borderRadius: 'rounded-2xl',
    cardStyle: 'glass-flat',
    showDataHealthBadge: true,
  },
  'light-minimal': {
    id: 'light-minimal',
    name: 'Airy Light Clean (Sidebar สีขาวสว่าง โปร่งตา)',
    brandName: 'FinFlow',
    brandSubtitle: 'Financial Treasury Suite',
    logoText: 'BI',
    companyName: 'บจก. สยาม คูลลิ่ง แอนด์ อินซูเลชั่น',
    accentColor: '#2563eb', // Blue-600
    accentClass: 'blue',
    sidebarStyle: 'light-clean',
    density: 'comfortable',
    borderRadius: 'rounded-xl',
    cardStyle: 'solid-white',
    showDataHealthBadge: true,
  },
  'navy-corporate': {
    id: 'navy-corporate',
    name: 'Corporate Royal Navy (Banking & Finance)',
    brandName: 'FinFlow',
    brandSubtitle: 'Financial Treasury Suite',
    logoText: 'BI',
    companyName: 'บจก. สยาม คูลลิ่ง แอนด์ อินซูเลชั่น',
    accentColor: '#2563eb', // Blue-600
    accentClass: 'blue',
    sidebarStyle: 'midnight-navy',
    density: 'airy',
    borderRadius: 'rounded-xl',
    cardStyle: 'border-crisp',
    showDataHealthBadge: true,
  },
  'emerald-sage': {
    id: 'emerald-sage',
    name: 'Sage Classic Emerald (Heritage Edition)',
    brandName: 'FinFlow',
    brandSubtitle: 'Financial Treasury Suite',
    logoText: 'BI',
    companyName: 'บจก. สยาม คูลลิ่ง แอนด์ อินซูเลชั่น',
    accentColor: '#059669', // Emerald-600
    accentClass: 'emerald',
    sidebarStyle: 'forest-dark',
    density: 'airy',
    borderRadius: 'rounded-xl',
    cardStyle: 'solid-white',
    showDataHealthBadge: true,
  },
  'indigo-tech': {
    id: 'indigo-tech',
    name: 'Silicon Valley Indigo (Modern SaaS)',
    brandName: 'FinFlow',
    brandSubtitle: 'Financial Treasury Suite',
    logoText: 'BI',
    companyName: 'บจก. สยาม คูลลิ่ง แอนด์ อินซูเลชั่น',
    accentColor: '#4f46e5', // Indigo-600
    accentClass: 'indigo',
    sidebarStyle: 'deep-slate',
    density: 'airy',
    borderRadius: 'rounded-2xl',
    cardStyle: 'glass-flat',
    showDataHealthBadge: true,
  },
  'obsidian-luxury': {
    id: 'obsidian-luxury',
    name: 'Obsidian Minimalist (Monochrome Luxury)',
    brandName: 'FinFlow',
    brandSubtitle: 'Financial Treasury Suite',
    logoText: 'BI',
    companyName: 'บจก. สยาม คูลลิ่ง แอนด์ อินซูเลชั่น',
    accentColor: '#0f172a', // Slate-900
    accentClass: 'slate',
    sidebarStyle: 'pure-dark',
    density: 'compact',
    borderRadius: 'rounded-none',
    cardStyle: 'border-crisp',
    showDataHealthBadge: true,
  },
};

// Default is the Classic Original FinFlow as requested
export const DEFAULT_THEME: ThemeConfig = THEME_PRESETS['classic-original'];

export const THEME_STORAGE_KEY = 'finflow_sage50_theme_v5';

export function loadSavedTheme(): ThemeConfig {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_THEME, ...parsed };
    }
  } catch (e) {
    console.error('Error loading theme:', e);
  }
  return DEFAULT_THEME;
}

export function saveTheme(config: ThemeConfig): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving theme:', e);
  }
}
