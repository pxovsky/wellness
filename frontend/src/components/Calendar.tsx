import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, X,
  Book, Droplets, Pill, Phone, Code2, Home, Wind
} from 'lucide-react';
import { DailyLog } from '../types';
import { PageHeader } from './PageHeader';
import { saveDailyLog } from '../utils/storage';

interface CalendarProps {
  dailyLogs: DailyLog[];
  onLogsUpdated: () => void;
}

export const Calendar: React.FC<CalendarProps> = ({ dailyLogs, onLogsUpdated }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthLabel = currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

  const prevMonthDays = new Date(year, month, 0).getDate();
  const prevMonthStart = prevMonthDays - adjustedFirstDay + 1;

  const weekDays = ['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SO', 'ND'];

  const formatDate = (d: number, m: number, y: number): string => {
    const monthStr = String(m + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    return `${y}-${monthStr}-${dayStr}`;
  };

  // Sprawdza czy dzień ma jakiekolwiek dane (do podświetlenia na zielono)
  const isDayActive = (day: number, isCurrentMonth: boolean): boolean => {
    if (!isCurrentMonth) return false;
    const dateStr = formatDate(day, month, year);
    const log = dailyLogs.find(l => l.date === dateStr);
    if (!log) return false;
    return (
      (log.reading_minutes && log.reading_minutes >= 60) ||
      (log.water_glasses && log.water_glasses >= 6) ||
      (log.kefir_glasses && log.kefir_glasses >= 2) ||
      (log.vibe_coding_minutes && log.vibe_coding_minutes >= 120) ||
      (log.no_phone_after_21 === 1) ||
      (log.household_chores && log.household_chores > 0) ||
      (log.vitamins === 1)
    );
  };

  const getCompletionScore = (log: DailyLog | null): number => {
    if (!log) return 0;
    let score = 0;
    const total = 7; // Liczba wszystkich celów
    if (log.reading_minutes && log.reading_minutes >= 60) score++;
    if (log.water_glasses && log.water_glasses >= 6) score++;
    if (log.kefir_glasses && log.kefir_glasses >= 2) score++;
    if (log.vibe_coding_minutes && log.vibe_coding_minutes >= 120) score++;
    if (log.no_phone_after_21 === 1) score++;
    if (log.household_chores && log.household_chores > 0) score++;
    if (log.vitamins === 1) score++;
    
    return Math.round((score / total) * 100);
  };

  const getAchievements = (log: DailyLog | null) => {
    if (!log) return [];
    const achievements = [];
    
    // Czytanie
    achievements.push({
      icon: <Book className="w-5 h-5" />,
      label: `Czytanie: ${log.reading_minutes || 0} min`,
      achieved: (log.reading_minutes || 0) >= 60
    });

    // Vibe Coding
    achievements.push({
      icon: <Code2 className="w-5 h-5" />,
      label: `Vibe Coding: ${log.vibe_coding_minutes || 0} min`,
      achieved: (log.vibe_coding_minutes || 0) >= 120
    });

    // Woda
    achievements.push({
      icon: <Droplets className="w-5 h-5" />,
      label: `Woda: ${log.water_glasses || 0} szkl.`,
      achieved: (log.water_glasses || 0) >= 6
    });

    // Kefir
    achievements.push({
      icon: <Wind className="w-5 h-5" />,
      label: `Kefir: ${log.kefir_glasses || 0} porcji`,
      achieved: (log.kefir_glasses || 0) >= 2
    });

    // Witaminy
    achievements.push({
      icon: <Pill className="w-5 h-5" />,
      label: log.vitamins === 1 ? 'Witaminy: Tak' : 'Witaminy: Nie',
      achieved: log.vitamins === 1
    });

    // Obowiązki
    achievements.push({
      icon: <Home className="w-5 h-5" />,
      label: `Obowiązki: ${log.household_chores || 0}`,
      achieved: (log.household_chores || 0) > 0
    });

    // Telefon
    achievements.push({
      icon: <Phone className="w-5 h-5" />,
      label: log.no_phone_after_21 === 1 ? 'Bez telefonu: Tak' : 'Bez telefonu: Nie',
      achieved: log.no_phone_after_21 === 1
    });

    return achievements;
  };

  const handleDayClick = async (day: number) => {
    const dateStr = formatDate(day, month, year);
    setSelectedDate(dateStr);
    
    // Find log locally first for instant feedback, then could refetch if needed
    const existingLog = dailyLogs.find(l => l.date === dateStr);
    
    setSelectedLog(existingLog ? { ...existingLog } : {
      date: dateStr,
      reading_minutes: 0,
      water_glasses: 0,
      kefir_glasses: 0,
      no_phone_after_21: 0,
      discipline_score: 0,
      mood_score: 0,
      vibe_coding_minutes: 0,
      household_chores: 0,
      vitamins: 0
    });
    setIsEditing(false);
  };

  const handleSaveLog = async () => {
    if (selectedLog && selectedDate) {
      // Save each field individually to match backend endpoints
      if (selectedLog.reading_minutes !== undefined) await saveDailyLog('reading', { minutes: selectedLog.reading_minutes }, selectedDate);
      if (selectedLog.water_glasses !== undefined) await saveDailyLog('water', { glasses: selectedLog.water_glasses }, selectedDate);
      if (selectedLog.kefir_glasses !== undefined) await saveDailyLog('kefir', { glasses: selectedLog.kefir_glasses }, selectedDate);
      if (selectedLog.vibe_coding_minutes !== undefined) await saveDailyLog('vibe-coding', { minutes: selectedLog.vibe_coding_minutes }, selectedDate);
      
      // Booleans
      await saveDailyLog('no-phone', { success: selectedLog.no_phone_after_21 === 1 }, selectedDate);
      await saveDailyLog('chores', { count: selectedLog.household_chores }, selectedDate);
      await saveDailyLog('vitamins', { taken: selectedLog.vitamins }, selectedDate);

      onLogsUpdated();
      setIsEditing(false);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build calendar grid
  const calendarDays = [];
  for (let i = prevMonthStart; i <= prevMonthDays; i++) calendarDays.push({ day: i, isCurrentMonth: false });
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push({ day: i, isCurrentMonth: true });
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) calendarDays.push({ day: i, isCurrentMonth: false });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <PageHeader title="Kalendarz" subtitle="Przegląd Twoich celów" />
      
      <div className="bg-[#1c1c1e] rounded-xl p-4 border border-white/10 space-y-4">
        {/* Header Kalendarza */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-base font-bold capitalize text-white">{monthLabel}</h3>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dni tygodnia */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Siatka Dni */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((d, idx) => {
            const isActive = isDayActive(d.day, d.isCurrentMonth);
            const dateStr = d.isCurrentMonth ? formatDate(d.day, month, year) : null;
            const isToday = d.isCurrentMonth && new Date(year, month, d.day).toDateString() === new Date().toDateString();
            const isSelected = selectedDate === dateStr && d.isCurrentMonth;

            return (
              <button
                key={idx}
                onClick={() => d.isCurrentMonth && handleDayClick(d.day)}
                disabled={!d.isCurrentMonth}
                className={`
                  h-9 md:h-12 rounded-lg font-semibold transition flex flex-col items-center justify-center text-xs md:text-sm relative
                  ${!d.isCurrentMonth ? 'text-gray-800 cursor-default bg-transparent' : ''}
                  ${d.isCurrentMonth && !isSelected && !isToday && !isActive ? 'bg-[#2c2c2e] text-gray-400 hover:bg-[#3a3a3c]' : ''}
                  ${isActive && !isSelected && !isToday ? 'bg-green-900/20 text-green-400 border border-green-500/30' : ''}
                  ${isToday ? 'bg-blue-600/20 text-blue-400 border border-blue-500' : ''}
                  ${isSelected ? 'bg-blue-600 text-white shadow-md transform scale-105 z-10' : ''}
                `}
              >
                {d.day}
                {/* Kropka aktywności dla małych ekranów jeśli nie jest wybrany */}
                {isActive && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-green-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex gap-4 text-xs pt-2 border-t border-white/5 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600" /><span className="text-gray-400">Wybrany</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500/20 border border-blue-500" /><span className="text-gray-400">Dziś</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500/30" /><span className="text-gray-400">Zrealizowany</span></div>
        </div>
      </div>

      {/* Szczegóły Wybranego Dnia (Pod kalendarzem) */}
      {selectedLog && selectedDate ? (
        <div className="bg-[#1c1c1e] rounded-xl p-5 border border-white/10 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white capitalize">
                {new Date(selectedDate).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <p className="text-gray-400 text-xs">Podsumowanie dnia</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Wynik</span>
              <span className={`text-2xl font-bold ${getCompletionScore(selectedLog) === 100 ? 'text-green-400' : 'text-blue-400'}`}>
                {getCompletionScore(selectedLog)}%
              </span>
            </div>
          </div>

          {/* Pasek postępu */}
          <div className="w-full bg-[#2c2c2e] rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${getCompletionScore(selectedLog)}%` }}
            />
          </div>

          {/* Grid Osiągnięć */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {getAchievements(selectedLog).map((item, idx) => (
              <div 
                key={idx} 
                className={`
                  p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 transition-colors
                  ${item.achieved ? 'bg-green-900/10 border-green-500/20 text-green-400' : 'bg-[#252528] border-white/5 text-gray-500 opacity-60'}
                `}
              >
                {item.icon}
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-900/20"
          >
            Edytuj Dzień
          </button>
        </div>
      ) : (
        <div className="bg-[#1c1c1e] rounded-xl p-8 border border-white/10 text-center flex flex-col items-center justify-center text-gray-500">
          <Book className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">Wybierz dzień z kalendarza, aby zobaczyć szczegóły</p>
        </div>
      )}

      {/* Edycja - Bottom Sheet / Modal */}
      {selectedLog && isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#1c1c1e] w-full max-w-lg sm:rounded-2xl rounded-t-2xl border-t sm:border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[90vh] flex flex-col">
            
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#252528] rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-lg font-bold text-white">Edycja Dnia</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              
              {/* Sekcja: Liczniki */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400 uppercase">Czytanie (min)</label>
                   <input
                     type="number"
                     className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                     value={selectedLog.reading_minutes || 0}
                     onChange={e => setSelectedLog({ ...selectedLog, reading_minutes: parseInt(e.target.value) || 0 })}
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400 uppercase">Vibe Coding (min)</label>
                   <input
                     type="number"
                     className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-none"
                     value={selectedLog.vibe_coding_minutes || 0}
                     onChange={e => setSelectedLog({ ...selectedLog, vibe_coding_minutes: parseInt(e.target.value) || 0 })}
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400 uppercase">Woda (szkl.)</label>
                   <input
                     type="number"
                     className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                     value={selectedLog.water_glasses || 0}
                     onChange={e => setSelectedLog({ ...selectedLog, water_glasses: parseInt(e.target.value) || 0 })}
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400 uppercase">Kefir (porcje)</label>
                   <input
                     type="number"
                     className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-yellow-500 focus:outline-none"
                     value={selectedLog.kefir_glasses || 0}
                     onChange={e => setSelectedLog({ ...selectedLog, kefir_glasses: parseInt(e.target.value) || 0 })}
                   />
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-400 uppercase">Obowiązki (zadania)</label>
                   <input
                     type="number"
                     className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-orange-500 focus:outline-none"
                     value={selectedLog.household_chores || 0}
                     onChange={e => setSelectedLog({ ...selectedLog, household_chores: parseInt(e.target.value) || 0 })}
                   />
                 </div>
              </div>

              {/* Sekcja: Przełączniki */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                {[
                  { label: 'Witaminy', key: 'vitamins' as keyof DailyLog, color: 'text-rose-400', icon: <Pill className="w-4 h-4" /> },
                  { label: 'Brak telefonu po 21', key: 'no_phone_after_21' as keyof DailyLog, color: 'text-purple-400', icon: <Phone className="w-4 h-4" /> },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedLog({ 
                      ...selectedLog, 
                      [item.key]: (selectedLog[item.key] as number) === 1 ? 0 : 1 
                    })}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition ${
                      (selectedLog[item.key] as number) === 1 
                        ? 'bg-green-600/20 border-green-500/50' 
                        : 'bg-black/20 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`${item.color}`}>{item.icon}</div>
                       <span className={`text-sm font-medium ${
                         (selectedLog[item.key] as number) === 1 ? 'text-white' : 'text-gray-400'
                       }`}>{item.label}</span>
                    </div>
                    {(selectedLog[item.key] as number) === 1 && (
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveLog}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                >
                  Zapisz Zmiany
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
