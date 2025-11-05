/**
 * Input components for FormElement (builder preview)
 */

import type { BaseFieldProps } from '../types';
import { toReactString } from '../../../../utils/formBuilder';

interface InputFieldConfig {
  type: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
}

function BaseInputField({ node, type, defaultLabel, defaultPlaceholder = '' }: BaseFieldProps & InputFieldConfig) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || defaultLabel);
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={fieldId}
        className="text-sm font-medium block"
      >
        {labelText}
        {Boolean(props.required) && <span className="text-red-600" aria-label="required">*</span>}
      </label>
      <input
        id={fieldId}
        type={type}
        placeholder={String(props.placeholder || defaultPlaceholder)}
        aria-label={labelText}
        aria-required={Boolean(props.required)}
        data-testid={`builder-input-${type}`}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none"
        disabled
      />
    </div>
  );
}

export function TextField({ node }: BaseFieldProps) {
  return <BaseInputField node={node} type="text" defaultLabel="Text Field" />;
}

export function NumberField({ node }: BaseFieldProps) {
  return <BaseInputField node={node} type="number" defaultLabel="Number Field" />;
}

export function DateField({ node }: BaseFieldProps) {
  return <BaseInputField node={node} type="date" defaultLabel="Date Field" />;
}

export function TimeField({ node }: BaseFieldProps) {
  return <BaseInputField node={node} type="time" defaultLabel="Time Field" />;
}

export function DateTimeField({ node }: BaseFieldProps) {
  return <BaseInputField node={node} type="datetime-local" defaultLabel="Date & Time Field" />;
}

export function TextareaField({ node }: BaseFieldProps) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || 'Textarea');
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={fieldId}
        className="text-sm font-medium block"
      >
        {labelText}
        {Boolean(props.required) && <span className="text-red-600" aria-label="required">*</span>}
      </label>
      <textarea
        id={fieldId}
        placeholder={String(props.placeholder || '')}
        rows={Number(props.rows) || 3}
        aria-label={labelText}
        aria-required={Boolean(props.required)}
        aria-multiline="true"
        data-testid="builder-input-textarea"
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white resize-none pointer-events-none"
        disabled
      />
    </div>
  );
}

export function FileField({ node }: BaseFieldProps) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || 'File Upload');
  const isMultiple = Boolean(props.multiple);
  
  return (
    <div className="space-y-2">
      <label 
        htmlFor={fieldId}
        className="text-sm font-medium block"
      >
        {labelText}
        {Boolean(props.required) && <span className="text-red-600" aria-label="required">*</span>}
      </label>
      <input
        id={fieldId}
        type="file"
        accept={String(props.accept || '*/*')}
        aria-label={labelText + (isMultiple ? ' (multiple)' : '')}
        aria-required={Boolean(props.required)}
        data-testid="builder-input-file"
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none"
        disabled
      />
      <p className="text-xs text-gray-500">Accepted: {String(props.accept || '*/*')}</p>
    </div>
  );
}
