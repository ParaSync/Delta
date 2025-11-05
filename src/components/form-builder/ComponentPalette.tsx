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
      role="button"
      tabIndex={0}
      aria-label={`Add ${item.label} component`}
      aria-grabbed={isDragging}
      data-testid={`palette-component-${item.type}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 cursor-pointer transition-colors select-none ${isDragging ? 'opacity-50' : ''}`}
    >
      <IconComponent className="h-4 w-4 text-gray-500" aria-hidden="true" />
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
  const categoryId = `category-${category.name.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div>
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={categoryId}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category.name} category`}
        data-testid={`category-${category.name.toLowerCase()}`}
        className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-100 rounded-md transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" aria-hidden="true" />
        )}
        <span className="font-medium text-xs uppercase tracking-wide text-gray-500">
          {category.name}
        </span>
      </button>
      
      {isExpanded && (
        <div 
          id={categoryId}
          role="group"
          aria-label={`${category.name} components`}
          className="mt-2 mb-4 space-y-2 pl-2"
        >
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
    <div 
      className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto"
      role="complementary"
      aria-label="Component palette"
      data-testid="component-palette"
    >
      <div className="mb-6">
        <h2 
          className="text-lg font-bold mb-2"
          role="heading"
          aria-level={2}
        >
          Components
        </h2>
        <p className="text-sm text-gray-500" role="note">
          Click or drag components to add them to your form.
        </p>
      </div>
      
      <div className="space-y-1" role="list">
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
