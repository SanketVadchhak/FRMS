import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import type { WidgetDefinition } from '../registry/dashboardRegistry';

interface WidgetContainerProps {
  widget: WidgetDefinition;
  isEditing: boolean;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  override render() {
    if (this.state.hasError) {
      return <div className="p-4 rounded-xl border bg-destructive/10 text-destructive flex items-center justify-center h-full min-h-[150px]">Failed to load widget</div>;
    }
    return this.props.children;
  }
}

export function WidgetContainer({ widget, isEditing }: WidgetContainerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const getColSpan = () => {
    switch (widget.defaultSize) {
      case 'sm': return 'col-span-1';
      case 'md': return 'col-span-1 md:col-span-2';
      case 'lg': return 'col-span-1 md:col-span-3';
      case 'full': return 'col-span-1 md:col-span-4';
      default: return 'col-span-1';
    }
  };

  const WidgetComponent = widget.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col ${getColSpan()} ${isEditing ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-background' : ''}`}
    >
      {isEditing && (
        <div 
          className="absolute top-0 left-0 right-0 h-6 bg-muted/50 rounded-t-xl flex items-center justify-center cursor-grab active:cursor-grabbing z-20 border-b"
          {...attributes}
          {...listeners}
        >
          <GripHorizontal className="w-4 h-4 text-muted-foreground opacity-50" />
        </div>
      )}
      
      <div className={`flex-1 ${isEditing ? 'pt-6' : ''}`}>
        <ErrorBoundary>
          <React.Suspense fallback={<div className="h-[200px] w-full animate-pulse bg-muted rounded-xl" />}>
            <WidgetComponent />
          </React.Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
