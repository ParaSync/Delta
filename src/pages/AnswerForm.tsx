import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';
import { route } from '@/firebase/client';
import { getRendererFieldComponent } from '@/components/form-builder/components/renderer';
import type { Node, NodeType } from '../types/formBuilder';
import { generateId } from '../utils/formBuilder';

type FormValues = Record<string, unknown>;
type ValidationErrors = Record<string, string>;

type BackendComponent = {
  id: string;
  formId: string;
  type: string;
  name: string;
  order: number;
  properties: Record<string, unknown>;
};

type FormData = {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  components: BackendComponent[];
};

/**
 * Converts backend component format to frontend Node format
 */
function convertBackendToNode(component: BackendComponent): Node | null {
  const props: Record<string, unknown> = {};
  const source = component.properties ?? {};

  // Map common properties
  if ('required' in source) props.required = Boolean(source.required);
  if ('label' in source) props.label = String(source.label);
  if ('placeholder' in source) props.placeholder = String(source.placeholder);
  if ('min' in source && source.min !== '') props.min = source.min;
  if ('max' in source && source.max !== '') props.max = source.max;
  if ('step' in source && source.step !== '' && source.step !== 0) props.step = source.step;
  if ('options' in source) {
    props.options = Array.isArray(source.options)
      ? (source.options as string[]).map((opt) => ({ label: opt }))
      : [];
  }

  // Determine the node type based on backend inputType or type
  const inputType = source.inputType || component.type;
  let nodeType: NodeType | undefined;

  switch (inputType) {
    case 'text':
      nodeType = 'text';
      break;
    case 'number':
      nodeType = 'number';
      break;
    case 'datetime-local':
      nodeType = 'datetime';
      break;
    case 'checkbox':
      nodeType = 'checkbox';
      break;
    case 'radio':
      nodeType = 'radio';
      break;
    case 'button':
      if (source.function === 'submit') nodeType = 'submit';
      else if (source.function === 'reset') nodeType = 'reset';
      break;
    case 'select':
      nodeType = 'select';
      break;
    case 'textarea':
      nodeType = 'textarea';
      break;
    case 'file':
      nodeType = 'file';
      break;
    case 'date':
      nodeType = 'date';
      break;
    case 'time':
      nodeType = 'time';
      break;
    default:
      console.warn('Unknown input type:', inputType);
      return null;
  }

  if (!nodeType) return null;

  return {
    id: component.id || generateId(),
    type: nodeType,
    props,
  };
}

function AnswerForm() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [componentIdMap, setComponentIdMap] = useState<Map<string, string>>(new Map());

  // Fetch form data from backend
  const fetchForm = useCallback(async () => {
    if (!formId) {
      toast({
        title: 'Error',
        description: 'No form ID provided.',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(route(`/api/form/answer/${formId}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok && data.value?.form) {
        const form = data.value.form as FormData;
        setFormData(form);

        // Convert backend components to frontend nodes
        const convertedNodes: Node[] = [];
        const idMap = new Map<string, string>();

        form.components.forEach((component) => {
          const node = convertBackendToNode(component);
          if (node) {
            convertedNodes.push(node);
            // Map frontend node ID to backend component ID for submission
            idMap.set(node.id, component.id);
          }
        });

        setNodes(convertedNodes);
        setComponentIdMap(idMap);
      } else {
        toast({
          title: 'Error loading form',
          description: data.message || 'Form not found or unavailable.',
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: 'Network error',
        description: 'Unable to load the form. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }, [formId, navigate]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const updateValue = (fieldKey: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldKey]: value }));
    // Clear error when user edits
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    nodes.forEach((node) => {
      const fieldKey = node.id;
      const value = values[fieldKey];
      const isRequired = Boolean(node.props.required);

      // Skip validation for non-input types
      if (node.type === 'submit' || node.type === 'reset') return;

      if (isRequired) {
        const isEmpty =
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          const label = (node.props.label as string) || 'This field';
          newErrors[fieldKey] = `${label} is required.`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    if (!formId) return;

    // Build answers array with backend component IDs
    const answers: Array<{ componentId: number; value: unknown }> = [];

    nodes.forEach((node) => {
      // Skip non-input types
      if (node.type === 'submit' || node.type === 'reset') return;

      const backendId = componentIdMap.get(node.id);
      if (backendId) {
        const value = values[node.id];
        if (value !== undefined && value !== null && value !== '') {
          answers.push({
            componentId: parseInt(backendId, 10),
            value,
          });
        }
      }
    });

    try {
      setSubmitting(true);
      const response = await fetch(route(`/api/form/answer/${formId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        toast({
          title: 'Success!',
          description: 'Your response has been submitted.',
        });
      } else {
        toast({
          title: 'Submission Error',
          description: data.message || 'Failed to submit the form.',
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Network error',
        description: 'Unable to submit the form. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setValues({});
    setErrors({});
  };

  const renderNode = (node: Node): React.ReactNode => {
    const fieldKey = node.id;
    const error = errors[fieldKey];
    const currentValue = values[fieldKey];

    // Get the appropriate field component from the registry
    const FieldComponent = getRendererFieldComponent(node.type);

    // Special handling for submit button
    if (node.type === 'submit') {
      return (
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : (node.props.label as string) || 'Submit'}
        </button>
      );
    }

    // Special handling for reset button
    if (node.type === 'reset') {
      return (
        <button
          type="button"
          onClick={handleReset}
          className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {(node.props.label as string) || 'Reset'}
        </button>
      );
    }

    // Standard interactive field with value/error/onChange
    return (
      <FieldComponent
        node={node}
        value={currentValue}
        error={error}
        onChange={(val) => updateValue(fieldKey, val)}
      />
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Submitted state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-gray-600 mb-6">Your response has been recorded.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setValues({});
              setErrors({});
            }}
            className="px-4 py-2 text-primary border border-primary rounded-md hover:bg-primary/10"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  // Form not found
  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form not found</h2>
          <p className="text-gray-600">The form you're looking for doesn't exist or is unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{formData.title}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {nodes.map((node) => (
              <div key={node.id} className="form-field">
                {renderNode(node)}
              </div>
            ))}

            {/* Fallback submit button if no submit button in form */}
            {!nodes.some((n) => n.type === 'submit') && (
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          Powered by Delta Forms
        </p>
      </div>
    </div>
  );
}

export default AnswerForm;
