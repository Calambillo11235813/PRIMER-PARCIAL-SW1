// hooks/useDiagramHistory.js
import { useState, useCallback } from 'react';


export const useDiagramHistory = () => {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const saveState = useCallback((nodes, edges) => {
    if (nodes && edges) {
      setPast(prev => [...prev, { 
        nodes: JSON.parse(JSON.stringify(nodes)), 
        edges: JSON.parse(JSON.stringify(edges)) 
      }]);
      setFuture([]);
    }
  }, []);

  const undo = useCallback((currentNodes, currentEdges) => {
    if (past.length === 0) return null;
    const previousState = past[past.length - 1];
    setFuture(prev => [{ 
      nodes: JSON.parse(JSON.stringify(currentNodes)), 
      edges: JSON.parse(JSON.stringify(currentEdges)) 
    }, ...prev]);
    setPast(prev => prev.slice(0, -1));
    return previousState;
  }, [past]);

  const redo = useCallback(() => {
    if (future.length === 0) return null;
    const nextState = future[0];
    setPast(prev => [...prev, nextState]);
    setFuture(prev => prev.slice(1));
    return nextState;
  }, [future]);

  return {
    past,
    future,
    saveState,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0
  };
};