'use client';

import { Store } from '@/stores/store';
import { ReactNode, createContext, useRef } from 'react';
import { StoreApi } from 'zustand';

export const StoreContext = createContext<StoreApi<Store> | null>(null);

export type StoreProviderProps = { children: ReactNode };

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeRef = useRef<StoreApi<Store>>();
  if (!storeRef.current) {
    storeRef.current = useBoundStore;
  }
};
