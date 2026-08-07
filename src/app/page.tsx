import { AddNoteCard } from '@/components/add-note-card';
import { env } from '@/lib/env';

export default function Home() {
  // Server Component, so reading the server-only key here is safe: only the
  // boolean crosses to the client, never the credential itself.
  const requiresToken = !env.COMMON_SERVICE_API_KEY;

  return (
    <main className="font-sans min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <AddNoteCard requiresToken={requiresToken} />
    </main>
  );
}
