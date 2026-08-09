import { useState, useEffect } from 'react';
import { Palmtree, Menu, X, DollarSign, Calendar, Calculator } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('itinerary');

  // 監聽滾動以自動高亮目前的錨點
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['itinerary', 'calculator', 'settlement'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect shadow-xs border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo 區塊 */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="p-2.5 bg-teal-500 rounded-2xl text-white shadow-md shadow-teal-500/30">
              <Palmtree className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-linear-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                宿霧光芒 Cebu 2026
              </span>
            </div>
          </div>

          {/* 桌面端導覽連結 */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => scrollToSection('itinerary')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === 'itinerary'
                ? 'bg-teal-50 text-teal-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <Calendar className="w-4 h-4" />
              宿霧行程表
            </button>
            <button
              onClick={() => scrollToSection('calculator')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === 'calculator'
                ? 'bg-emerald-50 text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <Calculator className="w-4 h-4" />
              匯率試算
            </button>
            <button
              onClick={() => scrollToSection('settlement')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === 'settlement'
                ? 'bg-amber-50 text-amber-600 shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <DollarSign className="w-4 h-4" />
              分帳結算
            </button>
          </div>

          {/* 行動端漢堡選單按鈕 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-600 hover:bg-slate-100 focus:outline-hidden transition-all"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 行動端下拉選單 */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/50 bg-white absolute left-0 right-0 shadow-lg animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button
              onClick={() => scrollToSection('itinerary')}
              className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${activeSection === 'itinerary'
                ? 'bg-teal-50 text-teal-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Calendar className="w-5 h-5" />
              宿霧行程表
            </button>
            <button
              onClick={() => scrollToSection('calculator')}
              className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${activeSection === 'calculator'
                ? 'bg-emerald-50 text-emerald-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <Calculator className="w-5 h-5" />
              匯率試算
            </button>
            <button
              onClick={() => scrollToSection('settlement')}
              className={`flex items-center gap-2 w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${activeSection === 'settlement'
                ? 'bg-amber-50 text-amber-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
                }`}
            >
              <DollarSign className="w-5 h-5" />
              分帳結算
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
