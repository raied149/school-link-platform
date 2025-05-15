
import React, { createContext, useContext, useState } from 'react';

type GradientType = 'default' | 'dashboard' | 'tasks' | 'users' | 'calendar' | 'subjects' | 'classes';

type GradientContextType = {
  currentGradient: GradientType;
  setGradient: (gradient: GradientType) => void;
};

const GradientContext = createContext<GradientContextType>({
  currentGradient: 'default',
  setGradient: () => {},
});

export const useGradient = () => useContext(GradientContext);

export const GradientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentGradient, setCurrentGradient] = useState<GradientType>('default');

  const setGradient = (gradient: GradientType) => {
    setCurrentGradient(gradient);
  };

  return (
    <GradientContext.Provider value={{ currentGradient, setGradient }}>
      {children}
    </GradientContext.Provider>
  );
};
