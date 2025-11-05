/**
 * Input components for FormRenderer (interactive with state management)
 */

import type { InteractiveFieldProps } from '../types';
import { toReactString } from '../../../../utils/formBuilder';

interface InputFieldConfig {
  type: string;
  placeholder?: string;
}

function BaseInputField({ 
  node, 
  value, 
  error, 
  onChange, 
  type, 
  placeholder = '' 
}: InteractiveFieldProps & InputFieldConfig) {
  const { props } = node;
  const labelText = props.label ? toReactString(props.label) : null;
  const fieldId = `field-${node.id}`;
  const errorId = `error-${node.id}`;
  
  return (
    <div className="mb-4">
      {labelText && (
        <label 
          htmlFor={fieldId}
          className="block font-medium mb-1"
        >
          {labelText}
          {Boolean(props.required) && <span className="text-red-600 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={fieldId}
        type={type}
        value={String(value || '')}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={String(props.placeholder || placeholder)}
        required={Boolean(props.required)}
        readOnly={Boolean(props.readonly)}
        aria-label={labelText || `${type} input`}
        aria-required={Boolean(props.required)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        data-testid={`input-${type}`}
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p 
          id={errorId}
          className="text-red-500 text-sm mt-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField(props: InteractiveFieldProps) {
  return <BaseInputField {...props} type="text" />;
}

export function DateField(props: InteractiveFieldProps) {
  return <BaseInputField {...props} type="date" />;
}

export function TimeField(props: InteractiveFieldProps) {
  return <BaseInputField {...props} type="time" />;
}

export function DateTimeField(props: InteractiveFieldProps) {
  return <BaseInputField {...props} type="datetime-local" />;
}

export function NumberField({ node, value, error, onChange }: InteractiveFieldProps) {
  const { props } = node;
  const labelText = props.label ? toReactString(props.label) : null;
  const fieldId = `field-${node.id}`;
  const errorId = `error-${node.id}`;
  
  return (
    <div className="mb-4">
      {labelText && (
        <label 
          htmlFor={fieldId}
          className="block font-medium mb-1"
        >
          {labelText}
          {Boolean(props.required) && <span className="text-red-600 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={fieldId}
        type="number"
        value={value !== undefined ? String(value) : ''}
        onChange={(e) => onChange?.(e.target.value ? parseFloat(e.target.value) : undefined)}
        placeholder={String(props.placeholder || '')}
        required={Boolean(props.required)}
        readOnly={Boolean(props.readonly)}
        min={props.min !== undefined ? Number(props.min) : undefined}
        max={props.max !== undefined ? Number(props.max) : undefined}
        step={Number(props.step) || 1}
        aria-label={labelText || 'number input'}
        aria-required={Boolean(props.required)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        aria-valuemin={props.min !== undefined ? Number(props.min) : undefined}
        aria-valuemax={props.max !== undefined ? Number(props.max) : undefined}
        data-testid="input-number"
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p 
          id={errorId}
          className="text-red-500 text-sm mt-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function TextareaField({ node, value, error, onChange }: InteractiveFieldProps) {
  const { props } = node;
  const labelText = props.label ? toReactString(props.label) : null;
  const fieldId = `field-${node.id}`;
  const errorId = `error-${node.id}`;
  
  return (
    <div className="mb-4">
      {labelText && (
        <label 
          htmlFor={fieldId}
          className="block font-medium mb-1"
        >
          {labelText}
          {Boolean(props.required) && <span className="text-red-600 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <textarea
        id={fieldId}
        value={String(value || '')}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={String(props.placeholder || '')}
        required={Boolean(props.required)}
        readOnly={Boolean(props.readonly)}
        rows={Number(props.rows) || 3}
        aria-label={labelText || 'text area'}
        aria-required={Boolean(props.required)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        aria-multiline="true"
        data-testid="input-textarea"
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p 
          id={errorId}
          className="text-red-500 text-sm mt-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function FileField({ node, error, onChange }: InteractiveFieldProps) {
  const { props } = node;
  const labelText = props.label ? toReactString(props.label) : null;
  const isMultiple = Boolean(props.multiple);
  const fieldId = `field-${node.id}`;
  const errorId = `error-${node.id}`;
  
  return (
    <div className="mb-4">
      {labelText && (
        <label 
          htmlFor={fieldId}
          className="block font-medium mb-1"
        >
          {labelText}
          {Boolean(props.required) && <span className="text-red-600 ml-1" aria-label="required">*</span>}
        </label>
      )}
      <input
        id={fieldId}
        type="file"
        accept={String(props.accept || '*/*')}
        multiple={isMultiple}
        onChange={(e) => {
          if (isMultiple) {
            onChange?.(e.target.files ? Array.from(e.target.files) : []);
          } else {
            onChange?.(e.target.files?.[0] || null);
          }
        }}
        required={Boolean(props.required)}
        aria-label={labelText || (isMultiple ? 'file upload (multiple)' : 'file upload')}
        aria-required={Boolean(props.required)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        data-testid="input-file"
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && (
        <p 
          id={errorId}
          className="text-red-500 text-sm mt-1"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
