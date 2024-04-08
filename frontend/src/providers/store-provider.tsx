'use client';

import { Store, createBoundStore } from '@/stores/store';
import { ReactNode, createContext, useContext, useRef } from 'react';
import { StoreApi, useStore } from 'zustand';

export const StoreContext = createContext<StoreApi<Store> | null>(null);

export type StoreProviderProps = { children: ReactNode };

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeRef = useRef<StoreApi<Store>>();

  if (!storeRef.current) {
    storeRef.current = createBoundStore();
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

export const useBoundStore = <T,>(selector: (store: Store) => T): T => {
  const storeContext = useContext(StoreContext);

  if (!storeContext) {
    throw new Error('useBoundStore must be used within a StoreProvider');
  }

  return useStore(storeContext, selector);
};
