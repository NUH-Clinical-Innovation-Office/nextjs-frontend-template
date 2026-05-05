import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { SectionLabel } from '@/components/atoms/section-label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export function BasicComponentsShowcase() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold">Basic Components</h2>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <SectionLabel>Button Variants</SectionLabel>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Button Sizes</SectionLabel>
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <PlusIcon className="size-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Badge Variants</SectionLabel>
          <div className="flex flex-wrap gap-3 items-center">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge className="bg-info text-info-foreground">Info</Badge>
            <Badge className="bg-highlight text-highlight-foreground">Highlight</Badge>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Card</SectionLabel>
          <Card className="w-full sm:w-80">
            <CardHeader>
              <CardTitle>Patient Record</CardTitle>
              <CardDescription>Sarah Lim · Cardio Follow-up</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Last visit: 12 Apr 2026
            </CardContent>
            <CardContent className="pt-0">
              <Button size="sm">View details</Button>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Separator</SectionLabel>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-sm">Section A</span>
            <Separator className="w-32" />
            <span className="text-sm">Section B</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <SectionLabel>Skeleton</SectionLabel>
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
