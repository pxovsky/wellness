import React, { useState } from 'react';
import { DailyLog } from '../types';
import { logReading, logWater, logKefir, logNoPhoneAfter21 } from '../utils/storage';
import { X, Loader2 } from 'lucide-react';

interface GoalModalProps {
  goal: string;
  todayLog: DailyLog;
  onClose: () => void;
  onSaved: () => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({ goal, todayLog, onClose, onSaved }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const getInitialValue = () => {
    if (goal === 'reading') return todayLog.reading_minutes || 0;
    if (goal === 'water') return todayLog.water_glasses || 0;
    if (goal === 'kefir') return todayLog.kefir_glasses || 0;
    if (goal === 'no-phone') return (todayLog.no_phone_after_21 || 0) === 1;
    return 0;
  };

  const [numValue, setNumValue] = useState<number>(
    goal === 'no-phone' ? 0 : (getInitialValue() as number)
  );
  const [boolValue, setBoolValue] = useState<boolean>(
    goal === 'no-phone' ? (getInitialValue() as boolean) : false
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (goal === 'reading') {
        await logReading(today, numValue);
      } else if (goal === 'water') {
        await logWater(today, numValue);
      } else if (goal === 'kefir') {
        await logKefir(today, numValue);
      } else if (goal === 'no-phone') {
        await logNoPhoneAfter21(today, boolValue);
      }

      onSaved();
    } catch (e: any) {
      setError(e.message || 'Błąd przy zapisywaniu');
    } finally {
      setSaving(false);
    }
  };

  const getGoalConfig = () => {
    switch (goal) {
      case 'reading':
        return { title: '📖 Czytanie', icon: '📖', unit: 'min', goal: 60, step: 5 };
      case 'water':
        return { title: '💧 Nawodnienie', icon: '💧', unit: 'szkl.', goal: 6, step: 1 };
      case 'kefir':
        return { title: '🥛 Kefir', icon: '🥛', unit: 'porcji', goal: 2, step: 1 };
      case 'no-phone':
        return { title: '📵 Brak telefonu po 21', icon: '📵', unit: '', goal: 1, step: 1 };
      default:
        return { title: 'Cel', icon: '✓', unit: '', goal: 100, step: 1 };
    }
  };

  const config = getGoalConfig();
  const progress = goal === 'no-phone' 
    ? (boolValue ? 100 : 0)
    : Math.min((numValue / config.goal) * 100, 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1c1c1e] rounded-xl border border-white/10 p-6 max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">{config.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded p-2 text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {goal === 'no-phone' ? (
            <button
              onClick={() => setBoolValue(!boolValue)}
              className={`w-full py-6 rounded-lg font-bold text-lg transition ${
                boolValue
                  ? 'bg-green-600 text-white'
                  : 'bg-[#2c2c2e] text-gray-400 hover:bg-[#3a3a3c]'
              }`}
            >
              {boolValue ? '✓ Tak, bez telefonu!' : '✗ Nie, miałem telefon'}
            </button>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setNumValue(Math.max(0, numValue - config.step))}
                  className="w-12 h-12 bg-[#2c2c2e] hover:bg-[#3a3a3c] rounded-lg font-bold text-xl transition"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold text-blue-400">{numValue}</p>
                  <p className="text-gray-400 text-sm">{config.unit}</p>
                </div>
                <button
                  onClick={() => setNumValue(numValue + config.step)}
                  className="w-12 h-12 bg-[#2c2c2e] hover:bg-[#3a3a3c] rounded-lg font-bold text-xl transition"
                >
                  +
                </button>
              </div>

              <input
                type="range"
                min="0"
                max={config.goal * 1.5}
                value={numValue}
                onChange={(e) => setNumValue(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />

              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">Cel: {config.goal} {config.unit}</p>
                <div className="w-full bg-[#2c2c2e] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white font-bold py-2 rounded-lg transition"
          >
            Anuluj
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              'Zapisz'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
