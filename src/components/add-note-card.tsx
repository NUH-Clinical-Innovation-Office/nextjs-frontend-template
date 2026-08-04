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
 * Posts a note to common-service via the /api/notes proxy.
 *
 * The token lives in component state only - never localStorage, a cookie, or
 * the URL - so a page refresh clears it. Samples get copied, and a bearer
 * token persisted client-side is exactly the habit not worth propagating.
 */
export function AddNoteCard() {
  const [token, setToken] = useState('');
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<NoteResult | null>(null);

  const canSubmit = token.trim() !== '' && text.trim() !== '' && !pending;

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
        body: JSON.stringify({ token, text }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? 'Request failed');
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
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
