import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppMode, TallyConnection, SyncState } from '@/types/tally';
import { testConnection, setTallyConfig } from '@/services/tallyXmlService';

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  connection: TallyConnection;
  setConnection: React.Dispatch<React.SetStateAction<TallyConnection>>;
  connectToTally: (host: string, port: number) => Promise<boolean>;
  selectedCompany: string | null;
  setSelectedCompany: (company: string | null) => void;
  syncState: SyncState;
  setSyncState: React.Dispatch<React.SetStateAction<SyncState>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    return (localStorage.getItem('tallyAppMode') as AppMode) || 'easy';
  });
  const [connection, setConnection] = useState<TallyConnection>({
    host: 'localhost',
    port: 9000,
    isConnected: false,
    lastSync: null,
    companyName: null,
  });
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSync: null,
    pendingChanges: 0,
    errors: [],
  });

  const setMode = useCallback((newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('tallyAppMode', newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'easy' ? 'tally' : 'easy');
  }, [mode, setMode]);

  const connectToTally = useCallback(async (host: string, port: number): Promise<boolean> => {
    setTallyConfig(host, port);
    const connected = await testConnection();
    setConnection(prev => ({
      ...prev,
      host,
      port,
      isConnected: connected,
    }));
    return connected;
  }, []);

  // Global keyboard shortcut: Ctrl+M to toggle mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        toggleMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMode]);

  return (
    <AppContext.Provider value={{
      mode, setMode, toggleMode,
      connection, setConnection, connectToTally,
      selectedCompany, setSelectedCompany,
      syncState, setSyncState,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
