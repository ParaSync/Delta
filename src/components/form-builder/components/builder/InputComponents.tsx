/**
 * Input components for FormElement (builder preview)
 */

import type { BaseFieldProps } from '../types';
import { toReactString } from '../../../../utils/formBuilder';
import { InlineEdit } from '../InlineEdit';

interface InputFieldConfig {
  type: string;
  defaultLabel: string;
  defaultPlaceholder?: string;
}

function BaseInputField({
  node,
  type,
  defaultLabel,
  defaultPlaceholder = '',
  onUpdateNode,
}: BaseFieldProps & InputFieldConfig) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || defaultLabel);

  const handleLabelChange = (value: string) => {
    onUpdateNode?.(node.id, { label: value });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <InlineEdit
          value={labelText}
          onChange={handleLabelChange}
          as="label"
          className="text-sm font-medium"
          placeholder={defaultLabel}
          disabled={!onUpdateNode}
        />
        {Boolean(props.required) && (
          <span className="text-red-600 ml-0.5" aria-label="required">
            *
          </span>
        )}
      </div>
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

export function TextField({ node, onUpdateNode }: BaseFieldProps) {
  return (
    <div className="space-y-2">
      <BaseInputField node={node} type="text" defaultLabel="Text Field" onUpdateNode={onUpdateNode} />
      <p className="text-xs text-gray-500">Max 1000 characters</p>
    </div>
  );
}

export function NumberField({ node, onUpdateNode }: BaseFieldProps) {
  return (
    <BaseInputField
      node={node}
      type="number"
      defaultLabel="Number Field"
      onUpdateNode={onUpdateNode}
    />
  );
}

export function DateField({ node, onUpdateNode }: BaseFieldProps) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || 'Date Field');

  const handleLabelChange = (value: string) => {
    onUpdateNode?.(node.id, { label: value });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <InlineEdit
          value={labelText}
          onChange={handleLabelChange}
          as="label"
          className="text-sm font-medium"
          placeholder="Date Field"
          disabled={!onUpdateNode}
        />
        {Boolean(props.required) && (
          <span className="text-red-600 ml-0.5" aria-label="required">
            *
          </span>
        )}
      </div>
      <input
        id={fieldId}
        type="date"
        min={props.minDate ? String(props.minDate) : undefined}
        max={props.maxDate ? String(props.maxDate) : undefined}
        aria-label={labelText}
        aria-required={Boolean(props.required)}
        data-testid="builder-input-date"
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none"
        disabled
      />
      {(props.minDate || props.maxDate) && (
        <p className="text-xs text-gray-500">
          {props.minDate && props.maxDate
            ? `${props.minDate} to ${props.maxDate}`
            : props.minDate
              ? `From ${props.minDate}`
              : `Until ${props.maxDate}`}
        </p>
      )}
    </div>
  );
}

export function TimeField({ node, onUpdateNode }: BaseFieldProps) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || 'Time Field');

  const handleLabelChange = (value: string) => {
    onUpdateNode?.(node.id, { label: value });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <InlineEdit
          value={labelText}
          onChange={handleLabelChange}
          as="label"
          className="text-sm font-medium"
          placeholder="Time Field"
          disabled={!onUpdateNode}
        />
        {Boolean(props.required) && (
          <span className="text-red-600 ml-0.5" aria-label="required">
            *
          </span>
        )}
      </div>
      <input
        id={fieldId}
        type="time"
        min={props.minTime ? String(props.minTime) : undefined}
        max={props.maxTime ? String(props.maxTime) : undefined}
        aria-label={labelText}
        aria-required={Boolean(props.required)}
        data-testid="builder-input-time"
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none"
        disabled
      />
      {(props.minTime || props.maxTime) && (
        <p className="text-xs text-gray-500">
          {props.minTime && props.maxTime
            ? `${props.minTime} to ${props.maxTime}`
            : props.minTime
              ? `From ${props.minTime}`
              : `Until ${props.maxTime}`}
        </p>
      )}
    </div>
  );
}

export function DateTimeField({ node, onUpdateNode }: BaseFieldProps) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || 'Date & Time Field');

  const handleLabelChange = (value: string) => {
    onUpdateNode?.(node.id, { label: value });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <InlineEdit
          value={labelText}
          onChange={handleLabelChange}
          as="label"
          className="text-sm font-medium"
          placeholder="Date & Time Field"
          disabled={!onUpdateNode}
        />
        {Boolean(props.required) && (
          <span className="text-red-600 ml-0.5" aria-label="required">
            *
          </span>
        )}
      </div>
      <input
        id={fieldId}
        type="datetime-local"
        min={props.minDateTime ? String(props.minDateTime) : undefined}
        max={props.maxDateTime ? String(props.maxDateTime) : undefined}
        aria-label={labelText}
        aria-required={Boolean(props.required)}
        data-testid="builder-input-datetime"
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none"
        disabled
      />
      {(props.minDateTime || props.maxDateTime) && (
        <p className="text-xs text-gray-500">
          {props.minDateTime && props.maxDateTime
            ? `${String(props.minDateTime).replace('T', ' ')} to ${String(props.maxDateTime).replace('T', ' ')}`
            : props.minDateTime
              ? `From ${String(props.minDateTime).replace('T', ' ')}`
              : `Until ${String(props.maxDateTime).replace('T', ' ')}`}
        </p>
      )}
    </div>
  );
}

export function TextareaField({ node, onUpdateNode }: BaseFieldProps) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || 'Textarea');

  const handleLabelChange = (value: string) => {
    onUpdateNode?.(node.id, { label: value });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <InlineEdit
          value={labelText}
          onChange={handleLabelChange}
          as="label"
          className="text-sm font-medium"
          placeholder="Textarea"
          disabled={!onUpdateNode}
        />
        {Boolean(props.required) && (
          <span className="text-red-600 ml-0.5" aria-label="required">
            *
          </span>
        )}
      </div>
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
      <p className="text-xs text-gray-500">Max 1000 characters</p>
    </div>
  );
}

export function FileField({ node, onUpdateNode }: BaseFieldProps) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || 'File Upload');
  const isMultiple = Boolean(props.multiple);

  const handleLabelChange = (value: string) => {
    onUpdateNode?.(node.id, { label: value });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <InlineEdit
          value={labelText}
          onChange={handleLabelChange}
          as="label"
          className="text-sm font-medium"
          placeholder="File Upload"
          disabled={!onUpdateNode}
        />
        {Boolean(props.required) && (
          <span className="text-red-600 ml-0.5" aria-label="required">
            *
          </span>
        )}
      </div>
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
