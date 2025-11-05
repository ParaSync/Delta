/**
 * Other components (table, image, buttons, layout) for FormRenderer
 */

import type { InteractiveFieldProps, TableColumn, TableFieldProps } from '../types';
import { toReactString } from '../../../../utils/formBuilder';
import { Plus, Trash2 } from 'lucide-react';

export function TableField({ node, value, error, onAddRow, onRemoveRow, onUpdateCell }: TableFieldProps) {
  const { props } = node;
  const columns = (props.columns as TableColumn[]) || [];
  const rows = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
  const maxRows = Number(props.maxRows) || Infinity;
  const labelText = props.label ? toReactString(props.label) : null;
  const tableId = `table-${node.id}`;
  const errorId = `error-${node.id}`;

  return (
    <div className="mb-6">
      {labelText && (
        <label 
          id={tableId}
          className="block font-medium mb-2"
        >
          {labelText}
          {Boolean(props.required) && <span className="text-red-600 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <div className={`border rounded-lg overflow-hidden ${error ? 'border-red-500' : 'border-gray-300'}`}>
        <table 
          className="w-full"
          role="table"
          aria-labelledby={labelText ? tableId : undefined}
          aria-label={!labelText ? 'data table' : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          data-testid="table"
        >
          <thead className="bg-gray-100">
            <tr role="row">
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  role="columnheader"
                  className="px-4 py-2 text-left text-sm font-medium"
                >
                  {col.label}
                </th>
              ))}
              <th role="columnheader" className="px-4 py-2 w-12">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} role="row" className="border-t">
                {columns.map((col, colIndex) => {
                  const cellId = `${node.id}-cell-${rowIndex}-${col.key}`;
                  
                  return (
                    <td key={colIndex} role="cell" className="px-4 py-2">
                      <input
                        id={cellId}
                        type="text"
                        value={String(row[col.key] || '')}
                        onChange={(e) => onUpdateCell?.(rowIndex, col.key, e.target.value)}
                        aria-label={`${col.label} for row ${rowIndex + 1}`}
                        data-testid={`table-cell-${rowIndex}-${col.key}`}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </td>
                  );
                })}
                <td role="cell" className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => onRemoveRow?.(rowIndex)}
                    aria-label={`Remove row ${rowIndex + 1}`}
                    data-testid={`table-remove-row-${rowIndex}`}
                    className="text-red-600 hover:text-red-800"
                    title="Remove row"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-3 border-t bg-gray-50">
          <button
            type="button"
            onClick={() => onAddRow?.()}
            disabled={rows.length >= maxRows}
            aria-label={`Add row to ${labelText || 'table'}${maxRows < Infinity ? ` (${rows.length} of ${maxRows})` : ''}`}
            aria-disabled={rows.length >= maxRows}
            data-testid="table-add-row"
            className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} aria-hidden="true" />
            Add Row {maxRows < Infinity && `(${rows.length}/${maxRows})`}
          </button>
        </div>
      </div>
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

export function ImageField({ node }: InteractiveFieldProps) {
  const { props } = node;
  const altText = String(props.alt || 'Image');
  const hasImage = Boolean(props.src);

  return (
    <div className="mb-4">
      {hasImage ? (
        <img
          src={String(props.src)}
          alt={altText}
          data-testid="image"
          className="max-w-full h-auto rounded"
          style={{ objectFit: String(props.objectFit || 'cover') as never }}
        />
      ) : (
        <div 
          className="h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300"
          role="img"
          aria-label="No image set"
          data-testid="image-placeholder"
        >
          <span className="text-gray-400" aria-hidden="true">No image set</span>
        </div>
      )}
    </div>
  );
}

export function SubmitButton({ node }: InteractiveFieldProps) {
  const { props } = node;
  const label = String(props.label || 'Submit');

  return (
    <button
      type="submit"
      aria-label={`Submit form: ${label}`}
      data-testid="submit-button"
      className={`px-8 py-2 rounded-xl font-bold text-white mb-4 ${
        props.variant === 'secondary' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-primary hover:bg-primary/90'
      }`}
    >
      {label}
    </button>
  );
}

export function ResetButton({ node, onClick }: InteractiveFieldProps) {
  const { props } = node;
  const label = String(props.label || 'Reset');

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Reset form: ${label}`}
      data-testid="reset-button"
      className="px-8 py-2 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 mb-4"
    >
      {label}
    </button>
  );
}

export function DividerField() {
  return (
    <hr 
      className="border-gray-300 my-4"
      role="separator"
      aria-orientation="horizontal"
      data-testid="divider"
    />
  );
}

export function PageBreakField() {
  return (
    <div 
      className="border-t-4 border-dashed border-gray-400 py-4 my-4 text-center"
      role="separator"
      aria-label="Page break"
      data-testid="page-break"
    >
      <span className="text-sm font-medium text-gray-500" aria-hidden="true">— Page Break —</span>
    </div>
  );
}
