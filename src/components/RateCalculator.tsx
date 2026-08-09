import { useState } from 'react';
import { Calculator, ArrowRightLeft, RefreshCw, Sparkles } from 'lucide-react';
import { EXCHANGE_RATE_PHP_TO_TWD } from '../utils/settlement';

export default function RateCalculator() {
  const [phpVal, setPhpVal] = useState<string>('');
  const [twdVal, setTwdVal] = useState<string>('');

  const handlePhpChange = (val: string) => {
    setPhpVal(val);
    if (val === '') {
      setTwdVal('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const converted = num / EXCHANGE_RATE_PHP_TO_TWD;
      setTwdVal(Math.round(converted).toString());
    } else {
      setTwdVal('');
    }
  };

  const handleTwdChange = (val: string) => {
    setTwdVal(val);
    if (val === '') {
      setPhpVal('');
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const converted = num * EXCHANGE_RATE_PHP_TO_TWD;
      setPhpVal(Math.round(converted).toString());
    } else {
      setPhpVal('');
    }
  };

  const handleReset = () => {
    setPhpVal('');
    setTwdVal('');
  };

  // 常用對照表數據
  const conversionList = [
    { php: 20, twd: Math.round(20 / EXCHANGE_RATE_PHP_TO_TWD) },
    { php: 50, twd: Math.round(50 / EXCHANGE_RATE_PHP_TO_TWD) },
    { php: 100, twd: Math.round(100 / EXCHANGE_RATE_PHP_TO_TWD) },
    { php: 200, twd: Math.round(200 / EXCHANGE_RATE_PHP_TO_TWD) },
    { php: 500, twd: Math.round(500 / EXCHANGE_RATE_PHP_TO_TWD) },
    { php: 1000, twd: Math.round(1000 / EXCHANGE_RATE_PHP_TO_TWD) },
    { php: 2000, twd: Math.round(2000 / EXCHANGE_RATE_PHP_TO_TWD) },
    { php: 3000, twd: Math.round(3000 / EXCHANGE_RATE_PHP_TO_TWD) },
    { php: 5000, twd: Math.round(5000 / EXCHANGE_RATE_PHP_TO_TWD) },
    { php: 10000, twd: Math.round(10000 / EXCHANGE_RATE_PHP_TO_TWD) },
  ];

  return (
    <section id="calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-12">
      {/* 區塊標頭 */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <Calculator className="w-3.5 h-3.5" />
          Currency Converter
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          宿霧即時匯率計算
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          固定匯率基準：1 TWD = {EXCHANGE_RATE_PHP_TO_TWD} PHP。免去彈窗，專為行動端單手操作設計。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* 左側：常用整數速查對照表 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            常用比索對照速查表 (PHP ➔ TWD)
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            出門在外的購物小助手，列出常見面額，讓您一眼看清台幣大約價值。
          </p>

          <div className="grid grid-cols-2 gap-3">
            {conversionList.map((item) => (
              <div key={item.php} className="flex justify-between items-center py-2.5 px-3 rounded-xl border border-slate-150 hover:bg-slate-50/50 hover:border-teal-100 transition-all font-semibold text-2xs sm:text-xs">
                <div className="flex items-center gap-1 text-slate-500">
                  <span className="text-2xs">₱</span>
                  {item.php.toLocaleString()}
                </div>
                <div className="text-teal-600 font-bold">
                  ≈ NT$ {item.twd.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右側：雙向輸入計算機 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-teal-650 text-teal-600" />
                雙向即時匯率計算器
              </h3>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-655 hover:bg-slate-100 transition-colors"
                title="重設"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              任意輸入其中一方金額，系統將以 1 : 1.7 的匯率即時為您雙向轉換。
            </p>
          </div>

          <div className="space-y-4">
            {/* PHP 輸入框 */}
            <div className="relative">
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                菲律賓披索 (PHP)
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-semibold text-sm">₱</span>
                </div>
                <input
                  type="number"
                  value={phpVal}
                  onChange={(e) => handlePhpChange(e.target.value)}
                  placeholder="0.00"
                  className="block w-full pl-8 pr-12 py-3 sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-semibold text-slate-800"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs font-bold">PHP</span>
                </div>
              </div>
            </div>

            {/* 雙向指示箭頭 */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="p-2 bg-white rounded-full border border-slate-100 shadow-2xs text-teal-655 text-teal-600">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
            </div>

            {/* TWD 輸入框 */}
            <div className="relative">
              <label className="block text-2xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                新台幣 (TWD)
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 font-semibold text-sm">NT$</span>
                </div>
                <input
                  type="number"
                  value={twdVal}
                  onChange={(e) => handleTwdChange(e.target.value)}
                  placeholder="0.00"
                  className="block w-full pl-10 pr-12 py-3 sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white font-semibold text-slate-800"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs font-bold">TWD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
