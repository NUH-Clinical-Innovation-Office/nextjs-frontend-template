import { screen } from '@testing-library/dom';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './page';

describe('Home', () => {
  it('should render the page', () => {
    render(<Home />);
    expect(screen.getByText(/National University Hospital/i)).toBeInTheDocument();
  });

  it('should render NUH logo', () => {
    render(<Home />);
    const logos = screen.getAllByAltText('NUH - National University Hospital');
    expect(logos).toHaveLength(2);
  });

  it('should render visit NUH button', () => {
    render(<Home />);
    const visitLink = screen.getByRole('link', { name: /Visit NUH/i });
    expect(visitLink).toBeInTheDocument();
    expect(visitLink).toHaveAttribute('href', 'https://www.nuh.com.sg');
  });

  it('should render docs link', () => {
    render(<Home />);
    const docsLink = screen.getByRole('link', { name: /Read the Next.js docs/i });
    expect(docsLink).toBeInTheDocument();
    expect(docsLink).toHaveAttribute('href', 'https://nextjs.org/docs');
  });

  it('should render footer links', () => {
    render(<Home />);
    expect(screen.getByText('Learn Next.js')).toBeInTheDocument();
    expect(screen.getByText('shadcn/ui')).toBeInTheDocument();
    expect(screen.getByText(/nuh\.com\.sg/i)).toBeInTheDocument();
  });
});
