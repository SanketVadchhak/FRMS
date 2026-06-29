import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useColumnPreferences } from '@/hooks/useColumnPreferences';
import { TableLayoutEditor } from '@/components/data-table/TableLayoutEditor';
import type { TableRegistryEntry } from '@/config/table-registry';

interface TableConfigCardProps {
  entry: TableRegistryEntry;
}

export function TableConfigCard({ entry }: TableConfigCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const prefs = useColumnPreferences(entry.storageKey, entry.columns);

  const Icon = entry.icon;

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-shadow duration-200',
        isExpanded ? 'shadow-md border-primary/20' : 'shadow-sm hover:shadow-md',
      )}
    >
      {/* Card Header — always visible, click to expand */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-5 text-left"
        aria-expanded={isExpanded}
        aria-controls={`table-editor-${entry.storageKey}`}
      >
        {/* Icon badge */}
        <div className={cn(
          'flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
          isExpanded
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground',
        )}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Title & description */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{entry.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.description}</p>
        </div>

        {/* Column count badge */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
            {prefs.visibleCount} / {prefs.totalCount} visible
          </span>
          <div className="text-muted-foreground">
            {isExpanded
              ? <ChevronUp className="h-4 w-4" />
              : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Editor Panel — rendered below the card header, never clipped */}
      {isExpanded && (
        <div
          id={`table-editor-${entry.storageKey}`}
          className="px-5 pb-5 pt-1 border-t border-border/40 animate-in slide-in-from-top-2 fade-in duration-150"
        >
          <TableLayoutEditor
            columns={entry.columns}
            layout={prefs.layout}
            visibleColumns={prefs.visibleColumns}
            toggleColumn={prefs.toggleColumn}
            moveColumn={prefs.moveColumn}
            moveUp={prefs.moveUp}
            moveDown={prefs.moveDown}
            moveToTop={prefs.moveToTop}
            moveToBottom={prefs.moveToBottom}
            showAll={prefs.showAll}
            hideAll={prefs.hideAll}
            resetDefaults={prefs.resetDefaults}
            importLayout={prefs.importLayout}
            visibleCount={prefs.visibleCount}
            totalCount={prefs.totalCount}
          />
        </div>
      )}
    </div>
  );
}
