import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-8 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-4xl w-full border border-white/30 bg-black p-8 relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-4 text-white hover:text-red-500" onClick={onClose}>[CLOSE]</button>
        
        <h2 className="text-2xl text-white mb-8 tracking-[0.2em] border-b border-white/20 pb-4">OPERATIONAL_MANUAL</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-300">
          <div className="flex flex-col gap-2">
            <h3 className="text-cyan-400 font-bold">1. TIME_SUSPENSION (Freeze)</h3>
            <p>GESTURE: Raise both open palms facing camera (Normal Width).</p>
            <p className="text-xs text-gray-500">Effect: Raindrops halt in mid-air. Hydro-static visualization active.</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-orange-500 font-bold">2. ENTROPY_REVERSAL (Rewind)</h3>
            <p>GESTURE: SPREAD both arms wide outwards to the sides (Open Palms).</p>
            <p className="text-xs text-gray-500">Effect: Temporal inversion. Rain falls upwards. Audio warping.</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-yellow-400 font-bold">3. SPATIAL_SHIFT (Rotate)</h3>
            <p>GESTURE: Both hands closed (FISTS).</p>
            <p className="text-xs text-gray-500">Effect: Rotate camera perspective based on hand position relative to center.</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-red-500 font-bold">4. HIGH_VOLTAGE (Lightning)</h3>
            <p>GESTURE: "Pinch" gesture (Thumb + Middle Finger touching) on either hand, then release.</p>
            <p className="text-xs text-gray-500">Effect: Atmospheric discharge. Screen shake. Thunder generation.</p>
          </div>
          
           <div className="flex flex-col gap-2 col-span-full border-t border-white/10 pt-4">
            <h3 className="text-white font-bold">0. TEMPORAL_FALL (Normal)</h3>
            <p>GESTURE: Hands down or relaxed.</p>
          </div>
        </div>

        <div className="mt-8 text-center">
            <span className="animate-pulse text-xs text-white/40">CLICK ANYWHERE TO INITIALIZE SYSTEM</span>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;