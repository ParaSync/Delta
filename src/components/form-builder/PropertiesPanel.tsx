import { Plus, Trash2 } from 'lucide-react';
import type { Node } from '../../types/formBuilder';

type PropertiesPanelProps = {
  selectedNode?: Node;
  onUpdateNode: (nodeId: string, props: Record<string, unknown>) => void;
};

function PropertiesPanel({ selectedNode, onUpdateNode }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div
        className="w-80 bg-white border-l border-gray-200 p-4"
        role="complementary"
        aria-label="Properties panel"
        data-testid="properties-panel-empty"
      >
        <div className="text-center text-gray-500 py-8" role="status">
          <h3 className="font-medium mb-2" role="heading" aria-level={3}>
            No Element Selected
          </h3>
          <p className="text-sm">Select an element on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  const updateProp = (key: string, value: unknown) => {
    onUpdateNode(selectedNode.id, { [key]: value });
  };

  const addOption = () => {
    const currentOptions =
      (selectedNode.props.options as Array<{ value: string; label: string }>) || [];
    const newOption = {
      value: `option${currentOptions.length + 1}`,
      label: `Option ${currentOptions.length + 1}`,
    };
    updateProp('options', [...currentOptions, newOption]);
  };

  const removeOption = (index: number) => {
    const currentOptions =
      (selectedNode.props.options as Array<{ value: string; label: string }>) || [];
    updateProp(
      'options',
      currentOptions.filter((_, i) => i !== index)
    );
  };

  const updateOption = (index: number, field: 'value' | 'label', value: string) => {
    const currentOptions = [
      ...((selectedNode.props.options as Array<{ value: string; label: string }>) || []),
    ];
    currentOptions[index] = { ...currentOptions[index], [field]: value };
    updateProp('options', currentOptions);
  };

  const addColumn = () => {
    const currentColumns =
      (selectedNode.props.columns as Array<{ key: string; label: string; type: string }>) || [];
    const newColumn = {
      key: `col${currentColumns.length + 1}`,
      label: `Column ${currentColumns.length + 1}`,
      type: 'text',
    };
    updateProp('columns', [...currentColumns, newColumn]);
  };

  const removeColumn = (index: number) => {
    const currentColumns =
      (selectedNode.props.columns as Array<{ key: string; label: string; type: string }>) || [];
    updateProp(
      'columns',
      currentColumns.filter((_, i) => i !== index)
    );
  };

  const updateColumn = (index: number, field: 'key' | 'label' | 'type', value: string) => {
    const currentColumns = [
      ...((selectedNode.props.columns as Array<{ key: string; label: string; type: string }>) ||
        []),
    ];
    currentColumns[index] = { ...currentColumns[index], [field]: value };
    updateProp('columns', currentColumns);
  };

  return (
    <div
      className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto"
      role="complementary"
      aria-label="Properties panel"
      data-testid="properties-panel"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-1" role="heading" aria-level={2}>
          Properties
        </h2>
        <p className="text-xs text-gray-500">
          Element: <span className="font-medium">{selectedNode.type}</span>
        </p>
      </div>

      <div className="space-y-3" role="form" aria-label={`${selectedNode.type} properties`}>
        {/* Label/Text property */}
        {(selectedNode.props.label !== undefined || selectedNode.props.text !== undefined) && (
          <div>
            <label
              htmlFor={`prop-label-${selectedNode.id}`}
              className="block text-xs font-medium mb-1"
            >
              {selectedNode.props.label !== undefined ? 'Label' : 'Text'}
            </label>
            {selectedNode.type === 'paragraph' ? (
              <textarea
                id={`prop-label-${selectedNode.id}`}
                value={String(selectedNode.props.text || '')}
                onChange={(e) => updateProp('text', e.target.value)}
                aria-label="Paragraph text content"
                data-testid="property-text"
                className="w-full px-2 py-2 text-sm border border-gray-300 rounded-md resize-none h-96"
                placeholder="Enter paragraph text..."
              />
            ) : (
              <input
                id={`prop-label-${selectedNode.id}`}
                type="text"
                value={String(selectedNode.props.label || selectedNode.props.text || '')}
                onChange={(e) =>
                  updateProp(
                    selectedNode.props.label !== undefined ? 'label' : 'text',
                    e.target.value
                  )
                }
                aria-label={selectedNode.props.label !== undefined ? 'Field label' : 'Text content'}
                data-testid="property-label"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
            )}
          </div>
        )}

        {/* Label property (for most components) */}
        {selectedNode.props.label !== undefined && (
          <div>
            <label
              htmlFor={`prop-placeholder-${selectedNode.id}`}
              className="block text-xs font-medium mb-1"
            >
              Placeholder
            </label>
            <input
              id={`prop-placeholder-${selectedNode.id}`}
              type="text"
              value={String(selectedNode.props.placeholder || '')}
              onChange={(e) => updateProp('placeholder', e.target.value)}
              aria-label="Placeholder text"
              data-testid="property-placeholder"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
        )}

        {/* Rows property (textarea) */}
        {selectedNode.type === 'textarea' && (
          <div>
            <label className="block text-xs font-medium mb-1">Rows</label>
            <input
              type="number"
              min="1"
              max="20"
              value={Number(selectedNode.props.rows) || 3}
              onChange={(e) => updateProp('rows', parseInt(e.target.value) || 3)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
            />
          </div>
        )}

        {/* Min/Max/Step properties (number) */}
        {selectedNode.type === 'number' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium mb-1">Min</label>
                <input
                  type="number"
                  value={selectedNode.props.min ? String(selectedNode.props.min) : ''}
                  onChange={(e) =>
                    updateProp('min', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Max</label>
                <input
                  type="number"
                  value={selectedNode.props.max ? String(selectedNode.props.max) : ''}
                  onChange={(e) =>
                    updateProp('max', e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Step</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={Number(selectedNode.props.step) || 1}
                onChange={(e) => updateProp('step', parseFloat(e.target.value) || 1)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}

        {/* File accept property */}
        {selectedNode.type === 'file' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1">Accepted File Types</label>
              <input
                type="text"
                value={String(selectedNode.props.accept || '*/*')}
                onChange={(e) => updateProp('accept', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                placeholder="e.g., .pdf,.doc or image/*"
              />
              <p className="text-xs text-gray-400 mt-0.5">Specify file types or MIME types</p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Allow Multiple Files</label>
              <input
                type="checkbox"
                checked={Boolean(selectedNode.props.multiple)}
                onChange={(e) => updateProp('multiple', e.target.checked)}
                className="rounded"
              />
            </div>
          </>
        )}

        {/* Image properties */}
        {selectedNode.type === 'image' && (
          <>
            <div>
              <label className="block text-xs font-medium mb-1">Image Source</label>
              <select
                value={(selectedNode.props.imageSourceType as string) || 'url'}
                onChange={(e) => {
                  const sourceType = e.target.value;
                  updateProp('imageSourceType', sourceType);
                  // Clear the other source when switching
                  if (sourceType === 'url') {
                    updateProp('uploadedImage', undefined);
                    updateProp('src', '');
                  } else {
                    updateProp('src', '');
                  }
                }}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md mb-2"
              >
                <option value="url">Image URL</option>
                <option value="upload">Upload Image</option>
              </select>

              {selectedNode.props.imageSourceType === 'upload' ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateProp('uploadedImage', reader.result as string);
                          updateProp('src', reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  />
                  {selectedNode.props.uploadedImage && (
                    <div className="mt-2">
                      <img
                        src={String(selectedNode.props.uploadedImage)}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded border"
                      />
                      <button
                        onClick={() => {
                          updateProp('uploadedImage', undefined);
                          updateProp('src', '');
                        }}
                        className="mt-1 text-xs text-red-600 hover:text-red-700"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <input
                  type="text"
                  value={String(selectedNode.props.src || '')}
                  onChange={(e) => updateProp('src', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Alt Text</label>
              <input
                type="text"
                value={String(selectedNode.props.alt || '')}
                onChange={(e) => updateProp('alt', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Object Fit</label>
              <select
                value={String(selectedNode.props.objectFit || 'cover')}
                onChange={(e) => updateProp('objectFit', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              >
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
                <option value="fill">Fill</option>
                <option value="none">None</option>
              </select>
            </div>
          </>
        )}

        {/* Options editor (select, multiselect, radio) */}
        {['select', 'multiselect', 'radio'].includes(selectedNode.type) && (
          <div role="group" aria-label="Options editor">
            <label
              id={`options-label-${selectedNode.id}`}
              className="block text-sm font-medium mb-2"
            >
              Options
            </label>
            <div
              className="space-y-2 max-h-48 overflow-y-auto pr-1"
              role="list"
              aria-labelledby={`options-label-${selectedNode.id}`}
            >
              {((selectedNode.props.options as Array<{ value: string; label: string }>) || []).map(
                (option, index) => (
                  <div key={index} className="flex gap-1 items-center" role="listitem">
                    <input
                      type="text"
                      placeholder="Value"
                      value={option.value}
                      onChange={(e) => updateOption(index, 'value', e.target.value)}
                      aria-label={`Option ${index + 1} value`}
                      data-testid={`option-value-${index}`}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={option.label}
                      onChange={(e) => updateOption(index, 'label', e.target.value)}
                      aria-label={`Option ${index + 1} label`}
                      data-testid={`option-label-${index}`}
                      className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-xs"
                    />
                    <button
                      onClick={() => removeOption(index)}
                      aria-label={`Remove option ${index + 1}`}
                      data-testid={`remove-option-${index}`}
                      className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )
              )}
            </div>
            <button
              onClick={addOption}
              aria-label="Add new option"
              data-testid="add-option"
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 mt-2"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Option
            </button>
          </div>
        )}

        {/* Table columns editor */}
        {selectedNode.type === 'table' && (
          <div role="group" aria-label="Table columns editor">
            <label
              id={`columns-label-${selectedNode.id}`}
              className="block text-sm font-medium mb-2"
            >
              Columns
            </label>
            <div
              className="space-y-2 max-h-48 overflow-y-auto pr-1"
              role="list"
              aria-labelledby={`columns-label-${selectedNode.id}`}
            >
              {(
                (selectedNode.props.columns as Array<{
                  key: string;
                  label: string;
                  type: string;
                }>) || []
              ).map((column, index) => (
                <div
                  key={index}
                  className="space-y-1.5 p-2 border border-gray-200 rounded"
                  role="listitem"
                >
                  <input
                    type="text"
                    placeholder="Key"
                    value={column.key}
                    onChange={(e) => updateColumn(index, 'key', e.target.value)}
                    aria-label={`Column ${index + 1} key`}
                    data-testid={`column-key-${index}`}
                    className="w-full min-w-0 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Label"
                    value={column.label}
                    onChange={(e) => updateColumn(index, 'label', e.target.value)}
                    aria-label={`Column ${index + 1} label`}
                    data-testid={`column-label-${index}`}
                    className="w-full min-w-0 px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                  <div className="flex gap-1 items-center">
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(index, 'type', e.target.value)}
                      aria-label={`Column ${index + 1} type`}
                      data-testid={`column-type-${index}`}
                      className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                    </select>
                    <button
                      onClick={() => removeColumn(index)}
                      aria-label={`Remove column ${index + 1}`}
                      data-testid={`remove-column-${index}`}
                      className="flex-shrink-0 p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={addColumn}
              aria-label="Add new column"
              data-testid="add-column"
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 mt-2"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Column
            </button>

            <div className="mt-3">
              <label
                htmlFor={`prop-maxrows-${selectedNode.id}`}
                className="block text-xs font-medium mb-1"
              >
                Max Rows
              </label>
              <input
                id={`prop-maxrows-${selectedNode.id}`}
                type="number"
                min="1"
                max="100"
                value={Number(selectedNode.props.maxRows) || 5}
                onChange={(e) => updateProp('maxRows', parseInt(e.target.value) || 5)}
                aria-label="Maximum rows"
                aria-describedby={`maxrows-help-${selectedNode.id}`}
                data-testid="property-maxrows"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
              <p id={`maxrows-help-${selectedNode.id}`} className="text-xs text-gray-400 mt-0.5">
                Maximum number of rows users can add
              </p>
            </div>
          </div>
        )}

        {/* Required toggle */}
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
          'table',
        ].includes(selectedNode.type) && (
          <div className="flex items-center justify-between pt-2 border-t">
            <label htmlFor={`prop-required-${selectedNode.id}`} className="text-xs font-medium">
              Required
            </label>
            <input
              id={`prop-required-${selectedNode.id}`}
              type="checkbox"
              checked={Boolean(selectedNode.props.required)}
              onChange={(e) => updateProp('required', e.target.checked)}
              aria-label="Mark field as required"
              data-testid="property-required"
              className="rounded"
            />
          </div>
        )}

        {/* Read-only toggle */}
        {['text', 'textarea', 'number', 'date', 'time', 'datetime', 'select'].includes(
          selectedNode.type
        ) && (
          <div className="flex items-center justify-between">
            <label htmlFor={`prop-readonly-${selectedNode.id}`} className="text-xs font-medium">
              Read-only
            </label>
            <input
              id={`prop-readonly-${selectedNode.id}`}
              type="checkbox"
              checked={Boolean(selectedNode.props.readonly)}
              onChange={(e) => updateProp('readonly', e.target.checked)}
              aria-label="Mark field as read-only"
              data-testid="property-readonly"
              className="rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertiesPanel;
