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
    <BaseInputField node={node} type="text" defaultLabel="Text Field" onUpdateNode={onUpdateNode} />
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
  return (
    <BaseInputField node={node} type="date" defaultLabel="Date Field" onUpdateNode={onUpdateNode} />
  );
}

export function TimeField({ node, onUpdateNode }: BaseFieldProps) {
  return (
    <BaseInputField node={node} type="time" defaultLabel="Time Field" onUpdateNode={onUpdateNode} />
  );
}

export function DateTimeField({ node, onUpdateNode }: BaseFieldProps) {
  return (
    <BaseInputField
      node={node}
      type="datetime-local"
      defaultLabel="Date & Time Field"
      onUpdateNode={onUpdateNode}
    />
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
