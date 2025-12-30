import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Training, DailyLog } from '../types';

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
      hr: t.avgHr,
      maxHr: t.maxHr,
      effect: t.effect
    }))
    .slice(-10);

  // Daily logs - ostatnie 7 dni
  const sortedLogs = [...dailyLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const dailyChartData = sortedLogs.slice(-7).map(log => ({
    date: new Date(log.date).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }),
    water: log.water_glasses || 0,
    reading: log.reading_minutes || 0,
  }));

  // Compliance pie chart
  const completionCounts = {
    reading: sortedLogs.filter(l => l.reading_minutes && l.reading_minutes > 0).length,
    kefir: sortedLogs.filter(l => l.kefir_glasses && l.kefir_glasses > 0).length,
    water: sortedLogs.filter(l => l.water_glasses && l.water_glasses >= 6).length,
    noPhone: sortedLogs.filter(l => l.no_phone_after_21).length,
  };

  const complianceData = [
    { name: 'Czytanie', value: completionCounts.reading },
    { name: 'Kefir', value: completionCounts.kefir },
    { name: 'Woda', value: completionCounts.water },
    { name: 'No Phone', value: completionCounts.noPhone },
  ];

  const COLORS = ['#3b82f6', '#eab308', '#06b6d4', '#a855f7'];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold">Trends</h2>

      {/* TRENINGI */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white">Treningi (ostatnie 10)</h3>

        {/* Calories Chart */}
        {trainingChartData.length > 0 ? (
          <section>
            <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Kalorie Spalane</h4>
            <div className="h-48 w-full bg-[#1c1c1e] p-4 rounded-2xl border border-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trainingChartData}>
                  <defs>
                    <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #333', borderRadius: '8px' }}
                    itemStyle={{ color: '#00bcd4' }}
                  />
                  <Area type="monotone" dataKey="kcal" stroke="#00bcd4" fillOpacity={1} fill="url(#colorKcal)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        ) : null}

        {/* Heart Rate Chart */}
        {trainingChartData.length > 0 ? (
          <section>
            <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Tętno (Średnia vs Maksimum)</h4>
            <div className="h-48 w-full bg-[#1c1c1e] p-4 rounded-2xl border border-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trainingChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="hr" stroke="#4dabf7" strokeWidth={2} dot={{ r: 4 }} name="Średnie HR" />
                  <Line type="monotone" dataKey="maxHr" stroke="#ff6b6b" strokeWidth={2} dot={{ r: 4 }} name="Max HR" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        ) : null}
      </div>

      {/* DZIENNE CELE */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white">Dzienne Cele (ostatnie 7 dni)</h3>

        {/* Water & Reading */}
        {dailyChartData.length > 0 ? (
          <section>
            <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Nawodnienie & Czytanie</h4>
            <div className="h-48 w-full bg-[#1c1c1e] p-4 rounded-2xl border border-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar dataKey="water" fill="#06b6d4" name="Woda (szkl.)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="reading" fill="#3b82f6" name="Czytanie (min)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        ) : null}

        {/* Compliance Pie */}
        {complianceData.some(d => d.value > 0) ? (
          <section>
            <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Compliance - Dni z Osiągniętym Celem</h4>
            <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-white/10">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="45%"
                    innerRadius={0}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {complianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1c1c1e', 
                      border: '1px solid #333', 
                      borderRadius: '8px',
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Legenda poniżej pie */}
              <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-white/10">
                {complianceData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: COLORS[idx] }} 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300">{item.name}</p>
                      <p className="text-lg font-bold text-white">{item.value} dni</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <div className="text-center text-gray-500 text-xs mt-4 italic">
        Treningi: ostatnie 10 sesji | Cele: ostatnie 7 dni
      </div>
    </div>
  );
};
