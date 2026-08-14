import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { ItineraryDay } from '../types';

interface ItineraryProps {
  days: ItineraryDay[];
}

export default function Itinerary({ days }: ItineraryProps) {
  // 將 ISO 日期字串格式化為更易讀的格式
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <section id="itinerary" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-12">
      {/* 區塊標題 */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Cebu Itinerary
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          宿霧熱帶島嶼行程表
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          四天三夜的陽光、沙灘與海上冒險，帶您暢遊宿霧絕美地標與震撼的群島生態。
        </p>
      </div>

      {/* 時間軸本體 */}
      <div className="relative border-l border-teal-200 ml-4 space-y-12">
        {days.map((day) => (
          <div key={day.id} className="relative pl-6 sm:pl-10 group">
            {/* 時間軸標記 (Day X) */}
            <div className="absolute -left-[17px] top-1.5 flex items-center justify-center">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white font-bold text-sm shadow-md shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                {day.day}
              </span>
            </div>

            {/* 桌面端日期顯示於左側 */}
            {/*    <div className="hidden sm:block absolute -left-32 top-2 w-24 text-right">
              <div className="text-sm font-bold text-slate-800">Day {day.day}</div>
              <div className="text-xs text-slate-500">{formatDate(day.date).split(' ')[0]}</div>
            </div> */}

            {/* 每日行程卡片 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-100 hover:shadow-lg hover:border-teal-300 hover:-translate-y-0.5 transition-all duration-300">
              {/* 卡片標頭 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-4">
                <div>
                  <div className="text-h1 font-semibold text-teal-700 mb-1">
                    Day {day.day} • {formatDate(day.date)}
                  </div>
                  {/*   <h3 className="text-lg sm:text-xl font-bold text-slate-800 ">
                    {day.title}
                  </h3> */}
                </div>
                {/* <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(day.date)}
                </div> */}
              </div>

              {/* 景點條列 */}
              <div>

                <div className="grid grid-cols-1 gap-3">
                  {day.spots.map((spot, spotIndex) => (
                    <div
                      key={spotIndex}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/40 border border-slate-200 hover:bg-teal-400/20 hover:border-teal-100/50 transition-all group/spot"
                    >
                      <div className="p-1.5 rounded-lg bg-teal-100/80 text-teal-600 group-hover/spot:bg-teal-500 group-hover/spot:text-white transition-colors mt-0.5">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-md font-semibold text-slate-700 group-hover/spot:text-teal-950 transition-colors">
                          {spot}
                        </div>
                        {/*  <div className="text-sm text-gray-600 mt-0.5">
                          景點 {spotIndex + 1}
                        </div> */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
