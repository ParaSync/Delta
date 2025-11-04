// Form Element - Complete implementation for Delta
import { useRef, memo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Node } from '../../types/formBuilder';
import { toReactString } from '../../utils/formBuilder';

type FormElementProps = {
  node: Node;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, props: Record<string, unknown>) => void;
  index: number;
  moveElement: (dragIndex: number, hoverIndex: number) => void;
}

function FormElement({ node, isSelected, onSelect, onDelete, onDuplicate, onUpdateNode, index, moveElement }: FormElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'ELEMENT',
    item: { id: node.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [node.id, index]);

  const [, drop] = useDrop(() => ({
    accept: 'ELEMENT',
    hover: (item: { id: string; index: number }, monitor) => {
      if (!elementRef.current) return;
      if (item.index === index) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Get bounding rectangle of the hovered element
      const hoverBoundingRect = elementRef.current.getBoundingClientRect();
      
      // Get vertical middle point
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Get cursor position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      moveElement(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  }), [index, moveElement]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(node.id);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentVisibility = node.props.visibleInPreview !== false;
    onUpdateNode(node.id, { visibleInPreview: !currentVisibility });
  };

  const { props } = node;

  const renderContent = () => {
    switch (node.type) {
      case 'h1':
        return <h1 className="text-3xl font-bold">{String(props.text || 'Heading 1')}</h1>;
      
      case 'h2':
        return <h2 className="text-2xl font-bold">{String(props.text || 'Heading 2')}</h2>;
      
      case 'h3':
        return <h3 className="text-xl font-bold">{String(props.text || 'Heading 3')}</h3>;
      
      case 'paragraph':
        return <p className="text-base">{String(props.text || 'Paragraph text')}</p>;
      
      case 'help':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{String(props.text || 'Help text')}</span>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Text Field')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <input 
              type="text" 
              placeholder={String(props.placeholder || '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none" 
              disabled 
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Textarea')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <textarea 
              placeholder={String(props.placeholder || '')}
              rows={Number(props.rows) || 3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white resize-none pointer-events-none" 
              disabled 
            />
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Number Field')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <input 
              type="number" 
              placeholder={String(props.placeholder || '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none" 
              disabled 
            />
          </div>
        );
      
      case 'date':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Date Field')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none" 
              disabled 
            />
          </div>
        );
      
      case 'time':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Time Field')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <input 
              type="time" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none" 
              disabled 
            />
          </div>
        );
      
      case 'datetime':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Date & Time Field')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <input 
              type="datetime-local" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none" 
              disabled 
            />
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Select Field')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none" disabled>
              <option value="">Select an option...</option>
              {(props.options as Array<{ value: string; label: string }> || []).map((opt, i) => (
                <option key={i} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Multi-select Field')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <div className="border border-gray-300 rounded-md p-3 space-y-2 bg-white">
              {(props.options as Array<{ value: string; label: string }> || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 pointer-events-none" disabled />
                  <label className="text-sm">{opt.label}</label>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Radio Group')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <div className="space-y-2">
              {(props.options as Array<{ value: string; label: string }> || []).map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name={node.id} value={opt.value} className="pointer-events-none" disabled />
                  <label className="text-sm">{opt.label}</label>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300 pointer-events-none" disabled />
            <label className="text-sm font-medium">{String(props.label || 'Checkbox Field')}</label>
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'File Upload')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <input 
              type="file" 
              accept={String(props.accept || '*/*')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white pointer-events-none" 
              disabled 
            />
            <p className="text-xs text-gray-500">Accepted: {String(props.accept || '*/*')}</p>
          </div>
        );
      
      case 'table':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium block">
              {toReactString(props.label || 'Table')} {Boolean(props.required) && <span className="text-red-600">*</span>}
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    {(props.columns as Array<{ key: string; label: string }> || []).map((col, i) => (
                      <th key={i} className="px-4 py-2 text-left text-sm font-medium">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {(props.columns as Array<{ key: string; label: string }> || []).map((_col, i) => (
                      <td key={i} className="px-4 py-2 border-t">
                        <input type="text" className="w-full border-0 bg-transparent pointer-events-none" disabled />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'divider':
        return <hr className="border-gray-300" />;
      
      case 'pagebreak':
        return (
          <div className="border-t-4 border-dashed border-gray-400 py-2 text-center">
            <span className="text-sm font-medium text-gray-500">— Page Break —</span>
          </div>
        );
      
      case 'image':
        return (
          <div className="border border-gray-300 rounded-lg p-4 text-center">
            {props.src ? (
              <img 
                src={String(props.src)} 
                alt={String(props.alt || 'Image')} 
                className="max-w-full h-auto mx-auto rounded"
                style={{ objectFit: String(props.objectFit || 'cover') as never }}
              />
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Image placeholder - Upload or set image URL in properties</span>
              </div>
            )}
          </div>
        );
      
      case 'submit':
        return (
          <button 
            type="submit" 
            className={`px-8 py-2 rounded-xl font-bold text-white ${props.variant === 'secondary' ? 'bg-gray-600' : 'bg-primary'}`}
          >
            {String(props.label || 'Submit')}
          </button>
        );
      
      case 'reset':
        return (
          <button 
            type="button" 
            className="px-8 py-2 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            {String(props.label || 'Reset')}
          </button>
        );
      
      default:
        return (
          <div className="p-4 border border-dashed border-gray-400 rounded-lg">
            <span className="text-gray-500">Unknown component: {node.type}</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={(el) => {
        elementRef.current = el;
        preview(drop(el));
      }}
      onClick={handleClick}
      className={`group relative p-2 rounded-lg transition-all ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'} ${isDragging ? 'opacity-50' : ''} ${node.props.visibleInPreview === false ? 'opacity-50 bg-gray-100' : ''}`}
    >
      {/* Toolbar */}
      {isSelected && (
        <div className="absolute -top-2 left-0 right-0 flex justify-between items-center bg-primary text-white rounded-md px-2 py-1 text-xs z-10">
          <div className="flex items-center gap-1">
            <div 
              ref={(el) => { drag(el); }}
              className="cursor-grab hover:bg-primary/80 p-1 rounded active:cursor-grabbing flex items-center"
            >
              <GripVertical className="h-3 w-3" />
            </div>
            <span className="font-medium">{node.type}</span>
            {node.props.visibleInPreview === false && (
              <span className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white rounded text-[10px] font-semibold">
                HIDDEN
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleDuplicate} className="hover:bg-primary/80 p-1 rounded">
              <Copy className="h-3 w-3" />
            </button>
            <button 
              onClick={handleToggleVisibility} 
              className={`hover:bg-primary/80 p-1 rounded ${node.props.visibleInPreview === false ? 'bg-primary/70' : ''}`}
              title={node.props.visibleInPreview === false ? 'Hidden in preview - Click to show' : 'Visible in preview - Click to hide'}
            >
              {node.props.visibleInPreview === false ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </button>
            <button onClick={handleDelete} className="hover:bg-red-600 p-1 rounded">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
}

export default memo(FormElement);
