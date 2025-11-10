import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ModeToggle } from './mode-toggle';

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: 'light',
  }),
}));

describe('ModeToggle', () => {
  it('should render theme toggle button', () => {
    render(<ModeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('should open dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);

    // Check if menu items are visible
    expect(await screen.findByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('should call setTheme with "light" when Light is clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);

    const lightOption = await screen.findByText('Light');
    await user.click(lightOption);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('should call setTheme with "dark" when Dark is clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);

    const darkOption = await screen.findByText('Dark');
    await user.click(darkOption);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('should call setTheme with "system" when System is clicked', async () => {
    const user = userEvent.setup();
    render(<ModeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);

    const systemOption = await screen.findByText('System');
    await user.click(systemOption);

    expect(mockSetTheme).toHaveBeenCalledWith('system');
  });

  it('should display sun and moon icons', () => {
    render(<ModeToggle />);
    const button = screen.getByRole('button', { name: /toggle theme/i });

    // Check that SVG icons are present in the button
    const svgs = button.querySelectorAll('svg');
    expect(svgs).toHaveLength(2); // Sun and Moon icons
  });
});
