import { afterEach, describe, expect, it, mock } from 'bun:test';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddNoteCard } from './add-note-card';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

/** Stubs the /api/notes proxy call and returns the mock for call assertions. */
function mockProxy(body: unknown, status: number) {
  const fetchMock = mock(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('AddNoteCard', () => {
  it('masks the token input so it is not shoulder-readable or autofilled', () => {
    render(<AddNoteCard requiresToken />);

    const token = screen.getByLabelText('Auth-service token');
    expect(token).toHaveAttribute('type', 'password');
    expect(token).toHaveAttribute('autocomplete', 'off');
  });

  it('disables submit until both fields are filled', async () => {
    const user = userEvent.setup();
    render(<AddNoteCard requiresToken />);

    const submit = screen.getByRole('button', { name: 'Add note' });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('Auth-service token'), 'jwt-token');
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('Note'), 'buy milk');
    expect(submit).toBeEnabled();
  });

  it('renders the subject returned by common-service on success', async () => {
    mockProxy({ message: 'todo accepted', text: 'buy milk', subject: 'user-123' }, 200);
    const user = userEvent.setup();
    render(<AddNoteCard requiresToken />);

    await user.type(screen.getByLabelText('Auth-service token'), 'jwt-token');
    await user.type(screen.getByLabelText('Note'), 'buy milk');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    await waitFor(() => {
      expect(screen.getByText('user-123')).toBeInTheDocument();
    });
  });

  it('posts the token and text to the proxy route', async () => {
    const fetchMock = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ message: 'ok', text: 'hi', subject: 'sub' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    const user = userEvent.setup();
    render(<AddNoteCard requiresToken />);

    await user.type(screen.getByLabelText('Auth-service token'), 'jwt-token');
    await user.type(screen.getByLabelText('Note'), 'hi');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/notes');
    expect(JSON.parse(init.body as string)).toEqual({ token: 'jwt-token', text: 'hi' });
  });

  it('does not render a result when the token is rejected', async () => {
    mockProxy({ error: 'Token rejected by common service' }, 401);
    const user = userEvent.setup();
    render(<AddNoteCard requiresToken />);

    await user.type(screen.getByLabelText('Auth-service token'), 'bad-token');
    await user.type(screen.getByLabelText('Note'), 'buy milk');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add note' })).toBeEnabled();
    });
    expect(screen.queryByText('Subject')).not.toBeInTheDocument();
  });

  it('clears the note but keeps the token after a successful submit', async () => {
    mockProxy({ message: 'todo accepted', text: 'buy milk', subject: 'user-123' }, 200);
    const user = userEvent.setup();
    render(<AddNoteCard requiresToken />);

    await user.type(screen.getByLabelText('Auth-service token'), 'jwt-token');
    await user.type(screen.getByLabelText('Note'), 'buy milk');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Note')).toHaveValue('');
    });
    expect(screen.getByLabelText('Auth-service token')).toHaveValue('jwt-token');
  });
});

describe('AddNoteCard without a required token', () => {
  it('does not render the token field when the server holds an API key', () => {
    render(<AddNoteCard requiresToken={false} />);

    expect(screen.queryByLabelText('Auth-service token')).not.toBeInTheDocument();
  });

  it('enables submit on note text alone', async () => {
    const user = userEvent.setup();
    render(<AddNoteCard requiresToken={false} />);

    expect(screen.getByRole('button', { name: 'Add note' })).toBeDisabled();
    await user.type(screen.getByLabelText('Note'), 'buy milk');
    expect(screen.getByRole('button', { name: 'Add note' })).toBeEnabled();
  });

  it('omits the token from the proxy request body', async () => {
    const fetchMock = mockProxy(
      { message: 'todo accepted', text: 'buy milk', subject: 'user-123' },
      200,
    );
    const user = userEvent.setup();
    render(<AddNoteCard requiresToken={false} />);

    await user.type(screen.getByLabelText('Note'), 'buy milk');
    await user.click(screen.getByRole('button', { name: 'Add note' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ text: 'buy milk' });
  });
});
