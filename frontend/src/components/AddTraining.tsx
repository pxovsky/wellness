import React, { useState } from 'react';
import { Training } from '../types';
import { saveTraining } from '../utils/storage';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const AddTraining: React.FC<{onSaved:()=>void}> = ({ onSaved }) => {
  const [t, setT] = useState<Omit<Training, 'id'>>({
    dt: new Date().toISOString().slice(0, 16), duration_min: 45, calories: 450,
    avg_hr: 140, max_hr: 165, training_effect: 3.2, notes: ''
  });
  const [err, setErr] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true); setErr(null);
      await saveTraining(t);
      onSaved();
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 p-4">
      {err && <div className="text-red-400 border border-red-500 p-3 rounded">{err}</div>}
      <input type="datetime-local" value={t.dt} onChange={e=>setT({...t, dt:e.target.value})} className="w-full bg-gray-800 p-2 rounded text-white"/>
      <div className="grid grid-cols-2 gap-2">
         <input type="number" placeholder="Min" value={t.duration_min} onChange={e=>setT({...t, duration_min:+e.target.value})} className="bg-gray-800 p-2 rounded text-white"/>
         <input type="number" placeholder="Kcal" value={t.calories} onChange={e=>setT({...t, calories:+e.target.value})} className="bg-gray-800 p-2 rounded text-white"/>
         <input type="number" placeholder="Avg HR" value={t.avg_hr} onChange={e=>setT({...t, avg_hr:+e.target.value})} className="bg-gray-800 p-2 rounded text-white"/>
         <input type="number" placeholder="Max HR" value={t.max_hr} onChange={e=>setT({...t, max_hr:+e.target.value})} className="bg-gray-800 p-2 rounded text-white"/>
      </div>
      <input type="number" step="0.1" placeholder="Effect" value={t.training_effect} onChange={e=>setT({...t, training_effect:+e.target.value})} className="w-full bg-gray-800 p-2 rounded text-white"/>
      <textarea placeholder="Notes" value={t.notes} onChange={e=>setT({...t, notes:e.target.value})} className="w-full bg-gray-800 p-2 rounded h-20 text-white"/>
      <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 p-2 rounded flex justify-center text-white">
        {saving ? <Loader2 className="animate-spin"/> : 'Zapisz'}
      </button>
    </div>
  );
};
