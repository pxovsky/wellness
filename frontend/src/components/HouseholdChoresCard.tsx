import React, { useEffect } from 'react';
import { useHouseholdChores } from '../hooks/useHouseholdChores';
import { HouseIcon } from './Icons';

interface HouseholdChoresCardProps {
  initialValue?: number;
  onSuccess?: () => void;
}

export function HouseholdChoresCard({
  initialValue = 0,
  onSuccess
}: HouseholdChoresCardProps) {
  const { logChores, loading, error } = useHouseholdChores();
  const [value, setValue] = React.useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleLog = async (newValue: number) => {
    setValue(newValue);
    try {
      await logChores(newValue);
      onSuccess?.();
    } catch {
      setValue(value);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-900/40 to-amber-800/30 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-sm hover:border-amber-500/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-amber-400 p-2 bg-amber-500/10 rounded-lg">
            <HouseIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">
              Domowe obowiązki
            </h3>
            <p className="text-amber-300 text-xs">{value}/5</p>
          </div>
        </div>
        {value > 0 && (
          <span className="text-amber-300 text-xs font-medium">OK!</span>
        )}
      </div>

      <div className="flex gap-1 flex-wrap">
        {[0, 1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => handleLog(num)}
            disabled={loading}
            className={`flex-1 min-w-max px-2 py-2 rounded-lg text-xs font-medium transition-all ${
              value === num
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-amber-900/30 text-amber-300 hover:bg-amber-900/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="mt-3 h-1 bg-amber-900/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs text-amber-300/70">{error}</p>
      )}
    </div>
  );
}
