'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, LogRocket, etc.)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription>
            We apologize for the inconvenience. The error has been logged and our team has been
            notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.digest && (
            <p className="font-mono text-sm text-muted-foreground">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-2">
            <Button onClick={reset}>Try again</Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Go home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
