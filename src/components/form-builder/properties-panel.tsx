/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: remove the above

// Properties Panel for Form Builder

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { Node } from '@/types/form-builder';
import { generateFieldKey } from '@/utils/form-builder';

interface PropertiesPanelProps {
  selectedNode?: Node;
  onUpdateNode: (nodeId: string, props: Record<string, any>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onUpdateNode }) => {
  if (!selectedNode) {
    return (
      <div className="w-80 bg-card border-l border-border p-4">
        <div className="text-center text-muted-foreground py-8">
          <h3 className="font-medium mb-2">No Element Selected</h3>
          <p className="text-sm">Select an element on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  const updateProps = (updates: Record<string, any>) => {
    onUpdateNode(selectedNode.id, updates);
  };

  const updateLabel = (label: string) => {
    const updates: Record<string, any> = { label };

    // Auto-generate field key for input fields
    if (
      selectedNode.key &&
      [
        'text',
        'textarea',
        'number',
        'date',
        'time',
        'datetime',
        'select',
        'multiselect',
        'radio',
        'checkbox',
        'file',
        'table',
      ].includes(selectedNode.type)
    ) {
      updates.key = generateFieldKey(label);
    }

    updateProps(updates);
  };

  const addOption = () => {
    const currentOptions = selectedNode.props.options || [];
    const newOption = {
      value: `option${(currentOptions as unknown[]).length + 1}`,
      label: `Option ${(currentOptions as unknown[]).length + 1}`,
    };
    updateProps({ options: [...(currentOptions as unknown[]), newOption] });
  };

  const removeOption = (index: number) => {
    const currentOptions = selectedNode.props.options || [];
    updateProps({ options: currentOptions.filter((_: any, i: number) => i !== index) });
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const currentOptions = [...(selectedNode.props.options || [])];
    currentOptions[index] = { ...currentOptions[index], [field]: value };
    updateProps({ options: currentOptions });
  };

  const renderCommonProperties = () => (
    <>
      <div className="space-y-4">
        <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
          Common Properties
        </h3>

        {/* Label/Text */}
        {(Object.prototype.hasOwnProperty.call(selectedNode.props, 'label') ||
          Object.prototype.hasOwnProperty.call(selectedNode.props, 'text')) && (
          <div className="space-y-2">
            <Label htmlFor="element-label">
              {Object.prototype.hasOwnProperty.call(selectedNode.props, 'label') ? 'Label' : 'Text'}
            </Label>
            <Input
              id="element-label"
              value={selectedNode.props.label || selectedNode.props.text || ''}
              onChange={(e) => {
                if (Object.prototype.hasOwnProperty.call(selectedNode.props, 'label')) {
                  updateLabel(e.target.value);
                } else {
                  updateProps({ text: e.target.value });
                }
              }}
              placeholder="Enter text..."
            />
          </div>
        )}

        {/* Field Key */}
        {selectedNode.key && (
          <div className="space-y-2">
            <Label htmlFor="field-key">Field Key</Label>
            <Input
              id="field-key"
              value={selectedNode.key}
              onChange={(e) => updateProps({ key: e.target.value })}
              placeholder="field_key"
            />
            <p className="text-xs text-muted-foreground">
              Used to identify this field in form data
            </p>
          </div>
        )}

        {/* Placeholder */}
        {Object.prototype.hasOwnProperty.call(selectedNode.props, 'placeholder') && (
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={selectedNode.props.placeholder || ''}
              onChange={(e) => updateProps({ placeholder: e.target.value })}
              placeholder="Enter placeholder..."
            />
          </div>
        )}

        {/* Required Toggle */}
        {[
          'text',
          'textarea',
          'number',
          'date',
          'time',
          'datetime',
          'select',
          'multiselect',
          'radio',
          'checkbox',
          'file',
        ].includes(selectedNode.type) && (
          <div className="flex items-center justify-between">
            <Label htmlFor="required">Required</Label>
            <Switch
              id="required"
              checked={selectedNode.props.required || false}
              onCheckedChange={(checked) => updateProps({ required: checked })}
            />
          </div>
        )}

        {/* Read-only Toggle */}
        {['text', 'textarea', 'number', 'date', 'time', 'datetime', 'select'].includes(
          selectedNode.type
        ) && (
          <div className="flex items-center justify-between">
            <Label htmlFor="readonly">Read-only</Label>
            <Switch
              id="readonly"
              checked={selectedNode.props.readonly || false}
              onCheckedChange={(checked) => updateProps({ readonly: checked })}
            />
          </div>
        )}
      </div>
    </>
  );

  const renderTypeSpecificProperties = () => {
    switch (selectedNode.type) {
      case 'textarea':
        return (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              Textarea Properties
            </h3>
            <div className="space-y-2">
              <Label htmlFor="rows">Rows</Label>
              <Input
                id="rows"
                type="number"
                value={selectedNode.props.rows || 3}
                onChange={(e) => updateProps({ rows: parseInt(e.target.value) || 3 })}
                min="1"
                max="20"
              />
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              Number Properties
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="min">Min Value</Label>
                <Input
                  id="min"
                  type="number"
                  value={selectedNode.props.min || ''}
                  onChange={(e) =>
                    updateProps({ min: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max Value</Label>
                <Input
                  id="max"
                  type="number"
                  value={selectedNode.props.max || ''}
                  onChange={(e) =>
                    updateProps({ max: e.target.value ? parseFloat(e.target.value) : undefined })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="step">Step</Label>
              <Input
                id="step"
                type="number"
                value={selectedNode.props.step || 1}
                onChange={(e) => updateProps({ step: parseFloat(e.target.value) || 1 })}
                min="0.01"
                step="0.01"
              />
            </div>
          </div>
        );

      case 'select':
      case 'multiselect':
      case 'radio':
        return (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              Options
            </h3>
            <div className="space-y-2">
              {(selectedNode.props.options || []).map((option: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Value"
                    value={option.value}
                    onChange={(e) => updateOption(index, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Label"
                    value={option.label}
                    onChange={(e) => updateOption(index, 'label', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeOption(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addOption} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              File Properties
            </h3>
            <div className="space-y-2">
              <Label htmlFor="accept">Accepted File Types</Label>
              <Input
                id="accept"
                value={selectedNode.props.accept || '*/*'}
                onChange={(e) => updateProps({ accept: e.target.value })}
                placeholder="e.g., .pdf,.doc,.docx or image/*"
              />
              <p className="text-xs text-muted-foreground">
                Specify file types or MIME types separated by commas
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="multiple">Allow Multiple Files</Label>
              <Switch
                id="multiple"
                checked={selectedNode.props.multiple || false}
                onCheckedChange={(checked) => updateProps({ multiple: checked })}
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              Image Properties
            </h3>
            <div className="space-y-2">
              <Label htmlFor="src">Image URL</Label>
              <Input
                id="src"
                value={selectedNode.props.src || ''}
                onChange={(e) => updateProps({ src: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={selectedNode.props.alt || ''}
                onChange={(e) => updateProps({ alt: e.target.value })}
                placeholder="Describe the image..."
              />
            </div>
          </div>
        );

      case 'group':
        return (
          <div className="space-y-4">
            <Separator />
            <h3 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
              Group Properties
            </h3>
            <div className="space-y-2">
              <Label htmlFor="title">Group Title</Label>
              <Input
                id="title"
                value={selectedNode.props.title || ''}
                onChange={(e) => updateProps({ title: e.target.value })}
                placeholder="Enter group title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={selectedNode.props.description || ''}
                onChange={(e) => updateProps({ description: e.target.value })}
                placeholder="Enter group description..."
                rows={2}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Properties</h2>
        <p className="text-sm text-muted-foreground">Configure the selected element</p>
      </div>

      <div className="space-y-6">
        {renderCommonProperties()}
        {renderTypeSpecificProperties()}
      </div>
    </div>
  );
};
