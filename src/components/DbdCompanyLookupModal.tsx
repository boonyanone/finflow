import React, { useState } from 'react';
import {
  Search,
  Building2,
  CheckCircle2,
  Sparkles,
  X,
  FileCheck2,
  Calendar,
  DollarSign,
  TrendingUp,
  Landmark,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Users,
  MapPin,
  Tag,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import {
  DbdCompanyRecord,
  DBD_REGISTERED_COMPANIES,
  searchDbdCompanies,
  formatThaiTaxId
} from '../services/dbdLookupService';
import { SmeBusinessType } from '../types';

interface DbdCompanyLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCompany: (company: DbdCompanyRecord) => void;
  currentTaxId?: string;
  currentCompanyName?: string;
}

export const DbdCompanyLookupModal: React.FC<DbdCompanyLookupModalProps> = ({
  isOpen,
  onClose,
  onSelectCompany,
  currentTaxId = '',
  currentCompanyName = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(currentTaxId || currentCompanyName || '');
  const [selectedPreview, setSelectedPreview] = useState<DbdCompanyRecord | null>(
    DBD_REGISTERED_COMPANIES[0]
  );

  if (!isOpen) return null;

  const searchResults = searchQuery.trim()
    ? searchDbdCompanies(searchQuery)
    : DBD_REGISTERED_COMPANIES;

  const handleApply = (company: DbdCompanyRecord) => {
    onSelectCompany(company);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50/50 via-white to-blue-50/40 dark:from-teal-950/30 dark:via-slate-900 dark:to-blue-950/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  ค้นหาและดึงข้อมูลนิติบุคคลจากกรมพัฒนาธุรกิจการค้า (DBD Auto-Lookup)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-bold border border-teal-200/60">
                  DBD Open Data
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                กรอกเลข 13 หลัก หรือชื่อบริษัทเพื่อดึงข้อมูลจดทะเบียน, รหัสหมวดธุรกิจ TSIC และงบการเงินนำส่ง DBD ล่าสุด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Quick Sector Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="พิมพ์เลขประจำตัวผู้เสียภาษี 13 หลัก (เช่น 0105558012345) หรือพิมพ์ชื่อบริษัท (เช่น สยาม, ไทยสมาร์ท, รุ่งเรือง)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 shadow-2xs"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
            <span className="text-[11px] text-slate-400 shrink-0 font-medium mr-1">ตัวอย่าง DBD:</span>
            {DBD_REGISTERED_COMPANIES.map((c) => (
              <button
                key={c.taxId}
                onClick={() => {
                  setSearchQuery(c.taxId);
                  setSelectedPreview(c);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer whitespace-nowrap border ${
                  selectedPreview?.taxId === c.taxId
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                }`}
              >
                {c.brandName}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content Split: Results List & Full DBD Details Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left: Search Results List */}
          <div className="md:col-span-5 border-r border-slate-100 dark:border-slate-800 overflow-y-auto custom-scrollbar p-3 space-y-2 max-h-[55vh] md:max-h-none">
            <div className="text-[11px] font-bold text-slate-400 px-2 py-1 flex items-center justify-between">
              <span>พบนิติบุคคลในฐานข้อมูล ({searchResults.length})</span>
              <span className="text-teal-600 dark:text-teal-400">คลิกเพื่อดูรายละเอียด</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs">ไม่พบนิติบุคคลที่ตรงกับคำค้นหา</p>
                <p className="text-[11px] text-slate-400">
                  ลองกรอกเลข 13 หลักให้ครบ หรือระบุชื่อบริษัทเป็นภาษาไทย
                </p>
              </div>
            ) : (
              searchResults.map((company) => {
                const isSelected = selectedPreview?.taxId === company.taxId;
                return (
                  <button
                    key={company.taxId}
                    onClick={() => setSelectedPreview(company)}
                    className={`w-full p-3 rounded-xl border text-left transition cursor-pointer flex flex-col space-y-1.5 ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                        {formatThaiTaxId(company.taxId)}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                        {company.status}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {company.companyNameTh}
                    </div>

                    <div className="text-[11px] text-slate-400 line-clamp-1 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{company.tsicCode} - {company.tsicName}</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span>ทุนจดทะเบียน {company.registeredCapital.toLocaleString('th-TH')} บ.</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold">
                        {isSelected ? 'กำลังดูข้อมูล' : 'เลือก'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Full DBD Dossier & Financial Benchmark Preview */}
          <div className="md:col-span-7 p-5 overflow-y-auto custom-scrollbar space-y-4 max-h-[55vh] md:max-h-none bg-slate-50/40 dark:bg-slate-900/20">
            {selectedPreview ? (
              <div className="space-y-4">
                {/* Company Header Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4.5 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-teal-600 text-white font-mono text-xs font-bold shadow-2xs">
                          TAX ID: {formatThaiTaxId(selectedPreview.taxId)}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{selectedPreview.status}</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1.5 leading-snug">
                        {selectedPreview.companyNameTh}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {selectedPreview.companyNameEn}
                      </p>
                    </div>
                  </div>

                  {/* DBD Registration Facts Grid */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                      <span className="text-[10.5px] text-slate-400 block font-medium">วันที่จดทะเบียนจัดตั้ง:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPreview.registrationDate}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                      <span className="text-[10.5px] text-slate-400 block font-medium">ทุนจดทะเบียนชำระแล้ว:</span>
                      <span className="font-bold text-teal-700 dark:text-teal-300">{selectedPreview.registeredCapitalText}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 col-span-2">
                      <span className="text-[10.5px] text-slate-400 block font-medium">หมวดธุรกิจ DBD (TSIC Code):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedPreview.tsicCode} - {selectedPreview.tsicName}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 col-span-2">
                      <span className="text-[10.5px] text-slate-400 block font-medium">ที่ตั้งสำนักงานใหญ่ตามทะเบียน:</span>
                      <span className="text-slate-700 dark:text-slate-300 text-[11.5px]">{selectedPreview.address}</span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 col-span-2">
                      <span className="text-[10.5px] text-slate-400 block font-medium">กรรมการผู้มีอำนาจลงนาม:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-[11.5px]">
                        {selectedPreview.directors.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* DBD Official Financial Benchmark Card */}
                <div className="bg-gradient-to-br from-teal-50/60 via-white to-blue-50/60 dark:from-teal-950/30 dark:via-slate-900 dark:to-blue-950/30 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl p-4.5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                        งบการเงินล่าสุดที่นำส่ง DBD (รอบปี {selectedPreview.dbdFinancialBenchmark.filingYear})
                      </h5>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Benchmark เทียบเคียง
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block">รายได้รวมทั้งปี</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        ฿{(selectedPreview.dbdFinancialBenchmark.totalRevenue / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block">กำไรขั้นต้น (GP)</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm">
                        {selectedPreview.dbdFinancialBenchmark.grossMarginPct}%
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block">กำไรสุทธิ (Net Profit)</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400 text-xs sm:text-sm">
                        ฿{(selectedPreview.dbdFinancialBenchmark.netProfit / 1000000).toFixed(2)}M
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-400 block">สินทรัพย์รวม</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        ฿{(selectedPreview.dbdFinancialBenchmark.totalAssets / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                เลือกนิติบุคคลจากรายการด้านซ้ายเพื่อดูรายละเอียด
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              เมื่อกดเลือก ระบบจะกรอกชื่อนิติบุคคล, เลข Tax ID 13 หลัก และตั้งค่ากลุ่มธุรกิจให้อัตโนมัติ
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              disabled={!selectedPreview}
              onClick={() => selectedPreview && handleApply(selectedPreview)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ดึงข้อมูล DBD ใส่ในระบบทันที</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
