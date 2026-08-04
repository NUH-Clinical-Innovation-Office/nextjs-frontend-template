import { AddNoteCard } from '@/components/add-note-card';

export default function Home() {
  return (
    <main className="font-sans min-h-screen bg-background text-foreground flex items-center justify-center p-8">
      <AddNoteCard />
    </main>
  );
}
