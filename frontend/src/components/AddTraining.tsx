// components/AddTraining.tsx
import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { saveTraining } from '../utils/storage';
import { extractTrainingData } from '../services/gemini';
import { Training } from '../types';

interface AddTrainingProps {
  onSaved: () => void;
}

export const AddTraining: React.FC<AddTrainingProps> = ({ onSaved }) => {
  const [form, setForm] = useState<Omit<Training, 'id'>>({
    date: new Date().toISOString().slice(0, 16),
    duration: 0,
    calories: 0,
    avgHr: 0,
    maxHr: 0,
    effect: 0,
    notes: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Gotowy do przesłania zrzutu ekranu.');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus('Analizowanie zrzutu ekranu za pomocą Gemini AI...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const data = await extractTrainingData(base64);
      if (data) {
        setForm(prev => ({
          ...prev,
          duration: data.duration || prev.duration,
          calories: data.calories || prev.calories,
          avgHr: data.avgHr || prev.avgHr,
          maxHr: data.maxHr || prev.maxHr,
          effect: data.effect || prev.effect,
        }));
        setStatus('Sukces! Dane zostały wyodrębnione.');
      } else {
        setStatus('Nie udało się wyodrębnić danych. Proszę wprowadź ręcznie.');
      }
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const training: Training = {
      ...form,
      id: Date.now().toString(),
    };
    saveTraining(training);
    onSaved();
  };

  return (
    <div className="space-y-6 pb-12 animate-in slide-in-from-bottom-4 duration-300 max-w-3xl">
      {/* Smart Entry */}
      <section>
        <h2 className="text-lg xl:text-xl font-bold mb-3 text-white">Inteligentne wpisanie (OCR)</h2>
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            disabled={isProcessing}
          />
          <button className="w-full bg-[#3a3a3c] hover:bg-[#48484a] text-white py-3 xl:py-4 rounded-lg xl:rounded-xl font-semibold flex items-center justify-center gap-2 xl:gap-3 transition-colors">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 xl:w-6 xl:h-6 animate-spin" />
            ) : (
              <Camera className="w-5 h-5 xl:w-6 xl:h-6" />
            )}
            <span className="text-sm xl:text-base">Prześlij zrzut ekranu treningu</span>
          </button>
        </div>
        <p className="text-[11px] xl:text-xs text-gray-500 mt-2 px-1">
          Status: <span className={isProcessing ? "text-blue-400" : "text-gray-400"}>{status}</span>
        </p>
      </section>

      {/* Manual Entry */}
      <section className="space-y-4">
        <h2 className="text-lg xl:text-xl font-bold text-white">Ręczne wpisanie</h2>
        <div className="space-y-3">
          <InputRow 
            label="Data i godzina" 
            type="datetime-local" 
            value={form.date} 
            onChange={v => setForm({ ...form, date: v })} 
          />
          <InputRow 
            label="Czas trwania" 
            type="number" 
            placeholder="minuty" 
            value={form.duration} 
            onChange={v => setForm({ ...form, duration: parseInt(v) || 0 })} 
            unit="min" 
          />
          <InputRow 
            label="Kalorie" 
            type="number" 
            placeholder="kcal" 
            value={form.calories} 
            onChange={v => setForm({ ...form, calories: parseInt(v) || 0 })} 
            unit="kcal" 
          />
          <InputRow 
            label="Średnie tętno" 
            type="number" 
            placeholder="bpm" 
            value={form.avgHr} 
            onChange={v => setForm({ ...form, avgHr: parseInt(v) || 0 })} 
            unit="bpm" 
          />
          <InputRow 
            label="Maksymalne tętno" 
            type="number" 
            placeholder="bpm" 
            value={form.maxHr} 
            onChange={v => setForm({ ...form, maxHr: parseInt(v) || 0 })} 
            unit="bpm" 
          />
          <InputRow 
            label="Efekt treningu" 
            type="number" 
            step="0.1" 
            placeholder="0.0-5.0" 
            value={form.effect} 
            onChange={v => setForm({ ...form, effect: parseFloat(v) || 0 })} 
            unit="" 
          />
          
          <div className="space-y-1">
            <label className="text-xs xl:text-sm font-medium text-gray-200">Notatki</label>
            <textarea 
              className="w-full bg-[#1c1c1e] border border-white/10 rounded-lg xl:rounded-xl px-3 xl:px-4 py-2 xl:py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 min-h-[100px] text-sm xl:text-base resize-none"
              placeholder="Opcjonalne notatki do treningu..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
      </section>

      <button 
        onClick={handleSave}
        className="w-full bg-[#32d74b] hover:bg-[#28c13c] text-black font-bold py-3 xl:py-4 rounded-lg xl:rounded-xl text-base xl:text-lg transition-transform active:scale-95 shadow-lg"
      >
        Zapisz trening
      </button>
    </div>
  );
};

const InputRow: React.FC<{ 
  label: string
  type: string
  placeholder?: string
  value: any
  onChange: (v: string) => void
  unit?: string
  step?: string
}> = ({ label, type, placeholder, value, onChange, unit, step }) => (
  <div className="flex items-center justify-between gap-2 xl:gap-3">
    <label className="text-xs xl:text-sm font-medium text-gray-200 w-1/3 flex-shrink-0">{label}</label>
    <div className="relative flex-1">
      <input 
        type={type} 
        step={step}
        className="w-full bg-[#1c1c1e] border border-white/10 rounded-lg xl:rounded-xl px-3 xl:px-4 py-2 text-right focus:outline-none focus:border-blue-500/50 text-sm xl:text-base"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {unit && value !== 0 && <span className="absolute left-3 xl:left-4 top-2 text-gray-600 text-xs xl:text-sm pointer-events-none">{unit}</span>}
    </div>
  </div>
);

export default AddTraining;
