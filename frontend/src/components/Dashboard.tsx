import React, { useState } from 'react';
import { Training, DailyLog } from '../types';
import { Dumbbell, Flame, Heart, Zap, AlertTriangle, Sparkles, Check, Book, Wind, Droplets, Phone, X } from 'lucide-react';
import { GoalModal } from './GoalModal';
import { getTodayLog } from '../utils/storage';



interface DashboardProps {
  trainings: Training[];
  dailyLogs: DailyLog[];
}



export const Dashboard: React.FC<DashboardProps> = ({ trainings, dailyLogs }) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showAICoach, setShowAICoach] = useState(true);
  const [todayLog, setTodayLog] = useState<DailyLog>(getTodayLog());



  const totalKcal = trainings.reduce((acc, t) => acc + (t.calories || 0), 0);
  const avgHr = trainings.length
    ? Math.round(trainings.reduce((acc, t) => acc + (t.avgHr || 0), 0) / trainings.length)
    : 0;
  const bestEffect = trainings.length ? Math.max(...trainings.map(t => t.effect || 0)) : 0;



  const lastTraining = trainings[0];



  const daysSinceLast = lastTraining
    ? Math.floor((new Date().getTime() - new Date(lastTraining.date).getTime()) / (1000 * 3600 * 24))
    : 999;



  const goals = [
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
      id: 'kefir',
      label: 'Kefir',
      icon: Wind,
      count: todayLog?.kefir_glasses || 0,
      goal: 2,
      color: 'bg-yellow-500',
      iconColor: 'text-yellow-400',
    },
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
      id: 'discipline',
      label: 'Dyscyplina',
      icon: Zap,
      count: todayLog?.discipline_score || 0,
      goal: 100,
      color: 'bg-green-500',
      iconColor: 'text-green-400',
    },
    {
      id: 'no-phone',
      label: 'Brak telefonu po 21',
      icon: Phone,
      count: todayLog?.no_phone_after_21 ? 1 : 0,
      goal: 1,
      color: 'bg-purple-500',
      iconColor: 'text-purple-400',
    },
    {
      id: 'calories',
      label: 'Kalorie',
      icon: Flame,
      count: todayLog?.calories || 0,
      goal: 1500,
      color: 'bg-orange-500',
      iconColor: 'text-orange-400',
    },
  ];



const aiMessages = [
  // Motywacyjne
  "Świetnie trzymasz dyscyplinę! Pamiętaj o regularnych treningach - ciało Ci podziękuje!",
  "Czytanie rozszerza umysł, trening wzmacnia ciało. Połączenie obu to recepta na sukces!",
  "Nawodnienie to fundament zdrowia. Pij regularnie i czuj się lepiej!",
  "Kefir + treningi = magiczna kombinacja dla zdrowia!",
  "Brak telefonu po 21 to dar dla Twojego snu. Doskonale radzisz sobie z dyscypliną!",
  
  // Czytanie
  "Czytanie to życie! Każda przeczytana strona to nowa wiedza. Dalej tak!",
  "Książki to bramy do nowych światów. Właśnie stoisz przed jedną z nich!",
  "Każdych 30 minut czytania to inwestycja w Twój umysł. Naprawdę to docenia!",
  "Czytacz żyje tysiąc żyć, zanim umrze. Będziesz żył setki więcej!",
  "Drukowana lub cyfrowa - słowa liczą się. Świetnie przeczytane już dzisiaj!",
  
  // Nawodnienie
  "Twoje komórki dziękują za każdy łyk wody! Tak trzymaj!",
  "Woda to najlepszy napój dla zdrowia. Pij więcej, czuj się lepiej!",
  "Nawodniony umysł to funkcjonalny umysł. 8 szklanek to ideał!",
  "Przepływ wody = przepływ energii. Naprawdę zaobserwujesz różnicę!",
  "H₂O jest najlepszym dofinansowaniem dla Twojego ciała!",
  
  // Trening
  "Każdy trening to krok bliżej do lepszej wersji siebie!",
  "Endorfiny czekają. Doskonały trening dzisiaj!",
  "Wzmacniasz mięśnie i umysł jednocześnie. Fenomenalnie!",
  "Ruch to życie. Dziś wybrałeś życie - brawo!",
  "Twoje ciało będzie Ci dziękować za każdy squat i karate!",
  "Treningowy maraton zaczął się. Jeszcze wiele przede Mną!",
  
  // Kefir
  "Kefir to probiotyk zdrowia! Twój przewód pokarmowy cię kocha!",
  "Żywe kultury bakterii pracują na Twoją korzyść. Super!",
  "Kefir porcja = spokojny żołądek. Dobrze się sprawiasz!",
  "Probiotyki to trzecia armia zdrowia. Dzisiaj przywódca!",
  
  // Telefon
  "Godzina po 21 bez telefonu to złoto dla snu! Genius move!",
  "Twój mózg się regeneruje. To czarowne czasy bez ekranów!",
  "Melatonina dziękuje. Rzeczywiście będziesz spać lepiej!",
  "Brak scrollowania przed snem = sen snu. Mądra decyzja!",
  "Oczy odpoczywają, umysł się resetuje. Idealnie!",
  
  // Motywacja ogólna
  "Każdy dzień to szansa na bycie lepszym. Dziś już lepszy!",
  "Nie chodzi o perfekcję, chodzi o konsystencję. Bravo!",
  "Malutkie kroki prowadzą do wielkich zmian. Robisz to!",
  "Twoja przyszły ja będzie Ci dziękować za dzisiejszą pracę!",
  "Zamiast czekać na zmianę, tworzysz zmianę. To jest siła!",
  "Dyscyplina to wolność. A Ty jesteś wolny!",
  "Jeden dzień, jeden nawyk. Klejnie je jedno na drugie!",
  "Nie liczą się dni w Twoim życiu, liczy się życie w Twoich dniach!",
  "Przyczyna do dumy? Już tutaj - dzisiaj pracujesz nad sobą!",
  "Ktoś siedzi i czeka. Ty działasz. To robi różnicę!",
];



  const randomAIMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)];



  const handleSaved = () => {
    setTodayLog(getTodayLog());
    setSelectedGoal(null);
  };



  return (
    <div className="space-y-3 xl:space-y-4 pb-20 xl:pb-0 animate-in fade-in duration-500">
      {/* AI Coach - Na górze, sticky */}
      {showAICoach && (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-3 xl:p-4 mb-4">
          <div className="flex items-start gap-2 xl:gap-3">
            <Sparkles className="text-purple-400 w-4 h-4 xl:w-5 xl:h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-purple-300 mb-0.5 text-xs xl:text-sm">AI Coach</h3>
              <p className="text-xs xl:text-sm text-gray-200 break-words">"{randomAIMessage}"</p>
            </div>
            <button
              onClick={() => setShowAICoach(false)}
              className="text-gray-500 hover:text-gray-300 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* KPI Grid - Kompaktowe */}
      <div className="grid grid-cols-4 gap-2 xl:gap-3">
        <StatCard icon={<Dumbbell className="w-10 h-10 xl:w-14 xl:h-14 text-orange-400" />} label="Treningi" value={trainings.length} />
        <StatCard icon={<Flame className="w-10 h-10 xl:w-14 xl:h-14 text-orange-500" />} label="Suma kcal" value={totalKcal} />
        <StatCard icon={<Heart className="w-10 h-10 xl:w-14 xl:h-14 text-red-500" />} label="Śr. tętno" value={avgHr} />
        <StatCard icon={<Zap className="w-10 h-10 xl:w-14 xl:h-14 text-yellow-400" />} label="Best efekt" value={bestEffect.toFixed(1)} />
      </div>



      {/* Last Training - Kompaktowe */}
      <div className="text-sm xl:text-base">
        <h3 className="font-bold mb-1">Ostatni trening</h3>
        <p className="text-xs xl:text-sm text-gray-500">
          {lastTraining ? (
            <>
              {new Date(lastTraining.date).toLocaleString()} • {lastTraining.calories} kcal • śr HR {lastTraining.avgHr} • TE {lastTraining.effect}
            </>
          ) : (
            'Brak danych jeszcze.'
          )}
        </p>
      </div>



      {/* Alerts - Kompaktowe */}
      {daysSinceLast > 2 && (
        <div className="bg-[#1c1c1e] border border-orange-500/20 rounded-lg p-2 xl:p-3 flex items-center space-x-2 text-xs xl:text-sm">
          <AlertTriangle className="text-orange-500 w-4 h-4 xl:w-5 xl:h-5 flex-shrink-0" />
          <p className="font-semibold">
            Dni bez ruchu: <span className="text-red-500">{daysSinceLast}</span> — czas wrócić do gry!
          </p>
        </div>
      )}



      {/* Dzisiejsze Cele - 3 kolumny */}
      <div>
        <h3 className="font-bold mb-2 text-sm xl:text-base">Dzisiejsze Cele</h3>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 xl:gap-3">
          {goals.map(goal => {
            const IconComponent = goal.icon;
            const isCompleted = goal.count >= goal.goal;
            const progress = Math.min((goal.count / goal.goal) * 100, 100);



            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`rounded-lg p-3 xl:p-4 text-left transition cursor-pointer group ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-600/30 to-green-700/30 border border-green-500/30'
                    : 'bg-[#1c1c1e] border border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <IconComponent className={`w-8 h-8 xl:w-9 xl:h-9 ${isCompleted ? 'text-green-400' : goal.iconColor}`} />
                  <span className={`text-xs xl:text-sm font-semibold ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>
                    {goal.count}/{goal.goal}
                  </span>
                </div>
                <p className={`font-semibold mb-1 text-xs xl:text-sm ${isCompleted ? 'text-green-300' : 'text-white'}`}>{goal.label}</p>



                <div className={`h-1.5 rounded-full ${goal.color} opacity-60 group-hover:opacity-100 transition`} style={{ width: `${progress}%` }} />



                {isCompleted ? (
                  <div className="flex items-center gap-1 mt-1 text-green-400 text-xs font-semibold">
                    <Check className="w-3 h-3" />
                    <span>OK!</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}%</p>
                )}
              </button>
            );
          })}
        </div>
      </div>


      {selectedGoal && (
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
  <div className="bg-[#1c1c1e] rounded-lg p-2 xl:p-4 flex flex-col items-center justify-center space-y-0.5 xl:space-y-1 aspect-square">
    {icon}
    <span className="text-[9px] xl:text-xs text-gray-400 font-medium whitespace-nowrap">{label}</span>
    <span className="text-lg xl:text-2xl font-bold">{value}</span>
  </div>
);
