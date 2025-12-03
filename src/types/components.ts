// TODO: Sync with frontend's schemas for the various component types
// TODO: once they implement them. For now these would act as placeholders

export type ComponentType = 'image' | 'label' | 'input' | 'table';

export type HTMLInputType =
  | 'text'
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'time'
  | 'url'
  | 'week';

export interface ComponentProperties {
  name: string;
  type: string;
}

export interface ImageProperties extends ComponentProperties {
  image: {
    name?: string;
    data?: Blob;
    placeholder?: string;
    location?: string; // will be set by backend
  };
}

export interface LabelProperties extends ComponentProperties {
  label: {
    color?: string;
    backgroundColor?: string;
    fontFamily?: string;
    fontSize?: string | number;
    fontStyle?: 'italic';
    fontWeight?: number | 'bold';
    textDecoration?: 'underline' | 'none';
    textDecorationColor?: string;
  };
}

export interface InputProperties extends ComponentProperties {
  input: {
    type: HTMLInputType;
    placeholder?: string;
    value?: string;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    size?: number;
    multiple?: boolean;
    pattern?: string;
    min?: string;
    max?: string;
    step?: number;
    height?: number;
    width?: number;
    autocomplete?: string; // on, off
  };
}

export interface TableProperties extends ComponentProperties {
  table: {
    rows?: number;
    maxRows?: number;
    minRows?: number;
    columns: [properties: InputProperties];
  };
}
/* eslint-disable */
export type BackendNode = {
  type: string;
  name: string;
  order: number;
  properties: any;
};
 
// ! These type guards were implemented by Copilot.

export function isImageProperties(
  properties: ComponentProperties | undefined | unknown
): properties is ImageProperties {
  if (typeof properties !== 'object' || properties === null) return false;
  const obj = properties as Record<string, unknown>;
  const image = obj.image;
  if (typeof image !== 'object' || image === null) return false;
  const img = image as Record<string, unknown>;
  // require at least one distinguishing field to be the expected primitive
  return (
    typeof img.name === 'string' ||
    typeof img.location === 'string' ||
    typeof img.placeholder === 'string' ||
    img.data !== undefined
  );
}

export function isLabelProperties(
  properties: ComponentProperties | undefined | unknown
): properties is LabelProperties {
  if (typeof properties !== 'object' || properties === null) return false;
  const obj = properties as Record<string, unknown>;
  const label = obj.label;
  if (typeof label !== 'object' || label === null) return false;
  const lbl = label as Record<string, unknown>;
  // check at least one expected label field has the right primitive type
  return (
    typeof lbl.color === 'string' ||
    typeof lbl.backgroundColor === 'string' ||
    typeof lbl.fontFamily === 'string' ||
    typeof lbl.fontSize === 'string' ||
    typeof lbl.fontSize === 'number'
  );
}

export function isInputProperties(
  properties: ComponentProperties | undefined | unknown
): properties is InputProperties {
  if (typeof properties !== 'object' || properties === null) return false;
  const obj = properties as Record<string, unknown>;
  const input = obj.input;
  if (typeof input !== 'object' || input === null) return false;
  const inp = input as Record<string, unknown>;
  // ensure there is at least a type string (HTMLInputType) or a placeholder/value
  return (
    typeof inp.type === 'string' ||
    typeof inp.placeholder === 'string' ||
    typeof inp.value === 'string'
  );
}

export function isTableProperties(
  properties: ComponentProperties | undefined | unknown
): properties is TableProperties {
  if (typeof properties !== 'object' || properties === null) return false;
  const obj = properties as Record<string, unknown>;
  const table = obj.table;
  if (typeof table !== 'object' || table === null) return false;
  const tbl = table as Record<string, unknown>;
  if (!Array.isArray(tbl.columns)) return false;
  // ensure columns contain objects resembling ComponentProperties (name/type)
  // note: technically these should be InputProperties, but InputProperties extend ComponentProperties
  const cols = tbl.columns as unknown[];
  if (cols.length === 0) return true; // empty columns still OK
  const first = cols[0];
  if (typeof first !== 'object' || first === null) return false;
  const col0 = first as Record<string, unknown>;
  return typeof col0.name === 'string' && typeof col0.type === 'string';
}
