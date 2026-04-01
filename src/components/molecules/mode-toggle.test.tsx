import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModeToggle } from './mode-toggle';

const mockSetTheme = vi.fn();
let mockResolvedTheme = 'light';

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}));

beforeEach(() => {
  mockSetTheme.mockClear();
  mockResolvedTheme = 'light';
});

describe('ModeToggle', () => {
  it('renders the toggle as a switch with aria-label', () => {
    render(<ModeToggle />);
    const toggle = screen.getByRole('switch', { name: /toggle theme/i });
    expect(toggle).toBeInTheDocument();
  });

  it('renders Sun and Moon icons', () => {
    render(<ModeToggle />);
    const sun = screen.getByTestId('sun-icon');
    const moon = screen.getByTestId('moon-icon');
    expect(sun).toBeInTheDocument();
    expect(moon).toBeInTheDocument();
  });

  it('has aria-checked=false when light mode is active', () => {
    render(<ModeToggle />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('has aria-checked=true when dark mode is active', () => {
    mockResolvedTheme = 'dark';
    render(<ModeToggle />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('clicking calls setTheme("dark") when light is active', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);
    await user.click(screen.getByRole('switch'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('clicking calls setTheme("light") when dark is active', async () => {
    mockResolvedTheme = 'dark';
    const user = userEvent.setup();
    render(<ModeToggle />);
    await user.click(screen.getByRole('switch'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('toggles theme when pressing Space key', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);
    const toggle = screen.getByRole('switch', { name: /toggle theme/i });
    toggle.focus();
    await user.keyboard(' ');
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('toggles theme when pressing Enter key', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);
    const toggle = screen.getByRole('switch', { name: /toggle theme/i });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
