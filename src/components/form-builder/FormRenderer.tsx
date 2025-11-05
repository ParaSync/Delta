import { useState } from 'react';
import { toast } from '../../hooks/use-toast';
import { getRendererFieldComponent } from './components/renderer';
import type { Node } from '../../types/formBuilder';

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
    console.log('Form submitted:', allData);
    toast({
      title: 'Form submitted successfully!',
      description: 'Check console for form data.',
      type: 'success'
    });
  };

  const handleReset = () => {
    setValues({});
    setTableData({});
    setErrors({});
    toast({
      title: 'Form reset',
      description: 'All fields have been cleared.',
      type: 'info'
    });
  };

  const renderNode = (node: Node): React.ReactNode => {
    // Use node.id as the unique field key to ensure each field maintains independent state
    const fieldKey = (node.props.fieldKey as string) || node.id;
    const error = errors[fieldKey];
    const currentValue = values[fieldKey] ?? tableData[fieldKey];

    // Get the appropriate field component from the registry
    const FieldComponent = getRendererFieldComponent(node.type);

    // Special handling for table field - needs additional handlers
    if (node.type === 'table') {
      const TableComponent = FieldComponent as unknown as React.FC<Record<string, unknown>>;
      return (
        <TableComponent
          node={node}
          value={tableData[fieldKey]}
          error={error}
          onChange={(val: unknown) => updateValue(fieldKey, val)}
          onAddRow={() => addTableRow(fieldKey)}
          onRemoveRow={(rowIndex: number) => removeTableRow(fieldKey, rowIndex)}
          onUpdateCell={(rowIndex: number, colKey: string, value: unknown) => 
            updateTableCell(fieldKey, rowIndex, colKey, value)
          }
        />
      );
    }

    // Special handling for submit button - needs type="submit"
    if (node.type === 'submit') {
      return <FieldComponent node={node} value={currentValue} error={error} />;
    }

    // Special handling for reset button - needs click handler
    if (node.type === 'reset') {
      const ResetComponent = FieldComponent as unknown as React.FC<Record<string, unknown>>;
      return <ResetComponent node={node} value={currentValue} error={error} onClick={handleReset} />;
    }

    // Standard interactive field with value/error/onChange
    return (
      <FieldComponent
        node={node}
        value={currentValue}
        error={error}
        onChange={(val) => updateValue(fieldKey, val)}
      />
    );
  };

  return (
    <div 
      className="max-w-4xl mx-auto p-8"
      role="main"
      aria-label="Form preview"
      data-testid="form-renderer"
    >
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 
          className="text-3xl font-bold mb-6"
          role="heading"
          aria-level={1}
        >
          {title}
        </h1>
        
        <form 
          onSubmit={handleSubmit}
          aria-label={`${title} form`}
          data-testid="form-renderer-form"
          className="space-y-6"
        >
          {visibleNodes.map((node) => (
            <div 
              key={node.id}
              role="group"
              aria-label={`${node.type} field`}
              data-testid={`form-field-${node.type}-${node.id}`}
            >
              {renderNode(node)}
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}

export default FormRenderer;
