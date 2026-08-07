'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type NoteResult = {
  message: string;
  text: string;
  subject: string;
};

/**
 * Picks the message to show for a failed proxy call.
 *
 * A 429 carries Retry-After from common-service's rate limiter, and surfacing
 * the wait turns a dead end into something the user can act on.
 */
function errorMessage(response: Response, data: { error?: string }): string {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    if (retryAfter) {
      return `Rate limited. Try again in ${retryAfter}s.`;
    }
    return data.error ?? 'Rate limited';
  }
  return data.error ?? 'Request failed';
}

type AddNoteCardProps = {
  /**
   * Whether the browser must supply a bearer token. False when the server has
   * its own API key, in which case no credential is collected here at all.
   */
  requiresToken: boolean;
};

/**
 * Posts a note to common-service via the /api/notes proxy.
 *
 * When the server holds an API key it authenticates as a Consumer Backend and
 * this form collects no credential. Otherwise it falls back to asking for a
 * bearer token, which lives in component state only - never localStorage, a
 * cookie, or the URL - so a page refresh clears it. Samples get copied, and a
 * bearer token persisted client-side is exactly the habit not worth
 * propagating.
 */
export function AddNoteCard({ requiresToken }: AddNoteCardProps) {
  const [token, setToken] = useState('');
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<NoteResult | null>(null);

  const canSubmit = (!requiresToken || token.trim() !== '') && text.trim() !== '' && !pending;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setPending(true);
    setResult(null);

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requiresToken ? { token, text } : { text }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(errorMessage(response, data));
        return;
      }

      setResult(data);
      setText('');
      toast.success('Note accepted by common service');
    } catch {
      toast.error('Network error');
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Add a note</CardTitle>
        <CardDescription>
          Sends a note to common-service over the cluster-internal network.
          {requiresToken
            ? ' No API key is configured, so a bearer token is required.'
            : ' Authenticated server-side with this app’s API key.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {requiresToken ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="token">Auth-service token</Label>
              <Input
                id="token"
                type="password"
                autoComplete="off"
                spellCheck={false}
                placeholder="Paste your JWT"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="text">Note</Label>
            <Input
              id="text"
              maxLength={500}
              placeholder="Something worth remembering"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={!canSubmit}>
            {pending ? 'Sending…' : 'Add note'}
          </Button>
        </form>

        {result ? (
          <dl className="mt-6 flex flex-col gap-1 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Message</dt>
              <dd>{result.message}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Text</dt>
              <dd>{result.text}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Subject</dt>
              <dd className="font-mono">{result.subject}</dd>
            </div>
          </dl>
        ) : null}
      </CardContent>
    </Card>
  );
}
