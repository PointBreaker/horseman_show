export enum WeatherState {
  NORMAL = 'TEMPORAL_FALL',
  FREEZE = 'TIME_SUSPENSION',
  REVERSE = 'ENTROPY_REVERSAL',
  ROTATE = 'SPATIAL_SHIFT',
  LIGHTNING = 'HIGH_VOLTAGE'
}

export enum Location {
  LONDON = 'SECTOR_LDN',
  TOKYO = 'SECTOR_TKY',
  NYC = 'SECTOR_NYC',
  FOREST = 'SECTOR_WLD'
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  len: number;
  speed: number;
  opacity: number;
  width: number;
  history: {x: number, y: number}[];
}

export interface HandData {
  left: any | null; // Using any for MediaPipe Landmark results to avoid complex type mapping in demo
  right: any | null;
}
