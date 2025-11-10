import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('should render badge with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should apply default variant', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveAttribute('data-slot', 'badge');
  });

  it('should apply secondary variant', () => {
    render(
      <Badge variant="secondary" data-testid="badge">
        Secondary
      </Badge>,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('should apply destructive variant', () => {
    render(
      <Badge variant="destructive" data-testid="badge">
        Destructive
      </Badge>,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('should apply outline variant', () => {
    render(
      <Badge variant="outline" data-testid="badge">
        Outline
      </Badge>,
    );
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <Badge className="custom-class" data-testid="badge">
        Custom
      </Badge>,
    );
    expect(screen.getByTestId('badge')).toHaveClass('custom-class');
  });

  it('should render as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>,
    );
    const link = screen.getByText('Link Badge');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should render with icon', () => {
    render(
      <Badge data-testid="badge">
        <svg data-testid="icon" />
        With Icon
      </Badge>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('should forward additional props', () => {
    render(
      <Badge data-testid="badge" aria-label="status badge">
        Status
      </Badge>,
    );
    expect(screen.getByTestId('badge')).toHaveAttribute('aria-label', 'status badge');
  });
});
