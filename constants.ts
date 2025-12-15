import { Location } from './types';

export const PARTICLE_COUNT = 1600;
export const MAX_DEPTH = 1000;
export const GRAVITY = 15;
export const TERMINAL_VELOCITY = 25;

export const LOCATIONS: Record<Location, string> = {
  [Location.LONDON]: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920&auto=format&fit=crop', // Urban City Road
  [Location.TOKYO]: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1920&auto=format&fit=crop',  // Neon Skyline
  [Location.NYC]: 'https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=1920&auto=format&fit=crop',     // NY Skyscrapers
  [Location.FOREST]: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=1920&auto=format&fit=crop',  // Dense Metropolis
};

export const COLOR_PALETTE = {
  primary: '#FFFFFF',
  secondary: '#888888',
  alert: '#FF3300',
  accent: '#00DDEE',
  bg: '#050505'
};