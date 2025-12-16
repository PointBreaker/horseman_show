import React, { useState } from 'react';
import Scene from './components/Scene';
import ChiralHUD from './components/ChiralHUD';
import GuideModal from './components/GuideModal';
import { WeatherState, Location } from './types';
import { LOCATIONS, PARTICLE_COUNT } from './constants';
import { LanguageProvider } from './contexts/LanguageContext';

const App: React.FC = () => {
  const [weatherState, setWeatherState] = useState<WeatherState>(WeatherState.NORMAL);
  const [fps, setFps] = useState(0);
  const [debugMsg, setDebugMsg] = useState("");
  const [location, setLocation] = useState<Location>(Location.LONDON);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  const handleStatsUpdate = (newFps: number, newState: WeatherState, debug: string) => {
    setFps(newFps);
    setWeatherState(newState);
    setDebugMsg(debug);
  };

  return (
    <LanguageProvider>
      <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
        <Scene
          onStatsUpdate={handleStatsUpdate}
          locationImg={LOCATIONS[location]}
        />

        <div className="scanline" />
        <div className="vignette" />

        <ChiralHUD
          weatherState={weatherState}
          fps={fps}
          particles={PARTICLE_COUNT}
          location={location}
          debugMsg={debugMsg}
          onToggleGuide={() => setIsGuideOpen(true)}
          onLocationChange={setLocation}
        />

        <GuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      </div>
    </LanguageProvider>
  );
};

export default App;
