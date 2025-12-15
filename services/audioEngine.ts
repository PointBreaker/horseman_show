export class AudioEngine {
  private ctx: AudioContext | null = null;
  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private isInitialized = false;

  constructor() {
    // Lazy init
  }

  public async init() {
    if (this.isInitialized) return;
    
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    await this.ctx.resume();
    
    // Setup Rain Noise (Pink Noise approximation)
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // compensate for gain
      b6 = white * 0.115926;
    }

    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = 'lowpass';
    this.rainFilter.frequency.value = 800; // Muffled rain

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0;

    noiseSrc.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);
    
    noiseSrc.start(0);
    this.isInitialized = true;
  }

  public setRainIntensity(intensity: number, isReversing: boolean) {
    if (!this.ctx || !this.rainGain || !this.rainFilter) return;
    
    const now = this.ctx.currentTime;
    
    // Normal: 0.2, Heavy: 0.8
    const targetGain = isReversing ? 0.3 : Math.max(0.1, intensity * 0.5); 
    const targetFreq = isReversing ? 2000 : 400 + (intensity * 600);

    this.rainGain.gain.setTargetAtTime(targetGain, now, 0.5);
    this.rainFilter.frequency.setTargetAtTime(targetFreq, now, 0.5);
  }

  public playThunder() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // 1. Deep Rumble (Sub)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    const filter1 = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(60, t);
    osc1.frequency.exponentialRampToValueAtTime(20, t + 1);

    filter1.type = 'lowpass';
    filter1.frequency.setValueAtTime(150, t);

    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.8, t + 0.1); // Attack
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 3.5); // Long Decay

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 4);

    // 2. Crackle (Noise burst)
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow((bufferSize - i) / bufferSize, 4);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 500;
    const noiseGain = this.ctx.createGain();
    
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  public playReverseEffect() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    // FM Synthesis for Sci-fi warp sound
    lfo.frequency.value = 15;
    lfo.type = 'sawtooth';
    lfoGain.gain.value = 500;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.linearRampToValueAtTime(800, t + 1.5);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.5);
    gain.gain.linearRampToValueAtTime(0, t + 1.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(t);
    osc.start(t);
    osc.stop(t + 1.5);
    lfo.stop(t + 1.5);
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}
