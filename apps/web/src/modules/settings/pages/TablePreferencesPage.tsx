import { TABLE_REGISTRY } from '@/config/table-registry';
import { TableConfigCard } from '../components/TableConfigCard';

export function TablePreferencesPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-base font-semibold">Table Preferences</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the visible columns and display order for every table in the application.
          Changes are applied instantly and saved to your browser.
        </p>
      </div>

      <div className="space-y-3">
        {TABLE_REGISTRY.map((entry) => (
          <TableConfigCard key={entry.storageKey} entry={entry} />
        ))}
      </div>
    </div>
  );
}
