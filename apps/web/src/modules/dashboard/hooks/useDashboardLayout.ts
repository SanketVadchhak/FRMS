import { useState } from 'react';
import { dashboardRegistry } from '../registry/dashboardRegistry';

const STORAGE_KEY = 'frms_dashboard_layout';

export interface WidgetLayoutState {
  id: string;
  visible: boolean;
  order: number;
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState<WidgetLayoutState[]>(() => {
    const registeredWidgets = dashboardRegistry.getAllWidgets();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as WidgetLayoutState[];
          
          const merged = registeredWidgets.map((widget, index) => {
            const savedState = parsed.find(p => p.id === widget.id);
            if (savedState) return savedState;
            
            return {
              id: widget.id,
              visible: widget.defaultVisible,
              order: widget.defaultOrder ?? (parsed.length + index),
            };
          });
          
          merged.sort((a, b) => a.order - b.order);
          return merged;
        } catch (e) {
          console.error('Failed to parse dashboard layout', e);
        }
      }
    }

    return registeredWidgets.map(widget => ({
      id: widget.id,
      visible: widget.defaultVisible,
      order: widget.defaultOrder,
    })).sort((a, b) => a.order - b.order);
  });
  
  const [isEditing, setIsEditing] = useState(false);

  const saveLayout = (newLayout: WidgetLayoutState[]) => {
    setLayout(newLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
  };

  const toggleWidgetVisibility = (id: string) => {
    const newLayout = layout.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    saveLayout(newLayout);
  };

  const reorderWidgets = (activeId: string, overId: string) => {
    const activeIndex = layout.findIndex(w => w.id === activeId);
    const overIndex = layout.findIndex(w => w.id === overId);
    
    if (activeIndex !== -1 && overIndex !== -1) {
      const newLayout = [...layout];
      const [removed] = newLayout.splice(activeIndex, 1);
      newLayout.splice(overIndex, 0, removed!);
      
      // Update order property
      const orderedLayout = newLayout.map((item, index) => ({
        ...item,
        order: index
      }));
      
      saveLayout(orderedLayout);
    }
  };

  const resetLayout = () => {
    const defaultLayout = dashboardRegistry.getAllWidgets().map(widget => ({
      id: widget.id,
      visible: widget.defaultVisible,
      order: widget.defaultOrder,
    })).sort((a, b) => a.order - b.order);
    
    saveLayout(defaultLayout);
  };

  return {
    layout,
    isEditing,
    setIsEditing,
    toggleWidgetVisibility,
    reorderWidgets,
    resetLayout,
  };
}
