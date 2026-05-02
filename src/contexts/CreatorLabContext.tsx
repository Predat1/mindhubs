import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ─── 3 Principaux Changements ───
// 1. Centralisation totale du state du Creator Lab (Idée, Marchés, Score, Pipeline).
// 2. Gestion unifiée des crédits avec vérification de solde avant action.
// 3. Persistance automatique de la session dans le localStorage pour éviter toute perte.

export type PipelineStepId = 'spy' | 'sandbox' | 'architect' | 'marketing' | 'publish';
export type StepStatus = 'locked' | 'active' | 'done';

export interface Chapter {
  id: number;
  title: string;
  content: string;
}

interface CreatorLabState {
  currentIdea: string;
  selectedMarkets: string[];
  validationScore: number | null;
  productTitle: string;
  productType: string;
  chapters: Chapter[];
  pipelineStatus: Record<PipelineStepId, StepStatus>;
  credits: number;
}

interface CreatorLabContextType extends CreatorLabState {
  setCurrentIdea: (idea: string) => void;
  setSelectedMarkets: (markets: string[]) => void;
  setValidationScore: (score: number | null) => void;
  setProductInfo: (title: string, type: string) => void;
  setChapters: (chapters: Chapter[]) => void;
  updatePipelineStatus: (step: PipelineStepId, status: StepStatus) => void;
  useCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;
  resetSession: () => void;
}

const DEFAULT_STATUS: Record<PipelineStepId, StepStatus> = {
  spy: 'active',
  sandbox: 'locked',
  architect: 'locked',
  marketing: 'locked',
  publish: 'locked',
};

const CreatorLabContext = createContext<CreatorLabContextType | undefined>(undefined);

export const CreatorLabProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<CreatorLabState>(() => {
    // WHY: Restauration de session au mount pour une UX sans friction
    const saved = localStorage.getItem('cl_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
    return {
      currentIdea: "",
      selectedMarkets: [],
      validationScore: null,
      productTitle: "",
      productType: "",
      chapters: [],
      pipelineStatus: DEFAULT_STATUS,
      credits: 500, // Solde initial simulé ou récupéré via auth
    };
  });

  // WHY: Persistance automatique à chaque mutation
  useEffect(() => {
    localStorage.setItem('cl_session', JSON.stringify(state));
  }, [state]);

  const setCurrentIdea = (currentIdea: string) => setState(s => ({ ...s, currentIdea }));
  const setSelectedMarkets = (selectedMarkets: string[]) => setState(s => ({ ...s, selectedMarkets }));
  const setValidationScore = (validationScore: number | null) => setState(s => ({ ...s, validationScore }));
  const setProductInfo = (productTitle: string, productType: string) => setState(s => ({ ...s, productTitle, productType }));
  const setChapters = (chapters: Chapter[]) => setState(s => ({ ...s, chapters }));
  
  const updatePipelineStatus = (step: PipelineStepId, status: StepStatus) => 
    setState(s => ({ ...s, pipelineStatus: { ...s.pipelineStatus, [step]: status } }));

  const useCredits = (amount: number): boolean => {
    if (state.credits < amount) return false;
    setState(s => ({ ...s, credits: s.credits - amount }));
    return true;
  };

  const addCredits = (amount: number) => setState(s => ({ ...s, credits: s.credits + amount }));

  const resetSession = () => {
    localStorage.removeItem('cl_session');
    setState({
      currentIdea: "",
      selectedMarkets: [],
      validationScore: null,
      productTitle: "",
      productType: "",
      chapters: [],
      pipelineStatus: DEFAULT_STATUS,
      credits: state.credits,
    });
  };

  return (
    <CreatorLabContext.Provider value={{ 
      ...state, 
      setCurrentIdea, 
      setSelectedMarkets, 
      setValidationScore, 
      setProductInfo, 
      setChapters, 
      updatePipelineStatus, 
      useCredits, 
      addCredits,
      resetSession
    }}>
      {children}
    </CreatorLabContext.Provider>
  );
};

export const useCreatorLab = () => {
  const context = useContext(CreatorLabContext);
  if (!context) throw new Error("useCreatorLab must be used within a CreatorLabProvider");
  return context;
};
