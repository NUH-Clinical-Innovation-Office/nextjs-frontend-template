import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExternalLink } from './external-link';

describe('ExternalLink', () => {
  it('should render link with correct href', () => {
    render(<ExternalLink href="https://example.com">Visit Example</ExternalLink>);

    const link = screen.getByText('Visit Example');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('should have target="_blank" attribute', () => {
    render(<ExternalLink href="https://example.com">Visit Example</ExternalLink>);

    const link = screen.getByText('Visit Example');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should have rel="noopener noreferrer" for security', () => {
    render(<ExternalLink href="https://example.com">Visit Example</ExternalLink>);

    const link = screen.getByText('Visit Example');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should apply custom className', () => {
    render(
      <ExternalLink href="https://example.com" className="custom-class">
        Visit Example
      </ExternalLink>,
    );

    const link = screen.getByText('Visit Example');
    expect(link).toHaveClass('custom-class');
  });

  it('should forward additional props', () => {
    render(
      <ExternalLink href="https://example.com" data-testid="external-link">
        Visit Example
      </ExternalLink>,
    );

    const link = screen.getByTestId('external-link');
    expect(link).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    render(
      <ExternalLink href="https://example.com">
        <span>Click Here</span>
      </ExternalLink>,
    );

    expect(screen.getByText('Click Here')).toBeInTheDocument();
  });

  it('should work with different URL types', () => {
    const { rerender } = render(<ExternalLink href="https://github.com">GitHub</ExternalLink>);

    let link = screen.getByText('GitHub');
    expect(link).toHaveAttribute('href', 'https://github.com');

    rerender(<ExternalLink href="https://docs.example.com/guide">Documentation</ExternalLink>);

    link = screen.getByText('Documentation');
    expect(link).toHaveAttribute('href', 'https://docs.example.com/guide');
  });
});
