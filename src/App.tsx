import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Itinerary from './components/Itinerary';
import Settlement from './components/Settlement';
import RateCalculator from './components/RateCalculator';
import ExpenseFormLiff from './components/ExpenseFormLiff';
import { getItinerary, getExpenses } from './services/api';
import { ItineraryDay, Expense } from './types';
import { Palmtree, RefreshCw, AlertCircle } from 'lucide-react';
import './App.css';

export default function App() {
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 簡易條件式路由：當 URL 包含 liff=true、/liff 或 #/liff 時，獨立呈現記帳表單
  const isLiffView = window.location.pathname === '/liff' ||
                     window.location.hash === '#/liff' ||
                     window.location.search.includes('liff=true');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itineraryData, expensesData] = await Promise.all([
        getItinerary(),
        getExpenses(),
      ]);
      setItinerary(itineraryData);
      setExpenses(expensesData);
    } catch (err) {
      console.error('Failed to load travel data:', err);
      setError('獲取資料時發生錯誤，請稍後再試。');
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  };

  useEffect(() => {
    if (isLiffView) {
      setLoading(false);
      return;
    }
    loadData();
  }, []);

  if (isLiffView) {
    return <ExpenseFormLiff />;
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* 導覽列 */}
      <Navbar />

      {/* 主頁面 */}
      <main className="flex-grow pt-16">
        {loading ? (
          // 高質感 Loading 畫面
          <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="relative flex items-center justify-center">
              {/* 外圈脈動 */}
              <div className="absolute w-36 h-36 rounded-full bg-teal-400/20 animate-ping" />
              {/* 中圈旋轉 */}
              <div className="absolute w-24 h-24 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
              {/* 內圈圖示 */}
              <div className="relative p-5 bg-white rounded-full shadow-lg text-teal-500">
                <Palmtree className="w-12 h-12 animate-bounce" />
              </div>
            </div>
            <h3 className="mt-8 text-lg font-bold text-slate-700 tracking-wide animate-pulse">
              正在載入宿霧旅程與帳目資料...
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              這只需要幾秒鐘的時間
            </p>
          </div>
        ) : error ? (
          // 錯誤提示畫面
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="p-4 bg-rose-100/80 text-rose-600 rounded-full mb-4">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{error}</h3>
            <button
              onClick={loadData}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-semibold shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              重新整理
            </button>
          </div>
        ) : (
          <>
            {/* 行程表區塊 */}
            <div className="bg-transparent">
              <Itinerary days={itinerary} />
            </div>

            {/* 隔斷線 */}
            <div className="max-w-5xl mx-auto border-t border-slate-200/60 my-4" />

            {/* 匯率計算機區塊 */}
            <div className="bg-transparent">
              <RateCalculator />
            </div>

            {/* 隔斷線 */}
            <div className="max-w-5xl mx-auto border-t border-slate-200/60 my-4" />

            {/* 分帳結算區塊 */}
            <div className="bg-transparent">
              <Settlement expenses={expenses} onExpensesChange={setExpenses} />
            </div>
          </>
        )}
      </main>

      {/* Footer 區塊 */}
      <footer className="bg-white border-t border-slate-200/60 py-10 text-center">
        <div className="max-w-7xl mx-auto px-4 text-slate-400 text-xs font-semibold tracking-wider">
          <p>© 2026 Cebu Split. All Rights Reserved. Designed for premium travel bookkeeping.</p>
          <p className="mt-2 text-slate-300">
            Tech Stack: React 19 • TypeScript • Tailwind CSS v4 • ECharts
          </p>
        </div>
      </footer>
    </div>
  );
}
