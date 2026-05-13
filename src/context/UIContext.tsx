'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type ViewMode = 'grid' | 'list';

interface UIContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>('grid');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('viewMode') as ViewMode;
    if (saved && (saved === 'grid' || saved === 'list')) {
      setViewModeState(saved);
    }
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('viewMode', mode);
  };

  const toggleViewMode = () => {
    const next = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(next);
  };

  return (
    <UIContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
