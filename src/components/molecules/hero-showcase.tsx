import { Button } from '@/components/atoms/button';
import { ExternalLink } from '@/components/atoms/external-link';
import { Badge } from '@/components/ui/badge';

export function HeroShowcase() {
  return (
    <section className="flex flex-col gap-6">
      <Badge variant="outline" className="w-fit">
        Frontend Template
      </Badge>
      <h1 className="text-4xl font-bold tracking-tight">National University Hospital</h1>
      <p className="text-muted-foreground text-lg max-w-2xl">
        A Next.js frontend template styled with shadcn/ui and the NUH brand identity — ready for
        building internal tools and patient-facing applications.
      </p>
      <div className="flex gap-3 flex-wrap">
        <Button asChild size="lg">
          <ExternalLink href="https://www.nuh.com.sg">Visit NUH</ExternalLink>
        </Button>
        <Button asChild variant="outline" size="lg">
          <ExternalLink href="https://ui.shadcn.com">Learn shadcn</ExternalLink>
        </Button>
        <Button asChild variant="outline" size="lg">
          <ExternalLink href="https://nextjs.org/docs">Read the Next.js docs</ExternalLink>
        </Button>
      </div>
    </section>
  );
}
