import React, { useState, useEffect } from 'react';
import { Training, DailyLog } from '../types';
import { 
  Dumbbell, Flame, Heart, Zap, AlertTriangle, Sparkles, Check, 
  Book, Wind, Droplets, Phone, X, 
  Code2, Home, Pill, Trophy 
} from 'lucide-react';
import { GoalModal } from './GoalModal';
import { getTodayLog } from '../utils/storage';
import { PageHeader } from './PageHeader';

interface DashboardProps {
  trainings: Training[];
  dailyLogs: DailyLog[];
  onRefresh: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ trainings, dailyLogs, onRefresh }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showAICoach, setShowAICoach] = useState(true);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

  useEffect(() => {
    const loadTodayLog = async () => {
      const log = await getTodayLog();
      setTodayLog(log || {
        date: new Date().toISOString().split('T')[0],
        reading_minutes: 0,
        water_glasses: 0,
        kefir_glasses: 0,
        no_phone_after_21: 0,
        vibe_coding_minutes: 0,
        household_chores: 0,
        vitamins: 0
      });
    };
    loadTodayLog();
  }, [dailyLogs]);

  const totalKcal = trainings.reduce((acc, t) => acc + (t.calories || 0), 0);
  const avgHr = trainings.length
    ? Math.round(trainings.reduce((acc, t) => acc + (t.avg_hr || 0), 0) / trainings.length)
    : 0;
  const bestEffect = trainings.length ? Math.max(...trainings.map(t => t.training_effect || 0)) : 0;

  const lastTraining = trainings[0];

  const daysSinceLast = lastTraining
    ? Math.floor((new Date().getTime() - new Date(lastTraining.date).getTime()) / (1000 * 3600 * 24))
    : 999;

  // Definicja celów
  const goals = [
    // Rząd 1
    {
      id: 'water',
      label: 'Nawodnienie',
      icon: Droplets,
      count: todayLog?.water_glasses || 0,
      goal: 6,
      color: 'bg-cyan-500',
      iconColor: 'text-cyan-400',
    },
    {
      id: 'vitamins',
      label: 'Witaminy',
      icon: Pill,
      count: (todayLog?.vitamins || 0) === 1 ? 1 : 0,
      goal: 1,
      color: 'bg-rose-500',
      iconColor: 'text-rose-400',
    },
    {
      id: 'chores',
      label: 'Obowiązki domowe',
      icon: Home,
      count: todayLog?.household_chores || 0,
      goal: 1,
      color: 'bg-orange-500',
      iconColor: 'text-orange-400',
    },
    // Rząd 2
    {
      id: 'reading',
      label: 'Czytanie',
      icon: Book,
      count: todayLog?.reading_minutes || 0,
      goal: 60,
      color: 'bg-blue-500',
      iconColor: 'text-blue-400',
    },
    {
      id: 'vibe-coding',
      label: 'Vibe Coding',
      icon: Code2,
      count: todayLog?.vibe_coding_minutes || 0,
      goal: 120,
      color: 'bg-indigo-500',
      iconColor: 'text-indigo-400',
    },
    {
      id: 'kefir',
      label: 'Kefir',
      icon: Wind,
      count: todayLog?.kefir_glasses || 0,
      goal: 2,
      color: 'bg-yellow-500',
      iconColor: 'text-yellow-400',
    },
    {
      id: 'no-phone',
      label: 'Brak telefonu po 21',
      icon: Phone,
      count: (todayLog?.no_phone_after_21 || 0) === 1 ? 1 : 0,
      goal: 1,
      color: 'bg-purple-500',
      iconColor: 'text-purple-400',
    },
  ];

  // Automatyczne obliczanie Dyscypliny
  const totalGoalsCount = goals.length;
  const completedGoalsCount = goals.filter(g => g.count >= g.goal).length;
  const disciplineRate = Math.round((completedGoalsCount / totalGoalsCount) * 100);

  const aiMessages = [
    'Świetnie trzymasz dyscyplinę! Pamiętaj o regularnych treningach - ciało Ci podziękuje!',
    'Vibe Coding to Twój czas flow. Ciesz się nim!',
    'Porządek w domu to porządek w głowie. Zrób jedno małe zadanie!',
    'Witaminy wzięte? Zdrowie to inwestycja!',
  ];

  const randomAIMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)];

  const handleSaved = async () => {
    const log = await getTodayLog();
    setTodayLog(log);
    setSelectedGoal(null);
    onRefresh();
  };

  return (
    <div className="space-y-4 pb-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <PageHeader title="Dashboard" />

      {/* AI Coach */}
      {showAICoach && (
        <div className="relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3 flex items-center gap-3">
          <Sparkles className="text-purple-400 w-5 h-5 flex-shrink-0" />
          <p className="text-sm text-gray-200 flex-1">"{randomAIMessage}"</p>
          <button onClick={() => setShowAICoach(false)} className="text-gray-500 hover:text-gray-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={<Dumbbell className="w-8 h-8 text-orange-400" />} label="Treningi" value={trainings.length} />
        <StatCard icon={<Flame className="w-8 h-8 text-orange-500" />} label="Suma kcal" value={totalKcal} />
        <StatCard icon={<Heart className="w-8 h-8 text-red-500" />} label="Śr. tętno" value={avgHr} />
        <StatCard icon={<Zap className="w-8 h-8 text-yellow-400" />} label="Best efekt" value={bestEffect.toFixed(1)} />
      </div>

      {/* Alerts & Last Training */}
      <div className="flex gap-3 items-stretch text-sm">
        {daysSinceLast > 2 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 flex items-center gap-2 text-red-200 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Dni bez ruchu: <strong className="text-red-400">{daysSinceLast}</strong></span>
          </div>
        )}
        
        <div className="flex-1 bg-[#1c1c1e] border border-white/5 rounded-lg px-4 py-2 flex items-center justify-between text-gray-400 shadow-sm">
          <span className="font-semibold text-gray-300">Ostatni trening:</span>
          {lastTraining ? (
            <span>{new Date(lastTraining.date).toLocaleDateString()} • {lastTraining.calories} kcal • TE {lastTraining.training_effect}</span>
          ) : (
            <span>Brak danych</span>
          )}
        </div>
      </div>

      {/* Today's Goals */}
      <div>
        <h3 className="font-bold mb-2 text-base">Dzisiejsze Cele</h3>
        <div className="grid grid-cols-4 gap-3">
          
          {/* 
            🏆 SPECIAL CARD: DYSCYPLINA (Auto-calculated) 
            Distinct style: Golden/Yellow gradient + Trophy icon
          */}
          <div className="relative overflow-hidden rounded-lg p-3 border shadow-md bg-gradient-to-br from-yellow-900/40 to-yellow-600/10 border-yellow-500/40">
            {/* Background Progress Bar for Discipline */}
            <div 
              className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-700 ease-out" 
              style={{ width: `${disciplineRate}%` }} 
            />
            
            <div className="flex items-start justify-between mb-2">
              <div className="p-1.5 rounded-md bg-yellow-500/20 text-yellow-400">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-xs text-yellow-500/80 font-mono font-bold tracking-widest">{disciplineRate}%</span>
            </div>
            
            <div className="space-y-0.5 mt-auto">
               <p className="text-xs font-medium text-yellow-200/70 uppercase tracking-wide">Skuteczność</p>
               <p className="text-xl font-bold text-white leading-none tracking-tight">
                Dyscyplina
               </p>
            </div>
          </div>

          {/* Regular Goals */}
          {goals.map(goal => {
            const IconComponent = goal.icon;
            const isCompleted = goal.count >= goal.goal;
            const progress = Math.min((goal.count / goal.goal) * 100, 100);

            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`relative overflow-hidden rounded-lg p-3 text-left transition cursor-pointer border shadow-sm group ${
                  isCompleted
                    ? 'bg-green-900/10 border-green-500/30'
                    : 'bg-[#1c1c1e] border-white/5 hover:border-white/20'
                }`}
              >
                {/* Background Progress Bar */}
                <div 
                  className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isCompleted ? 'bg-green-500' : goal.color}`} 
                  style={{ width: `${progress}%` }} 
                />

                <div className="flex items-start justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-white/5 ' + goal.iconColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <span className="text-xs text-gray-500 font-mono">{Math.round(progress)}%</span>
                  )}
                </div>
                
                <div className="space-y-0.5">
                   <p className={`text-xs font-medium truncate ${isCompleted ? 'text-green-300' : 'text-gray-400'}`}>{goal.label}</p>
                   <p className="text-lg font-bold text-white leading-none">
                    {goal.count} <span className="text-xs text-gray-500 font-normal">/ {goal.goal}</span>
                   </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedGoal && todayLog && (
        <GoalModal
          goal={selectedGoal}
          todayLog={todayLog}
          onClose={() => setSelectedGoal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="bg-[#1c1c1e] rounded-lg p-4 flex flex-col items-center justify-center space-y-1 border border-white/5 shadow-sm hover:border-white/10 transition">
    {icon}
    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{label}</span>
    <span className="text-2xl font-bold text-white">{value}</span>
  </div>
);
