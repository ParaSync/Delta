/**
 * Builder field registry - Maps node types to their preview components
 * Used in FormElement for drag-and-drop canvas
 */

import type { FieldRegistry, BaseFieldProps } from '../types';
import { H1Field, H2Field, H3Field, ParagraphField, HelpField } from './HeaderComponents';
import {
  TextField,
  NumberField,
  DateField,
  TimeField,
  DateTimeField,
  TextareaField,
  FileField,
} from './InputComponents';
import { SelectField, MultiselectField, RadioField, CheckboxField } from './SelectionComponents';
import {
  TableField,
  ImageField,
  SubmitButton,
  ResetButton,
  DividerField,
  PageBreakField,
} from './OtherComponents';
import React from 'react';

/**
 * Registry of all builder field components
 * Add new field types here to automatically support them in the form builder
 */
export const builderFieldRegistry: FieldRegistry<BaseFieldProps> = {
  // Typography
  h1: H1Field,
  h2: H2Field,
  h3: H3Field,
  paragraph: ParagraphField,
  help: HelpField,

  // Basic inputs
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  date: DateField,
  time: TimeField,
  datetime: DateTimeField,
  file: FileField,

  // Selection inputs
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
export function UnknownField({ node }: BaseFieldProps): React.ReactElement {
  return React.createElement(
    'div',
    { className: 'p-4 border border-dashed border-gray-400 rounded-lg' },
    React.createElement('span', { className: 'text-gray-500' }, `Unknown component: ${node.type}`)
  );
}

/**
 * Get the appropriate field component for a node type
 */
export function getBuilderFieldComponent(nodeType: string) {
  return builderFieldRegistry[nodeType] || UnknownField;
}
