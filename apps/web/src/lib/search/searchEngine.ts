import type { LucideIcon } from 'lucide-react';

export interface CommandAction {
  type: 'navigate' | 'action';
  path?: string;
  state?: Record<string, unknown>;
  onExecute?: () => void;
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  moduleBadge: string;
  icon: LucideIcon;
  iconColor?: string;
  action: CommandAction;
  score?: number; // Optional exact-match scoring
}

export interface SearchProvider {
  moduleId: string;
  search: (query: string) => Promise<GlobalSearchResult[]> | GlobalSearchResult[];
}

class GlobalSearchEngine {
  private providers: Map<string, SearchProvider> = new Map();

  registerProvider(provider: SearchProvider) {
    this.providers.set(provider.moduleId, provider);
  }

  unregisterProvider(moduleId: string) {
    this.providers.delete(moduleId);
  }

  async searchAll(query: string): Promise<Record<string, GlobalSearchResult[]>> {
    if (!query || query.trim().length < 2) return {};

    const normalizedQuery = query.toLowerCase().trim();
    const resultsByModule: Record<string, GlobalSearchResult[]> = {};

    const promises = Array.from(this.providers.values()).map(async (provider) => {
      try {
        const results = await provider.search(normalizedQuery);
        if (results.length > 0) {
          // Sort results by score (highest first) if available
          const sorted = [...results].sort((a, b) => (b.score || 0) - (a.score || 0));
          // Limit to 5 results per module
          resultsByModule[provider.moduleId] = sorted.slice(0, 5);
        }
      } catch (error) {
        console.error(`SearchProvider [${provider.moduleId}] error:`, error);
      }
    });

    await Promise.all(promises);
    return resultsByModule;
  }
}

export const searchEngine = new GlobalSearchEngine();
