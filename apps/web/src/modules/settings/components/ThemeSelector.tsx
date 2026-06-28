import { useTheme } from '@/hooks/useTheme';
import { SectionCard } from '@/components';
import type { ThemeMode } from '@frms/shared';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/utils/cn';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const options: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-5 w-5 mb-2" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-5 w-5 mb-2" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-5 w-5 mb-2" /> },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the application. Automatically switches between day and night themes.
        </p>
      </div>

      <SectionCard>
        <div className="grid grid-cols-3 gap-4">
          {options.map((option) => {
            const isSelected = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 p-4 transition-all hover:bg-accent hover:text-accent-foreground",
                  isSelected
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-muted bg-transparent text-muted-foreground"
                )}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
