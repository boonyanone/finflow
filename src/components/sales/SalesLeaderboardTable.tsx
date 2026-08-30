import React from 'react';
import { SalesRepAttainment } from '../../types';

interface SalesLeaderboardTableProps {
  filteredAttainments: SalesRepAttainment[];
  selectedPeriod: string;
  activeTabFilter: 'all' | 'exceeding' | 'on_track' | 'behind';
  setActiveTabFilter: (filter: 'all' | 'exceeding' | 'on_track' | 'behind') => void;
  searchRep: string;
  setSearchRep: (search: string) => void;
}

export const SalesLeaderboardTable: React.FC<SalesLeaderboardTableProps> = ({
  filteredAttainments,
  selectedPeriod,
  activeTabFilter,
  setActiveTabFilter,
  searchRep,
  setSearchRep,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            ตารางสรุปผลงานและการจ่ายเงินรางวัลคอมมิชชั่น (Sales Attainment &amp; Commission Settlement)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            แสดง {filteredAttainments.length} รายการพนักงานขายประจำงวด {selectedPeriod}
          </p>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTabFilter('all')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                activeTabFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setActiveTabFilter('exceeding')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                activeTabFilter === 'exceeding'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              เกินเป้า (&gt;100%)
            </button>
            <button
              onClick={() => setActiveTabFilter('behind')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                activeTabFilter === 'behind'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              ต้องเร่งยอด
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="ค้นหาชื่อเซลส์..."
            value={searchRep}
            onChange={(e) => setSearchRep(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 font-semibold">
            <tr>
              <th className="p-3 text-center w-12">อันดับ</th>
              <th className="p-3">พนักงานขาย</th>
              <th className="p-3 text-right">เป้าหมาย (Quota)</th>
              <th className="p-3 text-right">ยอดขายจริง (Actual)</th>
              <th className="p-3 text-center">บรรลุเป้า (%)</th>
              <th className="p-3 text-right">กำไรขั้นต้น (GM)</th>
              <th className="p-3 text-right">ฐานคอมมิชชั่น</th>
              <th className="p-3 text-right">โบนัส Kicker</th>
              <th className="p-3 text-right font-bold">คอมมิชชั่นสุทธิ</th>
              <th className="p-3 text-center">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAttainments.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-slate-400 text-xs">
                  ไม่พบข้อมูลพนักงานขายตามเงื่อนไขที่เลือก
                </td>
              </tr>
            ) : (
              filteredAttainments.map((rep) => (
                <tr key={rep.salesRep} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                      rep.rank === 1
                        ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                        : rep.rank === 2
                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {rep.rank}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>{rep.salesRep}</span>
                      {rep.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                          {rep.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{rep.invoiceCount} อินวอยซ์</span>
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-300">
                    ฿{rep.targetRevenue.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-semibold text-slate-900 dark:text-white">
                    ฿{rep.actualRevenue.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                      rep.attainmentPct >= 100
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                        : rep.attainmentPct >= 80
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                        : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                    }`}>
                      {rep.attainmentPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="text-slate-700 dark:text-slate-300">฿{rep.grossProfitAmount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">({rep.actualGrossMarginPct.toFixed(1)}%)</div>
                  </td>
                  <td className="p-3 text-right text-slate-600 dark:text-slate-300">
                    ฿{rep.baseCommission.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                    {rep.bonusKickerCommission > 0 ? `+฿${rep.bonusKickerCommission.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-white text-sm">
                    ฿{rep.totalCommissionEarned.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      rep.status === 'Exceeding'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : rep.status === 'On Track'
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                    }`}>
                      {rep.status === 'Exceeding' ? 'ทะลุเป้า' : rep.status === 'On Track' ? 'ตามเป้าหมาย' : 'ต่ำกว่าเป้า'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
