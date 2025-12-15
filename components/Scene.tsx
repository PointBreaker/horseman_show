import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Particle, WeatherState } from '../types';
import { PARTICLE_COUNT, MAX_DEPTH, GRAVITY } from '../constants';
import { AudioEngine } from '../services/audioEngine';

interface SceneProps {
  onStatsUpdate: (fps: number, state: WeatherState, debug: string) => void;
  locationImg: string;
}

// MediaPipe Hand Connections (Pairs of indices)
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17], [0, 5], [0, 17] // Palm Base & Knuckles
];

const Scene: React.FC<SceneProps> = ({ onStatsUpdate, locationImg }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamRef = useRef<Webcam>(null);
  
  // Logic State
  const particles = useRef<Particle[]>([]);
  const audioRef = useRef<AudioEngine>(new AudioEngine());
  const requestRef = useRef<number>(0);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const lastTimeRef = useRef<number>(0);
  const rotationRef = useRef<number>(0);
  const shakeIntensity = useRef<number>(0);
  
  // Logic control
  const weatherStateRef = useRef<WeatherState>(WeatherState.NORMAL);
  const pinchTracker = useRef<{left: boolean, right: boolean}>({left: false, right: false});

  // Init Particles
  const initParticles = () => {
    const p: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      p.push(resetParticle({} as Particle, true));
    }
    particles.current = p;
  };

  const resetParticle = (p: Particle, randomY: boolean = false): Particle => {
    p.x = Math.random() * window.innerWidth;
    p.y = randomY ? Math.random() * window.innerHeight : -20;
    p.z = Math.random() * MAX_DEPTH;
    p.len = Math.random() * 20 + 10;
    p.speed = Math.random() * 10 + 15;
    p.opacity = (1 - p.z / MAX_DEPTH) * 0.8;
    p.width = Math.max(0.5, (1 - p.z / MAX_DEPTH) * 2.5);
    p.history = [];
    return p;
  };

  // MediaPipe Setup
  useEffect(() => {
    const setupVision = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
    };
    setupVision();
    initParticles();

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gesture Recognition Logic
  const detectGestures = (results: any) => {
    if (!results.landmarks || results.landmarks.length === 0) {
      weatherStateRef.current = WeatherState.NORMAL;
      return "NO_HANDS_DETECTED";
    }

    const hands = results.landmarks; // Array of hand landmarks

    // Helper: is hand open? (Fingers extended)
    const isHandOpen = (landmarks: any[]) => {
      const wrist = landmarks[0];
      const indexTip = landmarks[8];
      const indexMcp = landmarks[5];
      const distTip = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
      const distMcp = Math.hypot(indexMcp.x - wrist.x, indexMcp.y - wrist.y);
      return distTip > distMcp * 1.5; 
    };

    // Helper: is hand fist?
    const isFist = (landmarks: any[]) => {
      const wrist = landmarks[0];
      const indexTip = landmarks[8];
      const indexMcp = landmarks[5];
      const distTip = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
      const distMcp = Math.hypot(indexMcp.x - wrist.x, indexMcp.y - wrist.y);
      return distTip < distMcp * 1.2;
    };

    // Helper: is pinch (Thumb to Middle)?
    const isPinch = (landmarks: any[]) => {
      const thumbTip = landmarks[4];
      const middleTip = landmarks[12];
      const dist = Math.hypot(thumbTip.x - middleTip.x, thumbTip.y - middleTip.y);
      return dist < 0.05; // Threshold
    };

    let state = WeatherState.NORMAL;
    let debug = "";
    
    // Logic Mapping
    const hand1 = hands[0];
    const hand2 = hands.length > 1 ? hands[1] : null;

    // 1. Lightning Check (Priority: Trigger on Release)
    const pinch1 = isPinch(hand1);
    const pinch2 = hand2 ? isPinch(hand2) : false;
    
    if (pinch1 && !pinchTracker.current.left) pinchTracker.current.left = true;
    if (!pinch1 && pinchTracker.current.left) {
        state = WeatherState.LIGHTNING;
        pinchTracker.current.left = false;
        triggerLightning();
    }
    if (hand2) {
        if (pinch2 && !pinchTracker.current.right) pinchTracker.current.right = true;
        if (!pinch2 && pinchTracker.current.right) {
            state = WeatherState.LIGHTNING;
            pinchTracker.current.right = false;
            triggerLightning();
        }
    }
    
    if (state === WeatherState.LIGHTNING) {
        weatherStateRef.current = WeatherState.LIGHTNING;
        return "DISCHARGE_DETECTED";
    }

    // 2. Rotate (Two fists)
    if (hand2 && isFist(hand1) && isFist(hand2)) {
        state = WeatherState.ROTATE;
        const cx = (hand1[0].x + hand2[0].x) / 2;
        rotationRef.current = (cx - 0.5) * 2; 
        debug = `ROTATION_VECTOR: ${rotationRef.current.toFixed(2)}`;
    }
    // 3. Dual Hand Operations (Freeze vs Reverse)
    else if (hand2 && isHandOpen(hand1) && isHandOpen(hand2)) {
        // Calculate horizontal distance between wrists (normalized 0-1)
        const dist = Math.abs(hand1[0].x - hand2[0].x);
        
        if (dist > 0.5) {
            // Wide spread = Reverse
            state = WeatherState.REVERSE;
            debug = "ENTROPY_REVERSAL_ACTIVE";
        } else {
            // Close/Normal = Freeze
            state = WeatherState.FREEZE;
            debug = "TIME_SUSPENSION_ACTIVE";
        }
    }
    else if (!hand2 && isHandOpen(hand1)) {
        state = WeatherState.NORMAL;
        debug = "SINGLE_HAND_DETECTED";
    }

    if (weatherStateRef.current === WeatherState.LIGHTNING) {
        if (shakeIntensity.current <= 0) weatherStateRef.current = state;
    } else {
        weatherStateRef.current = state;
    }

    return debug || "MONITORING_INPUT";
  };

  const triggerLightning = () => {
      shakeIntensity.current = 20;
      audioRef.current.playThunder();
  };

  // --- Visuals: Draw Hands ---
  const drawHands = (ctx: CanvasRenderingContext2D, results: any) => {
    if (!results.landmarks) return;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.save();
    // Chiral Gold aesthetic
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#e8b043'; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const landmarks of results.landmarks) {
        // 1. Draw Connections (Wireframe)
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(232, 176, 67, 0.6)'; // Gold line

        HAND_CONNECTIONS.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            // Mirror x coordinate because webcam usually feels mirrored to user
            ctx.moveTo((1 - p1.x) * width, p1.y * height);
            ctx.lineTo((1 - p2.x) * width, p2.y * height);
        });
        ctx.stroke();

        // 2. Draw Joints (Nodes)
        ctx.fillStyle = '#ffffff';
        for (const p of landmarks) {
            const cx = (1 - p.x) * width;
            const cy = p.y * height;

            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Outer glow ring
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(232, 176, 67, 0.8)';
            ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }
    ctx.restore();
  };

  // Rendering Loop
  const animate = (time: number) => {
    requestRef.current = requestAnimationFrame(animate);
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Time delta
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    // FPS Calc
    const fps = Math.round(1000 / (delta || 1));

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Vision Update
    let debugText = "INITIALIZING_SENSORS...";
    let visionResults = null;

    if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4 && landmarkerRef.current) {
        const video = webcamRef.current.video;
        // Get results once per frame
        visionResults = landmarkerRef.current.detectForVideo(video, Date.now());
        debugText = detectGestures(visionResults);
    }

    onStatsUpdate(fps, weatherStateRef.current, debugText);
    audioRef.current.init(); // Ensure audio starts on interaction

    // Audio State Update
    const isReverse = weatherStateRef.current === WeatherState.REVERSE;
    const isFreeze = weatherStateRef.current === WeatherState.FREEZE;
    audioRef.current.setRainIntensity(isFreeze ? 0 : 1, isReverse);
    if (isReverse && Math.random() < 0.05) audioRef.current.playReverseEffect();

    
    // Screen Shake
    let shakeX = 0;
    let shakeY = 0;
    if (shakeIntensity.current > 0) {
        shakeX = (Math.random() - 0.5) * shakeIntensity.current;
        shakeY = (Math.random() - 0.5) * shakeIntensity.current;
        shakeIntensity.current *= 0.9; // Decay
        if (shakeIntensity.current < 0.5) shakeIntensity.current = 0;
    }
    
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Global Rotation effect
    const centerX = canvas.width / 2;
    
    // Update & Draw Particles
    ctx.globalCompositeOperation = 'screen'; // Make rain glow
    
    particles.current.forEach(p => {
        let drawX = p.x;
        let drawY = p.y;
        
        // 1. Rotation Transform
        if (weatherStateRef.current === WeatherState.ROTATE || rotationRef.current !== 0) {
             drawX += (p.z / MAX_DEPTH) * rotationRef.current * 500;
             if (weatherStateRef.current !== WeatherState.ROTATE) {
                 rotationRef.current *= 0.95;
             }
        }

        // 2. Physics Update
        if (!isFreeze) {
            let moveSpeed = p.speed;
            if (isReverse) moveSpeed = -p.speed * 2;
            
            p.y += moveSpeed;

            // Boundary Check
            if (p.y > canvas.height + 20) {
                if (!isReverse) resetParticle(p);
            } else if (p.y < -20) {
                if (isReverse) {
                    p.y = canvas.height + 20;
                    p.x = Math.random() * canvas.width;
                }
            }
        }

        // 3. Drawing
        ctx.beginPath();
        const alpha = p.opacity;
        
        if (isFreeze) {
            // Suspended water droplets
            ctx.fillStyle = `rgba(200, 230, 255, ${alpha * 0.5})`;
            ctx.arc(drawX, drawY, p.width * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(drawX - p.width*0.5, drawY - p.width*0.5, p.width * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Rain streaks
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = p.width;
            ctx.moveTo(drawX, drawY);
            const len = isReverse ? -p.len : p.len;
            ctx.lineTo(drawX, drawY + len);
            ctx.stroke();
        }
    });

    // Draw Hands ON TOP of rain (Holographic Overlay)
    if (visionResults) {
        drawHands(ctx, visionResults);
    }
    
    // Lightning Flash
    if (weatherStateRef.current === WeatherState.LIGHTNING && shakeIntensity.current > 5) {
        ctx.fillStyle = `rgba(255, 255, 255, ${shakeIntensity.current / 40})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw Bolt
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#0ff';
        ctx.beginPath();
        let lx = Math.random() * canvas.width;
        let ly = 0;
        ctx.moveTo(lx, ly);
        while(ly < canvas.height) {
            lx += (Math.random() - 0.5) * 50;
            ly += Math.random() * 50 + 20;
            ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    ctx.restore();
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ 
            backgroundImage: `url(${locationImg})`,
            filter: 'grayscale(100%) contrast(120%) brightness(50%)' 
        }}
      />
      {/* Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-10 mix-blend-screen"
      />
      {/* Webcam Hidden */}
      <Webcam
        ref={webcamRef}
        className="absolute opacity-0 pointer-events-none"
        width={640}
        height={480}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "user" }}
      />
    </>
  );
};

export default Scene;