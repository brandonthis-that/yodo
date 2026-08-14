import { createContext, useContext, type ReactNode } from 'react';
import { useYodo } from '@/src/hooks/useYodo';
import { useAuth } from '@/src/context/AuthContext';

type YodoContextValue = ReturnType<typeof useYodo>;

const YodoContext = createContext<YodoContextValue | null>(null);

export function YodoProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const value = useYodo(session?.user.id);
  return <YodoContext.Provider value={value}>{children}</YodoContext.Provider>;
}

export function useYodoContext(): YodoContextValue {
  const ctx = useContext(YodoContext);
  if (!ctx) throw new Error('useYodoContext must be used inside YodoProvider');
  return ctx;
}
