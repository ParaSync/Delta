// Form Builder Schema Types for Neuron Delta

export type FormSchema = {
  title: string;
  pages: Page[];
};

export type Page = {
  id: string;
  elements: Node[];
};

export type NodeType =
  // Labels
  | 'h1' | 'h2' | 'h3' | 'paragraph' | 'help'
  // Inputs
  | 'text' | 'textarea' | 'number' | 'date' | 'time' | 'datetime'
  | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'file'
  // Tables
  | 'table'
  // Layout
  | 'divider' | 'columns2' | 'columns3' | 'group' | 'pagebreak'
  // Images
  | 'image'
  // Actions
  | 'submit' | 'reset';

export type Node = {
  id: string;
  type: NodeType;
  key?: string; // data key for inputs
  props: Record<string, any>;
  children?: Node[]; // for layout containers
};

export type ComponentCategory = {
  name: string;
  items: ComponentItem[];
};

export type ComponentItem = {
  type: NodeType;
  label: string;
  icon: string;
  defaultProps: Record<string, any>;
};

export type ValidationRule = {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'regex' | 'email';
  value?: any;
  message?: string;
};

export type FormBuilderState = {
  schema: FormSchema;
  selectedNodeId?: string;
  isPreview: boolean;
  history: FormSchema[];
  historyIndex: number;
};

export type BuilderAction =
  | { type: 'SET_TITLE'; title: string }
  | { type: 'ADD_NODE'; node: Node; parentId?: string; index?: number }
  | { type: 'UPDATE_NODE'; nodeId: string; props: Record<string, any> }
  | { type: 'DELETE_NODE'; nodeId: string }
  | { type: 'MOVE_NODE'; nodeId: string; targetParentId?: string; index: number }
  | { type: 'DUPLICATE_NODE'; nodeId: string }
  | { type: 'SELECT_NODE'; nodeId?: string }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_TO_HISTORY' };