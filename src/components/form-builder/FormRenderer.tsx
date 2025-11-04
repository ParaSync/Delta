// Form Renderer - Preview mode with full functionality
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Node } from '../../types/formBuilder';
import { toReactString } from '../../utils/formBuilder';

type FormRendererProps = {
  nodes: Node[];
  title: string;
}

type FormValues = Record<string, unknown>;
type TableData = Record<string, Array<Record<string, unknown>>>;
type ValidationErrors = Record<string, string>;

function FormRenderer({ nodes, title }: FormRendererProps) {
  const [values, setValues] = useState<FormValues>({});
  const [tableData, setTableData] = useState<TableData>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Filter nodes to only show those visible in preview
  const visibleNodes = nodes.filter(node => node.props.visibleInPreview !== false);

  const updateValue = (fieldKey: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [fieldKey]: value }));
    // Clear error when user edits
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const addTableRow = (fieldKey: string) => {
    setTableData((prev) => ({
      ...prev,
      [fieldKey]: [...(prev[fieldKey] || []), {}],
    }));
  };

  const removeTableRow = (fieldKey: string, index: number) => {
    setTableData((prev) => ({
      ...prev,
      [fieldKey]: (prev[fieldKey] || []).filter((_, i) => i !== index),
    }));
  };

  const updateTableCell = (fieldKey: string, rowIndex: number, colKey: string, value: unknown) => {
    setTableData((prev) => {
      const rows = [...(prev[fieldKey] || [])];
      rows[rowIndex] = { ...rows[rowIndex], [colKey]: value };
      return { ...prev, [fieldKey]: rows };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Merge table data into values
    const allData = { ...values };
    Object.keys(tableData).forEach((key) => {
      allData[key] = tableData[key];
    });

    // Simple validation - just log for now
    setErrors({});
    setSubmitted(true);
    console.log('Form submitted:', allData);
    alert('Form submitted successfully! Check console for data.');
  };

  const handleReset = () => {
    setValues({});
    setTableData({});
    setErrors({});
    setSubmitted(false);
  };

  const renderNode = (node: Node): React.ReactNode => {
    // Use node.id as the unique field key to ensure each field maintains independent state
    const fieldKey = (node.props.fieldKey as string) || node.id;
    const error = errors[fieldKey];

    switch (node.type) {
      case 'h1':
        return <h1 className="text-4xl font-bold mb-4">{String(node.props.text || '')}</h1>;
      
      case 'h2':
        return <h2 className="text-3xl font-bold mb-3">{String(node.props.text || '')}</h2>;
      
      case 'h3':
        return <h3 className="text-2xl font-bold mb-2">{String(node.props.text || '')}</h3>;
      
      case 'paragraph':
        return <p className="mb-4 text-gray-700">{String(node.props.text || '')}</p>;
      
      case 'help':
        return <p className="mb-3 text-sm text-gray-500 italic">{String(node.props.text || '')}</p>;
      
      case 'text':
        return (
          <div className="mb-4">
            {node.props.label ? <label className="block font-medium mb-1">{toReactString(node.props.label)}</label> : null}
            <input
              type="text"
              value={String(values[fieldKey] || '')}
              onChange={(e) => updateValue(fieldKey, e.target.value)}
              placeholder={String(node.props.placeholder || '')}
              required={Boolean(node.props.required)}
              readOnly={Boolean(node.props.readonly)}
              className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      
      case 'textarea':
        return (
          <div className="mb-4">
            {node.props.label ? <label className="block font-medium mb-1">{toReactString(node.props.label)}</label> : null}
            <textarea
              value={String(values[fieldKey] || '')}
              onChange={(e) => updateValue(fieldKey, e.target.value)}
              placeholder={String(node.props.placeholder || '')}
              required={Boolean(node.props.required)}
              readOnly={Boolean(node.props.readonly)}
              rows={Number(node.props.rows) || 3}
              className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      
      case 'number':
        return (
          <div className="mb-4">
            {node.props.label ? <label className="block font-medium mb-1">{toReactString(node.props.label)}</label> : null}
            <input
              type="number"
              value={values[fieldKey] !== undefined ? String(values[fieldKey]) : ''}
              onChange={(e) => updateValue(fieldKey, e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder={String(node.props.placeholder || '')}
              required={Boolean(node.props.required)}
              readOnly={Boolean(node.props.readonly)}
              min={node.props.min !== undefined ? Number(node.props.min) : undefined}
              max={node.props.max !== undefined ? Number(node.props.max) : undefined}
              step={Number(node.props.step) || 1}
              className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      
      case 'date':
      case 'time':
      case 'datetime':
        return (
          <div className="mb-4">
            {node.props.label ? <label className="block font-medium mb-1">{toReactString(node.props.label)}</label> : null}
            <input
              type={node.type === 'datetime' ? 'datetime-local' : node.type}
              value={String(values[fieldKey] || '')}
              onChange={(e) => updateValue(fieldKey, e.target.value)}
              required={Boolean(node.props.required)}
              readOnly={Boolean(node.props.readonly)}
              className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      
      case 'select':
        return (
          <div className="mb-4">
            {node.props.label ? <label className="block font-medium mb-1">{toReactString(node.props.label)}</label> : null}
            <select
              value={String(values[fieldKey] || '')}
              onChange={(e) => updateValue(fieldKey, e.target.value)}
              required={Boolean(node.props.required)}
              className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">-- Select --</option>
              {((node.props.options as Array<{ value: string; label: string }>) || []).map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      
      case 'multiselect':
        return (
          <div className="mb-4">
            {node.props.label ? <label className="block font-medium mb-2">{toReactString(node.props.label)} {Boolean(node.props.required) && <span className="text-red-600">*</span>}</label> : null}
            <div className={`border rounded-md p-3 space-y-2 ${error ? 'border-red-500' : 'border-gray-300'}`}>
              {((node.props.options as Array<{ value: string; label: string }>) || []).map((opt) => {
                const currentValues = Array.isArray(values[fieldKey]) ? values[fieldKey] as string[] : [];
                const isChecked = currentValues.includes(opt.value);
                
                return (
                  <div key={opt.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`${fieldKey}-${opt.value}`}
                      checked={isChecked}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...currentValues, opt.value]
                          : currentValues.filter((v) => v !== opt.value);
                        updateValue(fieldKey, newValues);
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`${fieldKey}-${opt.value}`} className="text-sm cursor-pointer">
                      {opt.label}
                    </label>
                  </div>
                );
              })}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      
      case 'radio':
        return (
          <div className="mb-4">
            {node.props.label ? <label className="block font-medium mb-2">{toReactString(node.props.label)}</label> : null}
            <div className="space-y-2">
              {((node.props.options as Array<{ value: string; label: string }>) || []).map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={fieldKey}
                    value={opt.value}
                    checked={values[fieldKey] === opt.value}
                    onChange={(e) => updateValue(fieldKey, e.target.value)}
                    required={Boolean(node.props.required)}
                    className="rounded-full"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(values[fieldKey])}
                onChange={(e) => updateValue(fieldKey, e.target.checked)}
                required={Boolean(node.props.required)}
                className="rounded"
              />
              <span className="font-medium">{String(node.props.label || '')}</span>
            </label>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      
      case 'file':
        return (
          <div className="mb-4">
            {node.props.label ? <label className="block font-medium mb-1">{toReactString(node.props.label)}</label> : null}
            <input
              type="file"
              onChange={(e) => updateValue(fieldKey, e.target.files)}
              accept={String(node.props.accept || '*/*')}
              multiple={Boolean(node.props.multiple)}
              required={Boolean(node.props.required)}
              className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-500' : 'border-gray-300'}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      
      case 'table': {
        const columns = (node.props.columns as Array<{ key: string; label: string; type: string }>) || [];
        const rows = tableData[fieldKey] || [];
        const maxRows = Number(node.props.maxRows) || 5;
        const canAddRow = rows.length < maxRows;
        
        return (
          <div className="mb-4">
            {node.props.label ? <label className="block font-medium mb-2">{toReactString(node.props.label)}</label> : null}
            <div className="overflow-x-auto border border-gray-300 rounded-md">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key} className="px-4 py-2 text-left text-sm font-medium">{col.label}</th>
                    ))}
                    <th className="px-4 py-2 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-t">
                      {columns.map((col) => (
                        <td key={col.key} className="px-4 py-2">
                          <input
                            type={col.type}
                            value={String(row[col.key] || '')}
                            onChange={(e) => updateTableCell(fieldKey, rowIndex, col.key, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </td>
                      ))}
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeTableRow(fieldKey, rowIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => addTableRow(fieldKey)}
              disabled={!canAddRow}
              className={`mt-2 flex items-center gap-2 px-3 py-2 text-sm border rounded-md ${
                canAddRow 
                  ? 'border-gray-300 hover:bg-gray-50' 
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="h-4 w-4" />
              Add Row ({rows.length}/{maxRows})
            </button>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        );
      }
      
      case 'divider':
        return <hr className="my-6 border-gray-300" />;
      
      case 'pagebreak':
        return <div className="my-8 border-t-4 border-gray-400 pt-8" />;
      
      case 'image':
        return (
          <div className="mb-4">
            {node.props.src ? (
              <img
                src={String(node.props.src)}
                alt={String(node.props.alt || '')}
                className="max-w-full h-auto rounded-md"
                style={{ objectFit: String(node.props.objectFit || 'cover') as React.CSSProperties['objectFit'] }}
              />
            ) : (
              <div className="h-48 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-400">No image URL set</span>
              </div>
            )}
          </div>
        );
      
      case 'submit':
        return (
          <button
            type="submit"
            className={`px-8 py-2 rounded-xl font-bold text-white ${node.props.variant === 'secondary' ? 'bg-gray-600' : 'bg-primary'}`}
          >
            {String(node.props.label || 'Submit')}
          </button>
        );
      
      case 'reset':
        return (
          <button
            type="reset"
            onClick={handleReset}
            className="px-8 py-2 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            {String(node.props.label || 'Reset')}
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {visibleNodes.map((node) => (
            <div key={node.id}>{renderNode(node)}</div>
          ))}
        </form>
      </div>
    </div>
  );
}

export default FormRenderer;

