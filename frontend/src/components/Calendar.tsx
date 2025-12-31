import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, BookOpen, Droplets, Pill, Smartphone } from 'lucide-react';
import { DailyLog } from '../types';
import { getDailyLogForDate, saveDailyLog } from '../utils/storage';

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

  const weekDays = ['PN', 'WT', 'SR', 'CZ', 'PT', 'SO', 'ND'];

  const formatDate = (d: number, m: number, y: number): string => {
    const month = String(m + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    return `${y}-${month}-${day}`;
  };

  const isDayActive = (day: number, isCurrentMonth: boolean): boolean => {
    if (!isCurrentMonth) return false;
    const dateStr = formatDate(day, month, year);
    const log = dailyLogs.find(l => l.date === dateStr);
    if (!log) return false;
    return (
      (log.reading_minutes && log.reading_minutes > 0) ||
      (log.water_glasses && log.water_glasses >= 6) ||
      (log.kefir_glasses && log.kefir_glasses > 0) ||
      (log.no_phone_after_21 && log.no_phone_after_21 === 1)
    );
  };

  const getCompletionScore = (log: DailyLog | null): number => {
    if (!log) return 0;
    let score = 0;
    const total = 4;
    if (log.reading_minutes && log.reading_minutes > 0) score++;
    if (log.water_glasses && log.water_glasses >= 6) score++;
    if (log.kefir_glasses && log.kefir_glasses > 0) score++;
    if (log.no_phone_after_21 && log.no_phone_after_21 === 1) score++;
    return Math.round((score / total) * 100);
  };

  const getAchievements = (log: DailyLog | null) => {
    if (!log) return [];
    const achievements = [];
    if (log.reading_minutes && log.reading_minutes > 0) {
      achievements.push({ icon: <BookOpen className="w-6 h-6" />, label: `Czytanie: ${log.reading_minutes} min`, achieved: true });
    } else {
      achievements.push({ icon: <BookOpen className="w-6 h-6 opacity-40" />, label: 'Czytanie: 0 min', achieved: false });
    }
    if (log.water_glasses && log.water_glasses >= 6) {
      achievements.push({ icon: <Droplets className="w-6 h-6" />, label: `Nawodnienie: ${log.water_glasses} szkl.`, achieved: true });
    } else {
      achievements.push({ icon: <Droplets className="w-6 h-6 opacity-40" />, label: `Nawodnienie: ${log.water_glasses || 0} szkl.`, achieved: false });
    }
    if (log.kefir_glasses && log.kefir_glasses > 0) {
      achievements.push({ icon: <Pill className="w-6 h-6" />, label: `Kefir: ${log.kefir_glasses} porcji`, achieved: true });
    } else {
      achievements.push({ icon: <Pill className="w-6 h-6 opacity-40" />, label: 'Kefir: brak', achieved: false });
    }
    if (log.no_phone_after_21 && log.no_phone_after_21 === 1) {
      achievements.push({ icon: <Smartphone className="w-6 h-6" />, label: 'Brak telefonu po 21', achieved: true });
    } else {
      achievements.push({ icon: <Smartphone className="w-6 h-6 opacity-40" />, label: 'Brak telefonu po 21: nie', achieved: false });
    }
    return achievements;
  };

  const handleDayClick = async (day: number) => {
    const dateStr = formatDate(day, month, year);
    setSelectedDate(dateStr);
    const log = await getDailyLogForDate(dateStr);
    setSelectedLog(log || {
      date: dateStr,
      reading_minutes: 0,
      water_glasses: 0,
      kefir_glasses: 0,
      no_phone_after_21: 0,
    });
    setIsEditing(false);
  };

  const handleSaveLog = async () => {
    if (selectedLog) {
      await saveDailyLog(selectedLog);
      onLogsUpdated();
      setIsEditing(false);
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarDays = [];

  for (let i = prevMonthStart; i <= prevMonthDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }

  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  return (
    <div className="space-y-3 xl:space-y-4 pb-20 xl:pb-0 animate-in fade-in duration-300">
      <div className="bg-[#1c1c1e] rounded-xl p-3 xl:p-4 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-1 xl:p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-sm xl:text-base font-bold capitalize">{monthLabel}</h3>
          <button
            onClick={nextMonth}
            className="p-1 xl:p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 xl:gap-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs xl:text-sm font-bold text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 xl:gap-2">
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
                className={`h-8 xl:h-10 rounded-md font-semibold transition flex items-center justify-center text-xs xl:text-sm ${
                  !d.isCurrentMonth
                    ? 'text-gray-700 cursor-default'
                    : isSelected
                    ? 'bg-blue-600 text-white border-2 border-blue-400'
                    : isToday
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : isActive
                    ? 'bg-green-600/40 text-green-300 border-2 border-green-500/50 hover:bg-green-600/60'
                    : 'bg-[#2c2c2e] text-gray-400 hover:bg-[#3a3a3c]'
                }`}
              >
                {d.day}
              </button>
            );
          })}
        </div>

        <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-blue-600" />
            <span className="text-gray-400">Wybrane</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-green-600/40 border border-green-500/50" />
            <span className="text-gray-400">Aktywne</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-[#2c2c2e]" />
            <span className="text-gray-400">Puste</span>
          </div>
        </div>
      </div>

      {selectedLog && selectedDate ? (
        <div className="bg-[#1c1c1e] rounded-xl p-4 border border-white/10 space-y-3 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm xl:text-base font-bold">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'short', month: 'short', day: 'numeric' })}
              </h3>
              <p className="text-gray-400 text-xs">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pl-PL', { weekday: 'long' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Osiągnięto</p>
              <p className="text-2xl xl:text-3xl font-bold text-blue-400">{getCompletionScore(selectedLog)}%</p>
            </div>
          </div>

          <div className="w-full bg-[#2c2c2e] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all"
              style={{ width: `${getCompletionScore(selectedLog)}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {getAchievements(selectedLog).map((achievement, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-2 xl:p-3 border transition text-center text-xs ${
                  achievement.achieved
                    ? 'bg-green-600/20 border-green-500/50'
                    : 'bg-[#2c2c2e] border-white/5'
                }`}
              >
                <div className="mb-0.5">{achievement.icon}</div>
                <p className={`text-xs font-medium ${achievement.achieved ? 'text-green-300' : 'text-gray-500'}`}>
                  {achievement.label}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition text-sm"
          >
            Edytuj
          </button>
        </div>
      ) : (
        <div className="bg-[#1c1c1e] rounded-xl p-8 border border-white/10 text-center">
          <p className="text-gray-500 text-xs xl:text-sm">👈 Kliknij dzień aby zobaczyć szczegóły</p>
        </div>
      )}

      {selectedLog && selectedDate && isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="w-full bg-[#1c1c1e] rounded-t-2xl p-6 space-y-3 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">Edytuj dzień</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">📖 Czytanie (minuty)</label>
                <input
                  type="number"
                  value={selectedLog.reading_minutes || 0}
                  onChange={(e) =>
                    setSelectedLog({ ...selectedLog, reading_minutes: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">💧 Nawodnienie (szklanki)</label>
                <input
                  type="number"
                  value={selectedLog.water_glasses || 0}
                  onChange={(e) =>
                    setSelectedLog({ ...selectedLog, water_glasses: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">🥛 Kefir (porcje)</label>
                <input
                  type="number"
                  value={selectedLog.kefir_glasses || 0}
                  onChange={(e) =>
                    setSelectedLog({ ...selectedLog, kefir_glasses: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">📵 Brak telefonu po 21</label>
                <button
                  onClick={() =>
                    setSelectedLog({ ...selectedLog, no_phone_after_21: (selectedLog.no_phone_after_21 || 0) === 1 ? 0 : 1 })
                  }
                  className={`w-full py-2 rounded-lg font-semibold transition text-sm ${
                    (selectedLog.no_phone_after_21 || 0) === 1
                      ? 'bg-green-600 text-white'
                      : 'bg-[#2c2c2e] text-gray-400 hover:bg-[#3a3a3c]'
                  }`}
                >
                  {(selectedLog.no_phone_after_21 || 0) === 1 ? '✓ Tak' : '✗ Nie'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-300">💪 Dyscyplina (pkt)</label>
                <input
                  type="number"
                  value={selectedLog.discipline_score || 0}
                  onChange={(e) =>
                    setSelectedLog({ ...selectedLog, discipline_score: parseInt(e.target.value) || 0 })
                  }
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleSaveLog}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition mt-4"
            >
              Zapisz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
