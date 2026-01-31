export const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center animate-in fade-in zoom-in-90 duration-1000 transition-transform hover:-translate-y-1 hover:duration-300 ${className}`}>
    {/* 1. TŁO GLASSMORPHISM (To robi robotę "premium") */}
    <div className="absolute inset-0 bg-teal-500/10 rounded-2xl blur-md" />
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl border border-white/10 backdrop-blur-sm shadow-xl" />

    {/* 2. LOGO WEKTOROWE */}
    <svg 
      viewBox="0 0 120 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="relative z-10 w-3/4 h-3/4 drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]"
    >
      <defs>
        {/* Gradient: od ostrego turkusu do czystej bieli */}
        <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2dd4bf" /> {/* Tailwind teal-400 */}
          <stop offset="100%" stopColor="#ccfbf1" /> {/* Tailwind teal-100 */}
        </linearGradient>
      </defs>

      {/* Linia: Grubsza, bardziej płynna */}
      <path 
        d="M 10 30 L 25 30 L 35 10 L 45 50 L 55 30 Q 75 10 90 30 T 110 30" 
        stroke="url(#premiumGradient)" 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Akcent: Kropka "Active" */}
      <circle cx="90" cy="18" r="3" fill="#ccfbf1" className="animate-pulse" />
    </svg>
  </div>
);
