import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-8 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-4xl w-full border border-white/30 bg-black p-8 relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-white hover:text-red-500" onClick={onClose}>[{t.close}]</button>
        
        <h2 className="text-2xl text-white mb-8 tracking-[0.2em] border-b border-white/20 pb-4">{t.operationalManual}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-300">
          <div className="flex flex-col gap-2">
            <h3 className="text-cyan-400 font-bold">1. {t.timeSuspension} (Freeze)</h3>
            <p>{t.gesture}: {t.freezeDesc}</p>
            <p className="text-xs text-gray-500">{t.effect}: {t.freezeEffect}</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-orange-500 font-bold">2. {t.entropyReversal} (Rewind)</h3>
            <p>{t.gesture}: {t.rewindDesc}</p>
            <p className="text-xs text-gray-500">{t.effect}: {t.rewindEffect}</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-yellow-400 font-bold">3. {t.spatialShift} (Rotate)</h3>
            <p>{t.gesture}: {t.rotateDesc}</p>
            <p className="text-xs text-gray-500">{t.effect}: {t.rotateEffect}</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-red-500 font-bold">4. {t.highVoltage} (Lightning)</h3>
            <p>{t.gesture}: {t.lightningDesc}</p>
            <p className="text-xs text-gray-500">{t.effect}: {t.lightningEffect}</p>
          </div>

          <div className="flex flex-col gap-2 col-span-full border-t border-white/10 pt-4">
            <h3 className="text-white font-bold">0. {t.temporalFall} (Normal)</h3>
            <p>{t.gesture}: {t.normalDesc}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
            <span className="animate-pulse text-xs text-white/40">{t.clickToInitialize}</span>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;