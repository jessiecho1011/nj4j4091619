import React, { useEffect, useState } from 'react';
import liff from '@line/liff';
import { Send, CheckCircle } from 'lucide-react';

export default function ExpenseFormLiff() {
  // 表單狀態
  const [itemName, setItemName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'PHP' | 'TWD' | 'USD'>('PHP');
  const [payer, setPayer] = useState<'鮭魚' | 'Coni'>('鮭魚');
  const [shareSalmon, setShareSalmon] = useState<boolean>(true);
  const [shareConi, setShareConi] = useState<boolean>(true);

  // LIFF 初始化與狀態
  const [isLiffInit, setIsLiffInit] = useState<boolean>(false);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [isInClient, setIsInClient] = useState<boolean>(false);

  // 模擬發送 Modal 狀態 (非 LINE 環境測試用)
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [simulatedText, setSimulatedText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const liffId = import.meta.env.VITE_LIFF_ID;
    if (!liffId) {
      setLiffError('未設定 VITE_LIFF_ID 環境變數。請在 .env 中填寫此變數後重新啟動開發伺服器。');
      return;
    }

    liff
      .init({ liffId })
      .then(() => {
        setIsLiffInit(true);
        setIsInClient(liff.isInClient());
        console.log('LIFF 初始化成功，環境是否在 LINE App 內:', liff.isInClient());
      })
      .catch((err: Error) => {
        console.error('LIFF 初始化失敗:', err);
        setLiffError(`LIFF 初始化失敗: ${err.message}`);
      });
  }, []);

  // 驗證表單是否有效
  const isFormValid =
    itemName.trim() !== '' &&
    parseFloat(amount) > 0 &&
    (shareSalmon || shareConi);

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    // 1. 決定分攤者字串
    let participantsStr = '';
    if (shareSalmon && shareConi) {
      participantsStr = 'all';
    } else if (shareSalmon) {
      participantsStr = '鮭魚';
    } else if (shareConi) {
      participantsStr = 'Coni';
    }

    // 2. 組合成特定格式字串：$ 項目 金額 幣別 代墊人 分攤者 (半形空格隔開)
    const formattedAmount = parseFloat(amount).toString(); // 去除多餘的小數點零或空格
    const sendText = `$ ${itemName.trim()} ${formattedAmount} ${currency} ${payer} ${participantsStr}`;

    console.log('將要送出的訊息內容:', sendText);

    // 3. 判斷環境發送訊息
    if (liff.isInClient()) {
      liff
        .sendMessages([
          {
            type: 'text',
            text: sendText,
          },
        ])
        .then(() => {
          console.log('訊息送出成功');
          liff.closeWindow();
        })
        .catch((err: Error) => {
          console.error('傳送訊息失敗:', err);
          alert(`傳送訊息失敗: ${err.message}`);
          setIsSubmitting(false);
        });
    } else {
      // 非 LINE 環境，開啟模擬 Modal，不報錯
      setSimulatedText(sendText);
      setShowSimulateModal(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* 頂部高質感卡片 */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">

        {/* 卡片 Header：漸層與宿霧風格 */}
        {/*    <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-8 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-3xs font-extrabold flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            {isInClient ? 'LINE App' : 'Browser'}
          </div>
          
          <div className="inline-flex p-3 bg-white/20 backdrop-blur-xs rounded-2xl mb-3">
            <Palmtree className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">宿霧記帳小助手</h2>
          <p className="text-white/80 text-xs mt-1 font-medium">
            使用 LINE LIFF 快速記帳至 Notion 資料庫
          </p>
        </div> */}

        {/* 錯誤警告區塊 */}
        {/*   {liffError && (
          <div className="m-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-700 text-xs leading-relaxed">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">LIFF 異常提示：</span>
              {liffError}
              <p className="mt-1 text-rose-550 font-semibold">
                提示：若在普通瀏覽器中測試，可忽略初始化失敗，仍可輸入表單查看模擬送出的字串。
              </p>
            </div>
          </div>
        )} */}

        {/* 表單主體 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* 1. 花費項目 */}
          <div className="space-y-1.5">
            <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
              花費項目
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="例如：芒果冰沙、計程車"
              className="block w-full px-4 py-3.5 sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-semibold text-slate-800 transition-colors"
            />
          </div>

          {/* 2. 金額 */}
          <div className="space-y-1.5">
            <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
              金額
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-slate-500 font-bold text-sm">
                  {currency === 'PHP' ? '₱' : currency === 'USD' ? '$' : 'NT$'}
                </span>
              </div>
              <input
                type="number"
                inputMode="decimal"
                required
                min="0.01"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="block ml-1 w-full pl-10 pr-12 py-3.5 sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-semibold text-slate-800 transition-colors"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs font-bold">{currency}</span>
              </div>
            </div>
          </div>

          {/* 3. 幣別 (大面積觸控按鈕式單選) */}
          <div className="space-y-1.5">
            <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
              幣別
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCurrency('PHP')}
                className={`py-3 px-2 rounded-xl font-bold border transition-all duration-200 text-xs flex items-center justify-center gap-1 active:scale-98 ${currency === 'PHP'
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-650 border-slate-200 hover:border-slate-300'
                  }`}
              >
                PHP 比索
              </button>
              <button
                type="button"
                onClick={() => setCurrency('TWD')}
                className={`py-3 px-2 rounded-xl font-bold border transition-all duration-200 text-xs flex items-center justify-center gap-1 active:scale-98 ${currency === 'TWD'
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-650 border-slate-200 hover:border-slate-300'
                  }`}
              >
                TWD 台幣
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`py-3 px-2 rounded-xl font-bold border transition-all duration-200 text-xs flex items-center justify-center gap-1 active:scale-98 ${currency === 'USD'
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-650 border-slate-200 hover:border-slate-300'
                  }`}
              >
                USD 美金
              </button>
            </div>
          </div>

          {/* 4. 代墊人 (大面積觸控按鈕式單選) */}
          <div className="space-y-1.5">
            <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
              代墊人
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayer('鮭魚')}
                className={`py-3 px-4 rounded-xl font-bold border transition-all duration-200 text-sm flex items-center justify-center gap-1.5 active:scale-98 ${payer === '鮭魚'
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-650 border-slate-200 hover:border-slate-300'
                  }`}
              >
                🍣 鮭魚
              </button>
              <button
                type="button"
                onClick={() => setPayer('Coni')}
                className={`py-3 px-4 rounded-xl font-bold border transition-all duration-200 text-sm flex items-center justify-center gap-1.5 active:scale-98 ${payer === 'Coni'
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-650 border-slate-200 hover:border-slate-300'
                  }`}
              >
                🍦 Coni
              </button>
            </div>
          </div>

          {/* 5. 分攤者 (大面積觸控按鈕式多選) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wider">
                分攤者
              </label>
              <span className="text-3xs text-slate-400 font-semibold">
                {shareSalmon && shareConi ? '(皆選中將設為 all)' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  const allSelected = shareSalmon && shareConi;
                  setShareSalmon(!allSelected);
                  setShareConi(!allSelected);
                }}
                className={`col-span-2 py-3 px-4 rounded-xl font-bold border transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-98 ${shareSalmon && shareConi
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
              >
                👥 全選成員
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-3xs border ${shareSalmon && shareConi ? 'bg-white text-teal-600 border-white' : 'border-slate-300 text-transparent'
                  }`}>
                  ✓
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShareSalmon(!shareSalmon)}
                className={`py-3 px-4 rounded-xl font-bold border transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-98 ${shareSalmon
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
              >
                🍣 鮭魚
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-3xs border ${shareSalmon ? 'bg-white text-teal-600 border-white' : 'border-slate-300 text-transparent'
                  }`}>
                  ✓
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShareConi(!shareConi)}
                className={`py-3 px-4 rounded-xl font-bold border transition-all duration-200 text-sm flex items-center justify-center gap-2 active:scale-98 ${shareConi
                  ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
              >
                🍦 Coni
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-3xs border ${shareConi ? 'bg-white text-teal-600 border-white' : 'border-slate-300 text-transparent'
                  }`}>
                  ✓
                </span>
              </button>
            </div>
            {!shareSalmon && !shareConi && (
              <span className="block text-3xs font-semibold text-rose-500 text-center mt-1.5">
                請至少點選一位分攤成員！
              </span>
            )}
          </div>

          {/* 送出按鈕 */}
          <button
            type="submit"
            disabled={!isFormValid || isSubmitting || (!isLiffInit && !liffError && isInClient)}
            className={`w-full py-4 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${isFormValid && !isSubmitting && (isLiffInit || liffError || !isInClient)
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30'
              : 'bg-slate-200 text-slate-450 border border-slate-200 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <span className="inline-block w-5 h-5 rounded-full border-2 border-slate-350 border-t-white animate-spin" />
            ) : !isLiffInit && !liffError && isInClient ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-5 h-5 rounded-full border-2 border-slate-300 border-t-teal-500 animate-spin" />
                初始化中...
              </span>
            ) : (
              <>
                <Send className="w-4.5 h-4.5" />
                送出記帳
              </>
            )}
          </button>

        </form>
      </div>

      {/* 模擬發送 Modal (非 LINE App 環境下展示) */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-550 border-slate-100 flex flex-col items-center text-center animate-scale-up">
            <div className="p-3.5 bg-teal-50 text-teal-650 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-teal-500" />
            </div>
            <h3 className="text-lg font-black text-slate-800">網頁環境模擬送出</h3>
            <p className="text-xs text-slate-400 mt-2 px-2 leading-relaxed">
              偵測到您目前處於一般瀏覽器中，在此環境下無法直接傳送訊息至 LINE 聊天室。以下為生成的記帳字串：
            </p>

            {/* 生成的字串框 */}
            <div className="w-full bg-slate-50 border border-slate-150 rounded-2xl py-3.5 px-4 font-mono font-bold text-teal-600 text-sm select-all mt-4 leading-normal break-all">
              {simulatedText}
            </div>

            <p className="text-3xs text-slate-400 mt-3 italic">
              （在 LINE APP 內將直接傳送此字串並關閉視窗）
            </p>

            <button
              onClick={() => {
                setShowSimulateModal(false);
                setItemName('');
                setAmount('');
              }}
              className="mt-6 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
