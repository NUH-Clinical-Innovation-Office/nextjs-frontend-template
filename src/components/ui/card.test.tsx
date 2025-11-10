import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

describe('Card', () => {
  it('should render card with content', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText('Content');
    expect(card).toHaveClass('custom-class');
  });

  it('should have correct data-slot attribute', () => {
    render(<Card data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card');
  });
});

describe('CardHeader', () => {
  it('should render header content', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardHeader className="custom-header">Header</CardHeader>);
    expect(screen.getByText('Header')).toHaveClass('custom-header');
  });

  it('should have correct data-slot attribute', () => {
    render(<CardHeader data-testid="header">Header</CardHeader>);
    expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'card-header');
  });
});

describe('CardTitle', () => {
  it('should render title content', () => {
    render(<CardTitle>Title text</CardTitle>);
    expect(screen.getByText('Title text')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardTitle className="custom-title">Title</CardTitle>);
    expect(screen.getByText('Title')).toHaveClass('custom-title');
  });

  it('should have correct data-slot attribute', () => {
    render(<CardTitle data-testid="title">Title</CardTitle>);
    expect(screen.getByTestId('title')).toHaveAttribute('data-slot', 'card-title');
  });
});

describe('CardDescription', () => {
  it('should render description content', () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardDescription className="custom-desc">Description</CardDescription>);
    expect(screen.getByText('Description')).toHaveClass('custom-desc');
  });

  it('should have correct data-slot attribute', () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>);
    expect(screen.getByTestId('desc')).toHaveAttribute('data-slot', 'card-description');
  });
});

describe('CardAction', () => {
  it('should render action content', () => {
    render(<CardAction>Action button</CardAction>);
    expect(screen.getByText('Action button')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardAction className="custom-action">Action</CardAction>);
    expect(screen.getByText('Action')).toHaveClass('custom-action');
  });

  it('should have correct data-slot attribute', () => {
    render(<CardAction data-testid="action">Action</CardAction>);
    expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'card-action');
  });
});

describe('CardContent', () => {
  it('should render content', () => {
    render(<CardContent>Main content</CardContent>);
    expect(screen.getByText('Main content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardContent className="custom-content">Content</CardContent>);
    expect(screen.getByText('Content')).toHaveClass('custom-content');
  });

  it('should have correct data-slot attribute', () => {
    render(<CardContent data-testid="content">Content</CardContent>);
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'card-content');
  });
});

describe('CardFooter', () => {
  it('should render footer content', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<CardFooter className="custom-footer">Footer</CardFooter>);
    expect(screen.getByText('Footer')).toHaveClass('custom-footer');
  });

  it('should have correct data-slot attribute', () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>);
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'card-footer');
  });
});

describe('Card composition', () => {
  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>Action</CardAction>
        </CardHeader>
        <CardContent>Content here</CardContent>
        <CardFooter>Footer here</CardFooter>
      </Card>,
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Content here')).toBeInTheDocument();
    expect(screen.getByText('Footer here')).toBeInTheDocument();
  });
});
