import { PageHeader } from '@/components';
import { CompanySettingsForm } from '../components/CompanySettingsForm';
import { ThemeSelector } from '../components/ThemeSelector';
import * as Tabs from '@radix-ui/react-tabs';
import { cn } from '@/utils/cn';

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        description="Manage application preferences and company configuration" 
      />

      <Tabs.Root defaultValue="company" className="flex flex-col space-y-6">
        <Tabs.List className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-fit">
          <Tabs.Trigger 
            value="company"
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            )}
          >
            Company
          </Tabs.Trigger>
          <Tabs.Trigger 
            value="theme"
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            )}
          >
            Appearance
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="company" className="mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <CompanySettingsForm />
        </Tabs.Content>

        <Tabs.Content value="theme" className="mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <ThemeSelector />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
