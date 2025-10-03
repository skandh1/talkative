// hooks/useOptimisticStateManager.ts
import { useState, useCallback } from 'react';

interface OptimisticState {
  [userId: string]: {
    [key: string]: any;
  };
}

export const useOptimisticStateManager = () => {
  const [optimisticStates, setOptimisticStates] = useState<OptimisticState>({});

  const updateOptimisticState = useCallback((userId: string, updates: Record<string, any>) => {
    setOptimisticStates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], ...updates }
    }));
  }, []);

  const clearOptimisticState = useCallback((userId: string) => {
    setOptimisticStates(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
  }, []);

  const getOptimisticState = useCallback((userId: string) => {
    return optimisticStates[userId] || {};
  }, [optimisticStates]);

  const hasOptimisticUpdates = useCallback((userId: string) => {
    return !!optimisticStates[userId] && Object.keys(optimisticStates[userId]).length > 0;
  }, [optimisticStates]);

  return {
    optimisticStates,
    updateOptimisticState,
    clearOptimisticState,
    getOptimisticState,
    hasOptimisticUpdates,
  };
};