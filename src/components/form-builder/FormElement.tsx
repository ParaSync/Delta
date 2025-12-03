import { useRef, memo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import { getBuilderFieldComponent } from './components/builder';
import { useDragReorder } from '../../hooks/use-drag-reorder';
import type { Node } from '../../types/formBuilder';

type FormElementProps = {
  node: Node;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, props: Record<string, unknown>) => void;
  index: number;
  totalCount: number;
};

function FormElement({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onUpdateNode,
  index,
  totalCount,
}: FormElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { dragState, startDrag, updateInsertionIndex } = useDragReorder();

  const isBeingDragged = dragState.isDragging && dragState.draggedId === node.id;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: 'FORM_ELEMENT',
      item: () => {
        startDrag(node.id, index);
        return { id: node.id, index };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        // Handled by canvas-level listener
      },
    }),
    [node.id, index, startDrag]
  );

  const [, drop] = useDrop(
    () => ({
      accept: 'FORM_ELEMENT',
      hover: (item: { id: string; index: number }, monitor) => {
        if (!elementRef.current) return;
        if (item.id === node.id) return;

        // Get bounding rectangle of the hovered element
        const hoverBoundingRect = elementRef.current.getBoundingClientRect();

        // Get vertical middle point
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Get cursor position
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) return;

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Determine insertion index based on cursor position
        // If cursor is above the middle, insert before this element
        // If cursor is below the middle, insert after this element
        const insertionIndex = hoverClientY < hoverMiddleY ? index : index + 1;

        updateInsertionIndex(insertionIndex);
      },
    }),
    [index, node.id, updateInsertionIndex]
  );

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

  // Get the appropriate field component from the registry
  const FieldComponent = getBuilderFieldComponent(node.type);

  // Make the whole element draggable when selected
  const dragRef = useRef<HTMLDivElement>(null);

  // Connect drag to the drag handle or the whole element
  const connectDrag = (el: HTMLDivElement | null) => {
    if (el && isSelected) {
      drag(el);
    }
  };

  return (
    <div
      ref={(el) => {
        elementRef.current = el;
        preview(drop(el));
        // Also make the whole element draggable when selected
        if (isSelected) {
          drag(el);
        }
      }}
      onClick={handleClick}
      role="listitem"
      aria-label={`${node.type} component${isSelected ? ' (selected)' : ''}${node.props.visibleInPreview === false ? ' (hidden)' : ''}`}
      aria-selected={isSelected}
      aria-grabbed={isDragging}
      data-testid={`form-element-${node.type}-${node.id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(node.id);
        } else if (e.key === 'Delete' && isSelected) {
          e.preventDefault();
          onDelete(node.id);
        }
      }}
      className={`
        group relative p-2 rounded-lg transition-all
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 cursor-grab active:cursor-grabbing' : 'hover:ring-1 hover:ring-gray-300'}
        ${isBeingDragged ? 'opacity-40 bg-gray-200 scale-[0.98]' : ''}
        ${node.props.visibleInPreview === false ? 'opacity-50 bg-gray-100' : ''}
      `}
    >
      {/* Toolbar */}
      {isSelected && !isBeingDragged && (
        <div
          className="absolute -top-4 left-0 right-0 flex justify-between items-center bg-primary text-white rounded-md px-2 py-1 text-xs z-10"
          role="toolbar"
          aria-label="Component actions"
          data-testid="form-element-toolbar"
        >
          <div className="flex items-center gap-1">
            <div
              ref={(el) => {
                drag(el);
              }}
              role="button"
              aria-label="Drag to reorder"
              tabIndex={0}
              data-testid="drag-handle"
              className="cursor-grab hover:bg-primary/80 p-1 rounded active:cursor-grabbing flex items-center"
            >
              <GripVertical className="h-3 w-3" aria-hidden="true" />
            </div>
            <span className="font-medium">{node.type}</span>
            {node.props.visibleInPreview === false && (
              <span
                className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-white rounded text-[10px] font-semibold"
                role="status"
                aria-label="Hidden from preview"
              >
                HIDDEN
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDuplicate}
              aria-label="Duplicate component"
              data-testid="duplicate-button"
              className="hover:bg-primary/80 p-1 rounded"
            >
              <Copy className="h-3 w-3" aria-hidden="true" />
            </button>
            <button
              onClick={handleToggleVisibility}
              aria-label={
                node.props.visibleInPreview === false ? 'Show in preview' : 'Hide from preview'
              }
              aria-pressed={node.props.visibleInPreview === false}
              data-testid="visibility-toggle"
              className={`hover:bg-primary/80 p-1 rounded ${node.props.visibleInPreview === false ? 'bg-primary/70' : ''}`}
              title={
                node.props.visibleInPreview === false
                  ? 'Hidden in preview - Click to show'
                  : 'Visible in preview - Click to hide'
              }
            >
              {node.props.visibleInPreview === false ? (
                <EyeOff className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Eye className="h-3 w-3" aria-hidden="true" />
              )}
            </button>
            <button
              onClick={handleDelete}
              aria-label="Delete component"
              data-testid="delete-button"
              className="hover:bg-red-600 p-1 rounded"
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Render the field component from registry */}
      <FieldComponent node={node} onUpdateNode={onUpdateNode} />
    </div>
  );
}

export default memo(FormElement);
