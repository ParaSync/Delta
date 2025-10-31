// Component Palette for Form Builder

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { COMPONENT_CATEGORIES } from '@/utils/form-builder';
import { ComponentItem } from '@/types/form-builder';

interface DraggableComponentProps {
  item: ComponentItem;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { type: 'component', componentType: item.type, defaultProps: item.defaultProps },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const IconComponent = (Icons as any)[item.icon] || Icons.Square;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-grab transition-colors",
        "select-none touch-none",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <IconComponent className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{item.label}</span>
    </div>
  );
};

interface ComponentCategoryProps {
  category: { name: string; items: ComponentItem[] };
  isExpanded: boolean;
  onToggle: () => void;
}

const ComponentCategory: React.FC<ComponentCategoryProps> = ({ category, isExpanded, onToggle }) => {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full p-2 text-left hover:bg-accent/30 rounded-md transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
          {category.name}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2 pl-2">
          {category.items.map((item) => (
            <DraggableComponent key={item.type} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export const ComponentPalette: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Labels: true,
    Inputs: true,
    Tables: false,
    Layout: false,
    Images: false,
    Actions: false,
  });

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  return (
    <div className="w-80 bg-card border-r border-border p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Components</h2>
        <p className="text-sm text-muted-foreground">
          Drag components to the canvas to build your form.
        </p>
      </div>
      
      <div className="space-y-1">
        {COMPONENT_CATEGORIES.map((category) => (
          <ComponentCategory
            key={category.name}
            category={category}
            isExpanded={expandedCategories[category.name]}
            onToggle={() => toggleCategory(category.name)}
          />
        ))}
      </div>
    </div>
  );
};