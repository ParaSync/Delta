import { useDrop } from 'react-dnd';
import FormElement from './FormElement';
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
}

function FormCanvas({ 
  nodes, 
  selectedNodeId, 
  onSelectNode, 
  onDropComponent,
  onDeleteNode,
  onDuplicateNode,
  onUpdateNode,
  onMoveElement
}: FormCanvasProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: { componentType: string; defaultProps: Record<string, unknown> }) => {
      onDropComponent(item.componentType, item.defaultProps);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectNode(undefined);
    }
  };

  if (nodes.length === 0) {
    return (
      <div
        ref={(el) => { drop(el); }}
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
            <h3 
              className="text-lg font-medium text-gray-600 mb-2"
              role="heading"
              aria-level={3}
            >
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

  return (
    <div
      ref={(el) => { drop(el); }}
      onClick={handleCanvasClick}
      role="main"
      aria-label={`Form canvas with ${nodes.length} component${nodes.length !== 1 ? 's' : ''}`}
      aria-dropeffect="copy"
      data-testid="form-canvas"
      className={`flex-1 p-8 pb-24 bg-gray-50 h-screen overflow-y-auto ${isOver ? 'bg-primary/5' : ''}`}
    >
      <div 
        className="max-w-4xl mx-auto space-y-4"
        role="list"
        aria-label="Form components"
      >
        {nodes.map((node, index) => (
          <FormElement
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={onSelectNode}
            onDelete={onDeleteNode}
            onDuplicate={onDuplicateNode}
            onUpdateNode={onUpdateNode}
            index={index}
            moveElement={onMoveElement}
          />
        ))}
      </div>
    </div>
  );
}

export default FormCanvas;
