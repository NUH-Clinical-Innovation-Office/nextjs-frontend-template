import { Button } from '@/components/atoms/button';
import { ExternalLink } from '@/components/atoms/external-link';

export function Footer() {
  return (
    <footer className="border-t border-border mt-8 px-8 py-6 flex gap-6 flex-wrap items-center justify-center text-muted-foreground text-sm">
      <Button asChild variant="link" size="sm">
        <ExternalLink href="https://www.nuh.com.sg">nuh.com.sg</ExternalLink>
      </Button>
      <Button asChild variant="link" size="sm">
        <ExternalLink href="https://ui.shadcn.com">Learn shadcn/ui</ExternalLink>
      </Button>
      <Button asChild variant="link" size="sm">
        <ExternalLink href="https://nextjs.org/learn">Learn Next.js</ExternalLink>
      </Button>
    </footer>
  );
}
