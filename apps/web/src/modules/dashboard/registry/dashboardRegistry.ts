import type React from 'react';

export type WidgetSize = 'sm' | 'md' | 'lg' | 'full';

export interface WidgetDefinition {
  id: string;
  title: string;
  description?: string;
  defaultSize: WidgetSize;
  defaultVisible: boolean;
  defaultOrder: number;
  component: React.ComponentType;
}

class DashboardRegistry {
  private widgets: Map<string, WidgetDefinition> = new Map();

  register(widget: WidgetDefinition) {
    if (this.widgets.has(widget.id)) {
      console.warn(`Widget ${widget.id} is already registered. Overwriting.`);
    }
    this.widgets.set(widget.id, widget);
  }

  getWidget(id: string): WidgetDefinition | undefined {
    return this.widgets.get(id);
  }

  getAllWidgets(): WidgetDefinition[] {
    return Array.from(this.widgets.values()).sort((a, b) => a.defaultOrder - b.defaultOrder);
  }
}

export const dashboardRegistry = new DashboardRegistry();
