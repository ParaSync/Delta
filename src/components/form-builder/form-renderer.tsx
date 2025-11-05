/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: remove the above
// Form Renderer for Preview Mode

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Node } from '@/types/form-builder';
import { validateFormData } from '@/utils/form-builder';

interface FormRendererProps {
  nodes: Node[];
  title: string;
}

export const FormRenderer: React.FC<FormRendererProps> = ({ nodes, title }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  const { toast } = useToast();

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const addTableRow = (tableKey: string, columns: any[]) => {
    const newRow: Record<string, any> = {};
    columns.forEach((col) => {
      newRow[col.key] = '';
    });

    setTableData((prev) => ({
      ...prev,
      [tableKey]: [...(prev[tableKey] || []), newRow],
    }));
  };

  const removeTableRow = (tableKey: string, index: number) => {
    setTableData((prev) => ({
      ...prev,
      [tableKey]: (prev[tableKey] || []).filter((_, i) => i !== index),
    }));
  };

  const updateTableCell = (tableKey: string, rowIndex: number, cellKey: string, value: any) => {
    setTableData((prev) => ({
      ...prev,
      [tableKey]: (prev[tableKey] || []).map((row, i) =>
        i === rowIndex ? { ...row, [cellKey]: value } : row
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine form data with table data
    const allData = { ...formData, ...tableData };

    // Validate form
    const validationErrors = validateFormData(allData, nodes);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors and try again.',
        type: 'error',
      });
      return;
    }

    // Mock submission
    toast({
      title: 'Form Submitted Successfully!',
      description: 'Your form has been submitted. Response ID: MOCK-12345',
    });

    console.log('Form Data:', allData);
  };

  const handleReset = () => {
    setFormData({});
    setTableData({});
    setErrors({});
    toast({
      title: 'Form Reset',
      description: 'All form data has been cleared.',
    });
  };

  const renderElement = (node: Node): React.ReactNode => {
    const { props } = node;
    const hasError = node.key && errors[node.key];

    switch (node.type) {
      case 'h1':
        return <h1 className="text-3xl font-bold mb-4">{props.text}</h1>;

      case 'h2':
        return <h2 className="text-2xl font-bold mb-3">{props.text}</h2>;

      case 'h3':
        return <h3 className="text-xl font-bold mb-2">{props.text}</h3>;

      case 'paragraph':
        return <p className="text-base mb-4">{props.text}</p>;

      case 'help':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>{props.text}</span>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-2 mb-4">
            <Label htmlFor={node.key}>
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={node.key}
              type="text"
              placeholder={props.placeholder}
              value={formData[node.key || ''] || ''}
              onChange={(e) => updateFormData(node.key || '', e.target.value)}
              readOnly={props.readonly}
              className={hasError ? 'border-destructive' : ''}
            />
            {hasError && <p className="text-sm text-destructive">{errors[node.key || '']}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2 mb-4">
            <Label htmlFor={node.key}>
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={node.key}
              placeholder={props.placeholder}
              rows={props.rows || 3}
              value={formData[node.key || ''] || ''}
              onChange={(e) => updateFormData(node.key || '', e.target.value)}
              readOnly={props.readonly}
              className={hasError ? 'border-destructive' : ''}
            />
            {hasError && <p className="text-sm text-destructive">{errors[node.key || '']}</p>}
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2 mb-4">
            <Label htmlFor={node.key}>
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={node.key}
              type="number"
              placeholder={props.placeholder}
              min={props.min}
              max={props.max}
              step={props.step}
              value={formData[node.key || ''] || ''}
              onChange={(e) => updateFormData(node.key || '', e.target.value)}
              readOnly={props.readonly}
              className={hasError ? 'border-destructive' : ''}
            />
            {hasError && <p className="text-sm text-destructive">{errors[node.key || '']}</p>}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2 mb-4">
            <Label htmlFor={node.key}>
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </Label>
            <select
              id={node.key}
              value={formData[node.key || ''] || ''}
              onChange={(e) => updateFormData(node.key || '', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md bg-background ${hasError ? 'border-destructive' : 'border-input'}`}
            >
              <option value="">Select an option...</option>
              {props.options?.map((option: any, index: number) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && <p className="text-sm text-destructive">{errors[node.key || '']}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id={node.key}
              checked={formData[node.key || ''] || false}
              onCheckedChange={(checked) => updateFormData(node.key || '', checked)}
            />
            <Label htmlFor={node.key}>{props.label}</Label>
            {hasError && <p className="text-sm text-destructive ml-6">{errors[node.key || '']}</p>}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2 mb-4">
            <Label>
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="space-y-2">
              {props.options?.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${node.key}-${index}`}
                    name={node.key}
                    value={option.value}
                    checked={formData[node.key || ''] === option.value}
                    onChange={(e) => updateFormData(node.key || '', e.target.value)}
                    className="border-input"
                  />
                  <Label htmlFor={`${node.key}-${index}`}>{option.label}</Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-sm text-destructive">{errors[node.key || '']}</p>}
          </div>
        );

      case 'table': {
        const tableRows = tableData[node.key || ''] || [];
        return (
          <div className="space-y-4 mb-6">
            <Label>
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </Label>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    {props.columns?.map((col: any, index: number) => (
                      <th key={index} className="px-4 py-2 text-left font-medium">
                        {col.label}
                      </th>
                    ))}
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row: any, rowIndex: number) => (
                    <tr key={rowIndex} className="border-t">
                      {props.columns?.map((col: any, colIndex: number) => (
                        <td key={colIndex} className="px-4 py-2">
                          <Input
                            type={col.type === 'number' ? 'number' : 'text'}
                            value={row[col.key] || ''}
                            onChange={(e) =>
                              updateTableCell(node.key || '', rowIndex, col.key, e.target.value)
                            }
                            className="border-0 shadow-none p-0 h-auto"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTableRow(node.key || '', rowIndex)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addTableRow(node.key || '', props.columns || [])}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </div>
        );
      }

      case 'divider':
        return <Separator className="my-6" />;

      case 'columns2':
        return (
          <div className="grid grid-cols-2 gap-6 mb-6">
            {node.children?.map((child, index) => (
              <div key={child.id}>{renderElement(child)}</div>
            )) || (
              <>
                <div></div>
                <div></div>
              </>
            )}
          </div>
        );

      case 'group':
        return (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{props.title}</CardTitle>
              {props.description && <p className="text-muted-foreground">{props.description}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              {node.children?.map((child) => renderElement(child)) || (
                <p className="text-muted-foreground text-center py-4">No content</p>
              )}
            </CardContent>
          </Card>
        );

      case 'image':
        return (
          <div className="mb-6">
            {props.src ? (
              <img src={props.src} alt={props.alt} className="max-w-full h-auto rounded-lg" />
            ) : (
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Image placeholder</span>
              </div>
            )}
          </div>
        );

      case 'submit':
        return (
          <Button type="submit" className="mr-2">
            {props.label}
          </Button>
        );

      case 'reset':
        return (
          <Button type="button" variant="secondary" onClick={handleReset}>
            {props.label}
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">Preview mode - test your form functionality</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {nodes.map((node) => (
          <div key={node.id}>{renderElement(node)}</div>
        ))}

        {nodes.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No form elements to preview</p>
          </div>
        )}
      </form>
    </div>
  );
};
