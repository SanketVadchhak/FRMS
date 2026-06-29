import { useState, useCallback, useMemo, useEffect } from 'react';

export interface ColumnDef<TData = unknown, TContext = unknown> {
  id: string;
  label: string;
  defaultVisible: boolean;
  fixed?: 'left' | 'right';
  width?: number;
  render?: (row: TData, context: TContext) => React.ReactNode;
  renderHeader?: (context?: TContext) => React.ReactNode;
  renderFooter?: (context: TContext) => React.ReactNode;
}

export interface TableLayout {
  order: string[];
  hidden: string[];
  widths: Record<string, number>;
  pinnedLeft: string[];
  pinnedRight: string[];
}

export function useColumnPreferences<TData = unknown, TContext = unknown>(
  storageKey: string,
  columns: ColumnDef<TData, TContext>[]
) {
  const fixedLeftIds = useMemo(() => new Set(columns.filter(c => c.fixed === 'left').map(c => c.id)), [columns]);
  const fixedRightIds = useMemo(() => new Set(columns.filter(c => c.fixed === 'right').map(c => c.id)), [columns]);
  const allColumnIds = useMemo(() => columns.map(c => c.id), [columns]);

  const [layout, setLayout] = useState<TableLayout>(() => {
    if (typeof window === 'undefined') {
      return {
        order: allColumnIds,
        hidden: columns.filter(c => !c.defaultVisible).map(c => c.id),
        widths: {},
        pinnedLeft: Array.from(fixedLeftIds),
        pinnedRight: Array.from(fixedRightIds),
      };
    }

    const stored = localStorage.getItem(storageKey);
    let parsedLayout: Partial<TableLayout> | null = null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Migration from old array of visible columns
          const visibleSet = new Set(parsed as string[]);
          parsedLayout = {
            order: allColumnIds,
            hidden: columns.filter(c => !visibleSet.has(c.id)).map(c => c.id),
          };
        } else {
          parsedLayout = parsed as TableLayout;
        }
      } catch (e) {
        console.error('Failed to parse column preferences', e);
      }
    }

    const baseLayout = parsedLayout || {};
    
    // Auto-merge new columns
    const storedOrder = baseLayout.order || [];
    const knownSet = new Set(storedOrder);
    const newColumns = allColumnIds.filter(id => !knownSet.has(id));
    
    const finalOrder = [
      ...storedOrder.filter(id => allColumnIds.includes(id)),
      ...newColumns
    ];

    // Enforce fixed columns position
    const orderedWithoutFixed = finalOrder.filter(id => !fixedLeftIds.has(id) && !fixedRightIds.has(id));
    const leftCols = allColumnIds.filter(id => fixedLeftIds.has(id));
    const rightCols = allColumnIds.filter(id => fixedRightIds.has(id));
    
    const strictOrder = [...leftCols, ...orderedWithoutFixed, ...rightCols];

    // Merge hidden columns, but never hide fixed columns
    const storedHidden = new Set(baseLayout.hidden || columns.filter(c => !c.defaultVisible).map(c => c.id));
    newColumns.forEach(id => {
      const col = columns.find(c => c.id === id);
      if (col && !col.defaultVisible) storedHidden.add(id);
    });

    const validHidden = Array.from(storedHidden).filter(id => allColumnIds.includes(id) && !fixedLeftIds.has(id) && !fixedRightIds.has(id));

    return {
      order: strictOrder,
      hidden: validHidden,
      widths: baseLayout.widths || {},
      pinnedLeft: Array.from(fixedLeftIds),
      pinnedRight: Array.from(fixedRightIds),
    };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(layout));
    }
  }, [layout, storageKey]);

  const toggleColumn = useCallback((id: string) => {
    if (fixedLeftIds.has(id) || fixedRightIds.has(id)) return;
    setLayout(prev => {
      const hiddenSet = new Set(prev.hidden);
      if (hiddenSet.has(id)) hiddenSet.delete(id);
      else hiddenSet.add(id);
      return { ...prev, hidden: Array.from(hiddenSet) };
    });
  }, [fixedLeftIds, fixedRightIds]);

  const moveColumn = useCallback((fromId: string, toId: string) => {
    if (fixedLeftIds.has(fromId) || fixedRightIds.has(fromId)) return;
    if (fixedLeftIds.has(toId) || fixedRightIds.has(toId)) return;

    setLayout(prev => {
      const newOrder = [...prev.order];
      const fromIndex = newOrder.indexOf(fromId);
      const toIndex = newOrder.indexOf(toId);
      if (fromIndex === -1 || toIndex === -1) return prev;

      newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, fromId);

      return { ...prev, order: newOrder };
    });
  }, [fixedLeftIds, fixedRightIds]);

  const moveUp = useCallback((id: string) => {
    setLayout(prev => {
      const idx = prev.order.indexOf(id);
      if (idx <= fixedLeftIds.size) return prev; // Cannot move above left fixed
      return { ...prev, order: prev.order.map((col, i) => i === idx - 1 ? id : i === idx ? prev.order[idx - 1]! : col) };
    });
  }, [fixedLeftIds]);

  const moveDown = useCallback((id: string) => {
    setLayout(prev => {
      const idx = prev.order.indexOf(id);
      if (idx >= prev.order.length - 1 - fixedRightIds.size || idx === -1) return prev; // Cannot move below right fixed
      return { ...prev, order: prev.order.map((col, i) => i === idx + 1 ? id : i === idx ? prev.order[idx + 1]! : col) };
    });
  }, [fixedRightIds]);
  
  const moveToTop = useCallback((id: string) => {
    if (fixedLeftIds.has(id) || fixedRightIds.has(id)) return;
    setLayout(prev => {
      const newOrder = prev.order.filter(c => c !== id);
      newOrder.splice(fixedLeftIds.size, 0, id);
      return { ...prev, order: newOrder };
    });
  }, [fixedLeftIds, fixedRightIds]);

  const moveToBottom = useCallback((id: string) => {
    if (fixedLeftIds.has(id) || fixedRightIds.has(id)) return;
    setLayout(prev => {
      const newOrder = prev.order.filter(c => c !== id);
      newOrder.splice(newOrder.length - fixedRightIds.size, 0, id);
      return { ...prev, order: newOrder };
    });
  }, [fixedLeftIds, fixedRightIds]);

  const showAll = useCallback(() => {
    setLayout(prev => ({ ...prev, hidden: [] }));
  }, []);

  const hideAll = useCallback(() => {
    const allExceptFixed = allColumnIds.filter(id => !fixedLeftIds.has(id) && !fixedRightIds.has(id));
    setLayout(prev => ({ ...prev, hidden: allExceptFixed }));
  }, [allColumnIds, fixedLeftIds, fixedRightIds]);

  const resetDefaults = useCallback(() => {
    setLayout({
      order: allColumnIds,
      hidden: columns.filter(c => !c.defaultVisible).map(c => c.id),
      widths: {},
      pinnedLeft: Array.from(fixedLeftIds),
      pinnedRight: Array.from(fixedRightIds),
    });
  }, [allColumnIds, columns, fixedLeftIds, fixedRightIds]);

  const importLayout = useCallback((imported: TableLayout) => {
    setLayout(imported);
  }, []);

  const orderedVisibleColumns = useMemo(() => {
    const hiddenSet = new Set(layout.hidden);
    return layout.order.filter(id => !hiddenSet.has(id));
  }, [layout]);

  return {
    layout,
    orderedVisibleColumns,
    visibleColumns: new Set(orderedVisibleColumns),
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
    visibleCount: orderedVisibleColumns.length,
    totalCount: allColumnIds.length,
  };
}
