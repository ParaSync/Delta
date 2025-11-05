/**
 * Complex components (table, image, buttons, layout) for FormElement
 */

import type { BaseFieldProps, TableColumn } from '../types';
import { toReactString } from '../../../../utils/formBuilder';

export function TableField({ node }: BaseFieldProps) {
  const { props } = node;
  const columns = (props.columns as TableColumn[]) || [];
  const tableId = `builder-table-${node.id}`;
  const labelText = toReactString(props.label || 'Table');

  return (
    <div className="space-y-2">
      <label id={tableId} className="text-sm font-medium block">
        {labelText}
        {Boolean(props.required) && (
          <span className="text-red-600" aria-label="required">
            *
          </span>
        )}
      </label>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table
          className="w-full"
          role="table"
          aria-labelledby={tableId}
          data-testid="builder-table"
        >
          <thead className="bg-gray-100">
            <tr role="row">
              {columns.map((col, i) => (
                <th key={i} role="columnheader" className="px-4 py-2 text-left text-sm font-medium">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr role="row">
              {columns.map((col, i) => (
                <td key={i} role="cell" className="px-4 py-2 border-t">
                  <input
                    type="text"
                    aria-label={`${col.label} preview`}
                    data-testid={`builder-table-cell-${col.key}`}
                    className="w-full border-0 bg-transparent pointer-events-none"
                    disabled
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ImageField({ node }: BaseFieldProps) {
  const { props } = node;
  const altText = String(props.alt || 'Image');
  const hasImage = Boolean(props.src);

  return (
    <div className="border border-gray-300 rounded-lg p-4 text-center">
      {hasImage ? (
        <img
          src={String(props.src)}
          alt={altText}
          data-testid="builder-image"
          className="max-w-full h-auto mx-auto rounded"
          style={{ objectFit: String(props.objectFit || 'cover') as never }}
        />
      ) : (
        <div
          className="h-48 bg-gray-100 rounded-lg flex items-center justify-center"
          role="img"
          aria-label="Image placeholder"
          data-testid="builder-image-placeholder"
        >
          <span className="text-gray-400" aria-hidden="true">
            Image placeholder - Upload or set image URL in properties
          </span>
        </div>
      )}
    </div>
  );
}

export function SubmitButton({ node }: BaseFieldProps) {
  const { props } = node;
  const label = String(props.label || 'Submit');

  return (
    <button
      type="submit"
      aria-label={`Submit button: ${label}`}
      data-testid="builder-submit-button"
      className={`px-8 py-2 rounded-xl font-bold text-white ${
        props.variant === 'secondary' ? 'bg-gray-600' : 'bg-primary'
      }`}
    >
      {label}
    </button>
  );
}

export function ResetButton({ node }: BaseFieldProps) {
  const { props } = node;
  const label = String(props.label || 'Reset');

  return (
    <button
      type="button"
      aria-label={`Reset button: ${label}`}
      data-testid="builder-reset-button"
      className="px-8 py-2 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300"
    >
      {label}
    </button>
  );
}

export function DividerField() {
  return (
    <hr
      className="border-gray-300"
      role="separator"
      aria-orientation="horizontal"
      data-testid="builder-divider"
    />
  );
}

export function PageBreakField() {
  return (
    <div
      className="border-t-4 border-dashed border-gray-400 py-2 text-center"
      role="separator"
      aria-label="Page break"
      data-testid="builder-page-break"
    >
      <span className="text-sm font-medium text-gray-500" aria-hidden="true">
        — Page Break —
      </span>
    </div>
  );
}
