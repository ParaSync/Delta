// Form Builder Page for Neuron Delta

import React, { useReducer, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ArrowLeft, Eye, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ComponentPalette } from '@/components/form-builder/component-palette';
import { FormCanvas } from '@/components/form-builder/form-canvas';
import { PropertiesPanel } from '@/components/form-builder/properties-panel';
import { FormRenderer } from '@/components/form-builder/form-renderer';
import { FormSchema, BuilderAction, FormBuilderState, Node } from '@/types/form-builder';
import { createNode, generateId, findNodeById, removeNodeById, updateNodeById, duplicateNode } from '@/utils/form-builder';

const initialSchema: FormSchema = {
  title: 'Untitled Form',
  pages: [
    {
      id: generateId(),
      elements: [],
    },
  ],
};

const initialState: FormBuilderState = {
  schema: initialSchema,
  selectedNodeId: undefined,
  isPreview: false,
  history: [initialSchema],
  historyIndex: 0,
};

const formBuilderReducer = (state: FormBuilderState, action: BuilderAction): FormBuilderState => {
  switch (action.type) {
    case 'SET_TITLE':
      return {
        ...state,
        schema: {
          ...state.schema,
          title: action.title,
        },
      };

    case 'ADD_NODE': {
      const newElements = [...state.schema.pages[0].elements];
      if (action.index !== undefined) {
        newElements.splice(action.index, 0, action.node);
      } else {
        newElements.push(action.node);
      }
      
      return {
        ...state,
        schema: {
          ...state.schema,
          pages: [
            {
              ...state.schema.pages[0],
              elements: newElements,
            },
          ],
        },
        selectedNodeId: action.node.id,
      };
    }

    case 'UPDATE_NODE': {
      const updatedElements = updateNodeById(state.schema.pages[0].elements, action.nodeId, action.props);
      return {
        ...state,
        schema: {
          ...state.schema,
          pages: [
            {
              ...state.schema.pages[0],
              elements: updatedElements,
            },
          ],
        },
      };
    }

    case 'DELETE_NODE': {
      const updatedElements = removeNodeById(state.schema.pages[0].elements, action.nodeId);
      return {
        ...state,
        schema: {
          ...state.schema,
          pages: [
            {
              ...state.schema.pages[0],
              elements: updatedElements,
            },
          ],
        },
        selectedNodeId: state.selectedNodeId === action.nodeId ? undefined : state.selectedNodeId,
      };
    }

    case 'MOVE_NODE': {
      const elements = [...state.schema.pages[0].elements];
      const dragIndex = elements.findIndex(item => item.id === action.nodeId);
      const hoverIndex = action.index;

      if (dragIndex !== -1) {
        const reorderedElements = arrayMove(elements, dragIndex, hoverIndex);
        return {
          ...state,
          schema: {
            ...state.schema,
            pages: [
              {
                ...state.schema.pages[0],
                elements: reorderedElements,
              },
            ],
          },
        };
      }
      return state;
    }

    case 'DUPLICATE_NODE': {
      const nodeToClone = findNodeById(state.schema.pages[0].elements, action.nodeId);
      if (nodeToClone) {
        const duplicatedNode = duplicateNode(nodeToClone);
        const elements = [...state.schema.pages[0].elements];
        const originalIndex = elements.findIndex(item => item.id === action.nodeId);
        elements.splice(originalIndex + 1, 0, duplicatedNode);
        
        return {
          ...state,
          schema: {
            ...state.schema,
            pages: [
              {
                ...state.schema.pages[0],
                elements,
              },
            ],
          },
          selectedNodeId: duplicatedNode.id,
        };
      }
      return state;
    }

    case 'SELECT_NODE':
      return {
        ...state,
        selectedNodeId: action.nodeId,
      };

    case 'TOGGLE_PREVIEW':
      return {
        ...state,
        isPreview: !state.isPreview,
        selectedNodeId: undefined,
      };

    case 'SAVE_TO_HISTORY': {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(state.schema);
      return {
        ...state,
        history: newHistory.slice(-20), // Keep last 20 states
        historyIndex: Math.min(newHistory.length - 1, 19),
      };
    }

    case 'UNDO': {
      if (state.historyIndex > 0) {
        return {
          ...state,
          schema: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
          selectedNodeId: undefined,
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          schema: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
          selectedNodeId: undefined,
        };
      }
      return state;
    }

    default:
      return state;
  }
};

export const FormBuilder: React.FC = () => {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Auto-save to history with debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch({ type: 'SAVE_TO_HISTORY' });
      toast({
        title: "Auto-saved",
        description: "Your changes have been saved.",
      });
    }, 800);

    return () => clearTimeout(timeout);
  }, [state.schema, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              dispatch({ type: 'REDO' });
            } else {
              e.preventDefault();
              dispatch({ type: 'UNDO' });
            }
            break;
        }
      } else if (e.key === 'Delete' && state.selectedNodeId) {
        dispatch({ type: 'DELETE_NODE', nodeId: state.selectedNodeId });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedNodeId]);

  const handleDragStart = (event: DragStartEvent) => {
    // Optional: handle drag start
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: handle drag over
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Handle dropping component from palette
    if (active.id.toString().startsWith('palette-') && over.id === 'canvas') {
      const componentType = active.data.current?.componentType;
      const defaultProps = active.data.current?.defaultProps;
      
      if (componentType) {
        const newNode = createNode(componentType, defaultProps);
        dispatch({ type: 'ADD_NODE', node: newNode });
      }
      return;
    }

    // Handle reordering elements
    if (active.id !== over.id && over.id === 'canvas') {
      const activeIndex = state.schema.pages[0].elements.findIndex(item => item.id === active.id);
      const overIndex = state.schema.pages[0].elements.findIndex(item => item.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        dispatch({ type: 'MOVE_NODE', nodeId: active.id as string, index: overIndex });
      }
    }
  };

  const handleUpdateNode = useCallback((nodeId: string, props: Record<string, any>) => {
    dispatch({ type: 'UPDATE_NODE', nodeId, props });
  }, []);

  const handleSelectNode = useCallback((nodeId?: string) => {
    dispatch({ type: 'SELECT_NODE', nodeId });
  }, []);

  const handleSave = () => {
    // Mock save functionality
    toast({
      title: "Form Saved",
      description: "Your form has been saved successfully.",
    });
  };

  const handlePublish = () => {
    // Mock publish functionality
    toast({
      title: "Form Published",
      description: "Your form is now live and accepting responses.",
    });
  };

  const togglePreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW' });
  };

  const selectedNode = state.selectedNodeId 
    ? findNodeById(state.schema.pages[0].elements, state.selectedNodeId)
    : undefined;

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Input
              value={state.schema.title}
              onChange={(e) => dispatch({ type: 'SET_TITLE', title: e.target.value })}
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={state.isPreview ? "default" : "outline"} 
            size="sm" 
            onClick={togglePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            {state.isPreview ? 'Back to Builder' : 'Preview'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          
          <Button size="sm" onClick={handlePublish}>
            <Upload className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {state.isPreview ? (
            <div className="flex-1 overflow-y-auto">
              <FormRenderer 
                nodes={state.schema.pages[0].elements} 
                title={state.schema.title} 
              />
            </div>
          ) : (
            <>
              <ComponentPalette />
              
              <FormCanvas
                nodes={state.schema.pages[0].elements}
                selectedNodeId={state.selectedNodeId}
                onSelectNode={handleSelectNode}
              />
              
              <PropertiesPanel
                selectedNode={selectedNode}
                onUpdateNode={handleUpdateNode}
              />
            </>
          )}
        </DndContext>
      </div>
    </div>
  );
};