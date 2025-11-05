/**
 * Renderer field registry - Maps node types to their interactive components
 * Used in FormRenderer for functional form preview
 */

import type { InteractiveFieldProps } from '../types';
import { H1Field, H2Field, H3Field, ParagraphField, HelpField } from './HeaderComponents';
import { TextField, NumberField, DateField, TimeField, DateTimeField, TextareaField, FileField } from './InputComponents';
import { SelectField, MultiselectField, RadioField, CheckboxField } from './SelectionComponents';
import { TableField, ImageField, SubmitButton, ResetButton, DividerField, PageBreakField } from './OtherComponents';
import React from 'react';

/**
 * Field component type for renderer (interactive fields)
 */
export type RendererFieldComponent = React.FC<InteractiveFieldProps>;

/**
 * Registry of all renderer field components
 * These components handle state, validation, and user interaction
 */
export const rendererFieldRegistry: Record<string, RendererFieldComponent> = {
  // Typography (non-interactive, same as builder)
  h1: H1Field,
  h2: H2Field,
  h3: H3Field,
  paragraph: ParagraphField,
  help: HelpField,

  // Basic inputs (interactive)
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  date: DateField,
  time: TimeField,
  datetime: DateTimeField,
  file: FileField,

  // Selection inputs (interactive)
  select: SelectField,
  multiselect: MultiselectField,
  radio: RadioField,
  checkbox: CheckboxField,

  // Complex fields
  table: TableField,
  image: ImageField,

  // Buttons
  submit: SubmitButton,
  reset: ResetButton,

  // Layout
  divider: DividerField,
  pagebreak: PageBreakField,
};

/**
 * Fallback component for unknown field types
 */
export function UnknownField({ node }: InteractiveFieldProps): React.ReactElement {
  return React.createElement(
    'div',
    { className: 'p-4 border border-dashed border-red-400 rounded-lg bg-red-50 mb-4' },
    React.createElement('span', { className: 'text-red-600' }, `Unknown field type: ${node.type}`)
  );
}

/**
 * Get the appropriate field component for a node type
 */
export function getRendererFieldComponent(nodeType: string): RendererFieldComponent {
  return rendererFieldRegistry[nodeType] || UnknownField;
}
