// Form Element Component for Canvas

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Node } from '@/types/form-builder';
import { Button } from '@/components/ui/button';

interface FormElementProps {
  node: Node;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
}

export const FormElement: React.FC<FormElementProps> = ({ node, isSelected, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: { type: 'element', node },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const renderElement = () => {
    const { props } = node;

    switch (node.type) {
      case 'h1':
        return <h1 className="text-3xl font-bold">{props.text}</h1>;
      
      case 'h2':
        return <h2 className="text-2xl font-bold">{props.text}</h2>;
      
      case 'h3':
        return <h3 className="text-xl font-bold">{props.text}</h3>;
      
      case 'paragraph':
        return <p className="text-base">{props.text}</p>;
      
      case 'help':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{props.text}</span>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </label>
            <input
              type="text"
              placeholder={props.placeholder}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              disabled
            />
          </div>
        );
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </label>
            <textarea
              placeholder={props.placeholder}
              rows={props.rows || 3}
              className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
              disabled
            />
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </label>
            <input
              type="number"
              placeholder={props.placeholder}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              disabled
            />
          </div>
        );
      
      case 'select':
        return (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {props.label} {props.required && <span className="text-destructive">*</span>}
            </label>
            <select className="w-full px-3 py-2 border border-input rounded-md bg-background" disabled>
              <option value="">Select an option...</option>
              {props.options?.map((option: any, index: number) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded border-input" disabled />
            <label className="text-sm font-medium">{props.label}</label>
          </div>
        );
      
      case 'divider':
        return <hr className="border-border" />;
      
      case 'columns2':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center text-sm text-muted-foreground">
              Column 1 - Drop components here
            </div>
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center text-sm text-muted-foreground">
              Column 2 - Drop components here
            </div>
          </div>
        );
      
      case 'group':
        return (
          <div className="border border-border rounded-lg p-4">
            <h4 className="font-medium mb-4">{props.title}</h4>
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center text-sm text-muted-foreground">
              Drop components here
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="border border-border rounded-lg p-4 text-center">
            {props.src ? (
              <img src={props.src} alt={props.alt} className="max-w-full h-auto mx-auto" />
            ) : (
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Image placeholder</span>
              </div>
            )}
          </div>
        );
      
      case 'submit':
        return (
          <Button type="submit" className="bg-primary text-primary-foreground">
            {props.label}
          </Button>
        );
      
      case 'reset':
        return (
          <Button type="button" variant="secondary">
            {props.label}
          </Button>
        );
      
      default:
        return (
          <div className="p-4 border border-dashed border-muted-foreground/50 rounded-lg">
            <span className="text-muted-foreground">Unknown component: {node.type}</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      className={cn(
        "group relative p-2 rounded-lg transition-all",
        isSelected && "ring-2 ring-primary ring-offset-2",
        isDragging && "opacity-50",
        "hover:ring-1 hover:ring-primary/50"
      )}
      {...attributes}
    >
      {/* Toolbar */}
      {isSelected && (
        <div className="absolute -top-2 left-0 right-0 flex justify-between items-center bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs z-10">
          <div className="flex items-center gap-1">
            <button {...listeners} className="cursor-grab hover:bg-primary/80 p-1 rounded">
              <GripVertical className="h-3 w-3" />
            </button>
            <span className="font-medium">{node.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="hover:bg-primary/80 p-1 rounded">
              <Copy className="h-3 w-3" />
            </button>
            <button className="hover:bg-primary/80 p-1 rounded">
              <EyeOff className="h-3 w-3" />
            </button>
            <button className="hover:bg-destructive p-1 rounded">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      
      {renderElement()}
    </div>
  );
};