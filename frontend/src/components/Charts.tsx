import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Training, DailyLog } from '../types';
import { PageHeader } from './PageHeader';

interface ChartsProps {
  trainings: Training[];
  dailyLogs?: DailyLog[];
}

export const Charts: React.FC<ChartsProps> = ({ trainings, dailyLogs = [] }) => {
  // Treningi - ostatnie 10
  const trainingChartData = [...trainings]
    .reverse()
    .map(t => ({
      date: new Date(t.date).toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
      kcal: t.calories,
      hr: t.avg_hr,
      maxHr: t.max_hr,
      effect: t.training_effect
    }))
    .slice(-10);

  // Daily logs - ostatnie 7 dni (sortowanie chronologiczne)
  const sortedLogs = [...dailyLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const dailyChartData = sortedLogs.slice(-7).map(log => ({
    date: new Date(log.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }),
    // Czas
    reading: log.reading_minutes || 0,
    vibe_coding: log.vibe_coding_minutes || 0,
    // Ilość
    water: log.water_glasses || 0,
    kefir: log.kefir_glasses || 0,
    chores: log.household_chores || 0,
  }));

  // Compliance pie chart - sumowanie dni z osiągniętym celem
  const completionCounts = {
    reading: sortedLogs.filter(l => l.reading_minutes && l.reading_minutes > 0).length,
    vibe_coding: sortedLogs.filter(l => l.vibe_coding_minutes && l.vibe_coding_minutes > 0).length,
    water: sortedLogs.filter(l => l.water_glasses && l.water_glasses >= 6).length,
    kefir: sortedLogs.filter(l => l.kefir_glasses && l.kefir_glasses > 0).length,
    noPhone: sortedLogs.filter(l => l.no_phone_after_21 && l.no_phone_after_21 === 1).length,
    chores: sortedLogs.filter(l => l.household_chores && l.household_chores > 0).length,
    vitamins: sortedLogs.filter(l => l.vitamins && l.vitamins > 0).length,
  };

  const complianceData = [
    { name: 'Czytanie', value: completionCounts.reading, color: '#2dd4bf' }, // Teal
    { name: 'Vibe Coding', value: completionCounts.vibe_coding, color: '#6366f1' }, // Indigo
    { name: 'Woda', value: completionCounts.water, color: '#06b6d4' }, // Cyan
    { name: 'Kefir', value: completionCounts.kefir, color: '#eab308' }, // Yellow
    { name: 'Brak telefonu', value: completionCounts.noPhone, color: '#a855f7' }, // Purple
    { name: 'Obowiązki', value: completionCounts.chores, color: '#f97316' }, // Orange
    { name: 'Witaminy', value: completionCounts.vitamins, color: '#f43f5e' }, // Rose
  ].filter(item => item.value > 0);

  // Wspólny styl dla Tooltipów (Fix dla ciemnego motywu)
  const tooltipStyle = {
    backgroundColor: '#1c1c1e',
    borderColor: '#333',
    borderRadius: '8px',
    color: '#fff'
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-right-4 duration-300 max-w-6xl mx-auto">
      <PageHeader title="Wykresy i Trendy" subtitle="Ostatnie 10 treningów i 7 dni" />

      {/* --- SEKCJA 1: TRENINGI --- */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white border-l-4 border-orange-500 pl-3">Treningi (ostatnie 10)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wykres Kalorii */}
          {trainingChartData.length > 0 && (
            <div className="bg-[#1c1c1e] p-4 rounded-xl border border-white/10 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Spalone Kalorie</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trainingChartData}>
                    <defs>
                      <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={tooltipStyle} 
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Area type="monotone" dataKey="kcal" stroke="#f97316" fill="url(#colorKcal)" strokeWidth={2} name="Kcal" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Wykres Tętna */}
          {trainingChartData.length > 0 && (
            <div className="bg-[#1c1c1e] p-4 rounded-xl border border-white/10 shadow-sm">
              <h4 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Tętno (Średnie vs Max)</h4>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainingChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 10', 'auto']} />
                    <Tooltip 
                      contentStyle={tooltipStyle} 
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={false} name="Śr. HR" />
                    <Line type="monotone" dataKey="maxHr" stroke="#b91c1c" strokeWidth={2} dot={false} strokeDasharray="3 3" name="Max HR" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- SEKCJA 2: DAILY LOGS --- */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white border-l-4 border-teal-500 pl-3">Nawyki (ostatnie 7 dni)</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Wykres Czasu: Czytanie + Vibe Coding */}
          <div className="bg-[#1c1c1e] p-4 rounded-xl border border-white/10 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Czas Skupienia (minuty)</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={tooltipStyle} 
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#9ca3af' }}
                    cursor={{fill: '#ffffff10'}} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="reading" fill="#2dd4bf" name="Czytanie" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="vibe_coding" fill="#6366f1" name="Vibe Coding" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Wykres Ilości: Woda + Kefir */}
          <div className="bg-[#1c1c1e] p-4 rounded-xl border border-white/10 shadow-sm">
            <h4 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">Ilości (Woda, Kefir, Obowiązki)</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={tooltipStyle} 
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#9ca3af' }}
                    cursor={{fill: '#ffffff10'}} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="water" fill="#06b6d4" name="Woda (szkl.)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="kefir" fill="#eab308" name="Kefir (szkl.)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="chores" fill="#f97316" name="Obowiązki" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEKCJA 3: COMPLIANCE --- */}
      <div className="space-y-6">
         <h3 className="text-lg font-bold text-white border-l-4 border-purple-500 pl-3">Dyscyplina (Dni z sukcesem)</h3>
         
         <div className="bg-[#1c1c1e] p-4 rounded-xl border border-white/10 shadow-sm flex flex-col md:flex-row items-center justify-around min-h-[300px]">
           
           <div className="h-64 w-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={tooltipStyle} 
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center text overlay */}
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-3xl font-bold text-white">{sortedLogs.length}</span>
                <span className="text-xs text-gray-500 uppercase">Dni Log</span>
              </div>
           </div>

           {/* Custom Legend */}
           <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-6 md:mt-0">
              {complianceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium">{item.name}</span>
                    <span className="text-sm font-bold text-white">{item.value} dni</span>
                  </div>
                </div>
              ))}
           </div>

         </div>
      </div>

    </div>
  );
};
