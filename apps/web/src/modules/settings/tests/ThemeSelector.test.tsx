import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSelector } from '../components/ThemeSelector';
import * as useThemeHook from '@/hooks/useTheme';

vi.mock('@/hooks/useTheme');

describe('ThemeSelector Component', () => {
  it('renders all theme options', () => {
    vi.spyOn(useThemeHook, 'useTheme').mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });

    render(<ThemeSelector />);
    
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('calls setTheme when an option is clicked', () => {
    const mockSetTheme = vi.fn();
    vi.spyOn(useThemeHook, 'useTheme').mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    render(<ThemeSelector />);
    
    const darkButton = screen.getByText('Dark').closest('button');
    expect(darkButton).not.toBeNull();
    
    fireEvent.click(darkButton!);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
