// stores/propertyStore.ts
import { create } from 'zustand'

interface isMessageState {
  isMessage: boolean;
  setIsMessage: (isMessage: boolean) => void;
}

export const useIsMessageStore = create<isMessageState>((set) => ({
  isMessage: false,
  setIsMessage: (isMessage) => set({ isMessage }),
}));