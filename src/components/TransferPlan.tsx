import { useState } from 'react';
import { TransferSuggestion } from '../types';
import { Send, ArrowRight, CheckCircle, Copy, Check } from 'lucide-react';

interface TransferPlanProps {
  suggestions: TransferSuggestion[];
}

export default function TransferPlan({ suggestions }: TransferPlanProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h4 className="text-base font-bold text-emerald-800">所有帳目已結清</h4>
        <p className="mt-1 text-sm text-emerald-600">
          旅伴之間的代墊費用完美平分，不需要進行任何額外轉帳！
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
      <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Send className="w-5 h-5 text-indigo-500" />
        建議轉帳路徑 (最少轉帳次數)
      </h4>
      <p className="text-xs text-slate-500 mb-4">
        透過平分與差額分析，我們計算出最簡化的還款途徑，可省去多次小額互轉。
      </p>

      <div className="space-y-3">
        {suggestions.map((plan, index) => {
          const transferText = `${plan.from} 轉帳 NT$ ${Math.round(plan.amount).toLocaleString()} 給 ${plan.to}`;
          return (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-slate-200/60 shadow-2xs hover:shadow-xs hover:border-indigo-100 transition-all group"
            >
              {/* 轉帳視覺化 */}
              <div className="flex items-center gap-3">
                {/* 債務人 */}
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-semibold uppercase">付款人</span>
                  <span className="text-sm font-bold text-slate-700">{plan.from}</span>
                </div>

                {/* 箭頭與金額 */}
                <div className="flex flex-col items-center px-4 py-1.5 rounded-lg bg-indigo-50/50 border border-indigo-100/40 min-w-[120px] relative overflow-hidden">
                  <span className="text-xs font-bold text-indigo-600 z-10">
                    NT$ {Math.round(plan.amount).toLocaleString()}
                  </span>
                  <ArrowRight className="w-4 h-4 text-indigo-400 mt-0.5 group-hover:translate-x-1.5 transition-transform duration-300 z-10" />
                  <div className="absolute inset-0 bg-linear-to-r from-indigo-50/20 to-indigo-100/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* 債權人 */}
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-semibold uppercase">收款人</span>
                  <span className="text-sm font-bold text-slate-700">{plan.to}</span>
                </div>
              </div>

              {/* 複製與操作按鈕 */}
              <button
                onClick={() => handleCopy(transferText, index)}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  copiedId === index
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                {copiedId === index ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    複製建議
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
