import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DailyLog } from '../types';
import { saveDailyLog } from '../utils/storage';

interface GoalModalProps {
  goal: string;
  todayLog: DailyLog | null;
  onClose: () => void;
  onSaved: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ goal, todayLog, onClose, onSaved }) => {
  const [count, setCount] = useState(0);

  const goals: Record<string, { label: string; unit: string; max: number; icon: string }> = {
    reading: { label: 'Czytanie', unit: 'min', max: 120, icon: '📖' },
    kefir: { label: 'Kefir', unit: 'porcji', max: 3, icon: '🥛' },
    water: { label: 'Woda', unit: 'szklanek', max: 6, icon: '💧' },
    discipline: { label: 'Dyscyplina', unit: 'pkt', max: 100, icon: '💪' },
    'no-phone': { label: 'Brak telefonu po 21', unit: 'tak/nie', max: 1, icon: '📵' },
    calories: { label: 'Kalorie', unit: 'kcal', max: 2000, icon: '🍽️' },
  };

  const current = goals[goal];
  if (!current) return null;

  const handleAdd = () => {
    if (goal === 'no-phone') {
      const updated = { ...todayLog, no_phone_after_21: !todayLog?.no_phone_after_21 };
      saveDailyLog(updated);
    } else {
      const newCount = Math.min(count + 1, current.max);
      setCount(newCount);
      
      const fieldMap: Record<string, keyof DailyLog> = {
        reading: 'reading_minutes',
        kefir: 'kefir_glasses',
        water: 'water_glasses',
        discipline: 'discipline_score',
        calories: 'calories',
      };
      
      const updated = { ...todayLog, [fieldMap[goal]]: newCount };
      saveDailyLog(updated);
    }
    onSaved();
  };

  const handleRemove = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 animate-in fade-in duration-200">
      <div className="w-full bg-[#1c1c1e] rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{current.icon}</span>
            <div>
              <h2 className="text-2xl font-bold">{current.label}</h2>
              <p className="text-gray-400 text-sm">{count}/{current.max} {current.unit}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#2c2c2e] h-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${(count / current.max) * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            onClick={handleRemove}
            disabled={count === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition"
          >
            − Usuń
          </button>
          <button
            onClick={handleAdd}
            disabled={count >= current.max && goal !== 'no-phone'}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-xl transition"
          >
            + Dodaj
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#3a3a3c] hover:bg-[#48484a] text-white font-bold py-3 rounded-xl transition"
        >
          Gotowe
        </button>
      </div>
    </div>
  );
};
