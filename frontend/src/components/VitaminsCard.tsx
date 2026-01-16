import React, { useEffect } from 'react';
import { useVitamins } from '../hooks/useVitamins';
import { VitaminIcon } from './Icons';

interface VitaminsCardProps {
  initialValue?: 0 | 1;
  onSuccess?: () => void;
}

export function VitaminsCard({
  initialValue = 0,
  onSuccess
}: VitaminsCardProps) {
  const { vitamins, logVitamins, loading, error } = useVitamins();
  const [value, setValue] = React.useState<0 | 1>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleLog = async (newValue: 0 | 1) => {
    setValue(newValue);
    try {
      await logVitamins(newValue);
      onSuccess?.();
    } catch {
      setValue(value);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/30 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-purple-400 p-2 bg-purple-500/10 rounded-lg">
            <VitaminIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Witaminy</h3>
            <p className="text-purple-300 text-xs">
              {value === 1 ? 'Wziąłem ✓' : 'Nie wziąłem'}
            </p>
          </div>
        </div>
        {value === 1 && (
          <span className="text-purple-300 text-xs font-medium">OK!</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleLog(0)}
          disabled={loading}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            value === 0
              ? 'bg-purple-500 text-white shadow-lg'
              : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Nie
        </button>
        <button
          onClick={() => handleLog(1)}
          disabled={loading}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            value === 1
              ? 'bg-purple-500 text-white shadow-lg'
              : 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Tak
        </button>
      </div>

      <div className="mt-3 h-1 bg-purple-900/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-500 transition-all duration-300"
          style={{ width: value === 1 ? '100%' : '0%' }}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs text-purple-300/70">{error}</p>
      )}
    </div>
  );
}
