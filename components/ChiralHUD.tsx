import React from 'react';
import { WeatherState, Location } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface ChiralHUDProps {
  weatherState: WeatherState;
  fps: number;
  particles: number;
  location: Location;
  debugMsg: string;
  onToggleGuide: () => void;
  onLocationChange: (loc: Location) => void;
}

const ChiralHUD: React.FC<ChiralHUDProps> = ({
  weatherState,
  fps,
  particles,
  location,
  debugMsg,
  onToggleGuide,
  onLocationChange
}) => {
  const { t, language, setLanguage } = useTranslation();
  
  const getStateColor = (s: WeatherState) => {
    switch(s) {
      case WeatherState.NORMAL: return 'text-white';
      case WeatherState.FREEZE: return 'text-cyan-400';
      case WeatherState.REVERSE: return 'text-orange-500';
      case WeatherState.ROTATE: return 'text-yellow-400';
      case WeatherState.LIGHTNING: return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const MODES = [
    { id: WeatherState.NORMAL, label: t.temporalFall, code: 'NRM-01' },
    { id: WeatherState.FREEZE, label: t.timeSuspension, code: 'FRZ-02' },
    { id: WeatherState.REVERSE, label: t.entropyReversal, code: 'REV-03' },
    { id: WeatherState.ROTATE, label: t.spatialShift, code: 'ROT-04' },
    { id: WeatherState.LIGHTNING, label: t.highVoltage, code: 'LGT-05' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-20">
      
      {/* Top Header */}
      <div className="flex justify-between items-start border-t-2 border-white/20 pt-2">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-widest text-white/90">{t.chiralWeatherControl}</h1>
          <span className="text-xs text-white/50 tracking-[0.3em]">{t.bridgesId}</span>
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className={`text-xl font-bold tracking-widest transition-colors duration-300 ${getStateColor(weatherState)}`}>
             {weatherState}
           </div>
           <div className="text-xs text-white/50 mt-1">{t.systemStatusNormal}</div>
           <button
             onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
             className="text-xs text-white/70 hover:text-white transition-colors px-2 py-1 border border-white/20 pointer-events-auto"
           >
             {language === 'en' ? '中文' : 'EN'}
           </button>
        </div>
      </div>

      {/* Center Crosshair & Scanner */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-40">
        <div className="w-64 h-64 border border-white/20 rounded-full flex items-center justify-center relative">
          <div className="w-60 h-60 border border-white/10 rounded-full animate-spin duration-[10s]" style={{borderTopColor: 'transparent'}}></div>
          <div className="absolute w-2 h-2 bg-white/80 rounded-full"></div>
          <div className="absolute top-0 w-[1px] h-4 bg-white/50"></div>
          <div className="absolute bottom-0 w-[1px] h-4 bg-white/50"></div>
          <div className="absolute left-0 w-4 h-[1px] bg-white/50"></div>
          <div className="absolute right-0 w-4 h-[1px] bg-white/50"></div>
        </div>
      </div>

      {/* Left Information Panel */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 w-64">
         
         {/* System Stats */}
         <div className="flex flex-col gap-1 border-l-2 border-white/10 pl-4 py-2">
            <div className="text-[10px] text-white/40 tracking-[0.2em] mb-1">{t.systemMetrics}</div>
            <div className="text-xs text-white/60 font-mono flex justify-between">
              <span>{t.fpsRate}</span>
              <span className="text-white">{fps}</span>
            </div>
            <div className="text-xs text-white/60 font-mono flex justify-between">
              <span>{t.particleDensity}</span>
              <span className="text-white">{particles}</span>
            </div>
            <div className="text-xs text-white/60 font-mono flex justify-between">
              <span>{t.chiralLevel}</span>
              <span className="text-white">{Math.random().toFixed(4)}</span>
            </div>
         </div>

         {/* Operation Mode List */}
         <div className="flex flex-col gap-2">
            <div className="text-[10px] text-white/40 tracking-[0.2em] mb-1 pl-4 border-l-2 border-transparent">{t.operationMode}</div>
            
            {MODES.map((mode) => {
              const isActive = weatherState === mode.id;
              const activeColorClass = getStateColor(mode.id);
              
              return (
                <div 
                  key={mode.id} 
                  className={`
                    relative flex items-center justify-between text-xs font-mono transition-all duration-300 border-l-2 pl-4 py-1
                    ${isActive ? 'border-white bg-white/5 translate-x-2' : 'border-white/5 opacity-30'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isActive && <span className={`animate-pulse ${activeColorClass}`}>▶</span>}
                    <span className={isActive ? activeColorClass : 'text-white'}>
                      {mode.label}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-50">{mode.code}</span>
                </div>
              );
            })}
         </div>

         {/* Debug Output */}
         <div className="border-t border-white/10 pt-2 mt-2">
             <div className="text-[10px] text-orange-400 font-mono min-h-[1.5em] animate-pulse">
                {debugMsg ? `>> ${debugMsg}` : `> ${t.awaitingInput}`}
             </div>
         </div>

      </div>

      {/* Bottom Controls */}
      <div className="flex justify-between items-end border-b-2 border-white/20 pb-2">
        <div className="flex gap-4 pointer-events-auto">
          {Object.values(Location).map((loc) => (
            <button 
              key={loc}
              onClick={() => onLocationChange(loc)}
              className={`text-xs px-2 py-1 border transition-all ${location === loc ? 'bg-white text-black border-white' : 'text-white border-white/30 hover:border-white'}`}
            >
              {loc}
            </button>
          ))}
        </div>

        <button
          onClick={onToggleGuide}
          className="pointer-events-auto px-4 py-2 border border-white text-white hover:bg-white hover:text-black transition-colors text-sm tracking-widest"
        >
          {t.dataGuide}
        </button>
      </div>
    </div>
  );
};

export default ChiralHUD;