// stores/propertyStore.ts
import { create } from 'zustand';

interface PropertyState {
  propertyData: any[]; // Now it's an array
  setPropertyData: (data: any[]) => void; // Accepts an array
  addProperty: (property: any) => void; // Adds a property
  removeProperty: (id: string) => void; // Removes a property by ID
  clearProperties: () => void; // Clears all properties
}

export const usePropertyStore = create<PropertyState>((set) => ({
  propertyData: [],
  
  setPropertyData: (data) => set({ propertyData: data }),

  addProperty: (property) =>
    set((state) => ({ propertyData: [...state.propertyData, property] })),

  removeProperty: (id) =>
    set((state) => ({
      propertyData: state.propertyData.filter((prop) => prop.id !== id),
    })),

  clearProperties: () => set({ propertyData: [] }),
}));

