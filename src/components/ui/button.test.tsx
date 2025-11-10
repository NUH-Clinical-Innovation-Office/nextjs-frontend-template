import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render with default variant', () => {
    render(<Button data-testid="button">Default</Button>);
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply destructive variant', () => {
    render(
      <Button variant="destructive" data-testid="button">
        Destructive
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply outline variant', () => {
    render(
      <Button variant="outline" data-testid="button">
        Outline
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply secondary variant', () => {
    render(
      <Button variant="secondary" data-testid="button">
        Secondary
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply ghost variant', () => {
    render(
      <Button variant="ghost" data-testid="button">
        Ghost
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply link variant', () => {
    render(
      <Button variant="link" data-testid="button">
        Link
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply small size', () => {
    render(
      <Button size="sm" data-testid="button">
        Small
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply large size', () => {
    render(
      <Button size="lg" data-testid="button">
        Large
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply icon size', () => {
    render(
      <Button size="icon" data-testid="button">
        <svg data-testid="icon" />
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should apply icon-sm size', () => {
    render(
      <Button size="icon-sm" data-testid="button">
        <svg data-testid="icon" />
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply icon-lg size', () => {
    render(
      <Button size="icon-lg" data-testid="button">
        <svg data-testid="icon" />
      </Button>,
    );
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <Button className="custom-class" data-testid="button">
        Custom
      </Button>,
    );
    expect(screen.getByTestId('button')).toHaveClass('custom-class');
  });

  it('should be disabled when disabled prop is true', () => {
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

  it('should render as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByText('Link Button');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should render with icon and text', () => {
    render(
      <Button data-testid="button">
        <svg data-testid="icon" />
        With Icon
      </Button>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('should forward additional props', () => {
    render(
      <Button data-testid="button" aria-label="submit button" type="submit">
        Submit
      </Button>,
    );
    const button = screen.getByTestId('button');
    expect(button).toHaveAttribute('aria-label', 'submit button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should have correct data-slot attribute', () => {
    render(<Button data-testid="button">Button</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-slot', 'button');
  });
});
