import { useState } from 'react';
import { Expense } from '../types';
import { convertToTWD, ALL_TRAVELERS, normalizeName } from '../utils/settlement';
import { deleteExpense, updateExpense } from '../services/api';
import { Calendar, User, Tag, Edit2, Trash2, X, Loader2 } from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onExpensesChange: React.Dispatch<React.SetStateAction<Expense[]>>;
}

export default function ExpenseTable({ expenses, onExpensesChange }: ExpenseTableProps) {
  const totalTWD = expenses.reduce((sum, exp) => sum + convertToTWD(exp.amount, exp.currency), 0);

  // UI 互動狀態
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentEditExpense, setCurrentEditExpense] = useState<Expense | null>(null);

  // 編輯表單欄位狀態
  const [editItem, setEditItem] = useState<string>('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCurrency, setEditCurrency] = useState<string>('PHP');
  const [editPayer, setEditPayer] = useState<string>('鮭魚');
  const [editParticipants, setEditParticipants] = useState<string[]>(['鮭魚', 'Coni']);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化金額顯示
  const formatAmount = (amount: number, currency: string) => {
    const cur = currency.toUpperCase();
    if (cur === 'PHP') {
      return `₱${amount.toLocaleString()}`;
    }
    if (cur === 'USD') {
      return `$${amount.toLocaleString()}`;
    }
    return `NT$${amount.toLocaleString()}`;
  };

  // 取得代墊人顏色樣式
  const getPayerStyle = (payer: string) => {
    const colors: { [key: string]: string } = {
      鮭魚: 'bg-orange-50 text-orange-700 border-orange-100',
      Coni: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };
    return colors[payer] || 'bg-slate-50 text-slate-700 border-slate-100';
  };

  // 觸發刪除
  const handleDeleteClick = async (id: string) => {
    if (window.confirm('確定要刪除這筆消費紀錄嗎？此操作無法復原。')) {
      setIsActionLoading(true);
      try {
        await deleteExpense(id);
        // 本地更新 React State 陣列
        onExpensesChange((prev) => prev.filter((exp) => exp.id !== id));
      } catch (err) {
        console.error('Failed to delete expense:', err);
        alert('刪除失敗，請稍後再試。');
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  // 啟動編輯視窗
  const handleStartEdit = (exp: Expense) => {
    setCurrentEditExpense(exp);
    setEditItem(exp.item);
    setEditAmount(exp.amount);
    setEditCurrency(exp.currency);
    setEditPayer(exp.payer);
    setEditParticipants(exp.participants || ['鮭魚', 'Coni']);
    setIsModalOpen(true);
  };

  // 儲存編輯
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditExpense) return;

    if (!editItem.trim()) {
      alert('請填寫消費項目名稱');
      return;
    }
    if (Number(editAmount) <= 0) {
      alert('請輸入大於 0 的金額');
      return;
    }

    setIsActionLoading(true);
    try {
      const normalizedPayer = normalizeName(editPayer);
      const normalizedParticipants = editParticipants.map(normalizeName);

      const updated = await updateExpense(currentEditExpense.id, {
        item: editItem.trim(),
        amount: Number(editAmount),
        currency: editCurrency,
        payer: normalizedPayer,
        date: currentEditExpense.date, // 保持原始日期
        participants: normalizedParticipants,
      });

      // 本地局部更新 React State 該筆資料項目
      onExpensesChange((prev) =>
        prev.map((exp) => (exp.id === currentEditExpense.id ? updated : exp))
      );

      // 關閉對話框
      setIsModalOpen(false);
      setCurrentEditExpense(null);
    } catch (err) {
      console.error('Failed to update expense:', err);
      alert('修改失敗，請稍後再試。');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 常用旅伴選項
  const payerOptions = ALL_TRAVELERS;

  // 格式化分攤旅伴文字
  const getParticipantsText = (parts: string[]) => {
    if (!parts || parts.length === 0) return '全體';
    if (parts.length === ALL_TRAVELERS.length) return '全體';
    return parts.join(', ');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Tag className="w-5 h-5 text-teal-500" />
          記帳消費明細 ({expenses.length} 筆)
        </h3>
      </div>

      {/* 桌面端表格 (MD 以上顯示) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-50/30">
              <th className="py-4 px-6">消費日期</th>
              <th className="py-4 px-6">消費項目</th>
              <th className="py-4 px-6">代墊人</th>
              <th className="py-4 px-6">分攤旅伴</th>
              <th className="py-4 px-6 text-right">原始金額</th>
              <th className="py-4 px-6 text-right">換算台幣 (TWD)</th>
              <th className="py-4 px-6 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {expenses.map((exp) => {
              const twdAmount = convertToTWD(exp.amount, exp.currency);
              return (
                <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                    {formatDate(exp.date)}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    {exp.item}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPayerStyle(exp.payer)}`}>
                      {exp.payer}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-650 text-xs">
                    {getParticipantsText(exp.participants)}
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-slate-600 whitespace-nowrap">
                    {formatAmount(exp.amount, exp.currency)} ({exp.currency})
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-teal-600 whitespace-nowrap">
                    NT$ {Math.round(twdAmount).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => handleStartEdit(exp)}
                        disabled={isActionLoading}
                        className="p-1 text-teal-600 hover:text-white bg-teal-50 hover:bg-teal-500 rounded-lg transition-all border border-teal-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="修改"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(exp.id)}
                        disabled={isActionLoading}
                        className="p-1 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 rounded-lg transition-all border border-rose-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50/50 font-extrabold border-t border-slate-200/80 text-sm">
              <td className="py-4 px-6 text-slate-700" colSpan={4}>總計</td>
              <td className="py-4 px-6 text-right text-slate-500 whitespace-nowrap">
                {/* 原始金額混用不相加 */}
              </td>
              <td className="py-4 px-6 text-right text-teal-600 whitespace-nowrap text-base">
                NT$ {Math.round(totalTWD).toLocaleString()}
              </td>
              <td className="py-4 px-6"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 行動端卡片列表 (MD 以下顯示) */}
      <div className="md:hidden divide-y divide-slate-100">
        {expenses.map((exp) => {
          const twdAmount = convertToTWD(exp.amount, exp.currency);
          return (
            <div key={exp.id} className="p-4 hover:bg-slate-50/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-slate-800 line-clamp-1">{exp.item}</span>
                <span className="text-sm font-bold text-teal-600 whitespace-nowrap">
                  NT$ {Math.round(twdAmount).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold border ${getPayerStyle(exp.payer)}`}>
                    <User className="w-2.5 h-2.5 mr-0.5" />
                    {exp.payer} (付)
                  </span>
                  <span className="text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-full text-2xs font-semibold">
                    分攤: {getParticipantsText(exp.participants)}
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {formatDate(exp.date).split(' ')[0]}
                  </span>
                </div>
                <span className="text-slate-400">
                  原幣: {formatAmount(exp.amount, exp.currency)} ({exp.currency})
                </span>
              </div>

              {/* 行動端操作按鈕 */}
              <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-slate-100/50">
                <button
                  onClick={() => handleStartEdit(exp)}
                  disabled={isActionLoading}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold text-teal-600 bg-teal-50 hover:bg-teal-500 hover:text-white border border-teal-150 transition-all active:scale-95"
                >
                  <Edit2 className="w-3 h-3" />
                  修改
                </button>
                <button
                  onClick={() => handleDeleteClick(exp.id)}
                  disabled={isActionLoading}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-500 hover:text-white border border-rose-150 transition-all active:scale-95"
                >
                  <Trash2 className="w-3 h-3" />
                  刪除
                </button>
              </div>
            </div>
          );
        })}
        {/* 行動端總計卡片 */}
        <div className="md:hidden p-4 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center font-extrabold text-sm">
          <span className="text-slate-650 text-slate-600">消費總計 (折合台幣)</span>
          <span className="text-teal-600 text-base">NT$ {Math.round(totalTWD).toLocaleString()}</span>
        </div>
      </div>

      {/* 編輯消費紀錄對話框 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          {/* 對話框卡片本體 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-scaleUp relative">
            <button
              onClick={() => {
                if (!isActionLoading) {
                  setIsModalOpen(false);
                  setCurrentEditExpense(null);
                }
              }}
              disabled={isActionLoading}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                <Edit2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">編輯消費項目</h3>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* 項目欄位 */}
              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  消費項目名稱
                </label>
                <input
                  type="text"
                  required
                  disabled={isActionLoading}
                  value={editItem}
                  onChange={(e) => setEditItem(e.target.value)}
                  placeholder="例如：HW住宿、包車旅費"
                  className="block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              {/* 金額與幣別 (雙欄) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    原始金額
                  </label>
                  <input
                    type="number"
                    required
                    disabled={isActionLoading}
                    min="0.01"
                    step="any"
                    value={editAmount || ''}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    使用幣別
                  </label>
                  <select
                    disabled={isActionLoading}
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="PHP">PHP 菲律賓披索 (₱)</option>
                    <option value="TWD">TWD 新台幣 (NT$)</option>
                    <option value="USD">USD 美金 ($)</option>
                  </select>
                </div>
              </div>

              {/* 代墊人 */}
              <div>
                <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  代墊付款人
                </label>
                <select
                  disabled={isActionLoading}
                  value={editPayer}
                  onChange={(e) => setEditPayer(e.target.value)}
                  className="block w-full px-3.5 py-2.5 sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-semibold text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  {payerOptions.map((payer) => (
                    <option key={payer} value={payer}>
                      {payer}
                    </option>
                  ))}
                </select>
              </div>

              {/* 參與分攤人 */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-2xs font-bold text-slate-400 uppercase tracking-wider">
                    參與分攤人 (至少選擇一位)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (editParticipants.length < ALL_TRAVELERS.length) {
                        setEditParticipants([...ALL_TRAVELERS]);
                      } else {
                        setEditParticipants([editPayer]);
                      }
                    }}
                    className="text-2xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    {editParticipants.length < ALL_TRAVELERS.length ? '一鍵全選' : '一鍵清空'}
                  </button>
                </div>
                <div className="flex gap-4 p-3 border border-slate-200 rounded-xl bg-white">
                  {ALL_TRAVELERS.map((name) => {
                    const isChecked = editParticipants.includes(name);
                    return (
                      <label key={name} className="flex items-center gap-2 font-semibold text-slate-700 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              if (editParticipants.length > 1) {
                                setEditParticipants(editParticipants.filter(p => p !== name));
                              } else {
                                alert('每筆消費至少需有一位參與分攤人！');
                              }
                            } else {
                              setEditParticipants([...editParticipants, name]);
                            }
                          }}
                          className="w-4 h-4 text-teal-650 border-slate-350 rounded-xs focus:ring-teal-500/20"
                        />
                        {name}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 送出與取消按鈕 */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentEditExpense(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:text-slate-800 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isActionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      儲存中...
                    </>
                  ) : (
                    '儲存變更'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
