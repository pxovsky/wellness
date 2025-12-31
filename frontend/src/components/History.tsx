import React, { useState } from 'react';
import { Training } from '../types';
import { deleteTraining } from '../utils/storage';
import { Trash2, Calendar, Clock, Flame, Heart, Zap } from 'lucide-react';

interface HistoryProps {
  trainings: Training[];
}

export const History: React.FC<HistoryProps> = ({ trainings }) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const sortedTrainings = [...trainings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = async (id: number) => {
    if (window.confirm('Jesteś pewny?')) {
      setDeletingId(id);
      try {
        await deleteTraining(id);
        // Usunięcie będzie widoczne po refreshu
        window.location.reload();
      } catch (e) {
        console.error('Error deleting training:', e);
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-4 pb-20 xl:pb-0 animate-in fade-in duration-300">
      <h2 className="text-2xl font-bold">Historia Treningów</h2>

      {sortedTrainings.length === 0 ? (
        <div className="bg-[#1c1c1e] rounded-xl p-8 border border-white/10 text-center">
          <p className="text-gray-500 text-sm">Brak zapisanych treningów. Dodaj pierwszy! 💪</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTrainings.map((training) => (
            <div
              key={training.id}
              className="bg-[#1c1c1e] rounded-lg p-4 border border-white/10 hover:border-white/20 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h3 className="font-bold text-sm xl:text-base">
                      {new Date(training.date).toLocaleDateString('pl-PL', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </h3>
                  </div>
                  {training.notes && (
                    <p className="text-xs xl:text-sm text-gray-400 italic">{training.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(training.id)}
                  disabled={deletingId === training.id}
                  className="text-red-500 hover:text-red-400 disabled:opacity-50 transition p-1"
                >
                  <Trash2 className="w-4 h-4 xl:w-5 xl:h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 text-xs xl:text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-gray-400">Czas</p>
                    <p className="font-bold">{training.duration_min} min</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-gray-400">Kcal</p>
                    <p className="font-bold">{training.calories}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" />
                  <div>
                    <p className="text-gray-400">Śr. HR</p>
                    <p className="font-bold">{training.avg_hr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <div>
                    <p className="text-gray-400">Max HR</p>
                    <p className="font-bold">{training.max_hr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <div>
                    <p className="text-gray-400">Efekt</p>
                    <p className="font-bold">{training.training_effect.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
