import React, { useState } from 'react';
import { Training } from '../types';
import { saveTraining } from '../utils/storage';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const AddTraining: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 16);

  const [training, setTraining] = useState<Omit<Training, 'id'>>({
    date: defaultDate,
    duration_min: 45,
    calories: 450,
    avg_hr: 140,
    max_hr: 165,
    training_effect: 3.2,
    notes: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Walidacja
      if (!training.date) {
        setError('Data jest wymagana');
        return;
      }
      if (training.duration_min <= 0) {
        setError('Czas treningu musi być > 0');
        return;
      }
      if (training.calories < 0) {
        setError('Kalorie nie mogą być ujemne');
        return;
      }

      await saveTraining(training);
      setSuccess(true);
      setTimeout(() => {
        onSaved();
      }, 1000);
    } catch (e: any) {
      setError(e.message || 'Błąd przy zapisywaniu');
      console.error('Error saving training:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20 xl:pb-0">
      <h2 className="text-2xl font-bold">Dodaj Trening</h2>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded text-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-900/20 border border-green-500 rounded text-green-200 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>Trening zapisany! ✓</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Data i czas */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Data i czas</label>
          <input
            type="datetime-local"
            value={training.date}
            onChange={(e) => setTraining({ ...training, date: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Czas treningu */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Czas (minuty)</label>
            <input
              type="number"
              min="1"
              value={training.duration_min}
              onChange={(e) => setTraining({ ...training, duration_min: parseInt(e.target.value) || 0 })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kalorie (kcal)</label>
            <input
              type="number"
              min="0"
              value={training.calories}
              onChange={(e) => setTraining({ ...training, calories: parseInt(e.target.value) || 0 })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tętno */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Śr. Tętno (bpm)</label>
            <input
              type="number"
              min="0"
              value={training.avg_hr}
              onChange={(e) => setTraining({ ...training, avg_hr: parseInt(e.target.value) || 0 })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Tętno (bpm)</label>
            <input
              type="number"
              min="0"
              value={training.max_hr}
              onChange={(e) => setTraining({ ...training, max_hr: parseInt(e.target.value) || 0 })}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Training Effect */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Efekt Treningu (0-5)</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={training.training_effect}
            onChange={(e) => setTraining({ ...training, training_effect: parseFloat(e.target.value) || 0 })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Notatki */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Notatki</label>
          <textarea
            value={training.notes}
            onChange={(e) => setTraining({ ...training, notes: e.target.value })}
            placeholder="Jak się czułeś? Coś specjalnego?"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-24 resize-none"
          />
        </div>

        {/* Przycisk */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Zapisywanie...
            </>
          ) : (
            'Zapisz Trening'
          )}
        </button>
      </div>
    </div>
  );
};
