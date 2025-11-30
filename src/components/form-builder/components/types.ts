/**
 * Shared types for field components
 */

import type { Node } from '../../../types/formBuilder';

/**
 * Base props shared by all field components
 */
export interface BaseFieldProps {
  node: Node;
  disabled?: boolean;
  onUpdateNode?: (nodeId: string, props: Record<string, unknown>) => void;
}

/**
 * Props for interactive form fields (in FormRenderer)
 */
export interface InteractiveFieldProps extends BaseFieldProps {
  value?: unknown;
  error?: string;
  onChange?: (value: unknown) => void;
  onClick?: () => void; // For reset button
}

/**
 * Props for table field with special handlers
 */
export interface TableFieldProps extends InteractiveFieldProps {
  onAddRow?: () => void;
  onRemoveRow?: (rowIndex: number) => void;
  onUpdateCell?: (rowIndex: number, colKey: string, value: unknown) => void;
}

/**
 * Field component type for registry
 */
export type FieldComponent<P extends BaseFieldProps = BaseFieldProps> = React.FC<P>;

/**
 * Registry mapping node types to their components
 */
export type FieldRegistry<P extends BaseFieldProps = BaseFieldProps> = Record<
  string,
  FieldComponent<P>
>;

/**
 * Option type for select, radio, and multiselect fields
 */
export interface FieldOption {
  value: string;
  label: string;
}

/**
 * Column definition for table fields
 */
export interface TableColumn {
  key: string;
  label: string;
}
