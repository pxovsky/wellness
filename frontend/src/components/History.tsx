
import React from 'react';
import { Training } from '../types';
import { Trash2, Calendar } from 'lucide-react';
import { deleteTraining } from '../utils/storage';

interface HistoryProps {
  trainings: Training[];
  onDeleted: () => void;
}

export const History: React.FC<HistoryProps> = ({ trainings, onDeleted }) => {
  const handleDelete = (id: string) => {
    if (window.confirm("Delete this training?")) {
      deleteTraining(id);
      onDeleted();
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold mb-4">Training History</h2>
      {trainings.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>No trainings logged yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map((t) => (
            <div key={t.id} className="bg-[#1c1c1e] rounded-2xl p-4 flex justify-between items-center group">
              <div className="space-y-1">
                <div className="font-bold">{new Date(t.date).toLocaleDateString()} <span className="text-gray-500 font-normal text-sm">{new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="text-sm text-gray-400">
                  {t.duration} min • {t.calories} kcal • HR {t.avgHr} • TE {t.effect}
                </div>
                {t.notes && <div className="text-xs text-gray-600 italic mt-1 line-clamp-1">{t.notes}</div>}
              </div>
              <button 
                onClick={() => handleDelete(t.id)}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
