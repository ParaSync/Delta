// Form Builder Utilities for Neuron Delta

import { Node, NodeType, ComponentItem, ComponentCategory } from '@/types/form-builder';

// Generate unique IDs
export const generateId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate field key from label
export const generateFieldKey = (label: string): string => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .trim();
};

// Component Palette Configuration
export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    name: 'Labels',
    items: [
      { type: 'h1', label: 'Heading 1', icon: 'Type', defaultProps: { text: 'Heading 1' } },
      { type: 'h2', label: 'Heading 2', icon: 'Type', defaultProps: { text: 'Heading 2' } },
      { type: 'h3', label: 'Heading 3', icon: 'Type', defaultProps: { text: 'Heading 3' } },
      {
        type: 'paragraph',
        label: 'Paragraph',
        icon: 'AlignLeft',
        defaultProps: { text: 'Paragraph text' },
      },
      {
        type: 'help',
        label: 'Help/Tooltip',
        icon: 'HelpCircle',
        defaultProps: { text: 'Help text' },
      },
    ],
  },
  {
    name: 'Inputs',
    items: [
      {
        type: 'text',
        label: 'Text Input',
        icon: 'Type',
        defaultProps: { label: 'Text Field', placeholder: 'Enter text...' },
      },
      {
        type: 'textarea',
        label: 'Textarea',
        icon: 'FileText',
        defaultProps: { label: 'Textarea', placeholder: 'Enter text...', rows: 3 },
      },
      {
        type: 'number',
        label: 'Number',
        icon: 'Hash',
        defaultProps: { label: 'Number Field', placeholder: '0' },
      },
      { type: 'date', label: 'Date', icon: 'Calendar', defaultProps: { label: 'Date Field' } },
      { type: 'time', label: 'Time', icon: 'Clock', defaultProps: { label: 'Time Field' } },
      {
        type: 'datetime',
        label: 'Date & Time',
        icon: 'CalendarClock',
        defaultProps: { label: 'Date & Time Field' },
      },
      {
        type: 'select',
        label: 'Select',
        icon: 'ChevronDown',
        defaultProps: { label: 'Select Field', options: [{ value: 'option1', label: 'Option 1' }] },
      },
      {
        type: 'multiselect',
        label: 'Multi-select',
        icon: 'CheckSquare',
        defaultProps: {
          label: 'Multi-select Field',
          options: [{ value: 'option1', label: 'Option 1' }],
        },
      },
      {
        type: 'radio',
        label: 'Radio Group',
        icon: 'Circle',
        defaultProps: { label: 'Radio Group', options: [{ value: 'option1', label: 'Option 1' }] },
      },
      {
        type: 'checkbox',
        label: 'Checkbox',
        icon: 'Square',
        defaultProps: { label: 'Checkbox Field' },
      },
      {
        type: 'file',
        label: 'File Upload',
        icon: 'Upload',
        defaultProps: { label: 'File Upload', accept: '*/*' },
      },
    ],
  },
  {
    name: 'Tables',
    items: [
      {
        type: 'table',
        label: 'Table',
        icon: 'Table',
        defaultProps: {
          label: 'Table',
          columns: [
            { key: 'col1', label: 'Column 1', type: 'text' },
            { key: 'col2', label: 'Column 2', type: 'text' },
          ],
        },
      },
    ],
  },
  {
    name: 'Layout',
    items: [
      { type: 'divider', label: 'Divider', icon: 'Minus', defaultProps: {} },
      { type: 'columns2', label: '2 Columns', icon: 'Columns', defaultProps: { gap: 'md' } },
      { type: 'columns3', label: '3 Columns', icon: 'Columns3', defaultProps: { gap: 'md' } },
      { type: 'group', label: 'Group', icon: 'Box', defaultProps: { title: 'Group Title' } },
      { type: 'pagebreak', label: 'Page Break', icon: 'FileBreak', defaultProps: {} },
    ],
  },
  {
    name: 'Images',
    items: [
      {
        type: 'image',
        label: 'Image',
        icon: 'Image',
        defaultProps: { src: '', alt: 'Image', objectFit: 'cover' },
      },
    ],
  },
  {
    name: 'Actions',
    items: [
      {
        type: 'submit',
        label: 'Submit Button',
        icon: 'Send',
        defaultProps: { label: 'Submit', variant: 'primary' },
      },
      {
        type: 'reset',
        label: 'Reset Button',
        icon: 'RotateCcw',
        defaultProps: { label: 'Reset', variant: 'secondary' },
      },
    ],
  },
];

// Find node by ID recursively
export const findNodeById = (nodes: Node[], id: string): Node | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Remove node by ID recursively
export const removeNodeById = (nodes: Node[], id: string): Node[] => {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => ({
      ...node,
      children: node.children ? removeNodeById(node.children, id) : undefined,
    }));
};

// Update node props by ID recursively
export const updateNodeById = (
  nodes: Node[],
  id: string,
  props: Record<string, unknown>
): Node[] => {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, props: { ...node.props, ...props } };
    }
    if (node.children) {
      return { ...node, children: updateNodeById(node.children, id, props) };
    }
    return node;
  });
};

// Create new node
export const createNode = (type: NodeType, defaultProps: Record<string, unknown> = {}): Node => {
  const id = generateId();
  const node: Node = {
    id,
    type,
    props: { ...defaultProps },
  };

  // Generate key for input fields
  if (
    [
      'text',
      'textarea',
      'number',
      'date',
      'time',
      'datetime',
      'select',
      'multiselect',
      'radio',
      'checkbox',
      'file',
      'table',
    ].includes(type)
  ) {
    node.key = generateFieldKey((defaultProps.label as string) || type);
  }

  // Initialize children for layout containers
  if (['columns2', 'columns3', 'group'].includes(type)) {
    node.children = [];
  }

  return node;
};

// Duplicate node recursively
export const duplicateNode = (node: Node): Node => {
  const duplicated: Node = {
    ...node,
    id: generateId(),
    key: node.key ? `${node.key}_copy` : undefined,
    children: node.children ? node.children.map(duplicateNode) : undefined,
  };
  return duplicated;
};

// Validate form data
export const validateFormData = (
  data: Record<string, unknown>,
  nodes: Node[]
): Record<string, string> => {
  const errors: Record<string, string> = {};

  const validateNode = (node: Node) => {
    if (node.key && node.props.required && (!data[node.key] || data[node.key] === '')) {
      errors[node.key] = `${node.props.label || node.key} is required`;
    }

    if (node.children) {
      node.children.forEach(validateNode);
    }
  };

  nodes.forEach(validateNode);
  return errors;
};
