import { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import FormElement from './FormElement';
import {
  DragReorderContext,
  useDragReorderProvider,
  useDragReorder,
} from '../../hooks/use-drag-reorder';
import type { Node } from '../../types/formBuilder';

type FormCanvasProps = {
  nodes: Node[];
  selectedNodeId?: string;
  onSelectNode: (nodeId?: string) => void;
  onDropComponent: (componentType: string, defaultProps: Record<string, unknown>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onUpdateNode: (nodeId: string, props: Record<string, unknown>) => void;
  onMoveElement: (dragIndex: number, hoverIndex: number) => void;
};

function FormCanvasContent({
  nodes,
  selectedNodeId,
  onSelectNode,
  onDropComponent,
  onDeleteNode,
  onDuplicateNode,
  onUpdateNode,
  onMoveElement,
}: FormCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { dragState, endDrag, commitReorder } = useDragReorder();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['COMPONENT', 'FORM_ELEMENT'],
    drop: (item: {
      componentType?: string;
      defaultProps?: Record<string, unknown>;
      type?: string;
    }) => {
      // Handle new component drop from palette
      if (item.componentType && item.defaultProps) {
        onDropComponent(item.componentType, item.defaultProps);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Handle drag end to commit reorder
  useEffect(() => {
    const handleDragEnd = () => {
      if (dragState.isDragging) {
        const result = commitReorder();
        if (result) {
          onMoveElement(result.fromIndex, result.toIndex);
        }
        endDrag();
      }
    };

    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [dragState.isDragging, commitReorder, endDrag, onMoveElement]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectNode(undefined);
    }
  };

  if (nodes.length === 0) {
    return (
      <div
        ref={(el) => {
          canvasRef.current = el;
          drop(el);
        }}
        onClick={handleCanvasClick}
        role="main"
        aria-label="Form canvas - empty"
        aria-dropeffect="copy"
        data-testid="form-canvas-empty"
        className={`flex-1 p-8 pb-24 bg-gray-50 h-screen overflow-y-auto ${isOver ? 'bg-primary/5' : ''}`}
      >
        <div className="flex flex-col items-center justify-center min-h-full text-center">
          <div
            className="p-8 border-2 border-dashed border-gray-300 rounded-lg bg-white/50"
            role="status"
            aria-live="polite"
          >
            <h3 className="text-lg font-medium text-gray-600 mb-2" role="heading" aria-level={3}>
              Start Building Your Form
            </h3>
            <p className="text-sm text-gray-500" role="note">
              Drag components from the palette to begin creating your form.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine which element should show the insertion indicator
  const getIndicatorPosition = (index: number): 'before' | 'after' | null => {
    if (!dragState.isDragging || dragState.insertionIndex === null) return null;

    const { insertionIndex, draggedIndex } = dragState;

    // Don't show indicator adjacent to the dragged element's original position
    // This covers: dragging to same position, or to immediately before/after itself
    if (draggedIndex === index && insertionIndex === index) return null;
    if (draggedIndex === index && insertionIndex === index + 1) return null;
    if (draggedIndex === index - 1 && insertionIndex === index) return null;

    // Show "before" indicator if insertion is at this index
    if (insertionIndex === index && draggedIndex !== index) {
      return 'before';
    }

    // Show "after" indicator on the last element if insertion is at the end
    // But not if we're dragging the last element to below itself
    if (index === nodes.length - 1 && insertionIndex === nodes.length && draggedIndex !== index) {
      return 'after';
    }

    return null;
  };

  return (
    <div
      ref={(el) => {
        canvasRef.current = el;
        drop(el);
      }}
      onClick={handleCanvasClick}
      role="main"
      aria-label={`Form canvas with ${nodes.length} component${nodes.length !== 1 ? 's' : ''}`}
      aria-dropeffect="copy"
      data-testid="form-canvas"
      className={`flex-1 p-8 pb-24 bg-gray-50 h-screen overflow-y-auto ${isOver ? 'bg-primary/5' : ''}`}
    >
      <div className="max-w-4xl mx-auto space-y-4" role="list" aria-label="Form components">
        {nodes.map((node, index) => {
          const indicatorPosition = getIndicatorPosition(index);
          return (
            <div key={node.id} className="relative">
              {indicatorPosition === 'before' && (
                <div className="absolute left-0 right-0 -top-2 z-20 flex items-center pointer-events-none">
                  <div className="flex-1 h-0.5 bg-primary" />
                </div>
              )}
              <FormElement
                node={node}
                isSelected={selectedNodeId === node.id}
                onSelect={onSelectNode}
                onDelete={onDeleteNode}
                onDuplicate={onDuplicateNode}
                onUpdateNode={onUpdateNode}
                index={index}
                totalCount={nodes.length}
              />
              {indicatorPosition === 'after' && (
                <div className="absolute left-0 right-0 -bottom-2 z-20 flex items-center pointer-events-none">
                  <div className="flex-1 h-0.5 bg-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormCanvas(props: FormCanvasProps) {
  const dragReorderContext = useDragReorderProvider();

  return (
    <DragReorderContext.Provider value={dragReorderContext}>
      <FormCanvasContent {...props} />
    </DragReorderContext.Provider>
  );
}

export default FormCanvas;
