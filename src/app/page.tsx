import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from '@/components/atoms/external-link';
import { ModeToggle } from '@/components/molecules/mode-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const colorPalette = [
  {
    name: 'Dark Blue',
    hex: '#002f6c',
    description: 'Primary — main brand color',
    bg: 'bg-primary',
    text: 'text-primary-foreground',
  },
  {
    name: 'Light Blue',
    hex: '#178fd7',
    description: 'Info — highlights & links',
    bg: 'bg-info',
    text: 'text-info-foreground',
  },
  {
    name: 'Orange',
    hex: '#e57200',
    description: 'Highlight — CTAs & badges',
    bg: 'bg-highlight',
    text: 'text-highlight-foreground',
  },
  {
    name: 'Red',
    hex: '#e4002b',
    description: 'Destructive — alerts & warnings',
    bg: 'bg-destructive',
    text: 'text-destructive-foreground',
  },
];

export default function Home() {
  return (
    <div className="font-sans min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-8 py-4 flex items-center justify-between">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/nuh-logo.png"
            alt="NUH - National University Hospital"
            width={160}
            height={40}
            style={{ height: 'auto' }}
            className="dark:hidden"
            priority
          />
          <Image
            src="/nuh-logo-dark.png"
            alt="NUH - National University Hospital"
            width={160}
            height={40}
            style={{ height: 'auto' }}
            className="hidden dark:block"
            priority
          />
        </Link>
        <ModeToggle />
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12 flex flex-col gap-12">
        {/* Hero */}
        <section className="flex flex-col gap-4">
          <Badge variant="outline" className="w-fit">
            Frontend Template
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">National University Hospital</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            A Next.js frontend template styled with the NUH brand identity — ready for building
            internal tools and patient-facing applications.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button asChild size="lg">
              <ExternalLink href="https://www.nuh.com.sg">Visit NUH</ExternalLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <ExternalLink href="https://nextjs.org/docs">Read the Next.js docs</ExternalLink>
            </Button>
          </div>
        </section>

        {/* Color Palette */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Brand Colour Palette</h2>
          <p className="text-muted-foreground">
            The four NUHS brand colours, applied consistently across light and dark modes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {colorPalette.map((color) => (
              <Card key={color.hex} className="overflow-hidden py-0 gap-0">
                <CardHeader className={`${color.bg} ${color.text} h-25 flex items-end p-3`}>
                  <span className="font-mono text-xs font-medium">{color.hex}</span>
                </CardHeader>
                <CardContent className="p-3">
                  <CardTitle className="text-sm font-semibold">{color.name}</CardTitle>
                  <CardDescription className="text-xs">{color.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Component Showcase */}
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold">Component Showcase</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Primary and secondary actions</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Labels and status indicators</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 items-center">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-info text-info-foreground hover:bg-info/80">Info</Badge>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>Foreground and muted text</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-foreground font-semibold">Foreground — primary text</p>
                <p className="text-muted-foreground">Muted foreground — supporting text</p>
                <p className="text-highlight font-medium">Highlight — orange CTAs</p>
                <p className="text-info font-medium">Info — light blue links</p>
                <p className="text-primary font-medium">Primary colour text</p>
              </CardContent>
            </Card>

            {/* Surfaces */}
            <Card>
              <CardHeader>
                <CardTitle>Surfaces</CardTitle>
                <CardDescription>Background and card layers</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="bg-background border border-border rounded-md p-3 text-sm">
                  Background
                </div>
                <div className="bg-card border border-border rounded-md p-3 text-sm">Card</div>
                <div className="bg-muted rounded-md p-3 text-sm text-muted-foreground">Muted</div>
                <div className="bg-secondary rounded-md p-3 text-sm text-secondary-foreground">
                  Secondary
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-8 px-8 py-6 flex gap-6 flex-wrap items-center justify-center text-muted-foreground text-sm">
        <Button asChild variant="link" size="sm">
          <ExternalLink href="https://nextjs.org/learn">Learn Next.js</ExternalLink>
        </Button>
        <Button asChild variant="link" size="sm">
          <ExternalLink href="https://ui.shadcn.com">shadcn/ui</ExternalLink>
        </Button>
        <Button asChild variant="link" size="sm">
          <ExternalLink href="https://www.nuh.com.sg">nuh.com.sg →</ExternalLink>
        </Button>
      </footer>
    </div>
  );
}
