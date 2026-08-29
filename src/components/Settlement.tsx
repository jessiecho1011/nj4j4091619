import { Expense } from '../types';
import { calculateBalances, generateTransferPlan } from '../utils/settlement';
import ExpenseTable from './ExpenseTable';
import TransferPlan from './TransferPlan';
import { DollarSign, Wallet, Users, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface SettlementProps {
  expenses: Expense[];
  onExpensesChange: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export default function Settlement({ expenses, onExpensesChange }: SettlementProps) {
  const { balances, totalTWD } = calculateBalances(expenses);
  const transferSuggestions = generateTransferPlan(balances);

  return (
    <section id="settlement" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-12">
      {/* 區塊標頭 */}
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <DollarSign className="w-3.5 h-3.5" />
          Automated Settlement
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          旅費自動化分帳結算
        </h2>
        <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
          統一匯率換算 (1 PHP = 0.55 TWD)，一鍵算清所有人應收付餘額，實現無痛分帳。
        </p>
      </div>

      {/* 頂部關鍵數據卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* 卡片 1: 旅費總額 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 rounded-xl bg-teal-50 text-teal-600">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-400">總消費金額 (折合台幣)</div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              NT$ {Math.round(totalTWD).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              匯率: 1 PHP = 0.55 TWD
            </div>
          </div>
        </div>

        {/* 卡片 2: 旅伴人數 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 rounded-xl bg-amber-50 text-amber-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-400">分帳旅伴人數</div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {balances.length} 人參與
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {balances.map(b => b.name).join(', ')}
            </div>
          </div>
        </div>

        {/* 卡片 3: 旅伴各自支出 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
            <Users className="w-8 h-8" />
          </div>
          <div className="w-full">
            <div className="text-sm font-medium text-slate-400">旅伴各自支出</div>
            <div className="mt-2 space-y-1.5">
              {balances.map((person) => (
                <div key={person.name} className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-slate-600">{person.name}</span>
                  <span className="font-black text-slate-800">
                    NT$ {Math.round(person.shareTWD).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 1. 消費明細表格 (移至個人代墊與餘額明細前面) */}
      <div className="mb-12">
        <ExpenseTable expenses={expenses} onExpensesChange={onExpensesChange} />
      </div>

      {/* 2. 結算與轉帳分析雙欄區塊 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側：個人代墊與餘額明細 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 h-fit">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-500" />
            個人代墊與餘額明細
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {balances.map((person) => {
              const isCreditor = person.balanceTWD >= 0;
              return (
                <div
                  key={person.name}
                  className={`p-5 rounded-2xl border transition-all ${isCreditor
                    ? 'bg-emerald-50/20 border-emerald-100/60 hover:border-emerald-200'
                    : 'bg-rose-50/20 border-rose-100/60 hover:border-rose-200'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-800">{person.name}</h4>
                      <div className="text-xs text-slate-400 mt-1">
                        實際代墊: NT$ {Math.round(person.paidTWD).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        實際應付: NT$ {Math.round(person.shareTWD).toLocaleString()}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${isCreditor
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                        }`}
                    >
                      {isCreditor ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          應收回
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          應補繳
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-xs font-semibold text-slate-500">餘額</span>
                    <span
                      className={`text-xl font-black ${isCreditor ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                    >
                      {isCreditor ? '+' : ''}
                      {Math.round(person.balanceTWD).toLocaleString()}
                    </span>
                    <span className="text-2xs text-slate-400 font-semibold">TWD</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側：轉帳建議計畫 */}
        <div className="h-fit">
          <TransferPlan suggestions={transferSuggestions} />
        </div>
      </div>
    </section>
  );
}
