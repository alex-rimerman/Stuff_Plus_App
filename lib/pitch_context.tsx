import { createContext, ReactNode, useContext, useState } from 'react';
import { PitchInput } from './shared';

// Extended Pitch type
export type Pitch = PitchInput & {
  id: string;
  name: string;
  handedness: string;
  stuffPlus: number;
  percentile: number;
};

// Context type definition
type PitchContextType = {
  pitches: Pitch[];
  addPitch: (pitch: Pitch) => void;
  removePitch: (id: string) => void;
  updatePitch: (id: string, updatedPitch: Pitch) => void;
  clearPitches: () => void;
};

// Create context
const PitchContext = createContext<PitchContextType | undefined>(undefined);

// Provider component
export const PitchProvider = ({ children }: { children: ReactNode }) => {
  const [pitches, setPitches] = useState<Pitch[]>([]);

  const addPitch = (pitch: Pitch) => {
    setPitches(prev => [...prev, pitch]);
  };

  const removePitch = (id: string) => {
    setPitches(prev => prev.filter(p => p.id !== id));
  };

  const updatePitch = (id: string, updatedPitch: Pitch) => {
    setPitches(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedPitch } : p))
    );
  };

  const clearPitches = () => {
    setPitches([]);
  };

  return (
    <PitchContext.Provider value={{ pitches, addPitch, removePitch, updatePitch, clearPitches }}>
      {children}
    </PitchContext.Provider>
  );
};

// Hook for consuming context
export const usePitch = () => {
  const context = useContext(PitchContext);
  if (!context) {
    throw new Error('usePitch must be used within a PitchProvider');
  }
  return context;
};
