
import { useState, useCallback } from "react";
import type { FigmaApiResponse, GeneratedComponent } from "@/types/figma";

export interface AppState {
  figmaData: FigmaApiResponse | null;
  fileKey: string;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  generatedComponents: GeneratedComponent[];
  debugInfo: {
    lastAction: string;
    timestamp: Date;
    apiCalls: number;
    errors: string[];
  };
}

export function useFigmaGeneratorState(initialFileKey = "") {
  const [state, setState] = useState<AppState>({
    figmaData: null,
    fileKey: initialFileKey,
    isLoading: false,
    error: null,
    success: null,
    generatedComponents: [],
    debugInfo: {
      lastAction: "initialized",
      timestamp: new Date(),
      apiCalls: 0,
      errors: [],
    },
  });

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    updateState({
      isLoading: loading,
      debugInfo: {
        ...state.debugInfo,
        lastAction: loading ? "loading" : "complete",
        timestamp: new Date(),
      }
    });
  }, [state.debugInfo, updateState]);

  const setError = useCallback((error: string | null) => {
    updateState({
      error,
      isLoading: false,
      debugInfo: {
        ...state.debugInfo,
        lastAction: error ? "error" : "cleared error",
        timestamp: new Date(),
        errors: error ? [...state.debugInfo.errors, error].slice(-10) : state.debugInfo.errors,
      }
    });
  }, [state.debugInfo, updateState]);

  const setSuccess = useCallback((success: string | null) => {
    updateState({
      success,
      error: null,
      debugInfo: {
        ...state.debugInfo,
        lastAction: "success",
        timestamp: new Date(),
      }
    });
  }, [state.debugInfo, updateState]);

  const setFigmaData = useCallback((figmaData: FigmaApiResponse | null) => {
    updateState({
      figmaData,
      debugInfo: {
        ...state.debugInfo,
        lastAction: "figma data loaded",
        timestamp: new Date(),
      }
    });
  }, [state.debugInfo, updateState]);

  const setFileKey = useCallback((fileKey: string) => {
    updateState({ fileKey, error: null });
  }, [updateState]);

  const incrementApiCalls = useCallback(() => {
    updateState({
      debugInfo: {
        ...state.debugInfo,
        apiCalls: state.debugInfo.apiCalls + 1,
      }
    });
  }, [state.debugInfo, updateState]);

  return {
    state,
    setLoading,
    setError,
    setSuccess,
    setFigmaData,
    setFileKey,
    incrementApiCalls,
    updateState,
  };
}
