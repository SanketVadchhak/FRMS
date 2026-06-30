import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, X, ArrowRight, LayoutDashboard, Factory, Users, Banknote, Shield } from 'lucide-react';
import { searchEngine, type GlobalSearchResult } from '../../lib/search/searchEngine';
import { useDebounce } from '@/hooks/useDebounce';
import { ROUTES } from '@/constants/routes';

// Quick Navigation links when search is empty
const QUICK_LINKS = [
  { id: 'q1', label: 'Go to Dashboard', icon: LayoutDashboard, path: ROUTES.DASHBOARD },
  { id: 'q2', label: 'Go to Production', icon: Factory, path: ROUTES.PRODUCTION.LIST },
  { id: 'q3', label: 'Go to Employees', icon: Users, path: ROUTES.MASTERS.EMPLOYEES },
  { id: 'q4', label: 'Go to Payroll', icon: Banknote, path: ROUTES.PAYROLL.DASHBOARD },
  { id: 'q5', label: 'Go to Masters', icon: Shield, path: ROUTES.SETTINGS.ROOT },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Record<string, GlobalSearchResult[]>>({});
  const [recentSearches, setRecentSearches] = useState<GlobalSearchResult[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('frms_recent_searches');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse recent searches', e);
        }
      }
    }
    return [];
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Handle Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults({});
    }
  }, [isOpen]);

  // Execute Search
  useEffect(() => {
    async function performSearch() {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setResults({});
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const res = await searchEngine.searchAll(debouncedQuery);
      setResults(res);
      setSelectedIndex(0);
      setIsSearching(false);
    }
    performSearch();
  }, [debouncedQuery]);

  // Flatten results for keyboard navigation
  const flatResults = React.useMemo(() => {
    const flat: (GlobalSearchResult | typeof QUICK_LINKS[0])[] = [];
    if (!query) {
      // Show recent searches then quick links
      flat.push(...recentSearches);
      flat.push(...QUICK_LINKS);
    } else {
      Object.values(results).forEach((modResults) => {
        flat.push(...modResults);
      });
    }
    return flat;
  }, [results, query, recentSearches]);

  const handleSelect = useCallback((item: GlobalSearchResult | typeof QUICK_LINKS[0]) => {
    if ('action' in item) {
      // It's a GlobalSearchResult
      
      // Save to recent
      const newRecent = [item, ...recentSearches.filter(r => r.id !== item.id)].slice(0, 10);
      setRecentSearches(newRecent);
      localStorage.setItem('frms_recent_searches', JSON.stringify(newRecent));

      setIsOpen(false);
      
      if (item.action.type === 'navigate' && item.action.path) {
        navigate(item.action.path, { state: item.action.state });
      } else if (item.action.type === 'action' && item.action.onExecute) {
        item.action.onExecute();
      }
    } else {
      // It's a quick link
      setIsOpen(false);
      navigate(item.path);
    }
  }, [navigate, recentSearches]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatResults, selectedIndex, handleSelect]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="font-bold underline">{part}</span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const hasResults = Object.keys(results).length > 0;
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-full max-w-[400px] items-center gap-2 rounded-md border border-input bg-muted/50 px-2 sm:px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Search className="h-4 w-4 shrink-0 opacity-50" />
        <span className="hidden sm:inline flex-1 text-left truncate">Search employees, production, payroll...</span>
        <span className="sm:hidden flex-1 text-left truncate">Search...</span>
        <kbd className="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">{isMac ? '⌘' : 'Ctrl'}</span>K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4 sm:px-0 bg-background/80 backdrop-blur-sm">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Input Header */}
            <div className="flex items-center border-b px-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground opacity-50" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex h-14 w-full rounded-md bg-transparent py-3 px-3 text-base text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search across ERP..."
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results Body */}
            <div className="max-h-[60vh] overflow-y-auto p-2 scroll-smooth">
              {isSearching ? (
                <div className="py-14 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Searching...
                </div>
              ) : !query ? (
                // Empty Query State (Recent & Quick Links)
                <div className="space-y-4 py-2">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="px-2 pb-2 text-xs font-semibold text-muted-foreground">Recent</div>
                      {recentSearches.map((item, index) => {
                        const isSelected = selectedIndex === index;
                        return (
                          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                          <div
                            key={`recent-${item.id}`}
                            className={`flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                            onClick={() => handleSelect(item)}
                          >
                            <item.icon className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : item.iconColor || 'text-muted-foreground'}`} />
                            <div className="flex-1 flex flex-col">
                              <span className="font-medium truncate">{item.title}</span>
                              {item.subtitle && <span className={`text-xs truncate ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{item.subtitle}</span>}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                              {item.moduleBadge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div>
                    <div className="px-2 pb-2 text-xs font-semibold text-muted-foreground">Quick Navigation</div>
                    {QUICK_LINKS.map((link, index) => {
                      const absoluteIndex = recentSearches.length + index;
                      const isSelected = selectedIndex === absoluteIndex;
                      return (
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                        <div
                          key={link.id}
                          className={`flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                          onClick={() => handleSelect(link)}
                        >
                          <link.icon className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          <span className="flex-1 font-medium">{link.label}</span>
                          <ArrowRight className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground opacity-50'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : !hasResults ? (
                // No Results State
                <div className="py-14 text-center text-sm">
                  <Command className="mx-auto h-8 w-8 text-muted-foreground opacity-20 mb-3" />
                  <p className="text-muted-foreground font-medium">No matching records found.</p>
                  <p className="text-muted-foreground/60 text-xs mt-1 mb-4">Try adjusting your search query.</p>
                  <button 
                    onClick={() => setQuery('')}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                // Search Results Grouped
                <div className="space-y-4">
                  {Object.entries(results).map(([moduleName, items]) => {
                    return (
                      <div key={moduleName}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex justify-between items-center">
                          {moduleName}
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-sm">{items.length}</span>
                        </div>
                        {items.map((item) => {
                          const flatIdx = flatResults.findIndex(r => 'id' in r && r.id === item.id);
                          const isSelected = selectedIndex === flatIdx;

                          return (
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                            <div
                              key={item.id}
                              className={`flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                              onClick={() => handleSelect(item)}
                            >
                              <item.icon className={`h-4 w-4 ${isSelected ? 'text-primary-foreground' : item.iconColor || 'text-muted-foreground'}`} />
                              <div className="flex-1 flex flex-col">
                                <span className="font-medium truncate">{highlightText(item.title, query)}</span>
                                {item.subtitle && <span className={`text-xs truncate ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{highlightText(item.subtitle, query)}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="hidden sm:flex items-center border-t px-4 py-2 text-xs text-muted-foreground/60 gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-sans text-[10px]">↵</kbd> to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-sans text-[10px]">↑↓</kbd> to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 font-sans text-[10px]">esc</kbd> to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
