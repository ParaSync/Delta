import { useReducer, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ArrowLeft, Eye, Save, Upload, X, Copy, Check } from 'lucide-react';
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
import type { BackendNode } from '../types/components';
import { toast } from '../hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { route } from '@/firebase/client';

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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedLink, setPublishedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePublishClick = () => {
    setShowPublishModal(true);
    setPublishedLink(null);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (publishedLink) {
      navigator.clipboard.writeText(publishedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);

  const fetchForms = useCallback(async () => {
    if (location.pathname.includes('edit')) {
      setIsEditing(true);
      const segments = location.pathname.split('/');
      const formId = segments[segments.length - 1];

      try {
        const response = await fetch(route('/api/form/fetch/' + formId), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Successful fetch response:', response.status, data);
          cvtBodyToState(data);
        } else {
          console.error('Error:', response.status, data);
          toast({
            title: 'Error fetching form data.',
            description: 'Your form components are unavailable right now.',
          });
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast({
          title: 'Error fetching form data.',
          description: 'Network error occurred.',
        });
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

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
      const elements = state.schema.pages[0].elements;
      const idx = elements.findIndex((el) => el.id === nodeId);
      const prevId = idx > 0 ? elements[idx - 1].id : undefined;

      dispatch({ type: 'DELETE_NODE', nodeId });

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

  const cvtTypeToComponent = (component: Node, order: number): BackendNode | undefined => {
    const backendNode: BackendNode = {
      type: '',
      name: '',
      order: order,
      properties: {
        required: Boolean(component.props.required),
        label: component.props.label?.toString() || '',
      },
    };

    switch (component.type) {
      case 'text': {
        backendNode.properties.placeholder = component.props.placeholder?.toString() || '';
        backendNode.type = 'text';
        backendNode.name = '';
        break;
      }
      case 'number': {
        const max = component.props.max == undefined ? '' : component.props.max.toString();
        const min = component.props.min == undefined ? '' : component.props.min.toString();
        const step = component.props.step == undefined ? '' : component.props.step.toString();

        backendNode.properties = {
          ...backendNode.properties,
          max: max,
          min: min,
          step: Number(step),
        };
        backendNode.type = 'number';
        backendNode.name = '';
        break;
      }
      case 'datetime': {
        backendNode.type = 'datetime-local';
        backendNode.name = '';
        break;
      }
      case 'select': {
        // Select not yet implemented
        break;
      }
      case 'checkbox': {
        backendNode.properties.options =
          (component.props.options as { label: string }[])?.map((opt) => opt.label) || [];
        backendNode.type = 'checkbox';
        backendNode.name = '';
        break;
      }
      case 'radio': {
        backendNode.properties.options =
          (component.props.options as { label: string }[])?.map((opt) => opt.label) || [];
        backendNode.type = 'radio';
        backendNode.name = '';
        break;
      }
      case 'submit': {
        backendNode.type = 'button';
        backendNode.name = '';
        backendNode.properties.function = 'submit';
        delete backendNode.properties.required;
        break;
      }
      case 'reset': {
        backendNode.type = 'button';
        backendNode.name = '';
        backendNode.properties.function = 'reset';
        delete backendNode.properties.required;
        break;
      }
      default:
        return undefined;
    }
    return backendNode;
  };

  const cvtStateToBody = (components: BackendNode[]) => {
    const elements = state.schema.pages[0].elements;
    let count = 1;
    for (let index = 0; index < elements.length; index++) {
      const component = cvtTypeToComponent(elements[index], count);
      if (component !== undefined) {
        components.push(component);
        count++;
      }
    }
  };
  /* eslint-disable */
  const cvtComponentToType = (backendNode: any): Node | undefined => {
    const nodeProps: Record<string, unknown> = {};

    const source = backendNode.properties ?? backendNode;

    if ('required' in source) nodeProps.required = Boolean(source.required);
    if ('label' in source) nodeProps.label = String(source.label);
    if ('placeholder' in source) nodeProps.placeholder = String(source.placeholder);
    if ('min' in source && source.min !== '') nodeProps.min = source.min;
    if ('max' in source && source.max !== '') nodeProps.max = source.max;
    if ('step' in source && source.step !== '' && source.step !== 0) nodeProps.step = source.step;
    if ('options' in source)
      nodeProps.options = (source.options as string[]).map((opt) => ({ label: opt }));

    let type: string | undefined;

    const inputType = source.inputType || backendNode.type;

    switch (inputType) {
      case 'text':
        type = 'text';
        break;
      case 'number':
        type = 'number';
        break;
      case 'datetime-local':
        type = 'datetime';
        break;
      case 'checkbox':
        type = 'checkbox';
        break;
      case 'radio':
        type = 'radio';
        break;
      case 'button':
        if (source.function === 'submit') type = 'submit';
        else if (source.function === 'reset') type = 'reset';
        break;
      default:
        console.warn('Unknown input type:', inputType);
        return undefined;
    }

    if (!type) return undefined;

    // Generate ID for each node
    return {
      id: generateId(),
      type,
      props: nodeProps,
    } as Node;
  };
  /* eslint-disable */
  const cvtBodyToState = useCallback((data: any) => {
    const components = Array.isArray(data.value) ? data.value : data?.components || [];
    const title = data?.title || data?.value?.title || 'Untitled Form';

    console.log('Loading form data:', { data, components, title });

    if (!Array.isArray(components)) {
      console.error('Components is not an array:', components);
      toast({
        title: 'Error loading form',
        description: 'Invalid form data structure.',
      });
      return;
    }

    if (components.length === 0) {
      console.warn('No components to load');
      return;
    }

    dispatch({ type: 'SET_TITLE', title });

    for (let i = 0; i < components.length; i++) {
      const node = cvtComponentToType(components[i]);
      if (node) {
        console.log('Adding node:', node);
        dispatch({ type: 'ADD_NODE', node, index: i });
      } else {
        console.warn('Failed to convert component:', components[i]);
      }
    }

    console.log('Finished loading components');
  }, []);

  const handleSave = async () => {
    console.log('Saving form:', state.schema);

    const body = {
      title: state.schema.title,
      userId: user.supaId,
      components: [] as BackendNode[],
    };
    cvtStateToBody(body.components);
    console.log('Body: ', body);
    if (!isEditing) {
      try {
        const response = await fetch(route('/api/form/create'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (response.ok) {
          const formId = data.value?.id;
          console.log('Created form ID:', formId);
          toast({
            title: 'Form saved successfully!',
            description: `Your form has been saved with ID ${formId}.`,
          });
          navigate('/forms/edit/' + formId);
        } else {
          toast({
            title: 'Error',
            description: data.message || 'An unexpected error occurred. Please try again.',
          });
          console.error('Error:', data);
        }
      } catch (err) {
        toast({
          title: 'Network error',
          description: 'Unable to reach the server. Please try again later.',
        });
        console.error('Fetch error:', err);
      }
    }
  };

  const publishForm = async () => {
    if (isEditing) {
      try {
        const segments = location.pathname.split('/');
        const formId = segments[segments.length - 1];
        const response = await fetch(route('/api/form/edit/publish/' + formId), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Successful publish:', response.status, data);
          // Add these lines:
          const dummyLink = `https://forms.example.com/view/${formId}`;
          setPublishedLink(dummyLink);
        } else {
          console.error('Error:', response.status, data);
          toast({
            title: 'Error publishing form.',
            description: 'Your form components are unavailable right now.',
          });
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast({
          title: 'Error publishing form.',
          description: 'Network error occurred.',
        });
      }
    }
  };

  const selectedNode = state.selectedNodeId
    ? findNodeById(state.schema.pages[0].elements, state.selectedNodeId) || undefined
    : undefined;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && state.selectedNodeId && !state.isPreview) {
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

            <button
              onClick={handlePublishClick}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
            >
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
        {showPublishModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {publishedLink ? 'Form Published!' : 'Publish Form'}
                </h2>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                {!publishedLink ? (
                  <>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to publish this form? Once published, it will be
                      accessible to anyone with the link.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowPublishModal(false)}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={publishForm}
                        className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Confirm Publish
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-4">
                      Your form has been published successfully! Share this link with others:
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200 mb-4">
                      <input
                        type="text"
                        value={publishedLink}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowPublishModal(false)}
                        className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default FormBuilder;
