import { PageHeader } from '@/components';
import { QuickActions } from '../components/QuickActions';
import { AlertsRibbon } from '../components/AlertsRibbon';
import { DashboardGrid } from '../components/DashboardGrid';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import { registerDashboardWidgets } from '../registry/registerWidgets';
import { Settings2, RotateCcw } from 'lucide-react';

registerDashboardWidgets();

export function DashboardPage() {
  const {
    layout,
    isEditing,
    setIsEditing,
    reorderWidgets,
    resetLayout,
  } = useDashboardLayout();


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Overview" 
          description="Factory operations at a glance" 
          className="mb-0"
        />
        <QuickActions />
      </div>

      <AlertsRibbon />

      <div className="flex items-center justify-end mb-2 gap-2">
        {isEditing ? (
          <>
            <button
              onClick={() => {
                resetLayout();
                setIsEditing(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted h-9 px-4 text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Layout
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
            >
              Done Editing
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors border bg-card hover:bg-muted text-muted-foreground h-9 px-4"
          >
            <Settings2 className="h-4 w-4" />
            Customize Layout
          </button>
        )}
      </div>

      <div className="pb-6">
        <DashboardGrid 
          layout={layout} 
          isEditing={isEditing} 
          onReorder={reorderWidgets}
        />
      </div>
    </div>
  );
}
