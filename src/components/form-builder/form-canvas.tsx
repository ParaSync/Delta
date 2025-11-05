// Form Canvas for Form Builder

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { Node } from '@/types/form-builder';
import { FormElement } from './form-element';

interface FormCanvasProps {
  nodes: Node[];
  selectedNodeId?: string;
  onSelectNode: (nodeId?: string) => void;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({ nodes, selectedNodeId, onSelectNode }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas',
    data: { type: 'canvas' },
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectNode(undefined);
    }
  };

  if (nodes.length === 0) {
    return (
      <div
        ref={setNodeRef}
        onClick={handleCanvasClick}
        className={cn(
          'flex-1 p-8 bg-background relative min-h-screen',
          'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]',
          isOver && 'bg-primary/5'
        )}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="p-8 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Start Building Your Form
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag components from the palette to begin creating your form.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      onClick={handleCanvasClick}
      className={cn(
        'flex-1 p-8 bg-background relative min-h-screen',
        'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]',
        isOver && 'bg-primary/5'
      )}
    >
      <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        <div className="max-w-4xl mx-auto space-y-4">
          {nodes.map((node) => (
            <FormElement
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={onSelectNode}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
