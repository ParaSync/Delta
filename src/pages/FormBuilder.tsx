import { useReducer, useCallback, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ArrowLeft, Eye, Save, Upload } from 'lucide-react';
import ComponentPalette from '@/components/form-builder/ComponentPalette';
import FormCanvas from '@/components/form-builder/FormCanvas';
import PropertiesPanel from '@/components/form-builder/PropertiesPanel';
import FormRenderer from '@/components/form-builder/FormRenderer';
import {
  createNode,
  findNodeById,
  updateNodeById,
  removeNodeById,
  duplicateNode,
} from '../utils/formBuilder';
import { generateId } from '../utils/formBuilder';
import type { FormSchema, FormBuilderState, BuilderAction, Node } from '../types/formBuilder';
import type { BackendNode, InputProperties, ComponentProperties } from '../types/components';
import { toast } from '../hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { route } from '@/firebase/client';

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

function formBuilderReducer(state: FormBuilderState, action: BuilderAction): FormBuilderState {
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
      const elements = [...state.schema.pages[0].elements];
      if (
        typeof action.index === 'number' &&
        action.index >= 0 &&
        action.index <= elements.length
      ) {
        elements.splice(action.index, 0, action.node);
      } else {
        elements.push(action.node);
      }
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
        selectedNodeId: action.node.id,
      };
    }

    case 'UPDATE_NODE': {
      const updatedElements = updateNodeById(
        state.schema.pages[0].elements,
        action.nodeId,
        action.props
      );
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

    case 'DUPLICATE_NODE': {
      const nodeToClone = findNodeById(state.schema.pages[0].elements, action.nodeId);
      if (nodeToClone) {
        const duplicated = duplicateNode(nodeToClone);
        const elements = [...state.schema.pages[0].elements];
        const originalIndex = elements.findIndex((item) => item.id === action.nodeId);
        elements.splice(originalIndex + 1, 0, duplicated);

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
          selectedNodeId: duplicated.id,
        };
      }
      return state;
    }

    case 'MOVE_NODE': {
      const elements = [...state.schema.pages[0].elements];
      const dragIndex = elements.findIndex((el) => el.id === action.nodeId);

      if (dragIndex === -1) return state;

      const [movedElement] = elements.splice(dragIndex, 1);
      elements.splice(action.index, 0, movedElement);

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
      };
    }

    case 'MOVE_NODE_BY_INDEX': {
      const elements = [...state.schema.pages[0].elements];
      const { dragIndex, hoverIndex } = action;

      if (dragIndex === hoverIndex || dragIndex < 0 || hoverIndex < 0) return state;

      const [movedElement] = elements.splice(dragIndex, 1);
      elements.splice(hoverIndex, 0, movedElement);

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
      };
    }

    case 'SELECT_NODE':
      console.log(state.schema.pages[0].elements);
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

    default:
      return state;
  }
}

function FormBuilder() {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDropComponent = useCallback(
    (componentType: string, defaultProps: Record<string, unknown>) => {
      const newNode = createNode(componentType as never, defaultProps);
      const elements = state.schema.pages[0].elements;
      const selectedIdx = state.selectedNodeId
        ? elements.findIndex((el) => el.id === state.selectedNodeId)
        : -1;
      const insertIndex = selectedIdx >= 0 ? selectedIdx + 1 : undefined;
      dispatch({ type: 'ADD_NODE', node: newNode, index: insertIndex });
    },
    [state.schema.pages, state.selectedNodeId]
  );

  const handleUpdateNode = useCallback((nodeId: string, props: Record<string, unknown>) => {
    dispatch({ type: 'UPDATE_NODE', nodeId, props });
  }, []);

  const handleSelectNode = useCallback((nodeId?: string) => {
    dispatch({ type: 'SELECT_NODE', nodeId });
  }, []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      // find the index of the node to delete and compute the previous node id
      const elements = state.schema.pages[0].elements;
      const idx = elements.findIndex((el) => el.id === nodeId);
      const prevId = idx > 0 ? elements[idx - 1].id : undefined;

      // delete the node
      dispatch({ type: 'DELETE_NODE', nodeId });

      // if a previous node exists, select it
      if (prevId) {
        dispatch({ type: 'SELECT_NODE', nodeId: prevId });
      }
    },
    [state.schema.pages]
  );

  const handleDuplicateNode = useCallback((nodeId: string) => {
    dispatch({ type: 'DUPLICATE_NODE', nodeId });
  }, []);

  const handleMoveElement = useCallback((dragIndex: number, hoverIndex: number) => {
    dispatch({ type: 'MOVE_NODE_BY_INDEX', dragIndex, hoverIndex });
  }, []);

  const togglePreview = () => {
    dispatch({ type: 'TOGGLE_PREVIEW' });
  };

  const unique = (prefix: string) =>
    `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  const cvtTypeToComponent = (component: Node, order: number): BackendNode => {
    const backendNode: BackendNode = {
      type: '',
      name: '',
      order: order,
      properties: {
        required: Boolean(component.props.required),
        label: component.props.label.toString(),
      },
    };

    switch (component.type) {
      // case 'h1':
      //   break;
      case 'text':
        {
          backendNode.properties.placeholder = component.props.placeholder.toString();
          backendNode.type = 'text';
          backendNode.name = '';
        }
        break;
      case 'number':
        {
          const max = component.props.max == undefined ? '' : component.props.max.toString();
          const min = component.props.min == undefined ? '' : component.props.min.toString();
          const step = component.props.step == undefined ? '' : component.props.step.toString();

          backendNode.properties = {
            max: max,
            min: min,
            step: Number(step),
          };
          backendNode.type = 'number';
          backendNode.name = '';
        }
        break;
      case 'datetime':
        {
          backendNode.type = 'datetime-local';
          backendNode.name = '';
        }
        break;
      // case 'textarea':
      //   break;
      // case 'date':
      //   break;
      // case 'time':
      //   break;
      case 'select':
        {
          // Unfort Select has not been implemented in the types yet so holding off on this one
        }
        break;
      case 'checkbox':
        {
          // Checkbox options is not yet implemented in frontend
          backendNode.properties.options = (component.props.options as { label: string }[]).map(
            (opt) => opt.label
          );
          backendNode.type = 'checkbox';
          backendNode.name = '';
        }
        break;
      case 'radio':
        {
          backendNode.properties.options = (component.props.options as { label: string }[]).map(
            (opt) => opt.label
          );
          backendNode.type = 'radio';
          backendNode.name = '';
        }
        break;
      // case 'file':
      //   break;
      // case 'image':
      //   break;
      // case 'table':
      //   break;
      case 'submit':
        {
          backendNode.type = 'button';
          backendNode.name = '';
          backendNode.properties.function = 'submit';
          delete backendNode.properties.required;
        }
        break;
      case 'reset':
        {
          backendNode.type = 'button';
          backendNode.name = '';
          backendNode.properties.function = 'reset';
          delete backendNode.properties.required;
        }
        break;
      default:
        return undefined;
    }
    return backendNode;
  };

  const cvtStateToBody = (components: BackendNode[]) => {
    const elements = state.schema.pages[0].elements;
    let count = 1;
    for (let index = 0; index < elements.length; index++) {
      const component: BackendNode = cvtTypeToComponent(elements[index], count);
      if (component !== undefined) {
        components.push(component);
        count++;
      }
    }
  };

  const handleSave = async () => {
    // Mock save functionality
    console.log('Saving form:', state.schema);
    const body = {
      title: state.schema.title,
      userId: user.supaId,
      components: [],
    };
    cvtStateToBody(body.components);
    console.log('Body: ', body);

    const response = await fetch(route('/api/form/create'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      toast({
        title: 'Form saved successfully!',
        description: 'Your form has been saved.',
        type: 'success',
      });
      console.log('Successfully :', response.status, await response.text());
    } else {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
      console.error('Error:', response.status, await response.text());
    }
  };

  const selectedNode = state.selectedNodeId
    ? findNodeById(state.schema.pages[0].elements, state.selectedNodeId) || undefined
    : undefined;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key to delete selected component
      if (e.key === 'Delete' && state.selectedNodeId && !state.isPreview) {
        // Don't delete if user is typing in an input field
        const target = e.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT'
        ) {
          return;
        }
        e.preventDefault();
        handleDeleteNode(state.selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedNodeId, state.isPreview, handleDeleteNode]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-white">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/forms')}
              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <input
              value={state.schema.title}
              onChange={(e) => dispatch({ type: 'SET_TITLE', title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              className="text-lg font-semibold px-2 py-1 rounded-md border-2 border-transparent bg-transparent hover:bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-all w-96 truncate"
              placeholder="Untitled Form"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={togglePreview}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md ${state.isPreview ? 'bg-primary text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
            >
              <Eye className="h-4 w-4" />
              {state.isPreview ? 'Back to Builder' : 'Preview'}
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Save className="h-4 w-4" />
              Save
            </button>

            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90">
              <Upload className="h-4 w-4" />
              Publish
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {state.isPreview ? (
            <div className="flex-1 overflow-y-auto">
              <FormRenderer nodes={state.schema.pages[0].elements} title={state.schema.title} />
            </div>
          ) : (
            <>
              <ComponentPalette onAddComponent={handleDropComponent} />

              <FormCanvas
                nodes={state.schema.pages[0].elements}
                selectedNodeId={state.selectedNodeId}
                onSelectNode={handleSelectNode}
                onDropComponent={handleDropComponent}
                onDeleteNode={handleDeleteNode}
                onDuplicateNode={handleDuplicateNode}
                onUpdateNode={handleUpdateNode}
                onMoveElement={handleMoveElement}
              />

              <PropertiesPanel selectedNode={selectedNode} onUpdateNode={handleUpdateNode} />
            </>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default FormBuilder;
