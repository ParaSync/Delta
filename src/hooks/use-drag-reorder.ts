import { useState, useCallback, createContext, useContext, useSyncExternalStore } from 'react';

export type DragState = {
  isDragging: boolean;
  draggedId: string | null;
  draggedIndex: number | null;
  insertionIndex: number | null;
};

type DragReorderContextValue = {
  dragState: DragState;
  startDrag: (id: string, index: number) => void;
  updateInsertionIndex: (index: number | null) => void;
  endDrag: () => void;
  commitReorder: () => { fromIndex: number; toIndex: number } | null;
  subscribe: (listener: () => void) => () => void;
};

const initialDragState: DragState = {
  isDragging: false,
  draggedId: null,
  draggedIndex: null,
  insertionIndex: null,
};

const DragReorderContext = createContext<DragReorderContextValue | null>(null);

// Global store for drag state to ensure all components see updates
let globalDragState: DragState = { ...initialDragState };
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function useDragReorderProvider() {
  const subscribe = useCallback((listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  const getSnapshot = useCallback(() => globalDragState, []);

  const dragState = useSyncExternalStore(subscribe, getSnapshot);

  const startDrag = useCallback((id: string, index: number) => {
    globalDragState = {
      isDragging: true,
      draggedId: id,
      draggedIndex: index,
      insertionIndex: null,
    };
    notifyListeners();
  }, []);

  const updateInsertionIndex = useCallback((index: number | null) => {
    if (globalDragState.insertionIndex !== index) {
      globalDragState = {
        ...globalDragState,
        insertionIndex: index,
      };
      notifyListeners();
    }
  }, []);

  const endDrag = useCallback(() => {
    globalDragState = { ...initialDragState };
    notifyListeners();
  }, []);

  const commitReorder = useCallback((): { fromIndex: number; toIndex: number } | null => {
    const { draggedIndex, insertionIndex } = globalDragState;

    if (draggedIndex === null || insertionIndex === null) {
      return null;
    }

    // Calculate the actual target index
    let toIndex = insertionIndex;
    if (insertionIndex > draggedIndex) {
      toIndex = insertionIndex - 1;
    }

    // Don't move if dropping in same position
    if (draggedIndex === toIndex) {
      return null;
    }

    return { fromIndex: draggedIndex, toIndex };
  }, []);

  return {
    dragState,
    startDrag,
    updateInsertionIndex,
    endDrag,
    commitReorder,
    subscribe,
  };
}

export function useDragReorder() {
  const context = useContext(DragReorderContext);
  if (!context) {
    throw new Error('useDragReorder must be used within a DragReorderProvider');
  }

  // Subscribe to global state changes
  const dragState = useSyncExternalStore(context.subscribe, () => globalDragState);

  return {
    ...context,
    dragState,
  };
}

export { DragReorderContext };
