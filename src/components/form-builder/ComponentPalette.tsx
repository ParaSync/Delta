// Component Palette for Form Builder

import { useState } from 'react';
import { useDrag } from 'react-dnd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { COMPONENT_CATEGORIES } from '../../utils/formBuilder';
import type { ComponentItem } from '../../types/formBuilder';

type DraggableComponentProps = {
  item: ComponentItem;
  onAddComponent: (componentType: string, defaultProps: Record<string, unknown>) => void;
}

function DraggableComponent({ item, onAddComponent }: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { componentType: item.type, defaultProps: item.defaultProps },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [item.type, item.defaultProps]);

  // Lucide-react exports complex types that don't match Record indexing
  // We need to cast through unknown to access icons by string key
  const iconLookup = Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
  const IconComponent = iconLookup[item.icon] || Icons.Square;

  const handleClick = () => {
    onAddComponent(item.type, item.defaultProps);
  };

  return (
    <div
      ref={(el) => { drag(el); }}
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer transition-colors select-none ${isDragging ? 'opacity-50' : ''}`}
    >
      <IconComponent className="h-4 w-4 text-gray-500" />
      <span className="text-sm font-medium">{item.label}</span>
    </div>
  );
}

type ComponentCategoryProps = {
  category: { name: string; items: ComponentItem[] };
  isExpanded: boolean;
  onToggle: () => void;
  onAddComponent: (componentType: string, defaultProps: Record<string, unknown>) => void;
}

function ComponentCategory({ category, isExpanded, onToggle, onAddComponent }: ComponentCategoryProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-100 rounded-md transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
        <span className="font-medium text-xs uppercase tracking-wide text-gray-500">
          {category.name}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 mb-4 space-y-2 pl-2">
          {category.items.map((item) => (
            <DraggableComponent 
              key={item.type} 
              item={item} 
              onAddComponent={onAddComponent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type ComponentPaletteProps = {
  onAddComponent: (componentType: string, defaultProps: Record<string, unknown>) => void;
}

function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
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
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Components</h2>
        <p className="text-sm text-gray-500">
          Click or drag components to add them to your form.
        </p>
      </div>
      
      <div className="space-y-1">
        {COMPONENT_CATEGORIES.map((category) => (
          <ComponentCategory
            key={category.name}
            category={category}
            isExpanded={expandedCategories[category.name]}
            onToggle={() => toggleCategory(category.name)}
            onAddComponent={onAddComponent}
          />
        ))}
      </div>
    </div>
  );
}

export default ComponentPalette;
