/**
 * Selection components (select, multiselect, radio, checkbox) for FormElement
 */

import type { BaseFieldProps, FieldOption } from '../types';
import { toReactString } from '../../../../utils/formBuilder';

export function SelectField({ node }: BaseFieldProps) {
  const { props } = node;
  const options = (props.options as FieldOption[]) || [];
  const fieldId = `builder-field-${node.id}`;
  const labelText = toReactString(props.label || 'Select Field');

  return (
    <div className="space-y-2">
      <label 
        htmlFor={fieldId}
        className="text-sm font-medium block"
      >
        {labelText}
        {Boolean(props.required) && <span className="text-red-600" aria-label="required">*</span>}
      </label>
      <select 
        id={fieldId}
        aria-label={labelText}
        aria-required={Boolean(props.required)}
        data-testid="builder-select"
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none" 
        disabled
      >
        <option value="">Select an option...</option>
        {options.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function MultiselectField({ node }: BaseFieldProps) {
  const { props } = node;
  const options = (props.options as FieldOption[]) || [];
  const groupId = `builder-group-${node.id}`;
  const labelText = toReactString(props.label || 'Multi-select Field');

  return (
    <div className="space-y-2">
      <label 
        id={groupId}
        className="text-sm font-medium block"
      >
        {labelText}
        {Boolean(props.required) && <span className="text-red-600" aria-label="required">*</span>}
      </label>
      <div 
        role="group"
        aria-labelledby={groupId}
        aria-required={Boolean(props.required)}
        data-testid="builder-multiselect"
        className="border border-gray-300 rounded-md p-3 space-y-2 bg-white"
      >
        {options.map((opt, i) => {
          const optionId = `${node.id}-option-${i}`;
          
          return (
            <div key={i} className="flex items-center gap-2">
              <input 
                id={optionId}
                type="checkbox" 
                aria-checked="false"
                data-testid={`builder-multiselect-option-${opt.value}`}
                className="rounded border-gray-300 pointer-events-none" 
                disabled 
              />
              <label htmlFor={optionId} className="text-sm">{opt.label}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RadioField({ node }: BaseFieldProps) {
  const { props } = node;
  const options = (props.options as FieldOption[]) || [];
  const groupId = `builder-group-${node.id}`;
  const labelText = toReactString(props.label || 'Radio Group');

  return (
    <div className="space-y-2">
      <label 
        id={groupId}
        className="text-sm font-medium block"
      >
        {labelText}
        {Boolean(props.required) && <span className="text-red-600" aria-label="required">*</span>}
      </label>
      <div 
        role="radiogroup"
        aria-labelledby={groupId}
        aria-required={Boolean(props.required)}
        data-testid="builder-radio-group"
        className="space-y-2"
      >
        {options.map((opt, i) => {
          const optionId = `${node.id}-option-${i}`;
          
          return (
            <div key={i} className="flex items-center gap-2">
              <input 
                id={optionId}
                type="radio" 
                name={node.id} 
                value={opt.value}
                aria-checked="false"
                data-testid={`builder-radio-option-${opt.value}`}
                className="pointer-events-none" 
                disabled 
              />
              <label htmlFor={optionId} className="text-sm">{opt.label}</label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CheckboxField({ node }: BaseFieldProps) {
  const { props } = node;
  const fieldId = `builder-field-${node.id}`;
  const labelText = String(props.label || 'Checkbox Field');

  return (
    <div className="flex items-center gap-2">
      <input 
        id={fieldId}
        type="checkbox"
        aria-checked="false"
        aria-label={labelText}
        data-testid="builder-checkbox"
        className="rounded border-gray-300 pointer-events-none" 
        disabled 
      />
      <label htmlFor={fieldId} className="text-sm font-medium">{labelText}</label>
    </div>
  );
}
