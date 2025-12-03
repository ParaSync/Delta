import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';
import { route } from '@/firebase/client';
import { getRendererFieldComponent } from '@/components/form-builder/components/renderer';
import { TableField } from '@/components/form-builder/components/renderer/OtherComponents';
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
  // Map date/time constraint properties
  if ('minDate' in source && source.minDate) props.minDate = String(source.minDate);
  if ('maxDate' in source && source.maxDate) props.maxDate = String(source.maxDate);
  if ('minTime' in source && source.minTime) props.minTime = String(source.minTime);
  if ('maxTime' in source && source.maxTime) props.maxTime = String(source.maxTime);
  if ('minDateTime' in source && source.minDateTime) props.minDateTime = String(source.minDateTime);
  if ('maxDateTime' in source && source.maxDateTime) props.maxDateTime = String(source.maxDateTime);
  // Map visibility property (hidden fields)
  if ('visibleInPreview' in source) props.visibleInPreview = source.visibleInPreview;
  if ('options' in source) {
    // Normalize options to always have { label, value } format
    props.options = Array.isArray(source.options)
      ? (source.options as Array<string | { label: string; value?: string }>).map((opt) => {
          if (typeof opt === 'string') {
            return { label: opt, value: opt };
          }
          // Object with label, ensure value exists (default to label if missing)
          return { label: opt.label, value: opt.value ?? opt.label };
        })
      : [];
  }

  // Determine the node type based on backend inputType, component type, or infer from name/properties
  const inputType = source.inputType || component.type;
  let nodeType: NodeType | undefined;

  // Helper to infer type from component name or label
  // NOTE: Only return 'checkbox' if we know there are options, otherwise backend validation fails
  const inferTypeFromName = (
    name: string,
    label?: string,
    hasOptions?: boolean
  ): NodeType | undefined => {
    const nameLower = name.toLowerCase();
    const labelLower = (label || '').toLowerCase();

    if (nameLower.includes('submit') || labelLower === 'submit') return 'submit';
    if (nameLower.includes('reset') || labelLower === 'reset') return 'reset';
    // Only infer checkbox/radio if we know there are options
    if (hasOptions) {
      if (
        nameLower.includes('checkbox') ||
        nameLower.includes('agree') ||
        nameLower.includes('terms') ||
        nameLower.includes('accept')
      )
        return 'checkbox';
      if (nameLower.includes('radio')) return 'radio';
    }
    if (nameLower.includes('select') || nameLower.includes('dropdown')) return 'select';
    if (
      nameLower.includes('textarea') ||
      nameLower.includes('message') ||
      nameLower.includes('description')
    )
      return 'textarea';
    if (nameLower.includes('email')) return 'text';
    if (nameLower.includes('phone') || nameLower.includes('age') || nameLower.includes('number'))
      return 'number';
    if (nameLower.includes('date')) return 'date';
    if (nameLower.includes('time')) return 'time';
    if (nameLower.includes('file') || nameLower.includes('upload')) return 'file';
    return undefined;
  };

  // Check if component has valid options
  const hasValidOptions = Array.isArray(source.options) && source.options.length > 0;

  if (source.inputType === 'heading') {
    props.text = source.text;
    nodeType = 'h' + source.heading;
  } else {
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
        // Always render as checkbox
        nodeType = 'checkbox';
        if (!hasValidOptions) {
          // Create a single option using the label so it renders properly
          const labelValue = String(source.label || 'Yes');
          props.options = [{ label: labelValue, value: labelValue }];
          // Mark as synthetic - backend has no options so we can't submit this
          props.isSingleCheckbox = true;
          props.hasNoBackendOptions = true;
        }
        break;
      case 'radio':
        // Only render as radio if there are valid options
        if (hasValidOptions) {
          nodeType = 'radio';
        } else {
          nodeType = 'text';
        }
        break;
      case 'button':
        if (
          source.function === 'submit' ||
          (source.label as string)?.toLowerCase().includes('submit')
        )
          nodeType = 'submit';
        else if (
          source.function === 'reset' ||
          (source.label as string)?.toLowerCase().includes('reset')
        )
          nodeType = 'reset';
        else nodeType = 'submit'; // Default buttons to submit
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
      case 'table':
        nodeType = 'table';
        props.columns = source.options;
        props.maxRows = source.maxRows;
        break;
      case 'input':
        // Backend normalized type to 'input' - try to infer actual type
        // First, check if it has options - this is more reliable than name inference
        if (source.inputType === 'heading') {
          props.text = source.text;
          nodeType = 'h' + source.heading;
        } else if (hasValidOptions) {
          // Multiple options: check name to determine if select, radio, or checkbox
          const nameLower = component.name.toLowerCase();
          if (
            nameLower.includes('select') ||
            nameLower.includes('department') ||
            nameLower.includes('dropdown') ||
            nameLower.includes('choose')
          ) {
            nodeType = 'select';
          } else if (nameLower.includes('radio')) {
            nodeType = 'radio';
          } else if (
            nameLower.includes('checkbox') ||
            nameLower.includes('agree') ||
            nameLower.includes('terms') ||
            nameLower.includes('accept')
          ) {
            nodeType = 'checkbox';
          } else {
            // Default options to select (dropdown) for better UX
            nodeType = 'select';
          }
        } else {
          // No options - infer from name or default to text
          // Pass hasValidOptions=false so checkbox/radio won't be inferred without options
          nodeType = inferTypeFromName(component.name, source.label as string, false) || 'text';
        }
        break;
      default:
        console.warn('Unknown input type:', inputType);
        // Try to infer from name as last resort
        nodeType = inferTypeFromName(component.name, source.label as string, hasValidOptions) || 'text';
    }
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
            // Store the order from properties for sorting
            (node as Node & { order?: number }).order =
              (component.properties?.order as number) ?? component.order ?? 0;
            convertedNodes.push(node);
            // Map frontend node ID to backend component ID for submission
            idMap.set(node.id, component.id);
          }
        });

        // Sort nodes by order before setting state
        convertedNodes.sort((a, b) => {
          const orderA = (a as Node & { order?: number }).order ?? 0;
          const orderB = (b as Node & { order?: number }).order ?? 0;
          return orderA - orderB;
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

      // Skip checkboxes that have no backend options (can't be validated by backend)
      if (node.type === 'checkbox' && node.props.hasNoBackendOptions) {
        console.warn(`Skipping checkbox "${node.props.label}" - no options defined in backend`);
        return;
      }

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

  // Table-specific handlers
  const handleTableAddRow = (fieldKey: string, columns: Array<{ key: string }>) => {
    const currentRows = (values[fieldKey] as Array<Record<string, unknown>>) || [];
    const newRow: Record<string, unknown> = {};
    columns.forEach((col) => {
      newRow[col.key] = '';
    });
    updateValue(fieldKey, [...currentRows, newRow]);
  };

  const handleTableRemoveRow = (fieldKey: string, rowIndex: number) => {
    const currentRows = (values[fieldKey] as Array<Record<string, unknown>>) || [];
    const newRows = currentRows.filter((_, i) => i !== rowIndex);
    updateValue(fieldKey, newRows);
  };

  const handleTableUpdateCell = (fieldKey: string, rowIndex: number, colKey: string, value: unknown) => {
    const currentRows = (values[fieldKey] as Array<Record<string, unknown>>) || [];
    const newRows = [...currentRows];
    if (newRows[rowIndex]) {
      newRows[rowIndex] = { ...newRows[rowIndex], [colKey]: value };
    }
    updateValue(fieldKey, newRows);
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

    // Special handling for table fields - need to pass table-specific handlers
    if (node.type === 'table') {
      const columns = (node.props.columns as Array<{ key: string; label: string }>) || [];
      return (
        <TableField
          node={node}
          value={currentValue}
          error={error}
          onChange={(val) => updateValue(fieldKey, val)}
          onAddRow={() => handleTableAddRow(fieldKey, columns)}
          onRemoveRow={(rowIndex: number) => handleTableRemoveRow(fieldKey, rowIndex)}
          onUpdateCell={(rowIndex: number, colKey: string, value: unknown) => 
            handleTableUpdateCell(fieldKey, rowIndex, colKey, value)
          }
        />
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
          <p className="text-gray-600">
            The form you're looking for doesn't exist or is unavailable.
          </p>
        </div>
      </div>
    );
  }

  // Filter out hidden nodes (visibleInPreview === false)
  const visibleNodes = nodes.filter((node) => node.props.visibleInPreview !== false);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">{formData.title}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {visibleNodes.map((node) => (
              <div key={node.id} className="form-field">
                {renderNode(node)}
              </div>
            ))}

            {/* Fallback submit button if no submit button in form */}
            {!visibleNodes.some((n) => n.type === 'submit') && (
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

        <p className="text-center text-gray-500 text-sm mt-4">Powered by Delta Forms</p>
      </div>
    </div>
  );
}

export default AnswerForm;
