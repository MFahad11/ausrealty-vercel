// stores/propertyStore.ts
import { create } from 'zustand'

interface PropertyState {
  propertyData: any | null;
  setPropertyData: (data: any) => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  propertyData: null,
  setPropertyData: (data) => set({ propertyData: data }),
}));
