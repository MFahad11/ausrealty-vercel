import { create } from 'zustand';

interface AgentState {
  agents: any[]; // Store multiple agents in an array
  setAgents: (data: any[]) => void; // Replace all agents
  addAgent: (agent: any) => void; // Add a single agent
  removeAgent: (id: string) => void; // Remove an agent by ID
  clearAgents: () => void; // Clear all agents
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: [],

  setAgents: (data) => set({ agents: data }),

  addAgent: (agent) =>
    set((state) => ({ agents: [...state.agents, agent] })),

  removeAgent: (id) =>
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
    })),

  clearAgents: () => set({ agents: [] }),
}));
