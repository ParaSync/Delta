/**
 * Selection components (select, multiselect, radio, checkbox) for FormRenderer
 */

import type { InteractiveFieldProps, FieldOption } from '../types';
import { toReactString } from '../../../../utils/formBuilder';

export function SelectField({ node, value, error, onChange }: InteractiveFieldProps) {
  const { props } = node;
  const options = (props.options as FieldOption[]) || [];
  const labelText = props.label ? toReactString(props.label) : null;
  const fieldId = `field-${node.id}`;
  const errorId = `error-${node.id}`;

  return (
    <div className="mb-4">
      {labelText && (
        <label htmlFor={fieldId} className="block font-medium mb-1">
          {labelText}
          {Boolean(props.required) && (
            <span className="text-red-600 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <select
        id={fieldId}
        value={String(value || '')}
        onChange={(e) => onChange?.(e.target.value)}
        required={Boolean(props.required)}
        aria-label={labelText || 'select'}
        aria-required={Boolean(props.required)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        data-testid="select"
        className={`w-full px-3 py-2 border rounded-md ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

export function MultiselectField({ node, value, error, onChange }: InteractiveFieldProps) {
  const { props } = node;
  const options = (props.options as FieldOption[]) || [];
  const currentValues = Array.isArray(value) ? (value as string[]) : [];
  const labelText = props.label ? toReactString(props.label) : null;
  const groupId = `group-${node.id}`;
  const errorId = `error-${node.id}`;

  const handleToggle = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((v) => v !== optionValue);
    onChange?.(newValues);
  };

  return (
    <div className="mb-4">
      {labelText && (
        <label id={groupId} className="block font-medium mb-2">
          {labelText}
          {Boolean(props.required) && (
            <span className="text-red-600 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <div
        role="group"
        aria-labelledby={labelText ? groupId : undefined}
        aria-label={!labelText ? 'multiselect' : undefined}
        aria-required={Boolean(props.required)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        data-testid="multiselect"
        className={`border rounded-md p-3 space-y-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        {options.map((opt) => {
          const isChecked = currentValues.includes(opt.value);
          const fieldId = `${node.id}-${opt.value}`;

          return (
            <div key={opt.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={fieldId}
                checked={isChecked}
                onChange={(e) => handleToggle(opt.value, e.target.checked)}
                aria-checked={isChecked}
                data-testid={`multiselect-option-${opt.value}`}
                className="rounded border-gray-300"
              />
              <label htmlFor={fieldId} className="text-sm cursor-pointer">
                {opt.label}
              </label>
            </div>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

export function RadioField({ node, value, error, onChange }: InteractiveFieldProps) {
  const { props } = node;
  const options = (props.options as FieldOption[]) || [];
  const labelText = props.label ? toReactString(props.label) : null;
  const groupId = `group-${node.id}`;
  const errorId = `error-${node.id}`;

  return (
    <div className="mb-4">
      {labelText && (
        <label id={groupId} className="block font-medium mb-2">
          {labelText}
          {Boolean(props.required) && (
            <span className="text-red-600 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      <div
        role="radiogroup"
        aria-labelledby={labelText ? groupId : undefined}
        aria-label={!labelText ? 'radio group' : undefined}
        aria-required={Boolean(props.required)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        data-testid="radio-group"
        className="space-y-2"
      >
        {options.map((opt) => {
          const fieldId = `${node.id}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={fieldId}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                id={fieldId}
                name={node.id}
                value={opt.value}
                checked={value === opt.value}
                onChange={(e) => onChange?.(e.target.value)}
                required={Boolean(props.required)}
                aria-checked={value === opt.value}
                data-testid={`radio-option-${opt.value}`}
                className="rounded-full"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckboxField({ node, value, error, onChange }: InteractiveFieldProps) {
  const { props } = node;
  const options = (props.options as FieldOption[]) || [];
  const labelText = props.label ? toReactString(props.label) : null;
  const isSingleCheckbox = Boolean(props.isSingleCheckbox);
  const fieldId = `field-${node.id}`;
  const groupId = `group-${node.id}`;
  const errorId = `error-${node.id}`;

  // Single checkbox (synthesized option or legacy) - render as single toggle
  // Still sends array to backend for compatibility
  if (isSingleCheckbox && options.length === 1) {
    const singleOption = options[0];
    const currentValues = Array.isArray(value) ? (value as string[]) : [];
    const isChecked = currentValues.includes(singleOption.value);

    const handleToggle = (checked: boolean) => {
      onChange?.(checked ? [singleOption.value] : []);
    };

    return (
      <div className="mb-4">
        <label htmlFor={fieldId} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            id={fieldId}
            checked={isChecked}
            onChange={(e) => handleToggle(e.target.checked)}
            aria-checked={isChecked}
            aria-required={Boolean(props.required)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            data-testid="checkbox"
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">{singleOption.label}</span>
          {Boolean(props.required) && (
            <span className="text-red-600 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
        {error && (
          <p id={errorId} className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Multiple options - render as a group of checkboxes
  if (options.length > 0) {
    const currentValues = Array.isArray(value) ? (value as string[]) : [];

    const handleToggle = (optionValue: string, checked: boolean) => {
      const newValues = checked
        ? [...currentValues, optionValue]
        : currentValues.filter((v) => v !== optionValue);
      onChange?.(newValues);
    };

    return (
      <div className="mb-4">
        {labelText && (
          <label id={groupId} className="block font-medium mb-2">
            {labelText}
            {Boolean(props.required) && (
              <span className="text-red-600 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        <div
          role="group"
          aria-labelledby={labelText ? groupId : undefined}
          aria-label={!labelText ? 'checkbox group' : undefined}
          aria-required={Boolean(props.required)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          data-testid="checkbox-group"
          className={`space-y-2 ${error ? 'border border-red-500 rounded-md p-3' : ''}`}
        >
          {options.map((opt) => {
            const isChecked = currentValues.includes(opt.value);
            const optionId = `${node.id}-${opt.value}`;

            return (
              <div key={opt.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={optionId}
                  checked={isChecked}
                  onChange={(e) => handleToggle(opt.value, e.target.checked)}
                  aria-checked={isChecked}
                  data-testid={`checkbox-option-${opt.value}`}
                  className="rounded border-gray-300"
                />
                <label htmlFor={optionId} className="text-sm cursor-pointer">
                  {opt.label}
                </label>
              </div>
            );
          })}
        </div>
        {error && (
          <p id={errorId} className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Fallback: No options at all (shouldn't happen with new logic, but kept for safety)
  const displayLabel = labelText || 'Checkbox Field';
  const fallbackValue = displayLabel;
  const currentValues = Array.isArray(value) ? (value as string[]) : [];
  const isChecked = currentValues.includes(fallbackValue);

  return (
    <div className="mb-4">
      <label htmlFor={fieldId} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          id={fieldId}
          checked={isChecked}
          onChange={(e) => onChange?.(e.target.checked ? [fallbackValue] : [])}
          aria-checked={isChecked}
          aria-label={displayLabel}
          data-testid="checkbox"
          className="rounded border-gray-300"
        />
        <span className="text-sm font-medium">{displayLabel}</span>
        {Boolean(props.required) && (
          <span className="text-red-600 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      {error && (
        <p id={errorId} className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
