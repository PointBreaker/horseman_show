export interface Translations {
  // ChiralHUD Component
  chiralWeatherControl: string;
  bridgesId: string;
  systemStatusNormal: string;
  systemMetrics: string;
  fpsRate: string;
  particleDensity: string;
  chiralLevel: string;
  operationMode: string;
  awaitingInput: string;
  dataGuide: string;

  // Weather Modes
  temporalFall: string;
  timeSuspension: string;
  entropyReversal: string;
  spatialShift: string;
  highVoltage: string;

  // GuideModal Component
  operationalManual: string;
  close: string;
  clickToInitialize: string;

  // Gesture Descriptions
  gesture: string;
  effect: string;

  // Mode Descriptions
  freezeDesc: string;
  freezeEffect: string;
  rewindDesc: string;
  rewindEffect: string;
  rotateDesc: string;
  rotateEffect: string;
  lightningDesc: string;
  lightningEffect: string;
  normalDesc: string;
}

export const translations: Record<'en' | 'zh', Translations> = {
  en: {
    chiralWeatherControl: 'CHIRAL WEATHER CONTROL',
    bridgesId: 'BRIDGES ID: 884-XJ-11',
    systemStatusNormal: 'SYS.STATUS_NORMAL',
    systemMetrics: 'SYSTEM_METRICS',
    fpsRate: 'FPS_RATE',
    particleDensity: 'PARTICLE_DENSITY',
    chiralLevel: 'CHIRAL_LEVEL',
    operationMode: 'OPERATION_MODE',
    awaitingInput: 'AWAITING_INPUT...',
    dataGuide: 'DATA_GUIDE',
    temporalFall: 'TEMPORAL_FALL',
    timeSuspension: 'TIME_SUSPENSION',
    entropyReversal: 'ENTROPY_REVERSAL',
    spatialShift: 'SPATIAL_SHIFT',
    highVoltage: 'HIGH_VOLTAGE',
    operationalManual: 'OPERATIONAL_MANUAL',
    close: 'CLOSE',
    clickToInitialize: 'CLICK ANYWHERE TO INITIALIZE SYSTEM',
    gesture: 'GESTURE',
    effect: 'Effect',
    freezeDesc: 'Raise both open palms facing camera (Normal Width).',
    freezeEffect: 'Raindrops halt in mid-air. Hydro-static visualization active.',
    rewindDesc: 'SPREAD both arms wide outwards to the sides (Open Palms).',
    rewindEffect: 'Temporal inversion. Rain falls upwards. Audio warping.',
    rotateDesc: 'Both hands closed (FISTS).',
    rotateEffect: 'Rotate camera perspective based on hand position relative to center.',
    lightningDesc: '"Pinch" gesture (Thumb + Middle Finger touching) on either hand, then release.',
    lightningEffect: 'Atmospheric discharge. Screen shake. Thunder generation.',
    normalDesc: 'Hands down or relaxed.'
  },
  zh: {
    chiralWeatherControl: '手性天气控制系统',
    bridgesId: '布里奇斯ID: 884-XJ-11',
    systemStatusNormal: '系统状态正常',
    systemMetrics: '系统指标',
    fpsRate: '帧率',
    particleDensity: '粒子密度',
    chiralLevel: '手性等级',
    operationMode: '操作模式',
    awaitingInput: '等待输入...',
    dataGuide: '数据指南',
    temporalFall: '时间坠落',
    timeSuspension: '时间静止',
    entropyReversal: '熵逆转',
    spatialShift: '空间偏移',
    highVoltage: '高压放电',
    operationalManual: '操作手册',
    close: '关闭',
    clickToInitialize: '点击任意位置初始化系统',
    gesture: '手势',
    effect: '效果',
    freezeDesc: '双手张开，掌心正对摄像头（正常宽度）。',
    freezeEffect: '雨滴悬停在空中。流体静压可视化激活。',
    rewindDesc: '双臂向两侧张开（掌心朝外）。',
    rewindEffect: '时间倒流。雨滴向上飘落。音频扭曲。',
    rotateDesc: '双手握拳。',
    rotateEffect: '根据手部相对于中心的位置旋转相机视角。',
    lightningDesc: '单手做"捏"手势（拇指和中指相触），然后松开。',
    lightningEffect: '大气放电。屏幕震动。生成雷声。',
    normalDesc: '双手放下或放松状态。'
  }
};