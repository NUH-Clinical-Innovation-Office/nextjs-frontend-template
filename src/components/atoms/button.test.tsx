import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonVariants } from './button';

describe('Button atom', () => {
  it('should always have cursor-pointer class', () => {
    render(<Button data-testid="btn">Click</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('cursor-pointer');
  });

  it('should have cursor-pointer even when custom className is provided', () => {
    render(
      <Button data-testid="btn" className="my-custom-class">
        Click
      </Button>,
    );
    const btn = screen.getByTestId('btn');
    expect(btn).toHaveClass('cursor-pointer');
    expect(btn).toHaveClass('my-custom-class');
  });

  it('should forward variant prop', () => {
    render(
      <Button data-testid="btn" variant="destructive">
        Delete
      </Button>,
    );
    expect(screen.getByTestId('btn')).toHaveClass('bg-destructive');
  });

  it('should forward size prop', () => {
    render(
      <Button data-testid="btn" size="lg">
        Large
      </Button>,
    );
    expect(screen.getByTestId('btn')).toHaveClass('h-10');
  });

  it('should forward disabled prop', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('should not trigger click when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    );
    await user.click(screen.getByText('Disabled'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should forward click handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByText('Link Button');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should export buttonVariants', () => {
    expect(buttonVariants).toBeDefined();
    expect(typeof buttonVariants).toBe('function');
  });
});
