import { useEffect, useState } from "react";

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900 flex items-center justify-center z-50 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full animate-pulse"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(52, 211, 153, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(20, 184, 166, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 25%, rgba(52, 211, 153, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 25% 75%, rgba(20, 184, 166, 0.05) 0%, transparent 50%)
            `,
            backgroundSize: '200px 200px'
          }}
        ></div>
      </div>
      
      <div className="text-center space-y-12 relative z-10">
        {/* Islamic Geometric Loading Animation */}
        <div className="relative w-32 h-32 mx-auto">
          {/* Outer Ring - Islamic Geometric Pattern */}
          <div className="absolute inset-0 border-4 border-emerald-400/30 rounded-full animate-spin-slow">
            <div className="absolute -top-2 left-1/2 w-4 h-4 bg-emerald-400 rounded-full transform -translate-x-1/2 shadow-lg shadow-emerald-400/50 animate-pulse"></div>
            <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-teal-400 rounded-full transform -translate-x-1/2 shadow-lg shadow-teal-400/50 animate-pulse"></div>
            <div className="absolute top-1/2 -right-2 w-4 h-4 bg-emerald-300 rounded-full transform -translate-y-1/2 shadow-lg shadow-emerald-300/50 animate-pulse"></div>
            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-teal-300 rounded-full transform -translate-y-1/2 shadow-lg shadow-teal-300/50 animate-pulse"></div>
          </div>
          
          {/* Middle Ring */}
          <div className="absolute inset-4 border-2 border-teal-400/40 rounded-full animate-spin-reverse">
            <div className="absolute -top-1 left-1/2 w-2 h-2 bg-teal-400 rounded-full transform -translate-x-1/2 animate-bounce"></div>
            <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-emerald-400 rounded-full transform -translate-x-1/2 animate-bounce"></div>
          </div>
          
          {/* Crescent Moon and Star */}
          <div className="absolute inset-8 flex items-center justify-center">
            <div className="relative animate-float-gentle">
              {/* Crescent Moon */}
              <div 
                className="w-8 h-8 border-4 border-emerald-400 rounded-full relative overflow-hidden animate-glow-pulse"
                style={{
                  boxShadow: '0 0 20px rgba(52, 211, 153, 0.5)',
                  filter: 'brightness(1.1)'
                }}
              >
                <div className="absolute top-1 right-1 w-6 h-6 bg-slate-900 rounded-full"></div>
              </div>
              {/* Star */}
              <div className="absolute -top-1 -right-1 text-teal-400 animate-sparkle-rotate">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text with Arabic-inspired Typography */}
        <div className="space-y-4">
          <h1 
            className="text-4xl font-bold text-emerald-400 tracking-wider animate-pulse"
            style={{
              textShadow: '0 0 20px rgba(52, 211, 153, 0.5), 0 0 40px rgba(52, 211, 153, 0.3)'
            }}
          >
            AI Islam
          </h1>
          <div className="text-lg text-teal-300/80 font-light tracking-wide animate-pulse">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </div>
          <div className="text-sm text-emerald-300/60 animate-pulse">
            Loading Islamic Knowledge...
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-emerald-900/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-300 shadow-lg shadow-emerald-400/30"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;