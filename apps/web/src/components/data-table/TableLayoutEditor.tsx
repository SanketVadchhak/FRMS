import { useState, useMemo } from 'react';
import {
  Lock, Check, GripVertical, Download, Upload,
  ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown,
  MoreVertical, Search, Eye, EyeOff, RotateCcw
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ColumnDef, TableLayout } from '@/hooks/useColumnPreferences';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableLayoutEditorProps<TData = unknown, TContext = unknown> {
  columns: ColumnDef<TData, TContext>[];
  layout: TableLayout;
  visibleColumns: Set<string>;
  toggleColumn: (id: string) => void;
  moveColumn: (from: string, to: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  moveToTop: (id: string) => void;
  moveToBottom: (id: string) => void;
  showAll: () => void;
  hideAll: () => void;
  resetDefaults: () => void;
  importLayout: (layout: TableLayout) => void;
  visibleCount: number;
  totalCount: number;
}

// ─── Sortable Row ─────────────────────────────────────────────────────────────

interface SortableRowProps<TData = unknown, TContext = unknown> {
  col: ColumnDef<TData, TContext>;
  isVisible: boolean;
  isFixed: boolean;
  toggleColumn: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  moveToTop: (id: string) => void;
  moveToBottom: (id: string) => void;
}

function SortableRow<TData = unknown, TContext = unknown>({
  col, isVisible, isFixed, toggleColumn, moveUp, moveDown, moveToTop, moveToBottom,
}: SortableRowProps<TData, TContext>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: col.id,
    disabled: isFixed,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors select-none',
        isFixed
          ? 'bg-muted/40 border border-dashed border-border/50'
          : 'bg-background border border-border/40 hover:border-border',
        isDragging && 'opacity-60 shadow-lg border-primary/30 bg-primary/5',
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'flex-shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors',
          isFixed ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
        )}
        title={isFixed ? 'This column cannot be moved' : 'Drag to reorder'}
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Toggle Checkbox */}
      <button
        onClick={() => toggleColumn(col.id)}
        disabled={isFixed}
        className={cn(
          'flex items-center gap-2.5 flex-1 text-left min-w-0',
          isFixed ? 'cursor-not-allowed' : 'cursor-pointer',
        )}
        aria-label={isVisible ? `Hide ${col.label}` : `Show ${col.label}`}
      >
        <div className={cn(
          'flex-shrink-0 flex h-4 w-4 items-center justify-center rounded border',
          isVisible && !isFixed ? 'bg-primary border-primary' : 'border-input bg-background',
          isFixed && 'border-muted-foreground/30 bg-muted/30',
        )}>
          {isVisible && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
        </div>
        <span className={cn(
          'flex-1 font-medium truncate',
          !isVisible && 'text-muted-foreground',
        )}>
          {col.label}
        </span>
      </button>

      {/* Fixed badge or context menu */}
      {isFixed ? (
        <div className="flex items-center gap-1.5 flex-shrink-0 text-muted-foreground/60">
          <Lock className="h-3.5 w-3.5" />
          <span className="text-xs">Fixed</span>
        </div>
      ) : (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex-shrink-0 p-1 rounded-md text-muted-foreground/60 hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Column position options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              className="z-50 min-w-[160px] bg-popover border rounded-lg shadow-lg p-1 text-sm text-popover-foreground animate-in fade-in-80 slide-in-from-top-2"
            >
              <DropdownMenu.Item
                onSelect={() => moveToTop(col.id)}
                className="flex items-center gap-2 px-2.5 py-1.5 cursor-default hover:bg-accent rounded-md outline-none"
              >
                <ArrowUpToLine className="h-3.5 w-3.5 text-muted-foreground" /> Move to Top
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => moveUp(col.id)}
                className="flex items-center gap-2 px-2.5 py-1.5 cursor-default hover:bg-accent rounded-md outline-none"
              >
                <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" /> Move Up
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => moveDown(col.id)}
                className="flex items-center gap-2 px-2.5 py-1.5 cursor-default hover:bg-accent rounded-md outline-none"
              >
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" /> Move Down
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => moveToBottom(col.id)}
                className="flex items-center gap-2 px-2.5 py-1.5 cursor-default hover:bg-accent rounded-md outline-none"
              >
                <ArrowDownToLine className="h-3.5 w-3.5 text-muted-foreground" /> Move to Bottom
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export function TableLayoutEditor<TData = unknown, TContext = unknown>({
  columns,
  layout,
  visibleColumns,
  toggleColumn,
  moveColumn,
  moveUp,
  moveDown,
  moveToTop,
  moveToBottom,
  showAll,
  hideAll,
  resetDefaults,
  importLayout,
  visibleCount,
  totalCount,
}: TableLayoutEditorProps<TData, TContext>) {
  const [search, setSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveColumn(active.id as string, over.id as string);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table_layout.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string);
          if (parsed.order && parsed.hidden) importLayout(parsed);
        } catch {
          console.error('Failed to parse layout file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const filteredOrder = useMemo(() => {
    if (!search.trim()) return layout.order;
    const lower = search.toLowerCase();
    return layout.order.filter((id) => {
      const col = columns.find((c) => c.id === id);
      return col?.label.toLowerCase().includes(lower);
    });
  }, [layout.order, search, columns]);

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{visibleCount}</span> of{' '}
          <span className="font-semibold text-foreground">{totalCount}</span> columns visible.
          Changes are saved automatically.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleImport}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Import layout from JSON file"
          >
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Export layout as JSON file"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Search columns..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Column list */}
      <div className="space-y-1.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredOrder} strategy={verticalListSortingStrategy}>
            {filteredOrder.map((colId) => {
              const col = columns.find((c) => c.id === colId);
              if (!col) return null;
              return (
                <SortableRow
                  key={col.id}
                  col={col}
                  isVisible={visibleColumns.has(col.id)}
                  isFixed={!!col.fixed}
                  toggleColumn={toggleColumn}
                  moveUp={moveUp}
                  moveDown={moveDown}
                  moveToTop={moveToTop}
                  moveToBottom={moveToBottom}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        {filteredOrder.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No columns match "{search}"
          </p>
        )}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <button
          onClick={showAll}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium hover:bg-muted transition-colors"
        >
          <Eye className="h-3.5 w-3.5" /> Show All
        </button>
        <button
          onClick={hideAll}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium hover:bg-muted transition-colors"
        >
          <EyeOff className="h-3.5 w-3.5" /> Hide All
        </button>
        <button
          onClick={resetDefaults}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ml-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset to Defaults
        </button>
      </div>
    </div>
  );
}
